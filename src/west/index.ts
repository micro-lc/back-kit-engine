import 'jest'
import * as options from './options'

const {
  describe, afterAll, afterEach, beforeAll, beforeEach
} = global
const runtime = {
  describe, afterAll, afterEach, beforeAll, beforeEach, ...options
}

export {runtime}
