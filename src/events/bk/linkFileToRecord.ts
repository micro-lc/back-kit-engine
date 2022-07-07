import {factory, WithFilePropertyMeta} from '../factory'

import {UpdateDataWithFilePayload} from './updateDataWithFile'

export type LinkFileToRecordPayload = UpdateDataWithFilePayload

/**
 * @registeredEvent
 * @title Link File To Record
 * @description sends file upload data
 * @payload {
 *    data: {
 *      [key: string]: any
 *    }
 * }
 * @meta {
 *    property: string
 * }
 */
export const linkFileToRecord = factory<LinkFileToRecordPayload, WithFilePropertyMeta>('link-file-to-record')
