/* eslint-disable no-console */
import {
  readFileSync, writeFileSync
} from 'fs'
import {
  resolve, join
} from 'path'

import {compile} from 'handlebars'
import mkdirp from 'mkdirp'
import {
  format, Options
} from 'prettier'
import type {
  DeclarationReflection, ProjectReflection
} from 'typedoc'

import {
  BLANK_LINE, commentToTag, emph, getAttribute, lineUp
} from './utils'

type Component = {
  props: string
  tagName?: string
  emitters: Emitting[]
  listeners: Listening[]
  description: string
  category: string
  readme: string
  bootstrap?: string
  name: string
}

type Emitting = {
  event?: string
  description?: string
}

type Listening = {
  event?: string
  action?: string
  emits?: string
  onError?: string
}

const escapePipes = (input: string): string => {
  return input.replace(/\|/g, '\\|')
}

const resolveListeningEvents = (arr: Array<Listening>, eventReg: Record<string, any> = {}): Array<Listening> => {
  return arr.map(t => {
    t.event = t.event ? compile(t.event)(eventReg) : undefined
    t.emits = t.emits ? compile(t.emits)(eventReg) : undefined
    t.onError = t.onError ? compile(t.onError)(eventReg) : undefined

    return t
  })
}

const resolveEmittingEvents = (arr: Array<Emitting>, eventReg: Record<string, any> = {}): Array<Emitting> => {
  return arr.map(t => {
    t.event = t.event ? compile(t.event)(eventReg) : undefined

    return t
  })
}

const prettyPrinterJSON = (text: string, options: Options = {parser: 'json'}): string => {
  try {
    return format(text, options).trim()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(err)
    return ''
  }
}

const makePropsTable = (props: DeclarationReflection[]): string => {
  const mapOfTypeDescriptions: string[] = []
  const table = `
| property | attribute | type | default | description |
|----------|-----------|------|---------|-------------|\n`
    .concat(
      props.map(({
        name, type, defaultValue, comment, getSignature, setSignature
      }) => {
        let stringedType = ''
        if (type) {
          stringedType = type?.toString() ?? ''
        } else if (getSignature) {
          stringedType = getSignature.type?.toString() ?? ''
        } else if (setSignature) {
          stringedType = setSignature.type?.toString() ?? ''
        }

        let description = ''
        if (comment) {
          description = commentToTag(comment, 'description') ?? ''
        } else if (getSignature && getSignature.comment) {
          description = commentToTag(getSignature.comment, 'description') ?? ''
        } else if (setSignature && setSignature.comment) {
          description = commentToTag(setSignature.comment, 'description') ?? ''
        }

        return lineUp(emph(name), getAttribute(stringedType, name), escapePipes(stringedType), defaultValue, description)
      }).join('\n')
    )

  if (mapOfTypeDescriptions.length > 0) {
    const footer = mapOfTypeDescriptions.reduce((acc, desc) => acc.concat(`- ${desc}\n`), '')
    return [table, footer].join(BLANK_LINE)
  }

  return table
}

const makeListenerTable = (listeners: Listening[]): string => {
  try {
    return `
| event | action | emits | on error |
|-------|--------|-------|----------|\n`
      .concat(
        listeners.map(({
          event, action, emits, onError
        }: Listening) => {
          return lineUp(event, action, emits, onError)
        }).join('\n')
      )
  } catch (err) {
    return `${err}`
  }
}

const makeEmitterTable = (emitters: Emitting[]): string => {
  try {
    return `
| event | description |
|-------|-------------|\n`
      .concat(
        emitters.map(({
          event, description
        }: Emitting) => {
          return lineUp(event, description)
        }).join('\n')
      )
  } catch (err) {
    return `${err}`
  }
}

const writeSection = ({
  tagName, name, props, listeners: listensTo, emitters: emits, description, bootstrap, readme
}: Component): string => {
  const header = `## ${tagName ?? name}`.concat(description ? `${BLANK_LINE}${description}` : '')

  const htmlExample = tagName ?
    `\`\`\`html
<${tagName}></${tagName}>
\`\`\`` :
    ''

  const properties = '### Properties & Attributes'.concat(BLANK_LINE).concat(
    props !== '' ?
      props :
      'This component has no properties.')

  const listeners = '### Listens to'.concat(BLANK_LINE).concat(
    listensTo.length !== 0 ?
      makeListenerTable(listensTo) :
      'This component listens to no event.')

  const emitters = '### Emits'.concat(BLANK_LINE).concat(
    emits.length !== 0 ?
      makeEmitterTable(emits) :
      'This component emits no event.')

  const bootstrapping = '### Bootstrap'.concat(BLANK_LINE).concat(
    bootstrap ?? 'None'
  )

  return [header, htmlExample, readme, properties, listeners, emitters, bootstrapping].join(BLANK_LINE)
}

