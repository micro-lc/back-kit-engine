import chai, {expect} from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {TemplateResult} from 'lit'
import {stub} from 'sinon'
import sinonChai from 'sinon-chai'

import type {LitRuntimeHelpers} from '../src/west/testWrapper'
import {test} from '../src/west/testWrapper'

import {
  jest, openWC, randomString, resetStubs
} from './setupTests'

chai.use(sinonChai)
chai.use(chaiAsPromised)

const {
  fn, useFakeTimers, clearAllTimers, clearAllMocks, useRealTimers, advanceTimersByTime
} = jest
const {
  fixture, fixtureCleanup
} = openWC

describe('testWrapper tests', () => {
  beforeEach(() => {
    resetStubs()
    fn.callsFake(() => {
      const callable = stub()
      Object.defineProperty(callable, 'mockImplementation', {value: stub().callsFake((impl: any) => impl)})
      Object.defineProperty(callable, 'mockReturnValue', {value: () => stub().callsFake(() => 'en-US')})
      return callable
    })

    Object.defineProperty(global, 'window', {
      writable: true, value: {history: {}}
    })
    Object.defineProperty(global, 'navigator', {
      writable: true, value: {}
    })
  })

  afterEach(() => {
    expect(fixtureCleanup).to.be.called
  })

  it('should catch test throw', async () => {
    const error = randomString()

    async function runner () { return Promise.reject<void>(error) }

    await expect(test(runner)()).to.eventually.rejectedWith(`helpers threw in test runtime: ${error}`)
  })

  it('should run the test', async () => {
    async function runner (helpers: LitRuntimeHelpers<Element>) {
      const {mocks} = helpers
      expect(useFakeTimers).to.be.calledOnce
      expect(clearAllTimers).to.be.calledOnce
      expect(mocks).to.be.empty
    }

    await test(runner)()
    expect(clearAllMocks).to.be.calledOnce
    expect(useRealTimers).to.be.calledOnce
  })

  it('should not use fake timers if relative option is `false`', async () => {
    async function runner () {
      expect(useFakeTimers).not.to.be.called
      expect(clearAllTimers).not.to.be.called
    }

    await test(runner, {fakeTimers: false})()
    expect(clearAllMocks).to.be.calledOnce
    expect(useRealTimers).not.to.be.called
  })

  it('should throw when nthCall points to a non-mocked function', async () => {
    async function runner (helpers: LitRuntimeHelpers<Element>) {
      const {nthCall} = helpers
      const mockedFn = fn.returns({mock: {calls: []}})

      expect(nthCall(mockedFn())).to.have.length(0)
    }

    await expect(test(runner)()).to.eventually.rejectedWith('helpers threw in test runtime: Error: function [undefined] is not mocked')
  })

  it('should throw when nthInstance points to a non-mocked function', async () => {
    async function runner (helpers: LitRuntimeHelpers<Element>) {
      const {nthInstance} = helpers
      const mockedFn = fn.returns({mock: {instances: []}})

      expect(nthInstance(mockedFn())).to.have.length(0)
    }

    await expect(test(runner)()).to.eventually.rejectedWith('helpers threw in test runtime: Error: function [undefined] is not mocked')
  })

  it('should unwrap helpers', async () => {
    async function runner (helpers: LitRuntimeHelpers<Element>) {
      const {
        calls, nthCall, nthInstance, nthResult
      } = helpers
      let mockedFn = fn.returns({mock: {
        calls: [],
        instances: [],
        results: []
      }})

      expect(calls(mockedFn())).to.have.length(0)

      const arg1 = randomString()
      const arg2 = randomString()
      const r1 = randomString()
      mockedFn = fn.returns({
        _isMockFunction: true,
        mock: {
          calls: [arg1, arg2],
          instances: [arg1, arg2],
          results: [r1]
        }
      })

      expect(nthCall(mockedFn())).to.equal(arg2)
      expect(nthCall(mockedFn(), -2)).to.equal(arg1)
      expect(nthCall(mockedFn(), 0)).to.equal(arg1)
      expect(nthInstance(mockedFn())).to.equal(arg2)
      expect(nthInstance(mockedFn(), -2)).to.equal(arg1)
      expect(nthInstance(mockedFn(), 0)).to.equal(arg1)
      expect(nthResult(mockedFn(), 0)).to.equal(r1)
    }

    await test(runner)()
  })

  it('should create a lit page', async () => {
    async function runner (helpers: LitRuntimeHelpers<Element>) {
      const {create} = helpers
      const template = randomString() as unknown as TemplateResult

      await create({template})

      expect(fixture).to.be.calledWith(template)
      expect(window).to.have.property('FormData')
      expect(window.history).to.have.property('pushState')
      expect(global).to.have.property('fetch')
      expect(navigator).to.have.property('language')
    }

    await test(runner, {
      fakeTimers: false, useDomMocks: true
    })()
  })

  it('should create a lit page with timers', async () => {
    async function runner (helpers: LitRuntimeHelpers<Element>) {
      const {create} = helpers
      const template = randomString() as unknown as TemplateResult

      await create({template})

      expect(fixture).to.be.calledWith(template)
      expect(advanceTimersByTime).to.be.calledWith(2000)
    }

    await test(runner)()
  })

  it('should override timers', async () => {
    async function runner (helpers: LitRuntimeHelpers<Element>) {
      const {create} = helpers
      const template = randomString() as unknown as TemplateResult

      await create({
        template, advanceTimerByTime: 1
      })

      expect(fixture).to.be.calledWith(template)
      expect(advanceTimersByTime).to.be.calledWith(1)
    }

    await test(runner, {})()
  })

  it('should test formData', async () => {
    async function runner (helpers: LitRuntimeHelpers<Element>) {
      const {create} = helpers
      const template = randomString() as unknown as TemplateResult
      const str1 = randomString()
      const str2 = randomString()
      const str3 = randomString()
      const str4 = randomString()
      const str5 = randomString()

      await create({template})

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.FormData()
      expect(window).to.have.property('append')

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.append(str1, str2, str3)
      expect(window).to.have.property('name', str1)
      expect(window).to.have.property('value', str2)
      expect(window).to.have.property('fileName', str3)

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.append(str4, str5)
      expect(window).to.have.property('name', str4)
      expect(window).to.have.property('value', str5)
    }

    await test(runner, {useDomMocks: true})()
  })

  it('should eject bus', async () => {
    async function runner (helpers: LitRuntimeHelpers<Element>) {
      const {
        actOnEvents, completeAndCount
      } = helpers

      await actOnEvents([])
      await expect(completeAndCount()).to.eventually.fulfilled
    }

    await test(runner, {})()
  })
})
