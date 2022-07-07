import {factory} from '../factory'

export type UsingFormContainerPayload = {
  id: string
}

/**
 * @registeredEvent
 * @title Using Form Container
 * @description notifies that a form container with given ID is currently in use
 * @payload {
 *    id: string
 * }
 */
export const usingFormContainer = factory<UsingFormContainerPayload>('using-form-container')
