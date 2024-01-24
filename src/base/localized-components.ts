import {type LocalizedText, getNavigatorLanguage, DEFAULT_LANGUAGE, getLocalizedText} from '../utils/i18n'

export type Locale = {
  [key: string]: LocalizedText | Locale
}
type Solved<L extends Locale, K extends keyof L> = L[K] extends LocalizedText ? string : (L[K] extends Locale ? Labels<L[K]> : L[K])
export type Labels<L extends Locale> = {
  [K in keyof L]: Solved<L, K>
}

// type FormLocale = {
//   firstname: LocalizedText,
//   lastname: {
//     first: LocalizedText,
//     second: string
//   }
// }
// const l: Labels<FormLocale>
// const fn = l.firstname
// const ln = l.lastname
// const f = l.lastname.first
// const s = l.lastname.second

export interface LocalizedComponent<L extends Locale = Locale> {
  defaultLocale?: Labels<L>
  locale?: Labels<L>
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

export function solveLocale<L extends Locale> (
  locale: L,
  lang: string = getNavigatorLanguage() || DEFAULT_LANGUAGE
): Labels<L> {
  if (!isValidObject(locale)) {
    return locale
  }
  return Object.entries(locale).reduce((acc, [key, entry]) => {
    acc[key as keyof L] = (isLocaliedText(entry) ? getLocalizedText(entry, lang) : solveLocale(entry)) as Solved<L, keyof L>
    return acc
  }, {} as Labels<L>)
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

export function mergeLocale <L extends Locale> (labels?: Labels<L>, defaultLabels?: Labels<L>): Labels<L> | undefined {
  return merge(labels, defaultLabels)
}
