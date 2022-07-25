import {
  fixture,
  html,
  expect
} from '@open-wc/testing'
import {
  css,
  PropertyValueMap,
  unsafeCSS
} from 'lit'
import {
  customElement,
  query,
  property,
} from 'lit/decorators.js'
import React from 'react'

import {BkComponent} from '../../src/base/bk-component'

@customElement('styled-component')
class StyledComponent extends BkComponent<Record<string, any>> {
  static styles = css`
    .static-css-class div {
      background-color: rgb(255, 0, 0);
    }
  `

  constructor() {
    super(
      function (props: Record<string, any>) { 
        return React.createElement(
          'div',
          {
            id: 'inner', className: 'dynamic-css-class', ...props
          },
          'Inner'
        )
      },
      function (this: StyledComponent): Record<string, any> {
        return {
          disabled: this.disabled
        }
      }
    )
    this.stylesheet = '.dynamic-css-class { color: rgb(0, 255, 0); }'
  }

  @query('#container') container!: HTMLDivElement
  @query('#inner') innerDiv!: HTMLDivElement

  @property({state: true, type: Boolean, reflect: true}) disabled?: boolean
  @property() width?: string

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    typeof this.width === 'string' && this._adoptedStyleSheets.push(unsafeCSS(`.dynamic-css-class { width: ${this.width}; }`))
    super.firstUpdated(_changedProperties)
  }

  protected render(): unknown {
    return html`<div id="container" class="static-css-class"></div>`
  }
}

describe('style tests', () => {
  it('should render both static and dynamic styles', async () => {
    const el = await fixture(html`
      <styled-component
        .disabled=${true}
        stylesheet=".dynamic-css-class { border-radius: 10px; }"
        width="100px"
      ></styled-component>
    `) as StyledComponent

    expect(el.innerDiv).to.have.style('background-color', 'rgb(255, 0, 0)')
    expect(el.innerDiv).to.have.style('color', 'rgb(0, 255, 0)')
    expect(el.innerDiv).to.have.style('width', '100px')
    expect(el.innerDiv).to.have.style('border-radius', '10px')
    expect(el).to.have.property('disabled', true)
    expect(el.innerDiv).to.have.attribute('disabled', '')
  })
})
