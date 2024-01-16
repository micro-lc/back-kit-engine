import {HttpClientSupport, HttpMethods} from './http-client'

export type RerouteRule = {
  from: string | RegExp | {url: string | RegExp, method: HttpMethods}
  to: string
}
type ValidRerouteRule = {
  from: {url: RegExp, method: HttpMethods}
  to: string
}

type ReroutingFunction = (url: string, method: HttpMethods) => string

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
    && 'url' in from && from.url instanceof RegExp
    && typeof to === 'string'
}

const getRegexGroups = (match: RegExpMatchArray) => {
  const namedGroups = {...match.groups}
  const positionalGroups = match.slice(1)?.filter((g) => !Object.values(namedGroups).includes(g)) ?? []
  return positionalGroups.reduce((acc, group, idx) => ({...acc, [`${idx+1}`]: group}), namedGroups)
}

const getRouter: (rules: ValidRerouteRule[]) => ReroutingFunction  = (rules) => {
  return (inputUrl, inputMethod) => {
    let match: RegExpMatchArray | null = null
    for (const {to: targetUrl, from: {method, url: urlRegex}} of rules) {
      match = inputUrl.match(urlRegex)
      if (inputMethod === method && match) {
        const groups = getRegexGroups(match)
        if (Object.keys(groups).length > 0) {
          return Object
            .entries(groups)
            .reduce((acc, [toReplace, replaceWith]) => acc.replaceAll(`$${toReplace}`, replaceWith), targetUrl)
        }
        return targetUrl
      }
    }
    return inputUrl
  }
}


const completeRules = (rules: RerouteRule[]): ValidRerouteRule[] => {
  return rules.reduce<ValidRerouteRule[]>((acc, rule) => {
    if (isValidRerouteRule(rule)) {
      acc.push(rule)
    }
    else if (isValidObject(rule.from) && typeof rule.from.url === 'string') {
      rule.from.url = new RegExp(rule.from.url)
      if (isValidRerouteRule(rule)) {
        acc.push(rule)
      }
    }
    else if (typeof rule.from === 'string' || rule.from instanceof RegExp) {
      const url = typeof rule.from === 'string' ? new RegExp(rule.from) : rule.from
      acc.push(
        ...methods
          .map(method => ({from: {method, url}, to: rule.to}))
          .filter(isValidRerouteRule)
      )
    }
    return acc
  }, [])
}

export function withRerouting (this: HttpClientSupport): void | (() => void) {
  type Fetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
  
  const {proxyWindow = window, reroutingRules} = this
  const {fetch} = proxyWindow
  if (!Array.isArray(reroutingRules) || reroutingRules.length === 0) {
    return
  }

  const router = getRouter(completeRules(reroutingRules))
  const reroutedFetch: Fetch = (input, init, ...rest) => {
    if (init && isHttpMethod(init.method)) {
      if (typeof input === 'string' || input instanceof URL) {
        const url = new URL(input)
        url.pathname = router(url.pathname, init.method)
        return fetch(typeof input === 'string' ? url.toString() : url, init, ...rest)
      }
      else if (input instanceof Request) {
        const {url: reqUrl, ...reqRest} = input
        const url = new URL(reqUrl)
        url.pathname = router(url.pathname, init.method)
        const reroutedReq = {url: url.toString(), ...reqRest}
        return fetch(reroutedReq, init, ...rest)
      }
    }

    return fetch(input, init, ...rest)
  }
  
  this.proxyWindow = {...proxyWindow, fetch: reroutedFetch}
}