function genFiles (categories: Record<string, string>, output: string): void {
  Object.entries(categories).forEach(async ([cat, text]) => {
    const folder = cat.match(/\/([^/]+)$/)?.[1]
    if (folder) {
      await mkdirp(output)
      writeFileSync(`${output}/${folder}.md`, text)
    }
  })
}

const COMPONENT_TAGS = ['superclass', 'component']
const DECORATOR_NAMES = ['property', 'Props']
const CUSTOM_ELEMENT_NAMES = ['customElement', 'Component']

const filterOutComponents = ({comment}: DeclarationReflection): boolean => {
  return (comment?.tags?.filter(({tagName}) => COMPONENT_TAGS.includes(tagName.toLowerCase())).length ?? 0) > 0
}

export async function generateComponents (project: ProjectReflection, output = 'docs/components', rel = ''): Promise<void> {
  console.log(rel)
  // COMPONENTS //
  const {children: declarations} = project
  const components = declarations?.filter(filterOutComponents).reduce<Record<string, Component>>((acc, {
    comment, children, name, decorators, sources
  }) => {
    let readme = ''
    let category = 'misc'
    if (sources && sources[0] && sources[0].fileName) {
      const path = sources[0].fileName
      const dir = path.substring(0, path.lastIndexOf('/') + 1)
      const trimmedDir = dir.substring(0, dir.lastIndexOf('/'))
      category = trimmedDir.substring(0, trimmedDir.lastIndexOf('/'))

      try {
        readme = readFileSync(resolve(join(rel, dir, 'README.md'))).toString()
      } catch (err) {
        console.warn(`No README file found for ${name}. Exiting with ${err}`)
      }
    }
    if (comment) {
      let listeners: Listening[] = []
      let emitters: Emitting[] = []
      try {
        listeners =
          resolveListeningEvents(
            JSON.parse(
              prettyPrinterJSON(
                comment.tags.find(({tagName}) => tagName === 'listensto')?.text ?? '[]'
              )
            ) as Array<Listening>
          )
      } catch (err) {
        console.warn(`Something went wrong in component: ${name} on section "LISTENS_TO". JSON parsing failed with error: ${err}`)
      }

      try {
        emitters =
          resolveEmittingEvents(
            JSON.parse(
              prettyPrinterJSON(
                comment.tags.find(({tagName}) => tagName === 'emits')?.text ?? '[]'
              )
            ) as Array<Listening>
          )
      } catch (err) {
        console.warn(`Something went wrong in component: ${name} on section "EMITS". JSON parsing failed with error: ${err}`)
      }
      const properties = children?.filter(
        ({decorators}) => decorators?.length &&
          decorators?.length > 0 &&
          decorators?.filter(({name}) => DECORATOR_NAMES.includes(name)).length > 0
      )

      const description = (comment.tags.find(({tagName}) => tagName === 'description')?.text ?? '').trim()
      acc[name] = {
        props: properties ? makePropsTable(properties) : '',
        emitters,
        listeners,
        category,
        description,
        readme,
        name
      }

      if (decorators) {
        const {tagName} = decorators.find(({name}) => CUSTOM_ELEMENT_NAMES.includes(name))?.arguments ?? {}
        if (tagName) {
          acc[name].tagName = tagName.replace(/'/g, '')
        }
      }
    }
    return acc
  }, {})
  if (components) {
    const categories = Object.values(components).reduce<Record<string, Component[]>>((acc, c) => {
      const {category} = c
      if (acc[category]) {
        acc[category].push(c)
      } else {
        acc[category] = [c]
      }
      return acc
    }, {})

    const writtenCategories = Object.entries(categories).reduce<Record<string, string>>((acc, [key, val]) => {
      let readme = ''
      try {
        readme = readFileSync(join(rel, key, '/README.md')).toString()
      } catch (err) {
        console.warn(`No README file found in ${key}. Exiting with ${err}`)
      }

      acc[key] = [readme, ...val.map(writeSection)].filter(Boolean).join(BLANK_LINE)
      return acc
    }, {})

    genFiles(writtenCategories, output)
  }
}
