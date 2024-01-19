import {localizeObj, mergeLocales} from '../localized-components'

describe('localized-components tests', () => {
  const defaultLocale = {
    en: {
      title: 'title-en',
      subtitle: {
        subtitle: 'subtitle-en',
        badge: 'badge-en'
      }
    },
    it: {
      title: 'title-it',
      subtitle: {
        subtitle: 'subtitle-it',
        badge: 'badge-it'
      }
    },
  }
  const locale = {
    es: {
      title: 'title-es',
      subtitle: {
        subtitle: 'subtitle-es',
        badge: 'badge-es'
      }
    },
    en: {
      title: 'title-en-2',
      subtitle: {
        subtitle: 'subtitle-en-2',
      },
      footer: 'footer-en-2'
    }
  }
  const merged = {
    es: {
      title: 'title-es',
      subtitle: {
        subtitle: 'subtitle-es',
        badge: 'badge-es'
      }
    },
    en: {
      title: 'title-en-2',
      subtitle: {
        subtitle: 'subtitle-en-2',
        badge: 'badge-en'
      },
      footer: 'footer-en-2'
    },
    it: {
      title: 'title-it',
      subtitle: {
        subtitle: 'subtitle-it',
        badge: 'badge-it'
      }
    },
  }
  
  it.each([
    [defaultLocale, locale, merged],
    [defaultLocale, undefined, defaultLocale],
    [undefined, locale, locale],
    [undefined,undefined, {}]
  ])('should merge labels', (defaultLocale, locale, expected) => {
    const merged = mergeLocales(locale, defaultLocale)
  
    expect(merged).toStrictEqual(expected)
  })

  it('should localize object', () => {
    expect(localizeObj(defaultLocale)).toStrictEqual({
      title: 'title-en',
      subtitle: {
        subtitle: 'subtitle-en',
        badge: 'badge-en'
      }
    })
    expect(localizeObj({es: {}})).toBeUndefined()
    expect(localizeObj({})).toBeUndefined()
    expect(localizeObj(undefined)).toBeUndefined()
  })
  it('should localize object', () => {
    const {navigator} = window
    Object.defineProperty(window, 'navigator', {writable: true, value: {language: 'it'}})
    
    expect(localizeObj(defaultLocale)).toStrictEqual({
      title: 'title-it',
      subtitle: {
        subtitle: 'subtitle-it',
        badge: 'badge-it'
      }
    })
    
    Object.defineProperty(window, 'navigator', {writable: true, value: navigator})
  })
  
  it('should be robust to wrong config', () => {
    const wrongLocale = {
      ...locale,
      en: {
        title: 'title-en-2',
        subtitle: {
          subtitle: 'subtitle-en-2',
        },
        footer: 'footer-en-2',
        wrong: 0
      }
    }
    
    // @ts-expect-error force wrong config
    expect(mergeLocales(wrongLocale, defaultLocale)).toStrictEqual(merged)
  })
  
  it('should be robust to wrong config', () => {
    const wrongLocale = {
      ...locale,
      en: {
        title: 0,
        subtitle: {
          subtitle: 'subtitle-en-2',
        },
        footer: 'footer-en-2'
      }
    }
    
    // @ts-expect-error force wrong config
    expect(mergeLocales(wrongLocale, defaultLocale)).toStrictEqual(
      {
        es: {
          title: 'title-es',
          subtitle: {
            subtitle: 'subtitle-es',
            badge: 'badge-es'
          }
        },
        en: {
          title: 'title-en',
          subtitle: {
            subtitle: 'subtitle-en-2',
            badge: 'badge-en'
          },
          footer: 'footer-en-2'
        },
        it: {
          title: 'title-it',
          subtitle: {
            subtitle: 'subtitle-it',
            badge: 'badge-it'
          }
        },
      })
  })
})
