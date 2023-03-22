import {factory} from '../factory'
import type {Payload, TransactionMeta, WithFilePropertyMeta} from '../factory'

export type CreateDataWithFilePayload = Payload

type NestingPath = {selectedKey?: string, rowIndex?: number}[]
export type CreateDataWithFileMeta = WithFilePropertyMeta & TransactionMeta & {
  indexes?: (number[] | undefined)[]
  metaData?: (Record<string, string>[] | undefined)[]
  nestingPath?: NestingPath | NestingPath[]
}

/**
 * @registeredEvent
 * @title Create Data With File
 * @description create data that have one or more files within their properties,
 *  the current file property is set into meta
 * @payload {
 *    data: {
 *      [key: string]: any
 *    }
 * }
 * @meta {
 *    property: string
 *    indexes?: (number[] | undefined)[]
 *    metaData?: {[x: string]?: string}[]
 *    nestingPath?: {selectedKey: string, rowIndex: number}[] | {selectedKey: string, rowIndex: number}[][]
 * }
 */
export const createDataWithFile = factory<CreateDataWithFilePayload, CreateDataWithFileMeta>('create-data-with-file')
