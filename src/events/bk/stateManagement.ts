import {factory} from '../factory'

export type PushStatePayload = {
  data: Record<string, any>[]
  origin: Record<string, any>
  selectedKey?: string
  rowIndex?: number
  isObject?: boolean
  readonly?: boolean
}
export type BackStatePayload = {steps?: number}

export type DisplayStatePayload = {
  data?: Record<string, any>[]
  from?: number
  to?: number
  sort?: number[]
}
export type DisplayStateMeta = {
  keys?: string[]
}
/**
 * @registeredEvent
 * @title Nested Navigation State - Push
 * @description adds a new level of nesting
 * @payload {
 *    data: Record<string, any>[]
 *    origin: Record<string, any>
 *    selectedKey?: string
 *}
 */
export const pushState = factory<PushStatePayload>('push', {scope: 'nested-navigation-state'})

/**
 * @registeredEvent
 * @title Nested Navigation State - Go Back
 * @description goes back an arbitrary number of levels of nesting
 * @payload {
 *    steps?: number
 *}
 */
export const backState = factory<BackStatePayload>('back', {scope: 'nested-navigation-state'})

/**
 * @registeredEvent
 * @title Nested Navigation State - Display
 * @description displays data or a slice of data
 * @payload Array<{
 *    data: Record<string, any>[]
 *    from?: number
 *    to?: number
 *    sort?: number[]
 *}>
 * @meta {
 *    keys?: string[]
 * }
 */
export const displayState = factory<DisplayStatePayload, DisplayStateMeta>('display', {scope: 'nested-navigation-state'})
