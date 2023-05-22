import {factory, TransactionMeta} from '../factory'

interface Option<T = any> {
  label: string
  value: T
}

export type ExportDataPayload = Record<string, never>

export type CSVSeparator = 'COMMA' | 'SEMICOLON'

export type ExportType = 'json' | 'csv' | 'html' | 'xlsx'

export type ExportFiltering = 'all' | 'filtered' | 'selected'

export type AwaitUserConfig = {
  total?: number
  selected?: number
  columns: Option[]
}

export type ExportUserConfig = {
  exportType: ExportType
  csvSeparator?: CSVSeparator
  filters: ExportFiltering
  columns: string[]
}

/**
 * @registeredEvent
 * @title Export Data - Request Config
 * @description prompts for export configuration payload
 * @payload {
 *   total?: number
 *   selected?: number
 *   columns: {
 *     label: string
 *     value: T
 *   }[]
 * }
 * @meta {
 *   transactionId?: string
 * }
 */
export const awaitingForExportConfiguration =
  factory<AwaitUserConfig, TransactionMeta>('awaiting-config', {scope: 'export-data'})

/**
 * @registeredEvent
 * @title Export Data - User Config
 * @description sends user configuration payload to perform export
 * @payload {
 *   exportType: 'json' | 'csv' | 'html' | 'xlsx'
 *   csvSeparator?: 'COMMA' | 'SEMICOLON'
 *   filters: 'all' | 'filtered' | 'selected'
 *   columns: string[]
 * }
 * @meta {
 *   transactionId?: string
 * }
 */
export const exportUserConfig =
  factory<ExportUserConfig, TransactionMeta>('user-config', {scope: 'export-data'})

/**
 * @registeredEvent
 * @title Export Data
 * @description raised when the export button is clicked
 * @payload {
 * }
 */
export const exportData = factory<ExportDataPayload>('export-data')
