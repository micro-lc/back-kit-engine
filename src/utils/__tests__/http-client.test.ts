import fetchMock from 'jest-fetch-mock'

import {
  createFetchHttpClient, HttpClientInstance, HttpClientSupport
} from '../http-client'
import {downloadFile} from '../url'

jest.mock('../url', () => ({
  __esModule: true,
  downloadFile: jest.fn()
}))

const fakeElement = document.createElement('div')
const support = fakeElement as HttpClientSupport

describe('http-client tests', () => {
  it('should default error handler on get fetch catch', async () => {
    const {console} = global
    Object.defineProperty(global, 'console', {
      writable: true, value: {error: jest.fn()}
    })
    fetchMock.mockRejectOnce(() => Promise.reject(new Error('Not found')))

    await createFetchHttpClient.bind<() => HttpClientInstance>(support)().get('/').catch(() => {
      expect(global.console.error).toBeCalledWith('httpclient - Error: Not found')
    })
    Object.defineProperty(global, 'console', {
      writable: true, value: console
    })
  })

  it.each([500, 503, 400, 404])('get should handle error status codes', async (errorStatusCode) => {
    const {console} = global
    Object.defineProperty(global, 'console', {
      writable: true, value: {error: jest.fn()}
    })
    fetchMock.mockOnceIf(/\/$/, () => {
      return Promise.resolve({
        status: errorStatusCode,
        body: '{"error":"something went wrong"}'
      })
    })

    await createFetchHttpClient.bind<() => HttpClientInstance>(support)().get('/')
      .catch(async error => {
        expect(error.status).toBe(errorStatusCode)
        expect(await error.json()).toHaveProperty('error', 'something went wrong')
        expect(global.console.error).toBeCalledTimes(1)
      })
    Object.defineProperty(global, 'console', {
      writable: true, value: console
    })
  })

  it('should default error handler on post fetch catch', async () => {
    const {console} = global
    Object.defineProperty(global, 'console', {
      writable: true, value: {error: jest.fn()}
    })
    fetchMock.mockRejectOnce(() => Promise.reject(new Error('Not found')))

    await createFetchHttpClient.bind<() => HttpClientInstance>(support)().post('/', {}).catch(() => {
      expect(global.console.error).toBeCalledWith('httpclient - Error: Not found')
    })
    Object.defineProperty(global, 'console', {
      writable: true, value: console
    })
  })

  it.each([500, 503, 400, 404])('post, patch, put, delete should handle error status codes', async (errorStatusCode) => {
    const {console} = global
    Object.defineProperty(global, 'console', {
      writable: true, value: {error: jest.fn()}
    })
    const mock = () => {
      return Promise.resolve({
        status: errorStatusCode,
        body: '{"error":"something went wrong"}'
      })
    }
    fetchMock
      .mockOnceIf(/\/$/, mock)
      .mockOnceIf(/\/$/, mock)
      .mockOnceIf(/\/$/, mock)
      .mockOnceIf(/\/$/, mock)

    await createFetchHttpClient.bind<() => HttpClientInstance>(support)().post('/', {})
      .catch(async error => {
        expect(error.status).toBe(errorStatusCode)
        expect(await error.json()).toHaveProperty('error', 'something went wrong')
        expect(global.console.error).toBeCalledTimes(1)
      })
    await createFetchHttpClient.bind<() => HttpClientInstance>(support)().patch('/', {})
      .catch(async error => {
        expect(error.status).toBe(errorStatusCode)
        expect(await error.json()).toHaveProperty('error', 'something went wrong')
        expect(global.console.error).toBeCalledTimes(2)
      })
    await createFetchHttpClient.bind<() => HttpClientInstance>(support)().put('/', {})
      .catch(async error => {
        expect(error.status).toBe(errorStatusCode)
        expect(await error.json()).toHaveProperty('error', 'something went wrong')
        expect(global.console.error).toBeCalledTimes(3)
      })
    await createFetchHttpClient.bind<() => HttpClientInstance>(support)().delete('/', {})
      .catch(async error => {
        expect(error.status).toBe(errorStatusCode)
        expect(await error.json()).toHaveProperty('error', 'something went wrong')
        expect(global.console.error).toBeCalledTimes(4)
      })

    Object.defineProperty(global, 'console', {
      writable: true, value: console
    })
  })

  it.each([500, 503, 400, 404])('post multipart should handle error status codes', async (errorStatusCode) => {
    const {console} = global
    Object.defineProperty(global, 'console', {
      writable: true, value: {error: jest.fn()}
    })
    fetchMock.mockOnceIf(/\/$/, () => {
      return Promise.resolve({
        status: errorStatusCode,
        body: '{"error":"something went wrong"}'
      })
    })

    await createFetchHttpClient.bind<() => HttpClientInstance>(support)().postMultipart('/', new window.FormData())
      .catch(async error => {
        expect(error.status).toBe(errorStatusCode)
        expect(await error.json()).toHaveProperty('error', 'something went wrong')
        expect(global.console.error).toBeCalledTimes(1)
      })

    Object.defineProperty(global, 'console', {
      writable: true, value: console
    })
  })

  it('should fetch a get method', async () => {
    fetchMock.mockOnceIf(/\/$/, () => {
      return Promise.resolve({
        status: 200,
        body: '{"key":"value"}',
        headers: {'Content-Type': 'application/json'}
      })
    })

    const {
      data, headers, status
    } = await createFetchHttpClient.bind<() => HttpClientInstance>(support)().get('/')

    expect(status).toBe(200)
    expect(headers.get('Content-Type')).toBe('application/json')
    expect(data).toHaveProperty('key', 'value')
  })

  it('should fetch a get method with params', async () => {
    fetchMock.mockOnceIf(/\/\?_q=value$/, () => {
      return Promise.resolve({
        status: 200,
        body: '{"key":"value"}',
        headers: {'Content-Type': 'application/json'}
      })
    })

    const {
      data, headers, status
    } = await createFetchHttpClient.bind<() => HttpClientInstance>(support)().get('/', {params: {_q: 'value'}})

    expect(status).toBe(200)
    expect(headers.get('Content-Type')).toBe('application/json')
    expect(data).toHaveProperty('key', 'value')
  })

  it('should fetch a get method as text', async () => {
    fetchMock.mockOnceIf(/\/\?_q=value$/, () => {
      return Promise.resolve({
        status: 200,
        body: 'text',
        headers: {'Content-Type': 'text/plain'}
      })
    })

    const {
      data, headers, status
    } = await createFetchHttpClient.bind<() => HttpClientInstance>(support)().get('/', {params: {_q: 'value'}})

    expect(status).toBe(200)
    expect(headers.get('Content-Type')).toBe('text/plain')
    expect(data).toStrictEqual('text')
  })

  it('should fetch a get method with file download', async () => {
    fetchMock.mockOnceIf(/\/\?_q=value$/, () => {
      return Promise.resolve({
        status: 200,
        body: 'text',
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': 'attachment; filename="file.csv"'
        }
      })
    })

    const {
      headers, status
    } = await createFetchHttpClient.bind<() => HttpClientInstance>(support)().get('/', {
      params: {_q: 'value'}, downloadAsFile: true
    })

    expect(downloadFile).toBeCalled()
    expect(downloadFile).toBeCalledWith(expect.any(Object), 'file.csv')
    expect(status).toBe(200)
    expect(headers.get('Content-Type')).toStrictEqual('text/plain')
    expect(headers.get('Content-Disposition')).toStrictEqual('attachment; filename="file.csv"')
  })

  it('should fetch a get method with file download - no quotes around filename', async () => {
    fetchMock.mockOnceIf(/\/\?_q=value$/, () => {
      return Promise.resolve({
        status: 200,
        body: 'text',
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': 'attachment; filename=file.csv'
        }
      })
    })

    const {
      headers, status
    } = await createFetchHttpClient.bind<() => HttpClientInstance>(support)().get('/', {
      params: {_q: 'value'}, downloadAsFile: true
    })

    expect(downloadFile).toBeCalled()
    expect(downloadFile).toBeCalledWith(expect.any(Object), 'file.csv')
    expect(status).toBe(200)
    expect(headers.get('Content-Type')).toStrictEqual('text/plain')
    expect(headers.get('Content-Disposition')).toStrictEqual('attachment; filename=file.csv')
  })

  it('should fetch a get method with file download and fail', async () => {
    fetchMock.mockOnceIf(/\/$/, () => {
      return Promise.resolve({
        status: 404,
        body: '{"error":"something went wrong"}'
      })
    })

    await createFetchHttpClient.bind<() => HttpClientInstance>(support)().get('/', {downloadAsFile: true})
      .catch(async error => {
        expect(downloadFile).not.toBeCalled()
        expect(error.status).toBe(404)
        expect(await error.json()).toHaveProperty('error', 'something went wrong')
      })
  })

  it('should fetch a get method with file download and without filename', async () => {
    fetchMock.mockOnceIf(/\/\?_q=value$/, () => {
      return Promise.resolve({
        status: 200,
        body: 'text',
        headers: {'Content-Type': 'text/plain'}
      })
    })

    const {
      headers, status
    } = await createFetchHttpClient.bind<() => HttpClientInstance>(support)().get('/', {
      params: {_q: 'value'}, downloadAsFile: true
    })

    expect(downloadFile).toBeCalledWith(expect.any(Object), undefined)
    expect(status).toBe(200)
    expect(headers.get('Content-Type')).toStrictEqual('text/plain')
  })

  it('should fetch a get method as gif', async () => {
    fetchMock.mockOnceIf(/\/\?_q=value$/, () => {
      return Promise.resolve({
        status: 200,
        body: '',
        headers: {'Content-Type': 'img/gif'}
      })
    })

    const {
      data, headers, status
    } = await createFetchHttpClient.bind<() => HttpClientInstance>(support)().get('/', {params: {_q: 'value'}})

    expect(status).toBe(200)
    expect(headers.get('Content-Type')).toBe('img/gif')
    expect(await (data as Blob).text()).toEqual('')
  })

  it('should fetch a get as raw', async () => {
    fetchMock.mockOnceIf(/\/\?_q=value$/, () => {
      return Promise.resolve({
        status: 200,
        body: '',
        headers: {'Content-Type': 'img/gif'}
      })
    })

    const {
      data, headers, status
    } = await createFetchHttpClient.bind<() => HttpClientInstance>(support)().get('/', {
      params: {_q: 'value'}, raw: true
    })

    expect(status).toBe(200)
    expect(headers.get('Content-Type')).toBe('img/gif')
    expect(data).toBeUndefined()
  })

  it('should fetch get method with transform', async () => {
    fetchMock.mockOnceIf(/\/$/, async () => {
      return Promise.resolve({
        status: 200,
        body: 'ok'
      })
    })

    const {
      data, status
    } = await createFetchHttpClient.bind<() => HttpClientInstance>(support)().get('/', {outputTransform: (body: Body) => body.text()})

    expect(status).toBe(200)
    expect(data).toStrictEqual('ok')
  })

  const withBodyMtds = [
    ['post', createFetchHttpClient.bind<() => HttpClientInstance>(support)().post],
    ['put', createFetchHttpClient.bind<() => HttpClientInstance>(support)().put],
    ['patch', createFetchHttpClient.bind<() => HttpClientInstance>(support)().patch],
  ] as [string, HttpClientInstance['post']][]
  
  it.each(withBodyMtds)('should fetch %j method with text response', async (_, mtd) => {
    const body = {key: 'value'}
    const returnBody = 'ok'
    fetchMock.mockOnceIf(/\/$/, async (req) => {
      if (req.body) {
        expect(await req.json()).toStrictEqual(body)
        return Promise.resolve({
          status: 200,
          body: returnBody,
          headers: {'Content-Type': 'text/plain'}
        })
      }

      return Promise.reject(new Error('Not found'))
    })

    const {
      data, status
    } = await mtd('/', body)

    expect(status).toBe(200)
    expect(data).toStrictEqual('ok')
  })

  it.each(withBodyMtds)('should fetch %j method as JSON', async (_, mtd) => {
    const body = {key: 'value'}
    const returnBody = '[{"key":"value"}]'
    fetchMock.mockOnceIf(/\/$/, async (req) => {
      if (req.body) {
        expect(await req.json()).toStrictEqual(body)
        return Promise.resolve({
          status: 200,
          body: returnBody,
          headers: {'Content-Type': 'application/json'}
        })
      }

      return Promise.reject(new Error('Not found'))
    })

    const {
      data, status
    } = await mtd('/', body)

    expect(status).toBe(200)
    expect(data).toHaveLength(1)
    expect(data[0]).toHaveProperty('key', 'value')
  })

  it.each(withBodyMtds)('should fetch %j method with weird header', async (_, mtd) => {
    const body = {key: 'value'}
    const returnBody = 'ok'
    fetchMock.mockOnceIf(/\/$/, async (req) => {
      if (req.body) {
        expect(await req.json()).toStrictEqual(body)
        return Promise.resolve({
          status: 200,
          body: returnBody,
          headers: {'Content-Type': 'image/png'}
        })
      }

      return Promise.reject(new Error('Not found'))
    })

    const {
      data, status
    } = await mtd<any, Blob>('/', body)

    expect(status).toBe(200)
    expect(await data?.text()).toStrictEqual('ok')
  })

  it.each(withBodyMtds)('should fetch %j method with text response applying a transform', async (_, mtd) => {
    const body = {key: 'value'}
    const modBody = {key: 'value1'}
    const returnBody = 'ok'
    fetchMock.mockOnceIf(/\/$/, async (req) => {
      if (req.body) {
        expect(await req.json()).toStrictEqual(modBody)
        return Promise.resolve({
          status: 200,
          body: returnBody
        })
      }

      return Promise.reject(new Error('Not found'))
    })

    const {
      data, status
    } = await mtd('/', body, {
      inputTransform: (data: Record<string, string>) => {
        expect(data).toHaveProperty('key', 'value')
        return JSON.stringify(modBody)
      }
    })

    expect(status).toBe(200)
    expect(data).toStrictEqual('ok')
  })

  it.each(withBodyMtds)('should fetch %j method with json response', async (_, mtd) => {
    const body = {key: 'value'}
    const returnBody = JSON.stringify({key: 'response'})
    fetchMock.mockOnceIf(/\/$/, async (req) => {
      if (req.body) {
        expect(await req.json()).toStrictEqual(body)
        return Promise.resolve({
          status: 200,
          body: returnBody
        })
      }

      return Promise.reject(new Error('Not found'))
    })

    const {data} = await mtd('/', body, {outputTransform: (body: Body) => body.json()})
    expect(data).toHaveProperty('key', 'response')
  })

  it.each(withBodyMtds)('should fetch %j method as raw', async (_, mtd) => {
    const body = {key: 'value'}
    const returnBody = JSON.stringify({key: 'response'})
    fetchMock.mockOnceIf(/\/$/, async (req) => {
      if (req.body) {
        expect(await req.json()).toStrictEqual(body)
        return Promise.resolve({
          status: 200,
          body: returnBody
        })
      }

      return Promise.reject(new Error('Not found'))
    })

    const {data} = await mtd('/', body, {raw: true})
    expect(data).toBeUndefined()
  })

  it.each(withBodyMtds)('should fetch %j method with empty response', async (_, mtd) => {
    const body = {key: 'value'}
    fetchMock.mockOnceIf(/\/$/, async (req) => {
      if (req.body) {
        expect(await req.json()).toStrictEqual(body)
        return Promise.resolve({status: 204})
      }

      return Promise.reject(new Error('Not found'))
    })

    const {
      data, status
    } = await mtd('/', body)

    expect(status).toBe(204)
    expect(data).toBeUndefined()
  })

  it('should fetch delete method with empty response', async () => {
    const body = {key: 'value'}
    fetchMock.mockOnceIf(/\/$/, async (req) => {
      if (req.body) {
        expect(await req.json()).toStrictEqual(body)
        return Promise.resolve({status: 204})
      }

      return Promise.reject(new Error('Not found'))
    })

    const {
      data, status
    } = await createFetchHttpClient.bind<() => HttpClientInstance>(support)().delete('/', body)

    expect(status).toBe(204)
    expect(data).toBeUndefined()
  })

  it('should fetch a post method with file download', async () => {
    const body = {key: 'value'}
    fetchMock.mockOnceIf(/\/$/, () => {
      return Promise.resolve({
        status: 200,
        body: 'text',
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': 'attachment; filename="file.csv"'
        }
      })
    })

    const {
      headers, status
    } = await createFetchHttpClient.bind<() => HttpClientInstance>(support)().post('/', body, {
      downloadAsFile: true
    })

    expect(downloadFile).toBeCalled()
    expect(downloadFile).toBeCalledWith(expect.any(Object), 'file.csv')
    expect(status).toBe(200)
    expect(headers.get('Content-Type')).toStrictEqual('text/plain')
    expect(headers.get('Content-Disposition')).toStrictEqual('attachment; filename="file.csv"')
  })

  it('should fetch a post method with file download - no quotes in filename', async () => {
    const body = {key: 'value'}
    fetchMock.mockOnceIf(/\/$/, () => {
      return Promise.resolve({
        status: 200,
        body: 'text',
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': 'attachment; filename=file.csv'
        }
      })
    })

    const {
      headers, status
    } = await createFetchHttpClient.bind<() => HttpClientInstance>(support)().post('/', body, {
      downloadAsFile: true
    })

    expect(downloadFile).toBeCalled()
    expect(downloadFile).toBeCalledWith(expect.any(Object), 'file.csv')
    expect(status).toBe(200)
    expect(headers.get('Content-Type')).toStrictEqual('text/plain')
    expect(headers.get('Content-Disposition')).toStrictEqual('attachment; filename=file.csv')
  })

  it('should fetch a post method with file download and fail', async () => {
    const body = {key: 'value'}
    fetchMock.mockOnceIf(/\/$/, () => {
      return Promise.resolve({
        status: 404,
        body: '{"error":"something went wrong"}'
      })
    })

    await createFetchHttpClient.bind<() => HttpClientInstance>(support)().post('/', body, {downloadAsFile: true})
      .catch(async error => {
        expect(downloadFile).not.toBeCalled()
        expect(error.status).toBe(404)
        expect(await error.json()).toHaveProperty('error', 'something went wrong')
      })
  })

  it('should fetch a post method with file download and without filename', async () => {
    const body = {key: 'value'}
    fetchMock.mockOnceIf(/\/$/, () => {
      return Promise.resolve({
        status: 200,
        body: 'text',
        headers: {
          'Content-Type': 'text/plain'
        }
      })
    })

    const {
      headers, status
    } = await createFetchHttpClient.bind<() => HttpClientInstance>(support)().post('/', body, {
      downloadAsFile: true
    })

    expect(downloadFile).toBeCalled()
    expect(status).toBe(200)
    expect(headers.get('Content-Type')).toStrictEqual('text/plain')
  })

  it('should fetch post method with multipart body and text response', async () => {
    const body = new window.FormData()
    body.append('stringField', 'stringValue')
    body.append('blob', {size: 16} as Blob)
    const returnBody = 'ok'
    fetchMock.mockOnceIf(/\/$/, async (req) => {
      if (req.body) {
        return Promise.resolve({
          status: 200,
          body: returnBody,
          headers: {'Content-Type': 'text/plain'}
        })
      }

      return Promise.reject(new Error('Not found'))
    })

    const {
      data, status
    } = await createFetchHttpClient.bind<() => HttpClientInstance>(support)().postMultipart('/', body)

    expect(status).toBe(200)
    expect(data).toStrictEqual('ok')
  })

  it('should fetch post method as JSON with multipart body', async () => {
    const body = new window.FormData()
    body.append('field', 'value')
    body.append('blob', {size: 16} as Blob)
    const returnBody = '[{"key":"value"}]'
    fetchMock.mockOnceIf(/\/$/, async (req) => {
      if (req.body) {
        return Promise.resolve({
          status: 200,
          body: returnBody,
          headers: {'Content-Type': 'application/json'}
        })
      }

      return Promise.reject(new Error('Not found'))
    })

    const {
      data, status
    } = await createFetchHttpClient.bind<() => HttpClientInstance>(support)().postMultipart('/', body)

    expect(status).toBe(200)
    expect(data).toHaveLength(1)
    expect(data[0]).toHaveProperty('key', 'value')
  })

  it('should fetch post method with multipart body and weird header', async () => {
    const body = new window.FormData()
    body.append('string', 'value')
    body.append('blob', {size: 16} as Blob)
    const returnBody = 'ok'
    fetchMock.mockOnceIf(/\/$/, async (req) => {
      if (req.body) {
        return Promise.resolve({
          status: 200,
          body: returnBody,
          headers: {'Content-Type': 'image/png'}
        })
      }

      return Promise.reject(new Error('Not found'))
    })

    const {
      data, status
    } = await createFetchHttpClient.bind<() => HttpClientInstance>(support)().postMultipart('/', body)

    expect(status).toBe(200)
    expect(await data?.text()).toStrictEqual('ok')
  })

  it('should fetch post method with multipart body with custom headers as client property', async () => {
    const body = new window.FormData()
    body.append('field', 'value')
    body.append('file', {size: 16} as Blob)
    const returnBody = 'ok'
    fetchMock.mockOnceIf(/\/$/, async (req) => {
      if (req.body) {
        expect(req.headers.get('Connection')).toStrictEqual('keep-alive')
        return Promise.resolve({
          status: 200,
          body: returnBody
        })
      }

      return Promise.reject(new Error('Not found'))
    })

    const {
      data, status
    } = await createFetchHttpClient.bind<() => HttpClientInstance>({
      ...support, headers: {Connection: 'keep-alive'}
    })()
      .postMultipart('/', body)

    expect(status).toBe(200)
    expect(data).toStrictEqual('ok')
  })

  it('should fetch post method with multipart body with custom headers as args', async () => {
    const body = new window.FormData()
    body.append('field', 'value')
    body.append('file', {size: 16} as Blob)
    const returnBody = 'ok'
    fetchMock.mockOnceIf(/\/$/, async (req) => {
      if (req.body) {
        expect(req.headers.get('Connection')).toStrictEqual('keep-alive')
        return Promise.resolve({
          status: 200,
          body: returnBody
        })
      }

      return Promise.reject(new Error('Not found'))
    })

    const {
      data, status
    } = await createFetchHttpClient.bind<() => HttpClientInstance>(support)()
      .postMultipart('/', body, {headers: {Connection: 'keep-alive'}})

    expect(status).toBe(200)
    expect(data).toStrictEqual('ok')
  })

  it('should fetch post method with multipart body and json response', async () => {
    const body = new window.FormData()
    body.append('stringField', 'stringValue')
    body.append('blob', {size: 16} as Blob)

    const returnBody = JSON.stringify({key: 'response'})
    fetchMock.mockOnceIf(/\/$/, async (req) => {
      if (req.body) {
        return Promise.resolve({
          status: 200,
          body: returnBody
        })
      }
      return Promise.reject(new Error('Not found'))
    })

    const {data} = await createFetchHttpClient.bind<() => HttpClientInstance>(support)().postMultipart('/', body, {outputTransform: (body: Body) => body.json()})
    expect(data).toHaveProperty('key', 'response')
  })

  it('should fetch post method as raw', async () => {
    const body = new window.FormData()
    body.append('stringField', 'stringValue')
    body.append('blob', {size: 16} as Blob)
    const returnBody = JSON.stringify({key: 'response'})
    fetchMock.mockOnceIf(/\/$/, async (req) => {
      if (req.body) {
        return Promise.resolve({
          status: 200,
          body: returnBody
        })
      }

      return Promise.reject(new Error('Not found'))
    })

    const {data} = await createFetchHttpClient.bind<() => HttpClientInstance>(support)().postMultipart('/', body, {raw: true})
    expect(data).toBeUndefined()
  })

  it('should fetch delete using fetch mirror', async () => {
    fetchMock.mockOnceIf(/\/:id$/, async () => Promise.resolve({status: 204}))

    await createFetchHttpClient.bind<() => HttpClientInstance>(support)().fetch('/:id', {method: 'DELETE'}).then(({status}) => {
      expect(status).toStrictEqual(204)
    })
  })

  it('should fail deleting using fetch mirror', async () => {
    fetchMock.mockOnceIf(/\/:id$/, () => {
      return Promise.resolve({
        status: 404,
        body: '{"error":"not found"}'
      })
    })

    await createFetchHttpClient.bind<() => HttpClientInstance>(support)().fetch('/:id', {method: 'DELETE'}).catch(async (err) => {
      expect(await err.json()).toEqual({error: 'not found'})
    })
  })

  it('should get when no method is declared using fetch mirror', async () => {
    fetchMock.mockOnceIf(/\/$/, () => {
      return Promise.resolve({
        status: 200,
        body: '[]'
      })
    })

    await createFetchHttpClient.bind<() => HttpClientInstance>(support)().fetch('/').then(async (res) => {
      expect(await res.json()).toEqual([])
    })
  })

  const defaultHeaders = {'Content-Type': 'application/json'}
  it.each([
    [undefined, undefined, defaultHeaders],
    [{}, {}, defaultHeaders],
    [{'Content-Type': 'text/plain'}, {}, {'Content-Type': 'text/plain'}],
    [{'Content-Type': 'text/plain'}, {'Content-Type': 'img/svg'}, {'Content-Type': 'img/svg'}],
    [{'Content-Type': 'text/plain'}, {Authentication: 'Bearer 1'}, {
      'Content-Type': 'text/plain', Authentication: 'Bearer 1'
    }]
  ])('should resolve this.headers %s and config headers %s', async (thisHeaders, configHeaders, expected) => {
    fetchMock.mockOnceIf(/\/$/, async (req) => {
      const {headers} = req
      expect(headers).toEqual(new Headers(expected))
      return Promise.resolve({
        status: 200,
        body: JSON.stringify({})
      })
    })
    const customSupport = {
      ...support, headers: thisHeaders
    }

    const {data} = await createFetchHttpClient.bind<() => HttpClientInstance>(customSupport)().get('/', {headers: configHeaders})
    expect(data).toBeDefined()
  })
})
