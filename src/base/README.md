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
