# back-kit-engine/west

`west` stands for w[ebcomponent testing library wrapping J]est and indeed is a opinionated wrapper of
[JEST][jest] which provides out-of-the-box compatibility with the [element-composer][element-composer]
micro-lc plugin.

It is designed to test `lit` webcomponents using `@open-wc/tesing-helpers` helpers and avoid
weird `waitFor` function by wiring a pub/sub channel and listen to it to expect/assert a test
clause.

## How to use

We recommend to use `west` with a webcomponent that extends any of the `@micro-lc/back-kit-engine/base`
superclasses, but there's no reason why it shouldn't test efficiently any kind of webcomponent

Let's say we have a registered webcomponent called `custom-component` which implements any `base`
interface.

```javascript
// customComponent.js

class CustomComponent extends BkBase {
  constructor() {
    super(
      [
        listener1,
        listener2,
        ...
      ],
      [
        bootstrapper1,
        bootstrapper2,
        ...
      ]
    )
  }
}

customElements.define('custom-component' CustomComponent)
```

thus we can write a test

```javascript
// customComponent.test.js

import {runtime} from '@micro-lc/back-kit-engine/west'

runtime.it('my first test', async (helpers) => {
  // test goes here
})
```

`runtime` wraps JEST, hence it exposes

- describe
- it
- beforeAll
- beforeEach
- afterAll
- afterEach

moreover it has a subroutine that is called `.options({...})` which allows for some
customization. More on that later.

usually `helpers` in JEST is equivalent to a `done` method which completes the test. Since
`west` tests must be asynchronous there's no `done` but a bunch of useful tools:

```typescript
type LitRuntimeHelpers<E extends Element> = {
  eventBus: EventBus
  sub: Subscription
  create: (options: OpenWCPageOptions) => Promise<E>
  actOnEvents: (
    events: EventWithHandler[],
    timeout?: number,
    throwLabel?: string
  ) => Promise<void[]>
  completeAndCount: () => Promise<number>
  advanceTimersByTime: typeof jest.advanceTimersByTime
  domMocks: DomMocks
  mocks: MocksMap
  calls: (mock: jest.Mock) => any[]
  nthCall: <T = any, Y extends any[] = any[]>(mock: jest.Mock<T, Y> | any, index?: number) => Y
  nthResult: <T = any, Y extends any[] = any[]> (mock: jest.Mock<T, Y> | any, index?: number) => jest.MockResult<T>
  nthInstance: <T = any, Y extends any[] = any[]> (mock: jest.Mock<T, Y> | any, index?: number) => T
}
```

Let's check them out:

### eventBus

Every test has a dedicated pub/sub channel called `eventBus`. It is guaranteed that each
`runtime.it` has it's own bus. With the test and the `eventBus` comes also a subscription
to avoid memory leak.

### sub

Every test has a dedicated subscription called `sub`. It is guaranteed that each
`runtime.it` has it's own sub.

### create

Core wrapping feature between Jest and @open-wc/testing-helpers and lit which allows
accessing a virtual DOM and appending templates.

Let's take a look to the options

```typescript
export type OpenWCPageOptions = FixtureOptions & {
  template: TemplateResult
  advanceTimerByTime?: number
}
```

