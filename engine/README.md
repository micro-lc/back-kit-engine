# back-kit-engine/engine

The engine is an adapter which allows bridging between lit-html render method and React createElement/ReactDOM renderer
exposing 2 methods:

- `unmount`, mapped one-to-one with `ReactDOM.unmountComponentAtNode`
- `reactRender`, and

and some useful `interface`/`type`.

Any class that wants to use the `engine` must implement the following interface

```typescript
export interface LitCreatable<P = Record<string, never>> {
  renderRoot: HTMLElement | ShadowRoot
  Component: React.FunctionComponent<P>
  create?: () => P
}
```

then on lit `updated()` method it must execute a react render sync provided by the
react conditional rendering function `reactRender` with signature

```typescript
type ReactRender = typeof function<P, T extends LitCreatable<P>> (
  this: T,
  conditionalRender = true
): P | undefined;
```

a conditional rendering can be controlled by the `conditionalRender` parameter.
Up until now there's no support for React component which take children.

On unmount the function to call is `unmount`

```typescript
type ReactUnmount = typeof function<P, T extends LitCreatable<P>> (this: T): boolean;
```

This module is exposed to implement superclasses that might break `BkBase` core concepts.
Sometimes it is also useful to mock this engine to avoid React interference in webcomponent
tests.

Invoking Jest default mocking handler is enough

```javascript
jest.mock('@micro-lc/back-kit-engine/engine')
```

of maybe a custom implementation can be obtained by

```javascript
jest.mock('@micro-lc/back-kit-engine/engine', () => ({
  ...jest.mock('@micro-lc/back-kit-engine/engine'),
  reactRender: jest.fn().mockImplementation(/** Your implementation */),
  unmount: jest.fn().mockImplementation(/** Your implementation */)
}))
```
