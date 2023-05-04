/**
 * Copyright 2023 Design Barn Inc.
 */

import type { LottieAnimationCommon } from './lottie-animation-common.js';
import { createError } from './utils';

export type ImageData = string | ArrayBuffer | Blob;

export interface ImageOptions {
  data?: ImageData;
  fileName: string;
  id: string;
  parentAnimations?: LottieAnimationCommon[];
  url?: string;
}

export class LottieImageCommon {
  protected _data?: ImageData;

  protected _id: string = '';

  protected _url?: string;

  protected _fileName: string = '';

  protected _parentAnimations: LottieAnimationCommon[];

  public constructor(options: ImageOptions) {
    this._requireValidId(options.id);
    this._requireValidFileName(options.fileName);

    if (options.data) {
      this._data = options.data;
    }

    if (options.id) {
      this._id = options.id;
    }

    if (options.url) {
      this._url = options.url;
    }

    if (options.fileName) {
      this._fileName = options.fileName;
    }

    this._parentAnimations = options.parentAnimations || [];
  }

  /**
   * Ensure that the provided id is a valid string.
   * The id must be a non-empty string, otherwise an error will be thrown.
   * @param id - The id to validate.
   * @throws Error - if the id is not a valid string.
   */
  private _requireValidId(id: string | undefined): asserts id is string {
    if (!id) throw createError('Invalid image id');
  }

  /**
   * Ensure that the provided fileName is a valid string.
   * The fileName must be a non-empty string, otherwise an error will be thrown.
   * @param fileName - The fileName to validate.
   * @throws Error - if the fileName is not a valid string.
   */
  private _requireValidFileName(fileName: string | undefined): asserts fileName is string {
    if (!fileName) throw createError('Invalid image fileName');
  }

  public get fileName(): string {
    return this._fileName;
  }

  public set fileName(fileName: string) {
    if (!fileName) throw createError('Invalid image file name');
    this._fileName = fileName;
  }

  public get id(): string {
    return this._id;
  }

  public set id(id: string) {
    if (!id) throw createError('Invalid image id');
    this._id = id;
  }

  public get data(): ImageData | undefined {
    return this._data;
  }

  public set data(data: ImageData | undefined) {
    if (!data) {
      throw createError('Invalid data');
    }

    this._data = data;
  }

  public get url(): string | undefined {
    return this._url;
  }

  public set url(url: string | undefined) {
    if (!url) {
      throw new Error('Invalid url');
    }

    this._url = url;
  }

  public get parentAnimations(): LottieAnimationCommon[] {
    return this._parentAnimations;
  }

  public set parentAnimations(parentAnimations: LottieAnimationCommon[]) {
    this._parentAnimations = parentAnimations;
  }

  public async toDataURL(): Promise<string> {
    throw createError('toDataUrl(): Proimse<string> not implemented in concrete class!');
  }

  /**
   * Renames the id and fileName to newName.
   * @param newName - A new id and filename for the image.
   */
  public renameImage(newName: string): void {
    this.id = newName;

    if (this.fileName) {
      let fileExt = this.fileName.split('.').pop();

      if (!fileExt) {
        fileExt = '.png';
      }
      // Default to png if the file extension isn't available
      this.fileName = `${newName}.${fileExt}`;
    }
  }

  public async toArrayBuffer(): Promise<ArrayBuffer> {
    const blob = await (await this.toBlob()).arrayBuffer();

    return blob;
  }

  public async toBlob(): Promise<Blob> {
    if (!this._data && this._url) {
      this._data = await this._fromUrlToBlob(this._url);
    }

    if (!this._data) {
      throw new Error('Invalid data');
    }

    if (this._isDataURL(this._data)) {
      const data = this._data as string;

      const [header, base64] = data.split(',');

      // If the data doesnt contain the encoding URL, return it
      if ((!header || !base64) && data.length) {
        return new Blob([data]);
      }

      if (!header || !base64) {
        throw new Error('Invalid data');
      }

      // eslint-disable-next-line require-unicode-regexp
      const type = header.replace('data:', '').replace(/;base64$/, '');

      return new Blob([base64], { type });
    }

    if (this._isArrayBuffer(this._data)) {
      return new Blob([this._data]);
    }

    if (this._isBlob(this._data)) {
      return this._data as Blob;
    }

    throw new Error('Invalid data');
  }

  protected async _fromUrlToBlob(url: string): Promise<Blob> {
    const response = await fetch(url);

    return response.blob();
  }

  protected _isArrayBuffer(data: ImageData): boolean {
    return data instanceof ArrayBuffer;
  }

  protected _isDataURL(data: ImageData): boolean {
    return typeof data === 'string' && data.startsWith('data:');
  }

  protected _isBlob(data: ImageData): boolean {
    return data instanceof Blob;
  }
}
