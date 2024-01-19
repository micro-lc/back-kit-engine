import {
  CSSResultOrNative,
  PropertyValueMap,
  unsafeCSS
} from 'lit'
import {property} from 'lit/decorators.js'
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
import {Labels} from '../localized-components'
import {
  adoptStylesheet,
  adoptStylesOnShadowRoot,
  StyledComponent
} from '../styled-components'

/**
 * @superclass
 * @description BackOffice library react-rendering component superclass
 * for Lit-based webcomponents. Extends `BkBase` and its properties
 */
export class BkComponent<P = {children?: React.ReactNode}, L extends Labels = Labels>
  extends BkBase<L> implements LitCreatable<P>, StyledComponent {
  protected dynamicStyleSheet?: string
  _adoptedStyleSheets: CSSResultOrNative[] = []

  @property()
  set stylesheet(s: string | undefined) {
    this.dynamicStyleSheet = s
    this._adoptedStyleSheets.push(unsafeCSS(s))
  }

  get stylesheet(): string | undefined {
    return this.dynamicStyleSheet
  }
  
  Component: FunctionComponent<P>

  create?: () => P

  constructor (
    Component: FunctionComponent<P>,
    create?: () => P,
    listeners?: Listener | Listener[],
    bootstrap?: Bootstrapper | Bootstrapper[]
  ) {
    super(listeners, bootstrap)
    this.Component = Component
    create && (this.create = create.bind(this))

    adoptStylesheet.call(this)
  }

  private _shouldRenderWhenConnected = false

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    super.firstUpdated(_changedProperties)
    adoptStylesOnShadowRoot.call(this)
  }

  protected updated (changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties)
    reactRender.bind<(conditionalRender?: boolean) => void>(this)()
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
