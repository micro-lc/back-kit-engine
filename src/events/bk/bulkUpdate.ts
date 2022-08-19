import {factory} from '../factory'

export type BulkUpdatePayload = {
  data: Record<string, any>[]
  changes: Record<string, string | boolean>
}

/**
 * @registeredEvent
 * @title Boolean and Enums bulk update
 * @description allows to modifies enums or boolean values from an array of items
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
