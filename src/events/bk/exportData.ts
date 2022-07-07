import {factory} from '../factory'

export type ExportDataPayload = Record<string, never>

/**
 * @registeredEvent
 * @title Export Data
 * @description raised when the export button is clicked
 * @payload {
 * }
 */
export const exportData = factory<ExportDataPayload>('export-data')
