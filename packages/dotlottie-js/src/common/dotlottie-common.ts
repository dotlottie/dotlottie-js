/**
 * Copyright 2023 Design Barn Inc.
 */

import type { Animation as AnimationType } from '@lottie-animation-community/lottie-types';
import type { ZipOptions } from 'fflate';

import pkg from '../../package.json';

import type { DotLottiePlugin } from './dotlottie-plugin';
import type { DotLottieStateMachineCommonOptions } from './dotlottie-state-machine-common';
import { DotLottieStateMachineCommon } from './dotlottie-state-machine-common';
import type { ThemeOptions } from './dotlottie-theme-common';
import { LottieThemeCommon } from './dotlottie-theme-common';
import type { AnimationOptions, LottieAnimationCommon } from './lottie-animation-common';
import type { LottieAudioCommon } from './lottie-audio-common';
import type { LottieImageCommon } from './lottie-image-common';
import type { Manifest } from './manifest';
import { DotLottieError, createError, isAudioAsset, isImageAsset, isValidURL } from './utils';

export interface DotLottieOptions {
  author?: string;
  customData?: Record<string, string>;
  description?: string;
  enableDuplicateImageOptimization?: boolean;
  generator?: string;
  keywords?: string;
  plugins?: DotLottiePlugin[];
  revision?: number;
  version?: string;
}

export interface GetAnimationOptions {
  inlineAssets?: boolean;
}

export interface ConversionOptions {
  zipOptions?: ZipOptions;
}

export class DotLottieCommon {
  protected readonly _animationsMap: Map<string, LottieAnimationCommon> = new Map();

  protected readonly _plugins: DotLottiePlugin[] = [];

  protected readonly _themesMap: Map<string, LottieThemeCommon> = new Map();

  protected readonly _stateMachinesMap: Map<string, DotLottieStateMachineCommon> = new Map();

  protected _author?: string;

  protected _description?: string;

  protected _generator?: string;

  protected _keywords?: string;

  protected _version?: string;

  protected _revision?: number;

  // Custom data for the dotLottie
  protected _customData?: Record<string, unknown>;

  public enableDuplicateImageOptimization?: boolean;

  public constructor(options?: DotLottieOptions) {
    this._author = options?.author ?? 'LottieFiles';

    this._description = options?.description ?? '';

    this._generator = options?.generator ?? `${pkg.name}@${pkg.version}`;

    this._keywords = options?.keywords ?? 'dotLottie';

    this._version = options?.version ?? '1.0';

    this._customData = options?.customData ?? {};

    this._revision = options?.revision ?? 1;

    this.enableDuplicateImageOptimization = options?.enableDuplicateImageOptimization ?? false;
  }

  public async toBase64(_options: ConversionOptions | undefined = undefined): Promise<string> {
    throw createError('toBase64() method not implemented in concrete class!');
  }

  public create(_options?: DotLottieOptions): DotLottieCommon {
    throw createError('create() method not implemented in concrete class!');
  }

  public async download(_fileName: string, _options: ConversionOptions | undefined = undefined): Promise<void> {
    throw createError('download(fileName:string) method not implemented in concrete class!');
  }

  public addPlugins(..._plugins: DotLottiePlugin[]): DotLottieCommon {
    throw createError('addPlugins(...plugins: DotLottiePlugin[]) not implemented in concrete class!');
  }

  public addAnimation(_animationOptions: AnimationOptions): DotLottieCommon {
    throw createError('addAnimation(animationOptions: AnimationOptions) not implemented in concrete class!');
  }

  public async fromArrayBuffer(_arrayBuffer: ArrayBuffer): Promise<DotLottieCommon> {
    throw createError(
      'fromArrayBuffer(arrayBuffer: ArrayBuffer): Promise<DotLottieCommon> not implemented in concrete class!',
    );
  }

  public async toArrayBuffer(_options: ConversionOptions | undefined = undefined): Promise<ArrayBuffer> {
    throw createError('toArrayBuffer(): Promise<ArrayBuffer> is not implemented in concrete class!');
  }

  public get plugins(): DotLottiePlugin[] {
    return this._plugins;
  }

  public get version(): string | undefined {
    return this._version;
  }

  public get revision(): number | undefined {
    return this._revision;
  }

  public get author(): string | undefined {
    return this._author;
  }

  public get description(): string | undefined {
    return this._description;
  }

  public get keywords(): string | undefined {
    return this._keywords;
  }

  public get generator(): string | undefined {
    return this._generator;
  }

