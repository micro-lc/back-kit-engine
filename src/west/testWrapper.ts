import 'jest'

import type {FixtureOptions} from '@open-wc/testing-helpers/types/src/fixture-no-side-effect'
import type {TemplateResult} from '@open-wc/testing-helpers/types/src/scopedElementsWrapper'

import type {
  EachTable, TestName
} from '@jest/types/build/Global'
import {
  fixture, fixtureCleanup
} from '@open-wc/testing-helpers'
import {
  ReplaySubject, Subscription
} from 'rxjs'

import type {
  EventWithHandler,
  Event,
  EventBus
} from './asyncEvents'
import {
  actOnEvents, completeAndCount
} from './asyncEvents'
import Sandbox, {
  MockReact, MocksMap
} from './sandbox'

export type DomMocks = {
  getNavigatorLanguage: jest.Mock<string, void[]>
  formData: jest.Mock<void, void[]>
  fetch: jest.Mock<ReturnType<typeof fetch>, Parameters<typeof fetch>>
  pushState: jest.Mock<void, [any, string, string | URL | null | undefined]>
}

export type LitRuntimeOptions = {
  timeout?: number
  mocks?: Record<string, string[]>
  defaultLanguage?: string
  fakeTimers?: boolean
  useDomMocks?: boolean
}

export type LitRuntimeHelpers<E extends Element> = {
  create: (options: OpenWCPageOptions) => Promise<E>
  actOnEvents: (
    events: EventWithHandler[],
    timeout?: number,
    throwLabel?: string
  ) => Promise<void[]>
  advanceTimersByTime: typeof jest.advanceTimersByTime
  calls: (mock: jest.Mock) => any[]
  completeAndCount: () => Promise<number>
  domMocks: DomMocks
  eventBus: EventBus
  nthCall: (mock: jest.Mock | any, index?: number) => any
  mocks: MocksMap
  react?: MockReact
  sub: Subscription
  nthInstance: (mock: jest.Mock | any, index?: number) => E
}

export type LitWestTestFn<E extends Element> =
  (helpers: LitRuntimeHelpers<E>) => Promise<void>
export type LitWestEachTestFn<E extends Element, W extends LitWestTestFn<E>> =
  (helpers: LitRuntimeHelpers<E>, ...args: Array<any>) => ReturnType<W>;
export type LitWestEach<E extends Element, W extends LitWestTestFn<E>> =
  ((table: EachTable) => (title: string, t: LitWestEachTestFn<E, W>) => void) |
  (() => () => void)

export interface LitWestItBase<E extends Element, W extends LitWestTestFn<E>> {
  (testName: TestName, fn: LitWestTestFn<E>): void
  each: LitWestEach<E, W>
}

export interface LitWestIt<E extends Element, W extends LitWestTestFn<E>>
  extends LitWestItBase<E, W> {

  only: LitWestItBase<E, W>
  skip: LitWestItBase<E, W>
  todo: (testName: TestName) => void
}

export type OpenWCPageOptions = FixtureOptions & {
  template: TemplateResult
  advanceTimerByTime?: number
}

const DEFAULT_BOOTSTRAP_TIMEOUT = 2000

function makeTemplate<E extends Element> (
  template: OpenWCPageOptions['template'],
  mocks?: DomMocks,
  options?: FixtureOptions
) {
  return async function make (): Promise<E> {
    const el = await fixture<E>(template, options)

    if (mocks) {
      Object.defineProperty(global, 'fetch', {
        writable: true, value: mocks.fetch
      })
      Object.defineProperty(window.history, 'pushState', {
        writable: true, value: mocks.pushState
      })
      Object.defineProperty(navigator, 'language', {
        writable: true, value: mocks.getNavigatorLanguage()
      })
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.FormData = mocks.formData
    }

    return el
  }
}

export function test<E extends Element = Element> (
  helpers: (h: LitRuntimeHelpers<E>) => Promise<void>, {
    defaultLanguage = 'en',
    mocks = {},
    fakeTimers = true,
    useDomMocks = true
  }: LitRuntimeOptions = {}
) {
  return async () => {
    if (fakeTimers) {
      jest.useFakeTimers()
      jest.clearAllTimers()
    }

    // MOCKS
    const sandbox = new Sandbox(mocks)
    const sandboxMocks = sandbox.mock()

    // EVENT BUS
    const eventBus: EventBus = new ReplaySubject<Event>()

    const append: jest.Mock<void, [string, string | Blob, string | undefined]> =
      jest.fn().mockImplementation(
        function fn (this: any, name: string, value: string, fileName?: string) {
          this.name = name
          this.value = value
          this.fileName = fileName
        }
      )

    const domMocks: DomMocks = {
      getNavigatorLanguage: jest.fn<string, void[]>().mockReturnValue(defaultLanguage),
      formData: jest.fn<void, void[]>().mockImplementation(
        function fn (this: FormData) {
          this.append = append
        }
      ),
      fetch: jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>(),
      pushState: jest.fn<void, [any, string, string | URL | null | undefined]>()
    }

    // CREATE PAGE
    async function create ({
      advanceTimerByTime,
      template,
      ...options
    }: OpenWCPageOptions): Promise<E> {
      const newSpecPage = makeTemplate<E>(template, useDomMocks ? domMocks : undefined, options)

      const el = await newSpecPage()
      if (fakeTimers && (advanceTimerByTime ?? DEFAULT_BOOTSTRAP_TIMEOUT)) {
        jest.advanceTimersByTime(advanceTimerByTime ?? DEFAULT_BOOTSTRAP_TIMEOUT)
      }
      return el
    }

    // SUB
    const sub = new Subscription()

    return helpers({
      actOnEvents: (
        events: EventWithHandler[],
        timeout?: number,
        throwLabel?: string
      ) => actOnEvents(eventBus, events, timeout, throwLabel),
      advanceTimersByTime: jest.advanceTimersByTime,
      completeAndCount: () => completeAndCount(eventBus),
      create,
      eventBus,
      domMocks,
      mocks: sandboxMocks,
      calls: (mock: jest.Mock) => mock.mock.calls,
      nthCall: (mock: jest.Mock | any, index?: number): any => {
        if (!mock._isMockFunction) {
          throw new Error(`function [${mock.name}] is not mocked`)
        }
        const len = mock.mock.calls.length
        let rCall = mock.mock.calls[len - 1]
        if (index !== undefined && index >= 0) {
          rCall = mock.mock.calls[index]
        } else if (index !== undefined && index < 0) {
          rCall = mock.mock.calls[len + index]
        }

        return rCall
      },
      sub,
      nthInstance: (mock: jest.Mock | any, index?: number): E => {
        if (!mock._isMockFunction) {
          throw new Error(`function [${mock.name}] is not mocked`)
        }
        const len = mock.mock.instances.length
        let instance = mock.mock.instances[len - 1]
        if (index !== undefined && index >= 0) {
          instance = mock.mock.instances[index]
        } else if (index !== undefined && index < 0) {
          instance = mock.mock.instances[len + index]
        }

        return instance
      }
    }).catch((err) => {
      throw new Error(`helpers threw in test runtime: ${err}`)
    }).finally(() => {
      fixtureCleanup()
      sub.unsubscribe()
      sandbox.clearSandbox()
      jest.clearAllMocks()

      if (fakeTimers) {
        jest.useRealTimers()
      }
    })
  }
}
