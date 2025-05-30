/**
 * Copyright 2023 Design Barn Inc.
 */

/* eslint-disable @typescript-eslint/no-use-before-define */

import type { Animation as AnimationType } from '@lottie-animation-community/lottie-types';
import type { Zippable } from 'fflate';
import { strToU8, unzip, zip, strFromU8 } from 'fflate';

import type { ConversionOptions } from '../../types';
import {
  base64ToUint8Array,
  DotLottieError,
  getDotLottieVersion,
  getExtensionTypeFromBase64,
  isAudioAsset,
} from '../../utils';
import { DotLottie } from '../../v2/node';
import type { DotLottieV1Options, AnimationOptionsV1 } from '../common';
import { DotLottieCommonV1 } from '../common';
import type { ManifestV1 } from '../common/schemas/manifest';

import { LottieAnimationV1 } from './animation';
import { LottieAudioV1 } from './audio';
import { LottieImageV1 } from './image';
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
  } else {
    return new DotLottieV1().fromArrayBuffer(arrayBuffer);
  }
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

  public override create(): DotLottieCommonV1 {
    return new DotLottieV1();
  }

  public override async toBase64(options?: ConversionOptions): Promise<string> {
    const data = await this.toArrayBuffer(options);

    return Buffer.from(data).toString('base64');
  }

  public override async download(_fileName: string, _options?: ConversionOptions): Promise<void> {
    throw new DotLottieError('Cannot download dotlottie in a non-browser environment');
  }

  public override addAnimation(animationOptions: AnimationOptionsV1): DotLottieCommonV1 {
    const animation = new LottieAnimationV1(animationOptions);

    if (this._animationsMap.get(animationOptions.id)) {
      throw new DotLottieError('Duplicate animation id detected, aborting.');
    }

    this._animationsMap.set(animation.id, animation);

    return this;
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

    const DotLottieV1ArrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      zip(dotLottie, options?.zipOptions || {}, (err, data) => {
        if (err) {
          reject(err);

          return;
        }

        resolve(data.buffer);
      });
    });

    return DotLottieV1ArrayBuffer;
  }

  /**
   * Creates a DotLottieV1 instance from an array buffer
   * @param arrayBuffer - array buffer of the DotLottieV1 file
   * @returns DotLottieV1 instance
   * @throws Error
   */
  public override async fromArrayBuffer(arrayBuffer: ArrayBuffer): Promise<DotLottieV1> {
    const dotLottieVersion = await getDotLottieVersion(new Uint8Array(arrayBuffer));

    if (dotLottieVersion === '2') {
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
        try {
          const manifest = JSON.parse(strFromU8(contentObj['manifest.json'], false)) as ManifestV1;
          const { author, custom, description, keywords } = manifest;

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
          if (keywords) {
            this._requireValidKeywords(keywords);
            dotLottie.setKeywords(keywords);
          }

          for (const key of Object.keys(contentObj)) {
            const decompressedFile = contentObj[key] as Uint8Array;
            const decodedStr = strFromU8(contentObj[key] as Uint8Array, false);

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

              const base64 = Buffer.from(decompressedFile).toString('base64');

              const ext = await getExtensionTypeFromBase64(base64);

              if (!ext) {
                throw new DotLottieError('Unrecognized asset file format.');
              }
              // Push the images in to a temporary array
              const imgDataURL = `data:image/${ext};base64,${base64}`;

              tmpImages.push(
                new LottieImageV1({
                  id: imageId,
                  lottieAssetId: imageId,
                  data: imgDataURL,
                  fileName: key.split('/')[1] || '',
                }),
              );
            } else if (key.startsWith('audio/')) {
              // Do audio extraction
              // extract audioID from key as the key = `audio/${audioID}.${ext}`
              const audioId = /audio\/(.+)\./u.exec(key)?.[1];

              if (!audioId) {
                throw new DotLottieError('Invalid audio id');
              }

              const base64 = Buffer.from(decompressedFile).toString('base64');

              const ext = await getExtensionTypeFromBase64(base64);

              // Push the images in to a temporary array
              const audioDataURL = `data:audio/${ext};base64,${base64}`;

              tmpAudio.push(
                new LottieAudioV1({
                  id: audioId,
                  data: audioDataURL,
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
                      if (asset.p === image.fileName) {
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
        } catch (err: unknown) {
          // throw error as it's invalid json
          throw new DotLottieError(
            `Invalid manifest inside buffer! ${err instanceof Error ? err.message : 'Unknown error'}`,
          );
        }
      } else {
        // throw error as it's invalid buffer
        throw new DotLottieError('Invalid buffer');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new DotLottieError(err.message);
      }
    }

    return dotLottie;
  }
}
