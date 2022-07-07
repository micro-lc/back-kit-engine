import 'jest'
import type {EachTable} from '@jest/types/build/Global'

import type {
  LitRuntimeOptions,
  LitWestEach,
  LitWestEachTestFn,
  LitWestIt,
  LitWestItBase,
  LitWestTestFn
} from './testWrapper'
import {test} from './testWrapper'

function eachOptions<E extends Element, W extends LitWestTestFn<E>> (
  opts: LitRuntimeOptions,
  method: jest.It
): LitWestEach<E, W> {
  return function fn (table: EachTable) {
    return (title: string, eachTest: LitWestEachTestFn<E, W>) => {
      table.forEach((args: any) => {
        if (Array.isArray(args)) {
          args.forEach((row: any) => {
            if (Array.isArray(row)) {
              method(
                title,
                test<E>(helpers => eachTest(helpers, ...row), opts),
                opts.timeout
              )
            } else {
              method(
                title,
                test<E>(helpers => eachTest(helpers, row), opts),
                opts.timeout
              )
            }
          })
        } else {
          method(
            title,
            test<E>(helpers => eachTest(helpers, args), opts),
            opts.timeout
          )
        }
      })
    }
  }
}

function factory<E extends Element, W extends LitWestTestFn<E>> (
  method: jest.It
): (o: LitRuntimeOptions) => LitWestItBase<E, W> {
  return function fn (opts: LitRuntimeOptions) {
    function obj (description: string, testFn: LitWestTestFn<E>): void {
      method(description, test<E>(testFn, opts), opts.timeout)
    }
    obj.each = eachOptions<E, W>(opts, method)

    return obj
  }
}

function options<E extends Element, W extends LitWestTestFn<E>> (
  opts: LitRuntimeOptions
): {it: LitWestIt<E, W>} {
  function fn (description: string, testFn: LitWestTestFn<E>): void {
    global.it(description, test<E>(testFn, opts), opts.timeout)
  }
  fn.each = eachOptions<E, W>(opts, global.it)
  fn.only = factory<E, W>(global.it.only)(opts)
  fn.skip = factory<E, W>(global.it.skip)(opts)
  fn.todo = global.it.todo

  return {it: fn}
}

function it<E extends Element> (
  description: string,
  testFn: LitWestTestFn<E>
): void {
  global.it(description, test<E>(testFn, {}))
}
it.each = function each<E extends Element, W extends LitWestTestFn<E>> (table: EachTable):
((title: string, t: LitWestEachTestFn<E, W>) => void) | (() => void) {
  return eachOptions<E, LitWestTestFn<E>>({}, global.it)(table)
}
it.only = factory(global.it.only)({})
it.skip = factory(global.it.skip)({})
it.todo = global.it.todo

export {
  options, it
}
