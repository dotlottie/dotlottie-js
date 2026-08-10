/**
 * Copyright 2023 Design Barn Inc.
 */

import type { Animation as AnimationType } from '@lottie-animation-community/lottie-types';
import type { Zippable } from 'fflate';
import { strToU8, strFromU8, unzip, zip } from 'fflate';

import { PACKAGE_NAME } from '../../constants';
import type { ConversionOptions, GetAnimationOptions } from '../../types';
import {
  base64ToUint8Array,
  DotLottieError,
  getDotLottieVersion,
  getExtensionTypeFromBase64,
  isImageAsset,
  isValidURL,
  uint8ArrayToBase64,
} from '../../utils';

import type { AnimationOptionsV1, LottieAnimationCommonV1 } from './animation';
import { LottieAnimationV1 } from './animation';
import type { LottieImageCommonV1 } from './image';
import { LottieImageV1 } from './image';
import type { DotLottieV1Plugin } from './plugin';
import type { ManifestV1 } from './schemas/manifest';

export interface DotLottieV1Options {
  author?: string;
  description?: string;
  enableDuplicateImageOptimization?: boolean;
  generator?: string;
  keywords?: string;
  revision?: number;
}

export class DotLottieCommonV1 {
  protected readonly _animationsMap: Map<string, LottieAnimationCommonV1> = new Map();

  protected readonly _plugins: DotLottieV1Plugin[] = [];

  protected _author: string = PACKAGE_NAME;

  protected _description: string | undefined;

  protected _generator: string = PACKAGE_NAME;

  protected _keywords: string | undefined;

  protected _version: string = '1';

  protected _revision: number | undefined;

  // Custom data for the DotLottieV1
  protected _customData: Record<string, unknown> | undefined;

  public enableDuplicateImageOptimization?: boolean;

  public constructor(options?: DotLottieV1Options) {
    if (typeof options?.author === 'string') {
      this._author = options.author;
    }

    if (typeof options?.description === 'string') {
      this._description = options.description;
    }

    if (typeof options?.generator === 'string') {
      this._generator = options.generator;
    }

    if (typeof options?.keywords === 'string') {
      this._keywords = options.keywords;
    }

    if (typeof options?.revision === 'number') {
      this._revision = options.revision;
    }

    this.enableDuplicateImageOptimization = options?.enableDuplicateImageOptimization ?? false;
  }

  public async toBase64(options: ConversionOptions | undefined = undefined): Promise<string> {
    return uint8ArrayToBase64(await this.toArrayBuffer(options));
  }

  public create(_options?: DotLottieV1Options): DotLottieCommonV1 {
    throw new DotLottieError('create() method not implemented in concrete class!');
  }

  public async download(_fileName: string, _options: ConversionOptions | undefined = undefined): Promise<void> {
    throw new DotLottieError('download(fileName:string) method not implemented in concrete class!');
  }

  public addPlugins(..._plugins: DotLottieV1Plugin[]): DotLottieCommonV1 {
    throw new DotLottieError('addPlugins(...plugins: DotLottieV1Plugin[]) not implemented in concrete class!');
  }

  // Per platform: has to construct the platform's concrete DotLottie.
  protected async _fromV2ArrayBuffer(_arrayBuffer: ArrayBuffer): Promise<DotLottieCommonV1> {
    throw new DotLottieError('_fromV2ArrayBuffer(arrayBuffer: ArrayBuffer) not implemented in concrete class!');
  }

  public addAnimation(animationOptions: AnimationOptionsV1): this {
    const animation = new LottieAnimationV1(animationOptions);

    if (this._animationsMap.get(animationOptions.id)) {
      throw new DotLottieError('Duplicate animation id detected, aborting.');
    }

    this._animationsMap.set(animation.id, animation);

    return this;
  }

