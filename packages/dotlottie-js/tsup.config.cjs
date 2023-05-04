/**
 * Copyright 2022 Design Barn Inc.
 */

import { defineConfig } from 'tsup';

const commonConfig = {
  bundle: true,
  clean: true,
  dts: true,
  format: ['esm'],
  metafile: false,
  minify: false,
  sourcemap: true,
  splitting: false,
  tsconfig: 'tsconfig.build.json',
  treeshake: true,
};

export default defineConfig([
  {
    ...commonConfig,
    entry: ['./src/node/index.ts'],
    outDir: './dist/node',
    platform: 'node',
    target: ['es2020', 'node18'],
  },
  {
    ...commonConfig,
    entry: ['./src/index.ts'],
    outDir: './dist',
    platform: 'browser',
    target: ['es2020'],
    noExternal: ['browser-image-hash'],
  },
]);
