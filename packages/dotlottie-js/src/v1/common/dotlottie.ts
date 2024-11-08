/**
 * Copyright 2023 Design Barn Inc.
 */

import type { Animation as AnimationType } from '@lottie-animation-community/lottie-types';

import { PACKAGE_NAME } from '../../constants';
import type { ConversionOptions, GetAnimationOptions } from '../../types';
import { DotLottieError, isAudioAsset, isImageAsset, isValidURL } from '../../utils';

import type { AnimationOptionsV1, LottieAnimationCommonV1 } from './animation';
import type { LottieAudioCommonV1 } from './audio';
import type { LottieImageCommonV1 } from './image';
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

  public async toBase64(_options: ConversionOptions | undefined = undefined): Promise<string> {
    throw new DotLottieError('toBase64() method not implemented in concrete class!');
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

  public addAnimation(_animationOptions: AnimationOptionsV1): DotLottieCommonV1 {
    throw new DotLottieError('addAnimation(animationOptions: AnimationOptions) not implemented in concrete class!');
  }

  public async fromArrayBuffer(_arrayBuffer: ArrayBuffer): Promise<DotLottieCommonV1> {
    throw new DotLottieError(
      'fromArrayBuffer(arrayBuffer: ArrayBuffer): Promise<DotLottieCommonV1> not implemented in concrete class!',
    );
  }

  public async toArrayBuffer(_options: ConversionOptions | undefined = undefined): Promise<ArrayBuffer> {
    throw new DotLottieError('toArrayBuffer(): Promise<ArrayBuffer> is not implemented in concrete class!');
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
  private _renameImage(animation: LottieAnimationCommonV1, newName: string, imageId: string): void {
    animation.imageAssets.forEach((imageAsset) => {
      if (imageAsset.id === imageId) {
        // Rename the LottieImageV1
        imageAsset.renameImage(newName);

        if (!animation.data) throw new DotLottieError('No animation data available.');

        const animationAssets = animation.data.assets as AnimationType['assets'];

        if (!animationAssets) throw new DotLottieError('No image assets to rename.');

        // Find the image asset inside the animation data and rename its path
        for (const asset of animationAssets) {
          if ('w' in asset && 'h' in asset) {
            if (asset.id === imageId) {
              asset.p = imageAsset.fileName;
            }
          }
        }
      }
    });
  }

  private _renameImageAssets(): void {
    const images: Map<string, LottieImageCommonV1[]> = new Map();

    this.animations.forEach((animation) => {
      images.set(animation.id, animation.imageAssets);
    });

    let size = 0;

    images.forEach((value) => {
      size += value.length;
    });

    for (let i = this.animations.length - 1; i >= 0; i -= 1) {
      const animation = this.animations.at(i);

      if (animation) {
        for (let j = animation.imageAssets.length - 1; j >= 0; j -= 1) {
          const image = animation.imageAssets.at(j);

          if (image) {
            this._renameImage(animation, `image_${size}`, image.id);
            size -= 1;
          }
        }
      }
    }
  }

  /**
   * Renames the underlying LottieAudioV1, as well as updating the audio asset path inside the animation data.
   * @param newName - desired id and fileName,
   * @param audioId - The id of the LottieAudioV1 to rename
   */
  private _renameAudio(animation: LottieAnimationCommonV1, newName: string, audioId: string): void {
    animation.audioAssets.forEach((audioAsset) => {
      if (audioAsset.id === audioId) {
        // Rename the LottieImageV1
        audioAsset.renameAudio(newName);

        if (!animation.data) throw new DotLottieError('No animation data available.');

        const animationAssets = animation.data.assets as AnimationType['assets'];

        if (!animationAssets) throw new DotLottieError('No audio assets to rename.');

        // Find the audio asset inside the animation data and rename its path
        for (const asset of animationAssets) {
          if (isAudioAsset(asset)) {
            if (asset.id === audioId) {
              asset.p = audioAsset.fileName;
            }
          }
        }
      }
    });
  }

  private _renameAudioAssets(): void {
    const audio: Map<string, LottieAudioCommonV1[]> = new Map();

    this.animations.forEach((animation) => {
      audio.set(animation.id, animation.audioAssets);
    });

    let size = 0;

    audio.forEach((value) => {
      size += value.length;
    });

    for (let i = this.animations.length - 1; i >= 0; i -= 1) {
      const animation = this.animations.at(i);

      if (animation) {
        for (let j = animation.audioAssets.length - 1; j >= 0; j -= 1) {
          const audioAsset = animation.audioAssets.at(j);

          if (audioAsset) {
            this._renameAudio(animation, `audio_${size}`, audioAsset.id);
            size -= 1;
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
    const audios = this.getAudio();

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
      } else if (isAudioAsset(asset)) {
        for (const audio of audios) {
          if (audio.fileName === asset.p) {
            // encoded is true
            asset.e = 1;
            asset.u = '';
            asset.p = await audio.toDataURL();
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

  public getAudio(): LottieAudioCommonV1[] {
    const audio: LottieAudioCommonV1[] = [];

    this.animations.map((animation) => {
      return audio.push(...animation.audioAssets);
    });

    return audio;
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
  public async build(): Promise<DotLottieCommonV1> {
    this._buildManifest();

    for (const animation of this.animations) {
      await animation.toJSON();
    }

    if (this.animations.length > 1) {
      // Rename assets incrementally if there are multiple animations
      this._renameImageAssets();
      this._renameAudioAssets();
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
  public async fromURL(url: string): Promise<DotLottieCommonV1> {
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
