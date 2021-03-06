import {downloadFile} from './url'

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

type PostHandler =
  <D = any, T = any>(url: string, data: D, config?: HttpClientConfig) =>
    Promise<HttpClientResponse<T>>

type PostMultipartHandler =
  <T = any>(url: string, data: FormData, config?: HttpClientConfig) =>
    Promise<HttpClientResponse<T>>

export type HttpMethods = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

export interface HttpClientSupport extends Element {
  basePath?: string
  headers?: HeadersInit
}

export type HttpClientResponse<T = any> = Response & {
  data?: T
}

export type HttpClientInstance = {
  get: GetHandler
  post: PostHandler
  put: PostHandler
  delete: PostHandler
  postMultipart: PostMultipartHandler
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
    const [url, {
      outputTransform, ...fetchConfig
    }] = initParams(path, this.basePath, config)

    const fetchPromise = fetch(url.toString(), {
      ...fetchConfig,
      method: 'GET',
      headers: resolveHeaders(this.headers, fetchConfig.headers)
    })

    if (fetchConfig.raw) {
      return fetchPromise
    }

    if (fetchConfig.downloadAsFile) {
      return await fetchPromise.then(response => {
        const filename = response.headers.get('Content-Disposition')?.match(/filename=([^;]+)/)?.[1]

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

const withBody = (method: 'POST' | 'DELETE' | 'PUT') =>
  async function <D = any> (
    this: HttpClientSupport,
    path: string,
    data: D,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<any>> {
    try {
      const [url, {
        outputTransform, ...fetchConfig
      }] = initParams(path, this.basePath, config)

      const transform = fetchConfig.inputTransform?.(data) ?? defaultInputTransform(data)
      const fetchPromise = fetch(url.toString(), {
        ...fetchConfig,
        method,
        body: transform,
        headers: resolveHeaders(this.headers, fetchConfig.headers)
      })

      if (fetchConfig.raw) {
        return fetchPromise
      }

      return await processResponse(fetchPromise, outputTransform)
    } catch (err) {
      return Promise.reject(defaultErrorHandler(err))
    }
  }

async function postMultipart (
  this: HttpClientSupport,
  path: string,
  data: FormData,
  config?: HttpClientConfig
): Promise<HttpClientResponse<any>> {
  try {
    const [url, {
      outputTransform, ...fetchConfig
    }] = initParams(path, this.basePath, config)

    const fetchPromise = fetch(url.toString(), {
      ...fetchConfig,
      method: 'POST',
      body: data,
      headers: {
        ...this.headers ?? {}, ...fetchConfig.headers ?? {}
      }
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
    const [url, {
      method = 'GET', body, ...fetchConfig
    }] = initParams(path, this.basePath, config)

    delete fetchConfig.outputTransform
    delete fetchConfig.inputTransform

    const fetchPromise = fetch(url.toString(), {
      ...fetchConfig,
      method,
      body,
      headers: resolveHeaders(this.headers, fetchConfig.headers)
    })

    return await fetchPromise.then(res => res.ok ? res : Promise.reject(res))
  } catch (err) {
    return Promise.reject(defaultErrorHandler(err))
  }
}

export function createFetchHttpClient (this: HttpClientSupport): HttpClientInstance {
  return {
    get: get.bind<GetHandler>(this),
    post: withBody('POST').bind<PostHandler>(this),
    delete: withBody('DELETE').bind<PostHandler>(this),
    put: withBody('PUT').bind<PostHandler>(this),
    postMultipart: postMultipart.bind<PostMultipartHandler>(this),
    fetch: _fetch.bind<FetchHandler>(this)
  }
}
