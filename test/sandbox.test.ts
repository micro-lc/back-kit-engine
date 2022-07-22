import chai, {expect} from 'chai'
import {stub} from 'sinon'
import sinonChai from 'sinon-chai'

import Sandbox from '../src/west/sandbox'

import {
  jest, randomString, resetStubs
} from './setupTests'

const {
  fn, requireActual
} = jest

chai.use(sinonChai)

describe('sandbox tests', () => {
  beforeEach(() => {
    resetStubs()
  })

  it('should create a sandbox with given imports', () => {
    requireActual.callsFake(() => ({
      method1: stub(), method2: stub()
    }))
    function sandbox () { return new Sandbox({module: ['method1', 'method2']}) }

    sandbox()
    expect(requireActual).to.be.calledTwice
  })

  it('should throw while creating the sandbox', () => {
    const error = randomString()
    requireActual.callsFake(() => { throw new Error(error) })
    function sandbox () { return new Sandbox({module: ['method1', 'method2']}) }

    expect(() => sandbox()).to.throw(`cannot require method: method1 on module: module. Sandbox constructor threw: Error: ${error}`)
  })

  it('should create a sandbox with given imports and then mock them', () => {
    requireActual.callsFake(() => ({
      method1: stub(), method2: stub()
    }))
    const sandbox = new Sandbox({module: ['method1', 'method2']})

    expect(requireActual).to.be.calledTwice

    const mockMap = sandbox.mock()
    expect(fn).to.be.calledTwice
    expect(mockMap).to.have.property('module')
    expect(mockMap.module).to.have.property('method1', fn.returnValues[0])
    expect(mockMap.module).to.have.property('method2', fn.returnValues[1])
  })

  it('should throw while mocking', () => {
    requireActual.callsFake(() => ({
      method1: stub(), method2: stub()
    }))
    const sandbox = new Sandbox({module: ['method1', 'method2']})

    const error = randomString()
    requireActual.callsFake(() => { throw new Error(error) })
    expect(() => sandbox.mock()).to.throw(`cannot require method: method1 on module: module. mock threw: Error: ${error}`)
  })

  it('should clear sandbox', () => {
    requireActual.callsFake(() => ({
      method1: stub(), method2: stub()
    }))
    const sandbox = new Sandbox({module: ['method1', 'method2']})
    sandbox.mock()
    sandbox.clearSandbox()

    expect(requireActual.callCount).to.be.equal(6)
  })

  it('should throw on clear sandbox', () => {
    requireActual.callsFake(() => ({
      method1: stub(), method2: stub()
    }))
    const sandbox = new Sandbox({module: ['method1', 'method2']})
    sandbox.mock()

    expect(requireActual.callCount).to.be.equal(4)

    const error = randomString()
    requireActual.callsFake(() => { throw new Error(error) })
    expect(() => sandbox.clearSandbox()).to.throw(`cannot require method: method1 on module: module. clearSandbox threw: Error: ${error}`)
  })
})
