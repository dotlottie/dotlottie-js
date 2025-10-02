/**
 * Copyright 2025 Design Barn Inc.
 */

import type { ZipOptions } from 'fflate';

import type { FontData } from '../../types';
import { dataUrlFromU8, DotLottieError, getExtensionTypeFromBase64 } from '../../utils';

import type { LottieAnimationCommon } from './animation';

export interface FontOptions {
  data?: FontData;
  fileName: string;
  id: string;
  parentAnimations?: LottieAnimationCommon[];
  zipOptions?: ZipOptions;
}

export class LottieFontCommon {
  protected _data?: FontData;

  /**
   * Unique id for the LottieFontCommon object. This is never modified.
   */
  protected _id: string = '';

  protected _fileName: string = '';

  protected _parentAnimations: LottieAnimationCommon[];

  protected _zipOptions: ZipOptions;

  public constructor(options: FontOptions) {
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
    if (!id) throw new DotLottieError('Invalid font id');
  }

  /**
   * Ensure that the provided fileName is a valid string.
   * The fileName must be a non-empty string, otherwise an error will be thrown.
   * @param fileName - The fileName to validate.
   * @throws Error - if the fileName is not a valid string.
   */
  private _requireValidFileName(fileName: string | undefined): asserts fileName is string {
    if (!fileName) throw new DotLottieError('Invalid font fileName');
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

  public get data(): FontData | undefined {
    return this._data;
  }

  public set data(data: FontData | undefined) {
    if (!data) {
      throw new DotLottieError('Invalid data');
    }

    this._data = data;
  }

  public get parentAnimations(): LottieAnimationCommon[] {
    return this._parentAnimations;
  }

  public set parentAnimations(parentAnimations: LottieAnimationCommon[]) {
    this._parentAnimations = parentAnimations;
  }

  public async toDataURL(): Promise<string> {
    if (this._data && this._isDataURL(this._data)) return this.data as string;

    const arrayBuffer = await this.toArrayBuffer();

    return dataUrlFromU8(new Uint8Array(arrayBuffer));
  }

  /**
   * Renames the fileName to newFileName.
   * @param newFileName - A new filename for the font (without extension).
   */
  public async renameFont(newFileName: string): Promise<void> {
    const data = await this.toDataURL();

    const ext = await getExtensionTypeFromBase64(data);

    if (!ext) {
      throw new DotLottieError('File extension type could not be detected from font file.');
    }

    this.fileName = `${newFileName}.${ext}`;
  }

  public async toArrayBuffer(): Promise<ArrayBuffer> {
    const blob = await (await this.toBlob()).arrayBuffer();

    return blob;
  }

  public async toBlob(): Promise<Blob> {
    if (!this._data) {
      throw new DotLottieError('Invalid font data.');
    }

    if (this._isDataURL(this._data)) {
      const data = this._data as string;

      const [header, base64] = data.split(',');

      // If the data doesnt contain the encoding URL, return it
      if ((!header || !base64) && data.length) {
        return new Blob([data]);
      }

      if (!header || !base64) {
        throw new DotLottieError('Invalid font data.');
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

    throw new DotLottieError('Invalid font data.');
  }

  protected async _fromUrlToBlob(url: string): Promise<Blob> {
    const response = await fetch(url);

    return response.blob();
  }

  protected _isArrayBuffer(data: FontData): boolean {
    return data instanceof ArrayBuffer;
  }

  protected _isDataURL(data: FontData): boolean {
    return typeof data === 'string' && data.startsWith('data:');
  }

  protected _isBlob(data: FontData): boolean {
    return data instanceof Blob;
  }
}
