import {factory, TransactionMeta, WithFilePropertyMeta} from '../factory'

import {UpdateDataPayload} from './updateData'

export type DownloadFilePayload = {file: string} | UpdateDataPayload
export type DownloadFileMeta = TransactionMeta | Partial<WithFilePropertyMeta> | {showInViewer?: boolean | 'skip-checks'}

/**
 * @registeredEvent
 * @title Download File
 * @description notifies that a given file must be downloaded.
 *  Payload could be either the file identifier or a structure that contains it.
 *  In the latter case, the object property to find the file must be set into the meta.
 *  It carries transaction ID to rollback.
 *  Allows to request in-browser view of the file.
 * @payload {
 *  file?: string,
 *  [key: string]: any
 * }
 * @meta {
 *  transactionId?: string
 *  property?: string
 *  showInViewer?: boolean | 'skip-checks'
 * }
 */
export const downloadFile = factory<DownloadFilePayload, DownloadFileMeta>('download-file')
