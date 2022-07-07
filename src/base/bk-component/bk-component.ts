import {html} from 'lit'
import type {FunctionComponent} from 'react'

import {
  reactRender,
  unmount as engineUnmount,
  LitCreatable
} from '../../engine'
import {BkBase} from '../bk-base'
import type {
  Bootstrapper, Listener
} from '../bk-base'

/**
 * @superclass
 * @description BackOffice library react-rendering component superclass
 * for Lit-based webcomponents. Extends `BkBase` and its properties
 */
export class BkComponent<P = Record<string, never>> extends BkBase implements LitCreatable<P> {
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
