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
})
