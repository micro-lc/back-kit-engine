import {writeFile} from 'fs'
import {
  resolve, dirname
} from 'path'

import mkdirp from 'mkdirp'
import {
  format, Options
} from 'prettier'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import removeHtmlComments from 'remove-html-comments'
import type {
  ProjectReflection, CommentTag
} from 'typedoc'

import {
  BLANK_LINE, emph, kebabCase
} from './utils'

type EventBookmark = {
  tag: string
  title: string
  description?: string
  meta?: string
  payload?: string
}

export type EventDocs = Record<string, CommentTag[]>

export type EventReg = Record<string, string>

const registerEvent = (key: string, event: CommentTag[]): EventBookmark => {
  const bookmark: EventBookmark = {
    tag: key,
    title: key
  }
  event.forEach(({
    tagName, text
  }) => {
    switch (tagName) {
    case 'title':
      bookmark.title = text
      break
    case 'customtag':
      bookmark.tag = text
      break
    case 'meta':
      bookmark.meta = text
      break
    case 'payload':
      bookmark.payload = text
      break
    case 'description':
      bookmark.description = text
      break
    default:
      break
    }
  })

  return bookmark
}

const filterOutRegisteredEvents = (tags: Array<CommentTag>): boolean => tags.filter(({tagName}) => tagName.toLowerCase() === 'registeredevent').length > 0

const prettyPrintType = (input: string, options: Options = {
  semi: false, parser: 'typescript'
}): string => {
  const hold = 'type A = '
  try {
    return format(`${hold}${input.trim()}`, options).replace(hold, '').trim()
  } catch {
    return ''
  }
}

const writeSingleSecions = (acc: string, {
  tag, title, payload, meta, description
}: EventBookmark): string => {
  const header = `### ${title}`
  const desc = description ?? ''
  const body = `
- Label: ${emph(tag)}
- Payload:${BLANK_LINE}\`\`\`typescript
${prettyPrintType(payload ?? '{}')}
\`\`\``
  const metaPart = meta ?
    `- Meta:${BLANK_LINE}\`\`\`typescript
${prettyPrintType(meta)}
\`\`\`` :
    ''
  return acc + ([header, desc, body, metaPart].filter(Boolean).join(BLANK_LINE)).concat(BLANK_LINE)
}

const writeCapitalSections = (
  acc: string, [init, bookmarks]: [string, EventBookmark[]]
): string => {
  const header = `## ${init}`
  const bodies = bookmarks.reduce(writeSingleSecions, '')
  return acc + ([header, bodies].join(BLANK_LINE)).concat(BLANK_LINE)
}

export const generateEventBuffer = (eventDocs: EventDocs, readme = ''): Buffer => {
  const header = `---
id: events
title: Events
sidebar_level: Events
---`

  const bookmarks = Object.entries(eventDocs).map(
    ([key, tags]) => registerEvent(key, tags)
  )

  const alphabeth = bookmarks
    .sort((a, b) => a.tag > b.tag ? 1 : -1)
    .reduce((acc, bookmark) => {
      const {tag} = bookmark
      const init = tag.charAt(0).toUpperCase()
      if (acc[init]) {
        acc[init].push(bookmark)
      } else {
        acc[init] = [bookmark]
      }
      return acc
    }, {} as Record<string, EventBookmark[]>)

  const text = Object.entries(alphabeth).reduce(writeCapitalSections, '')

  const parsedReadme = removeHtmlComments(readme).data as string ?? ''
  return Buffer.from([header, parsedReadme, text].join(BLANK_LINE).concat(BLANK_LINE))
}

export const buildEventLinks = (evRelative: string, docs: EventDocs): EventReg => {
  try {
    return Object.entries(docs).reduce((acc, [key, value]) => {
      let linkName = key
      let linkRef = key

      const title = value.filter(t => t.tagName === 'title')?.[0]?.text
      const tag = value.filter(t => t.tagName === 'customtag')?.[0]?.text

      if (tag) {
        linkName = tag
      }

      if (title) {
        linkRef = kebabCase(title)
      }

      acc[linkName] = `[${linkName}](${evRelative}#${linkRef})`
      return acc
    }, {} as EventReg)
  } catch (err) {
    // eslint-disable-next-line
    console.error(new Error(`something went wrong while parsing events ${err}`))
    return {} as EventReg
  }
}

const genFile = async (filePath: string, data: Buffer) => {
  const fp = resolve(filePath)
  return mkdirp(dirname(fp)).then(() => {
    writeFile(fp, data, (err) => {
      if (err) {
        // eslint-disable-next-line
        console.log(err)
      }
    })
  })
}

/**
 * @param docs {JsonDocs} stencil doc JSON output
 * @param config {DocsGeneratorConfig} paths to build documentation
 */
export async function generateEvents (project: ProjectReflection, output = 'docs/events/events.md'): Promise<void> {
  // EVENTS //
  const {children: declarations} = project
  const eventDocs = declarations?.reduce((acc, {
    comment, name
  }) => {
    if (comment && filterOutRegisteredEvents(comment.tags)) {
      acc[kebabCase(name)] = comment.tags
    }
    return acc
  }, {} as EventDocs)
  if (eventDocs) {
    const eventBuffer = generateEventBuffer(eventDocs, project.readme)
    genFile(output, eventBuffer)
  }
}
