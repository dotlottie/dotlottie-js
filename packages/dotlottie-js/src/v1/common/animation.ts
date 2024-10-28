/**
 * Copyright 2023 Design Barn Inc.
 */

import type { Animation as AnimationType } from '@lottie-animation-community/lottie-types';
import type { ZipOptions } from 'fflate';

import { DotLottieError, isAudioAsset } from '../../utils';

import type { LottieAudioCommonV1 } from './audio';
import type { LottieImageCommonV1 } from './image';
import { PlayMode } from './schemas/manifest';
import type { ManifestAnimationV1 } from './schemas/manifest';

export type AnimationData = AnimationType;

export interface ExportOptions {
  inlineAssets?: boolean;
}

export interface AnimationOptionsBase extends ManifestAnimationV1 {
  defaultActiveAnimation?: boolean;
  zipOptions?: ZipOptions;
}

export interface AnimationOptionsWithData extends AnimationOptionsBase {
  data: AnimationData;
  url?: never;
}

export interface AnimationOptionsWithUrl extends AnimationOptionsBase {
  data?: never;
  url: string;
}

export type AnimationOptions = AnimationOptionsWithData | AnimationOptionsWithUrl;

export class LottieAnimationCommonV1 {
  protected _data?: AnimationData;

  protected _id: string = '';

  protected _url?: string;

  private _direction: ManifestAnimationV1['direction'];

  private _speed: number | undefined;

  private _playMode: PlayMode | undefined;

  private _loop: boolean | number | undefined;

  private _autoplay: boolean | undefined;

  private _hover: boolean | undefined;

  private _intermission: number | undefined;

  private _themeColor: string | undefined;

  private _zipOptions: ZipOptions;

  // Will be translated to 'activeAnimationId' inside of the manifest file
  // This indicates if the player should play this animation by default rather than the first in the list.
  protected _defaultActiveAnimation: boolean;

  protected _imageAssets: LottieImageCommonV1[] = [];

  protected _audioAssets: LottieAudioCommonV1[] = [];

  public constructor(options: AnimationOptions) {
    this._requireValidOptions(options);

    this._id = options.id;

    this._zipOptions = options.zipOptions ?? {};

    if (options.data) this._data = options.data;
    if (options.url) this._url = options.url;

    this._defaultActiveAnimation = options.defaultActiveAnimation ?? false;

    if (typeof options.direction === 'number') {
      this.direction = options.direction;
    }

    if (typeof options.speed === 'number') {
      this.speed = options.speed;
    }

    if (typeof options.playMode === 'string') {
      this.playMode = options.playMode;
    }

    if (typeof options.loop === 'boolean' || typeof options.loop === 'number') {
      this.loop = options.loop;
    }

    if (typeof options.autoplay === 'boolean') {
      this.autoplay = options.autoplay;
    }

    if (typeof options.hover === 'boolean') {
      this.hover = options.hover;
    }

    if (typeof options.intermission === 'number') {
      this.intermission = options.intermission;
    }

    if (typeof options.themeColor === 'string') {
      this.themeColor = options.themeColor;
    }
  }

