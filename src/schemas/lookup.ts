import type {JSONSchema7TypeName} from 'json-schema'

import type {ConfigurableFilter} from './filter'

export interface LookupDeps {
  /** Field to which the lookup is dependent. */
  dependency: string

  /** Field in the collection of the lookup field. */
  currentCollectionProperty?: string

  /** Query desribing the dependency. */
  template?: string
}

export interface LookupOptions {
  /** Field to join on. */
  lookupValue?: string

  /** Fields to visualize. */
  lookupFields?: string[]

  /**
   * Delimiter to put between the field.
   * It applies only if lookupField is an array of more than one element.
   */
  lookupDelimiter?: string

  /** Collection to resolve the lookup on. */
  lookupDataSource?: string

  /** List of filters to apply. */
  lookupQueries?: (ConfigurableFilter & {propertyType?: JSONSchema7TypeName})[]

  /** Whether or not to add a trailing '/' to the url for the query. */
  lookupAddTrailingSlash?: boolean

  /** List of dependencies to other fields in the form. */
  lookupDeps?: LookupDeps[]

  /** Sorting option used when fetching lookup data. */
  sortOption?: string
}

export type LookupData = Record<string, unknown>[]

export interface LookupDataMap {
  [key: string]: LookupData
}
