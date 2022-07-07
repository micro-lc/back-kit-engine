import type {FunctionComponent} from 'react'
import {createElement} from 'react'
import {
  render, unmountComponentAtNode
} from 'react-dom'

export interface LitCreatable<P = Record<string, never>> {
  renderRoot: HTMLElement | ShadowRoot
  Component: FunctionComponent<P>
  create?: () => P
}

export function unmount<P, T extends LitCreatable<P>> (this: T): boolean {
  return unmountComponentAtNode(this.renderRoot)
}

export function reactRender<P, T extends LitCreatable<P>> (
  this: T,
  conditionalRender = true
): P | undefined {
  const {
    Component, create
  } = this
  const props = create?.bind(this)()
  if (props && conditionalRender) {
    render(
      createElement(Component, {...props}),
      this.renderRoot
    )
  }
  return props
}
