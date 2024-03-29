export type LocalizedText = string | Record<string, string>

/**
 * Turns string feilds of objects into `LocalizedText`
 * 
 * For instance:
 * 
 * ```
 * Localized<{
 *   name: string
 *   nick?: string
 *   avatar: {file: string, size: number}
 *   permissions: string[]
 * }>
 * ```
 * 
 * is equivalent to
 * 
 * ```
 * {
 *   name: LocalizedText
 *   nick?: LocalizedText
 *   avatar: {file: LocalizedText, size: number}
 *   permissions: string[]
 * }
 * ```
 */
export type Localized<L extends Record<string, unknown> | undefined> = {
  [K in keyof L]: L[K] extends (string | undefined)
    ? LocalizedText
    : (L[K] extends (Record<string, unknown> | undefined) ? Localized<L[K]> : L[K])
}

export const DEFAULT_LANGUAGE = 'en'

export function getLocalizedText (
  localizedText: LocalizedText,
  lang: string = navigator.language || DEFAULT_LANGUAGE
): string | undefined {
  if (typeof localizedText === 'string') {
    return localizedText
  }

  if (localizedText[lang]) {
    return localizedText[lang]
  }

  const availableKeys = Object.keys(localizedText)
  if (availableKeys.includes(lang.substring(0, 2))) {
    return localizedText[lang.substring(0, 2)]
  }

  if (typeof localizedText[DEFAULT_LANGUAGE] === 'string') {
    return localizedText[DEFAULT_LANGUAGE]
  }
}

export function getNavigatorLanguage (): string {
  return navigator.language.substring(0, 2)
}

export function localize(input?: LocalizedText | undefined): string {
  if(input) {
    return getLocalizedText(input, getNavigatorLanguage()) ?? input.toString()
  }

  return ''
}
