/**
 * Copyright 2023 Design Barn Inc.
 */

import type { Animation } from '@lottiefiles/lottie-types';

import type { LottieImageCommon } from './lottie-image-common';
import type { ManifestAnimation } from './manifest';
import { PlayMode } from './manifest';
import { createError } from './utils';

export type AnimationData = Animation;

export interface ExportOptions {
  inlineAssets?: boolean;
}

export interface AnimationOptions extends ManifestAnimation {
  data?: AnimationData;
  defaultActiveAnimation?: boolean;
  url?: string;
}

export class LottieAnimationCommon {
  protected _data?: AnimationData;

  protected _id: string = '';

  protected _url?: string;

  private _direction: number;

  private _speed: number;

  private _playMode: PlayMode;

  private _loop: boolean | number;

  private _autoplay: boolean;

  private _hover: boolean;

  private _intermission: number;

  // Will be translated to 'activeAnimationId' inside of the manifest file
  // This indicates if the player should play this animation by default rather than the first in the list.
  protected _defaultActiveAnimation: boolean;

  protected _imageAssets: LottieImageCommon[] = [];

  public constructor(options: AnimationOptions) {
    this._requireValidOptions(options);

    this._id = options.id;
    if (options.data) this._data = options.data;
    if (options.url) this._url = options.url;

    this._direction = options.direction ?? 1;
    this._speed = options.speed ?? 1.0;
    this._playMode = options.playMode ?? PlayMode.Normal;
    this._loop = options.loop ?? false;
    this._autoplay = options.autoplay ?? false;
    this._defaultActiveAnimation = options.defaultActiveAnimation ?? false;
    this._hover = options.hover ?? false;
    this._intermission = options.intermission ?? 0;
  }

  public async toBase64(): Promise<string> {
    throw createError('lottie animation controls tobase64 not implemented!');
  }

  public get id(): string {
    return this._id;
  }

  public set id(id: string) {
    this._requireValidId(id);

    this._id = id;
  }

  public get imageAssets(): LottieImageCommon[] {
    return this._imageAssets;
  }

  public set imageAssets(imageAssets: LottieImageCommon[]) {
    this._imageAssets = imageAssets;
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

  public get direction(): number {
    return this._direction;
  }

  public set direction(direction: number) {
    this._direction = direction;
  }

  public get speed(): number {
    return this._speed;
  }

  public set speed(speed: number) {
    this._speed = speed;
  }

  public get playMode(): PlayMode {
    return this._playMode;
  }

  public set playMode(playMode: PlayMode) {
    this._playMode = playMode;
  }

  public get loop(): boolean | number {
    return this._loop;
  }

  public set loop(loop: boolean | number) {
    this._loop = loop;
  }

  public get autoplay(): boolean {
    return this._autoplay;
  }

  public set autoplay(autoplay: boolean) {
    this._autoplay = autoplay;
  }

  public get defaultActiveAnimation(): boolean {
    return this._defaultActiveAnimation;
  }

  public set defaultActiveAnimation(defaultActiveAnimation: boolean) {
    this._defaultActiveAnimation = defaultActiveAnimation;
  }

  public get hover(): boolean {
    return this._hover;
  }

  public set hover(hover: boolean) {
    this._hover = hover;
  }

  public get intermission(): number {
    return this._intermission;
  }

  public set intermission(intermission: number) {
    this._intermission = intermission;
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
    throw createError('_extractImageAssets(): Promise<boolean> method not implemented in concrete class');
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
  public async toJSON(options: ExportOptions = {}): Promise<Animation> {
    if (this._url && !this._data) {
      this._data = await this._fromUrl(this._url);
    }

    this._requireValidLottieData(this._data);

    if (this._data.assets?.length) {
      // Even if the user wants to inline the assets, we still need to extract them
      await this._extractImageAssets();

      if (options.inlineAssets) {
        const animationAssets = this.data?.assets as Animation['assets'];

        if (!animationAssets) throw createError("Failed to inline assets, the animation's assets are undefined.");

        const images = this.imageAssets;

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
  private async _fromUrl(url: string): Promise<Animation> {
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
   * Ensure that the provided url is a valid string.
   * The url must be a non-empty string, otherwise an error will be thrown.
   * @param url - The url to validate.
   * @throws Error - if the url is not a valid string.
   *
   */
  private _requireValidDirection(direction: number): asserts direction is number {
    if (direction !== -1 && direction !== 1) {
      throw createError('Direction can only be -1 (backwards) or 1 (forwards)');
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
      throw createError('No data or url provided.');
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
  }
}
