/**
 * Copyright 2023 Design Barn Inc.
 */

import type { ZipOptions } from 'fflate';

import type { LottieAnimationCommon } from './lottie-animation-common';
import { createError, isValidURL } from './utils';

type Data = Record<string, unknown>;

export interface ThemeOptions {
  data?: Data;
  id: string;
  url?: string;
  zipOptions?: ZipOptions;
}

export class LottieThemeCommon {
  protected _data?: Data;

  protected _id: string = '';

  protected _url?: string;

  protected readonly _animationsMap: Map<string, LottieAnimationCommon> = new Map();

  protected _zipOptions: ZipOptions;

  public constructor(options: ThemeOptions) {
    this._requireValidId(options.id);
    this._id = options.id;

    if (options.data) {
      this._requireValidData(options.data);
      this._data = options.data;
    }

    if (options.url) {
      this._requireValidUrl(options.url);
      this._url = options.url;
    }

    this._zipOptions = options.zipOptions ?? {};
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

  public set id(id: string | undefined) {
    this._requireValidId(id);

    this._id = id;
  }

  public get url(): string | undefined {
    return this._url;
  }

  public set url(url: string | undefined) {
    this._requireValidUrl(url);

    this._url = url;
  }

  public get data(): Data | undefined {
    return this._data;
  }

  public set data(data: Data | undefined) {
    this._requireValidData(data);

    this._data = data;
  }

  public get animations(): LottieAnimationCommon[] {
    return Array.from(this._animationsMap.values());
  }

  public async toString(): Promise<string> {
    if (!this._data && this._url) {
      await this._loadDataFromUrl(this._url);
    }

    this._requireValidData(this._data);

    return JSON.stringify(this._data);
  }

  public addAnimation(animation: LottieAnimationCommon): void {
    this._animationsMap.set(animation.id, animation);
  }

  public removeAnimation(animationId: string): void {
    this._animationsMap.delete(animationId);
  }

  private _requireValidId(id: string | undefined): asserts id is string {
    if (typeof id !== 'string' || !id) throw createError('Invalid theme id');
  }

  private _requireValidUrl(url: string | undefined): asserts url is string {
    if (!url || !isValidURL(url)) throw createError('Invalid theme url');
  }

  private _requireValidData(data: Data | undefined): asserts data is Data {
    if (typeof data !== 'object') throw createError('Invalid theme data');
  }

  private async _loadDataFromUrl(url: string): Promise<void> {
    try {
      const response = await fetch(url);

      const data = await response.json();

      this._data = data;
    } catch (error) {
      throw createError(`Failed to fetch theme from url, Error: ${JSON.stringify(error)}`);
    }
  }
}
