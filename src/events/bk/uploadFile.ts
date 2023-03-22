import {factory, TransactionMeta, WithMetaDataMeta} from '../factory'

export type UploadFilePayload = {
  file: File
}

export type UploadFileMeta = TransactionMeta & Partial<WithMetaDataMeta>

/**
 * @registeredEvent
 * @title Upload File
 * @description requests the upload of a file and carries its data. [File](https://developer.mozilla.org/en-US/docs/Web/API/File)
 * @payload {
 *   file: File
 * }
 * @meta {
 *   metaData?: {
 *     [x: string]: string
 *   }
 * }
 */
export const uploadFile = factory<UploadFilePayload, UploadFileMeta>('upload-file')
