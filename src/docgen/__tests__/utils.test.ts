import type {Comment} from 'typedoc'
import {
  commentToTag, emph, getAttribute, kebabCase, lineUp
} from '../utils'

describe('docgen utils tests', () => {
  it.each([
    ['aString', 'a-string'],
    [undefined, ''],
    ['', ''],
    ['a-string', 'a-string']
  ])('kebab case: should convert %s into %s', (input, expected) => {
    expect(kebabCase(input)).toStrictEqual(expected)
  })

  it.each([
    [{tags: []}, 'a-tag', undefined],
    [{tags: [{
      tagName: 'a-tag', text: 'ciao'
    }]}, 'whatever', undefined],
    [{tags: [{
      tagName: 'a-tag', text: 'ciao'
    }]}, 'a-tag', 'ciao']
  ])('commentToTag: should extract from %s the `%s` tag which return %s', (c, tag, expected) => {
    expect(commentToTag(c as unknown as Comment, tag)).toStrictEqual(expected)
  })

  it('should emph text', () => {
    expect(emph('string')).toStrictEqual('`string`')
  })

  it('should line up strings', () => {
    expect(lineUp()).toStrictEqual('')
    expect(lineUp(undefined, 'ciao', 'thin|gs')).toStrictEqual('| - |ciao|thin\\|gs|')
  })

  it('get attribute tests', () => {
    expect(getAttribute('string', 'aProperty')).toStrictEqual('`a-property`')
    expect(getAttribute('object', 'aProperty')).toStrictEqual('')
  })
})
