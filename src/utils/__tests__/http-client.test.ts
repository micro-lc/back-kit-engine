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

  it.each([500, 503, 400, 404])('patch multipart should handle error status codes', async (errorStatusCode) => {
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

    await createFetchHttpClient.bind<() => HttpClientInstance>(support)().patchMultipart('/', new window.FormData())
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

  it('should fetch patch method with multipart body and json response', async () => {
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

    const {data} = await createFetchHttpClient.bind<() => HttpClientInstance>(support)().patchMultipart('/', body, {outputTransform: (body: Body) => body.json()})
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

describe('Rerouting', () => {
  it('should fetch rerouted get methods', async () => {
    const customSupport = {
      ...support,
      reroutingRules: [
        {from: '^/unk$', to: '/reroute-unk'},
        {from: '^/$', to: '/reroute'},
        {from: new RegExp('^/orig$'), to: '/reroute-1'},
        {from: {method: 'GET', url: new RegExp('^/orig-2$')}, to: '/path/reroute-2'},
        {from: {method: 'GET', url: '^/path/orig$'}, to: '/reroute-3'},
        {from : '^(?<base>.*)/add/(.*)', to: '$base/add/orders/$1'}
      ]
    }
    const client = createFetchHttpClient.bind<() => HttpClientInstance>(customSupport)()

    const {origin} = window.location

    await client.get('/')
    await client.get('/orig')
    await client.get('/orig-2?_id=1')
    await client.get('/path/orig')
    await client.get('/service-path/add/id-1')
    await client.get('/keep')
    await client.get('/keep?_id=1')

    expect(fetchMock).toBeCalledTimes(7)
    const defaultConfig = {method: 'GET', headers: {'Content-Type': 'application/json'}}
    expect(fetchMock).toHaveBeenNthCalledWith(1, `${origin}/reroute`, defaultConfig)
    expect(fetchMock).toHaveBeenNthCalledWith(2, `${origin}/reroute-1`, defaultConfig)
    expect(fetchMock).toHaveBeenNthCalledWith(3, `${origin}/path/reroute-2?_id=1`, defaultConfig)
    expect(fetchMock).toHaveBeenNthCalledWith(4, `${origin}/reroute-3`, defaultConfig)
    expect(fetchMock).toHaveBeenNthCalledWith(5, `${origin}/service-path/add/orders/id-1`, defaultConfig)
    expect(fetchMock).toHaveBeenNthCalledWith(6, `${origin}/keep`, defaultConfig)
    expect(fetchMock).toHaveBeenNthCalledWith(7, `${origin}/keep?_id=1`, defaultConfig)
  })

  it('should fetch rerouted post methods', async () => {
    const body = {key: 'value'}
    
    const customSupport = {
      ...support,
      reroutingRules: [
        {from: '^/$', to: '/reroute'},
        {from: {method: 'POST', url: '^/orig-1$'}, to: '/path/reroute-1'}
      ]
    }
    
    const client = createFetchHttpClient.bind<() => HttpClientInstance>(customSupport)()
    
    const {origin} = window.location
    
    await client.post('/', body)
    await client.post('/orig-1', body)
    await client.post('/orig-2', body)
    
    expect(fetchMock).toBeCalledTimes(3)
    const defaultConfig = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body)
    }
    expect(fetchMock).toHaveBeenNthCalledWith(1, `${origin}/reroute`, defaultConfig)
    expect(fetchMock).toHaveBeenNthCalledWith(2, `${origin}/path/reroute-1`, defaultConfig)
    expect(fetchMock).toHaveBeenNthCalledWith(3, `${origin}/orig-2`, defaultConfig)
  })

  it('should fetch a rerouted patch methods, with parametric urls', async () => {
    const body = {key: 'value'}
    
    const customSupport = {
      ...support,
      reroutingRules: [
        {from: '^/orig/(?<id>[^/?]+)$', to: '/reroute/$id/append'},
        {from: '^/orig-2/([^/?]+)$', to: '/reroute-2/$1'},
        {from: {url: '^/orig-3/([^/?]+)/([^/?]+)$', method: 'PATCH'}, to: '/reroute-3/$1/$2'},
      ]
    }
    
    const client = createFetchHttpClient.bind<() => HttpClientInstance>(customSupport)()
    
    const {origin} = window.location

    await client.patch('/orig/id-1', body)
    await client.patch('/orig-2/id-1', body)
    await client.patch('/orig-3/id-1/id-2', body)
    
    expect(fetchMock).toBeCalledTimes(3)
    const defaultConfig = {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body)
    }
    expect(fetchMock).toHaveBeenNthCalledWith(1, `${origin}/reroute/id-1/append`, defaultConfig)
    expect(fetchMock).toHaveBeenNthCalledWith(2, `${origin}/reroute-2/id-1`, defaultConfig)
    expect(fetchMock).toHaveBeenNthCalledWith(3, `${origin}/reroute-3/id-1/id-2`, defaultConfig)
  })

  it('should fetch rerouted methods', async () => {
    const body = {key: 'value'}
    
    const customSupport = {
      ...support,
      reroutingRules: [
        {from: {method: 'GET', url: '^/orig$'}, to: '/reroute-get'},
        {from: {method: 'POST', url: '^/orig$'}, to: '/reroute-post'},
        {from: {method: 'PATCH', url: '^/orig$'}, to: '/reroute-patch'},
        {from: {method: 'DELETE', url: '^/orig$'}, to: '/reroute-delete'},
      ]
    }
    
    const client = createFetchHttpClient.bind<() => HttpClientInstance>(customSupport)()
    
    const {origin} = window.location
    
    client.get('/orig')
    client.post('/orig', body)
    client.patch('/orig', body)
    client.delete('/orig', body)
    client.postMultipart('/orig', new FormData())
    client.patchMultipart('/orig', new FormData())
    client.fetch('/orig', {method: 'GET'})
    client.fetch('/orig', {method: 'POST'})
    client.fetch('/orig', {method: 'PATCH'})
    client.fetch('/orig', {method: 'DELETE'})

    expect(fetchMock).toBeCalledTimes(10)
    expect(fetchMock).toHaveBeenNthCalledWith(1, `${origin}/reroute-get`, expect.any(Object))
    expect(fetchMock).toHaveBeenNthCalledWith(2, `${origin}/reroute-post`, expect.any(Object))
    expect(fetchMock).toHaveBeenNthCalledWith(3, `${origin}/reroute-patch`, expect.any(Object))
    expect(fetchMock).toHaveBeenNthCalledWith(4, `${origin}/reroute-delete`, expect.any(Object))
    expect(fetchMock).toHaveBeenNthCalledWith(5, `${origin}/reroute-post`, expect.any(Object))
    expect(fetchMock).toHaveBeenNthCalledWith(6, `${origin}/reroute-patch`, expect.any(Object))
    expect(fetchMock).toHaveBeenNthCalledWith(7, `${origin}/reroute-get`, expect.any(Object))
    expect(fetchMock).toHaveBeenNthCalledWith(8, `${origin}/reroute-post`, expect.any(Object))
    expect(fetchMock).toHaveBeenNthCalledWith(9, `${origin}/reroute-patch`, expect.any(Object))
    expect(fetchMock).toHaveBeenNthCalledWith(10, `${origin}/reroute-delete`, expect.any(Object))
  })
  
  it('should fetch a rerouted get method keeping config untampered', async () => {
    const customSupport = {
      ...support,
      reroutingRules: [{from: '/orig', to: '/reroute'}]
    }
    
    const client = createFetchHttpClient.bind<() => HttpClientInstance>(customSupport)()

    const {origin} = window.location

    await client.get(
      '/orig',
      {
        headers: {'Content-Type': 'application/json'},
        params: {_id: '1'},
        raw: true,
        downloadAsFile: true,
        // @ts-expect-error include unkown field
        unk: 'unk'
      }
    )

    expect(fetchMock).toBeCalledTimes(1)
    expect(fetchMock).toHaveBeenNthCalledWith(1, `${origin}/reroute?_id=1`, {
      downloadAsFile: true,
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
      raw: true,
      unk: 'unk'
    })
  })

  it('should fetch a rerouted get method without tampering with other clients', async () => {
    const customSupport = {
      ...support,
      reroutingRules: [
        {from: '/orig', to: '/reroute'}
      ]
    }
    
    const {origin} = window.location
    
    const client = createFetchHttpClient.bind<() => HttpClientInstance>(customSupport)()
    const client2 = createFetchHttpClient.bind<() => HttpClientInstance>(support)()
    await client.get('/orig')
    await client2.get('/orig')
    expect(fetchMock).toBeCalledTimes(2)
    expect(fetchMock).toHaveBeenNthCalledWith(1, `${origin}/reroute`, expect.any(Object))
    expect(fetchMock).toHaveBeenNthCalledWith(2, `${origin}/orig`, expect.any(Object))

  })

  it('should be robust to incorrect rerouting rules', async () => {
    const empty = {...support, reroutingRules: []}
    const incomplete = {...support, reroutingRules: [{}]}
    const incomplete2 = {...support, reroutingRules: [{from: '^/$'}]}
    const unkMethod = {...support, reroutingRules: [{from: {url: '^/$', method: 'unk'}, to: '/reroute'}]}
    const valid = {...support, reroutingRules: [{from: '^/$', to: '/reroute'}]}
    
    const clientEmpty = createFetchHttpClient.bind<() => HttpClientInstance>(empty)()
    const clientIncomplete = createFetchHttpClient.bind<() => HttpClientInstance>(incomplete)()
    const clientIncomplete2 = createFetchHttpClient.bind<() => HttpClientInstance>(incomplete2)()
    const clientUnkMethod = createFetchHttpClient.bind<() => HttpClientInstance>(unkMethod)()
    const clientValid = createFetchHttpClient.bind<() => HttpClientInstance>(valid)()
    
    const {origin} = window.location

    await clientEmpty.get('/')
    await clientIncomplete.get('/')
    await clientIncomplete2.get('/')
    // @ts-expect-error force invalid config
    await clientUnkMethod.fetch('/', {method: 'unk'})
    // @ts-expect-error force invalid config
    await clientValid.fetch('/', {method: false})
    // @ts-expect-error force invalid config
    await clientValid.fetch('/', {method: 'unk'})

    expect(fetchMock).toBeCalledTimes(6)
    expect(fetchMock).toHaveBeenNthCalledWith(1, `${origin}/`, expect.any(Object))
    expect(fetchMock).toHaveBeenNthCalledWith(2, `${origin}/`, expect.any(Object))
    expect(fetchMock).toHaveBeenNthCalledWith(3, `${origin}/`, expect.any(Object))
    expect(fetchMock).toHaveBeenNthCalledWith(4, `${origin}/`, expect.any(Object))
    expect(fetchMock).toHaveBeenNthCalledWith(5, `${origin}/`, expect.any(Object))
    expect(fetchMock).toHaveBeenNthCalledWith(6, `${origin}/`, expect.any(Object))
  })

  it('should fetch a get method with URL input', async () => {
    const customSupport = {
      ...support,
      reroutingRules: [
        {from: '^/$', to: '/reroute'},
        {from: '^/orig$', to: '/reroute-1'},
        {from: {method: 'GET', url: '^/orig-2$'}, to: '/path/reroute-2'}
      ]
    }
    const client = createFetchHttpClient.bind<() => HttpClientInstance>(customSupport)()
    
    const {origin} = window.location
    
    // @ts-expect-error force URL instance input
    await client.fetch(new URL('/', origin))
    // @ts-expect-error force URL instance input
    await client.get(new URL('/orig', origin))
    // @ts-expect-error force URL instance input
    await client.get(new URL('/orig-2?_id=1', origin))
    // @ts-expect-error force URL instance input
    await client.get(new URL('/orig-3', origin))
    // @ts-expect-error force URL instance input
    await client.get(new URL('/orig-3?_id=1', origin))

    expect(fetchMock).toBeCalledTimes(5)
    expect(fetchMock).toHaveBeenNthCalledWith(1, `${origin}/reroute`, expect.any(Object))
    expect(fetchMock).toHaveBeenNthCalledWith(2, `${origin}/reroute-1`, expect.any(Object))
    expect(fetchMock).toHaveBeenNthCalledWith(3, `${origin}/path/reroute-2?_id=1`, expect.any(Object))
    expect(fetchMock).toHaveBeenNthCalledWith(4, `${origin}/orig-3`, expect.any(Object))
    expect(fetchMock).toHaveBeenNthCalledWith(5, `${origin}/orig-3?_id=1`, expect.any(Object))
  })
})
