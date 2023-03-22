import {factory} from '../factory'
import type {Payload, TransactionMeta, WithFilePropertyMeta} from '../factory'

export type UpdateDataWithFilePayload = Payload


type NestingPath = {selectedKey?: string, rowIndex?: number}[]
export type UpdateDataWithFileMeta = WithFilePropertyMeta & TransactionMeta & {
  indexes?: (number[] | undefined)[]
  metaData?: (Record<string, unknown>[] | undefined)[]
  nestingPath?: NestingPath | NestingPath[]
}

/**
 * @registeredEvent
 * @title Update Data With File
 * @description update data that have one or more files within their properties,
 * the current file property is set into meta
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
export const updateDataWithFile = factory<UpdateDataWithFilePayload, UpdateDataWithFileMeta>('update-data-with-file')
