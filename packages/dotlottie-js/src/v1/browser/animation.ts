/**
 * Copyright 2023 Design Barn Inc.
 */

import type { Animation as AnimationType } from '@lottie-animation-community/lottie-types';

import { DotLottieError, getExtensionTypeFromBase64, isAudioAsset } from '../../utils';
import type { AnimationOptionsV1 } from '../common';
import { LottieAnimationCommonV1 } from '../common';

import { LottieAudioV1 } from './audio';
import { LottieImageV1 } from './image';

export class LottieAnimationV1 extends LottieAnimationCommonV1 {
  public constructor(options: AnimationOptionsV1) {
    super(options);
  }

  /**
   * Return the animation data as a base64 encoded string.
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
   *
   * Extract image assets from the animation.
   *
   * @returns boolean - true on error otherwise false on success
   */
  protected override async _extractImageAssets(): Promise<boolean> {
    if (!this._data) throw new DotLottieError('Failed to extract image assets: Animation data does not exist');

    const animationAssets = this._data.assets as AnimationType['assets'];

    if (!animationAssets) throw new DotLottieError('Failed to extract image assets: No assets found inside animation');

    for (const asset of animationAssets) {
      if ('w' in asset && 'h' in asset && !('xt' in asset) && 'p' in asset) {
        const imageData = asset.p.split(',');

        // Image data is invalid
        if (!imageData.length || !imageData[0] || !imageData[1]) {
          break;
        }

        let extType = null;
        const fileType = await getExtensionTypeFromBase64(asset.p);

        // If we don't recognize the file type, we leave it inside the animation as is.
        if (fileType) {
          extType = fileType;

          const fileName = `${asset.id}.${extType}`;

          this._imageAssets.push(
            new LottieImageV1({
              data: asset.p,
              id: asset.id,
              lottieAssetId: asset.id,
              fileName,
              parentAnimations: [this],
            }),
          );

          asset.p = fileName;
          asset.u = '/images/';
          asset.e = 0;
        }
      }
    }

    return false;
  }

  /**
   *
   * Extract audio assets from the animation.
   *
   * @returns boolean - true on error otherwise false on success
   */
  protected override async _extractAudioAssets(): Promise<boolean> {
    if (!this._data) throw new DotLottieError('Failed to extract audio assets: Animation data does not exist');

    const animationAssets = this._data.assets as AnimationType['assets'];

    if (!animationAssets) throw new DotLottieError('Failed to extract image assets: No assets found inside animation');

    for (const asset of animationAssets) {
      if (isAudioAsset(asset)) {
        const audioData = asset.p.split(',');

        // Audio data is invalid
        if (!audioData.length || !audioData[0] || !audioData[1]) {
          break;
        }

        let extType = null;
        const fileType = await getExtensionTypeFromBase64(asset.p);

        extType = fileType;

        const fileName = `${asset.id}.${extType}`;

        this._audioAssets.push(
          new LottieAudioV1({
            data: asset.p,
            id: asset.id,
            fileName,
            parentAnimations: [this],
          }),
        );

        asset.p = fileName;
        asset.u = '/audio/';
        asset.e = 0;
      }
    }

    return false;
  }
}
