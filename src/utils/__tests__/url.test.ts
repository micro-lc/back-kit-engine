import {
  downloadFile, getURLParams
} from '../url'

jest.spyOn(document, 'createElement')

describe('getURLParams', () => {
  it.each([
    ['?search=&pageNumber=4', {
      search: '', pageNumber: 4
    }],
    ['search=goes to the search bar&', {search: 'goes to the search bar'}],
    ['search=special%20chars&pageSize=123456', {
      search: 'special chars', pageSize: 123456
    }],
    ['?pageSize=1.25', {pageSize: 1.25}],
    ['?boolVal=true', {boolVal: true}],
    ['?arrayVal=%5B%5D', {arrayVal: []}],
    [
      '?arrayVal=%5B%7B%22ciao%22%3Atrue%7D%2C%7B%22come%22%3Afalse%7D%5D',
      {arrayVal: [{ciao: true}, {come: false}]}
    ],
    [
      '?arrayVal=[%7B%22ciao%22%3Atrue%7D%2C%7B%22come%22%3Afalse%7D]',
      {arrayVal: [{ciao: true}, {come: false}]}
    ]
  ])('should return proper values for input %s', (input, expected) => {
    Object.defineProperty(window, 'location', {
      writable: true, value: {search: input}
    })

    const obj = getURLParams()
    const obj2 = getURLParams({input})

    for (const [key, value] of Object.entries(expected)) {
      expect(obj[key]).toStrictEqual(value)
      expect(obj2[key]).toStrictEqual(value)
    }
  })

  it('should handle json parse throw', () => {
    const errorHandler = jest.fn()
    getURLParams({
      input: '?search={]', errorHandler
    })
    expect(errorHandler).toBeCalled()
  })
})

describe('downloadFile', () => {
  const {URL} = window
  const {createElement} = document
  beforeEach(() => {
    Object.defineProperty(document, 'createElement', {
      writable: true,
      value: jest.fn().mockImplementation((tag: string) => {
        switch (tag) {
        case 'a':
          return {
            click: jest.fn(), setAttribute: jest.fn(function (this: Record<string, string>, key: string, value: string) { this[key] = value })
          }
        default:
          return createElement.bind(document)(tag)
        }
      })
    })
    Object.defineProperty(window, 'URL', {
      writable: true, value: {createObjectURL: jest.fn().mockImplementationOnce(() => 'url')}
    })
  })
  afterEach(() => {
    Object.defineProperty(window, 'URL', {
      writable: true, value: URL
    })
    Object.defineProperty(document, 'createElement', {
      writable: true, value: createElement.bind(document)
    })
  })

  it('should download a named file', () => {
    const blob = new Blob()
    const element = document.createElement('div')
    downloadFile.bind(element)(blob, 'filename')

    expect(window.URL.createObjectURL).toBeCalledWith(blob)

    const ce = document.createElement as jest.Mock
    const {
      click, setAttribute, download, href
    } = ce.mock.results[1].value
    expect(click).toBeCalled()
    expect(setAttribute).toBeCalled()
    expect(download).toStrictEqual('filename')
    expect(href).toStrictEqual('url')
  })

  it('should download an unnamed file', () => {
    const blob = new Blob()
    const element = document.createElement('div')
    downloadFile.bind(element)(blob)

    expect(window.URL.createObjectURL).toBeCalledWith(blob)

    const ce = document.createElement as jest.Mock
    const {
      click, download
    } = ce.mock.results[1].value
    expect(download).toStrictEqual('')
    expect(click).toBeCalled()
  })
})
