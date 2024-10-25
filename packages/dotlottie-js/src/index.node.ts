/**
 * Copyright 2024 Design Barn Inc.
 */

import { getDotLottieVersion } from './utils';
import type { DotLottieV1Options } from './v1/common';
import { DotLottieV1 } from './v1/node';
import type { DotLottieOptions } from './v2/common';
import { DotLottie } from './v2/node';

export function makeDotLottie<T extends 'v1' | 'v2'>(
  version: T,
  options?: T extends 'v1' ? DotLottieV1Options : DotLottieOptions,
): T extends 'v1' ? DotLottieV1 : DotLottie {
  if (version === 'v1') {
    return new DotLottieV1(options as DotLottieV1Options) as T extends 'v1' ? DotLottieV1 : DotLottie;
  }

  return new DotLottie(options as DotLottieOptions) as T extends 'v1' ? DotLottieV1 : DotLottie;
}

export async function fromArrayBuffer(arrayBuffer: ArrayBuffer): Promise<DotLottieV1 | DotLottie> {
  const version = getDotLottieVersion(new Uint8Array(arrayBuffer));

  if (version === '2.0.0') {
    return new DotLottie().fromArrayBuffer(arrayBuffer);
  }

  return new DotLottieV1().fromArrayBuffer(arrayBuffer);
}

export async function toDotLottieV2(dotLottie: DotLottieV1): Promise<DotLottie> {
  const dotLottieV2 = new DotLottie();

  const animationIds = dotLottie.animations.map((animation) => animation.id);

  for (const animationId of animationIds) {
    const animation = await dotLottieV2.getAnimation(animationId, { inlineAssets: true });

    if (animation && animation.data) {
      dotLottieV2.addAnimation({
        data: animation.data,
        id: animationId,
      });
    }
  }

  await dotLottieV2.build();

  return dotLottieV2;
}

export async function toDotLottieV1(dotLottie: DotLottie): Promise<DotLottieV1> {
  await dotLottie.build();

  const dotLottieV1 = new DotLottieV1();

  const animationIds = dotLottie.animations.map((animation) => animation.id);

  for (const animationId of animationIds) {
    const animation = await dotLottie.getAnimation(animationId);

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

export * from './v2/node';
