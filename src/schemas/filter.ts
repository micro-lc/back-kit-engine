export type FiltersOptions = {
  hidden?: boolean
  availableOperators?: string[]
  ignoreCase?: boolean
}

export type FilterOperator = |
  'equal' |
  'exists' |
  'notEqual' |
  'greater' |
  'greaterEqual' |
  'less' |
  'lessEqual' |
  'regex' |
  'includeSome' |
  'includeAll' |
  'includeExactly' |
  'notIncludeAny' |
  'between' |
  'notBetween' |
  'hasLengthEqual' |
  'hasLengthGreaterEqual' |
  'hasLengthLessEqual'

export interface ConfigurableFilter {
  operator: FilterOperator
  property: string
  value: string | number | boolean | any[]
}

export interface Filter extends ConfigurableFilter {
  applied?: boolean
  name?: string
}
