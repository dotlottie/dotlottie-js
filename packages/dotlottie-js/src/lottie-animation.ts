/**
 * Copyright 2023 Design Barn Inc.
 */

import type { Animation } from '@lottiefiles/lottie-types';

import type { AnimationOptions } from './common';
import { LottieAnimationCommon, createError } from './common';
import { LottieImage } from './lottie-image';
import { getExtensionTypeFromBase64 } from './utils';

export class LottieAnimation extends LottieAnimationCommon {
  public constructor(options: AnimationOptions) {
    super(options);
  }

  /**
   * Return the animation data as a base 64 encoded string.
   *
   * @returns data - The animation data as a base64 encoded string.
   * @throws Error - if the animation data is not set and the url is not provided.
   * @throws Error - if the animation data is not a valid Lottie animation data object.
   * @throws Error - if the fetch request fails.
   */
  public override async toBase64(): Promise<string> {
    const data = await this.toArrayBuffer();

    if (typeof window === 'undefined') return Buffer.from(data).toString('base64');

    const uint8Array = new Uint8Array(data);
    const binaryString = uint8Array.reduce((acc, val) => acc + String.fromCharCode(val), '');

    return window.btoa(binaryString);
  }

  /**
   * Extract image assets from the anima tion.
   *
   * @returns boolean - true on error otherwise false on success
   */
  protected override async _extractImageAssets(): Promise<boolean> {
    if (!this._data) throw createError('Asset extraction failed.');

    const animationAssets = this._data.assets as Animation['assets'];

    if (!animationAssets) throw createError('Asset extraction failed.');

    for (const asset of animationAssets) {
      if ('w' in asset && 'h' in asset && !('xt' in asset) && 'p' in asset) {
        const imageData = asset.p.split(',');

        // Image data is invalid
        if (!imageData.length || !imageData[0] || !imageData[1]) {
          break;
        }

        let extType = null;
        const fileType = getExtensionTypeFromBase64(asset.p);

        extType = fileType;

        const fileName = `${asset.id}.${extType}`;

        this._imageAssets.push(
          new LottieImage({
            data: asset.p,
            id: asset.id,
            fileName,
            parentAnimations: [this],
          }),
        );

        asset.p = fileName;
        asset.u = '/images/';
        asset.e = 0;
      }
    }

    return false;
  }
}
