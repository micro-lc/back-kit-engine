# back-kit-engine 🦦️

This library allows the interplay between React components and web components.
Arisen from R&D development on mia-platform [Backoffice][BO] library,
it integrates a React-based design system on a more general web component library.

This library combined multiple features:

- on `.`: base webcomponents to be extended to implement React/webcomponent interplay, types, events and their event factory
- on `./engine`: the core React/webcomponent lifecycle syncing engine for [lit][lit] based webcomponent
- on `./utils`: some useful utils
- on `./west`: a readymade wrapper of JEST testing library to run unit testing on webcomponents implementing this library engine

## How to install

```shell
# npm
npm i @micro-lc/back-kit-engine

# yarn
yarn add @micro-lc/back-kit-engine
```

## Base Classes

There are 4 base web components extendible classes

- BkBase
- BkComponent
- BkHttpBase
- BkHttpComponent

long story short, `*Http*`s are equivalent counterparts to `BkBase` and `BkComponent`
only carrying an extra http client (fetch) already configured according
to the component properties `basePath` and `headers`.

Each of these must be linked on startup to a [ReplaySubject][ReplaySubject] instance from [rxjs][rxjs]. More details can be found on this topic on mia's Backoffice [docs][BO]. Simply put, any component in the web page is connected to a Kafka-like channel, called by us an `EventBus` (its TS type ships with this library). Such channel allow listening and emitting events form and to the component. Such a way no component is aware of anything else in the document beside the channel itself and the business logic it contains.

Be aware of the following interface which will become handy:

```typescript
interface LitCreatable<P = Record<string, never>> {
  renderRoot: HTMLElement | ShadowRoot
  Component: FunctionComponent<P>
  create?: () => P
}
```

Thus any webcomponent is linked to a React Function Component which as props `P` and will provide the user a `create` function to establish at each render which props to pass down to the React component instance.
Aside there's a render root which might be in the DOM or a shadow root.
The library used to build webcomponents is [lit-elements][lit].

### BkBase

As the name suggests, it is the lowest building block. If a component extends it one has:

- the rendering root is the `shadowRoot` (overridable as per lit [docs][lit-docs-shadowRoot])
- an `EventBus` object must be connected to the component. It doesn't really matter when. Without it nothing will break but the component won't do anything. On `EventBus` set, achievable as per the code snippet below, the component will bind to the component class instance anything is passed through the constructor. By this trickery we get to run lifecycle on `EventBus` set instead of the constuctor which it ain't accessible while writing a plain html page with custom tags.

```javascript
document.querySelector('my-custom-tag').eventBus = new rxjs.ReplaySubject()
```

Cool! Let's see the construcor which takes two arguments: listeners and bootstrappers.

A `Listener` is a function like

```typescript
type Listener = (eventBus: EventBus) => Subscription
```

and is executed when the `EventBus` is attached. If the channel is changed at runtime it won't be able to re-start. A listener allows the component to react when a given event is piped in the `EventBus`. A subscription must be returned to avoid memory leaks on component destruction/detachment.

A `Bootstrapper` is a function like

```typescript
type Bootstrapper = (eventBus: EventBus) => void
```

and as the name suggests will take care of *una-tantum* operations. Must of the time a bootstrapper must read the URL to decode startup settings which override its defaults. To do that we attached in this library a `getURLParams` method in the module `utils`.

`Listeners` and `Bootstrappers` can be none, one or an array of them.

Beside these information, any component extending `BkBase` will follow the implementation of webcomponents in the [lit][lit] library.

### BkComponent

This component renders on the DOM by default (as per it runs lit's render method). As such, its constructor wants to know which React component (`Component` argument) it must render and how to compute props (`create` argument). It passes down `Listeners` and `Bootstrappers` to `BkBase` which is its `super`.

There's a concept of connection/update/render/disconnection to the real DOM, but React re-render needs are taken care by the component. Any component extending this one will need to **only** compute props as per its business logic.

This component again has a shadowRoot.

### BkmThemedComponent

the **m** here stands for Google's [material UI][mui].

This component automatically listens for the event `theme/computed` which is:

```typescript
type ThemeComputedEvent {
  label: 'theme/computed'
  payload: Theme
  meta?: any
}
```

and `Theme` is a `@mui/material` theme type.

This component render a `ThemeProvider` as parent in order to access the theme spawned into the page by Mui JSS engine. Obviously @mui/material must be a dependency of any library extending this one.

## Lit Engine

The engine is a brief module which allows bridging between lit and React, exposing three methods (in case you want to start with a new base component):

- `unmount`, mapped one-to-one with `ReactDOM.unmountComponentAtNode`
- `reactRender`, and
- `reactThemedRender` which makes your component a child of a mui `ThemeProvider`

## Event Factory

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

### bk events

`backoffice` events are located in `events/bk`

## utils

- `getURLParams`
- `setCssVariables`
- `litShadowRootCSS`
- `stencilShadowRootCSS`

[rxjs]: https://rxjs.dev
[ReplaySubject]: https://rxjs.dev/api/index/class/ReplaySubject
[BO]: https://docs.mia-platform.eu/docs/business_suite/backoffice/overview
[lit]: https://lit.dev/
[lit-docs-shadowRoot]: https://lit.dev/docs/components/shadow-dom/#renderroot
[mui]: https://mui.com
[antd]: https://ant.design
[stencil]: https://stenciljs.com
