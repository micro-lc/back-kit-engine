import {factory} from '../factory'

type ModalPayload = {
  modalId: string
}

type ModalMeta = {
  sessionId?: string
}

/**
 * @registeredEvent
 * @title Open Modal
 * @description opens a modal
 * @payload {
 *  modalId: string
 * }
 * @meta {
 *  sessionId?: string
 * }
 */
export const openModal = factory<ModalPayload, ModalMeta>('open-modal')

/**
 * @registeredEvent
 * @title Close Modal
 * @description closes a modal
 * @payload {
 *  modalId: string
 * }
 * @meta {
 *  sessionId?: string
 * }
 */
export const closeModal = factory<ModalPayload, ModalMeta>('close-modal')
