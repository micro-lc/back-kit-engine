import {factory, TransactionMeta} from '../factory'

type EmptyPayload = Record<string, never>

type SubmitFormMeta = {
  openingEvent: string
  formId: string
}

/**
 * @registeredEvent
 * @title Submit Form - Request
 * @description reqeusts submission of form
 * @payload {
 * }
 * @meta {
 *  openingEvent: string
 *  formId: string
 * }
 */
export const submitFormRequest = factory<EmptyPayload, SubmitFormMeta & TransactionMeta>('request', {scope: 'submit-request'})

/**
 * @registeredEvent
 * @title Submit Form - Success
 * @description notifyes correct submission of form
 * @payload {
 * }
 * @meta {
 *  transactionId?: string
 * }
 */
export const submitFormSuccess = factory<EmptyPayload, TransactionMeta>('success', {scope: 'submit-request'})
