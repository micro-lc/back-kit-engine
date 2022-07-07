import {factory} from '../factory'

export type SearchLookupsPayload = {
  input: string
}
export type SearchLookupsMeta = {
  limit: number
}

/**
 * @registeredEvent
 * @title Search Lookups
 * @description notifies that all lookups having `excludeFromSearch` set to false should be searched against a value
 * @payload {
 *   input: string
 * }
 * @meta {
 *   limit: number
 * }
 */
export const searchLookups = factory<SearchLookupsPayload, SearchLookupsMeta>('search-lookups')

export type SearchLookupsFoundPayload = Record<string, any>
export type SearchLookupsFoundMeta = {
  input: string
}

/**
 * @registeredEvent
 * @title Search Lookups Found
 * @description fired when values from a text search for lookups are found
 * @payload {
 *   [key: string]: any[]
 * }
 * @meta {
 *   input: string
 * }
 */
export const searchLookupsFound = factory<SearchLookupsFoundPayload, SearchLookupsFoundMeta>('search-lookups-found')
