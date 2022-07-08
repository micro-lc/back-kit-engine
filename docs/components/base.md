# Lit Base Classes

There are 4 base web components extendible classes

- BkBase
- BkComponent
- BkHttpBase
- BkHttpComponent

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

<!-- ### BkmThemedComponent

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

This component render a `ThemeProvider` as parent in order to access the theme spawned into the page by Mui JSS engine. Obviously @mui/material must be a dependency of any library extending this one. -->


## BkBase

BackOffice library base superclass for Lit-based webcomponents



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

### Lifecycle

Any component implementing `BkBase` shares the following lifecycle:

1. contructor defines `Listeners` and `Bootstrappers` without binding them
2. constructor emits on `_timeout$` a `0` to collect any page-landing related events
3. `connectedCallback` is executed without doing anything
4. on `eventBus` set, surely subscription is defined and listeners can kick-in due to the fact the `_timeout$` has already emitted
5. if the component is disconnected the `disconnectedCallback` takes care of re-instanciate subscriptions and `_timeout$`
6. on re-connection subscriptions are renewed and `_timeout$` emits a `0`

If a listener wants to subscribe the `_timeout$` logic it must
retain a second argument in the listener like

```typescript
type Listener = (eventBus: EventBus, kickoff: Observable<0>) => Subscription
```

which can be implemented as

```typescript
function myAwesomeListener (this: SomeClass, eventBus: EventBus, kickoff: Observable<0>): Subscription {
  return eventBus.pipe(skipUntil(kickoff))
    .subscription(`...do things here`)
}
```

then the listener on first connection will pipe the whole `eventBus` whether on re-connection will start from the `connectedCallback` re-subscription.

When an `eventBus` is swapped the following things happen:

1. subscription is voided an emptied
2. all listeners are re-subscribed but connected to the new `eventBus`


### Properties & Attributes


| property | attribute | type | default | description |
|----------|-----------|------|---------|-------------|
|`currentUser`| - |Record<string, unknown>|{}|[micro-lc-element-composer](https://microlc.io/documentation/docs/micro-lc/core_plugins#microlc-element-composer) default prop representing the authenticated user. It's context can be configured via micro-lc backend config files.|
|`proxyWindow`| - |Window & typeof globalThis|window|a window that might support sandboxed logic/methods |
|`eventBus`| - |undefined \\| EventBus| - |[micro-lc-element-composer](https://microlc.io/documentation/docs/micro-lc/core_plugins#microlc-element-composer) default prop representing the `eventBus` default channel unless overridden by `busDiscriminator` prop.
|

### Listens to

This component listens to no event.

### Emits

This component emits no event.

### Bootstrap

None

## BkComponent

BackOffice library react-rendering component superclass
for Lit-based webcomponents. Extends `BkBase` and its properties



This component renders on the DOM by default (as per it runs lit's render method).
As such, its constructor wants to know which React component (`Component` argument) it must
render and how to compute props (`create` argument). It passes down `Listeners` and `Bootstrappers` to `BkBase` which is its `super`.

There's a concept of connection/update/render/disconnection to the real DOM,
but React re-render needs are taken care by the component.
Any component extending this one will need to **only** compute props as per its business logic.

This component is rendered in shadowRoot.


### Properties & Attributes


| property | attribute | type | default | description |
|----------|-----------|------|---------|-------------|
|`currentUser`| - |Record<string, unknown>|{}|[micro-lc-element-composer](https://microlc.io/documentation/docs/micro-lc/core_plugins#microlc-element-composer) default prop representing the authenticated user. It's context can be configured via micro-lc backend config files.|
|`proxyWindow`| - |Window & typeof globalThis|window|a window that might support sandboxed logic/methods |
|`eventBus`| - |undefined \\| EventBus| - |[micro-lc-element-composer](https://microlc.io/documentation/docs/micro-lc/core_plugins#microlc-element-composer) default prop representing the `eventBus` default channel unless overridden by `busDiscriminator` prop.
|

### Listens to

This component listens to no event.

### Emits

This component emits no event.

### Bootstrap

None

## BkHttpBase

Extends `BkBase` by adding an instance of a basic
http client which wraps browser's `fetch` API. It provides an axios-like
API on fetch GET and POST method



TODO. Describe http client


### Properties & Attributes


| property | attribute | type | default | description |
|----------|-----------|------|---------|-------------|
|`currentUser`| - |Record<string, unknown>|{}|[micro-lc-element-composer](https://microlc.io/documentation/docs/micro-lc/core_plugins#microlc-element-composer) default prop representing the authenticated user. It's context can be configured via micro-lc backend config files.|
|`proxyWindow`| - |Window & typeof globalThis|window|a window that might support sandboxed logic/methods |
|`basePath`| - |undefined \\| string| - |http client base path |
|`eventBus`| - |undefined \\| EventBus| - |[micro-lc-element-composer](https://microlc.io/documentation/docs/micro-lc/core_plugins#microlc-element-composer) default prop representing the `eventBus` default channel unless overridden by `busDiscriminator` prop.
|
|`headers`| - |undefined \\| HeadersInit| - |http client custom headers |

### Listens to

This component listens to no event.

### Emits

This component emits no event.

### Bootstrap

None

## BkHttpComponent

embeds an http client instance in a webcomponent which renders a React component



TODO. extends BkHttpBase and BkComponent


### Properties & Attributes


| property | attribute | type | default | description |
|----------|-----------|------|---------|-------------|
|`currentUser`| - |Record<string, unknown>|{}|[micro-lc-element-composer](https://microlc.io/documentation/docs/micro-lc/core_plugins#microlc-element-composer) default prop representing the authenticated user. It's context can be configured via micro-lc backend config files.|
|`proxyWindow`| - |Window & typeof globalThis|window|a window that might support sandboxed logic/methods |
|`basePath`| - |undefined \\| string| - |http client base path |
|`eventBus`| - |undefined \\| EventBus| - |[micro-lc-element-composer](https://microlc.io/documentation/docs/micro-lc/core_plugins#microlc-element-composer) default prop representing the `eventBus` default channel unless overridden by `busDiscriminator` prop.
|
|`headers`| - |undefined \\| HeadersInit| - |http client custom headers |

### Listens to

This component listens to no event.

### Emits

This component emits no event.

### Bootstrap

None