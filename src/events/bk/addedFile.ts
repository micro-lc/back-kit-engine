import {factory} from '../factory'
import type {Payload, TransactionMeta, WithFilePropertyMeta} from '../factory'

export type AddFilePayload = Payload

export type AddedFileMeta = WithFilePropertyMeta & TransactionMeta & {
  metaData?: (Record<string, string>[] | undefined)[]
}

/**
 * @registeredEvent
 * @title Added File
 * @description notifies a file was selected by the user, possibily specifying metadata
 * @payload {
 *   file: File
 *}
 * @meta {
 *    property: string,
 *    metaData: {[x: sting]?: string}[]
 * }
 */
export const addedFile = factory<AddFilePayload, AddedFileMeta>('added-file')
