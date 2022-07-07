import {factory, Payload} from '../factory'

export type DeleteDataPayload = Payload

/**
 * @registeredEvent
 * @title Delete Data
 * @description notifies the request for deletion of an item
 * @payload {
 *  [key: string]: any
 * }
 */
export const deleteData = factory<DeleteDataPayload>('delete-data')
