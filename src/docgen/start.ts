import {
  Application, TSConfigReader, TypeDocReader
} from 'typedoc'
import yargs from 'yargs'

import {generateComponents} from './components'
import {generateEvents} from './events'

const RUN_TYPES = ['events', 'components']
const PARAMS = [
  {
    name: 'entryPoints', default: []
  },
  {
    name: 'tsconfig', default: ['tsconfig.json']
  },
  {
    name: 'type', default: []
  },
  {
    name: 'rel', default: []
  },
  {name: 'output'}
]

export async function main (proc: NodeJS.Process = process) {
  const params = yargs(proc.argv.slice(2)).argv as Record<string, any | any[] | undefined>
  const app = new Application()

  const {
    entryPoints, tsconfig, type, output, rel
  } = PARAMS.reduce<Record<string, any[]>>((acc, {
    name, default: d
  }) => {
    if (!params[name] && d) {
      acc[name] = d
    } else if (!Array.isArray(params[name])) {
      acc[name] = [params[name]]
    } else {
      acc[name] = params[name]
    }

    return acc
  }, {})

  // If you want TypeDoc to load tsconfig.json / typedoc.json files
  app.options.addReader(new TSConfigReader())
  app.options.addReader(new TypeDocReader())

  app.bootstrap({
    entryPoints,
    tsconfig: tsconfig?.[0]
  })

  if (!type[0]) {
    // eslint-disable-next-line no-console
    console.error(`specify one type: ${RUN_TYPES.join(', ')}`)
    proc.exit(1)
  }

  const project = app.convert()

  if (project && output) {
    switch (type[0]) {
    case 'events':
      generateEvents(project, output[0])
      return
    case 'components':
      generateComponents(project, output[0], rel[0])
      return
    default:
      // eslint-disable-next-line no-console
      console.error(`specify one type: ${RUN_TYPES.join(', ')}`)
    }
  }
}
