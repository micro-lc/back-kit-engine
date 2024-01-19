import {
  property, state
} from 'lit/decorators.js'

import type {HttpClientInstance, RerouteRule} from '../../utils'
import {createFetchHttpClient} from '../../utils'
import {BkBase} from '../bk-base'
import {Labels} from '../localized-components'

/**
 * @superclass
 * @description Extends `BkBase` by adding an instance of a basic
 * http client which wraps browser's `fetch` API. It provides an axios-like
 * API on fetch GET and POST method
 */
export class BkHttpBase<L extends Labels = Labels> extends BkBase<L> {
  _basePath?: string

  _headers?: HeadersInit
  _credentials?: RequestCredentials
  _reroutingRules?: RerouteRule[]

  @state() _httpClient: HttpClientInstance = createFetchHttpClient.call(this)

  /**
   * @description http client base path
   */
  @property()
  get basePath (): string | undefined {
    return this._basePath
  }

  set basePath (path: string | undefined) {
    this._basePath = path
    this._httpClient = createFetchHttpClient.call(this)
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
    this._httpClient = createFetchHttpClient.call(this)
  }

  /**
   * @description http client custom credentials
   */
  @property({attribute: false})
  get credentials (): RequestCredentials | undefined {
    return this._credentials
  }

  set credentials (c: RequestCredentials | undefined) {
    this._credentials = c
    this._httpClient = createFetchHttpClient.call(this)
  }

  /**
 * @description http client custom rerouting rules
 */
  @property({attribute: false})
  get reroutingRules (): RerouteRule[] | undefined {
    return this._reroutingRules
  }

  set reroutingRules (r: RerouteRule[] | undefined) {
    this._reroutingRules = r
    this._httpClient = createFetchHttpClient.call(this)
  }
}
