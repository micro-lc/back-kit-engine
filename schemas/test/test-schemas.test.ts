import { readFileSync } from 'fs'
import { resolve } from 'path'
import * as path from 'path'

import type { SchemaObject } from 'ajv'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { expect } from 'chai'
import { glob } from 'glob'

export type SchemaWithDefinitions = SchemaObject & { definitions?: Record<string, SchemaObject> }

interface LoadedSchema {
  absPath: string
  id: string
  schema: SchemaWithDefinitions
}

const loadJson = (schemaAbsPath: string): SchemaObject => {
  const fileBuffer = readFileSync(schemaAbsPath)
  return JSON.parse(fileBuffer.toString()) as SchemaObject
}

export const loadSchemas = (schemasPaths: string[]): LoadedSchema[] => {
  const loadedSchemas: LoadedSchema[] = []

  return schemasPaths.reduce((acc, currPath) => {
    const schema = loadJson(currPath) as SchemaWithDefinitions
    return [...acc, { absPath: currPath, id: schema.$id ?? currPath, schema }]
  }, loadedSchemas)
}

describe('Test schemas', () => {
  const schemasDirPath = resolve(__dirname, '..')
  const schemaTestDirPath = resolve(__dirname, '.')

  const schemasAbsPaths = glob.sync(`${schemasDirPath}/**/*.schema.json`)

  schemasAbsPaths.forEach(schemaAbsPath => {
    const schemaRelPath = schemaAbsPath.replace(schemasDirPath, '')

    describe(schemaRelPath, () => {
      const loadedSchemas = loadSchemas(schemasAbsPaths)
      const configSchema = loadedSchemas.find(({ absPath }) => absPath === schemaAbsPath)?.schema

      const auxiliarySchemas = loadedSchemas
        .filter(({ absPath }) => absPath !== schemaAbsPath)
        .map(({ schema: auxiliarySchema }) => auxiliarySchema)

      const ajv = addFormats(new Ajv())
      ajv.addSchema(auxiliarySchemas)

      const validate = ajv.compile(configSchema as SchemaObject)

      const pathSegments = path.parse(schemaAbsPath)
      const [schemaName] = pathSegments.name.split('.')

      const testFilesAbsPaths = glob.sync(`${schemaTestDirPath}/${schemaName}/*.json`)

      testFilesAbsPaths.forEach(testFileAbsPath => {
        const testFileRelPath = testFileAbsPath.replace(schemaTestDirPath, '')

        it(testFileRelPath, () => {
          const testJson = loadJson(testFileAbsPath)

          const isValid = validate(testJson)
          expect(isValid, JSON.stringify(validate.errors)).to.be.true
        })
      })
    })
  })
})
