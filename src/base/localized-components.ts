export type Locale <L extends Labels> = {
  [lang: Lang]: L
}

export type Labels = Record<string, never> | {
  [key: string]: string | Labels | undefined
}

type Lang = string

export interface LocalizedComponent<L extends Labels = Labels> {
  defaultLocale?: Locale<L>
  _locale?: L
}

const unique = <T>(l: T[]) => [...new Set(l)]

function mergeLabels <L extends Labels> (labels: L, defaultLabels: L): L {
  const keys = unique(
    Object.keys(labels).concat(Object.keys(defaultLabels))
  )
  
  return keys.reduce<Labels>((acc, key) => {
    const value = labels[key]
    const defaultValue = defaultLabels[key]

    if (typeof value === 'string') {
      acc[key] = value
      return acc
    }
    
    if (typeof value === 'undefined') {
      acc[key] = defaultValue
      return acc
    }
    
    if (typeof value === 'object' && typeof defaultValue === 'object') {
      acc[key] = mergeLabels(value, defaultValue)
      return acc
    }

    if (typeof value === 'object') {
      acc[key] = mergeLabels(value, {})
      return acc
    }

    return acc
  }, {}) as L
}

export function mergeLocales<L extends Labels> (locale: Locale<L> = {}, defaultLocale: Locale<L> = {}) {
  const langs = unique(
    Object.keys(locale).concat(Object.keys(defaultLocale))
  )
  return langs.reduce<Locale<L>>((acc, lang) =>
    ({...acc, [lang]: mergeLabels(locale[lang] ?? {}, defaultLocale[lang] ?? {})}),
  {})
}
