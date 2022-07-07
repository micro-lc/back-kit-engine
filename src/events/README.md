# Back-Kit Events

`Events` are data structures sent into a communication channel to enable `event-driven` component behavior.
They extend an `any` object and they come as

```typescript
type Event<P, M> = {
  label: string
  payload: P
  meta?: M
}
```

where `label` is a unique string identifying the event such as `"create-data"` or `"delete-file"`, `payload` contains transactional data and `meta` other data with extra information like what action triggered this event, a transaction ID if there's any and so on.

To create a new `event` within `src/events` there's a `factory` method which is a generic function that takes the `P` and `M` types with the `label`

```typescript
export function factory<P extends Payload = Payload, M extends Meta = Meta> (
  label: string, options: FactoryOptions = {}
): Factory<P, M> {
  ...
}
```

This function generates a function with hybrid prototype that contains:

1. an **event generator**
2. a **predicate** `.is(` to check  whether an event was made with the current generator
3. a **label** which returns the generator and its spawned events label

for instance

```typescript
const addNew = factory<Record<string, never>>('add-new')

const addNewEvent = addNew({})

expect(addNew.is(addNewEvent)).toBeTruthy()
expect(addNew.label).toStrictlyEqual('add-new')
```

There's also the concept of a `register` which automatically adds event is on factory call the constant

``` typescript
const REGISTERED = true
```

is provided. In that case, `src/events/eventRegister.ts` exports an `eventBuilderRegister` map that contains only
registered event generators. It has an `.add(` method which is `idempotent` on a factory with the same label already contained in the register.

An `eventBus` conforming event is an object like

```typescript
{
  label: string,
  payload: object,
  meta: object,
}
```

- `label` is a unique event identifier. Standard Back-kit events are always kebab-case idiomatic strings,
- `payload` is an object, possibly empty,
- `meta` helps to keep track of transaction states or enhance event scoping. Meta is not required and its value might be an empty object.

For instance an `upload-file` event looks like:

```typescript
{
  label: "upload-file",
  payload: {
    file: {
      lastModified: 1627457290180,
      lastModifiedDate: "Wed Jul 28 2021 09:28:10 GMT+0200 (Central European Summer Time)",
      name: "file.pdf",
      size: "9090",
      type: "application/json",
      uid: "rc-upload-1630930409639-3"
    }
  },
  meta: {
    transactionId: "97de9662-70aa-48a0-bdee-25113fc66c8f"
  }
}
```
