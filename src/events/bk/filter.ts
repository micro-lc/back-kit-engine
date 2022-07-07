import {factory} from '../factory'

export type FilterPayload = Record<string, never>

/**
 * @registeredEvent
 * @title Filter
 * @description notifies opening of UI component that handles form creation
 * @payload {}
 */
export const filter = factory<FilterPayload>('filter')
