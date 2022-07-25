import {
  adoptStyles,
  CSSResult,
  CSSResultOrNative,
  PropertyValueMap,
  unsafeCSS
} from 'lit'
import {property} from 'lit/decorators.js'
import type {FunctionComponent} from 'react'
import React from 'react'

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
export class BkComponent<P = {children?: React.ReactNode}> extends BkBase implements LitCreatable<P> {
  protected _adoptedStyleSheets: CSSResultOrNative[] = []
  #dynamicStylesheet?: string
  
  @property()
  set stylesheet(s: string | undefined) {
    this.#dynamicStylesheet = s
    this._adoptedStyleSheets.push(unsafeCSS(s))
  }

  get stylesheet(): string | undefined {
    return this.#dynamicStylesheet
  }
  
  Component: FunctionComponent<P>

  create?: () => P

  constructor (
    Component: FunctionComponent<P> = React.Fragment,
    create?: () => P,
    listeners?: Listener | Listener[],
    bootstrap?: Bootstrapper | Bootstrapper[]
  ) {
    super(listeners, bootstrap)
    this.Component = Component
    create && (this.create = create.bind(this))

    const {elementStyles = []} = this.constructor as unknown as {elementStyles: CSSResult[] | undefined}
    this._adoptedStyleSheets.push(
      ...elementStyles.reduce((sh, {styleSheet}) => {
        styleSheet && sh.push(styleSheet)
        return sh
      }, [] as CSSResultOrNative[])
    )
    this._adoptedStyleSheets.push(unsafeCSS(this.style.cssText))
  }

  private _shouldRenderWhenConnected = false

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    super.firstUpdated(_changedProperties)
    if(typeof this.stylesheet === 'string' && this.renderRoot instanceof ShadowRoot) {
      adoptStyles(this.renderRoot, this._adoptedStyleSheets)
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
