/**
 * Copyright 2023 Design Barn Inc.
 */

import { Hash, DifferenceHashBuilder } from 'browser-image-hash';

import type { LottieImageCommonV1 } from '../../common';
import { DuplicateImageDetectorCommon } from '../../common/plugins/duplicate-image-detector';

export class DuplicateImageDetector extends DuplicateImageDetectorCommon {
  public override async generatePhash(image: LottieImageCommonV1): Promise<string> {
    const builder = new DifferenceHashBuilder();
    const targetURL = new URL(await image.toDataURL());

    const destHash = await builder.build(targetURL);

    return destHash.rawHash;
  }

  public override distanceTo(imageHash: string, targetImageHash: string): number {
    const srcHash = new Hash(imageHash);
    const targetHash = new Hash(targetImageHash);

    return srcHash.getHammingDistance(targetHash);
  }
}
