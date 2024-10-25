/**
 * Copyright 2023 Design Barn Inc.
 */

import type { Animation as AnimationType } from '@lottie-animation-community/lottie-types';
import type { Zippable } from 'fflate';
import { strToU8, unzip, zip, strFromU8 } from 'fflate';

import pkg from '../../../package.json';
import type { DotLottieV1Options, DotLottieV1Plugin, AnimationOptions, Manifest, ConversionOptions } from '../common';
import {
  createError,
  DotLottieCommonV1,
  base64ToUint8Array,
  getExtensionTypeFromBase64,
  DotLottieV1Error,
  isAudioAsset,
} from '../common';

import { LottieAnimationV1 } from './animation';
import { LottieAudioV1 } from './audio';
import { LottieImageV1 } from './image';
import { DuplicateImageDetector } from './plugins/duplicate-image-detector';

export class DotLottieV1 extends DotLottieCommonV1 {
  public constructor(options?: DotLottieV1Options) {
    const generator = options?.generator ?? `${pkg.name}/node@${pkg.version}`;

    super({
      ...options,
      generator,
    });

    if (this.enableDuplicateImageOptimization) this.addPlugins(new DuplicateImageDetector());
  }

  public override addPlugins(...plugins: DotLottieV1Plugin[]): DotLottieCommonV1 {
    plugins.forEach((plugin) => {
      plugin.install(this);

      this._plugins.push(plugin);
    });

    return this;
  }

  public override create(): DotLottieCommonV1 {
    return new DotLottieV1();
  }

  public override async toBase64(options: ConversionOptions | undefined): Promise<string> {
    const data = await this.toArrayBuffer(options);

    return Buffer.from(data).toString('base64');
  }

  public override async download(
    _fileName: string,
    _options: ConversionOptions | undefined = undefined,
  ): Promise<void> {
    throw createError('Cannot download DotLottieV1 in a non-browser environment');
  }

  public override addAnimation(animationOptions: AnimationOptions): DotLottieCommonV1 {
    const animation = new LottieAnimationV1(animationOptions);

    if (this._animationsMap.get(animationOptions.id)) {
      throw createError('Duplicate animation id detected, aborting.');
    }

    this._animationsMap.set(animation.id, animation);

    return this;
  }

  public override async toArrayBuffer(options: ConversionOptions | undefined): Promise<ArrayBuffer> {
    const manifest = this._buildManifest();

    const dotLottie: Zippable = {
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
            const decompressedFile = contentObj[key] as Uint8Array;
            const decodedStr = strFromU8(contentObj[key] as Uint8Array, false);

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

              dotLottie.addAnimation({
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
                new LottieImageV1({
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
                throw new DotLottieV1Error('Invalid audio id');
              }

              const base64 = Buffer.from(decompressedFile).toString('base64');

              const ext = getExtensionTypeFromBase64(base64);

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
        } catch (err: any) {
          // throw error as it's invalid json
          throw new DotLottieV1Error(`Invalid manifest inside buffer! ${err.message}`);
        }
      } else {
        // throw error as it's invalid buffer
        throw new DotLottieV1Error('Invalid buffer');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new DotLottieV1Error(err.message);
      }
    }

    return dotLottie;
  }
}
