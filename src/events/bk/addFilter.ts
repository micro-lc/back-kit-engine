import type {Filter} from '../../schemas'
import {factory, WithHashMeta} from '../factory'

export type AddFilterPayload = Filter

/**
 * @registeredEvent
 * @title Add Filter
 * @description delivers data to add a new filter
 * @payload {
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
 *}
 * @meta {
 *    hash: string
 * }
 */
export const addFilter = factory<AddFilterPayload, WithHashMeta>('add-filter')
