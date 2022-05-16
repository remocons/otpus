import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

export default [
  {
    input: 'src/index.js',
    output: [
      {
        name: 'otpus',
        file: pkg.browser,
        format: 'iife',
        sourcemap: true
      },
      {
        file: pkg.browser_esm,
        format: 'es',
        sourcemap: true
      }
    ],
    plugins: [
      replace({
        crypto: '',
        delimiters: ['import { webcrypto } from \'', '\''],
        preventAssignment: true
      }),
      resolve(),
      commonjs()
      , terser()
    ]
  },

  {
    input: 'src/index.js',
    output: [
      { file: pkg.cjs, format: 'cjs' },
      { file: pkg.esm, format: 'es' }
    ],
    plugins: [
      resolve(),
      commonjs()
      , terser()
    ]
  }
]
