/**
 * Copyright 2023 Design Barn Inc.
 */

import phash from 'sharp-phash';

import { DuplicateImageDetectorCommon } from '../common/duplicate-image-detector-common';
import type { LottieImageCommon } from '../common/lottie-image-common';
import { createError } from '../common/utils';

export class DuplicateImageDetector extends DuplicateImageDetectorCommon {
  public override distanceTo(imageHash: string, targetImageHash: string): number {
    let count = 0;

    for (let i = 0; i < targetImageHash.length; i += 1) {
      if (targetImageHash[i] !== imageHash[i]) {
        count += 1;
      }
    }

    return count;
  }

  public override async generatePhash(image: LottieImageCommon): Promise<string> {
    if (!image.data) {
      createError("Can't generate phash value.");
    }

    const nBuf = await image.toArrayBuffer();

    const decoder = new TextDecoder();

    let phashValue = null;

    phashValue = await phash(Buffer.from(decoder.decode(nBuf), 'base64'));

    return phashValue;
  }
}
