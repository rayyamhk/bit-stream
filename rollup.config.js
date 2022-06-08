import { terser } from 'rollup-plugin-terser';
import { babel } from '@rollup/plugin-babel';

export default {
  input: 'index.js',
  output: [
    {
      file: 'dist/index.cjs',
      format: 'cjs',
    },
    {
      file: 'dist/index.mjs',
      format: 'es',
    },
    {
      file: 'dist/index.min.js',
      format: 'iife',
      name: 'BitStream',
      plugins: [terser()],
    }
  ],
  plugins: [babel({ babelHelpers: 'bundled' })],
};
