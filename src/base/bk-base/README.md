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
