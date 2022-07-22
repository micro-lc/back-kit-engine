import rollupAlias from '@rollup/plugin-alias'
// import rollupReplace from '@rollup/plugin-replace'
import {esbuildPlugin} from '@web/dev-server-esbuild'
import {fromRollup} from '@web/dev-server-rollup'

const alias = fromRollup(rollupAlias)
// const replace = fromRollup(rollupReplace)

/** @type {import('@web/test-runner').TestRunnerConfig} */
export default {
  plugins: [
    alias({
      entries: {
        'chai-as-promised': '@esm-bundle/chai-as-promised',
        react: '@esm-bundle/react',
        'react-dom': '@esm-bundle/react-dom',
        'react-is': '@esm-bundle/react-is',
        classnames: '@esm-bundle/classnames'
      }
    }),
    esbuildPlugin({ts: true, target: 'ES2020'}),
  ],
  coverageConfig: {
    report: true,
    reportDir: 'coverage/e2e',
    reporters: ['cobertura', 'lcovonly', 'text-summary'],
    include: ['src/**/*.ts']
  }
}
