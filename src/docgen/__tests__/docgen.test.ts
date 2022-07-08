import {generateComponents} from '../components'
import {generateEvents} from '../events'
import {main} from '../start'

jest.mock('typedoc', () => ({
  ...jest.requireActual('typedoc'),
  Application: class Application {
    options = {addReader: jest.fn()}
    bootstrap = jest.fn()
    convert() {return 'project'}
  }
}))
jest.mock('../components', () => ({generateComponents: jest.fn()}))
jest.mock('../events', () => ({generateEvents: jest.fn()}))

describe('docgen tests', () => {
  it('startup on components', async () => {
    const proc = {argv: [undefined, undefined, '--type', 'components']}
    
    await main(proc as NodeJS.Process)

    expect(generateComponents).toBeCalledWith('project', undefined, undefined)
  })
  it('startup on events', async () => {
    const proc = {argv: [undefined, undefined, '--type', 'events']}
    
    await main(proc as NodeJS.Process)

    expect(generateEvents).toBeCalledWith('project', undefined)
  })
  it('should throw on console', async () => {
    const {error} = console
    const mockedError = jest.fn()
    Object.defineProperty(console, 'error', {
      writable: true, value: mockedError
    })

    const proc = {
      argv: [undefined, undefined], exit: jest.fn()
    }
    
    await main(proc as unknown as NodeJS.Process)

    expect(mockedError).toBeCalledWith('specify one type: events, components')
    expect(proc.exit).toBeCalledWith(1)

    Object.defineProperty(console, 'error', {
      writable: true, value: error.bind(console)
    })
  })
})
