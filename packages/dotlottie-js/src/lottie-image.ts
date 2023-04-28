/**
 * Copyright 2023 Design Barn Inc.
 */

import { DifferenceHashBuilder } from 'browser-image-hash';

import type { ImageOptions } from './common';
import { LottieImageCommon } from './common';

export class LottieImage extends LottieImageCommon {
  public constructor(options: ImageOptions) {
    super(options);
  }

  public override async distanceTo(imageToCompare: LottieImageCommon): Promise<number> {
    if (this._dhash && imageToCompare.dhash) {
      return this._dhash.getHammingDistance(imageToCompare.dhash);
    }

    return 0;
  }

  public override async generatePhash(): Promise<string> {
    const builder = new DifferenceHashBuilder();
    const targetURL = new URL(await this.toDataURL());

    const destHash = await builder.build(targetURL);

    this._dhash = destHash;

    return destHash.rawHash;
  }

  public override async toDataURL(): Promise<string> {
    if (this._data && this._isDataURL(this._data)) return this.data as string;

    const buffer = await this.toArrayBuffer();

    const textDecoder = new TextDecoder();

    let ret = JSON.stringify(textDecoder.decode(buffer));

    ret = `data:image/${this.fileName.split('.')[1] || 'jpeg'};base64,${ret}`;

    return window.btoa(JSON.stringify(ret));
  }
}
