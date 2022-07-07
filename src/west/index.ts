import 'jest'
import {
  it, options
} from './options'

const {
  describe, afterAll, afterEach, beforeAll, beforeEach
} = global
const runtime = {
  it, options, describe, afterAll, afterEach, beforeAll, beforeEach
}
export {runtime}
