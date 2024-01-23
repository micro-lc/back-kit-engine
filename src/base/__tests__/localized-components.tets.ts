import {Labels, localizeObj, mergeLocale} from '../localized-components'

describe('localized-components tests - mergeLocale', () => {
  const defaultLocale = {
    title: 'title-en',
    subtitle: {
      subtitle: 'subtitle-en',
      badge: 'badge-en'
    }
  }
  const locale = {
    es: {
      title: 'title-es',
      subtitle: {
        subtitle: 'subtitle-es',
        badge: 'badge-es'
      }
    },
    it: {
      title: 'title-it',
      subtitle: {
        subtitle: 'subtitle-it'
      }
    },
    en: {
      title: 'title-en-2',
      subtitle: {
        subtitle: 'subtitle-en-2',
      },
      footer: {
        name: 'footer-en-2'
      }
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
    it: {
      title: 'title-it',
      subtitle: {
        subtitle: 'subtitle-it',
        badge: 'badge-en'
      }
    },
    en: {
      title: 'title-en-2',
      subtitle: {
        subtitle: 'subtitle-en-2',
        badge: 'badge-en'
      },
      footer: {
        name: 'footer-en-2'
      }
    }
  }
  
  it.each([
    [defaultLocale, locale.en, merged.en],
    [defaultLocale, locale.it, merged.it],
    [defaultLocale, locale.es, merged.es],
    [defaultLocale, undefined, defaultLocale],
    [undefined, locale.en, locale.en],
    [undefined, locale.it, locale.it],
    [undefined, locale.es, locale.es],
    [undefined,undefined, undefined],
  ])('should merge labels', (defaultLocale, locale, expected) => {
    const merged = mergeLocale<Labels>(locale, defaultLocale)
    expect(merged).toStrictEqual(expected)
  })

})

describe('localized-components tests - mergeLocale with non primitive types', () => {
  const defaultLocale = {
    today: 'Today-default',
    yesterday: 'Yesterday',
    monthBeforeYear: true,
    decimals: 2
  }
  const locale = {
    en: {
      today: 'Today',
      tomorrow: 'Tomorrow',
      rangePlaceholder: ['Start date', 'End date'],
      monthBeforeYear: false,
      decimals: 'None'
    },
    it: {
      today: 'Oggi',
      tomorrow: 'Domani',
      rangePlaceholder: ['Inizio', 'Fine'],
      monthBeforeYear: true,
      decimals: 1
    }
  }
  const expected = {
    en: {
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow',
      monthBeforeYear: false,
      rangePlaceholder: ['Start date', 'End date'],
      decimals: 'None'
    },
    it: {
      today: 'Oggi',
      tomorrow: 'Domani',
      yesterday: 'Yesterday',
      rangePlaceholder: ['Inizio', 'Fine'],
      monthBeforeYear: true,
      decimals: 1
    }
  }
  it.each([
    [defaultLocale, locale.en, expected.en],
    [defaultLocale, locale.it, expected.it],
  ])('should merge labels with non-string primitive types', (defaultLocale, locale, expected) => {  
    const merged = mergeLocale<Record<string, unknown>>(locale, defaultLocale)
    expect(merged).toStrictEqual(expected)
  })
})

describe('localized-components tests - mergeLocale edge cases', () => {
  it.each([
    [
      {title: 'Default'},
      {footer: 'Footer'},
      {title: 'Default', footer: 'Footer'}
    ],
    [
      {footer: 'Footer'},
      {footer: {name: 'Footer'}},
      {footer: {name: 'Footer'}}
    ],
    [
      {footer: {name: 'Default'}},
      {footer: {name: 'Footer'}},
      {footer: {name: 'Footer'}}
    ],
    [
      {footer: {name: 'Footer'}},
      {footer: {badge: 'Badge'}},
      {footer: {name: 'Footer', badge: 'Badge'}}
    ],
    [
      {footer: {name: undefined}},
      {footer: {name: undefined}},
      {footer: {name: undefined}}
    ],
    [
      {footer: {name: null}},
      {footer: {name: undefined}},
      {footer: {name: null}}
    ],
    [
      {footer: {name: undefined}},
      {footer: {name: null}},
      {footer: {name: null}}
    ],
    [
      {footer: {}},
      {footer: {}},
      {footer: {}}
    ],
    [
      {footer: {name: 'Name'}},
      {footer: {name: false}},
      {footer: {name: false}}
    ]
    
  ])('should merge labels with non-string primitive types', (defaultLocale, locale, expected) => {  
    const merged = mergeLocale<Record<string, unknown>>(locale, defaultLocale)
    expect(merged).toStrictEqual(expected)
  })
})


describe('localized-components tests - localizeObject', () => {
  it.each([
    [{en: {title: 'Title'}}, {title: 'Title'}],
    [{en: {title: 'Title'}, it: {title: 'Titolo'}}, {title: 'Title'}],
    [{it: {title: 'Titolo'}}, undefined],
    [{}, undefined],
    [undefined, undefined],
  ])('should localize object', (object, expected) => {
    expect(localizeObj(object)).toStrictEqual(expected)
  })

  it.each([
    [{en: {title: 'Title'}}, {title: 'Title'}],
    [{en: {title: 'Title'}, it: {title: 'Titolo'}}, {title: 'Titolo'}],
    [{it: {title: 'Titolo'}}, {title: 'Titolo'}],
    [{es: {title: 'Titulo'}}, undefined],
    [{}, undefined],
    [undefined, undefined],
  ])('should localize object (it)', (object, expected) => {
    const {navigator} = window
    Object.defineProperty(window, 'navigator', {writable: true, value: {language: 'it'}})
  
    expect(localizeObj(object)).toStrictEqual(expected)
    
    Object.defineProperty(window, 'navigator', {writable: true, value: navigator})
  })  
})
