import {getNavigatorLanguage, DEFAULT_LANGUAGE} from '../utils/i18n'

export type Locale <L extends Labels> = {
  [lang: Lang]: L
}

export type Labels = Record<string, never> | {
  [key: string]: string | unknown | Labels | undefined
}

type Lang = string

export interface LocalizedComponent<L extends Labels = Labels> {
  defaultLocale?: Locale<L>
  _locale?: L
}

const unique = <T>(l: T[]) => [...new Set(l)]

function isValidObject (input: unknown): input is Record<string, unknown> {
  return Boolean(input) && typeof input === 'object' && !Array.isArray(input)
}

function mergeLabels <L extends Labels> (labels: L, defaultLabels: L): L {
  const keys = []
  if (isValidObject(labels)) {
    keys.push(...Object.keys(labels))
  }
  if (isValidObject(defaultLabels)) {
    keys.push(...Object.keys(defaultLabels))
  }
  
  return keys.reduce<Labels>((acc, key) => {
    const value = labels[key]
    const defaultValue = defaultLabels[key]

    if (isValidObject(value)) {
      acc[key] = mergeLabels(value, isValidObject(defaultValue) ? defaultValue : {})
      return acc
    }

    acc[key] = typeof value !== 'undefined' ? value : defaultValue

    return acc
  }, {}) as L
}

export function localizeObj <L extends Labels>(locale?: Locale<L>) : L | undefined {
  return locale?.[getNavigatorLanguage()] ?? locale?.[DEFAULT_LANGUAGE]
}

export function mergeLocales<L extends Labels> (locale: Locale<L> = {}, defaultLocale: Locale<L> = {}) {
  const langs = unique(
    Object.keys(locale).concat(Object.keys(defaultLocale))
  )
  return langs.reduce<Locale<L>>((acc, lang) =>
    ({...acc, [lang]: mergeLabels(locale[lang] ?? {}, defaultLocale[lang] ?? {})}),
  {})
}
