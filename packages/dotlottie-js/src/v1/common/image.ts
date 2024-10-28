/**
 * Copyright 2023 Design Barn Inc.
 */

import type { ZipOptions } from 'fflate';

import { dataUrlFromU8, DotLottieError } from '../../utils';

import type { LottieAnimationCommonV1 } from './animation';

export type ImageData = string | ArrayBuffer | Blob;

export interface ImageOptions {
  data?: ImageData;
  fileName: string;
  id: string;
  parentAnimations?: LottieAnimationCommonV1[];
  zipOptions?: ZipOptions;
}

export class LottieImageCommonV1 {
  protected _data?: ImageData;

  protected _id: string = '';

  protected _fileName: string = '';

  protected _parentAnimations: LottieAnimationCommonV1[];

  protected _zipOptions: ZipOptions;

  public constructor(options: ImageOptions) {
    this._requireValidId(options.id);
    this._requireValidFileName(options.fileName);

    this._zipOptions = options.zipOptions ?? {};

    if (options.data) {
      this._data = options.data;
    }

    if (options.id) {
      this._id = options.id;
    }

    if (options.fileName) {
      this._fileName = options.fileName;
    }

    this._parentAnimations = options.parentAnimations || [];
  }

  public get zipOptions(): ZipOptions {
    return this._zipOptions;
  }

  public set zipOptions(zipOptions: ZipOptions) {
    this._zipOptions = zipOptions;
  }

  /**
   * Ensure that the provided id is a valid string.
   * The id must be a non-empty string, otherwise an error will be thrown.
   * @param id - The id to validate.
   * @throws Error - if the id is not a valid string.
   */
  private _requireValidId(id: string | undefined): asserts id is string {
    if (!id) throw new DotLottieError('Invalid image id');
  }

  /**
   * Ensure that the provided fileName is a valid string.
   * The fileName must be a non-empty string, otherwise an error will be thrown.
   * @param fileName - The fileName to validate.
   * @throws Error - if the fileName is not a valid string.
   */
  private _requireValidFileName(fileName: string | undefined): asserts fileName is string {
    if (!fileName) throw new DotLottieError('Invalid image fileName');
  }

  public get fileName(): string {
    return this._fileName;
  }

  public set fileName(fileName: string) {
    this._requireValidFileName(fileName);

    this._fileName = fileName;
  }

  public get id(): string {
    return this._id;
  }

  public set id(id: string) {
    this._requireValidId(id);

    this._id = id;
  }

  public get data(): ImageData | undefined {
    return this._data;
  }

  public set data(data: ImageData | undefined) {
    if (!data) {
      throw new DotLottieError('Invalid data');
    }

    this._data = data;
  }

  public get parentAnimations(): LottieAnimationCommonV1[] {
    return this._parentAnimations;
  }

  public set parentAnimations(parentAnimations: LottieAnimationCommonV1[]) {
    this._parentAnimations = parentAnimations;
  }

  public async toDataURL(): Promise<string> {
    if (this._data && this._isDataURL(this._data)) return this.data as string;

    const arrayBuffer = await this.toArrayBuffer();

    return dataUrlFromU8(new Uint8Array(arrayBuffer));
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
    if (!this._data) {
      throw new DotLottieError('Invalid image data.');
    }

    if (this._isDataURL(this._data)) {
      const data = this._data as string;

      const [header, base64] = data.split(',');

      // If the data doesnt contain the encoding URL, return it
      if ((!header || !base64) && data.length) {
        return new Blob([data]);
      }

      if (!header || !base64) {
        throw new DotLottieError('Invalid image data.');
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

    throw new DotLottieError('Invalid image data.');
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
