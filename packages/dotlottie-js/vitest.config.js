/**
 * Copyright 2024 Design Barn Inc.
 */

import arraybuffer from 'vite-plugin-arraybuffer';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [arraybuffer()],
  assetsInclude: '**/*.lottie',
  test: {
    include: ['./src/**/__tests__/node/**/*.{test,spec}.ts', './src/**/__tests__/**/*.node.{test,spec}.ts'],
    name: 'node',
  },
});
