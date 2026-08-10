/**
 * Copyright 2023 Design Barn Inc.
 */

/* eslint-disable @typescript-eslint/no-use-before-define */

import type { ConversionOptions } from '../../types';
import { DotLottieError, getDotLottieVersion } from '../../utils';
import { DotLottie } from '../../v2/node';
import type { DotLottieV1Options } from '../common';
import { DotLottieCommonV1 } from '../common';

import { DuplicateImageDetector } from './plugins/duplicate-image-detector';

export async function toDotLottieV1(arrayBuffer: ArrayBuffer): Promise<DotLottieV1> {
  const version = await getDotLottieVersion(new Uint8Array(arrayBuffer));

  if (version === '2') {
    const dotLottieV1 = new DotLottieV1();

    const dotLottieV2 = await new DotLottie().fromArrayBuffer(arrayBuffer);

    const animationIds = dotLottieV2.animations.map((animation) => animation.id);

    for (const animationId of animationIds) {
      const animation = await dotLottieV2.getAnimation(animationId, { inlineAssets: true });

      if (animation && animation.data) {
        dotLottieV1.addAnimation({
          data: animation.data,
          id: animationId,
        });
      }
    }

    await dotLottieV1.build();

    return dotLottieV1;
  }

  return new DotLottieV1().fromArrayBuffer(arrayBuffer);
}

export class DotLottieV1 extends DotLottieCommonV1 {
  public constructor(options?: DotLottieV1Options) {
    super(options);

    if (this.enableDuplicateImageOptimization) {
      const plugin = new DuplicateImageDetector();

      plugin.install(this);

      this._plugins.push(plugin);
    }
  }

  public override create(options?: DotLottieV1Options): DotLottieCommonV1 {
    return new DotLottieV1(options);
  }

  public override async download(_fileName: string, _options?: ConversionOptions): Promise<void> {
    throw new DotLottieError('Cannot download dotlottie in a non-browser environment');
  }

  protected override async _fromV2ArrayBuffer(arrayBuffer: ArrayBuffer): Promise<DotLottieCommonV1> {
    return toDotLottieV1(arrayBuffer);
  }
}
