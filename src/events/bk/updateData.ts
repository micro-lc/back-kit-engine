import {factory, Payload} from '../factory'

export type UpdateDataPayload = Payload

/**
 * @registeredEvent
 * @title Update Data
 * @description notifies the request for creation of a new item and carries its value
 * @payload {
 *  [key: string]: any
 * } | {
 *  [key: string]: any
 * }[]
 * @meta {
 *    transactionId: string
 * }
 */
export const updateData = factory<UpdateDataPayload>('update-data')
