import {
  elementUpdated,
  fixture, fixtureCleanup, html
} from '@open-wc/testing-helpers'
import {
  PropertyDeclarations, PropertyValueMap
} from 'lit'
import React from 'react'

import {BkComponent} from '../bk-component/bk-component'

jest.mock('../../engine', () => ({...jest.requireActual('../../engine')}))

type Props = {content?: string}
function Component (props: Props) {
  return React.createElement('div', props, 'CONTENT')
}

function Component2 (props: Pick<HTMLButtonElement, 'disabled'>) {
  return React.createElement('button', {disabled: props.disabled}, 'CONTENT')
}

class _ extends BkComponent<Props> {
  content = ''
  container: HTMLDivElement | null = null
  
  static properties: PropertyDeclarations = {content: {state: true}}
  
  constructor () {
    super(
      Component,
      () => ({content: this.content})
    )
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    super.firstUpdated(_changedProperties)
    this.container = this.renderRoot.querySelector('#container')
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  protected render(): unknown {
    return html`<div id='container'></div>`
  }
}
customElements.define('bk-component-test-tag', _)

class _NoContainer extends BkComponent<Pick<HTMLButtonElement, 'disabled'>> {
  content = ''

  static properties: PropertyDeclarations = {content: {state: true}}
  
  constructor () {
    super(
      Component2,
      () => ({disabled: Boolean(this.content)})
    )
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  protected render(): unknown {
    return html`<div id='container'></div>`
  }
}
customElements.define('bk-component-test-tag-no-container', _NoContainer)

describe('bk-component tests', () => {
  afterEach(() => {
    fixtureCleanup()
  })

  it('should render bk-component shadow root with relative class', async () => {
    const el = await fixture(html`<bk-component-test-tag .content=${'hello'}></bk-component-test-tag>`) as _

    expect(el.shadowRoot?.innerHTML).toBe('<!----><div id="container"><div content="hello">CONTENT</div></div>')
    expect(el.renderRoot.firstElementChild?.querySelector('div')?.getAttribute('content')).toEqual('hello')
    
    el.content = 'ciao'
    await elementUpdated(el)

    expect(el.shadowRoot?.innerHTML).toBe('<!----><div id="container"><div content="ciao">CONTENT</div></div>')
  })
})
