/**
 * Copyright 2023 Design Barn Inc.
 */

import type { Animation as AnimationType } from '@lottie-animation-community/lottie-types';

import { DotLottieError } from '../../../utils';
import { LottieImage } from '../../browser/image';
import type { LottieAnimationCommon } from '../animation';
import type { LottieImageCommon } from '../image';
import { DotLottiePlugin } from '../plugin';

interface LottieImageCompare {
  excludeFromExport: boolean;
  hash: string | undefined;
  image: LottieImageCommon;
}

export class DuplicateImageDetectorCommon extends DotLottiePlugin {
  public async generatePhash(_image: LottieImageCommon): Promise<string> {
    throw new DotLottieError(
      'generatePhash(image: LottieImageCommon): Promise<Hash> is not implemented in concrete class.',
    );
  }

  public distanceTo(_imageHash: string, _targetImageHash: string): number {
    throw new DotLottieError(
      'distanceTo(_imageHash: string, _targetImageHash: string): Promise<number> is not implemented in concrete class.',
    );
  }

  private async _createRecordOfDuplicates(): Promise<Record<string, LottieImageCommon[]>> {
    this._requireDotLottie(this.dotlottie);

    const images: LottieImageCompare[] = [];
    const recordOfDuplicates: Record<string, LottieImageCommon[]> = {};

    // push all of the animation image assets in to the images array
    for (const animation of this.dotlottie.animations) {
      for (const image of animation.imageAssets) {
        images.push({
          excludeFromExport: false,
          image,
          hash: await this.generatePhash(image),
        });
      }
    }

    // For every array of images
    // Loop over the images of the array
    for (const image of images) {
      // Now that we have a single image of the image array, compare it to every other image in the arry
      for (const compareImage of images) {
        if (
          image.image.lottieAssetId !== compareImage.image.lottieAssetId &&
          !image.excludeFromExport &&
          !compareImage.excludeFromExport &&
          image.hash &&
          compareImage.hash &&
          this.distanceTo(image.hash, compareImage.hash) < 5
          // image.hash.getHammingDistance(compareImage.hash) < 5
        ) {
          // Check if key is already in use
          if (!recordOfDuplicates[image.image.fileName] && !recordOfDuplicates[compareImage.image.fileName]) {
            compareImage.excludeFromExport = true;

            recordOfDuplicates[image.image.fileName] = [compareImage.image];
          } else if (recordOfDuplicates[compareImage.image.fileName]) {
            // Check for duplicates, otherwise push the duplicate image
            if (
              !recordOfDuplicates[compareImage.image.fileName]?.find((item) => item.id === image.image.lottieAssetId)
            ) {
              image.excludeFromExport = true;
              recordOfDuplicates[compareImage.image.fileName]?.push(image.image);
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
            const animationAssets = animation.data.assets as AnimationType['assets'];

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

  public override async onBuild(): Promise<void> {
    this._requireDotLottie(this.dotlottie);

    // Create a record of duplicates
    const recordOfDuplicates: Record<string, LottieImageCommon[]> = await this._createRecordOfDuplicates();

    // Check the record of duplicates and repath the duplicate images
    this.dotlottie.animations.forEach((animation) => {
      this.adjustDuplicateImageAssetPath(animation, recordOfDuplicates);
    });

    // Create an array of duplicates by looping over the recordOfDuplicates and using the key as the image to use
    const clonedImages: Record<string, LottieImage> = {};
    const images = this.dotlottie.getImages();

    for (const key in recordOfDuplicates) {
      if (key) {
        for (const image of images) {
          if (image.fileName === key && image.data !== undefined) {
            clonedImages[key] = new LottieImage({
              data: image.data,
              id: image.id,
              lottieAssetId: image.lottieAssetId,
              fileName: image.fileName,
            });
          }
        }
      }
    }

    if (Object.keys(clonedImages).length !== Object.keys(recordOfDuplicates).length)
      throw new DotLottieError('The number of cloned images does not match the number of duplicate keys.');

    // For each image of recordOfDuplicates, remove itself from all the parent animations and push the clone
    for (const key in recordOfDuplicates) {
      if (key) {
        recordOfDuplicates[key]?.forEach((image) => {
          if (image.parentAnimations.length) {
            for (const parentAnimation of image.parentAnimations) {
              parentAnimation.imageAssets.splice(parentAnimation.imageAssets.indexOf(image), 1);

              const clonedImage = clonedImages[key];

              if (clonedImage !== undefined) {
                parentAnimation.imageAssets.push(clonedImage);

                clonedImage.parentAnimations.push(parentAnimation);
              }
            }
          }
        });
      }
    }
  }
}
