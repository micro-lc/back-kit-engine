import {HttpClientInstance, HttpClientSupport, HttpMethods} from './http-client'

export type RerouteRule = {
  from: string | {method: HttpMethods, url: string}
  to: string
}

type ValidRerouteRule = {
  from: {method: HttpMethods, url: string}
  to: string
}

const methods: HttpMethods[] = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']

function isHttpMethod (input: unknown): input is HttpMethods {
  return typeof input === 'string' && methods.includes(input as HttpMethods)
}
function isValidObject (input: unknown): input is Record<string, unknown> {
  return typeof input === 'object'
    && !Array.isArray(input)
    && input !== null
}
function isValidRerouteRule (input: unknown): input is ValidRerouteRule { 
  const isValid = isValidObject(input) && 'from' in input && 'to' in input
  if (!isValid) {
    return false
  }
  const {from, to} = input
  return isValidObject(from)
    && 'method' in from && isHttpMethod(from.method)
    && 'url' in from && typeof from.url === 'string'
    && typeof to === 'string'
}

const ruleId = ({method, url}: ValidRerouteRule['from']) => `${method}:${url}`

const completeRules = (rules: RerouteRule[]): ValidRerouteRule[] => {
  return rules.reduce<ValidRerouteRule[]>((acc, {from, to}) => {
    if (typeof from === 'string') {
      acc.push(...methods.map(method => ({from: {method, url: from}, to})))
    }
    else if (isValidRerouteRule({from, to})) {
      acc.push({from, to})
    }
    return acc
  }, [])
}


type Fetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

export function withRerouting_ (this: HttpClientSupport): void | (() => void) {
  const {proxyWindow, reroutingRules} = this
  
  if (!reroutingRules || !proxyWindow) {
    return
  }
  
  const {fetch} = proxyWindow
  const rules = completeRules(reroutingRules)
  const rerouteMap = rules.reduce<Record<string, string>>((acc, {from, to}) => ({...acc, [ruleId(from)]: to}), {})
  const reroutedFetch: Fetch = (input, init, ...rest) => {
    const method = init?.method
    const url = (typeof input === 'string' || input instanceof URL)
      ? new URL(input).pathname
      : new URL(input.url).pathname
    if (isHttpMethod(method) && url) {
      const id = ruleId({method, url})
      if (id in rerouteMap) {
        return fetch(rerouteMap[id], init, ...rest)
      }
    }
    return fetch(input, init, ...rest)
  }
  Object.defineProperty(proxyWindow, 'fetch', {value: reroutedFetch, writable: true})
  
  return () => Object.defineProperty(proxyWindow, 'fetch', {value: fetch, writable: true})
}

export function withRerouting (
  httpClient: HttpClientInstance,
  partialRules: RerouteRule[]
): HttpClientInstance {
  const {get, post, patch, delete: delete_, postMultipart, patchMultipart, fetch, ...rest} = httpClient
  const rules = completeRules(partialRules)
  const rerouteMap = rules.reduce<Record<string, string>>((acc, {from, to}) => ({...acc, [ruleId(from)]: to}), {})

  return {
    get: (url, ...rest) => {
      const id = ruleId({method: 'GET', url})
      const reroutedUrl = id in rerouteMap ? rerouteMap[id] : url
      return get(reroutedUrl, ...rest)
    },
    post: (url, ...rest) => {
      const id = ruleId({method: 'POST', url})
      return id in rerouteMap ? post(rerouteMap[id], ...rest) : post(url, ...rest)
    },
    patch: (url, ...rest) => {
      const id = ruleId({method: 'PATCH', url})
      return id in rerouteMap ? patch(rerouteMap[id], ...rest) : patch(url, ...rest)
    },
    delete: (url, ...rest) => {
      const id = ruleId({method: 'DELETE', url})
      return id in rerouteMap ? delete_(rerouteMap[id], ...rest) : delete_(url, ...rest)
    },
    postMultipart: (url, ...rest) => {
      const id = ruleId({method: 'POST', url})
      return id in rerouteMap ? postMultipart(rerouteMap[id], ...rest) : postMultipart(url, ...rest)
    },
    patchMultipart: (url, ...rest) => {
      const id = ruleId({method: 'PATCH', url})
      return id in rerouteMap ? patchMultipart(rerouteMap[id], ...rest) : patchMultipart(url, ...rest)
    },
    fetch: (url, config, ...rest) => {
      const method = config?.method
      if (!method) {
        return fetch(url, config, ...rest)
      }
      const id = ruleId({method, url})
      return id in rerouteMap ? fetch(rerouteMap[id], config, ...rest) : fetch(url, config, ...rest)
    },
    ...rest
  }
}
