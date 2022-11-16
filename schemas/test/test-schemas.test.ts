import { readFileSync } from 'fs'
import { resolve } from 'path'
import * as path from 'path'

import type { SchemaObject } from 'ajv'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { expect } from 'chai'
import { glob } from 'glob'

const loadJson = (schemaAbsPath: string): SchemaObject => {
  const fileBuffer = readFileSync(schemaAbsPath)
  return JSON.parse(fileBuffer.toString()) as SchemaObject
}

describe('Test schemas', () => {
  const schemasDirPath = resolve(__dirname, '..')
  const schemaTestDirPath = resolve(__dirname, '.')

  const schemasAbsPaths = glob.sync(`${schemasDirPath}/**/*.schema.json`)

  schemasAbsPaths.forEach(schemaAbsPath => {
    const schemaRelPath = schemaAbsPath.replace(schemasDirPath, '')

    describe(schemaRelPath, () => {
      const schema = loadJson(schemaAbsPath)

      const ajv = addFormats(new Ajv())
      const validate = ajv.compile(schema)

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
