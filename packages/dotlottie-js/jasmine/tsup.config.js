/**
 * Copyright 2022 Design Barn Inc.
 */

import { defineConfig } from 'tsup';

export default defineConfig(({ platform }) => {
  const config = {
    clean: true,
    entry: platform === 'browser' ? ['src/tests/**/*-browser.spec.ts'] : ['src/tests/**/*-node.spec.ts'],
    format: ['esm'],
    treeshake: true,
    outDir: 'src/tests/dist',
    platform,
    target: ['esnext'],
    tsconfig: 'tsconfig.build.json',
    noExternal: platform === 'browser' ? ['fflate', 'browser-image-hash'] : ['browser-image-hash'],
    loader: {
      '.lottie': 'binary',
      '.lss': 'text',
    },
    outExtension: ({ format }) => ({
      js: `.${format === 'esm' ? 'mjs' : format}`,
    }),
  };

  return config;
});
