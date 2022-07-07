import {interpolateCustomComponentProps} from '../custom-components'

describe('interpolateCustomComponentProps test', () => {
  it('No need of interpolation - same object is returned', () => {
    const testProps = {key: 'value'}
    const result = interpolateCustomComponentProps(testProps, [])

    expect(result).toEqual(testProps)
  })

  it('Args array interpolation', () => {
    const testProps = {
      interpolateString: '{{args.[0]}}',
      interpolateObject: '{{args.[1]}}',
      interpolateRawObject: '{{rawObject args.[1]}}',
      interpolateObjectField: '{{args.[1].key}}',
      noExistendField: '{{args.[2]}}'
    }
    const args = ['myString', {key: 'value'}]
    const result = interpolateCustomComponentProps(testProps, args)

    const expectedOutput = {
      interpolateString: 'myString',
      interpolateObject: '[object Object]',
      interpolateRawObject: {key: 'value'},
      interpolateObjectField: 'value',
      noExistendField: ''
    }

    expect(result).toEqual(expectedOutput)
  })

  it('elementComposerProps object interpolation', () => {
    const testProps = {
      interpolateString: '{{string}}',
      interpolateObject: '{{obj}}',
      interpolateRawObject: '{{rawObject obj}}',
      interpolateObjectField: '{{obj.key}}',
      noExistendField: '{{noField}}'
    }
    const elementComposerProperties = {
      string: 'myString',
      obj: {key: 'value'}
    }
    const result = interpolateCustomComponentProps(testProps, undefined, elementComposerProperties)

    const expectedOutput = {
      interpolateString: 'myString',
      interpolateObject: '[object Object]',
      interpolateRawObject: {key: 'value'},
      interpolateObjectField: 'value',
      noExistendField: ''
    }

    expect(result).toEqual(expectedOutput)
  })
})
