import type { FunctionComponent } from 'react'
import { createElement } from 'react'
import type { Root } from 'react-dom/client'
import { createRoot } from 'react-dom/client'

export interface LitCreatable<P = {children?: React.ReactNode}> {
  Component: FunctionComponent<P>
  computeProperties?: () => P
  container?: HTMLElement | null
  renderRoot: HTMLElement | ShadowRoot
  root?: Root
}

export function createReactRoot<P, T extends LitCreatable<P>>(this: T): void {
  const container = this.container ?? this.renderRoot
  this.root = createRoot(container)
}

export function unmount<P, T extends LitCreatable<P>>(this: T): void {
  this.root?.unmount()
}

export function reactRender<P extends Record<string, unknown>, T extends LitCreatable<P>>(
  this: T,
  ...children: React.ReactNode[]
): P | undefined {
  const { Component, computeProperties, root } = this
  const properties = computeProperties?.call(this)

  root?.render(
    createElement(Component, properties, ...children)
  )

  return properties
}
