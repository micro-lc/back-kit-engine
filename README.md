# back-kit-engine 🦦️

This library allows the interplay between React components and web components.
Arisen from R&D development on mia-platform [Backoffice][BO] library,
it integrates a React-based design system on a more general web component library.

This library combines multiple features:

- on [`.`](#event-factory): types, events and their event factory
- on [`./base`](./base/README.md): base webcomponents to be extended to implement React/webcomponent interplay
- on [`./engine`](./engine/README.md): the core React/webcomponent lifecycle syncing engine for [lit][lit] based webcomponent
- on [`./utils`](./utils/README.md): some useful utils
- on [`./west`](./west/README.md): a readymade wrapper of JEST testing library to run unit testing on webcomponents implementing this library engine

## How to install

```shell
# npm
npm i @micro-lc/back-kit-engine

# yarn
yarn add @micro-lc/back-kit-engine
```

## Event Factory

If you don't know about the element-composer interface, please check out [base superclasses](./base/README.md)

Event Factory is an utility that provides standardization to `events` that webcomponents might
receive from the `eventBus` set when connected to the DOM by the `element-composer`.

`factory` is a hybrid function which creates a hybrid function representing an `EventBus` event. By providing `factory` with a string you'll receive and event builder

```typescript
type LoadingDataPayload = {
  loading: boolean
}

const loadingData = factory<LoadingDataPayload>('loading-data')
```

in this example we specify the label every `loadingData` event will have and the type of its payload. `loadingData` now is

- a factory
- a filter/predicate
- and a label
  
as per the following snippet

```typescript
const newLoadingDataEvent = loadingData({loading: true})

assert(loadingData.is(newLoadingDataEvent)) // true

assert(loadingData.is({label: 'any-label'})) // false

assert(loadingData.filter === 'loading-data') // true
```

`factory` has also some options.

```typescript
type FactoryOptions = {
  scope?: string
  divider?: string
  aliases?: string | string[]
}
```

where the scope is prefixed to the label with the default divider `/`. The divider can be overridden

```typescript
const themeOptions = factory('options', {scope: 'theme'})
assert(themeOptions.label === 'theme/options')

const themeOptionsHashed = factory('options', {scope: 'theme', divider: '#'})
assert(themeOptions.label === 'theme#options')
```

finally a factory can receive aliases to events to ensure retro-compatibility

```typescript
const loadingData = factory('loading', {scope: 'data', aliases: ['loading-data', 'whatever-data']})
assert(loadingData.is({label: 'whatever-data'})) // true
```

### BK Events

There is a set of events already registered by including the factory in your code.
A full list can be found [here](./docs/events/events.md)

[rxjs]: https://rxjs.dev
[ReplaySubject]: https://rxjs.dev/api/index/class/ReplaySubject
[BO]: https://docs.mia-platform.eu/docs/business_suite/backoffice/overview
[lit]: https://lit.dev/
[lit-docs-shadowRoot]: https://lit.dev/docs/components/shadow-dom/#renderroot
[mui]: https://mui.com
[antd]: https://ant.design
[stencil]: https://stenciljs.com
