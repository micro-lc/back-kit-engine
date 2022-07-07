import {compile} from 'handlebars'
import {stringifyUrl} from 'query-string'

import type {ClickPayload} from '../schemas'

type HrefQueryInputValues = {
  currentUser?: Record<string, unknown>
  currentLocation?: string
  data?: any
}

export type HrefQueryInput = {
  href?: string
  values?: HrefQueryInputValues
  query?: Record<string, any>
}

const parseValues = (values: Record<string, any>): Record<string, any> => {
  return Object
    .entries(values)
    .reduce((acc: Record<string, any>, [key, value]) => {
      let parsedValue: any

      try {
        parsedValue = typeof value === 'string' ? JSON.parse(value) : value
      } catch {
        parsedValue = value
      }

      return {
        ...acc, [key]: parsedValue
      }
    }, {})
}

const handleBarsCompiler = (values: Record<string, any>): (value: any) => any => {
  const parsedValues = parseValues(values)

  return (value: any) => {
    const canBeCompiled = typeof value === 'string' && Object.keys(parsedValues).length !== 0
    if (!canBeCompiled) { return value }

    const template = compile(value)
    return template(parsedValues)
  }
}

export const buildRef = ({
  href = '', values = {}, query = {}
}: HrefQueryInput): string => {
  const compiler = handleBarsCompiler(values)
  const compiledQuery: Record<string, any> = {}

  Object
    .entries(query)
    .forEach(([key, value]) => { compiledQuery[key] = compiler(value) })

  return stringifyUrl({
    url: compiler(href), query: compiledQuery
  })
}

export const stripDomain = (href?: string): string | undefined => {
  if (href) {
    if (href.match(/^https?:\/\//)) {
      const domain = href.replace('http://', '').replace('https://', '').split(/[/?#]/)[0]
      const index = href.indexOf(domain)

      return href.substring(index + domain.length)
    } else {
      return href.startsWith('/') ? href : '/'.concat(href)
    }
  }
}

export const handleRef = (payload: ClickPayload, currentUser?: Record<string, unknown>, data?: Record<string, unknown>, shouldStripDomain = true): void => {
  const {
    href: genericRef, target = '_self', query
  } = payload

  const href = shouldStripDomain ? stripDomain(genericRef) : genericRef

  const link = buildRef({
    href,
    query,
    values: {
      data,
      currentUser,
      currentLocation: window.location.href
    }
  })

  target !== '_self' ? window.open(link, target) : window.location.replace(link)
}
