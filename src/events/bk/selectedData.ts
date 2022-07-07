import {factory, Meta, Payload} from '../factory'

export type SelectedDataPayload = Payload
export type LookupMeta = Meta & {
  lookup?: Record<string, any>
}

/**
 * @registeredEvent
 * @title Selected Data
 * @description notifies that a single datum has been selected from a dataset
 * @payload {
 *    data: {
 *      [key: string]: any
 *    }
 * }
 */
export const selectedData = factory<SelectedDataPayload, LookupMeta>('selected-data')
