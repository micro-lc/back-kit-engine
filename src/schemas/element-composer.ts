import type {EventBus} from '../events'

export type ElementComposerProperties = {
  currentUser?: Record<string, unknown>
  headers?: HeadersInit
  eventBus?: EventBus
}
