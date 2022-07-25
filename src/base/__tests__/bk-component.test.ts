import {
  fixture, html
} from '@open-wc/testing-helpers'

import {
  LitCreatable, reactRender, unmount
} from '../../engine'
import {BkComponent} from '../bk-component/bk-component'

jest.mock('../../engine')

const tag = 'bk-component-test-tag'

function Component () {
  return null
}

class BkComponentImpl extends BkComponent {
  constructor () {
    super(Component, () => ({}))
  }
}
customElements.define(tag, BkComponentImpl)

describe('bk-component tests', () => {
  it('should render bk-component shadow root with relative class', async () => {
    const el = await fixture(html`<bk-component-test-tag></bk-component-test-tag>`)

    expect(el.shadowRoot?.innerHTML).toBe('<!---->')

    /**
     * on `updated` is called with implicit `true`
     */
    expect(reactRender).toBeCalledTimes(1)

    el.remove()
    expect(unmount).toBeCalledTimes(1)
  })

  it('should render bk-component again after disconnection and renewed connection', async () => {
    const mockedReactRender = reactRender as jest.Mock
    mockedReactRender.mockImplementation(function (this: LitCreatable<any>, shouldRender = true) {
      const {renderRoot: shadowRoot} = this as {renderRoot: ShadowRoot}
      if (shouldRender) {
        shadowRoot.innerHTML = '<div></div>'
      }
    })
    const el = await fixture(html`<bk-component-test-tag></bk-component-test-tag>`)

    expect(el.shadowRoot?.innerHTML).toBe('<div></div>')

    expect(reactRender).toBeCalledTimes(1)

    const {parentElement} = el
    el.remove()
    expect(unmount).toBeCalledTimes(1)

    expect(el.shadowRoot?.innerHTML).toBe('<div></div>')

    parentElement?.appendChild(el)
    expect(reactRender).toBeCalledTimes(2)
  })
})
