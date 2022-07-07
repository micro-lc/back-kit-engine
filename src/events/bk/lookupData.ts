import {factory} from '../factory'

export type LookupDataPayload = Record<string, any>[]
export type LookupDataMeta = {
  dataOrigin?: string
}

/**
 * @registeredEvent
 * @title Lookup Data
 * @description carries lookup data information and dataset
 * @payload {
 *    [key: string]: any[]
 * }
 * @meta {
 *    dataOrigin?: string
 * }
 */
export const lookupData = factory<LookupDataPayload, LookupDataMeta>('lookup-data')
