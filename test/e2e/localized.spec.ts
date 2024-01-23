import {
  fixture,
  html,
  expect
} from '@open-wc/testing'
import {customElement, property, query} from 'lit/decorators.js'
import React from 'react'

import {BkComponent} from '../../src/base/bk-component'
import {Locale} from '../../src/base/localized-components'
import type {LocalizedText} from '../../src/utils/i18n'
import {localize} from '../../src/utils/i18n'

type ComponentLabels = {
  name: string
  body: {
    text: string
    badge: string
  },
  range: [string, string]
}

@customElement('localized-component')
class LocalComponent extends BkComponent<Record<string, any>, ComponentLabels> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  @query('#name') name!: HTMLDivElement
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  @query('#text') text!: HTMLDivElement
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  @query('#badge') badge!: HTMLDivElement
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  @query('#range') range!: HTMLDivElement
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  @query('#button') button!: HTMLDivElement
  
  @property({attribute: 'button-label'}) buttonlabel?: LocalizedText

  constructor() {
    super(
      function (props: Record<string, any>) { 
        return React.createElement(
          'div', {id: 'parent', ...props},
          [
            React.createElement('div', {id: 'name', key: 'name', ...props}, props.locale?.name ?? ''),
            React.createElement('div', {id: 'text', key: 'text', ...props}, props.locale?.body.text ?? ''),
            React.createElement('div', {id: 'badge', key: 'badge', ...props}, props.locale?.body.badge ?? ''),
            React.createElement('div', {id: 'range', key: 'range', ...props}, `${props.locale?.range?.[0] ?? ''} ${props.locale?.range?.[1] ?? ''}`),
            React.createElement('button', {id: 'button', key: 'button', ...props}, props.buttonlabel ?? ''),
            
          ]
        )
      },
      function (this: LocalComponent): Record<string, any> {
        return {
          locale: this.locale,
          buttonlabel: localize(this.buttonlabel)
        }
      }
    )
  }
  
  render () {
    html`<div id='container'></div>`
  }
}

@customElement('defaulted-localized-component')
class WithDefaultLocalComponent extends LocalComponent {
  defaultLocale: Locale<ComponentLabels> = {
    en: {
      name: 'default-name',
      body: {
        text: 'default-text',
        badge: 'default-badge'
      },
      range: ['default-range-0', 'default-range-1']
    }
  }
}

