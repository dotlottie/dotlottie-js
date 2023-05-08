/**
 * Copyright 2023 Design Barn Inc.
 */

import type { Animation } from '@lottiefiles/lottie-types';
import type { Zippable } from 'fflate';
import { strToU8, unzip, zip, strFromU8 } from 'fflate';

import pkg from '../../package.json';
import { createError, DotLottieCommon } from '../common';
import type { DotLottieOptions, DotLottiePlugin, AnimationOptions } from '../common';

import { DuplicateImageDetector } from './duplicate-image-detector';
import { LottieAnimation } from './lottie-animation';
import { LottieImage } from './lottie-image';
import { base64ToUint8Array, getExtensionTypeFromBase64 } from './utils';

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

  public override async toBase64(): Promise<string> {
    const data = await this.toArrayBuffer();

    return Buffer.from(data).toString('base64');
  }

  public override async download(_fileName: string): Promise<void> {
    throw createError('Cannot download dotlottie in a non-browser environment');
  }

  public override addAnimation(animationOptions: AnimationOptions): DotLottieCommon {
    const animation = new LottieAnimation(animationOptions);

    this._animationsMap.set(animation.id, animation);

    return this;
  }

  public override async toArrayBuffer(): Promise<ArrayBuffer> {
    const manifest = this._buildManifest();

    const dotlottie: Zippable = {
      'manifest.json': strToU8(JSON.stringify(manifest)),
    };

    for (const animation of this.animations) {
      const json = await animation.toJSON();

      dotlottie[`animations/${animation.id}.json`] = strToU8(JSON.stringify(json));

      const imageAssets = animation.imageAssets;

      for (const asset of imageAssets) {
        // Assure we have a base64 encoded version of the image
        const dataAsString = await asset.toDataURL();

        dotlottie[`images/${asset.fileName}`] = base64ToUint8Array(dataAsString);
      }
    }

    const dotlottieArrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      zip(dotlottie, (err, data) => {
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

      for (const key of Object.keys(contentObj)) {
        const decodedStr = strFromU8(contentObj[key] as Uint8Array, false);

        if (key === 'manifest.json') {
          const { author, description, generator, version } = JSON.parse(decodedStr);

          dotlottie.setVersion(version as string);
          dotlottie.setDescription(description as string);
          dotlottie.setAuthor(author as string);
          dotlottie.setGenerator(generator as string);
        } else if (key.startsWith('animations/') && key.endsWith('.json')) {
          // extract animationId from key as the key = `animations/${animationId}.json`
          const animationId = /animations\/(.+)\.json/u.exec(key)?.[1];

          if (!animationId) {
            throw createError('Invalid animation id');
          }

          const animation = JSON.parse(decodedStr);

          dotlottie.addAnimation({
            id: animationId,
            data: animation,
          });
        } else if (key.startsWith('images/')) {
          // extract imageId from key as the key = `images/${imageId}.${ext}`
          const imageId = /images\/(.+)\./u.exec(key)?.[1];

          if (!imageId) {
            throw createError('Invalid image id');
          }

          let decodedImg = Buffer.from(decodedStr).toString('base64');

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
        }
      }

      // Go through the images and find to which animation they belong
      for (const image of tmpImages) {
        for (const parentAnimation of dotlottie.animations) {
          if (parentAnimation.data) {
            const animationAssets = parentAnimation.data.assets as Animation['assets'];

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
    } catch (err) {
      if (err instanceof Error) {
        throw createError(err.message);
      }
    }

    return dotlottie;
  }
}
