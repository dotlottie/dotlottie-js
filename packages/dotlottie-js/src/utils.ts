/**
 * Copyright 2024 Design Barn Inc.
 */

import { unzipSync } from 'fflate';

export function getDotLottieVersion(dotLottie: Uint8Array): string {
  const files = unzipSync(dotLottie);

  const manifest = files['manifest.json'];

  if (!manifest) {
    throw new Error('manifest.json not found');
  }

  const manifestJson = JSON.parse(manifest.toString());

  return manifestJson.version ?? '1.0.0';
}
