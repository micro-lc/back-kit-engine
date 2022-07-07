import 'jest'

export type MockReact = {
  createElement: jest.Mock
  render: jest.Mock
  unmountComponentAtNode: jest.Mock
}
export type ActualReact = {
  createElement: any
  render: any
  unmountComponentAtNode: any
}

export type MethodsToMockByModule = Record<string, string[]>
export type MocksMap<K extends string = keyof MethodsToMockByModule> =
  Record<K, Record<string, jest.Mock>>

export default class Sandbox {
  private mocksMap: MethodsToMockByModule

  private actuals: MocksMap = {}

  constructor (mocksMap: MethodsToMockByModule) {
    this.mocksMap = mocksMap
    Object.entries(mocksMap).reduce(
      (acc: MocksMap, [module, methods]: [string, string[]]) => {
        methods.forEach((method) => {
          try {
            const actual = jest.requireActual(module)[method]
            if (acc[module]) {
              acc[module][method] = actual
            } else {
              acc[module] = {[method]: actual}
            }
          } catch (err) {
            throw new Error(`cannot require method: ${method} on module: ${module}. Sandbox constructor threw: ${err}`)
          }
        })
        return acc
      }, this.actuals
    )
  }

  mock (): MocksMap {
    return Object.entries(this.mocksMap).reduce(
      (mocks: MocksMap, [module, methods]: [string, string[]]) => {
        methods.forEach((method) => {
          try {
            const mock = jest.fn()
            jest.requireActual(module)[method] = mock
            if (mocks[module]) {
              // eslint-disable-next-line no-param-reassign
              mocks[module][method] = mock
            } else {
              // eslint-disable-next-line no-param-reassign
              mocks[module] = {[method]: mock}
            }
          } catch (err) {
            throw new Error(`cannot require method: ${method} on module: ${module}. mock threw: ${err}`)
          }
        })
        return mocks
      }, {}
    )
  }

  clearSandbox (): void {
    Object.entries(this.mocksMap).forEach(([module, methods]) => {
      methods.forEach((method) => {
        try {
          jest.requireActual(module)[method] = this.actuals[module][method]
        } catch (err) {
          throw new Error(`cannot require method: ${method} on module: ${module}. clearSandbox threw: ${err}`)
        }
      })
    })
    this.actuals = {}
  }
}
