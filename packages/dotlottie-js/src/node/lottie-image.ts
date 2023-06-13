/**
 * Copyright 2023 Design Barn Inc.
 */

import type { ImageOptions } from '../common';
import { LottieImageCommon } from '../common';

export type { ImageOptions };

export class LottieImage extends LottieImageCommon {
  public constructor(options: ImageOptions) {
    super(options);
  }

  public override async toDataURL(): Promise<string> {
    if (this._data && this._isDataURL(this._data)) return this.data as string;

    const buffer = await this.toArrayBuffer();

    let ret = Buffer.from(buffer).toString();

    ret = `data:image/${this.fileName.split('.')[1] || 'jpeg'};base64,${ret}`;

    return ret;
  }
}
