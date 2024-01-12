import {downloadFile} from '../url'

import {RerouteRule, withRerouting_} from './with-rerouting'
import {withRerouting} from './with-rerouting'

export type HttpClientConfig = Omit<RequestInit, 'method'> & {
  params?: string | Record<string, string> | string[][] | URLSearchParams
  inputTransform?: (data: any) => BodyInit | null | undefined
  outputTransform?: (body: Body) => Promise<any>
  error?: (err: unknown) => Promise<unknown>
  raw?: boolean
  downloadAsFile?: boolean
}

type GetHandler =
  <T = any>(url: string, config?: HttpClientConfig) =>
    Promise<HttpClientResponse<T>>

type FetchHandler =
  (url: string, config?: HttpClientConfig & {method?: HttpMethods}) =>
    Promise<Response>

type WithBodyHandler =
  <D = any, T = any>(url: string, data: D, config?: HttpClientConfig) =>
    Promise<HttpClientResponse<T>>

type PostMultipartHandler =
  <T = any>(url: string, data: FormData, config?: HttpClientConfig) =>
    Promise<HttpClientResponse<T>>

type PatchMultipartHandler =
  <T = any>(url: string, data: FormData, config?: HttpClientConfig) =>
    Promise<HttpClientResponse<T>>

export type HttpMethods = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

export interface HttpClientSupport extends Element {
  proxyWindow?: Window
  basePath?: string
  headers?: HeadersInit
  credentials?: RequestCredentials
  reroutingRules?: RerouteRule[]
}

export type HttpClientResponse<T = any> = Response & {
  data?: T
}

export type HttpClientInstance = {
  get: GetHandler
  post: WithBodyHandler
  put: WithBodyHandler
  patch: WithBodyHandler
  delete: WithBodyHandler
  postMultipart: PostMultipartHandler
  patchMultipart: PatchMultipartHandler
  fetch: FetchHandler
}

const defaultInputTransform = JSON.stringify

