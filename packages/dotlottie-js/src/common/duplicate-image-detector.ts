/**
 * Copyright 2023 Design Barn Inc.
 */

import type { Animation } from '@lottiefiles/lottie-types';

import { DotLottiePlugin } from './dotlottie-plugin';
import type { LottieAnimationCommon } from './lottie-animation-common';
import type { LottieImageCommon } from './lottie-image-common';

export class DuplicateImageDetector extends DotLottiePlugin {
  private async _createRecordOfDuplicates(): Promise<Record<string, LottieImageCommon[]>> {
    this._requireDotLottie(this.dotlottie);

    const images: Map<string, LottieImageCommon[]> = new Map();
    const recordOfDuplicates: Record<string, LottieImageCommon[]> = {};

    this.dotlottie.animations.forEach((animation) => {
      images.set(animation.id, animation.imageAssets);
    });

    // For every array of images
    for (const [, value] of images) {
      // Loop over the images of the array
      for (const image of value) {
        // Now that we have a single image of the image array, compare it to every other image in the arry
        for (const [, compareValue] of images) {
          for (const compareImage of compareValue) {
            if (
              image.id !== compareImage.id &&
              !image.excludeFromExport &&
              !compareImage.excludeFromExport &&
              (await image.distanceTo(compareImage)) < 5
            ) {
              // Check if key is already in use
              if (!recordOfDuplicates[image.fileName] && !recordOfDuplicates[compareImage.fileName]) {
                compareImage.excludeFromExport = true;

                recordOfDuplicates[image.fileName] = [compareImage];
              } else if (recordOfDuplicates[compareImage.fileName]) {
                // Check for duplicates, otherwise push the duplicate image
                if (!recordOfDuplicates[compareImage.fileName]?.find((item) => item.id === image.id)) {
                  image.excludeFromExport = true;
                  recordOfDuplicates[compareImage.fileName]?.push(image);
                }
              }
            }
          }
        }
      }
    }

    return recordOfDuplicates;
  }

  /**
   * Apply the image path to all duplicate images.
   *
   * @param recordOfDuplicates - A record of duplicate images, the key being a fileName,
   * the value being the identical LottieImageCommon object.
   */
  public adjustDuplicateImageAssetPath(
    animation: LottieAnimationCommon,
    recordOfDuplicates: Record<string, LottieImageCommon[]>,
  ): void {
    for (const key in recordOfDuplicates) {
      if (key) {
        recordOfDuplicates[key]?.forEach((item) => {
          // Check if this animation has the image before loop over data to save time ?

          if (animation.data) {
            const animationAssets = animation.data.assets as Animation['assets'];

            if (animationAssets) {
              animationAssets.forEach((asset) => {
                if ('w' in asset && 'h' in asset) {
                  // we've found an asset id thats equal to the id of a duplicate image
                  // Or we found the fileName of a duplicate inside the asset, so we need to change it

                  if (asset.p === item.fileName) {
                    const fileName = key;

                    asset.p = fileName;
                  }
                }
              });
            }
          }
        });
      }
    }
  }

  /**
   * Loops through the LotteImages of this object and removes duplicate images.
   * @param recordOfDuplicates -  A record containing an image fileName as key, and all the LottieImageCommons of which are duplicates to the key.
   */
  public filterOutDuplicates(
    animation: LottieAnimationCommon,
    recordOfDuplicates: Record<string, LottieImageCommon[]>,
  ): void {
    // Decrement in loop so that the indexes don't get messed up as we remove elements
    for (let j = animation.imageAssets.length - 1; j >= 0; j -= 1) {
      for (const key in recordOfDuplicates) {
        if (key && recordOfDuplicates[key] !== undefined) {
          recordOfDuplicates[key]?.forEach((image) => {
            if (image.id === animation.imageAssets.at(j)?.id) {
              const imageAsset = animation.imageAssets.at(j);

              if (imageAsset) {
                imageAsset.excludeFromExport = true;
              }
            }
          });
        }
      }
    }
  }

  public override async onBuild(): Promise<void> {
    this._requireDotLottie(this.dotlottie);

    for (const animation of this.dotlottie.animations) {
      for (const image of animation.imageAssets) {
        await image.generatePhash();
      }
    }

    // Create a record of duplicates
    const recordOfDuplicates: Record<string, LottieImageCommon[]> = await this._createRecordOfDuplicates();

    // Check the record of duplicates and repath the duplicate images
    this.dotlottie.animations.forEach((animation) => {
      this.adjustDuplicateImageAssetPath(animation, recordOfDuplicates);
      this.filterOutDuplicates(animation, recordOfDuplicates);
    });
  }
}
