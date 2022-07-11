import {Filter} from '../../schemas'
import {factory} from '../factory'

export type ChangeFilterPayload = Filter

/**
 * @registeredEvent
 * @title Change Filter
 * @description delivers data on an edited filter
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
 */
export const changeFilter = factory<ChangeFilterPayload>('change-filter')
