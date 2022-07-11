# back-kit-engine/utils

`utils` is a package containing useful functions to achieve interplay
between a webcomponent, which extends [superclasses](../base/README.md), and
either the DOM or the browser.

`utils` can be grouped into the following

- i18n
- http client
- href
- url

## i18n

Provides a connection with browser `navigator.language` and translates
the following structure according with the value of `navigator.language`:

```typescript
type LocalizedText = string | Record<string, string>
```

using the following rules:

1. a string as input is turned into itself
2. an object with language keys is checked against `navigator.language` first and when not found against `navigator.language.substring(0, 2)`. If neither is found it looks for `'en'` key which is default and otherwise it does a string cast.

There's a function that handles automatically the whole translation resolution called `localize`
which supports undefined input

```javascript
const input = 'ciao'

expect(localize(input)).toStrictEqual('ciao')
```

```javascript
const input = {}

expect(localize(input)).toStrictEqual('[object Object]')
```

```javascript
const input = {'en': 'hi'}

expect(localize(input)).toStrictEqual('hi')
```

```javascript
const input = {'en': 'hi', 'it': 'ciao'}

expect(localize(input)).toStrictEqual('hi') // when browser is in anything different from 'it'
expect(localize(input)).toStrictEqual('ciao') // when browser is set to 'it'
```

to provide the language you could use `getLocalizedText`

```typescript
export function getLocalizedText (
  localizedText: LocalizedText,
  lang: string = navigator.language || 'en'
): string;
```

finally the browser language is provided by `getNavigatorLanguage()`

## Http Client

Http Client is a wrapper around browser's `fetch` that avoid including third party libraries
when fetching require standard handling (mostly JSON + Text support) and 200, 204, and error handling.
More complex scenarios can be still achieved since this client exposes again the instance of fetch is using.

An http client can be created via

```typescript
interface HttpClientSupport extends Element {
  basePath?: string
  headers?: HeadersInit
}

const el = document.createElement('div')
const support: HttpClientSupport = Object.assing(el, {
  basePath: '/my-base-path',
  headers: {
    'Authentication': 'Bearer encodedBearer'
  }
})

const httpClient = createFetchHttpClient.call(support)
```

then `httpClient` enjoys the `HttpClientInstance` interface

```typescript
type HttpMethods = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

type HttpClientConfig = Omit<RequestInit, 'method'> & {
  params?: string | Record<string, string> | string[][] | URLSearchParams
  inputTransform?: (data: any) => BodyInit | null | undefined
  outputTransform?: (body: Body) => Promise<any>
  error?: (err: unknown) => Promise<unknown>
  raw?: boolean
  downloadAsFile?: boolean
}

type GetHandler =
  <T = any>(url: string, config?: HttpClientConfig) =>
    Promise<HttpClientResponse<T>>

type FetchHandler =
  (url: string, config?: HttpClientConfig & {method?: HttpMethods}) =>
    Promise<Response>

type PostHandler =
  <D = any, T = any>(url: string, data: D, config?: HttpClientConfig) =>
    Promise<HttpClientResponse<T>>

type PostMultipartHandler =
  <T = any>(url: string, data: FormData, config?: HttpClientConfig) =>
    Promise<HttpClientResponse<T>>

export type HttpClientInstance = {
  get: GetHandler
  post: PostHandler
  put: PostHandler
  delete: PostHandler
  postMultipart: PostMultipartHandler
  fetch: FetchHandler
}
```

Per call configuration can be acheved by tuning the `HttpClientConfig` optional

### Options

#### params

Object to inject query parameters in the URL

#### inputTransform

Function to parse the body before performing the HTTP request. By
default is set to `JSON.stringify` when `post`, `delete`, or `put` are used

#### outputTransform

Function to parse the response body after receiving an HTTP response. It acts on
browser `Response` interface if:

1. `res.ok` is `true`
2. `res.status` is different from `204` (No Content)

By default, on `get`, `post`, `delete`, `put`, or `postMultipart` it checks the
`Content-Type` header and maps to

- `text/*` => `res.text()`
- `application/json` => `res.json()`
- otherwise => `res.blob()`

#### error

Function to call when an error is found. Defaults to a `console.error` call.

#### raw

Raw is a boolean that when `true` returns the promise without handling as described above.

#### downloadAsFile

Available on `get`. Using `Content-Disposition` header, performs a browser native download of the response as a file.
