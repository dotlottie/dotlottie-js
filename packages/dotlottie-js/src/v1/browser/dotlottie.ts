/**
 * Copyright 2023 Design Barn Inc.
 */

/* eslint-disable @typescript-eslint/no-use-before-define */

import type { Animation as AnimationType } from '@lottie-animation-community/lottie-types';
import type { Zippable } from 'fflate';
import { strToU8, zip, strFromU8, unzip } from 'fflate';

import type { Manifest } from '../../schemas/v1/manifest';
import {
  base64ToUint8Array,
  DotLottieError,
  getDotLottieVersion,
  getExtensionTypeFromBase64,
  isAudioAsset,
} from '../../utils';
import { DotLottie } from '../../v2/browser';
import type { AnimationOptions, DotLottieV1Options, ConversionOptions } from '../common';
import { DotLottieCommonV1 } from '../common';

import { LottieAnimationV1 } from './animation';
import { LottieAudioV1 } from './audio';
import { LottieImageV1 } from './image';
import { DuplicateImageDetector } from './plugins/duplicate-image-detector';

export async function toDotLottieV1(arrayBuffer: ArrayBuffer): Promise<DotLottieV1> {
  const version = await getDotLottieVersion(new Uint8Array(arrayBuffer));

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

export class DotLottieV1 extends DotLottieCommonV1 {
  public constructor(options?: DotLottieV1Options) {
    super(options);

    if (this.enableDuplicateImageOptimization) {
      this._plugins.push(new DuplicateImageDetector());
    }
  }

  public override addAnimation(animationOptions: AnimationOptions): DotLottieV1 {
    const animation = new LottieAnimationV1(animationOptions);

    if (this._animationsMap.get(animationOptions.id)) {
      throw new DotLottieError('Duplicate animation id detected, aborting.');
    }

    this._animationsMap.set(animation.id, animation);

    return this;
  }

  public override async toBase64(options: ConversionOptions | undefined): Promise<string> {
    const data = await this.toArrayBuffer(options);

    const uint8Array = new Uint8Array(data);
    const binaryString = uint8Array.reduce((acc, val) => acc + String.fromCharCode(val), '');

    return window.btoa(binaryString);
  }

  public override async download(fileName: string, options: ConversionOptions | undefined = undefined): Promise<void> {
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

  public override create(options?: DotLottieV1Options): DotLottieCommonV1 {
    return new DotLottieV1(options);
  }

  public override async toArrayBuffer(options?: ConversionOptions): Promise<ArrayBuffer> {
    const manifest = this._buildManifest();

    const dotLottie: Zippable = {
      'manifest.json': [strToU8(JSON.stringify(manifest)), {}],
    };

    for (const animation of this.animations) {
      const json = await animation.toJSON();

      dotLottie[`animations/${animation.id}.json`] = [strToU8(JSON.stringify(json)), animation.zipOptions];

      const imageAssets = animation.imageAssets;
      const audioAssets = animation.audioAssets;

      for (const asset of imageAssets) {
        // Assure we have a base64 encoded version of the image
        const dataAsString = await asset.toDataURL();

        dotLottie[`images/${asset.fileName}`] = [base64ToUint8Array(dataAsString), asset.zipOptions];
      }

      for (const asset of audioAssets) {
        // Assure we have a base64 encoded version of the audio
        const dataAsString = await asset.toDataURL();

        dotLottie[`audio/${asset.fileName}`] = [base64ToUint8Array(dataAsString), asset.zipOptions];
      }
    }

    const dotLottieArrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      zip(dotLottie, options?.zipOptions || {}, (err, data) => {
        if (err) {
          reject(err);

          return;
        }

        resolve(data.buffer);
      });
    });

    return dotLottieArrayBuffer;
  }

  /**
   * Creates a DotLottieV1 instance from an array buffer
   * @param arrayBuffer - array buffer of the DotLottieV1 file
   * @returns DotLottieV1 instance
   * @throws Error
   */
  public override async fromArrayBuffer(arrayBuffer: ArrayBuffer): Promise<DotLottieCommonV1> {
    const dotLottieVersion = await getDotLottieVersion(new Uint8Array(arrayBuffer));

    if (dotLottieVersion === '2.0.0') {
      return toDotLottieV1(arrayBuffer);
    }

    const dotLottie = new DotLottieV1();

    try {
      const contentObj = await new Promise<Zippable>((resolve, reject) => {
        unzip(new Uint8Array(arrayBuffer), (err, data) => {
          if (err) {
            reject(err);
          }

          resolve(data);
        });
      });

      const tmpImages = [];
      const tmpAudio = [];

      if (contentObj['manifest.json'] instanceof Uint8Array) {
        // valid buffer
        try {
          // Parse the manifest first so that we can pick up animation settings
          const manifest = JSON.parse(strFromU8(contentObj['manifest.json'], false)) as Manifest;
          const { author, custom, description, generator, keywords } = manifest;

          if (author) {
            this._requireValidAuthor(author);
            dotLottie.setAuthor(author);
          }
          if (custom) {
            this._requireValidCustomData(custom);
            dotLottie.setCustomData(custom);
          }
          if (description) {
            this._requireValidDescription(description);
            dotLottie.setDescription(description);
          }
          if (generator) {
            this._requireValidGenerator(generator);
            dotLottie.setGenerator(generator);
          }
          if (keywords) {
            this._requireValidKeywords(keywords);
            dotLottie.setKeywords(keywords);
          }

          for (const key of Object.keys(contentObj)) {
            // true is passed to use binary string, otherwise btoa fails
            const decodedStr = strFromU8(contentObj[key] as Uint8Array, true);

            if (key.startsWith('animations/') && key.endsWith('.json')) {
              // extract animationId from key as the key = `animations/${animationId}.json`
              const animationId = /animations\/(.+)\.json/u.exec(key)?.[1];

              if (!animationId) {
                throw new DotLottieError('Invalid animation id');
              }

              const animation = JSON.parse(decodedStr);

              const animationSettings = manifest.animations.find((anim) => anim.id === animationId);

              if (animationSettings === undefined) {
                throw new DotLottieError('Animation not found inside manifest');
              }

              dotLottie.addAnimation({
                data: animation,
                ...animationSettings,
              });
            } else if (key.startsWith('images/')) {
              // extract imageId from key as the key = `images/${imageId}.${ext}`
              const imageId = /images\/(.+)\./u.exec(key)?.[1];

              if (!imageId) {
                throw new DotLottieError('Invalid image id');
              }

              let decodedImg = btoa(decodedStr);

              const ext = getExtensionTypeFromBase64(decodedImg);

              // Push the images in to a temporary array
              decodedImg = `data:image/${ext};base64,${decodedImg}`;
              tmpImages.push(
                new LottieImageV1({
                  id: imageId,
                  data: decodedImg,
                  fileName: key.split('/')[1] || '',
                }),
              );
            } else if (key.startsWith('audio/')) {
              // extract audioId from key as the key = `audio/${audioId}.${ext}`
              const audioId = /audio\/(.+)\./u.exec(key)?.[1];

              if (!audioId) {
                throw new DotLottieError('Invalid image id');
              }

              let decodedAudio = btoa(decodedStr);

              const ext = getExtensionTypeFromBase64(decodedAudio);

              // Push the audio in to a temporary array
              decodedAudio = `data:audio/${ext};base64,${decodedAudio}`;
              tmpAudio.push(
                new LottieAudioV1({
                  id: audioId,
                  data: decodedAudio,
                  fileName: key.split('/')[1] || '',
                }),
              );
            }
          }

          // Go through the images and find to which animation they belong
          for (const image of tmpImages) {
            for (const parentAnimation of dotLottie.animations) {
              if (parentAnimation.data) {
                const animationAssets = parentAnimation.data.assets as AnimationType['assets'];

                if (animationAssets) {
                  for (const asset of animationAssets) {
                    if ('w' in asset && 'h' in asset) {
                      if (asset.p.includes(image.id)) {
                        image.parentAnimations.push(parentAnimation);
                        parentAnimation.imageAssets.push(image);
                      }
                    }
                  }
                }
              }
            }
          }

          // Go through the audio and find to which animation they belong
          for (const audio of tmpAudio) {
            for (const parentAnimation of dotLottie.animations) {
              if (parentAnimation.data) {
                const animationAssets = parentAnimation.data.assets as AnimationType['assets'];

                if (animationAssets) {
                  for (const asset of animationAssets) {
                    if (isAudioAsset(asset)) {
                      if (asset.p.includes(audio.id)) {
                        audio.parentAnimations.push(parentAnimation);
                        parentAnimation.audioAssets.push(audio);
                      }
                    }
                  }
                }
              }
            }
          }
        } catch (err) {
          if (err instanceof Error) {
            throw new DotLottieError(`Invalid manifest inside buffer! ${err.message}`);
          }
        }
      } else {
        // throw error as it's invalid buffer
        throw new DotLottieError('Invalid buffer');
      }
    } catch (err) {
      if (err instanceof Error) {
        throw new DotLottieError(err.message);
      }
    }

    return dotLottie;
  }
}
