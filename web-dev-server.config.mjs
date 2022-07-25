import rollupAlias from '@rollup/plugin-alias'
import rollupReplace from '@rollup/plugin-replace'
import {esbuildPlugin} from '@web/dev-server-esbuild'
import {fromRollup} from '@web/dev-server-rollup'
import rollupCss from 'rollup-plugin-import-css'

const alias = fromRollup(rollupAlias)
const replace = fromRollup(rollupReplace)
const css = fromRollup(rollupCss)

/** @type {import('@web/dev-server').DevServerConfig} */
export default {
  mimeTypes: {
    '**/antd.min.css': 'js'
  },
  plugins: [
    alias({
      entries: {
        'chai-as-promised': '@esm-bundle/chai-as-promised',
        react: '@esm-bundle/react',
        'react-dom': '@esm-bundle/react-dom',
        'react-is': '@esm-bundle/react-is',
        classnames: '@esm-bundle/classnames',
        lodash: 'lodash-es'
      }
    }),
    css(),
    esbuildPlugin({ts: true, target: 'ES2020'}),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    }, {preventAssignment: true})
  ]
}
