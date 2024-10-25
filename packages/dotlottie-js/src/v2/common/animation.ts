/**
 * Copyright 2023 Design Barn Inc.
 */

import type { Animation as AnimationType } from '@lottie-animation-community/lottie-types';
import type { ZipOptions } from 'fflate';

import type { ManifestAnimation } from '../../schemas/v2/manifest';

import type { LottieAudioCommon } from './audio';
import type { LottieImageCommon } from './image';
import type { LottieThemeCommon } from './theme';
import { DotLottieError, createError, isAudioAsset } from './utils';

export type AnimationData = AnimationType;

export interface ExportOptions {
  inlineAssets?: boolean;
}

export interface AnimationOptions extends ManifestAnimation {
  background?: string | undefined;
  data?: AnimationData | undefined;
  defaultActiveAnimation?: boolean | undefined;
  id: string;
  initialTheme?: string | undefined;
  url?: string | undefined;
  zipOptions?: ZipOptions | undefined;
}

export class LottieAnimationCommon {
  protected _data?: AnimationData;

  protected _id: string = '';

  protected _url?: string;

  private _zipOptions: ZipOptions;

  // This indicates if the player should play this animation by default rather than the first in the list.
  protected _defaultActiveAnimation: boolean;

  protected _imageAssets: LottieImageCommon[] = [];

  protected _audioAssets: LottieAudioCommon[] = [];

  protected _themesMap: Map<string, LottieThemeCommon> = new Map();

  protected _initialTheme: string | null = null;

  protected _background: string | null = null;

  public constructor(options: AnimationOptions) {
    this._requireValidOptions(options);

    this._id = options.id;

    this._zipOptions = options.zipOptions ?? {};

    if (options.data) this._data = options.data;
    if (options.url) this._url = options.url;

    this._background = options.background ?? null;
    this._initialTheme = options.initialTheme ?? null;

    this._defaultActiveAnimation = options.defaultActiveAnimation ?? false;
  }

  public async toBase64(): Promise<string> {
    throw createError('lottie animation controls tobase64 not implemented!');
  }

  public get zipOptions(): ZipOptions {
    return this._zipOptions;
  }

  public set zipOptions(zipOptions: ZipOptions) {
    this._zipOptions = zipOptions;
  }

  public get id(): string {
    return this._id;
  }

  public set id(id: string) {
    this._requireValidId(id);

    this._id = id;
  }

  public get background(): string | null {
    return this._background;
  }

  public set background(background: string | null) {
    this._background = background;
  }

  public get initialTheme(): string | null {
    return this._initialTheme;
  }

  public set initialTheme(initialTheme: string | null) {
    this._initialTheme = initialTheme;
  }

  public get themes(): LottieThemeCommon[] {
    return Array.from(this._themesMap.values());
  }

  public set themes(themes: LottieThemeCommon[]) {
    this._themesMap = new Map();
    themes.forEach((theme) => {
      this._themesMap.set(theme.id, theme);
    });
  }

  public get imageAssets(): LottieImageCommon[] {
    return this._imageAssets;
  }

  public set imageAssets(imageAssets: LottieImageCommon[]) {
    this._imageAssets = imageAssets;
  }

  public get audioAssets(): LottieAudioCommon[] {
    return this._audioAssets;
  }

  public set audioAssets(audioAssets: LottieAudioCommon[]) {
    this._audioAssets = audioAssets;
  }

  public get data(): AnimationData | undefined {
    return this._data;
  }

  public set data(data: AnimationData | undefined) {
    this._requireValidLottieData(data);

    this._data = data;
  }

  public get url(): string | undefined {
    return this._url;
  }

  public set url(url: string | undefined) {
    this._requireValidUrl(url);

    this._url = url;
  }

  public get defaultActiveAnimation(): boolean {
    return this._defaultActiveAnimation;
  }

  public set defaultActiveAnimation(defaultActiveAnimation: boolean) {
    this._defaultActiveAnimation = defaultActiveAnimation;
  }

  public addTheme(theme: LottieThemeCommon): void {
    this._themesMap.set(theme.id, theme);
  }

  public removeTheme(themeId: string): void {
    this._themesMap.delete(themeId);
  }

  /**
   * Return the animation data as an array buffer.
   * @returns data - The animation data as an ArrayBuffer.
   * @throws Error - if the animation data is not set and the url is not provided.
   * @throws Error - if the animation data is not a valid Lottie animation data object.
   * @throws Error - if the fetch request fails.
   */
  public async toArrayBuffer(options: ExportOptions = {}): Promise<ArrayBuffer> {
    const dataJson = await this.toJSON(options);

    return new TextEncoder().encode(JSON.stringify(dataJson)).buffer;
  }

  protected async _extractImageAssets(): Promise<boolean> {
    throw new DotLottieError('_extractImageAssets(): Promise<boolean> method not implemented in concrete class');
  }

  protected async _extractAudioAssets(): Promise<boolean> {
    throw new DotLottieError('_extractAudioAssets(): Promise<boolean> method not implemented in concrete class');
  }

