import {factory} from '../factory'

export type SelectedDataBulkPayload = {
  data: Record<string, any>[]
}

/**
 * @registeredEvent
 * @title Selected Data Bulk
 * @description notifies data selection in a dataset
 * @payload {
 *  data: Array<{
 *      [key: string]: any
 *    }>
 * }
 */
export const selectedDataBulk = factory<SelectedDataBulkPayload>('selected-data-bulk')
