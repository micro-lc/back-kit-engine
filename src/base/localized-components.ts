import {getNavigatorLanguage, DEFAULT_LANGUAGE} from '../utils/i18n'

export type Locale <L extends Labels> = {
  [lang: Lang]: L
}

export type Labels = Record<string, never> | {
  [key: string]: string | unknown | Labels | undefined
}

type Lang = string

export interface LocalizedComponent<L extends Labels = Labels> {
  defaultLocale?: L
  locale?: L
}

const unique = <T>(l: T[]) => [...new Set(l)]

function isValidObject (input: unknown): input is Record<string, unknown> {
  return Boolean(input) && typeof input === 'object' && !Array.isArray(input)
}

export function localizeObj <L extends Labels>(locale?: Locale<L>) : L | undefined {
  return locale?.[getNavigatorLanguage()] ?? locale?.[DEFAULT_LANGUAGE]
}

function merge<T = unknown> (values: T, defaultValues: T): T {  
  if (typeof values === 'undefined') {
    return defaultValues
  }

  if (!isValidObject(values)) {
    return values
  }

  if (!isValidObject(defaultValues)) {
    return values
  }
  
  return unique(Object.keys(defaultValues).concat(Object.keys(values)))
    .reduce((acc, key) => ({...acc, [key]: merge(values?.[key], defaultValues?.[key])}), {}) as T
}

export function mergeLocale <L extends Labels> (labels: L | undefined, defaultLabels: L | undefined): L | undefined {
  return merge(labels, defaultLabels)
}
