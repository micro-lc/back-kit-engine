import {
  fixture,
  html,
  expect
} from '@open-wc/testing'
import {customElement, query} from 'lit/decorators.js'
import React from 'react'

import {BkComponent} from '../../src/base/bk-component'

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
  
  constructor() {
    super(
      function (props: Record<string, any>) { 
        return React.createElement(
          'div', {id: 'parent', ...props},
          [
            React.createElement('div', {id: 'name', key: 'name', ...props}, props.locale?.name ?? ''),
            React.createElement('div', {id: 'text', key: 'text', ...props}, props.locale?.body.text ?? ''),
            React.createElement('div', {id: 'badge', key: 'badge', ...props}, props.locale?.body.badge ?? ''),
          ]
        )
      },
      function (this: LocalComponent): Record<string, any> {
        return {locale: this.locale}
      }
    )
  }
  
  render () {
    html`<div id='container'></div>`
  }
}

@customElement('defaulted-localized-component')
class WithDefaultLocalComponent extends LocalComponent {
  defaultLocale = {
    en: {
      name: 'default-name',
      body: {
        text: 'default-text',
        badge: 'default-badge'
      }
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
              }
            }
          }
        }
      ></localized-component>
    `) as LocalComponent

    expect(el.name).to.be.to.have.text('custom-name')
    expect(el.text).to.be.to.have.text('custom-text')
    expect(el.badge).to.be.to.have.text('custom-badge')
  })

  it('should apply no locale', async () => {
    const el = await fixture(html`
      <localized-component></localized-component>
    `) as LocalComponent

    expect(el.name).to.be.to.have.text('')
    expect(el.text).to.be.to.have.text('')
    expect(el.badge).to.be.to.have.text('')
  })

  it('should use default locale', async () => {
    const el = await fixture(html`
      <defaulted-localized-component></defaulted-localized-component>
    `) as WithDefaultLocalComponent

    expect(el.name).to.be.to.have.text('default-name')
    expect(el.text).to.be.to.have.text('default-text')
    expect(el.badge).to.be.to.have.text('default-badge')
  })

  it('should apply custom locale to default', async () => {
    const el = await fixture(html`
      <defaulted-localized-component
        .customLocale=${
          {
            en: {
              name: 'custom-name',
              body: {
                badge: 'custom-badge'
              }
            },
            it: {
              name: 'name-it',
              body: {
                text: 'text-it',
                badge: 'badge-it'
              }
            }
          }
        }
      ></defaulted-localized-component>
    `) as WithDefaultLocalComponent

    expect(el.name).to.be.to.have.text('custom-name')
    expect(el.text).to.be.to.have.text('default-text')
    expect(el.badge).to.be.to.have.text('custom-badge')
  })

  it('should apply custom locale to default (it)', async () => {
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
              }
            }
          }
        }
      ></defaulted-localized-component>
    `) as WithDefaultLocalComponent

    expect(el.name).to.be.to.have.text('name-it')
    expect(el.text).to.be.to.have.text('text-it')
    expect(el.badge).to.be.to.have.text('badge-it')

    Object.defineProperty(window, 'navigator', {writable: true, value: navigator})
  })

  it('should apply custom locale to default (partial locale)', async () => {
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
  })

  it('should be robust to wrong custom locale', async () => {
    const el = await fixture(html`
      <defaulted-localized-component
        .customLocale=${
          {
            en: {
              name: 0, // should use default
              body: {
                badge: 'custom-badge'
              },
              wrong: 0 // should be ignored
            },
            it: {
              name: 'name-it',
              body: {
                text: 'text-it',
                badge: 'badge-it'
              }
            }
          }
        }
      ></defaulted-localized-component>
    `) as WithDefaultLocalComponent

    expect(el.name).to.be.to.have.text('default-name')
    expect(el.text).to.be.to.have.text('default-text')
    expect(el.badge).to.be.to.have.text('custom-badge')
    // @ts-expect-error wrong conifg should not be applied
    expect(el.locale?.wrong).to.be.undefined
  })
})
