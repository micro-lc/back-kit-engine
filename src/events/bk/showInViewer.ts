import {factory} from '../factory'

export type ShowInViewerPayload = {
  show: boolean
  url: string
}

/**
 * @registeredEvent
 * @title Show In Viewer
 * @description notifies the request for starting/updating the visualization of a PDF file
 * @payload {
 *  show: boolean,
 *  url: string
 * }
 */
export const showInViewer = factory<ShowInViewerPayload>('show-in-viewer')
