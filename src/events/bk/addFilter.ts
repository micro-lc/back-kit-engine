import type {Filter} from '../../schemas'
import {factory} from '../factory'

export type AddFilterPayload = Filter

/**
 * @registeredEvent
 * @title Add Filter
 * @description delivers data to add a new filter
 * @payload {
 *    operator: 'equal' |
 *           'notEqual' |
 *            'greater' |
 *       'greaterEqual' |
 *               'less' |
 *          'lessEqual' |
 *              'regex' |
 *        'includeSome' |
 *         'includeAll' |
 *     'includeExactly' |
 *      'notIncludeAny';
 *    property: string;
 *    value: string | number | boolean | any[];
 *    applied?: boolean;
 *    name: string;
 *}
 */
export const addFilter = factory<AddFilterPayload>('add-filter')
