import {fixture, html, expect} from '@open-wc/testing'
import {customElement, property, query} from 'lit/decorators.js'
import React from 'react'

import {BkComponent} from '../../src/base/bk-component'
import type {LocalizedText} from '../../src/utils/i18n'
import {localize} from '../../src/utils/i18n'

type ComponentLabels = {
  name: string
  body: {
    text: string
    badge: string
  }
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
  protected defaultLocale: ComponentLabels = {
    name: 'default-name',
    body: {
      text: 'default-text',
      badge: 'default-badge'
    }
  }
}

describe('localization tests', () => {
  it('should apply custom locale', async () => {
    const el = await fixture(html`
      <localized-component
        .customLocale=${
          {
            name: {en: 'custom-name'},
            body: {
              text: {en: 'custom-text'},
              badge: 'custom-badge',
            }
          }
        }
        .buttonlabel=${{en: 'Button', it: 'Bottone'}}
      ></localized-component>
    `) as LocalComponent

    expect(el.name).to.have.text('custom-name')
    expect(el.text).to.have.text('custom-text')
    expect(el.badge).to.have.text('custom-badge')
    expect(el.button).to.have.text('Button')
  })

  it('should apply no locale', async () => {
    const el = await fixture(html`<localized-component></localized-component>`) as LocalComponent

    expect(el.name).to.have.text('')
    expect(el.text).to.have.text('')
    expect(el.badge).to.have.text('')
    expect(el.button).to.have.text('')
  })

  it('should apply solved locale', async () => {
    const el = await fixture(html`<localized-component
      .locale=${
        {
          name: 'custom-name',
          body: {
            text: 'custom-text',
            badge: 'custom-badge'
          }
        }
      }
      .buttonlabel=${'Button'}
      ></localized-component>`
    ) as WithDefaultLocalComponent
    
    expect(el.name).to.have.text('custom-name')
    expect(el.text).to.have.text('custom-text')
    expect(el.badge).to.have.text('custom-badge')
    expect(el.button).to.have.text('Button')
  })

  it('should use default locale', async () => {
    const el = await fixture(html`
      <defaulted-localized-component></defaulted-localized-component>
    `) as WithDefaultLocalComponent

    expect(el.name).to.have.text('default-name')
    expect(el.text).to.have.text('default-text')
    expect(el.badge).to.have.text('default-badge')
    expect(el.button).to.have.text('')
  })

  it('should use default locale (fallbacks to english)', async () => {
    const {navigator} = window
    Object.defineProperty(window, 'navigator', {writable: true, value: {language: 'it'}})

    const el = await fixture(html`
      <defaulted-localized-component .buttonlabel=${{en: 'Button'}}></defaulted-localized-component>
    `) as WithDefaultLocalComponent

    expect(el.name).to.have.text('default-name')
    expect(el.text).to.have.text('default-text')
    expect(el.badge).to.have.text('default-badge')
    expect(el.button).to.have.text('Button')
    
    Object.defineProperty(window, 'navigator', {writable: true, value: navigator})
  })

  it('should apply custom locale to partially override default (fallbacks to english)', async () => {
    const {navigator} = window
    Object.defineProperty(window, 'navigator', {writable: true, value: {language: 'it'}})

    const el = await fixture(html`
      <defaulted-localized-component
        .customLocale=${{name: {en: 'custom-name'}}}
        .buttonlabel=${{en: 'Button'}}
      ></defaulted-localized-component>
    `) as WithDefaultLocalComponent

    expect(el.name).to.have.text('custom-name')
    expect(el.text).to.have.text('default-text')
    expect(el.badge).to.have.text('default-badge')
    expect(el.button).to.have.text('Button')
    
    Object.defineProperty(window, 'navigator', {writable: true, value: navigator})
  })

  it('should apply custom locale to override default', async () => {
    const el = await fixture(html`
      <defaulted-localized-component
        .customLocale=${
          {
            name: {en: 'custom-name', it: 'custom-it'},
            body: {
              badge: {en: 'custom-badge', it: 'custom-it'},
            }
          }
        }
      ></defaulted-localized-component>
    `) as WithDefaultLocalComponent

    expect(el.name).to.have.text('custom-name')
    expect(el.text).to.have.text('default-text')
    expect(el.badge).to.have.text('custom-badge')
    expect(el.button).to.have.text('')
  })

  it('should apply custom locale to override default (it)', async () => {
    const {navigator} = window
    Object.defineProperty(window, 'navigator', {writable: true, value: {language: 'it'}})

    const el = await fixture(html`
      <defaulted-localized-component
        .customLocale=${
          {
            name: {it: 'name-it'},
            body: {
              text: {it: 'text-it'},
              badge: 'badge-it',
            }
          }
        }
        .buttonlabel=${{en: 'Button', it: 'Bottone'}}
      ></defaulted-localized-component>
    `) as WithDefaultLocalComponent

    expect(el.name).to.have.text('name-it')
    expect(el.text).to.have.text('text-it')
    expect(el.badge).to.have.text('badge-it')
    expect(el.button).to.have.text('Bottone')

    Object.defineProperty(window, 'navigator', {writable: true, value: navigator})
  })

  it('should apply custom locale to override default (it-IT)', async () => {
    const {navigator} = window
    Object.defineProperty(window, 'navigator', {writable: true, value: {language: 'it-IT'}})

    const el = await fixture(html`
      <defaulted-localized-component
        .customLocale=${
          {
            name: {it: 'name-it'},
            body: {
              text: {it: 'text-it'},
              badge: {it: 'badge-it'},
            }
          }
        }
        .buttonlabel=${{en: 'Button', it: 'Bottone'}}
      ></defaulted-localized-component>
    `) as WithDefaultLocalComponent

    expect(el.name).to.have.text('name-it')
    expect(el.text).to.have.text('text-it')
    expect(el.badge).to.have.text('badge-it')
    expect(el.button).to.have.text('Bottone')

    Object.defineProperty(window, 'navigator', {writable: true, value: navigator})
  })

  it('should apply partial custom locale to override default (it)', async () => {
    const {navigator} = window
    Object.defineProperty(window, 'navigator', {writable: true, value: {language: 'it'}})

    const el = await fixture(html`
      <defaulted-localized-component
        .customLocale=${
          {
            name: {it: 'name-it'},
            body: {
              text: {it: 'text-it'}
            }
          }
        }
        .buttonlabel=${{en: 'Button', it: 'Bottone'}}
      ></defaulted-localized-component>
    `) as WithDefaultLocalComponent

    expect(el.name).to.have.text('name-it')
    expect(el.text).to.have.text('text-it')
    expect(el.badge).to.have.text('default-badge')
    expect(el.button).to.have.text('Bottone')

    Object.defineProperty(window, 'navigator', {writable: true, value: navigator})
  })

  it('should apply custom locale to override default (partial locale)', async () => {
    const el = await fixture(html`
      <defaulted-localized-component .customLocale=${{name: {en: 'custom-name'}}}></defaulted-localized-component>
    `) as WithDefaultLocalComponent

    expect(el.name).to.have.text('custom-name')
    expect(el.text).to.have.text('default-text')
    expect(el.badge).to.have.text('default-badge')
    expect(el.button).to.have.text('')
  })

  it('should apply custom locale to override default (default language kicks in)', async () => {
    const {navigator} = window
    Object.defineProperty(window, 'navigator', {writable: true, value: {language: undefined}})
    
    const el = await fixture(html`
      <defaulted-localized-component .customLocale=${{name: {en: 'custom-name'}}}></defaulted-localized-component>
    `) as WithDefaultLocalComponent

    expect(el.name).to.have.text('custom-name')
    expect(el.text).to.have.text('default-text')
    expect(el.badge).to.have.text('default-badge')
    expect(el.button).to.have.text('')
    Object.defineProperty(window, 'navigator', {writable: true, value: navigator})
  })

  it('should apply solved locale to override default', async () => {
    const el = await fixture(html`<defaulted-localized-component
      .locale=${
        {
          name: 'custom-name',
          body: {
            text: 'custom-text',
            badge: 'custom-badge'
          }
        }
      }></defaulted-localized-component>`
    ) as WithDefaultLocalComponent
    
    expect(el.name).to.have.text('custom-name')
    expect(el.text).to.have.text('custom-text')
    expect(el.badge).to.have.text('custom-badge')
    expect(el.button).to.have.text('')
  })
})
