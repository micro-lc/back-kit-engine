import {randomUUID} from 'crypto'

import {skipUntil} from 'rxjs/internal/operators/skipUntil'
import {ReplaySubject} from 'rxjs/internal/ReplaySubject'

import {html, fixture} from '@open-wc/testing-helpers'
import type {Observable, Subscription} from 'rxjs'

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

function listener (this: BkComponent, eventBus: EventBus, kickoff: Observable<0>): Subscription {
  return eventBus.pipe(skipUntil(kickoff)).subscribe((event) => { this.events.push(event) })
}

class BkComponent extends BkBase {
  events: Event[] = []
  constructor () {
    super(listener)
  }

  getSubscription (): Subscription {
    return this.subscription
  }
}
customElements.define('bk-button', BkComponent)

describe('bk-base extension tests', () => {
  it('should test kickoff timer to start listening on connect/disconnect/re-connect; kickoff must be renewed', async () => {
    const randomArray = getSelfGeneratingArray()
    const eventBus: EventBus = new ReplaySubject()
    const el: BkComponent = await fixture(html`<bk-button .eventBus=${eventBus}></bk-button>`)

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
    // 4th event read after skipping 2nd and 3rd
    eventBus.next({label: randomArray.gen(), payload: {}})
    expect(el.getSubscription().closed).toBe(false)
    expect(el.events).toHaveLength(2)
    expect(el.events[0]).toHaveProperty('label', randomArray[0])
    expect(el.events[1]).toHaveProperty('label', randomArray.last())
  })
})
