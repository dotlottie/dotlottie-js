/**
 * Copyright 2022 Design Barn Inc.
 */

import { defineConfig } from 'tsup';

export default defineConfig(({ platform }) => {
  const config = {
    clean: true,
    entry: platform === 'browser' ? ['src/v1/tests/**/*-browser.spec.ts'] : ['src/v1/tests/**/*-node.spec.ts'],
    format: ['esm'],
    treeshake: true,
    outDir: 'src/v1/tests/dist',
    platform,
    target: ['esnext'],
    tsconfig: 'tsconfig.build.json',
    noExternal: platform === 'browser' ? ['fflate', 'browser-image-hash', 'valibot'] : ['browser-image-hash'],
    loader: {
      '.lottie': 'binary',
    },
    outExtension: ({ format }) => ({
      js: `.${format === 'esm' ? 'mjs' : format}`,
    }),
  };

  return config;
});
