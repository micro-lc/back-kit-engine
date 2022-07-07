import {factory, Payload, WithFilePropertyMeta} from '../factory'

export type UpdateDataWithFilePayload = Payload

/**
 * @registeredEvent
 * @title Update Data With File
 * @description update data that have one or more files within their properties,
 * the current file property is set into meta
 * @payload {
 *    data: {
 *      [key: string]: any
 *    }
 * }
 * @meta {
 *    property: string
 * }
 */
export const updateDataWithFile = factory<UpdateDataWithFilePayload, WithFilePropertyMeta>('update-data-with-file')
