import type {
  Labelled,
  Payload,
  Meta,
  Event,
  EventBus
} from '../events'
import {
  EMPTY,
  identity,
  lastValueFrom,
  MonoTypeOperatorFunction,
  Observable,
  of,
  Subscription
} from 'rxjs'
import type {
  Observer,
  ReplaySubject
} from 'rxjs'
import {
  count, filter, reduce, skip, take, timeout, catchError
} from 'rxjs/operators'

export interface Factory<P extends Payload = Payload, M extends Meta = Meta> extends Labelled {
  (payload: P, meta?: M): Event<P, M>
  is: <S, A extends S, T = Meta, B extends T = T>(event: Event<S, T>) => event is Event<A, B>
  registered?: boolean
}

export type ErrorLabelledEvent<T extends Event> = Pick<Event, 'label'> & {
  error: any
  caught: Observable<T>
}

export type EventWithHandler = {
  filter: string | ((event: Event) => boolean)
  handler?: (event: Event) => void | Observable<Event> | Promise<void> | Promise<Observable<Event>>
  skip?: number
  take?: number
  throws?: boolean
  timeout?: number
}

export const DEFAULT_EVENT_TIMEOUT = 3000
export const TEST_THROW_ERROR_LABEL = 'test-error-label'

function postHandler<T> (obserableOrVoid: void | Observable<T>): Observable<T> {
  return obserableOrVoid instanceof Observable ? obserableOrVoid : EMPTY
}

function actOnEventObserver (
  resolve: (value: Observable<Event> | PromiseLike<Observable<Event>>) => void,
  reject: (reason?: any) => void,
  throws: boolean,
  throwsLabel: string,
  handler?: EventWithHandler['handler']
): Partial<Observer<Event | ErrorLabelledEvent<Event>>> {
  return {
    next: async (event: Event | ErrorLabelledEvent<Event>) => {
      try {
        if (!throws && event.label === throwsLabel) {
          reject(new Error('test wasn\'t supposed to throw but it did'))
        } else if (handler) {
          const promisedObs = await handler(event as Event)
          resolve(postHandler(promisedObs))
        } else {
          resolve(EMPTY)
        }
      } catch (error) {
        reject(error)
      }

      if (handler) {
        try {
          const promisedObs = await handler(event as Event)
          resolve(postHandler(promisedObs))
        } catch (error) {
          reject(error)
        }
      } else {
        resolve(EMPTY)
      }
    },
    error: reject
  }
}

const multiEventReducer = (eventTake: number): MonoTypeOperatorFunction<Event> => {
  if (eventTake === 1) {
    return identity
  }
  return reduce((acc, val, index) => {
    const currentLabel = acc.label ?? ''
    acc.label = currentLabel.concat(`#${val.label}`)
    Object.keys(val).filter(key => ['payload', 'meta'].includes(key))
      .forEach((key) => {
        if (acc.payload) {
          acc.payload[index] = val.payload
        } else {
          const arr = []
          arr[index] = val.payload
          Object.assign(acc, {[key]: arr})
        }

        if (acc.meta) {
          acc.meta[index] = val.meta
        } else {
          const arr = []
          arr[index] = val.meta
          Object.assign(acc, {[key]: arr})
        }
      })
    return acc
  }, {} as Event)
}

function buildFilterFromLabel<T extends Event> (eventLabel: string): (event: T) => boolean {
  return ({label}: T) => label === eventLabel
}

async function promisifyEvent (
  subscription: Subscription,
  eventBus: ReplaySubject<Event>,
  eventHandler: EventWithHandler,
  eventTimeout: number,
  throwLabel: string
): Promise<void> {
  const {
    filter: eventFilter,
    handler,
    skip: eventSkip,
    take: eventTake,
    throws = false,
    timeout: t = eventTimeout
  } = eventHandler

  return await new Promise<Observable<Event>>((resolve, reject) => {
    const obs$ = eventBus.pipe(
      timeout(t),
      filter(typeof eventFilter === 'string' ? buildFilterFromLabel(eventFilter) : eventFilter),
      skip(eventSkip ?? 0),
      take(eventTake ?? 1),
      multiEventReducer(eventTake ?? 1),
      catchError((err, caught) => of({
        label: throwLabel, error: err, caught
      }))
    )

    subscription.add(obs$.subscribe(
      actOnEventObserver(resolve, reject, throws, throwLabel, handler)
    ))

    return obs$
  }).then(
    (obs$: Observable<Event>) => { subscription.add(obs$.subscribe(ev => eventBus.next(ev))) }
  )
}

/**
 * Helper function to simplify concatenation of events within a `ReplaySubject`. It takes
 * an array of enriched events where an event has a mandatory `filter` filtering function and
 * optional `skip` parameter to reach the exact event among similar ones.
 * Also events carry a `handler` which does post-processing when the event is caught.
 * If an observable is returned than the handler
 * pipes it into the ReplaySubject. This allows to simulate action-reaction on events
 * @param eventBus the `ReplaySubject` used to pipe events
 * @param events `EventWithHandler`-type events enriched with a handler
 * @returns a `Promise` which resolves when all events have been reached and handled,
 * on error it rejects
 * @see {@link EventWithHandler}
 */
export async function actOnEvents (
  eventBus: EventBus,
  events: Array<EventWithHandler>,
  eventTimeout: number = DEFAULT_EVENT_TIMEOUT,
  throwLabel: string = TEST_THROW_ERROR_LABEL
): Promise<void[]> {
  const subscription = new Subscription()
  return Promise.all(
    events.map<Promise<void>>(
      event => promisifyEvent(subscription, eventBus, event, eventTimeout, throwLabel)
    )
  ).finally(() => { subscription.unsubscribe() })
}

export async function completeAndCount (eventBus: EventBus): Promise<number> {
  eventBus.complete()
  return lastValueFrom(eventBus.pipe(count()))
}
