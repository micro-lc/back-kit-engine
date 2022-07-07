import {TransactionMeta} from '..'
import {factory, WithTriggeringLabelMeta} from '../factory'

export type SuccessPayload = Record<string, any>

/**
 * @registeredEvent
 * @title Success
 * @customTag success
 * @description notifies a successful action
 * @payload {}
 * @meta {
 *   triggeredBy: string
 *   transactionId: string
 * }
 */
export const eventBusSuccess = factory<SuccessPayload, WithTriggeringLabelMeta | TransactionMeta>('success')
