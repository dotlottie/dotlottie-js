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
    entry: ['./src/v1/browser/*.ts'],
    outDir: './dist/v1/browser',
    platform: 'browser',
    target: ['es2020'],
    noExternal: ['browser-image-hash'],
  },
  {
    ...commonConfig,
    entry: ['./src/v1/node/*.ts'],
    outDir: './dist/v1/node',
    platform: 'node',
    target: ['node18'],
  },
  {
    ...commonConfig,
    entry: ['./src/v2/browser/*.ts'],
    outDir: './dist/v2/browser',
    platform: 'browser',
    target: ['es2020'],
    noExternal: ['browser-image-hash'],
  },
  {
    ...commonConfig,
    entry: ['./src/v2/node/*.ts'],
    outDir: './dist/v2/node',
    platform: 'node',
    target: ['node18'],
  },
]);
