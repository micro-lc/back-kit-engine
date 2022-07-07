import {html} from 'lit'
import type {FunctionComponent} from 'react'

import {
  LitCreatable,
  reactRender,
  unmount as engineUnmount
} from '../../engine'
import type {
  Bootstrapper, Listener
} from '../bk-base'
import {BkHttpBase} from '../bk-http-base'

/**
 * @superclass
 * @description embeds an http client instance in a webcomponent which renders a React component
 */
export class BkHttpComponent<P = Record<string, never>> extends BkHttpBase implements LitCreatable<P> {
  Component: FunctionComponent<P>

  create: () => P

  constructor (
    Component: FunctionComponent<P>,
    create: () => P,
    listeners?: Listener | Listener[],
    bootstrap?: Bootstrapper | Bootstrapper[]
  ) {
    super(listeners, bootstrap)
    this.Component = Component
    this.create = create.bind(this)
  }

  private _shouldRenderWhenConnected = false

  protected updated (changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties)
    reactRender.bind<(conditionalRender?: boolean) => void>(this)()
  }

  protected render () {
    return html`<slot></slot>`
  }

  connectedCallback (): void {
    if (this._shouldRenderWhenConnected) {
      reactRender.bind<(conditionalRender?: boolean) => void>(this)()
      this._shouldRenderWhenConnected = false
    }
    super.connectedCallback()
  }

  disconnectedCallback (): void {
    engineUnmount.bind<() => boolean>(this)()
    this._shouldRenderWhenConnected = true
    super.disconnectedCallback()
  }
}