  /**
   * Return the animation data as a blob.
   * @returns blob - The animation data as a Blob.
   * @throws Error - if the animation data is not set and the url is not provided.
   * @throws Error - if the animation data is not a valid Lottie animation data object.
   * @throws Error - if the fetch request fails.
   */
  public async toBlob(options: ExportOptions = {}): Promise<Blob> {
    const dataJson = await this.toJSON(options);

    return new Blob([JSON.stringify(dataJson)], { type: 'application/json' });
  }

  /**
   * Return the animation data as a JSON object.
   * If the animation data is not already set, it will be fetched from the provided url.
   * @returns data - The animation data.
   * @throws Error - if the animation data is not a valid Lottie animation data object.
   * @throws Error - if the fetch request fails.
   */
  public async toJSON(options: ExportOptions = {}): Promise<AnimationType> {
    if (this._url && !this._data) {
      this._data = await this._fromUrl(this._url);
    }

    this._requireValidLottieData(this._data);

    if (this._data.assets?.length) {
      // Even if the user wants to inline the assets, we still need to extract them
      await this._extractImageAssets();
      await this._extractAudioAssets();

      if (options.inlineAssets) {
        const animationAssets = this.data?.assets as AnimationType['assets'];

        if (!animationAssets)
          throw new DotLottieError("Failed to inline assets, the animation's assets are undefined.");

        const images = this.imageAssets;
        const audios = this.audioAssets;

        for (const asset of animationAssets) {
          if ('w' in asset && 'h' in asset && !('xt' in asset) && 'p' in asset) {
            for (const image of images) {
              if (image.fileName === asset.p) {
                // encoded is true
                asset.e = 1;
                asset.u = '';
                asset.p = await image.toDataURL();
              }
            }
          } else if (isAudioAsset(asset)) {
            // Audio asset
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
      }
    }

    return this._data;
  }

  /**
   * Fetch the animation data from the provided url.
   * @param url - The url to fetch the animation data from.
   * @returns animationData - The animation data.
   * @throws Error - if the fetch request fails.
   * @throws Error - if the data object is not a valid Lottie animation data object.
   */
  private async _fromUrl(url: string): Promise<AnimationType> {
    const response = await fetch(url);

    const text = await response.text();

    let json;

    try {
      json = JSON.parse(text);
    } catch (error) {
      if (error instanceof Error) {
        throw createError(`${error.message}: Invalid json returned from url`);
      }
    }

    this._requireValidLottieData(json as AnimationData);

    return json;
  }

  /**
   * Ensure that the provided url is a valid string.
   * The url must be a non-empty string, otherwise an error will be thrown.
   * @param url - The url to validate.
   * @throws Error - if the url is not a valid string.
   *
   */
  private _requireValidUrl(url: string | undefined): asserts url is string {
    try {
      // eslint-disable-next-line no-new
      new URL(url || '');
    } catch (_err) {
      throw createError('Invalid animation url');
    }
  }

  /**
   * Ensure that the provided data object is a valid Lottie animation data object.
   * The data object must contain the following mandatory properties: v, ip, op, layers, fr, w, h.
   * If the data object does not contain all mandatory properties, an error will be thrown.
   * @param data - The data object to validate.
   * @throws Error - if the data object is not a valid Lottie animation data object.
   */
  private _requireValidLottieData(data: AnimationData | undefined): asserts data is AnimationData {
    const mandatoryLottieProperties = ['v', 'ip', 'op', 'layers', 'fr', 'w', 'h'];

    const hasAllMandatoryProperties = mandatoryLottieProperties.every((field) =>
      Object.prototype.hasOwnProperty.call(data, field),
    );

    if (!hasAllMandatoryProperties) {
      throw createError('Received invalid Lottie data.');
    }
  }

  /**
   * Ensure that the provided id is a valid string.
   * The id must be a non-empty string, otherwise an error will be thrown.
   * @param id - The id to validate.
   * @throws Error - if the id is not a valid string.
   */
  private _requireValidId(id: string | undefined): asserts id is string {
    if (!id) throw createError('Invalid animation id');
  }

  /**
   * Ensure that the provided options object is a valid AnimationOptions object.
   * The options object must contain the following mandatory properties: id, data or url.
   * If the options object does not contain all mandatory properties, an error will be thrown.
   * @param options - The options object to validate.
   * @throws Error - if the options object is not a valid AnimationOptions object.
   * @throws Error - if the id is not a valid string.
   * @throws Error - if the data object is not a valid Lottie animation data object.
   * @throws Error - if the url is not a valid url string.
   * @throws Error - if the data object is not set and the url is not provided.
   */
  private _requireValidOptions(options: AnimationOptions): asserts options is AnimationOptions {
    this._requireValidId(options.id);

    if (!options.data && !options.url) {
      throw createError('No data or url provided.');
    }

    if (options.data) {
      this._requireValidLottieData(options.data);
    }

    if (options.url) {
      this._requireValidUrl(options.url);
    }
  }
}
