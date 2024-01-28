import {type LocalizedText, DEFAULT_LANGUAGE, getLocalizedText, Localized} from '../utils/i18n'

export type Labels = {
  [key: string]: string | undefined | Labels
}

export interface LocalizedComponent<L extends Labels = Labels> {
  customLocale?: Localized<L>
  locale?: L
}

const unique = <T>(l: T[]) => [...new Set(l)]

function isValidObject (input: unknown): input is Record<string, unknown> {
  return Boolean(input) && typeof input === 'object' && !Array.isArray(input)
}

function isLocaliedText (input: unknown): input is LocalizedText {
  return isValidObject(input)
    && Object
      .entries(input)
      .every(([key, value]) =>
        typeof key === 'string' && key.length === 2 && typeof value === 'string')
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

export function solveLocale<L extends Labels> (
  locale: Localized<L>,
  lang: string = navigator.language || DEFAULT_LANGUAGE
): L {
  if (!isValidObject(locale)) {
    return locale
  }
  return Object.entries(locale).reduce((acc, [key, entry]) => {
    acc[key as keyof L] = (isLocaliedText(entry) ? getLocalizedText(entry, lang) : solveLocale(entry, lang)) as L[keyof L]
    return acc
  }, {} as L)
}

export function mergeLabels <L extends Labels> (labels?: L, defaultLabels?: L): L | undefined {
  return merge(labels, defaultLabels)
}
