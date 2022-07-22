import {fixture, html, expect} from '@open-wc/testing'
import {css, html as lithtml, PropertyValueMap, unsafeCSS} from 'lit'
import {customElement, query, property} from 'lit/decorators.js'
import React from 'react'

import {BkComponent} from '../../src/base/bk-component'

@customElement('styled-component')
class StyledComponent extends BkComponent {
  static styles = css`
    .static-css-class div {
      background-color: rgb(255, 0, 0);
    }
  `

  constructor() {
    super(
      function () { return React.createElement('div', {id: 'inner', className: 'dynamic-css-class'}, 'Inner')},
      function (this: StyledComponent) { return {} }
    )
    this.stylesheet = '.dynamic-css-class { color: rgb(0, 255, 0); }'
  }

  @query('#container') container!: HTMLDivElement
  @query('#inner') innerDiv!: HTMLDivElement

  @property() width?: string

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    typeof this.width === 'string' && this.adoptedStyleSheets.push(unsafeCSS(`.dynamic-css-class { width: ${this.width}; }`))
    super.firstUpdated(_changedProperties)
  }

  protected render(): unknown {
    return lithtml`<div id="container" class="static-css-class"></div>`
  }
}

describe('style tests', () => {
  it('should render both static and dynamic styles', async () => {
    const el = await fixture(html`<styled-component .width=${'100px'}></styled-component>`) as StyledComponent

    expect(el.innerDiv).to.have.style('background-color', 'rgb(255, 0, 0)')
    expect(el.innerDiv).to.have.style('color', 'rgb(0, 255, 0)')
    expect(el.innerDiv).to.have.style('width', '100px')
  })
})
