This component renders on the DOM by default (as per it runs lit's render method).
As such, its constructor wants to know which React component (`Component` argument) it must
render and how to compute props (`create` argument). It passes down `Listeners` and `Bootstrappers` to `BkBase` which is its `super`.

There's a concept of connection/update/render/disconnection to the real DOM,
but React re-render needs are taken care by the component.
Any component extending this one will need to **only** compute props as per its business logic.

This component is rendered in shadowRoot.
