/**
 * Copyright 2023 Design Barn Inc.
 */

/* eslint-disable no-warning-comments */

import type { Animation as AnimationData } from '@lottiefiles/lottie-types';
import type { UnzipFileFilter, Unzipped } from 'fflate';
import { unzip, strFromU8 } from 'fflate';

import type { Manifest } from './manifest';
import { isValidURL } from './utils';

function dataUrlFromU8(byte: Uint8Array, mimetype: string): string {
  if (typeof window === 'undefined') {
    const base64 = Buffer.from(byte).toString('base64');

    return `data:${mimetype};base64,${base64}`;
  } else {
    const textDecoder = new TextDecoder();
    const str = textDecoder.decode(byte);

    return `data:${mimetype};base64,${window.btoa(str)}`;
  }
}

export class DotLottieUtils {
  private _dotLottie: Uint8Array | undefined;

  private constructor() {
    //
  }

  public get dotLottie(): Uint8Array | undefined {
    return this._dotLottie;
  }

  public set dotLottie(dotLottie: Uint8Array | undefined) {
    this._dotLottie = dotLottie;
  }

  public static async loadFromURL(src: string): Promise<DotLottieUtils> {
    if (!isValidURL(src)) {
      throw new Error('Invalid URL provided');
    }

    const response = await fetch(src);

    const data = await response.arrayBuffer();

    const contentType = response.headers.get('content-type');

    if (!contentType?.includes('application/zip')) {
      throw new Error('Invalid animation data, only .lottie files are supported.');
    }

    const instance = new DotLottieUtils();

    instance.dotLottie = new Uint8Array(data);

    return instance;
  }

  public static async loadFromArrayBuffer(arrayBuffer: ArrayBuffer): Promise<DotLottieUtils> {
    const instance = new DotLottieUtils();

    instance.dotLottie = new Uint8Array(arrayBuffer);

    return instance;
  }

  public async unzip(filter: UnzipFileFilter = (): boolean => true): Promise<Unzipped> {
    const unzipped = await new Promise<Unzipped>((resolve, reject) => {
      if (typeof this._dotLottie === 'undefined') {
        reject(new Error('.lottie is not loaded.'));

        return;
      }

      unzip(this._dotLottie, { filter }, (err, data) => {
        if (err) {
          reject(err);
        }

        resolve(data);
      });
    });

    return unzipped;
  }

  private async _unzipFile(filepath: string): Promise<Uint8Array> {
    const unzipped = await this.unzip((file) => file.name === filepath);

    const data = unzipped[filepath];

    if (!(data instanceof Uint8Array)) {
      throw new Error(`${filepath} not found.`);
    }

    return data;
  }

  public async getManifest(): Promise<Manifest> {
    const manifestFileName = 'manifest.json';

    const unzippedManifest = await this._unzipFile(manifestFileName);

    return JSON.parse(strFromU8(unzippedManifest, false)) as Manifest;
  }

  public async getImage(filename: string): Promise<string> {
    const imageFileName = `images/${filename}`;

    const unzippedImage = await this._unzipFile(imageFileName);

    return strFromU8(unzippedImage, false);
  }

  public async getImages(filter: UnzipFileFilter = (): boolean => true): Promise<Record<string, string>> {
    const unzippedImages = await this.unzip((file) => file.name.startsWith('images/') && filter(file));

    const images: Record<string, string> = {};

    // eslint-disable-next-line guard-for-in
    for (const imagePath in unzippedImages) {
      const data = unzippedImages[imagePath];

      if (data instanceof Uint8Array) {
        const imageId = imagePath.replace('images/', '');

        images[imageId] = strFromU8(data, false);
      }
    }

    return images;
  }

  public async getAnimation(
    animationId: string,
    { inlineAssets }: { inlineAssets?: boolean } = {},
  ): Promise<AnimationData> {
    const animationFilename = `animations/${animationId}.json`;

    const unzippedAnimation = await this._unzipFile(animationFilename);

    const animationData = JSON.parse(strFromU8(unzippedAnimation, false)) as AnimationData;

    if (!inlineAssets) {
      return animationData;
    }

    const imagesFilenames: string[] = [];

    for (const asset of animationData.assets || []) {
      if ('w' in asset && 'h' in asset && !('xt' in asset) && 'p' in asset) {
        imagesFilenames.push(`images/${asset.p}`);
      }
    }

    const unzippedImageAssets = await this.unzip((file) => imagesFilenames.includes(file.name));

    for (const asset of animationData.assets || []) {
      if ('w' in asset && 'h' in asset && !('xt' in asset) && 'p' in asset) {
        const imageData = unzippedImageAssets[`images/${asset.p}`];

        if (imageData instanceof Uint8Array) {
          const imageExtension = asset.p.split('.').pop() || 'png';
          const imageDataURL = dataUrlFromU8(imageData, `image/${imageExtension}`);

          asset.p = imageDataURL;
          asset.u = '';
          asset.e = 1;
        }
      }
    }

    return animationData;
  }

  public async getAnimations(filter: UnzipFileFilter = (): boolean => true): Promise<Record<string, AnimationData>> {
    const animations: Record<string, AnimationData> = {};

    const unzippedAnimations = await this.unzip((file) => file.name.startsWith('animations/') && filter(file));

    // eslint-disable-next-line guard-for-in
    for (const animationPath in unzippedAnimations) {
      const data = unzippedAnimations[animationPath];

      if (data instanceof Uint8Array) {
        const animationId = animationPath.replace('animations/', '').replace('.json', '');

        animations[animationId] = JSON.parse(strFromU8(data, false)) as AnimationData;
      }
    }

    /* 
      TODO: inlining assets
      TODO: 
        - search for image assets
        - decompress image assets
        - inline decompressed image assets
    */

    return animations;
  }

  public async getTheme(themeId: string): Promise<string> {
    const themeFilename = `themes/${themeId}.lss`;

    const unzippedTheme = await this._unzipFile(themeFilename);

    return strFromU8(unzippedTheme, false);
  }

  public async getThemes(filter: UnzipFileFilter = (): boolean => true): Promise<Record<string, string>> {
    const themes: Record<string, string> = {};

    const unzippedThemes = await this.unzip((file) => file.name.startsWith('themes/') && filter(file));

    // eslint-disable-next-line guard-for-in
    for (const themePath in unzippedThemes) {
      const data = unzippedThemes[themePath];

      if (data instanceof Uint8Array) {
        const themeId = themePath.replace('themes/', '').replace('.lss', '');

        themes[themeId] = strFromU8(data, false);
      }
    }

    return themes;
  }
}