  public get animations(): LottieAnimationCommon[] {
    return Array.from(this._animationsMap.values());
  }

  public get manifest(): Manifest {
    return this._buildManifest();
  }

  public get custom(): Record<string, unknown> | undefined {
    return this._customData;
  }

  public get themes(): LottieThemeCommon[] {
    return Array.from(this._themesMap.values());
  }

  public get stateMachines(): DotLottieStateMachineCommon[] {
    return Array.from(this._stateMachinesMap.values());
  }

  public setCustomData(customData: Record<string, unknown> | undefined): DotLottieCommon {
    this._customData = customData ?? {};

    return this;
  }

  public setAuthor(author: string | undefined): DotLottieCommon {
    this._author = typeof author === 'string' ? author : 'LottieFiles';

    return this;
  }

  public setDescription(description: string | undefined): DotLottieCommon {
    this._description = typeof description === 'string' ? description : '';

    return this;
  }

  public setGenerator(generator: string | undefined): DotLottieCommon {
    this._generator = typeof generator === 'string' ? generator : `${pkg.name}@${pkg.version}`;

    return this;
  }

  public setKeywords(keywords: string | undefined): DotLottieCommon {
    this._keywords = typeof keywords === 'string' ? keywords : 'dotLottie';

    return this;
  }

  public setVersion(version: string | undefined): DotLottieCommon {
    this._version = typeof version === 'string' ? version : '1.0';

    return this;
  }

  public setRevision(revision: number): DotLottieCommon {
    this._revision = revision;

    return this;
  }

  public removePlugins(...plugins: DotLottiePlugin[]): DotLottieCommon {
    plugins.forEach((plugin) => {
      plugin.uninstall();

      const pluginIndex = this._plugins.indexOf(plugin);

      if (pluginIndex !== -1) {
        this._plugins.splice(pluginIndex, 1);
      }
    });

    return this;
  }

