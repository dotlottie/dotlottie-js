/**
 * Copyright 2023 Design Barn Inc.
 */

/* eslint-disable @typescript-eslint/no-use-before-define */

import type { ConversionOptions } from '../../types';
import { getDotLottieVersion } from '../../utils';
import { DotLottieV1 } from '../../v1/browser';
import type { DotLottieOptions } from '../common';
import { DotLottieCommon } from '../common';

import { DuplicateImageDetector } from './plugins/duplicate-image-detector';

export async function toDotLottieV2(arrayBuffer: ArrayBuffer): Promise<DotLottie> {
  const version = await getDotLottieVersion(new Uint8Array(arrayBuffer));

  // Assume it's a v1 file if the version is not 2
  if (version !== '2') {
    const dotLottieV2 = new DotLottie();
    const dotLottieV1 = await new DotLottieV1().fromArrayBuffer(arrayBuffer);

    const animationIds = dotLottieV1.animations.map((animation) => animation.id);

    for (const animationId of animationIds) {
      const animation = await dotLottieV1.getAnimation(animationId, { inlineAssets: true });
      const v1Settings = dotLottieV1.animations.find((anim) => anim.id === animationId);

      if (animation && animation.data) {
        dotLottieV2.addAnimation({
          data: animation.data,
          id: animationId,
          defaultActiveAnimation: v1Settings?.defaultActiveAnimation ?? false,
        });
      }
    }

    await dotLottieV2.build();

    return dotLottieV2;
  }

  return new DotLottie().fromArrayBuffer(arrayBuffer);
}

export class DotLottie extends DotLottieCommon {
  public constructor(options?: DotLottieOptions) {
    super(options);

    if (this.enableDuplicateImageOptimization) {
      const plugin = new DuplicateImageDetector();

      plugin.install(this);

      this._plugins.push(plugin);
    }
  }

  public override create(options?: DotLottieOptions): DotLottieCommon {
    return new DotLottie(options);
  }

  public override async download(fileName: string, options?: ConversionOptions): Promise<void> {
    const blob = await this.toBlob(options);

    const dataURL = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = dataURL;

    link.download = fileName;

    link.style.display = 'none';

    document.body.append(link);

    link.click();

    setTimeout(() => {
      URL.revokeObjectURL(dataURL);
      link.remove();
    }, 1000);
  }

  protected override async _fromV1ArrayBuffer(arrayBuffer: ArrayBuffer): Promise<DotLottieCommon> {
    return toDotLottieV2(arrayBuffer);
  }
}
