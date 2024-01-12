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

const getRouter: (rules: ValidRerouteRule[]) => ReroutingFunction  = (rules) => {
  return (inputUrl, inputMethod) => {
    const ruleToApply = rules.find(({from: {method, url: urlRegex}}) =>
      inputMethod === method && inputUrl.match(urlRegex)
    )
    
    if (ruleToApply) {
      const tagetUrl = ruleToApply.to
      
      const match = inputUrl.match(ruleToApply.from.url)
      const namedGroups = {...match?.groups}
      const positionalGroups = match?.slice(1)?.filter((g) => !Object.values(namedGroups).includes(g)) ?? []
      
      const groups = positionalGroups.reduce((acc, group, idx) => {
        acc[`${idx+1}`] = group
        return acc
      }, namedGroups)
      
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
    else if (typeof rule.from === 'string') {
      const url = new RegExp(rule.from)
      acc.push(...methods.map(method => ({from: {method, url}, to: rule.to})))
    }
    else if (isValidObject(rule.from) && typeof rule.from.url === 'string') {
      const {method, url: url_} = rule.from
      const url = new RegExp(url_)
      acc.push({from: {method, url}, to: rule.to})
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
    const method = init?.method
    if (isHttpMethod(method)) {
      if (typeof input === 'string') {
        const url = new URL(input)
        url.pathname = router(url.pathname, method)
        return fetch(url.toString(), init, ...rest)
      }
      else if (input instanceof URL) {
        const url = new URL(input)
        url.pathname = router(url.pathname, method)
        return fetch(url, init, ...rest)
      }
      else if (input instanceof Request) {
        const {url: reqUrl, ...reqRest} = input
        const url = new URL(reqUrl)
        url.pathname = router(url.pathname, method)
        const reroutedReq = {url: url.toString(), ...reqRest}
        return fetch(reroutedReq, init, ...rest)
      }
    }

    return fetch(input, init, ...rest)
  }
  
  this.proxyWindow = {...proxyWindow, fetch: reroutedFetch}
}


// export function withRerouting (this: HttpClientSupport): void | (() => void) {
//   type Fetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
  
//   const {proxyWindow = window, reroutingRules} = this
//   if (!reroutingRules) {
//     return
//   }
  
//   const {fetch} = proxyWindow
//   const rerouteMap = completeRules(reroutingRules)
//     .reduce<Record<string, string>>((acc, {from, to}) => ({...acc, [ruleId(from)]: to}), {})
  
//   const reroutedFetch: Fetch = (input, init, ...rest) => {
//     const method = init?.method
//     if (isHttpMethod(method)) {
//       if (typeof input === 'string') {
//         const url = new URL(input)
//         const id = ruleId({method, url: url.pathname})
//         if (id in rerouteMap) {
//           url.pathname = rerouteMap[id]
//           return fetch(url.toString(), init, ...rest)
//         }
//       }
      
//       else if (input instanceof URL) {
//         const url = new URL(input)
//         const id = ruleId({method, url: url.pathname})
//         if (id in rerouteMap) {
//           url.pathname = rerouteMap[id]
//           return fetch(url, init, ...rest)
//         }
//       }

//       else if (input instanceof Request) {
//         const {url: reqUrl, ...reqRest} = input
//         const url = new URL(reqUrl)
//         const id = ruleId({method, url: url.pathname})
//         if (id in rerouteMap) {
//           url.pathname = rerouteMap[id]
//           const reroutedReq = {url: url.toString(), ...reqRest}
//           return fetch(reroutedReq, init, ...rest)
//         }
//       }
//     }

//     return fetch(input, init, ...rest)
//   }
  
//   this.proxyWindow = {...proxyWindow, fetch: reroutedFetch}
// }
