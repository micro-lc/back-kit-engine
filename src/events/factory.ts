import type {ReplaySubject} from 'rxjs'

import Register from './Register'

export interface Labelled {
  label: string
}

export interface Payload {
  [key: string]: any
}

export interface Meta {
  [key: string]: any
}

export interface Event<P extends Payload = Payload, M extends Meta = Meta> extends Labelled {
  payload: P
  meta?: M
}

export interface Factory<P extends Payload = Payload, M extends Meta = Meta> extends Labelled {
  (payload: P, meta?: M): Event<P, M>
  is: <T extends Event, S extends T>(event: T) => event is S
  registered?: boolean
}

export interface WithFilePropertyMeta extends Meta {
  property: string | string[]
}

export interface WithMetaDataMeta extends Meta {
  metaData: Record<string, string>
}

export interface CustomActionIdMeta extends Meta {
  actionId: string
}

export interface WithTriggeringLabelMeta extends Meta {
  triggeredBy: string
}

export interface TransactionMeta extends Meta {
  transactionId: string
}

export interface WithHashMeta extends Meta {
  hash: string
}

export type EventBus = ReplaySubject<Event<Payload, Meta>>

export type FactoryOptions = {
  scope?: string
  divider?: string
  aliases?: string | string[]
}

export const factoryRegister = new Register<Labelled>()

export function factory<P extends Payload = Payload, M extends Meta = Meta> (
  label: string, options: FactoryOptions = {}
): Factory<P, M> {
  const {
    scope, divider = '/', aliases = []
  } = options
  const scopedLabel = scope ? `${scope}${divider}${label}` : label

  const currentFactory = function currentFactory (payload: P, meta?: M): Event<P, M> {
    return {
      label: scopedLabel, payload, meta
    }
  } as Factory<P, M>

  currentFactory.label = scopedLabel
  currentFactory.is = function is<T extends Event, S extends T> (event: T): event is S {
    let akas = aliases
    if (!Array.isArray(aliases)) {
      akas = [aliases]
    }

    return [scopedLabel, ...akas].includes(event.label)
  }
  factoryRegister.add(currentFactory)

  return currentFactory
}
