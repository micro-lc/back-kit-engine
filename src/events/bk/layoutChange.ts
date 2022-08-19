import {factory} from '@micro-lc/back-kit-engine'

export type LayoutChangePayload = {
  layout: string
}

/**
 * @registeredEvent
 * @title Change Layout
 * @description requires a layout change from `bk-layout-container`
 * @payload {
 *   layout: string
 * }
 */
export const layoutChange = factory<LayoutChangePayload>('change', {scope: 'layout'})
