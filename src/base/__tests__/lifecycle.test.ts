import {randomUUID} from 'crypto'

import {ReplaySubject} from 'rxjs/internal/ReplaySubject'

import {html, fixture} from '@open-wc/testing-helpers'
import {html as lithtml} from 'lit'
import type {Subscription} from 'rxjs'

import type {EventBus, Event} from '../../events/factory'
import {BkBase} from '../bk-base'

type SelfGeneratingArray = string[] & {
  gen(): string
  last(): string | undefined
}

function getSelfGeneratingArray (): SelfGeneratingArray {
  const randomArray = [] as string[]
  Object.defineProperty(randomArray, 'gen', {
    value: function (this: string[]): string {
      const next = randomUUID()
      this.push(next)
      return next
    }
  })
  Object.defineProperty(randomArray, 'last', {
    value: function (this: string[]): string {
      return this[this.length - 1]
    }
  })

  return randomArray as SelfGeneratingArray
}

function listener (this: BkButton, eventBus: EventBus): Subscription {
  return eventBus.subscribe((event) => { this.events.push(event) })
}

class BkButton extends BkBase {
  events: Event[] = []
  constructor () {
    super(listener)
  }

  getSubscription (): Subscription {
    return this.subscription
  }

  protected render (): unknown {
    return lithtml`<button>Click me!</button>`
  }
}
customElements.define('bk-button', BkButton)

describe('bk-base extension tests', () => {
  it('should test lifecycle features on connect/disconnect/re-connect; subscription must be renewed', async () => {
    const randomArray = getSelfGeneratingArray()
    const eventBus: EventBus = new ReplaySubject()
    const el: BkButton = await fixture(html`<bk-button .eventBus=${eventBus}></bk-button>`)

    // no event read yet
    expect(el.events).toHaveLength(0)

    // publish one event
    eventBus.next({label: randomArray.gen(), payload: {}})
    expect(el.events).toHaveLength(1)

    const {parentElement} = el
    el.remove()
    expect(el.getSubscription().closed).toBe(true)

    // unread event
    eventBus.next({label: randomArray.gen(), payload: {}})
    expect(el.events).toHaveLength(1)
    expect(el.events[0]).toHaveProperty('label', randomArray[0])

    // reconnect and read from the start
    parentElement?.appendChild(el)
    expect(el.getSubscription().closed).toBe(false)
    expect(el.events).toHaveLength(3)
    expect(el.events[1]).toHaveProperty('label', randomArray[0])
    expect(el.events[2]).toHaveProperty('label', randomArray.last())
  })

  it('should test lifecycle features on connect/disconnect/re-connect; eventBus swapping', async () => {
    const randomArray = getSelfGeneratingArray()
    const el: BkButton = await fixture(html`<bk-button></bk-button>`)

    // no event read yet
    expect(el.events).toHaveLength(0)

    const eventBus: EventBus = new ReplaySubject()
    // publish one event
    eventBus.next({label: randomArray.gen(), payload: {}})
    expect(el.events).toHaveLength(0)

    // after `connectedCallback` eventBus injection
    expect(el.isConnected).toBe(true)
    el.eventBus = eventBus
    expect(el.events).toHaveLength(1)
    expect(el.events[0]).toHaveProperty('label', randomArray.last())

    // `eventBus` swapping
    const customEventBus: EventBus = new ReplaySubject()
    el.eventBus = customEventBus

    // publish the same event on two buses
    const event = {label: randomArray.gen(), payload: {}}
    eventBus.next(event)
    customEventBus.next(event)
    expect(el.events).toHaveLength(2)
    expect(el.events[1]).toHaveProperty('label', randomArray.last())

    // then disconnect
    const {parentElement} = el
    el.remove()
    expect(el.getSubscription().closed).toBe(true)

    // if I swap the event bus without reconnecting
    // no listener should be added
    const anotherCustomBus: EventBus = new ReplaySubject()
    el.eventBus = anotherCustomBus
    anotherCustomBus.next({label: randomArray.gen(), payload: {}})
    expect(el.getSubscription().closed).toBe(true)
    expect(el.events).toHaveLength(2)

    // then while re-connecting all new subscription should be instanciated
    // and the events are being read again from latest eventBus only
    parentElement?.appendChild(el)
    expect(el.getSubscription().closed).toBe(false)
    expect(el.events).toHaveLength(3)
    expect(el.events[2]).toHaveProperty('label', randomArray.last())

    eventBus.next({label: randomArray.gen(), payload: {}})
    customEventBus.next({label: randomArray.gen(), payload: {}})
    expect(el.events).toHaveLength(3)
  })
})
