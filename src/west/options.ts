import 'jest'
import type {EachTable} from '@jest/types/build/Global'

import type {
  LitRuntimeOptions,
  LitWestEach,
  LitWestEachTestFn,
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

interface Each {
  // Exclusively arrays.
  <T extends any[] | [any]>(cases: ReadonlyArray<T>): (name: string, fn: (...args: T) => any, timeout?: number) => void
  <T extends ReadonlyArray<any>>(cases: ReadonlyArray<T>): (name: string, fn: (...args: ExtractEachCallbackArgs<T>) => any, timeout?: number) => void
  // Not arrays.
  <T>(cases: ReadonlyArray<T>): (name: string, fn: (...args: T[]) => any, timeout?: number) => void
  (cases: ReadonlyArray<ReadonlyArray<any>>): (
      name: string,
      fn: (...args: any[]) => any,
      timeout?: number
  ) => void
  (strings: TemplateStringsArray, ...placeholders: any[]): (
      name: string,
      fn: (arg: any) => any,
      timeout?: number
  ) => void
}

/**
 * Creates a test closure
 */
export interface LitIt {
  /**
   * Creates a test closure.
   *
   * @param description The name of your test
   * @param testFn The function for your test
   */
  <E extends Element> (description: string, testFn: LitWestTestFn<E>): void
  /**
   * Only runs this test in the current file.
   */
  only: LitIt
  /**
   * Skips running this test in the current file.
   */
  skip: LitIt
  /**
   * Sketch out which tests to write in the future.
   */
  todo: LitIt
  /**
   * Experimental and should be avoided.
   */
  concurrent: LitIt
  /**
   * Use if you keep duplicating the same test with different data. `.each` allows you to write the
   * test once and pass data in.
   *
   * `.each` is available with two APIs:
   *
   * #### 1  `test.each(table)(name, fn)`
   *
   * - `table`: Array of Arrays with the arguments that are passed into the test fn for each row.
   * - `name`: String the title of the test block.
   * - `fn`: Function the test to be ran, this is the function that will receive the parameters in each row as function arguments.
   *
   *
   * #### 2  `test.each table(name, fn)`
   *
   * - `table`: Tagged Template Literal
   * - `name`: String the title of the test, use `$variable` to inject test data into the test title from the tagged template expressions.
   * - `fn`: Function the test to be ran, this is the function that will receive the test data object..
   *
   * @example
   *
   * // API 1
   * test.each([[1, 1, 2], [1, 2, 3], [2, 1, 3]])(
   *   '.add(%i, %i)',
   *   (a, b, expected) => {
   *     expect(a + b).toBe(expected);
   *   },
   * );
   *
   * // API 2
   * test.each`
   * a    | b    | expected
   * ${1} | ${1} | ${2}
   * ${1} | ${2} | ${3}
   * ${2} | ${1} | ${3}
   * `('returns $expected when $a is added $b', ({a, b, expected}) => {
   *    expect(a + b).toBe(expected);
   * });
   *
   */
  each: Each
}

export function createIt (opts: LitRuntimeOptions = {}, method?: jest.It): LitIt {
  const itFunction = function <E extends Element> (description: string, testFn: LitWestTestFn<E>): void {
    (method ?? global.it)(description, test<E>(testFn, opts))
  }
  Object.defineProperty(itFunction, 'only', {get: function () {
    return createIt(opts, global.it.only)
  }})
  Object.defineProperty(itFunction, 'skip', {get: function () {
    return createIt(opts, global.it.skip)
  }})
  Object.defineProperty(itFunction, 'each', {value: function <E extends Element, W extends LitWestTestFn<E>> (table: EachTable):
  ((title: string, t: LitWestEachTestFn<E, W>) => void) | (() => void) {
    return eachOptions<E, LitWestTestFn<E>>({}, method ?? global.it)(table)
  }})
  Object.defineProperty(itFunction, 'todo', {value: global.it.todo})

  return itFunction as LitIt
}

const it = createIt({})
const options = (opts: LitRuntimeOptions) => ({it: createIt(opts)})

export {
  it, options
}