describe('localization tests', () => {
  it('should apply custom locale', async () => {
    const el = await fixture(html`
      <localized-component
        .customLocale=${
          {
            en: {
              name: 'custom-name',
              body: {
                text: 'custom-text',
                badge: 'custom-badge'
              },
              range: ['range-0', 'range-1']
            }
          }
        }
        .buttonlabel=${{en: 'Button', it: 'Bottone'}}
      ></localized-component>
    `) as LocalComponent

    expect(el.name).to.be.to.have.text('custom-name')
    expect(el.text).to.be.to.have.text('custom-text')
    expect(el.badge).to.be.to.have.text('custom-badge')
    expect(el.range).to.be.to.have.text('range-0 range-1')
    expect(el.button).to.be.to.have.text('Button')
  })

  it('should apply no locale', async () => {
    const el = await fixture(html`
      <localized-component></localized-component>
    `) as LocalComponent

    expect(el.name).to.be.to.have.text('')
    expect(el.text).to.be.to.have.text('')
    expect(el.badge).to.be.to.have.text('')
    expect(el.range).to.be.to.have.text(' ')
    expect(el.button).to.be.to.have.text('')
  })

  it('should apply solved locale', async () => {
    const el = await fixture(html`<localized-component
      .locale=${
        {
          name: 'custom-name',
          body: {
            text: 'custom-text',
            badge: 'custom-badge'
          },
          range: ['custom-range-0', 'custom-range-1'] as [string, string]
        } as ComponentLabels
      }
      .buttonlabel=${'Button'}
      ></localized-component>`
    ) as WithDefaultLocalComponent
    
    expect(el.name).to.be.to.have.text('custom-name')
    expect(el.text).to.be.to.have.text('custom-text')
    expect(el.badge).to.be.to.have.text('custom-badge')
    expect(el.range).to.be.to.have.text('custom-range-0 custom-range-1')
    expect(el.button).to.be.to.have.text('Button')
  })

  it('should use default locale', async () => {
    const el = await fixture(html`
      <defaulted-localized-component></defaulted-localized-component>
    `) as WithDefaultLocalComponent

    expect(el.name).to.be.to.have.text('default-name')
    expect(el.text).to.be.to.have.text('default-text')
    expect(el.badge).to.be.to.have.text('default-badge')
    expect(el.range).to.be.to.have.text('default-range-0 default-range-1')
    expect(el.button).to.be.to.have.text('')
  })

  it('should use default locale (fallbacks to english)', async () => {
    const {navigator} = window
    Object.defineProperty(window, 'navigator', {writable: true, value: {language: 'it'}})

    const el = await fixture(html`
      <defaulted-localized-component .buttonlabel=${{en: 'Button'}}></defaulted-localized-component>
    `) as WithDefaultLocalComponent

    expect(el.name).to.be.to.have.text('default-name')
    expect(el.text).to.be.to.have.text('default-text')
    expect(el.badge).to.be.to.have.text('default-badge')
    expect(el.range).to.be.to.have.text('default-range-0 default-range-1')
    expect(el.button).to.be.to.have.text('Button')
    
    Object.defineProperty(window, 'navigator', {writable: true, value: navigator})
  })

  it('should apply custom locale to override default', async () => {
    const el = await fixture(html`
      <defaulted-localized-component
        .customLocale=${
          {
            en: {
              name: 'custom-name',
              body: {
                badge: 'custom-badge'
              },
              range: ['range-0', 'range-1']
            },
            it: {
              name: 'name-it',
              body: {
                text: 'text-it',
                badge: 'badge-it'
              },
              range: ['range-0-it', 'range-1-it']
            }
          }
        }
      ></defaulted-localized-component>
    `) as WithDefaultLocalComponent

    expect(el.name).to.be.to.have.text('custom-name')
    expect(el.text).to.be.to.have.text('default-text')
    expect(el.badge).to.be.to.have.text('custom-badge')
    expect(el.range).to.be.to.have.text('range-0 range-1')
    expect(el.button).to.be.to.have.text('')
  })

  it('should apply custom locale to override default (it)', async () => {
    const {navigator} = window
    Object.defineProperty(window, 'navigator', {writable: true, value: {language: 'it'}})

    const el = await fixture(html`
      <defaulted-localized-component
        .customLocale=${
          {
            it: {
              name: 'name-it',
              body: {
                text: 'text-it',
                badge: 'badge-it'
              },
              range: ['range-0-it', 'range-1-it']
            }
          }
        }
        .buttonlabel=${{en: 'Button', it: 'Bottone'}}
      ></defaulted-localized-component>
    `) as WithDefaultLocalComponent

    expect(el.name).to.be.to.have.text('name-it')
    expect(el.text).to.be.to.have.text('text-it')
    expect(el.badge).to.be.to.have.text('badge-it')
    expect(el.range).to.be.to.have.text('range-0-it range-1-it')
    expect(el.button).to.be.to.have.text('Bottone')

    Object.defineProperty(window, 'navigator', {writable: true, value: navigator})
  })

  it('should apply custom locale to override default (it-IT)', async () => {
    const {navigator} = window
    Object.defineProperty(window, 'navigator', {writable: true, value: {language: 'it-IT'}})

    const el = await fixture(html`
      <defaulted-localized-component
        .customLocale=${
          {
            it: {
              name: 'name-it',
              body: {
                text: 'text-it',
                badge: 'badge-it'
              },
              range: ['range-0-it', 'range-1-it']
            }
          }
        }
        .buttonlabel=${{en: 'Button', it: 'Bottone'}}
      ></defaulted-localized-component>
    `) as WithDefaultLocalComponent

    expect(el.name).to.be.to.have.text('name-it')
    expect(el.text).to.be.to.have.text('text-it')
    expect(el.badge).to.be.to.have.text('badge-it')
    expect(el.range).to.be.to.have.text('range-0-it range-1-it')
    expect(el.button).to.be.to.have.text('Bottone')

    Object.defineProperty(window, 'navigator', {writable: true, value: navigator})
  })

  it('should apply custom locale to override default (partial locale)', async () => {
    const el = await fixture(html`
      <defaulted-localized-component
        .customLocale=${
          {
            en: {name: 'custom-name'}
          }
        }
      ></defaulted-localized-component>
    `) as WithDefaultLocalComponent

    expect(el.name).to.be.to.have.text('custom-name')
    expect(el.text).to.be.to.have.text('default-text')
    expect(el.badge).to.be.to.have.text('default-badge')
    expect(el.range).to.be.to.have.text('default-range-0 default-range-1')
    expect(el.button).to.be.to.have.text('')
  })

  it('should apply custom locale to override default with non-stirng primitive types', async () => {
    const el = await fixture(html`
      <defaulted-localized-component
        .customLocale=${
          {
            en: {
              name: 0,
              body: {
                badge: 'custom-badge'
              }
            }
          }
        }
      ></defaulted-localized-component>
    `) as WithDefaultLocalComponent

    expect(el.name).to.be.to.have.text('0')
    expect(el.text).to.be.to.have.text('default-text')
    expect(el.badge).to.be.to.have.text('custom-badge')
    expect(el.range).to.be.to.have.text('default-range-0 default-range-1')
    expect(el.button).to.be.to.have.text('')
  })

  it('should apply solved locale to override default', async () => {
    const el = await fixture(html`<defaulted-localized-component
      .locale=${
        {
          name: 'custom-name',
          body: {
            text: 'custom-text',
            badge: 'custom-badge'
          },
          range: ['custom-range-0', 'custom-range-1'] as [string, string]
        } as ComponentLabels
      }></defaulted-localized-component>`
    ) as WithDefaultLocalComponent
    
    expect(el.name).to.be.to.have.text('custom-name')
    expect(el.text).to.be.to.have.text('custom-text')
    expect(el.badge).to.be.to.have.text('custom-badge')
    expect(el.range).to.be.to.have.text('custom-range-0 custom-range-1')
    expect(el.button).to.be.to.have.text('')
  })
})
