import {factory} from '../factory'

export type LayoutChangePayload = {
  layout: string
}

/**
 * @registeredEvent
 * @title Layout Change
 * @description requires a layout change from `bk-layout-container`
 * @payload {
 *   layout: string
 * }
 */
export const layoutChange = factory<LayoutChangePayload>('change', {scope: 'layout'})
