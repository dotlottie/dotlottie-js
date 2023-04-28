/**
 * Copyright 2023 Design Barn Inc.
 */

import phash from 'sharp-phash';

import type { ImageOptions } from '../common';
import { LottieImageCommon, createError } from '../common';

export class LottieImage extends LottieImageCommon {
  public constructor(options: ImageOptions) {
    super(options);
  }

  private _phashDistance(targetPhash: string, startPhash: string): number {
    let count = 0;

    for (let i = 0; i < targetPhash.length; i += 1) {
      if (targetPhash[i] !== startPhash[i]) {
        count += 1;
      }
    }

    return count;
  }

  public override async distanceTo(imageToCompare: LottieImageCommon): Promise<number> {
    const targetPhash = imageToCompare.phash;

    if (!targetPhash || !this._phash) {
      throw createError(`LottieImage '${imageToCompare.id}' does not have a phash generated.`);
    }

    return this._phashDistance(targetPhash, this._phash);
  }

  public override async generatePhash(): Promise<string> {
    if (!this._data) {
      createError("Can't generate phash value.");
    }

    const nBuf = await this.toArrayBuffer();

    const decoder = new TextDecoder();

    let phashValue = null;

    phashValue = await phash(Buffer.from(decoder.decode(nBuf), 'base64'));

    this._phash = phashValue;

    return phashValue;
  }

  public override async toDataURL(): Promise<string> {
    if (this._data && this._isDataURL(this._data)) return this.data as string;

    const buffer = await this.toArrayBuffer();

    let ret = Buffer.from(buffer).toString();

    ret = `data:image/${this.fileName.split('.')[1] || 'jpeg'};base64,${ret}`;

    return ret;
  }
}
