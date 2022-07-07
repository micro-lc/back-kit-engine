import {factory} from '../factory'

export type DisplayDataPayload = {
  data: Record<string, any>[]
}

/**
 * @registeredEvent
 * @title Display Data
 * @description carries a dataset
 * @payload {
 *  data: any
 * }
 */
export const displayData = factory<DisplayDataPayload>('display-data')
