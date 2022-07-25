import chai, {expect} from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {
  lastValueFrom, of, ReplaySubject
} from 'rxjs'
import sinonChai from 'sinon-chai'

import type {Event} from '../src/events'
import {
  actOnEvents, completeAndCount
} from '../src/west/asyncEvents'

import {randomString} from './setupTests'

chai.use(sinonChai)
chai.use(chaiAsPromised)

describe('asyncEvents tests', () => {
  let eventBus: ReplaySubject<Event>
  beforeEach(() => {
    eventBus = new ReplaySubject<Event>()
  })
  afterEach(() => {
    eventBus.complete()
  })

  it('should run a pipeline with a single event handler', async () => {
    const filter = randomString()
    eventBus.next({
      label: filter, payload: {}
    })

    const promise = actOnEvents(eventBus, [{filter}])

    await expect(promise).to.eventually.fulfilled
    await expect(promise).to.eventually.have.length(1)
    await expect(completeAndCount(eventBus)).to.eventually.equal(1)
  })

  it('should run a pipeline with a single event handler triggered by a function filter', async () => {
    const label = randomString()
    eventBus.next({
      label, payload: {}
    })

    const promise = actOnEvents(eventBus, [{
      filter: () => false, throws: true
    }], 500)

    await expect(promise).to.eventually.fulfilled
    await expect(promise).to.eventually.have.length(1)
  })

  it('should throw on ridicolously low timeout', async () => {
    const promise = actOnEvents(eventBus, [{filter: randomString()}], 4)

    await expect(promise).to.eventually.rejectedWith('test wasn\'t supposed to throw but it did')
  })

  it('should handle a label and obtain another', async () => {
    const filter = randomString()
    const label = randomString()
    eventBus.next({
      label: filter, payload: {}
    })

    const promise = actOnEvents(eventBus, [{
      filter, handler: () => of({
        label, payload: {}
      })
    }])

    await expect(promise).to.eventually.fulfilled
    await expect(promise).to.eventually.have.length(1)
    await expect(completeAndCount(eventBus)).to.eventually.equal(2)
    await expect(lastValueFrom(eventBus)).to.eventually.have.property('label', label)
  })

  it('should handle a label and obtain another as an async handler', async () => {
    const filter = randomString()
    const label = randomString()
    eventBus.next({
      label: filter, payload: {}
    })

    const promise = actOnEvents(eventBus, [
      {
        filter,
        handler: async () => Promise.resolve(of({
          label, payload: {}
        }))
      },
      {filter: label}
    ])

    await expect(promise).to.eventually.fulfilled
    await expect(promise).to.eventually.have.length(2)
  })

  it('should handle a label and obtain another empty event just meant for waiting as an async handler', async () => {
    const filter = randomString()
    eventBus.next({
      label: filter, payload: {}
    })

    const promise = actOnEvents(eventBus, [
      {
        filter,
        handler: async () => Promise.resolve()
      }
    ])

    await expect(promise).to.eventually.fulfilled
    await expect(promise).to.eventually.have.length(1)
    await expect(completeAndCount(eventBus)).to.eventually.equal(1)
  })

  it('should throw on handler throwing', async () => {
    const filter = randomString()
    const error = randomString()
    eventBus.next({
      label: filter, payload: {}
    })

    const promise = actOnEvents(eventBus, [
      {
        filter,
        handler: async () => Promise.reject<void>(error)
      }
    ])

    await expect(promise).to.eventually.rejectedWith(error)
  })

  it('should group multiple events', async () => {
    const filter = randomString()
    const string1 = randomString()
    const string2 = randomString()
    eventBus.next({
      label: filter, payload: {string: string1}
    })
    eventBus.next({
      label: filter, payload: {}
    })
    eventBus.next({
      label: filter, payload: {string: string2}
    })

    const promise = actOnEvents(eventBus, [
      {
        filter,
        take: 3,
        handler: async (event) => {
          expect(event).to.have.property('label', `#${filter}#${filter}#${filter}`)
          expect(event).to.have.property('payload')
          expect(event.payload).to.have.length(3)
        }
      }
    ])

    await expect(promise).to.eventually.fulfilled
    await expect(promise).to.eventually.have.length(1)
    await expect(completeAndCount(eventBus)).to.eventually.equal(3)
  })

  it('should skip events', async () => {
    const filter = randomString()
    eventBus.next({
      label: filter, payload: {}
    })
    eventBus.next({
      label: filter, payload: {}
    })

    const promise = actOnEvents(eventBus, [
      {
        filter,
        skip: 1
      }
    ])

    await expect(promise).to.eventually.fulfilled
    await expect(promise).to.eventually.have.length(1)
    await expect(completeAndCount(eventBus)).to.eventually.equal(2)
  })
})
