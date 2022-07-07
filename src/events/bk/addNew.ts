import {factory, Payload} from '../factory'

export type AddNewPayload = Payload

/**
 * @registeredEvent
 * @title Add New
 * @description notifies adding a new item
 * @payload {
 *    [key: string]: any
 *}
 */
export const addNew = factory<AddNewPayload>('add-new')
