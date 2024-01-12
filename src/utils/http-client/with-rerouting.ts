import {HttpClientSupport, HttpMethods} from './http-client'

export type RerouteRule = {
  from: string | {url: string | RegExp, method: HttpMethods}
  to: string
}
type ValidRerouteRule = {
  from: {method: HttpMethods, url: RegExp}
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

const getRegexGroups = (input: string, regex: RegExp) => {
  const match = input.match(regex)
  if (!match) {
    return {}
  }
  const namedGroups = {...match.groups}
  const positionalGroups = match.slice(1)?.filter((g) => !Object.values(namedGroups).includes(g)) ?? []
  return positionalGroups.reduce((acc, group, idx) => ({...acc, [`${idx+1}`]: group}), namedGroups)
}

const getRouter: (rules: ValidRerouteRule[]) => ReroutingFunction  = (rules) => {
  return (inputUrl, inputMethod) => {
    const ruleToApply = rules.find(({from: {method, url: urlRegex}}) =>
      inputMethod === method && inputUrl.match(urlRegex)
    )
    if (ruleToApply) {
      const tagetUrl = ruleToApply.to
      const groups = getRegexGroups(inputUrl, ruleToApply.from.url)
      return Object
        .entries(groups)
        .reduce((acc, [toReplace, replaceWith]) => acc.replaceAll(`$${toReplace}`, replaceWith), tagetUrl)
    }
    return inputUrl
  }
}


const completeRules = (rules: RerouteRule[]): ValidRerouteRule[] => {
  return rules.reduce<ValidRerouteRule[]>((acc, rule) => {
    if (isValidRerouteRule(rule)) {
      acc.push(rule)
    }
    else if (typeof rule.from === 'string' && typeof rule.to === 'string') {
      const url = new RegExp(rule.from)
      acc.push(...methods.map(method => ({from: {method, url}, to: rule.to})))
    }
    else if (isValidObject(rule.from) && typeof rule.from.url === 'string') {
      rule.from.url = new RegExp(rule.from.url)
      if (isValidRerouteRule(rule)) {
        acc.push(rule)
      }
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
      // else if (input instanceof Request) {
      //   const {url: reqUrl, ...reqRest} = input
      //   const url = new URL(reqUrl)
      //   url.pathname = router(url.pathname, init.method)
      //   const reroutedReq = {url: url.toString(), ...reqRest}
      //   return fetch(reroutedReq, init, ...rest)
      // }
    }

    return fetch(input, init, ...rest)
  }
  
  this.proxyWindow = {...proxyWindow, fetch: reroutedFetch}
}