  /**
   * Creates a DotLottieV1 instance from an array buffer
   * @param arrayBuffer - array buffer of the DotLottieV1 file
   * @returns DotLottieV1 instance
   * @throws Error
   */
  public async fromArrayBuffer(arrayBuffer: ArrayBuffer): Promise<this> {
    const dotLottieVersion = await getDotLottieVersion(new Uint8Array(arrayBuffer));

    if (dotLottieVersion === '2') {
      return (await this._fromV2ArrayBuffer(arrayBuffer)) as this;
    }

    const dotLottie = this.create() as this;

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

      if (contentObj['manifest.json'] instanceof Uint8Array) {
        try {
          // Parse the manifest first so that we can pick up animation settings
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
            // JSON entries are UTF-8; binary assets are base64-encoded from the raw bytes below.
            const decodedStr = strFromU8(decompressedFile, false);

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

              const base64 = uint8ArrayToBase64(decompressedFile);

              const ext = await getExtensionTypeFromBase64(base64);

              if (!ext) {
                throw new DotLottieError('Unrecognized asset file format.');
              }

              const imgDataURL = `data:image/${ext};base64,${base64}`;

              tmpImages.push(
                new LottieImageV1({
                  id: imageId,
                  lottieAssetId: imageId,
                  data: imgDataURL,
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
        } catch (err: unknown) {
          throw new DotLottieError(
            `Invalid manifest inside buffer! ${err instanceof Error ? err.message : 'Unknown error'}`,
          );
        }
      } else {
        throw new DotLottieError('Invalid buffer');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new DotLottieError(err.message);
      }
    }

    return dotLottie;
  }

  public async toArrayBuffer(options: ConversionOptions | undefined = undefined): Promise<ArrayBuffer> {
    const manifest = this._buildManifest();

    const dotLottie: Zippable = {
      'manifest.json': [strToU8(JSON.stringify(manifest)), {}],
    };

    for (const animation of this.animations) {
      const json = await animation.toJSON();

      dotLottie[`animations/${animation.id}.json`] = [strToU8(JSON.stringify(json)), animation.zipOptions];

      for (const asset of animation.imageAssets) {
        const dataAsString = await asset.toDataURL();

        dotLottie[`images/${asset.fileName}`] = [base64ToUint8Array(dataAsString), asset.zipOptions];
      }
    }

    return new Promise<ArrayBuffer>((resolve, reject) => {
      zip(dotLottie, options?.zipOptions || {}, (err, data) => {
        if (err) {
          reject(err);

          return;
        }

        resolve(data.buffer as ArrayBuffer);
      });
    });
  }

  public get plugins(): DotLottieV1Plugin[] {
    return this._plugins;
  }

  public get version(): string {
    return this._version;
  }

  public get revision(): number | undefined {
    return this._revision;
  }

  public get author(): string {
    return this._author;
  }

  public get description(): string | undefined {
    return this._description;
  }

  public get keywords(): string | undefined {
    return this._keywords;
  }

  public get generator(): string {
    return this._generator;
  }

  public get animations(): LottieAnimationCommonV1[] {
    return Array.from(this._animationsMap.values());
  }

  public get manifest(): ManifestV1 {
    return this._buildManifest();
  }

  public get custom(): Record<string, unknown> | undefined {
    return this._customData;
  }

  public setCustomData(customData: Record<string, unknown> | undefined): DotLottieCommonV1 {
    this._customData = customData ?? {};

    return this;
  }

  public setAuthor(author: string): DotLottieCommonV1 {
    this._author = author;

    return this;
  }

  public setDescription(description: string | undefined): DotLottieCommonV1 {
    this._description = typeof description === 'string' ? description : '';

    return this;
  }

  public setKeywords(keywords: string | undefined): DotLottieCommonV1 {
    this._keywords = typeof keywords === 'string' ? keywords : 'DotLottieV1';

    return this;
  }

  public setRevision(revision: number): DotLottieCommonV1 {
    this._revision = revision;

    return this;
  }

  /**
   * Renames the underlying LottieImageV1, as well as updating the image asset path inside the animation data.
   * @param newName - desired id and fileName,
   * @param imageId - The id of the LottieImageV1 to rename
   */
  private async _renameImage(
    animation: LottieAnimationCommonV1,
    newLottieAssetId: string,
    lottieAssetId: string,
  ): Promise<void> {
    for (const imageAsset of animation.imageAssets) {
      if (imageAsset.lottieAssetId === lottieAssetId) {
        // Rename the LottieImageV1
        const oldPath = imageAsset.fileName;

        await imageAsset.renameImage(newLottieAssetId);

        if (!animation.data) throw new DotLottieError('No animation data available.');

        const animationAssets = animation.data.assets as AnimationType['assets'];

        if (!animationAssets) throw new DotLottieError('No image assets to rename.');

        // Find the image asset inside the animation data and rename its path
        for (const asset of animationAssets) {
          if ('w' in asset && 'h' in asset) {
            if (asset.p === oldPath) {
              asset.p = imageAsset.fileName;
            }
          }
        }
      }
    }
  }

  /**
   * Generates a map of duplicate image ids and their count.
   * @returns Map of duplicate image ids and their count.
   */
  private _generateMapOfOccurencesFromImageIds(): Map<string, number> {
    const dupeMap = new Map<string, number>();

    this.animations.forEach((animation) => {
      animation.imageAssets.forEach((imageAsset) => {
        if (dupeMap.has(imageAsset.lottieAssetId)) {
          const count = dupeMap.get(imageAsset.lottieAssetId) ?? 0;

          dupeMap.set(imageAsset.lottieAssetId, count + 1);
        } else {
          dupeMap.set(imageAsset.lottieAssetId, 1);
        }
      });
    });

    return dupeMap;
  }

  /**
   * Renames the image assets in all animations to avoid conflicts.
   *
   * Steps:
   *  - Generate how many times across all animations the same image id has been used.
   *  - Loop through every animation in reverse order
   *  - Every time an animation uses an image asset that is also used elsewhere, append the count to the image's asset id and then decrement.
   *
   * Result of renaming for every animation:
   *
   * - Inside the Lottie's data and it's Asset object:
   *  - The Asset id stays the same, meaning that every reference to the asset is still valid (refId)
   *  - The path is changed to the new asset id with the format \{assetId\}_\{count\}
   *
   * - On the dotLottie file system scope:
   *  - The image file name is changed to the new asset id \{assetId\}_\{count\}.\{ext\}
   */
  private async _renameImageAssets(): Promise<void> {
    const occurenceMap = this._generateMapOfOccurencesFromImageIds();

    // Loop over every animation
    for (let i = this.animations.length - 1; i >= 0; i -= 1) {
      const animation = this.animations.at(i);

      if (animation) {
        // Loop over every image asset of the animation
        for (let j = animation.imageAssets.length - 1; j >= 0; j -= 1) {
          const image = animation.imageAssets.at(j);

          if (image) {
            // Get how many times the same image id has been used
            let count = occurenceMap.get(image.lottieAssetId) ?? 0;

            if (count > 0) {
              count -= 1;
            }

            // Decrement the count
            occurenceMap.set(image.lottieAssetId, count);

            if (count > 0) {
              // Rename the with n-1 count
              await this._renameImage(animation, `${image.lottieAssetId}_${count}`, image.lottieAssetId);
            }
          }
        }
      }
    }
  }

  protected _addLottieAnimation(animation: LottieAnimationCommonV1): DotLottieCommonV1 {
    if (this._animationsMap.get(animation.id)) {
      throw new DotLottieError('Duplicate animation id detected, aborting.');
    }

    this._animationsMap.set(animation.id, animation);

    return this;
  }

  /**
   * Inlines all assets of the passed animation
   * @param animation - Animation whose asset are to be inlined
   * @returns LottieAnimationCommonV1 with inlined assets
   */
  private async _findAssetsAndInline(animation: LottieAnimationCommonV1): Promise<LottieAnimationCommonV1> {
    const animationAssets = animation.data?.assets as AnimationType['assets'];

    if (!animationAssets) throw new DotLottieError("Failed to inline assets, the animation's assets are undefined.");

    const images = this.getImages();

    for (const asset of animationAssets) {
      if (isImageAsset(asset)) {
        for (const image of images) {
          if (image.fileName === asset.p) {
            // encoded is true
            asset.e = 1;
            asset.u = '';
            asset.p = await image.toDataURL();
          }
        }
      }
    }

    return animation;
  }

  /**
   * Returns the desired animation
   * @param animationId - desired animation id
   * @param inlineAssets - if true will inline the assets inside the data of the LottieAnimationV1
   * @returns
   */
  public async getAnimation(
    animationId: string,
    options?: GetAnimationOptions,
  ): Promise<LottieAnimationCommonV1 | undefined> {
    if (!options?.inlineAssets) return this._animationsMap.get(animationId);

    let dataWithInlinedImages = this._animationsMap.get(animationId);

    if (!dataWithInlinedImages) throw new DotLottieError('Failed to find animation.');

    dataWithInlinedImages = await this._findAssetsAndInline(dataWithInlinedImages);

    return dataWithInlinedImages;
  }

  public getAnimations(): Array<[string, LottieAnimationCommonV1]> | undefined {
    return Array.from(this._animationsMap);
  }

  public removeAnimation(animationId: string): DotLottieCommonV1 {
    const targetAnimation = this._animationsMap.get(animationId);

    if (targetAnimation) {
      this._animationsMap.delete(targetAnimation.id);
    }

    return this;
  }

  public getImages(): LottieImageCommonV1[] {
    const images: LottieImageCommonV1[] = [];

    this.animations.map((animation) => {
      return images.push(...animation.imageAssets);
    });

    return images;
  }

  protected _buildManifest(): ManifestV1 {
    const animationsList = Array.from(this._animationsMap.values()).map((animation) => ({
      id: animation.id,
      ...(animation.autoplay !== undefined && { autoplay: animation.autoplay }),
      ...(animation.loop !== undefined && { loop: animation.loop }),
      ...(animation.speed !== undefined && { speed: animation.speed }),
      ...(animation.direction !== undefined && { direction: animation.direction }),
      ...(animation.playMode !== undefined && { playMode: animation.playMode }),
      ...(animation.hover !== undefined && { hover: animation.hover }),
      ...(animation.intermission !== undefined && { intermission: animation.intermission }),
      ...(animation.themeColor !== undefined && { themeColor: animation.themeColor }),
    }));

    const manifest: ManifestV1 = {
      version: this.version,
      generator: this.generator,
      author: this.author,
      ...(this.keywords !== undefined && { keywords: this.keywords }),
      ...(this.revision !== undefined && { revision: this.revision }),
      animations: animationsList,
      ...(this.description && this.description.trim() !== '' ? { description: this.description } : {}),
      ...(this._customData && Object.keys(this._customData).length !== 0 ? { custom: this._customData } : {}),
    };

    return manifest;
  }

  /**
   * Constructs the manifest and calls toJSON on the animations
   * so the data is fetched for every animation.
   *
   * @returns DotLottieV1 context
   */
  public async build(): Promise<this> {
    this._buildManifest();

    for (const animation of this.animations) {
      await animation.toJSON();
    }

    if (this.animations.length > 1) {
      // Rename assets incrementally if there are multiple animations
      await this._renameImageAssets();
    }

    const parallelPlugins = [];
    const sequentialPlugins = [];

    for (const plugin of this.plugins) {
      if (plugin.parallel) {
        parallelPlugins.push(plugin);
      } else {
        sequentialPlugins.push(plugin);
      }
    }

    // Run parallel plugins
    await Promise.all(parallelPlugins.map(async (plugin) => plugin.onBuild()));

    // Run sequential plugins
    for (const plugin of sequentialPlugins) {
      await plugin.onBuild();
    }

    return this;
  }

  public async toBlob(options: ConversionOptions | undefined = undefined): Promise<Blob> {
    const arrayBuffer = await this.toArrayBuffer(options);

    return new Blob([arrayBuffer], { type: 'application/zip' });
  }

  /**
   * Creates a DotLottieV1 instance from a url to a DotLottieV1 file
   * @param url - url to the DotLottieV1 file
   * @returns DotLottieV1 instance
   */
  public async fromURL(url: string): Promise<this> {
    if (!isValidURL(url)) throw new DotLottieError('Invalid URL');

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new DotLottieError(response.statusText);
      }

      const arrayBuffer = await response.arrayBuffer();

      return this.fromArrayBuffer(arrayBuffer);
    } catch (err) {
      if (err instanceof Error) {
        throw new DotLottieError(err.message);
      }
    }

    throw new DotLottieError('Unknown error');
  }

