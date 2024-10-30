/**
 * Copyright 2023 Design Barn Inc.
 */

/* eslint-disable @typescript-eslint/no-use-before-define */

import type { Animation as AnimationType } from '@lottie-animation-community/lottie-types';
import type { Zippable } from 'fflate';
import { strToU8, unzip, zip, strFromU8 } from 'fflate';

import {
  base64ToUint8Array,
  DotLottieError,
  getDotLottieVersion,
  getExtensionTypeFromBase64,
  isAudioAsset,
} from '../../utils';
import { DotLottieV1 } from '../../v1/node';
import type { DotLottieOptions, AnimationOptions, ConversionOptions } from '../common';
import { DotLottieCommon } from '../common';
import type { Manifest } from '../common/schemas';

import { LottieAnimationV2 } from './animation';
import { LottieAudio } from './audio';
import { LottieImage } from './image';
import { DuplicateImageDetector } from './plugins/duplicate-image-detector';

export async function toDotLottieV2(arrayBuffer: ArrayBuffer): Promise<DotLottie> {
  const version = await getDotLottieVersion(new Uint8Array(arrayBuffer));

  // Assume it's a v1 file if the version is not 2
  if (version !== '2') {
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

export class DotLottie extends DotLottieCommon {
  public constructor(options?: DotLottieOptions) {
    super(options);

    if (this.enableDuplicateImageOptimization) {
      this._plugins.push(new DuplicateImageDetector());
    }
  }

  public override create(): DotLottieCommon {
    return new DotLottie();
  }

  public override async toBase64(options: ConversionOptions | undefined): Promise<string> {
    const data = await this.toArrayBuffer(options);

    return Buffer.from(data).toString('base64');
  }

  public override async download(
    _fileName: string,
    _options: ConversionOptions | undefined = undefined,
  ): Promise<void> {
    throw new DotLottieError('Cannot download dotlottie in a non-browser environment');
  }

  public override addAnimation(animationOptions: AnimationOptions): DotLottieCommon {
    const animation = new LottieAnimationV2(animationOptions);

    if (this._animationsMap.get(animationOptions.id)) {
      throw new DotLottieError('Duplicate animation id detected, aborting.');
    }

    this._animationsMap.set(animation.id, animation);

    return this;
  }

  public override async toArrayBuffer(options?: ConversionOptions): Promise<ArrayBuffer> {
    const manifest = this._buildManifest();

    const dotlottie: Zippable = {
      'manifest.json': [strToU8(JSON.stringify(manifest)), {}],
    };

    for (const animation of this.animations) {
      const json = await animation.toJSON();

      dotlottie[`a/${animation.id}.json`] = [strToU8(JSON.stringify(json)), animation.zipOptions];

      const imageAssets = animation.imageAssets;
      const audioAssets = animation.audioAssets;

      for (const asset of imageAssets) {
        // Assure we have a base64 encoded version of the image
        const dataAsString = await asset.toDataURL();

        dotlottie[`i/${asset.fileName}`] = [base64ToUint8Array(dataAsString), asset.zipOptions];
      }
      for (const asset of audioAssets) {
        // Assure we have a base64 encoded version of the audio
        const dataAsString = await asset.toDataURL();

        dotlottie[`u/${asset.fileName}`] = [base64ToUint8Array(dataAsString), asset.zipOptions];
      }
    }

    for (const theme of this.themes) {
      const themeData = await theme.toString();

      dotlottie[`t/${theme.id}.json`] = [strToU8(themeData), theme.zipOptions];
    }

    for (const state of this.stateMachines) {
      const stateData = state.toString();

      dotlottie[`s/${state.id}.json`] = [strToU8(stateData), state.zipOptions];
    }

    const dotlottieArrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      zip(dotlottie, options?.zipOptions || {}, (err, data) => {
        if (err) {
          reject(err);

          return;
        }

        resolve(data.buffer);
      });
    });

    return dotlottieArrayBuffer;
  }

  /**
   * Creates a DotLottie instance from an array buffer
   * @param arrayBuffer - array buffer of the dotlottie file
   * @returns DotLottie instance
   * @throws Error
   */
  public override async fromArrayBuffer(arrayBuffer: ArrayBuffer): Promise<DotLottie> {
    const dotLottieVersion = await getDotLottieVersion(new Uint8Array(arrayBuffer));

    if (dotLottieVersion !== '2') {
      return toDotLottieV2(arrayBuffer);
    }

    const dotlottie = new DotLottie();

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
          const manifest = JSON.parse(strFromU8(contentObj['manifest.json'], false)) as Manifest;
          const { generator } = manifest;

          if (generator) {
            this._requireValidGenerator(generator);
            dotlottie.setGenerator(generator);
          }

          for (const key of Object.keys(contentObj)) {
            const decompressedFile = contentObj[key] as Uint8Array;
            const decodedStr = strFromU8(contentObj[key] as Uint8Array, false);

            if (key.startsWith('a/') && key.endsWith('.json')) {
              // extract animationId from key as the key = `a/${animationId}.json`
              const animationId = /a\/(.+)\.json/u.exec(key)?.[1];

              if (!animationId) {
                throw new DotLottieError('Invalid animation id');
              }

              const animation = JSON.parse(decodedStr);

              const animationSettings = manifest.animations.find((anim) => anim.id === animationId);

              if (animationSettings === undefined) {
                throw new DotLottieError('Animation not found inside manifest');
              }

              dotlottie.addAnimation({
                data: animation,
                ...animationSettings,
              });
            } else if (key.startsWith('i/')) {
              // extract imageId from key as the key = `i/${imageId}.${ext}`
              const imageId = /i\/(.+)\./u.exec(key)?.[1];

              if (!imageId) {
                throw new DotLottieError('Invalid image id');
              }

              const base64 = Buffer.from(decompressedFile).toString('base64');

              const ext = getExtensionTypeFromBase64(base64);

              // Push the images in to a temporary array
              const imgDataURL = `data:image/${ext};base64,${base64}`;

              tmpImages.push(
                new LottieImage({
                  id: imageId,
                  data: imgDataURL,
                  fileName: key.split('/')[1] || '',
                }),
              );
            } else if (key.startsWith('u/')) {
              // Do audio extraction
              // extract audioID from key as the key = `u/${audioID}.${ext}`
              const audioId = /u\/(.+)\./u.exec(key)?.[1];

              if (!audioId) {
                throw new DotLottieError('Invalid audio id');
              }

              const base64 = Buffer.from(decompressedFile).toString('base64');

              const ext = getExtensionTypeFromBase64(base64);

              // Push the images in to a temporary array
              const audioDataURL = `data:audio/${ext};base64,${base64}`;

              tmpAudio.push(
                new LottieAudio({
                  id: audioId,
                  data: audioDataURL,
                  fileName: key.split('/')[1] || '',
                }),
              );
            } else if (key.startsWith('t/') && key.endsWith('.json')) {
              // extract themeId from key as the key = `t/${themeId}.json`
              const themeId = /t\/(.+)\.json/u.exec(key)?.[1];

              if (!themeId) {
                throw new DotLottieError('Invalid theme id');
              }

              manifest.themes?.forEach((givenThemeId) => {
                if (givenThemeId === themeId) {
                  dotlottie.addTheme({
                    id: givenThemeId,
                    data: JSON.parse(decodedStr),
                  });
                }
              });
            } else if (key.startsWith('s/') && key.endsWith('.json')) {
              // extract stateId from key as the key = `s/${stateId}.json`
              const stateId = /s\/(.+)\.json/u.exec(key)?.[1];

              if (!stateId) {
                throw new DotLottieError('Invalid theme id');
              }

              manifest.stateMachines?.forEach((givenStateMachineId) => {
                if (givenStateMachineId === stateId) {
                  const decodedStateMachine = JSON.parse(decodedStr);

                  dotlottie.addStateMachine(decodedStateMachine);
                }
              });
            }
          }

          // Go through the images and find to which animation they belong
          for (const image of tmpImages) {
            for (const parentAnimation of dotlottie.animations) {
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
            for (const parentAnimation of dotlottie.animations) {
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
        } catch (err: any) {
          // throw error as it's invalid json
          throw new DotLottieError(`Invalid manifest inside buffer! ${err.message}`);
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

    return dotlottie;
  }
}
