import {
  adoptStyles,
  CSSResult,
  CSSResultOrNative,
  PropertyValueMap,
  unsafeCSS
} from 'lit'
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
  protected adoptedStyleSheets: CSSResultOrNative[] = []
  #dynamicStylesheet?: string
  
  get stylesheet(): string | undefined {
    return this.#dynamicStylesheet
  }
  
  set stylesheet(s: string | undefined) {
    this.#dynamicStylesheet = s
    this.adoptedStyleSheets.push(unsafeCSS(s))
  }

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

    const {elementStyles = []} = this.constructor as unknown as {elementStyles: CSSResult[] | undefined}
    this.adoptedStyleSheets.push(
      ...elementStyles.reduce((sh, {styleSheet}) => {
        styleSheet && sh.push(styleSheet)
        return sh
      }, [] as CSSResultOrNative[])
    )
  }

  private _shouldRenderWhenConnected = false

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    super.firstUpdated(_changedProperties)
    if(typeof this.stylesheet === 'string' && this.renderRoot instanceof ShadowRoot) {
      adoptStyles(this.renderRoot, this.adoptedStyleSheets)
    }
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
