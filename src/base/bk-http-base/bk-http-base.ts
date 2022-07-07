import {
  property, state
} from 'lit/decorators.js'

import {
  createFetchHttpClient, HttpClientInstance
} from '../../utils'
import {BkBase} from '../bk-base'

/**
 * @superclass
 * @description Extends `BkBase` by adding an instance of a basic
 * http client which wraps browser's `fetch` API. It provides an axios-like
 * API on fetch GET and POST method
 */
export class BkHttpBase extends BkBase {
  _basePath?: string

  _headers?: HeadersInit

  @state() _httpClient: HttpClientInstance = createFetchHttpClient.bind(this)()

  /**
   * @description http client base path
   */
  @property()
  get basePath (): string | undefined {
    return this._basePath
  }

  set basePath (path: string | undefined) {
    this._basePath = path
    this._httpClient = createFetchHttpClient.bind(this)()
  }

  /**
   * @description http client custom headers
   */
  @property({attribute: false})
  get headers (): HeadersInit | undefined {
    return this._headers
  }

  set headers (h: HeadersInit | undefined) {
    this._headers = h
    this._httpClient = createFetchHttpClient.bind(this)()
  }
}
