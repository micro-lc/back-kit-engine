import {factory, TransactionMeta} from '../factory'

export type DeleteFilePayload = {
  file: string
}

/**
 * @registeredEvent
 * @title Delete File
 * @description notifies that a given file, identified by its unique id, must be deleted
 * @payload {
 *  file: string
 * }
 * @meta {
 *  transactionId: string
 * }
 */
export const deleteFile = factory<DeleteFilePayload, TransactionMeta>('delete-file')
