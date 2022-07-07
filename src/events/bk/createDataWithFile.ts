import {factory, Payload, WithFilePropertyMeta} from '../factory'

export type CreateDataWithFilePayload = Payload

/**
 * @registeredEvent
 * @title Create Data With File
 * @description create data that have one or more files within their properties,
 *  the current file property is set into meta
 * @payload {
 *    data: {
 *      [key: string]: any
 *    }
 * }
 * @meta {
 *    property: string
 * }
 */
export const createDataWithFile = factory<CreateDataWithFilePayload, WithFilePropertyMeta>('create-data-with-file')
