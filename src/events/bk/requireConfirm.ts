import type {ReactNode} from 'react'
import {factory} from '../factory'

type Taggable = {
  tag: string
  properties?: Record<string, any>
  children?: string | ReactNode
}

export type RequireConfirmPayload = {
  cancelText?: any
  content?: any
  okText?: any
  onCancel?: () => void
  onOk?: () => void
  title?: any
  configOk?: Taggable
  configCancel?: Taggable
}

/**
 * @registeredEvent
 * @title Require Confirm
 * @description Signals that a certain action requires confirmation to be performed
 * @payload {
 *  cancelText?: LocalizedText,
 *  content?: LocalizedText,
 *  okText?: LocalizedText,
 *  onCancel?: () => {},
 *  onOk?: () => {},
 *  title?: LocalizedText,
 *  configOk?: {
 *    tag: string,
 *    properties?: Record<string, any>
 *    children?: string | ReactNode
 *  }
 *  configCancel?:  {
 *    tag: string,
 *    properties?: Record<string, any>
 *    children?: string | ReactNode
 *  }
 * }
 */
export const requireConfirm = factory<RequireConfirmPayload>('require-confirm')
