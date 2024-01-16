import {
  fixture, html
} from '@open-wc/testing-helpers'
import fetchMock from 'jest-fetch-mock'

import {createFetchHttpClient} from '../../utils'
import {BkHttpBase} from '../bk-http-base/bk-http-base'

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

const tag = 'bk-http-base-test-tag'
customElements.define(tag, BkHttpBase)

const defaultHeaders = {'Content-Type': 'application/json'}

describe('bk-base tests', () => {
  it('should spawn bk-http-base without http client params', () => {
    const base = new BkHttpBase()

    expect(base.headers).toBeUndefined()
    expect(base.basePath).toBeUndefined()
    expect(createFetchHttpClient).toBeCalledTimes(1)
  })

  it('should spawn bk-http-base without binding headers and basePath', async () => {
    const base = new BkHttpBase()
    base.basePath = ''
    base.headers = {key: 'value'}
    base.credentials = 'include'
    expect(createFetchHttpClient).toBeCalledTimes(4)

    const {_httpClient} = base
    const returnedData = 'ok'
    fetchMock.mockOnceIf(/\/$/, (req) => {
      const {headers} = req
      if (headers) {
        expect(headers).toEqual(new Headers({
          ...defaultHeaders, ...base.headers
        }))
        return Promise.resolve(returnedData)
      }

      return Promise.reject(new Error('Not found'))
    })

    const {data} = await _httpClient.get('/', {outputTransform: (body: Body) => body.text()})
    expect(data).toStrictEqual(returnedData)
  })

  it('should spawn bk-http-base without binding rerouting', async () => {
    const base = new BkHttpBase()
    base.basePath = ''
    base.reroutingRules = [{from: {url: '/app', method: 'GET'}, to: '/v2/app'}]
    expect(createFetchHttpClient).toBeCalledTimes(3)

    const {_httpClient} = base
    const returnedData = 'ok'
    fetchMock.mockOnceIf(/\/v2\/app$/, () => {
      return Promise.resolve(returnedData)
    })

    const {data} = await _httpClient.get('/app', {outputTransform: (body: Body) => body.text()})
    expect(data).toStrictEqual(returnedData)
  })

  it('should disconnect', async () => {
    const el = await fixture(html`<bk-http-base-test-tag></bk-http-base-test-tag>`)
    expect(document.body.outerHTML).toEqual('<body><div><!----><bk-http-base-test-tag></bk-http-base-test-tag></div></body>')
    expect(createFetchHttpClient).toBeCalled()
    el.remove()
    expect(document.body.outerHTML).toEqual('<body><div><!----></div></body>')
  })
})
