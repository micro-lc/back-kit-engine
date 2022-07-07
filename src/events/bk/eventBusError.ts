import {factory, TransactionMeta, WithTriggeringLabelMeta} from '../factory'

export type ErrorPayload = {
  error: any
}

/**
 * @registeredEvent
 * @title Error
 * @customTag error
 * @description notifies a generic error event
 * @payload {
 *    error: any
 * }
 * @meta {
 *   triggeredBy: string
 *   transactionId: string
 * }
 */
export const eventBusError = factory<ErrorPayload, WithTriggeringLabelMeta | TransactionMeta>('error')
