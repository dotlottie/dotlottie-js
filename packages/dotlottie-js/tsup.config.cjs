/**
 * Copyright 2022 Design Barn Inc.
 */

import { defineConfig } from 'tsup';

import pkg from "./package.json";

const commonConfig = {
  bundle: true,
  clean: true,
  dts: true,
  format: ['esm'],
  metafile: false,
  minify: false,
  sourcemap: false,
  splitting: false,
  tsconfig: 'tsconfig.build.json',
  treeshake: true,
};

export default defineConfig([
  {
    ...commonConfig,
    entry: ['./src/index.node.ts'],
    outDir: './dist',
    platform: 'node',
    target: ['es2020', 'node18'],
  },
  {
    ...commonConfig,
    entry: ['./src/index.browser.ts'],
    outDir: './dist',
    platform: 'browser',
    target: ['es2020'],
    noExternal: Object.keys(pkg.dependencies || {}),
  },
]);
