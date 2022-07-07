import {factory, Payload} from '../factory'

export type DuplicateDataPayload = Payload

/**
 * @registeredEvent
 * @title Duplicate Data
 * @description notifies the request for duplication of an item and carries its value
 * @payload {
 *  [key: string]: any
 * }
 */
export const duplicateData = factory<DuplicateDataPayload>('duplicate-data')
