import type {
  TestFn,
  EachTable,
  EachTestFn
} from '@jest/types/build/Global'
import mock from 'mock-require'
import sinon from 'sinon'

/**
 * Utils
 */

export function randomString (length = 12): string {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

/**
 * JEST stubs
 */
type JestArgs = [string, TestFn, number | undefined]
type Each<C extends TestFn> = ((table: EachTable, ...taggedTemplateData: Array<unknown>) => (title: string, test: EachTestFn<C>, timeout?: number) => void) | (() => () => void);

const only = sinon.stub<JestArgs, void>()
const eachOnly = sinon.stub<[EachTable, Array<unknown>], ReturnType<Each<TestFn>>>()
Object.defineProperty(only, 'each', {value: eachOnly})
const skip = sinon.stub<JestArgs, void>()
const eachSkip = sinon.stub<[EachTable, Array<unknown>], ReturnType<Each<TestFn>>>()
Object.defineProperty(skip, 'each', {value: eachSkip})

const it = sinon.stub<JestArgs, void>()
const each = sinon.stub<[EachTable, Array<unknown>], ReturnType<Each<TestFn>>>()
const todo = sinon.stub<[string], void>()
Object.defineProperty(it, 'each', {value: each})
Object.defineProperty(it, 'only', {value: only})
Object.defineProperty(it, 'skip', {value: skip})
Object.defineProperty(it, 'todo', {value: todo})

export const jest = {
  it,
  requireActual: sinon.stub(),
  fn: sinon.stub(),
  useFakeTimers: sinon.stub(),
  clearAllTimers: sinon.stub(),
  clearAllMocks: sinon.stub(),
  useRealTimers: sinon.stub(),
  advanceTimersByTime: sinon.stub()
}

/**
 * open-wc stubs
 */
export const openWC = {
  fixture: sinon.stub(),
  fixtureCleanup: sinon.stub()
}

export function resetStubs () {
  todo.reset()
  eachOnly.reset()
  eachSkip.reset()
  skip.reset()
  only.reset()
  each.reset()
  it.reset()
  Object.entries(jest).forEach(([, stub]) => {
    stub.reset()
  })
}

mock('@open-wc/testing-helpers', openWC)
mock('jest', {})
Object.defineProperty(global, 'jest', {value: jest})
