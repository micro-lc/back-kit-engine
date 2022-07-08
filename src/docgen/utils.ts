import type {Comment} from 'typedoc'

export const BLANK_LINE = '\n\n'

export const kebabCase = (input?: string): string => {
  let output = ''

  if (input) {
    output = input
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/\s+/g, '-')
      .toLowerCase()
  }

  return output
}

export const commentToTag = ({tags}: Comment, tag: string): string | undefined => {
  const t = tags.find(({tagName}) => tagName === tag)

  if (t) {
    return t.text
  }
}

export const getAttribute = (type: string, name: string): string => {
  let output = ''
  if (['string', 'number', 'boolean'].includes(type)) {
    output = `\`${kebabCase(name)}\``
  }

  return output
}

/**
 * wraps strings into Markdown emphasize backticks: text => `text`
 * @param input string to emphasize
 * @returns a Markdown backtick-emphasized string
 */
export const emph = (input: string): string => `\`${input}\``

const orNothing = (input?: string | boolean): string => {
  let output = ' - '
  if (input) {
    const str = input.toString()
    if (str && str !== '') {
      output = str.replace('|', '\\|').replace('\n', ' ')
    }
  }

  return output
}

/**
 * writes a Markdown table entry polishing undefined and empty strings
 * @param any table entries
 * @returns a Markdown table entry
 */
export const lineUp = (...any: any[]): string => {
  if (any.length === 0) {
    return ''
  }
  return `|${any.map(value => orNothing(value)).join('|')}|`
}
