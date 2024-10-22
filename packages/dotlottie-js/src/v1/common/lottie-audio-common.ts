/**
 * Copyright 2023 Design Barn Inc.
 */

import type { ZipOptions } from 'fflate';

import type { LottieAnimationCommon } from './lottie-animation-common';
import { dataUrlFromU8, DotLottieError, ErrorCodes } from './utils';

export type AudioData = string | ArrayBuffer | Blob;

export interface AudioOptions {
  data?: AudioData;
  fileName: string;
  id: string;
  parentAnimations?: LottieAnimationCommon[];
  url?: string;
  zipOptions?: ZipOptions;
}

export class LottieAudioCommon {
  protected _data?: AudioData;

  protected _id: string = '';

  protected _url?: string;

  protected _fileName: string = '';

  protected _parentAnimations: LottieAnimationCommon[];

  protected _zipOptions: ZipOptions;

  public constructor(options: AudioOptions) {
    this._requireValidId(options.id);
    this._requireValidFileName(options.fileName);

    this._zipOptions = options.zipOptions ?? {};

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

  public get zipOptions(): ZipOptions {
    return this._zipOptions;
  }

  public set zipOptions(zipOptions: ZipOptions) {
    this._zipOptions = zipOptions;
  }

  public get fileName(): string {
    return this._fileName;
  }

  public set fileName(fileName: string) {
    if (!fileName) throw new DotLottieError('Invalid audio file name', ErrorCodes.ASSET_NOT_FOUND);
    this._fileName = fileName;
  }

  public get id(): string {
    return this._id;
  }

  public set id(id: string) {
    if (!id) throw new DotLottieError('Invalid audio id', ErrorCodes.ASSET_NOT_FOUND);
    this._id = id;
  }

  public get data(): AudioData | undefined {
    return this._data;
  }

  public set data(data: AudioData | undefined) {
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
   * Renames the id and fileName to newName.
   * @param newName - A new id and filename for the audio.
   */
  public renameAudio(newName: string): void {
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

  protected _isArrayBuffer(data: AudioData): boolean {
    return data instanceof ArrayBuffer;
  }

  protected _isDataURL(data: AudioData): boolean {
    return typeof data === 'string' && data.startsWith('data:');
  }

  protected _isBlob(data: AudioData): boolean {
    return data instanceof Blob;
  }

  /**
   * Ensure that the provided id is a valid string.
   * The id must be a non-empty string, otherwise an error will be thrown.
   * @param id - The id to validate.
   * @throws Error - if the id is not a valid string.
   */
  private _requireValidId(id: string | undefined): asserts id is string {
    if (!id) throw new DotLottieError('Invalid audio id');
  }

  /**
   * Ensure that the provided fileName is a valid string.
   * The fileName must be a non-empty string, otherwise an error will be thrown.
   * @param fileName - The fileName to validate.
   * @throws Error - if the fileName is not a valid string.
   */
  private _requireValidFileName(fileName: string | undefined): asserts fileName is string {
    if (!fileName) throw new DotLottieError('Invalid audio fileName');
  }
}
