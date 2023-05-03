/**
 * Copyright 2023 Design Barn Inc.
 */

import type { Animation } from '@lottiefiles/lottie-types';
import type { Hash } from 'browser-image-hash';
import { DifferenceHashBuilder } from 'browser-image-hash';

import { LottieImage } from '../lottie-image';

import { DotLottiePlugin } from './dotlottie-plugin';
import type { LottieAnimationCommon } from './lottie-animation-common';
import type { LottieImageCommon } from './lottie-image-common';
import { createError } from './utils';

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
              (await this.distanceTo(image, compareImage)) < 5
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

  public async distanceTo(image: LottieImageCommon, imageToCompare: LottieImageCommon): Promise<number> {
    if (image.dhash && imageToCompare.dhash) {
      return image.dhash.getHammingDistance(imageToCompare.dhash);
    }

    return 0;
  }

  public async generatePhash(image: LottieImageCommon): Promise<Hash> {
    const builder = new DifferenceHashBuilder();
    const targetURL = new URL(await image.toDataURL());

    const destHash = await builder.build(targetURL);

    return destHash;
  }

  public override async onBuild(): Promise<void> {
    this._requireDotLottie(this.dotlottie);

    for (const animation of this.dotlottie.animations) {
      for (const image of animation.imageAssets) {
        image.dhash = await this.generatePhash(image);
      }
    }

    // Create a record of duplicates
    const recordOfDuplicates: Record<string, LottieImageCommon[]> = await this._createRecordOfDuplicates();

    // Check the record of duplicates and repath the duplicate images
    this.dotlottie.animations.forEach((animation) => {
      this.adjustDuplicateImageAssetPath(animation, recordOfDuplicates);
      // this.filterOutDuplicates(animation, recordOfDuplicates);
    });

    // Create an array of duplicates by looping over the recordOfDuplicates and using the key as the image to use
    const clonedImages: Record<string, LottieImage> = {};

    for (const key in recordOfDuplicates) {
      if (key) {
        for (const image of this.dotlottie.getImages()) {
          if (image.fileName === key && image.data !== undefined) {
            clonedImages[key] = new LottieImage({
              data: image.data,
              id: image.id,
              fileName: image.fileName,
            });
          }
        }
      }
    }

    if (Object.keys(clonedImages).length !== Object.keys(recordOfDuplicates).length)
      createError('The number of cloned images does not match the number of duplicate keys.');

    // For each image of recordOfDuplicates, remove itself from all the parent animations and push the clone
    for (const key in recordOfDuplicates) {
      if (key) {
        recordOfDuplicates[key]?.forEach((image) => {
          if (image.parentAnimation?.length) {
            for (const parentAnimation of image.parentAnimation) {
              parentAnimation.imageAssets.splice(parentAnimation.imageAssets.indexOf(image), 1);

              const clonedImage = clonedImages[key];

              if (clonedImage !== undefined) {
                parentAnimation.imageAssets.push(clonedImage);
              }
            }
          }
        });
      }
    }
  }
}
