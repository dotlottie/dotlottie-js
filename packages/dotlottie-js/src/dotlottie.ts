/**
 * Copyright 2023 Design Barn Inc.
 */

import type { Zippable } from 'fflate';
import { strToU8, zip, strFromU8, unzip } from 'fflate';

import { DotLottieCommon, createError } from './common';
import type { DotLottiePlugin, AnimationOptions, DotLottieOptions, ManifestAnimation } from './common';
import { DuplicateImageDetector } from './duplicate-image-detector';
import { LottieAnimation } from './lottie-animation';
import { LottieImage } from './lottie-image';
import { base64ToUint8Array, getExtensionTypeFromBase64 } from './utils';

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
    const animation = new LottieAnimation(animationOptions);

    if (this._animationsMap.get(animationOptions.id)) {
      throw createError('Duplicate animation id detected, aborting.');
    }

    this._animationsMap.set(animation.id, animation);

    return this;
  }

  public override async toBase64(): Promise<string> {
    const data = await this.toArrayBuffer();

    const uint8Array = new Uint8Array(data);
    const binaryString = uint8Array.reduce((acc, val) => acc + String.fromCharCode(val), '');

    return window.btoa(binaryString);
  }

  public override async download(fileName: string): Promise<void> {
    const blob = await this.toBlob();

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

      if (contentObj['manifest.json'] === undefined) {
        throw createError('manifest.json is missing from the dotLottie file');
      }

      // Parse the manifest first so that we can pick up animation settings
      const manifest = JSON.parse(strFromU8(contentObj['manifest.json'] as Uint8Array, false));
      const { author, custom, description, generator, keywords, version } = manifest;

      dotlottie.setAuthor(author as string);
      dotlottie.setCustomData(custom);
      dotlottie.setDescription(description as string);
      dotlottie.setGenerator(generator as string);
      dotlottie.setKeywords(keywords);
      dotlottie.setVersion(version as string);

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

          const animationSettings = manifest['animations'].find((anim: ManifestAnimation) => anim.id === animationId);

          if (animationSettings === undefined) {
            throw createError('Animation not found inside manifest');
          }

          dotlottie.addAnimation({
            id: animationId,
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
