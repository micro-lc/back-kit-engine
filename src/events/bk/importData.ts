import {factory} from '../factory'

export type ImportUserConfig = {
  file: File
  encoding?: 'utf8' | 'ucs2' | 'utf16le' | 'latin1' | 'ascii' | 'base64' | 'hex'
  delimiter?: string
  escape?: string
}

/**
 * @registeredEvent
 * @title Import Data - User Config
 * @description sends user configuration payload to perform import
 * @payload {
 *    file: File
 *    encoding?: 'utf8' | 'ucs2' | 'utf16le' | 'latin1' | 'ascii' | 'base64' | 'hex'
 *    delimiter?: string
 *    escape?: string
 * }
 */
export const importUserConfig =
  factory<ImportUserConfig>('user-config', {scope: 'import-data'})

/**
 * @registeredEvent
 * @title Import Data
 * @description raised when the import button is clicked
 * @payload {
 * }
 */
export const importData = factory('import-data')
