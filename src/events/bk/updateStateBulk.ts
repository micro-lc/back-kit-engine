import {factory} from '../factory'

export type UpdateStateBulkPayload = {
  rows: any[]
  newState: string
}

/**
 * @registeredEvent
 * @title Update State Bulk
 * @description updates multiple data state (__STATE__ or _st) in a dataset
 * @payload {
 *    rows: any[],
 *    newState: string
 * }
 */
export const updateStateBulk = factory<UpdateStateBulkPayload>('update-state-bulk')
