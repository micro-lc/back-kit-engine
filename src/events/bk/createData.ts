import {factory, Payload} from '../factory'

export type CreateDataPayload = Payload

/**
 * @registeredEvent
 * @title Create Data
 * @description notifies the request for creation of a new item and carries its value
 * @payload {
 *  [key: string]: any
 * }
 */
export const createData = factory<CreateDataPayload>('create-data')
