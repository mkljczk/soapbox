import { resolve } from 'path';

import treeShakeable from 'rollup-plugin-tree-shakeable';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

import pkg from './package.json';

export default defineConfig({
  plugins: [dts({ include: ['lib'], insertTypesEntry: true })],
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      fileName: (format) => `main.${format}.js`,
      formats: ['es'],
      name: 'pl-api',
    },
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      external: Object.keys(pkg.dependencies),
      plugins: [treeShakeable()],
    },
  },
});