  public async toBase64(): Promise<string> {
    throw new DotLottieError('lottie animation controls tobase64 not implemented!');
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

  public get imageAssets(): LottieImageCommonV1[] {
    return this._imageAssets;
  }

  public set imageAssets(imageAssets: LottieImageCommonV1[]) {
    this._imageAssets = imageAssets;
  }

  public get audioAssets(): LottieAudioCommonV1[] {
    return this._audioAssets;
  }

  public set audioAssets(audioAssets: LottieAudioCommonV1[]) {
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

  public get themeColor(): string | undefined {
    return this._themeColor;
  }

  public set themeColor(themeColor: string | undefined) {
    if (themeColor) {
      this._requireValidThemeColor(themeColor);
    }

    this._themeColor = themeColor;
  }

  public get direction(): ManifestAnimationV1['direction'] {
    return this._direction;
  }

  public set direction(direction: ManifestAnimationV1['direction']) {
    this._direction = direction;
  }

  public get speed(): number | undefined {
    return this._speed;
  }

  public set speed(speed: number | undefined) {
    if (typeof speed === 'number') {
      this._requireValidSpeed(speed);
    }

    this._speed = speed;
  }

  public get playMode(): PlayMode | undefined {
    return this._playMode;
  }

  public set playMode(playMode: PlayMode | undefined) {
    if (typeof playMode === 'string') {
      this._requireValidPlayMode(playMode);
    }

    this._playMode = playMode;
  }

  public get loop(): boolean | number | undefined {
    return this._loop;
  }

  public set loop(loop: boolean | number | undefined) {
    if (typeof loop === 'number' || typeof loop === 'boolean') {
      this._requireValidLoop(loop);
    }

    this._loop = loop;
  }

  public get autoplay(): boolean | undefined {
    return this._autoplay;
  }

  public set autoplay(autoplay: boolean | undefined) {
    if (typeof autoplay === 'boolean') {
      this._requireValidAutoplay(autoplay);
    }

    this._autoplay = autoplay;
  }

  public get defaultActiveAnimation(): boolean {
    return this._defaultActiveAnimation;
  }

  public set defaultActiveAnimation(defaultActiveAnimation: boolean) {
    this._defaultActiveAnimation = defaultActiveAnimation;
  }

  public get hover(): boolean | undefined {
    return this._hover;
  }

  public set hover(hover: boolean | undefined) {
    if (typeof hover === 'boolean') {
      this._requireValidHover(hover);
    }

    this._hover = hover;
  }

  public get intermission(): number | undefined {
    return this._intermission;
  }

  public set intermission(intermission: number | undefined) {
    if (typeof intermission === 'number') {
      this._requireValidIntermission(intermission);
    }

    this._intermission = intermission;
  }

  /**
   * Return the animation data as an array buffer.
   * @returns data - The animation data as an ArrayBuffer.
   * @throws Error - if the animation data is not set and the url is not provided.
   * @throws Error - if the animation data is not a valid Lottie animation data object.
   * @throws Error - if the fetch request fails.
   */
  public async toArrayBuffer(options?: ExportOptions): Promise<ArrayBuffer> {
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
  public async toJSON(options?: ExportOptions): Promise<AnimationType> {
    if (this._url && !this._data) {
      this._data = await this._fromUrl(this._url);
    }

    this._requireValidLottieData(this._data);

    if (this._data.assets?.length) {
      // Even if the user wants to inline the assets, we still need to extract them
      await this._extractImageAssets();
      await this._extractAudioAssets();

      if (options?.inlineAssets) {
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
        throw new DotLottieError(`${error.message}: Invalid json returned from url`);
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
      throw new DotLottieError('Invalid animation url');
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
      throw new DotLottieError('Received invalid Lottie data.');
    }
  }

  /**
   * Ensure that the provided id is a valid string.
   * The id must be a non-empty string, otherwise an error will be thrown.
   * @param id - The id to validate.
   * @throws Error - if the id is not a valid string.
   */
  private _requireValidId(id: string | undefined): asserts id is string {
    if (!id) throw new DotLottieError('Invalid animation id');
  }

  /**
   * Ensure that the provided url is a valid string.
   * The url must be a non-empty string, otherwise an error will be thrown.
   * @param url - The url to validate.
   * @throws Error - if the url is not a valid string.
   *
   */
  private _requireValidDirection(direction: number): asserts direction is number {
    if (direction !== -1 && direction !== 1) {
      throw new DotLottieError('Direction can only be -1 (backwards) or 1 (forwards)');
    }
  }

  /**
   * Ensure that the provided intermission is a valid, positive number.
   * @param intermission - The intermission to validate.
   * @throws Error - if the intermission is not a valid number.
   */
  private _requireValidIntermission(intermission: number): asserts intermission is number {
    if (intermission < 0 || !Number.isInteger(intermission)) {
      throw new DotLottieError('intermission must be a positive number');
    }
  }

  /**
   * Ensure that the provided loop is a valid, positive number or boolean.
   * @param loop - The loop to validate.
   * @throws Error - if the loop is not a valid number or boolean.
   */
  private _requireValidLoop(loop: number | boolean): asserts loop is number | boolean {
    if (typeof loop === 'number' && (!Number.isInteger(loop) || loop < 0)) {
      throw new DotLottieError('loop must be a positive number or boolean');
    }
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
      throw new DotLottieError('No data or url provided.');
    }

    if (options.data) {
      this._requireValidLottieData(options.data);
    }

    if (options.url) {
      this._requireValidUrl(options.url);
    }

    if (options.direction) {
      this._requireValidDirection(options.direction);
    }

    if (options.intermission) {
      this._requireValidIntermission(options.intermission);
    }

    if (options.loop) {
      this._requireValidLoop(options.loop);
    }
  }

  private _requireValidSpeed(speed: number | undefined): asserts speed is number {
    if (speed !== undefined && (typeof speed !== 'number' || speed < 0)) {
      throw new DotLottieError('Speed must be a non-negative number');
    }
  }

  private _requireValidPlayMode(playMode: PlayMode | undefined): asserts playMode is PlayMode {
    const validPlayModes = Object.values(PlayMode);

    if (playMode !== undefined && !validPlayModes.includes(playMode)) {
      throw new DotLottieError(`playMode must be one of: ${validPlayModes.join(', ')}`);
    }
  }

  private _requireValidAutoplay(autoplay: boolean | undefined): asserts autoplay is boolean {
    if (autoplay !== undefined && typeof autoplay !== 'boolean') {
      throw new DotLottieError('autoplay must be a boolean');
    }
  }

  private _requireValidHover(hover: boolean | undefined): asserts hover is boolean {
    if (hover !== undefined && typeof hover !== 'boolean') {
      throw new DotLottieError('Hover must be a boolean');
    }
  }

  private _requireValidThemeColor(themeColor: string | undefined): asserts themeColor is string {
    if (themeColor !== undefined && typeof themeColor !== 'string') {
      throw new DotLottieError('themeColor must be a string and start with #');
    }

    if (themeColor !== undefined && !themeColor.startsWith('#')) {
      throw new DotLottieError('themeColor must be a string and start with #');
    }
  }
}
