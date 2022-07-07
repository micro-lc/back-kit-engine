import {buildRef, handleRef, stripDomain, HrefQueryInput} from '../href'

describe('handlebars parsing hrefs with queries', () => {
  it.each<[HrefQueryInput, string | undefined]>(
    [
      [{href: ''},
        ''
      ],
      [{href: undefined},
        ''
      ],
      [{href: undefined, query: undefined},
        ''
      ],
      [{href: undefined, query: undefined, values: undefined},
        ''
      ],
      [{href: 'href'},
        'href'
      ],
      [{href: 'href', query: {key: 'value'}},
        'href?key=value'
      ],
      [{href: 'href', query: {key: 'value', handlebars: '{{thisKey}}'}},
        'href?handlebars=%7B%7BthisKey%7D%7D&key=value'
      ]]
  )('should parse %s into query %s \\wo handlebars', (input, expected) => {
    expect(buildRef(input)).toStrictEqual(expected)
  })

  it.each(
    [
      [undefined,
        undefined
      ],
      ['https://www.google.com/items?_q=asd',
        '/items?_q=asd'
      ],
      ['http://www.google.com/items?_q=asd',
        '/items?_q=asd'
      ],
      ['http://www.google.com?_q=asd',
        '?_q=asd'
      ],
      ['ref?_q=asd',
        '/ref?_q=asd'
      ]
    ]
  )('from %s should strip domains returning %s', (input, expected) => {
    expect(stripDomain(input)).toStrictEqual(expected)
  })

  it.each(
    [
      [
        {href: 'href', query: {key: 'value', handlebars: '{{thisKey}}'}},
        'href?handlebars=&key=value'
      ],
      [
        {href: 'href', query: {key: 'value', handlebars: '{{currentUser.sub}}-{{data.array.[2]}}'}},
        'href?handlebars=sub-el3&key=value'
      ],
      [
        {href: 'href', query: {handlebars: 'go-back-to:{{currentLocation}}'}},
        'href?handlebars=go-back-to%3Athis-website'
      ],
      [
        {href: 'href', query: {handlebars: '{{data.obj.thisKey}}-{{data.name}}'}},
        'href?handlebars=thisValue-name'
      ]
    ]
  )('should parse queries \\w handlebars', (input, expected) => {
    const values = {
      currentUser: {
        sub: 'sub',
        email: 'myname@email.com'
      },
      currentLocation: 'this-website',
      data: {
        _id: '0',
        name: 'name',
        array: ['el1', 'el2', 'el3'],
        obj: {
          thisKey: 'thisValue'
        }
      }
    }

    expect(buildRef({values, ...input})).toStrictEqual(expected)
  })
})

describe('href call tests', () => {
  it('should avoid stripping domain', () => {
    const actualOpen = window.open

    const open = jest.fn()
    Object.defineProperty(window, 'open', {writable: true, value: open})

    handleRef({href: 'https://www.google.com?_q={{currentUser.name}}', target: '_blank'}, {name: 'john'}, undefined, false)

    expect(open).toBeCalled()
    expect(open.mock.calls).toEqual([['https://www.google.com?_q=john', '_blank']])

    Object.defineProperty(window, 'open', {writable: true, value: actualOpen})
  })

  it('should trigger the right window function', () => {
    const actualOpen = window.open
    const actualLocation = window.location

    const open = jest.fn()
    const replace = jest.fn()
    Object.defineProperty(window, 'open', {writable: true, value: open})
    Object.defineProperty(window, 'location', {writable: true, value: {replace}})

    handleRef({target: '_blank'})
    handleRef({target: '_top'})
    handleRef({href: '/'}, {}, {})
    handleRef({})
    handleRef({target: '_self'})

    expect(open).toBeCalledTimes(2)
    expect(open.mock.calls).toEqual([['', '_blank'], ['', '_top']])
    expect(replace).toBeCalledTimes(3)
    expect(replace.mock.calls).toEqual([['/'], [''], ['']])

    Object.defineProperty(window, 'open', {writable: true, value: actualOpen})
    Object.defineProperty(window, 'location', {writable: true, value: actualLocation})
  })
})
