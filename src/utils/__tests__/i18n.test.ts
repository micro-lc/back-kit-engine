import {
  getLocalizedText, getNavigatorLanguage, localize
} from '../i18n'

describe('i18n tests', () => {
  it.each([
    ['str', undefined, 'str'],
    ['str', 'en', 'str'],
    ['str', '123456789', 'str'],
    [{}.toString(), undefined, {}],
    ['str', 'en', {
      en: 'str', it: 'abc'
    }],
    ['str', undefined, {
      en: 'str', it: 'abc'
    }],
    ['abc', 'it', {
      en: 'str', it: 'abc'
    }],
    ['str', 'es', {
      en: 'str', it: 'abc'
    }],
    ['', 'es', {
      en: '', it: 'abc'
    }]
  ])('should select %s from language %s in object %s', (expected, language, localizedString) => {
    expect(getLocalizedText(localizedString, language)).toStrictEqual(expected)
  })

  it.each([
    ['str', 'str'],
    [`${{}}`, {}],
    ['', undefined],
  ])('should select %s from language %s in object %s', (expected, localizedString) => {
    expect(localize(localizedString)).toStrictEqual(expected)
  })

  it('should return translation according to navigator.language', () => {
    const {navigator} = window
    Object.defineProperty(window, 'navigator', {
      writable: true, value: {language: 'ab'}
    })
    expect(getLocalizedText({ab: 'hi'})).toStrictEqual('hi')
    Object.defineProperty(window, 'navigator', {
      writable: true, value: navigator
    })
  })

  it('should return translation according to `DEFAULT_LANGUANGE`', () => {
    const {navigator} = window
    Object.defineProperty(window, 'navigator', {
      writable: true, value: {language: undefined}
    })
    expect(getLocalizedText({en: 'hi'})).toStrictEqual('hi')
    Object.defineProperty(window, 'navigator', {
      writable: true, value: navigator
    })
  })

  it('should return fallback translation according to `DEFAULT_LANGUANGE`', () => {
    const {navigator} = window
    Object.defineProperty(window, 'navigator', {
      writable: true, value: {language: 'es'}
    })
    expect(getLocalizedText({en: 'hi'})).toStrictEqual('hi')
    Object.defineProperty(window, 'navigator', {
      writable: true, value: navigator
    })
  })

  it('should return navigator language', () => {
    const {navigator} = window
    Object.defineProperty(window, 'navigator', {
      writable: true, value: {language: '123456789'}
    })
    expect(getNavigatorLanguage()).toStrictEqual('12')
    Object.defineProperty(window, 'navigator', {
      writable: true, value: navigator
    })
  })
})
