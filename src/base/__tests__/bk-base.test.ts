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
})
