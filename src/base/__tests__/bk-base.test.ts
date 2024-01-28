import {
  fixture, html
} from '@open-wc/testing-helpers'
import {ReplaySubject} from 'rxjs'

import type {
  Event, EventBus
} from '../../events'
import {BkBase} from '../bk-base/bk-base'
import type {
  Listener, Bootstrapper
} from '../bk-base/bk-base'

const tag = 'bk-base-test-tag'
customElements.define(tag, BkBase)

describe('bk-base tests', () => {
  it('should spawn bk-base without an eventBus or listeners/bootsrappers', () => {
    const base = new BkBase()

    expect(base.eventBus).toBeUndefined()
    base.eventBus = undefined
    expect(base.eventBus).toBeUndefined()
  })

  it('should spawn bk-base without an eventBus and bind it to listeners/bootsrappers when set', () => {
    const listener = jest.fn() as Listener
    const bootsrapper = jest.fn() as Bootstrapper
    const base = new BkBase(listener, bootsrapper)

    expect(base.eventBus).toBeUndefined()
    base.eventBus = new ReplaySubject<Event>()
    expect(listener).toBeCalled()
    expect(bootsrapper).toBeCalled()
  })

  it('should spawn bk-base without an eventBus and bind it to multiple listeners/bootsrappers when set', () => {
    const listener = jest.fn() as Listener
    const bootsrapper = jest.fn() as Bootstrapper
    const base = new BkBase([listener], [bootsrapper])

    expect(base.eventBus).toBeUndefined()
    base.eventBus = new ReplaySubject<Event>()
    expect(listener).toBeCalled()
    expect(bootsrapper).toBeCalled()
  })

  it('should disconnect', async () => {
    const eventBus = new ReplaySubject<Event>() as EventBus
    const el: BkBase = await fixture(html`<bk-base-test-tag .eventBus=${eventBus}></bk-base-test-tag>`)
    expect(document.body.outerHTML).toEqual('<body><div><!----><bk-base-test-tag></bk-base-test-tag></div></body>')
    expect(el.eventBus).toBeDefined()
    el.remove()
    expect(document.body.outerHTML).toEqual('<body><div><!----></div></body>')
  })
  
  describe('localized-component tests', () => {
    it('should not localize', () => {
      const base = new BkBase()
      // @ts-expect-error access private field
      expect(base.defaultLocale).toBeUndefined()
      expect(base.customLocale).toBeUndefined()
      expect(base.locale).toBeUndefined()
    })

    it('should localize', async () => {
      const base = new BkBase()
      base.customLocale = {
        title: {en: 'Title', it: 'Titolo'},
        subtitle: {en: 'Subtitle'}
      }
      expect(base.locale).toStrictEqual({title: 'Title', subtitle: 'Subtitle'})
    })
    
    it('should localize with default', () => {
      const base = new BkBase()
      // @ts-expect-error access private field
      base.defaultLocale = {title: 'Title', subtitle: 'Subtitle'}
      base.customLocale = {
        title: {en: 'Title-custom', it: 'Titolo-custom'},
        subtitle: {it: 'Sottotitolo-custom'}
      }
      expect(base.locale).toStrictEqual({title: 'Title-custom', subtitle: 'Subtitle'})
    })
    
    it('should initialize localize', () => {
      const base = new BkBase()
      // @ts-expect-error access private field
      base.defaultLocale = {title: 'Title', subtitle: 'Subtitle'}
      base.locale = {title: 'Title2'}
      expect(base.locale).toStrictEqual({title: 'Title2'})
    })

    it('should localize (it)', async () => {
      const {navigator} = window
      Object.defineProperty(window, 'navigator', {writable: true, value: {language: 'it'}})

      const base = new BkBase()
      base.customLocale = {
        title: {en: 'Title', it: 'Titolo'},
        subtitle: {en: 'Subtitle'}
      }
      expect(base.locale).toStrictEqual({title: 'Titolo', subtitle: 'Subtitle'})

      Object.defineProperty(window, 'navigator', {writable: true, value: navigator})
    })
    
    it('should localize with default (it)', () => {
      const {navigator} = window
      Object.defineProperty(window, 'navigator', {writable: true, value: {language: 'it'}})
      
      const base = new BkBase()
      // @ts-expect-error access private field
      base.defaultLocale = {title: 'Title', subtitle: 'Subtitle'}
      base.customLocale = {
        title: {en: 'Title-custom'},
        subtitle: {it: 'Sottotitolo-custom'}
      }
      expect(base.locale).toStrictEqual({title: 'Title-custom', subtitle: 'Sottotitolo-custom'})
      
      Object.defineProperty(window, 'navigator', {writable: true, value: navigator})
    })
  })
})