  public merge(...DotLottieV1s: DotLottieCommonV1[]): DotLottieCommonV1 {
    const mergedDotLottieV1 = this.create();

    for (const dotLottieV1 of DotLottieV1s) {
      dotLottieV1.animations.forEach((animation) => {
        if (animation.data) {
          mergedDotLottieV1.addAnimation({
            id: animation.id,
            data: animation.data,
          });
        } else if (animation.url) {
          mergedDotLottieV1.addAnimation({
            id: animation.id,
            url: animation.url,
          });
        }
      });
    }

    return mergedDotLottieV1;
  }

  protected _requireValidAuthor(author: string | undefined): asserts author is string {
    if (typeof author !== 'string') throw new DotLottieError('Invalid author');
  }

  protected _requireValidDescription(description: string | undefined): asserts description is string {
    if (typeof description !== 'string') throw new DotLottieError('Invalid description');
  }

  protected _requireValidGenerator(generator: string | undefined): asserts generator is string {
    if (typeof generator !== 'string') throw new DotLottieError('Invalid generator');
  }

  protected _requireValidKeywords(keywords: string | undefined): asserts keywords is string {
    if (typeof keywords !== 'string') throw new DotLottieError('Invalid keywords');
  }

  protected _requireValidVersion(version: string | undefined): asserts version is string {
    if (typeof version !== 'string') throw new DotLottieError('Invalid version');
  }

  protected _requireValidCustomData(
    customData: Record<string, unknown> | undefined,
  ): asserts customData is Record<string, unknown> {
    if (!customData) throw new DotLottieError('Invalid customData');
  }
}
