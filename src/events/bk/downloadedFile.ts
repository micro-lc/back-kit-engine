import {factory, TransactionMeta} from '../factory'

export type DownloadedFilePayload = {
  file: string
}

/**
 * @registeredEvent
 * @title Downloaded File
 * @description notifies that a given file was downloaded, carries a transaction ID to rollback
 * @payload {
 *  file: string
 * }
 * @meta {
 *  transactionId: string
 * }
 */
export const downloadedFile = factory<DownloadedFilePayload, TransactionMeta>('downloaded-file')
