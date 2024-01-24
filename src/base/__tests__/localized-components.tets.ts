import {mergeLabels, solveLocale} from '../localized-components'

describe('localized-components tests - solveLocale', () => {
  const locale = {
    title: {
      en: 'title-en',
      it: 'title-it',
      es: 'title-es',
    },
    subtitle: {
      subtitle: {
        en: 'subtitle-en',
        it: 'subtitle-it',
        es: 'subtitle-es',
      },
      badge: {
        en: 'badge-en',
        it: 'badge-it',
        es: 'badge-es',
      },
    }
  }
  const en = {
    title: 'title-en',
    subtitle: {
      subtitle: 'subtitle-en',
      badge: 'badge-en',
    }
  }
  const it_ = {
    title: 'title-it',
    subtitle: {
      subtitle: 'subtitle-it',
      badge: 'badge-it',
    }
  }
  const es = {
    title: 'title-es',
    subtitle: {
      subtitle: 'subtitle-es',
      badge: 'badge-es',
    }
  }
  
  it.each([
    [locale, 'en', en],
    [locale, 'it', it_],
    [locale, 'es', es],
    [locale, 'fr', en],
    [locale, undefined, en],
  ])('should solve localized texts', (locale, lang, expected) => {
    expect(solveLocale(locale, lang)).toStrictEqual(expected)
  })
})

describe('localized-components tests - solveLocale edge cases', () => {
  it('should solve localized texts', () => {
    const locale = {name: {en: 'Name'}, badge: {id: 0, monthBefore: true, range: ['start', 'end'], text: {en: 'Text'}}}
    const expected = {name: 'Name', badge: {id: 0, monthBefore: true, range: ['start', 'end'], text: 'Text'}}
    
    // @ts-expect-error force unorthodox locale
    expect(solveLocale(locale)).toStrictEqual(expected)
  })
  
  it('localized-components tests - solveLocale default language kicks in', () => {
    const {navigator} = window
    Object.defineProperty(window, 'navigator', {writable: true, value: {language: undefined}})
    expect(solveLocale({name: {en: 'Name', it: 'Nome'}})).toStrictEqual({name: 'Name'})
    Object.defineProperty(window, 'navigator', {writable: true, value: navigator})
  })
})

describe('localized-components tests - mergeLables', () => {
  it.each([
    [
      {title: 'Title', subtitle: {name: 'Subtitle-new'}},
      {subtitle: {name: 'Subtitle'}},
      {title: 'Title', subtitle: {name: 'Subtitle-new'}}
    ],
    [
      {subtitle: {name: 'Subtitle-new'}},
      {title: 'Title', subtitle: {name: 'Subtitle'}},
      {title: 'Title', subtitle: {name: 'Subtitle-new'}}
    ],
    [
      {title: 'Title', subtitle: {name: 'Subtitle-new'}},
      {subtitle: 'Subtitle'},
      {title: 'Title', subtitle: {name: 'Subtitle-new'}}
    ],
    [
      {title: 'Title', subtitle: {name: 'Subtitle-new'}},
      {title: 'Title', subtitle: {badge: 'Badge'}},
      {title: 'Title', subtitle: {name: 'Subtitle-new', badge: 'Badge'}}
    ],
    [{title: 'Title', subtitle: 'Subtitle-new'}, {subtitle: 'Subtitle'}, {title: 'Title', subtitle: 'Subtitle-new'}],
    [{title: 'Title'}, {subtitle: 'Subtitle'}, {title: 'Title', subtitle: 'Subtitle'}],
    [{}, {title: 'Title'}, {title: 'Title'}],
    [{title: 'Title'}, {}, {title: 'Title'}],
    [{title: 'Title'}, undefined, {title: 'Title'}],
    [undefined, {title: 'Title'}, {title: 'Title'}],
    [undefined, undefined, undefined],
  ])('should merge labels', (labels, defaultLabels, expected) => {
    expect(mergeLabels(labels, defaultLabels)).toStrictEqual(expected)
  })
})
