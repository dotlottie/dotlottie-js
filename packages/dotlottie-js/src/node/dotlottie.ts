/**
 * Copyright 2023 Design Barn Inc.
 */

import type { Animation as AnimationType } from '@lottie-animation-community/lottie-types';
import type { Zippable } from 'fflate';
import { strToU8, unzip, zip, strFromU8 } from 'fflate';

import pkg from '../../package.json';
import type {
  DotLottieOptions,
  DotLottiePlugin,
  AnimationOptions,
  ManifestAnimation,
  Manifest,
  ConversionOptions,
} from '../common';
import {
  createError,
  DotLottieCommon,
  base64ToUint8Array,
  getExtensionTypeFromBase64,
  DotLottieError,
  isAudioAsset,
} from '../common';

import { DuplicateImageDetector } from './duplicate-image-detector';
import { LottieAnimation } from './lottie-animation';
import { LottieAudio } from './lottie-audio';
import { LottieImage } from './lottie-image';

export class DotLottie extends DotLottieCommon {
  public constructor(options?: DotLottieOptions) {
    const generator = options?.generator ?? `${pkg.name}/node@${pkg.version}`;

    super({
      ...options,
      generator,
    });

    if (this.enableDuplicateImageOptimization) this.addPlugins(new DuplicateImageDetector());
  }

  public override addPlugins(...plugins: DotLottiePlugin[]): DotLottieCommon {
    plugins.forEach((plugin) => {
      plugin.install(this);

      this._plugins.push(plugin);
    });

    return this;
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
    throw createError('Cannot download dotlottie in a non-browser environment');
  }

  public override addAnimation(animationOptions: AnimationOptions): DotLottieCommon {
    const animation = new LottieAnimation(animationOptions);

    if (this._animationsMap.get(animationOptions.id)) {
      throw createError('Duplicate animation id detected, aborting.');
    }

    this._animationsMap.set(animation.id, animation);

    return this;
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
        try {
          const manifest = JSON.parse(strFromU8(contentObj['manifest.json'], false)) as Manifest;
          const { author, custom, description, generator, keywords, version } = manifest;

          if (author) {
            this._requireValidAuthor(author);
            dotlottie.setAuthor(author);
          }
          if (custom) {
            this._requireValidCustomData(custom);
            dotlottie.setCustomData(custom);
          }
          if (description) {
            this._requireValidDescription(description);
            dotlottie.setDescription(description);
          }
          if (generator) {
            this._requireValidGenerator(generator);
            dotlottie.setGenerator(generator);
          }
          if (keywords) {
            this._requireValidKeywords(keywords);
            dotlottie.setKeywords(keywords);
          }
          if (version) {
            this._requireValidVersion(version);
            dotlottie.setVersion(version);
          }

          for (const key of Object.keys(contentObj)) {
            const decompressedFile = contentObj[key] as Uint8Array;
            const decodedStr = strFromU8(contentObj[key] as Uint8Array, false);

            if (key.startsWith('animations/') && key.endsWith('.json')) {
              // extract animationId from key as the key = `animations/${animationId}.json`
              const animationId = /animations\/(.+)\.json/u.exec(key)?.[1];

              if (!animationId) {
                throw createError('Invalid animation id');
              }

              const animation = JSON.parse(decodedStr);

              const animationSettings = manifest['animations'].find(
                (anim: ManifestAnimation) => anim.id === animationId,
              );

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
            } else if (key.startsWith('audio/')) {
              // Do audio extraction
              // extract audioID from key as the key = `audio/${audioID}.${ext}`
              const audioId = /audio\/(.+)\./u.exec(key)?.[1];

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
            } else if (key.startsWith('themes/') && key.endsWith('.json')) {
              // extract themeId from key as the key = `themes/${themeId}.json`
              const themeId = /themes\/(.+)\.json/u.exec(key)?.[1];

              if (!themeId) {
                throw createError('Invalid theme id');
              }

              manifest.themes?.forEach((theme) => {
                if (theme.id === themeId) {
                  dotlottie.addTheme({
                    id: theme.id,
                    data: JSON.parse(decodedStr),
                  });

                  theme.animations.forEach((animationId) => {
                    dotlottie.assignTheme({
                      animationId,
                      themeId,
                    });
                  });
                }
              });
            } else if (key.startsWith('states/') && key.endsWith('.json')) {
              // extract stateId from key as the key = `states/${stateId}.json`
              const stateId = /states\/(.+)\.json/u.exec(key)?.[1];

              if (!stateId) {
                throw createError('Invalid theme id');
              }

              manifest.states?.forEach((state) => {
                if (state === stateId) {
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
