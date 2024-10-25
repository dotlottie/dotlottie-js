/**
 * Copyright 2023 Design Barn Inc.
 */

import type { Animation as AnimationType } from '@lottie-animation-community/lottie-types';
import type { Zippable } from 'fflate';
import { strToU8, zip, strFromU8, unzip } from 'fflate';

import type { Manifest } from '../../schemas/v2/manifest';
import type { DotLottiePlugin, AnimationOptions, DotLottieOptions, ConversionOptions } from '../common';
import {
  DotLottieCommon,
  createError,
  base64ToUint8Array,
  getExtensionTypeFromBase64,
  DotLottieError,
  isAudioAsset,
} from '../common';

import { LottieAnimationV1 } from './animation';
import { LottieAudio } from './audio';
import { LottieImage } from './image';
import { DuplicateImageDetector } from './plugins/duplicate-image-detector';

export class DotLottie extends DotLottieCommon {
  public constructor(options?: DotLottieOptions) {
    super(options);

    if (this.enableDuplicateImageOptimization) this.addPlugins(new DuplicateImageDetector());
  }

  public override addPlugins(...plugins: DotLottiePlugin[]): DotLottieCommon {
    plugins.forEach((plugin) => {
      plugin.install(this);

      this._plugins.push(plugin);
    });

    return this;
  }

  public override addAnimation(animationOptions: AnimationOptions): DotLottie {
    const animation = new LottieAnimationV1(animationOptions);

    if (this._animationsMap.get(animationOptions.id)) {
      throw createError('Duplicate animation id detected, aborting.');
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

  public override create(options?: DotLottieOptions): DotLottieCommon {
    return new DotLottie(options);
  }

  public override async toArrayBuffer(options: ConversionOptions | undefined): Promise<ArrayBuffer> {
    const manifest = this._buildManifest();

    const dotlottie: Zippable = {
      'manifest.json': [
        strToU8(JSON.stringify(manifest)),
        {
          // no compression for manifest
          level: 0,
        },
      ],
    };

    for (const animation of this.animations) {
      const json = await animation.toJSON();

      dotlottie[`animations/${animation.id}.json`] = [strToU8(JSON.stringify(json)), animation.zipOptions];

      const imageAssets = animation.imageAssets;
      const audioAssets = animation.audioAssets;

      for (const asset of imageAssets) {
        // Assure we have a base64 encoded version of the image
        const dataAsString = await asset.toDataURL();

        dotlottie[`images/${asset.fileName}`] = [base64ToUint8Array(dataAsString), asset.zipOptions];
      }

      for (const asset of audioAssets) {
        // Assure we have a base64 encoded version of the audio
        const dataAsString = await asset.toDataURL();

        dotlottie[`audio/${asset.fileName}`] = [base64ToUint8Array(dataAsString), asset.zipOptions];
      }
    }

    for (const theme of this.themes) {
      const themeData = await theme.toString();

      dotlottie[`themes/${theme.id}.json`] = [strToU8(themeData), theme.zipOptions];
    }

    for (const state of this.stateMachines) {
      const stateData = state.toString();

      dotlottie[`states/${state.id}.json`] = [strToU8(stateData), state.zipOptions];
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
        // valid buffer
        try {
          // Parse the manifest first so that we can pick up animation settings
          const manifest = JSON.parse(strFromU8(contentObj['manifest.json'], false)) as Manifest;
          const { generator } = manifest;

          if (generator) {
            this._requireValidGenerator(generator);
            dotlottie.setGenerator(generator);
          }

          for (const key of Object.keys(contentObj)) {
            // true is passed to use binary string, otherwise btoa fails
            const decodedStr = strFromU8(contentObj[key] as Uint8Array, true);

            if (key.startsWith('animations/') && key.endsWith('.json')) {
              // extract animationId from key as the key = `animations/${animationId}.json`
              const animationId = /animations\/(.+)\.json/u.exec(key)?.[1];

              if (!animationId) {
                throw createError('Invalid animation id');
              }

              const animation = JSON.parse(decodedStr);

              const animationSettings = manifest.animations.find((anim) => anim.id === animationId);

              if (animationSettings === undefined) {
                throw createError('Animation not found inside manifest');
              }

              dotlottie.addAnimation({
                data: animation,
                ...animationSettings,
              });
            } else if (key.startsWith('images/')) {
              // extract imageId from key as the key = `images/${imageId}.${ext}`
              const imageId = /images\/(.+)\./u.exec(key)?.[1];

              if (!imageId) {
                throw createError('Invalid image id');
              }

              let decodedImg = btoa(decodedStr);

              const ext = getExtensionTypeFromBase64(decodedImg);

              // Push the images in to a temporary array
              decodedImg = `data:image/${ext};base64,${decodedImg}`;
              tmpImages.push(
                new LottieImage({
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
                new LottieAudio({
                  id: audioId,
                  data: decodedAudio,
                  fileName: key.split('/')[1] || '',
                }),
              );
            } else if (key.startsWith('themes/') && key.endsWith('.json')) {
              // extract themeId from key as the key = `themes/${themeId}.json`
              const themeId = /themes\/(.+)\.json/u.exec(key)?.[1];

              if (!themeId) {
                throw createError('Invalid theme id');
              }

              manifest.themes?.forEach((givenThemeId) => {
                if (givenThemeId === themeId) {
                  dotlottie.addTheme({
                    id: givenThemeId,
                    data: JSON.parse(decodedStr),
                  });
                }
              });
            } else if (key.startsWith('states/') && key.endsWith('.json')) {
              // extract stateId from key as the key = `states/${stateId}.json`
              const stateId = /states\/(.+)\.json/u.exec(key)?.[1];

              if (!stateId) {
                throw createError('Invalid theme id');
              }

              manifest.stateMachines?.forEach((givenStateId) => {
                if (givenStateId === stateId) {
                  dotlottie.addStateMachine(JSON.parse(decodedStr));
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

    return dotlottie;
  }
}
