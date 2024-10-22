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
    entry: ['./src/v1/*.ts'],
    outDir: './dist/v1',
    platform: 'neutral',
    target: ['es2020', 'node18'],
  },
  {
    ...commonConfig,
    entry: ['./src/v2/*.ts'],
    outDir: './dist/v2',
    platform: 'neutral',
    target: ['es2020', 'node18'],
    noExternal: ['browser-image-hash'],
  },
]);
