import {factory} from '../factory'

export type CountDataPayload = {
  total: number
  pageSize: number
  pageNumber: number
}

/**
 * @registeredEvent
 * @title Count Data
 * @description sends count and pagination of current dataset
 * @payload {
 * total: number,
 * pageSize: number,
 * pageNumber: number
 *}
 */
export const countData = factory<CountDataPayload>('count-data')
