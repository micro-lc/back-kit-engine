import {compile} from 'handlebars'

import type {
  EventBus, Event, Meta
} from '../events'

export type ConfigurableEvents = string | string[] | Event | Event[]

/**
 * Recursive handlebars compile and templating over an `any` JS variable
 * @param input to be compiled
 * @param context to resolve handlebars template
 * @returns
 */
export function compileObjectKeys (input: any, context?: Record<string, any>): any {
  if (input === undefined || input === null) {
    return input
  }

  if (Array.isArray(input)) {
    return input.map((el) => compileObjectKeys(el, context))
  } else {
    switch (typeof input) {
    case 'object':
      return Object.fromEntries(
        Object.entries(input).map(([k, v]) => [k, compileObjectKeys(v, context)])
      )
    case 'string':
      return compile(input)(context)
    default:
      return input
    }
  }
}

/**
 * Should send `events` to the `eventBus` after compiling the payload according with
 * an handlebars template and given context
 * @param eventBus bus to use for piping events
 * @param events configurable set of events, either their labels or an event template with compilable payload
 * @param context context to resolve handlebars references
 * @param meta additional optional meta to attach to each outgoing event
 * @returns
 */
export function parseEvents<M extends Meta = Meta> (
  eventBus: EventBus,
  events: ConfigurableEvents,
  context?: Record<string, any> | any[],
  meta?: M
): void {
  let evs = events as string[] | Event[]
  if (!Array.isArray(events)) {
    evs = [events] as string[] | Event[]
  }

  if (evs.length === 0) {
    return
  }

  switch (typeof evs[0]) {
  case 'string':
    (evs as string[]).forEach((ev) => eventBus.next({
      label: ev, payload: {}, meta
    }))
    break
  case 'object':
    (evs as any[]).forEach((event) => {
      if (event) {
        const {
          label,
          payload
        } = event
        if (typeof label === 'string' && payload) {
          eventBus.next({
            label, payload: compileObjectKeys(payload, context), meta
          })
        }
      }
    })
    break
  default:
    throw new TypeError('events must be either a string for their label or an object')
  }
}
