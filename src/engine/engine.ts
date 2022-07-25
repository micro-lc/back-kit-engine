import type {FunctionComponent} from 'react'
import React from 'react'
import ReactDOM from 'react-dom'

export interface LitCreatable<P = {children?: React.ReactNode}> {
  container?: HTMLElement | null
  renderRoot: HTMLElement | ShadowRoot
  Component: FunctionComponent<P>
  create?: () => P
}

export function unmount<P, T extends LitCreatable<P>> (this: T): boolean {
  const {
    container: c, renderRoot
  } = this

  let container = renderRoot
  if(c) {
    container = c
  }

  return ReactDOM.unmountComponentAtNode(container as HTMLElement)
}

export function reactRender<P, T extends LitCreatable<P>> (
  this: T,
  conditionalRender = true,
  ...children: React.ReactNode[]
): P | undefined {
  const {
    Component, create, container: c, renderRoot
  } = this

  let container = renderRoot
  if(c) {
    container = c
  }

  const props = create?.call(this)
  if (props && conditionalRender) {
    ReactDOM.render(
      React.createElement(Component, {...props}, ...children),
      container
    )
  }
  return props
}
