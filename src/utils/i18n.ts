export type LocalizedText = string | Record<string, string>

export const DEFAULT_LANGUAGE = 'en'

export function getLocalizedText (
  localizedText: LocalizedText,
  lang: string = navigator.language || DEFAULT_LANGUAGE
): string {
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

  return localizedText.toString()
}

export function getNavigatorLanguage (): string {
  return navigator.language.substring(0, 2)
}
