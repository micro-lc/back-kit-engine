import {factory, TransactionMeta} from '../factory'

export type DeletedFilePayload = {
  file: string
}

/**
 * @registeredEvent
 * @title Deleted File
 * @description notifies that a given file was deleted, carries a transaction ID to rollback
 * @payload {
 *  [key: string]: any
 * }
 * @meta {
 *  transactionId: string
 * }
 */
export const deletedFile = factory<DeletedFilePayload, TransactionMeta>('deleted-file')
