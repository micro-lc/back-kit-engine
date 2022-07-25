import {
  fixture, html
} from '@open-wc/testing-helpers'

import {
  reactRender, unmount
} from '../../engine'
import {createFetchHttpClient} from '../../utils'
import {BkHttpComponent} from '../bk-http-component/bk-http-component'

jest.mock('../../engine')

jest.mock('../../utils', () => {
  let {createFetchHttpClient} = jest.requireActual('../../utils')

  if (createFetchHttpClient) {
    createFetchHttpClient = jest.fn(createFetchHttpClient)
  }

  return {
    ...jest.requireActual('../../utils'),
    createFetchHttpClient
  }
})

const tag = 'bk-http-component-test-tag'

function Component () {
  return null
}

class BkComponentImpl extends BkHttpComponent {
  constructor () {
    super(Component, () => ({}))
  }
}
customElements.define(tag, BkComponentImpl)

describe('bk-component tests', () => {
  it('should render bk-component shadow root with relative class', async () => {
    const el = await fixture(html`<bk-http-component-test-tag></bk-http-component-test-tag>`)
    expect(createFetchHttpClient).toBeCalled()

    expect(reactRender).toBeCalledTimes(1)

    el.remove()
    expect(unmount).toBeCalledTimes(1)
  })

  it('should render bk-component again after disconnection and renewed connection', async () => {
    const el = await fixture(html`<bk-http-component-test-tag></bk-http-component-test-tag>`)

    expect(reactRender).toBeCalledTimes(1)

    const {parentElement} = el
    el.remove()
    expect(unmount).toBeCalledTimes(1)

    parentElement?.appendChild(el)
    expect(reactRender).toBeCalledTimes(2)
  })
})
