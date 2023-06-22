import {
  factory, TransactionMeta
} from '../factory'

export type FetchFilesPayload = {
  limit?: string | number
  page?: string | number
  dateFrom?: string
}

/**
 * @registeredEvent
 * @title Fetch Files
 * @description notifies to requests to fetch files
 * @payload {
 *   limit?: string | number
 *   page?: string | number
 *   dateFrom?: string
 * }
 * @meta {
 *   transactionId?: string
 * }
 */
export const fetchFiles = factory<FetchFilesPayload, TransactionMeta>('fetch-files')
