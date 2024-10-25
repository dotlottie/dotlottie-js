/**
 * Copyright 2024 Design Barn Inc.
 */

import { getDotLottieVersion } from './utils';
import { DotLottieV1 } from './v1/browser';
import type { DotLottieV1Options } from './v1/common';
import { DotLottie } from './v2/browser';
import type { DotLottieOptions } from './v2/common';

export function makeDotLottie<T extends 'v1' | 'v2'>(
  version: T,
  options?: T extends 'v1' ? DotLottieV1Options : DotLottieOptions,
): T extends 'v1' ? DotLottieV1 : DotLottie {
  if (version === 'v1') {
    return new DotLottieV1(options as DotLottieV1Options) as T extends 'v1' ? DotLottieV1 : DotLottie;
  }

  return new DotLottie(options as DotLottieOptions) as T extends 'v1' ? DotLottieV1 : DotLottie;
}

export async function toDotLottieV2(arrayBuffer: ArrayBuffer): Promise<DotLottie> {
  const version = getDotLottieVersion(new Uint8Array(arrayBuffer));

  if (version === '1.0.0') {
    const dotLottieV2 = new DotLottie();
    const dotLottieV1 = await new DotLottieV1().fromArrayBuffer(arrayBuffer);

    await dotLottieV1.build();

    const animationIds = dotLottieV1.animations.map((animation) => animation.id);

    for (const animationId of animationIds) {
      const animation = await dotLottieV1.getAnimation(animationId, { inlineAssets: true });

      if (animation && animation.data) {
        dotLottieV2.addAnimation({
          data: animation.data,
          id: animationId,
        });
      }
    }

    return dotLottieV2;
  }

  return new DotLottie().fromArrayBuffer(arrayBuffer);
}

export async function toDotLottieV1(arrayBuffer: ArrayBuffer): Promise<DotLottieV1> {
  const version = getDotLottieVersion(new Uint8Array(arrayBuffer));

  if (version === '2.0.0') {
    const dotLottieV1 = new DotLottieV1();

    const dotLottieV2 = await new DotLottie().fromArrayBuffer(arrayBuffer);

    await dotLottieV2.build();

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
  } else {
    return new DotLottieV1().fromArrayBuffer(arrayBuffer);
  }
}

export * from './v2/browser';
