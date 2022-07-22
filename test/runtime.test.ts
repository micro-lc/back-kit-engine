import chai, {expect} from 'chai'
import sinonChai from 'sinon-chai'

import {runtime} from '../src/west'

import {resetStubs} from './setupTests'
chai.use(sinonChai)

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const {jest: {it: jestIt}} = global

describe('it tests', () => {
  const thisIt = global.it
  beforeEach(() => {
    resetStubs()
  })

  it('should run a single test', () => {
    Object.defineProperty(global, 'it', {
      writable: true, value: jestIt
    })
    runtime.it('test 1', async () => {})

    expect(jestIt).to.have.been.calledOnce
    Object.defineProperty(global, 'it', {
      writable: true, value: thisIt
    })
  })

  it('should run multiple tests', () => {
    Object.defineProperty(global, 'it', {
      writable: true, value: jestIt
    })
    Array(10).fill(0).forEach((_, index) => {
      runtime.it(`test ${index + 1}`, async () => {})
    })

    expect(jestIt.callCount).to.be.equal(10)
    Object.defineProperty(global, 'it', {
      writable: true, value: thisIt
    })
  })

  it('should run multiple only/skip tests', () => {
    Object.defineProperty(global, 'it', {
      writable: true, value: jestIt
    })
    runtime.describe('describe 1', () => {
      runtime.it('test 1', async () => {})
      runtime.it.only('test 2', async () => {})
      runtime.it.only('test 2', async () => {})
      runtime.it.only('test 2', async () => {})
      runtime.it.only('test 2', async () => {})
      runtime.it.skip('test 2', async () => {})
      runtime.it.skip('test 2', async () => {})
    })

    expect(jestIt.callCount).to.be.equal(1)
    expect(jestIt.only.callCount).to.be.equal(4)
    expect(jestIt.skip.callCount).to.be.equal(2)
    Object.defineProperty(global, 'it', {
      writable: true, value: thisIt
    })
  })

  it('should run options tests', () => {
    Object.defineProperty(global, 'it', {
      writable: true, value: jestIt
    })
    runtime.describe('describe 1', () => {
      runtime.options({}).it('test 1', async () => {})
    })

    expect(jestIt.callCount).to.be.equal(1)
    Object.defineProperty(global, 'it', {
      writable: true, value: thisIt
    })
  })
})
