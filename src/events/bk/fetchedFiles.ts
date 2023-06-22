import {
  factory, TransactionMeta
} from '../factory'

export type FetchedFilesPayload = {
  files?: Record<string, unknown>[]
}

/**
 * @registeredEvent
 * @title Fetched Files
 * @description carries result of files fetching operation
 * @payload {
 *   files: {
 *     [key: string]: unknown
 *   }[]
 * }
 * @meta {
 *   transactionId?: string
 * }
 */
export const fetchedFiles = factory<{files: Record<string, unknown>[]}, TransactionMeta>('fetched-files')