const defaultOutputTransform = (response: Response) => {
  const {headers} = response

  const contentType = headers.get('Content-Type')
  if (contentType !== null) {
    if (contentType.match(/text\//i)) {
      return response.text()
    }

    if (contentType.match(/application\/json/i)) {
      return response.json()
    }
  }

  return response.blob()
}

function initParams (path: string, basePath = '', config: HttpClientConfig & {method?: HttpMethods} = {}): [URL, HttpClientConfig & {method?: HttpMethods}] {
  const url = new URL(`${basePath}${path}`, window.location.origin)
  let fetchConfig: HttpClientConfig = config
  if (config.params) {
    const {
      params, ...rest
    } = config
    url.search = new URLSearchParams(params).toString()
    fetchConfig = rest
  }

  return [url, fetchConfig]
}

function resolveHeaders (headers?: HeadersInit, configHeaders?: HeadersInit) {
  const defaultHeaders = {'Content-Type': 'application/json'}
  return {
    ...defaultHeaders, ...headers ?? {}, ...configHeaders ?? {}
  }
}

async function processResponse (fetchPromise: Promise<Response>, outputTransform?: ((body: Body) => Promise<any>) | undefined): Promise<Response> {
  return fetchPromise
    .then((res) => res.ok ? res : Promise.reject(res))
    .then(res => {
      let out: Promise<any>
      if (res.status === 204) {
        out = Promise.resolve()
      } else {
        out = outputTransform?.(res) ?? defaultOutputTransform(res)
      }
      return Promise.all([
        Promise.resolve(res),
        out
      ])
    })
    .then(([fetchResponse, data]) => {
      if (data !== undefined) {
        Object.defineProperty(fetchResponse, 'data', {value: data})
      }
      return fetchResponse
    })
}

const defaultErrorHandler = (err: unknown): unknown => {
  // eslint-disable-next-line no-console
  console.error(`httpclient - ${err}`)
  return err
}

async function get (
  this: HttpClientSupport,
  path: string,
  config?: HttpClientConfig
): Promise<HttpClientResponse<any>> {
  try {
    const {proxyWindow = window} = this
    const [url, {
      outputTransform, ...fetchConfig
    }] = initParams(path, this.basePath, config)

    const fetchPromise = proxyWindow.fetch(url.toString(), {
      ...fetchConfig,
      method: 'GET',
      headers: resolveHeaders(this.headers, fetchConfig.headers),
      credentials: fetchConfig.credentials ?? this.credentials,
    })

    if (fetchConfig.raw) {
      return fetchPromise
    }

    if (fetchConfig.downloadAsFile) {
      return await fetchPromise
        .then((response) => response.ok ? response : Promise.reject(response))
        .then(response => {
          const filename = response.headers.get('Content-Disposition')
            ?.replace(/["']/g, '')
            ?.match(/filename\*?=([^;]+)/)?.[1]

          return Promise.all([
            Promise.resolve(response),
            Promise.resolve(filename),
            response.blob()
          ])
        })
        .then(([response, filename, blob]) => {
          downloadFile.bind(this)(blob, filename)
          return response
        })
    }

    return await processResponse(fetchPromise, outputTransform)
  } catch (err) {
    return Promise.reject(defaultErrorHandler(err))
  }
}

const withBody = (method: 'POST' | 'DELETE' | 'PUT' | 'PATCH') =>
  async function <D = any> (
    this: HttpClientSupport,
    path: string,
    data: D,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<any>> {
    try {
      const {proxyWindow = window} = this
      const [url, {
        outputTransform, ...fetchConfig
      }] = initParams(path, this.basePath, config)

      const transform = fetchConfig.inputTransform?.(data) ?? defaultInputTransform(data)
      const fetchPromise = proxyWindow.fetch(url.toString(), {
        ...fetchConfig,
        method,
        body: transform,
        headers: resolveHeaders(this.headers, fetchConfig.headers),
        credentials: fetchConfig.credentials ?? this.credentials,
      })

      if (fetchConfig.raw) {
        return fetchPromise
      }

      if (method === 'POST' && fetchConfig.downloadAsFile) {
        return await fetchPromise
          .then((response) => response.ok ? response : Promise.reject(response))
          .then(response => {
            const filename = response.headers.get('Content-Disposition')
              ?.replace(/["']/g, '')
              ?.match(/filename\*?=([^;]+)/)?.[1]
  
            return Promise.all([
              Promise.resolve(response),
              Promise.resolve(filename),
              response.blob()
            ])
          })
          .then(([response, filename, blob]) => {
            downloadFile.bind(this)(blob, filename)
            return response
          })
      }

      return await processResponse(fetchPromise, outputTransform)
    } catch (err) {
      return Promise.reject(defaultErrorHandler(err))
    }
  }

async function postMultipart(
  this: HttpClientSupport,
  path: string,
  data: FormData,
  config?: HttpClientConfig
): Promise<HttpClientResponse<any>> {
  return await executeMultipart(this, 'POST', path, data, config)
}

async function patchMultipart(
  this: HttpClientSupport,
  path: string,
  data: FormData,
  config?: HttpClientConfig
): Promise<HttpClientResponse<any>> {
  return await executeMultipart(this, 'PATCH', path, data, config)
}

async function executeMultipart (
  httpClient: HttpClientSupport,
  method: 'POST' | 'PATCH',
  path: string,
  data: FormData,
  config?: HttpClientConfig
): Promise<HttpClientResponse<any>> {
  try {
    const {proxyWindow = window} = httpClient
    const [url, {
      outputTransform, ...fetchConfig
    }] = initParams(path, httpClient.basePath, config)

    const fetchPromise = proxyWindow.fetch(url.toString(), {
      ...fetchConfig,
      method,
      body: data,
      headers: {
        ...httpClient.headers ?? {}, ...fetchConfig.headers ?? {}
      },
      credentials: fetchConfig.credentials ?? httpClient.credentials,
    })

    if (fetchConfig.raw) {
      return fetchPromise
    }

    return await processResponse(fetchPromise, outputTransform)
  } catch (err) {
    return Promise.reject(defaultErrorHandler(err))
  }
}

async function _fetch (
  this: HttpClientSupport,
  path: string,
  config?: HttpClientConfig & {method?: HttpMethods}
): Promise<Response> {
  try {
    const {proxyWindow = window} = this
    const [url, {
      method = 'GET', body, ...fetchConfig
    }] = initParams(path, this.basePath, config)

    delete fetchConfig.outputTransform
    delete fetchConfig.inputTransform

    const fetchPromise = proxyWindow.fetch(url.toString(), {
      ...fetchConfig,
      method,
      body,
      headers: resolveHeaders(this.headers, fetchConfig.headers),
      credentials: fetchConfig.credentials ?? this.credentials,
    })

    return await fetchPromise.then(res => res.ok ? res : Promise.reject(res))
  } catch (err) {
    return Promise.reject(defaultErrorHandler(err))
  }
}

export function createFetchHttpClient_ (this: HttpClientSupport): HttpClientInstance {
  const client = {
    get: get.bind<GetHandler>(this),
    post: withBody('POST').bind<WithBodyHandler>(this),
    delete: withBody('DELETE').bind<WithBodyHandler>(this),
    put: withBody('PUT').bind<WithBodyHandler>(this),
    patch: withBody('PATCH').bind<WithBodyHandler>(this),
    postMultipart: postMultipart.bind<PostMultipartHandler>(this),
    patchMultipart: patchMultipart.bind<PatchMultipartHandler>(this),
    fetch: _fetch.bind<FetchHandler>(this)
  }

  return this.reroutingRules ? withRerouting(client, this.reroutingRules) : client
}

export function createFetchHttpClient (this: HttpClientSupport): HttpClientInstance {
  if (this.reroutingRules) {
    withRerouting_.call(this)
  }
  //this.reroutingRules ? withRerouting(client, this.reroutingRules) : client
  return {
    get: get.bind<GetHandler>(this),
    post: withBody('POST').bind<WithBodyHandler>(this),
    delete: withBody('DELETE').bind<WithBodyHandler>(this),
    put: withBody('PUT').bind<WithBodyHandler>(this),
    patch: withBody('PATCH').bind<WithBodyHandler>(this),
    postMultipart: postMultipart.bind<PostMultipartHandler>(this),
    patchMultipart: patchMultipart.bind<PatchMultipartHandler>(this),
    fetch: _fetch.bind<FetchHandler>(this)
  }
}

export type {RerouteRule}
