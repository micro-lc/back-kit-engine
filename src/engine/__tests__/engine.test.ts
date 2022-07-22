import React from 'react'
import ReactDOM from 'react-dom'

import type {LitCreatable} from '../engine'
import {
  reactRender, unmount
} from '../engine'

jest.requireActual('../engine')
jest.mock('react-dom', () => ({
  __esModule: true,
  default: {
    render: jest.fn(),
    unmountComponentAtNode: jest.fn()
  }
}))
jest.mock('react', () => ({
  __esModule: true,
  default: {createElement: jest.fn()}
}))

describe('reactRender tests', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  it('should render a shadowed element', () => {
    reactRender.bind({
      Component: jest.fn(),
      renderRoot: document.body,
      create: () => ({})
    } as unknown as LitCreatable<unknown>)()

    expect(React.createElement).toBeCalledTimes(1)
    expect(ReactDOM.render).toBeCalledTimes(1)
  })

  it('should not render when conditional rendering is false', () => {
    reactRender.bind({
      Component: jest.fn(),
      renderRoot: document.body,
      create: () => ({})
    } as unknown as LitCreatable<unknown>)(false)

    expect(React.createElement).not.toBeCalled()
    expect(ReactDOM.render).not.toBeCalled()
  })

  it('should not render an element created without props mapping', () => {
    reactRender.bind({
      Component: jest.fn(),
      renderRoot: document.body
    } as unknown as LitCreatable<unknown>)()

    expect(React.createElement).not.toBeCalled()
    expect(ReactDOM.render).not.toBeCalled()
  })
})

describe('unmount tests', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  it('should call react unmount', () => {
    unmount.bind({} as LitCreatable<unknown>)()
    expect(ReactDOM.unmountComponentAtNode).toBeCalled()
  })
})
