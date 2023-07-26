import {factory, Payload} from '../factory'

export type ImportDataPayload = Payload

/**
 * @registeredEvent
 * @title Import Data
 * @description raised when the import button is clicked
 * @payload {
 * }
 */
export const importData = factory<ImportDataPayload>('import-data')