where @open-wc provides docs for
[`FixtureOptions`](https://open-wc.org/docs/testing/helpers/#test-fixtures)
and `TemplateResult` is any template realized using the
[html template parser](https://open-wc.org/docs/testing/helpers/#test-a-custom-class-with-properties)

as an example, consider the following test

```javascript
// customComponent.test.js

import {runtime} from '@micro-lc/back-kit-engine/west'
import {html} from '@open-wc/testing-helpers'

runtime.it('my first test', async ({create, eventBus}) => {
  const element = await create({
    template: html`
      <custom-component
        .eventBus=${eventBus}
      ></custom-component>
    `
  })

  expect(element.tagName).toStrictEqual('CUSTOM-COMPONENT')
})
```

`create` is guaranteed to perform all steps up until the first completed render.
After that you'll be sure that any listener has been registered with the `eventBus`.

### actOnEvents

This is the expect/assert main function. In an event-driven context we'd expect
our component to react to a given event piped into the `eventBus` and thus doing
something, either a side effect, or a render or the emission of another event.

Following the idea of `rxjs` [marbles](https://rxjs.dev/guide/testing/marble-testing) we have that
`actOnEvents` receives an array of filters to apply to the eventBus and when the filter is satisfied
execute an handler which might contain an expect/assert statement.

Let's say we coded in our `custom-component` the following behavior: on each `loading-data` event
it should set its state `loading` to the payload of the event

```javascript
class CustomComponent extends BkBase {
  @state() _loading = false

  constructor() {
    super(
      function (eventBus) {
        return eventBus
          .pipe(filter(({label}) => label === 'loading-data'))
          .suscribe(({payload: {loading}}) => {
            this._loading = loading
          })
      }
    )
  }
}

customElements.define('custom-component' CustomComponent)
```

a good test could be

```javascript
// 👈 import the component here!!!
import './customComponent.js'

import {runtime} from '@micro-lc/back-kit-engine/west'
import {html} from '@open-wc/testing-helpers'

runtime.it('my first test', async ({create, eventBus, actOnEvents}) => {
  // create
  const element = await create({
    template: html`
      <custom-component
        .eventBus=${eventBus}
      ></custom-component>
    `
  })

  // user action mock or emission
  eventBus.next({label: 'loading-data', payload: {loading: true}})

  await actOnEvents([
    {
      filter: 'loading-data',
      handler: () => {
        // expect/assert on reaction
        expect(el._loading).toBe(true)
      }
    }
  ])
})
```

let's check out the type of `actOnEvents`

```typescript
export type EventWithHandler = {
  filter: string | ((event: Event) => boolean)
  handler?: (event: Event) => void | Observable<Event> | Promise<void> | Promise<Observable<Event>>
  skip?: number
  take?: number
  throws?: boolean
  timeout?: number
}

export async function actOnEvents (
  events: Array<EventWithHandler>,
  eventTimeout: number = DEFAULT_EVENT_TIMEOUT,
  throwLabel: string = TEST_THROW_ERROR_LABEL
): Promise<void[]> {
  ...
}
```

`eventTimeout` allows to end the test after a given milleseconds gap.
Combined with `throwLabel` might also allow to test the case in which a test should
throw after a given `timeout` considering the test successful.

`events` is the list of pipelines to observe. It is made of

- a `filter`: either a string to compare the label or a predicate on the whole `Event`
- a `handler`: which can be asynchronous (to allow forcing an update on the webcomponent) to assert/expect

```javascript
// use asynchronous handler

// ...imports
import {elementUpdate} from '@open-wc/testing-helpers'

runtime.it('my first test', async ({create, eventBus, actOnEvents}) => {
  // create
  const element = await create(/** TEMPLATE */)

  await actOnEvents([
    {
      filter: /** SOME FILTER */,
      handler: async () => {
        /*
         * not really needed in this case
         * and most of the times synthom of
         * something wrong with the component
         * business logic
         */
        await elementUpdate(element)

        // expect/assert on reaction
        expect(el._loading).toBe(true)
      }
    }
  ])
})
```

- a `skip` number: which allows to skip a given amount of events that anyway check true on the filter
- a `take` number: to group multiple events that anyway check true on filter

```javascript
// use skip and take

// ...imports

runtime.it('my first test', async ({create, eventBus, actOnEvents}) => {
  /** 
   * Maybe some logic happens here
   */

  eventBus.next({label: 'my-event', payload: {}})
  eventBus.next({label: 'my-event', payload: {}})
  eventBus.next({label: 'my-event', payload: {key: 'value'}})
  eventBus.next({label: 'my-event-2', payload: {}})
  eventBus.next({label: 'my-event-2', payload: {}})

  await actOnEvents([
    {
      filter: 'my-event',
      skip: 2,
      handler: async ({payload}) => {
        expect(payload.key).toStrictEqual('value')
      }
    },
    {
      filter: 'my-event-2',
      take: 2
    }
  ])
})
```

- a `throws` boolean: which tells the pipeline should successfully throw
- a `timeout` millesecond time: to ensure the pipeline completes.

### completeAndCount

Once a test is completed it might be useful to check the number of events
in the `eventBus`

```javascript
// ...imports

runtime.it('my first test', async ({eventBus, completeAndCount}) => {
  /** 
   * Maybe some logic happens here
   */

  eventBus.next({label: 'my-event', payload: {}})
  eventBus.next({label: 'my-event', payload: {}})
  eventBus.next({label: 'my-event', payload: {key: 'value'}})
  eventBus.next({label: 'my-event-2', payload: {}})
  eventBus.next({label: 'my-event-2', payload: {}})

  expect(await completeAndCount()).toStrictEqual(5)
})
```

### advanceTimersByTime

Mirror of the Jest [method](https://jestjs.io/docs/timer-mocks).
According with [runtime options](#options), `fakeTimers` are enabled by
default and can be disabled using the proper option key.

### domMocks

Access dom mocks created when options `useDomMocks` is set to `true`

### mocks

See [sandbox](#sandbox)

### calls, nthCall, nthResult, nthInstance

The remaining functions are helpers to deal with jest mocks

- calls returns the object `jest.fn().mock.calls`
- nthCall return the element of index `i` into `jest.fn().mock.calls`
- nthResult return the element of index `i` into `jest.fn().mock.results`
- nthInstance returns the element of index `i` into `jest.fn().mock.instances`

indexes might be positive (looking forward) or negative unwind from the latest.
If no index is passed the instance returned is the last one called.

```javascript
runtime.it('my awesome test', async ({calls, nthResult}) => {
  const f = jest.fn().mockImplementation((s) => s)
  f('hi')
  f('there')

  expect(calls(f)).toHaveLength(2)

  // last
  expect(nthResult(f)).toStrictEqual('there')

  expect(nthResult(f, -2)).toStrictEqual('hi')
  expect(nthResult(f, -1)).toStrictEqual('there')
  expect(nthResult(f, 0)).toStrictEqual('hi')
  expect(nthResult(f, 1)).toStrictEqual('there')
})
```

## Options

```javascript
import {runtime} from '@micro-lc/back-kit-engine/west'

const opts = {
  fakeTimers: false
}

runtime.options(opts).it('my awesome test', async (helpers) => {
  /**
   * Test
   */
})
```

Options modify the `it` they generate overriding defaults. Test options are:

```typescript
export type LitRuntimeOptions = {
  timeout?: number
  mocks?: Record<string, string[]>
  defaultLanguage?: string
  fakeTimers?: boolean
  useDomMocks?: boolean
}
```

- `timeout`: another way to set a test timeout
- `mocks`: see [sandbox](#sandbox)
- `defaultLanguage` (defaults to 'en'): if using dom mocks (`useDomMocks` is `true`) the method `getNavigatorLanguage` returns the given `defaultLanguage`.
- `fakeTimers` (defaults to `true`): enables Jest fake timers.
- `useDomMocks` (defaults to `false`): injects some mocks in the current test DOM

```javascript
getNavigatorLanguage: jest.fn().mockReturnValue(defaultLanguage),
formData: jest.fn().mockImplementation(
  function fn (this: FormData) {
    this.append = append
  }
),
fetch: jest.fn(),
pushState: jest.fn()
```

## Sandbox

Each `runtime.it` comes with a separed mock sandbox. Up until now it can mock
any bare import (hence non relative). Let's suppose in the code of your custom
component there's a direct dependecy from the module `axios` which we use on `default`
import

```javascript
// customComponent.js

import axios from 'axios'

class CustomComponent extends BkBase {
  /**
   * axios is used somewhere here 👇
   */
}

customElements.define('custom-component', CustomComponent)
```

on test we might mock the external dependecy as 

```javascript
// customComponent.test.js

import {runtime} from '@micro-lc/back-kit-engine/west'

runtime.options({
  mocks: {
    'axios': ['default']
  }
}).it('my awesome test', async ({mocks: {axios: {default: axios}}}) => {
  /**
   * axios default export is available mocked here 👇
   */
  expect(axios).toBeCalledTimes(0)
})
```

when test ends the sandbox is distroyed and mocks restored to their actual
value.

[jest]: https://jestjs.io
[element-composer]: https://micro-lc.io/#microlc-element-composer