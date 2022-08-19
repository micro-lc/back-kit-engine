import type {Payload, TransactionMeta} from '@micro-lc/back-kit-engine'
import {factory} from '@micro-lc/back-kit-engine'

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
