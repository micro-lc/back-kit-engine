import {factory, Payload} from '../factory'

export type AddNewExternalPayload = Payload

/**
 * @registeredEvent
 * @title Add New External
 * @description notifies adding a new item on an external collection
 * @payload {
 *    [key: string]: any
 *}
 */
export const addNewExternal = factory<AddNewExternalPayload>('add-new-external')
