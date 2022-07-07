import {factory, TransactionMeta} from '../factory'

export type LookupLiveSearching = {
  property: string
  input: string
}
export type LookupLiveSearchingMeta = TransactionMeta & {
  limit: number
  dependencies?: Record<string, any | any[]>
  currentValues?: any[]
  keys?: string[]
}
export type LookupLiveFound = {
  label: string
  value: any
}[]

/**
 * @registeredEvent
 * @title Lookup Live Searching
 * @description fired upon searching on a Select form input
 * @payload {
 *    property: string
 *    input: string
 * }
 * @meta {
 *    limit: number
 *    input: {
 *      [key: string]: any[]
 *    }
 *    currentValues?: any[]
 *    keys?: string[]
 * }
 */
export const lookupLiveSearching = factory<LookupLiveSearching, LookupLiveSearchingMeta>('searching', {scope: 'lookup-data'})

/**
 * @registeredEvent
 * @title Lookup Live Found
 * @description fired when options for a Select form input are found
 * @payload {
 *    [key: string]: any[]
 * }
 */
export const lookupLiveFound = factory<LookupLiveFound, TransactionMeta>('found', {scope: 'lookup-data'})
