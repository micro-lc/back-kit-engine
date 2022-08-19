import {factory, Payload, TransactionMeta} from '../factory'

/**
 * @registeredEvent
 * @title Cancel
 * @description notifies operation abort via a given transactionId
 * @payload {
 * }
 * @meta {
 *   transactionId: string
 * }
 */
export const eventBusCancel = factory<Payload, TransactionMeta>('cancel')
