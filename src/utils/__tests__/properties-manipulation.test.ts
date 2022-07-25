import type {Event} from '../../events'
import {runtime} from '../../west'
import {
  compileObjectKeys, parseEvents
} from '../properties-manipulation'

describe('properties-manipulation util tests', () => {
  it.each<[any, any, any]>([
    [{}, {}, undefined],
    [[], [], undefined],
    [[], [], {}],
    [[], [], []],
    [undefined, undefined, undefined],
    [null, null, null]
  ])('edge cases: should return %s while parsing input %s with context %s', (expected, input, context) => {
    expect(compileObjectKeys(input, context)).toEqual(expected)
  })

  it.each<[any, any, any]>([
    [{key: 'john'}, {key: '{{user}}'}, {user: 'john'}],
    [{key: 'john'}, {key: '{{[0]}}'}, ['john']],
    [{key: 1}, {key: 1}, ['john']],
    [
      {
        key: {innerKey: 'john doe'},
        otherKey: ['123']
      },
      {
        key: {innerKey: '{{firstName}} {{lastName}}'},
        otherKey: ['{{arg.[1]}}']
      }, {
        firstName: 'john', lastName: 'doe', arg: [undefined, '123']
      }
    ],
    [
      {key: 'john'},
      {key: '{{args.[0].firstName}}'},
      {args: [{firstName: 'john'}]}
    ]
  ])('real life cases: should return %s while parsing input %s with context %s', (expected, input, context) => {
    expect(compileObjectKeys(input, context)).toEqual(expected)
  })
})

runtime.describe('parseEvents tests', () => {
  runtime.it('should pipe `string-like` event', async ({
    eventBus, actOnEvents
  }) => {
    parseEvents(eventBus, 'change-query', undefined, {key: 'value'})

    await actOnEvents([{
      filter: 'change-query',
      handler: ({
        payload, meta
      }) => {
        expect(payload).toEqual({})
        expect(meta).toHaveProperty('key', 'value')
      }
    }])
  })

  runtime.it('should pipe `string-like` multiple events', async ({
    eventBus, actOnEvents
  }) => {
    parseEvents(eventBus, ['change-query', 'add-new'])

    await actOnEvents([{filter: 'change-query'}, {filter: 'add-new'}])
  })

  runtime.it('should pipe `event-like` event', async ({
    eventBus, actOnEvents
  }) => {
    parseEvents(eventBus, {
      label: 'change-query', payload: {key: '{{args.[0].value}}'}
    }, {args: [{value: 'value'}]})

    await actOnEvents([{
      filter: 'change-query',
      handler: ({payload}) => {
        expect(payload).toEqual({key: 'value'})
      }
    }])
  })

  runtime.it('should pipe `string-like` multiple events', async ({
    eventBus, actOnEvents
  }) => {
    parseEvents(eventBus, [{
      label: 'change-query', payload: {}
    }, {
      label: 'add-new', payload: {}
    }])

    await actOnEvents([{filter: 'change-query'}, {filter: 'add-new'}])
  })

  runtime.it('should do nothing when there are no events', async ({
    eventBus, completeAndCount
  }) => {
    parseEvents(eventBus, [])

    expect(await completeAndCount()).toStrictEqual(0)
  })

  runtime.it('edge cases: null', async ({
    eventBus, completeAndCount
  }) => {
    parseEvents(eventBus, [null as unknown as Event])

    expect(await completeAndCount()).toStrictEqual(0)
  })

  runtime.it('edge cases: throwing', async ({eventBus}) => {
    expect(() => parseEvents(eventBus, [1 as unknown as Event])).toThrow(TypeError)
    expect(() => parseEvents(eventBus, [1 as unknown as Event])).toThrow('events must be either a string for their label or an object')
  })
})
