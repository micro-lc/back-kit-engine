import {factory, Payload} from '../factory'

export type HttpDeletePayload = Payload | Payload[]

/**
 * @registeredEvent
 * @title Http Delete
 * @description notifies the request for permanent deletion of an item
 * @payload {
 *  [key: string]: any
 * } | {
 *  [key: string]: any
 * }[]
 */
export const httpDelete = factory<HttpDeletePayload>('http-delete')
