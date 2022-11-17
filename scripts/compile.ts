import type { Format } from 'esbuild'
import { build } from 'esbuild'

import entryPoints from './glob'

const [format] = process.argv.slice(2)

const formats: Format[] = ['cjs', 'esm']
function isFormat(input: string): input is Format {
  return formats.includes(input as Format)
}

if (!(typeof format === 'string' && isFormat(format))) {
  throw new TypeError(`${format} is not a supported compilation format. Argument must be one of ${formats.join(', ')}`)
}

build({
  banner: {
    js: `
/*! 
  Copyright 2022 Mia srl

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

          http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
 */
    `,
  },
  entryPoints,
  format,
  outdir: `dist/${format}`,
}).then(() => {
  console.log(`✓ ${format}`)
}).catch(console.error)
