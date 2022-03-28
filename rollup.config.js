import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

export default [
  {
    input: 'src/otpus.js',
    output: [
      {
        name: 'otpus',
        file: pkg.browseriife,
        format: 'iife',
        sourcemap: true
    	},
      {  
        file: pkg.browser,
        format: 'es', 
        name: 'otpus',
        sourcemap: true  
      }
    ],
    plugins: [
      resolve(), 
      commonjs() 
      ,terser()
    ]
  },

  {
    input: 'src/otpus.js',
    output: [
      { file: pkg.cjs, format: 'cjs' },
      { file: pkg.esm, format: 'es' }
    ],
  	plugins: [resolve(), commonjs()]
  }
]
