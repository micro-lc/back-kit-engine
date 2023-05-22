import type {
  ConfigurableFilter, Filter
} from '../../schemas'
import {factory} from '../factory'

export type SortDirection = 'descend' | 'ascend' | null

export type Characteristic = {
  tab?: string
  filters?: ConfigurableFilter[]
}

type Search = string | {
  baseSearch: string
  lookupSearch: Record<string, any[]>
}

export type ChangeQueryPayload = Record<string, unknown> & {
  characteristic?: Characteristic
  pageNumber?: number
  pageSize?: number
  search?: Search
  sortDirection?: SortDirection
  sortProperty?: string
  filters?: Filter[]
}

/**
 * @registeredEvent
 * @title Change Query
 * @description requires a modification of the currently viewed dataset (filtering, sorting, paging)
 * @payload {
 *  characteristic?: string,
 *  pageNumber?: number,
 *  pageSize?: number,
 *  search?: string,
 *  sortDirection?: SortDirection,
 *  sortProperty?: string,
 *  filters?: {
 *      operator: 'equal' |
 *             'notEqual' |
 *              'greater' |
 *         'greaterEqual' |
 *                 'less' |
 *            'lessEqual' |
 *                'regex' |
 *          'includeSome' |
 *           'includeAll' |
 *       'includeExactly' |
 *        'notIncludeAny' |
 *              'between' |
 *       'hasLengthEqual' |
 *'hasLengthGreaterEqual' |
 *   'hasLengthLessEqual';
 *    property: string;
 *    value: string | number | boolean | any[];
 *    applied?: boolean;
 *    name: string;
 *  }[]
 *}
 */
export const changeQuery = factory<ChangeQueryPayload>('change-query')
