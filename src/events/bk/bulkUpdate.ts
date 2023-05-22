import {factory} from '../factory'

export type BulkUpdatePayload = {
  data: Record<string, any>[]
  changes: Record<string, string | boolean>
}

/**
 * @registeredEvent
 * @title Bulk update - Boolean and Enums
 * @description allows to modify enums or boolean values from an array of items
 * @payload {
 *   data: {
 *     [key: string]: any
 *   }[],
 *   changes: {
 *     [key: string]: string | boolean
 *   }[]
 * }
 */
export const bulkUpdate = factory<BulkUpdatePayload>('bulk-update')
