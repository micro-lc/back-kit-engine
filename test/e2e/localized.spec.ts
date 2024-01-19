import {
  fixture,
  html,
  expect
} from '@open-wc/testing'
import {customElement, query} from 'lit/decorators.js'
import React from 'react'

// import {BkBase} from '../../src/base/bk-base'
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
            React.createElement('div', {id: 'name', key: 'name', ...props}, props.locale.name),
            React.createElement('div', {id: 'text', key: 'text', ...props}, props.locale.body.text),
            React.createElement('div', {id: 'badge', key: 'badge', ...props}, props.locale.body.badge),
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
class DefaultedLocalComponent extends LocalComponent {
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

describe('style tests', () => {
  it('should use default locale', async () => {
    const el = await fixture(html`
      <defaulted-localized-component></defaulted-localized-component>
    `) as DefaultedLocalComponent

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
    `) as DefaultedLocalComponent

    expect(el.name).to.be.to.have.text('custom-name')
    expect(el.text).to.be.to.have.text('default-text')
    expect(el.badge).to.be.to.have.text('custom-badge')
  })

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

  
})
