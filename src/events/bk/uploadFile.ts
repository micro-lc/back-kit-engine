import {factory, TransactionMeta} from '../factory'

export type UploadFilePayload = {
  file: File
}

/**
 * @registeredEvent
 * @title Upload File
 * @description requests the upload of a file and carries its data. [File](https://developer.mozilla.org/en-US/docs/Web/API/File)
 * @payload {
 *      file: File
 *    }
 * }
 */
export const uploadFile = factory<UploadFilePayload, TransactionMeta>('upload-file')
