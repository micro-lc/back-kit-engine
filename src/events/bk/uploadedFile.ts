import {factory, TransactionMeta} from '../factory'

export type UploadedFilePayload = {
  _id: string
  name: string
  file: string
  size: number
  location: string
}

/**
 * @registeredEvent
 * @title Uploaded File
 * @description returns file upload metadata, typically when storing on an external service like [files-service](https://docs.mia-platform.eu/docs/runtime_suite/files-service/configuration)
 * @payload {
 *_id: string,
 *name: string,
 *file: string,
 *size: number,
 *location: string
 * }
 */
export const uploadedFile = factory<UploadedFilePayload, TransactionMeta>('uploaded-file')