  /**
   * Renames the underlying LottieImage, as well as updating the image asset path inside the animation data.
   * @param newName - desired id and fileName,
   * @param imageId - The id of the LottieImage to rename
   */
  private async _renameImage(animation: LottieAnimationCommon, newName: string, imageId: string): Promise<void> {
    for (const imageAsset of animation.imageAssets) {
      if (imageAsset.id === imageId) {
        const oldPath = imageAsset.fileName;

        await imageAsset.renameImage(newName);

        if (!animation.data) throw createError('No animation data available.');

        const animationAssets = animation.data.assets as AnimationType['assets'];

        if (!animationAssets) throw createError('No image assets to rename.');

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
        if (dupeMap.has(imageAsset.id)) {
          const count = dupeMap.get(imageAsset.id) ?? 0;

          dupeMap.set(imageAsset.id, count + 1);
        } else {
          dupeMap.set(imageAsset.id, 1);
        }
      });
    });

    return dupeMap;
  }

  /**
   * Renames the image assets in all animations to avoid conflicts.
   */
  private async _renameImageAssets(): Promise<void> {
    const dupeMap = this._generateMapOfOccurencesFromImageIds();

    for (let i = this.animations.length - 1; i >= 0; i -= 1) {
      const animation = this.animations.at(i);

      if (animation) {
        for (let j = animation.imageAssets.length - 1; j >= 0; j -= 1) {
          const image = animation.imageAssets.at(j);

          if (image) {
            let count = dupeMap.get(image.id) ?? 0;

            if (count > 0) {
              count -= 1;
            }

            dupeMap.set(image.id, count);

            if (count > 0) {
              // Rename the image
              await this._renameImage(animation, `${image.id}_${count}`, image.id);
            }
          }
        }
      }
    }
  }

  /**
   * Renames the underlying LottieAudio, as well as updating the audio asset path inside the animation data.
   * @param newName - desired id and fileName,
   * @param audioId - The id of the LottieAudio to rename
   */
  private _renameAudio(animation: LottieAnimationCommon, newName: string, audioId: string): void {
    animation.audioAssets.forEach((audioAsset) => {
      if (audioAsset.id === audioId) {
        // Rename the LottieImage
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
    const audio: Map<string, LottieAudioCommon[]> = new Map();

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

  protected _addLottieAnimation(animation: LottieAnimationCommon): DotLottieCommon {
    if (this._animationsMap.get(animation.id)) {
      throw createError('Duplicate animation id detected, aborting.');
    }

    this._animationsMap.set(animation.id, animation);

    return this;
  }

  /**
   * Inlines all assets of the passed animation
   * @param animation - Animation whose asset are to be inlined
   * @returns LottieAnimationCommon with inlined assets
   */
  private async _findAssetsAndInline(animation: LottieAnimationCommon): Promise<LottieAnimationCommon> {
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
   * @param inlineAssets - if true will inline the assets inside the data of the LottieAnimation
   * @returns
   */
  public async getAnimation(
    animationId: string,
    options: GetAnimationOptions = {},
  ): Promise<LottieAnimationCommon | undefined> {
    if (!options.inlineAssets) return this._animationsMap.get(animationId);

    let dataWithInlinedImages = this._animationsMap.get(animationId);

    if (!dataWithInlinedImages) throw new DotLottieError('Failed to find animation.');

    dataWithInlinedImages = await this._findAssetsAndInline(dataWithInlinedImages);

    return dataWithInlinedImages;
  }

  public getAnimations(): Array<[string, LottieAnimationCommon]> | undefined {
    return Array.from(this._animationsMap);
  }

  public removeAnimation(animationId: string): DotLottieCommon {
    const targetAnimation = this._animationsMap.get(animationId);

    if (targetAnimation) {
      const assignedThemes = targetAnimation.themes;

      for (const assignedTheme of assignedThemes) {
        this.unassignTheme({
          animationId: targetAnimation.id,
          themeId: assignedTheme.id,
        });
      }

      this._animationsMap.delete(targetAnimation.id);
    }

    return this;
  }

  public getImages(): LottieImageCommon[] {
    const images: LottieImageCommon[] = [];

    this.animations.map((animation) => {
      return images.push(...animation.imageAssets);
    });

    return images;
  }

  public getAudio(): LottieAudioCommon[] {
    const audio: LottieAudioCommon[] = [];

    this.animations.map((animation) => {
      return audio.push(...animation.audioAssets);
    });

    return audio;
  }

  public getTheme(themeId: string): LottieThemeCommon | undefined {
    return this._themesMap.get(themeId);
  }

  protected _buildManifest(): Manifest {
    const animationsList = Array.from(this._animationsMap.values());
    const themesList = Array.from(this._themesMap.values());
    const stateMachinesList = Array.from(this._stateMachinesMap.keys());
    const activeAnimationId = animationsList.find((value) => value.defaultActiveAnimation)?.id ?? '';

    const manifest: Manifest = {
      version: this.version,
      revision: this.revision,
      keywords: this.keywords,
      author: this.author,
      generator: this.generator,
      animations: animationsList.map((animation) => ({
        id: animation.id,
        direction: animation.direction,
        speed: animation.speed,
        playMode: animation.playMode,
        loop: animation.loop,
        autoplay: animation.autoplay,
        hover: animation.hover,
        intermission: animation.intermission,
        ...(animation.defaultTheme ? { defaultTheme: animation.defaultTheme } : {}),
      })),
      ...(this.description && this.description.trim() !== '' ? { description: this.description } : {}),
      ...(activeAnimationId && activeAnimationId.trim() !== '' ? { activeAnimationId } : {}),
      ...(this._customData && Object.keys(this._customData).length !== 0 ? { custom: this._customData } : {}),
    };

    if (themesList.length > 0) {
      manifest.themes = themesList.map((theme) => ({
        id: theme.id,
        animations: theme.animations.map((animation) => animation.id),
      }));
    }

    if (stateMachinesList.length > 0) {
      manifest.states = stateMachinesList;
    }

    return manifest;
  }

  /**
   * Constructs the manifest and calls toJSON on the animations
   * so the data is fetched for every animation.
   *
   * @returns DotLottie context
   */
  public async build(): Promise<DotLottieCommon> {
    this._buildManifest();

    for (const animation of this.animations) {
      await animation.toJSON();
    }

    for (const theme of this.themes) {
      await theme.toString();
    }

    if (this.animations.length > 1) {
      // Rename assets incrementally if there are multiple animations
      await this._renameImageAssets();
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
   * Creates a DotLottie instance from a url to a dotlottie file
   * @param url - url to the dotlottie file
   * @returns DotLottie instance
   */
  public async fromURL(url: string): Promise<DotLottieCommon> {
    if (!isValidURL(url)) throw createError('Invalid URL');

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw createError(response.statusText);
      }

      const arrayBuffer = await response.arrayBuffer();

      return this.fromArrayBuffer(arrayBuffer);
    } catch (err) {
      if (err instanceof Error) {
        throw createError(err.message);
      }
    }

    throw createError('Unknown error');
  }

  public merge(...dotlotties: DotLottieCommon[]): DotLottieCommon {
    const mergedDotlottie = this.create();

    for (const dotlottie of dotlotties) {
      dotlottie.animations.forEach((animation) => {
        if (animation.data) {
          mergedDotlottie.addAnimation({
            id: animation.id,
            data: animation.data,
          });
        } else if (animation.url) {
          mergedDotlottie.addAnimation({
            id: animation.id,
            url: animation.url,
          });
        }
      });

      dotlottie.themes.forEach((theme) => {
        if (theme.data) {
          mergedDotlottie.addTheme({
            id: theme.id,
            data: theme.data,
          });
        } else if (theme.url) {
          mergedDotlottie.addTheme({
            id: theme.id,
            url: theme.url,
          });
        }

        theme.animations.forEach((animation) => {
          mergedDotlottie.assignTheme({
            animationId: animation.id,
            themeId: theme.id,
          });
        });
      });

      dotlottie.stateMachines.forEach((stateMachine) => {
        const stateOption = {
          states: stateMachine.states,
          descriptor: { id: stateMachine.id, initial: stateMachine.initial },
          listeners: stateMachine.listeners,
          triggers: stateMachine.triggers,
          zipOptions: stateMachine.zipOptions,
        };

        mergedDotlottie.addStateMachine(stateOption);
      });
    }

    return mergedDotlottie;
  }

  public addTheme(themeOptions: ThemeOptions): DotLottieCommon {
    const theme = new LottieThemeCommon(themeOptions);

    this._themesMap.set(theme.id, theme);

    return this;
  }

  public removeTheme(id: string): DotLottieCommon {
    const targetTheme = this._themesMap.get(id);

    if (targetTheme) {
      const scopedAnimations = targetTheme.animations;

      for (const scopedAnimation of scopedAnimations) {
        this.unassignTheme({
          animationId: scopedAnimation.id,
          themeId: id,
        });
      }

      this._themesMap.delete(targetTheme.id);
    }

    return this;
  }

  public assignTheme({ animationId, themeId }: { animationId: string; themeId: string }): DotLottieCommon {
    const theme = this._themesMap.get(themeId);

    if (!theme) throw createError(`Failed to find theme with id ${themeId}`);

    const animation = this._animationsMap.get(animationId);

    if (!animation) throw createError(`Failed to find animation with id ${animationId}`);

    theme.addAnimation(animation);

    animation.addTheme(theme);

    return this;
  }

  public unassignTheme({ animationId, themeId }: { animationId: string; themeId: string }): DotLottieCommon {
    const theme = this._themesMap.get(themeId);

    if (!theme) throw createError(`Failed to find theme with id ${themeId}`);

    const animation = this._animationsMap.get(animationId);

    if (!animation) throw createError(`Failed to find animation with id ${animationId}`);

    theme.removeAnimation(animation.id);

    animation.removeTheme(theme.id);

    return this;
  }

  public addStateMachine(stateMachineOptions: DotLottieStateMachineCommonOptions): DotLottieCommon {
    const newState = new DotLottieStateMachineCommon(stateMachineOptions);

    this._stateMachinesMap.set(stateMachineOptions.descriptor.id, newState);

    return this;
  }

  public getStateMachine(stateId: string): DotLottieStateMachineCommon | undefined {
    return this._stateMachinesMap.get(stateId);
  }

  public removeStateMachine(stateMachineId: string): DotLottieCommon {
    this._stateMachinesMap.delete(stateMachineId);

    return this;
  }

  protected _requireValidAuthor(author: string | undefined): asserts author is string {
    if (typeof author !== 'string') throw createError('Invalid author');
  }

  protected _requireValidDescription(description: string | undefined): asserts description is string {
    if (typeof description !== 'string') throw createError('Invalid description');
  }

  protected _requireValidGenerator(generator: string | undefined): asserts generator is string {
    if (typeof generator !== 'string') throw createError('Invalid generator');
  }

  protected _requireValidKeywords(keywords: string | undefined): asserts keywords is string {
    if (typeof keywords !== 'string') throw createError('Invalid keywords');
  }

  protected _requireValidVersion(version: string | undefined): asserts version is string {
    if (typeof version !== 'string') throw createError('Invalid version');
  }

  protected _requireValidCustomData(
    customData: Record<string, unknown> | undefined,
  ): asserts customData is Record<string, unknown> {
    if (!customData) throw createError('Invalid customData');
  }
}
