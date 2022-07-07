import {factory} from '../factory'

export type LoadingDataPayload = {
  loading: boolean
}

/**
 * @registeredEvent
 * @title Loading Data
 * @description notifies whether dataset is loading or not.
 *  It also advices that a dataset may be inbound
 * @payload {
 *    loading: boolean
 * }
 */
export const loadingData = factory<LoadingDataPayload>('loading-data')
