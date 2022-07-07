import {parse} from 'query-string'

type URLParamsErrorHandler = (err: unknown) => void
export type URLParamsOptions = {
  errorHandler?: URLParamsErrorHandler
  input?: string
}

const safeParse = (value: any, errorHandler?: URLParamsErrorHandler) => {
  try {
    return JSON.parse(value)
  } catch (err) {
    errorHandler?.(err)
  }
  return value
}

function getURLParams (opts: URLParamsOptions = {}): Partial<Record<string, any>> {
  const {
    errorHandler,
    input = window.location.search
  } = opts
  const parsedObject = parse(input, {parseBooleans: true, parseNumbers: true})

  return Object
    .entries(parsedObject)
    .reduce<Partial<Record<string, any>>>((acc, [key, value]) => {
      acc[key] = safeParse(value, errorHandler)
      return acc
    }, {})
}

function createAnchor<T extends Element> (this: T, url: string, filename?: string): HTMLAnchorElement {
  const doc = this.ownerDocument
  const a = doc.createElement('a')
  a.href = url
  a.setAttribute('download', filename ?? '')

  return a
}

function downloadFile<T extends Element> (this: T, blob: Blob, filename?: string) {
  const url = window.URL.createObjectURL(blob)
  const a = createAnchor.bind(this)(url, filename)

  a.click()
}

export {getURLParams, createAnchor, downloadFile}
