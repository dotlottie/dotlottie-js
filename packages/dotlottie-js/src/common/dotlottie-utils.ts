/**
 * Copyright 2023 Design Barn Inc.
 */

/* eslint-disable guard-for-in */

import type { Animation as AnimationData, Asset } from '@lottiefiles/lottie-types';
import type { UnzipFileFilter, Unzipped } from 'fflate';
import { unzip, strFromU8 } from 'fflate';

import type { Manifest } from './manifest';
import { ManifestSchema } from './manifest';
import { isValidURL } from './utils';

/**
 * Create a data URL from Uint8Array.
 * @param byte - The Uint8Array byte.
 * @param mimetype - The mimetype of the data.
 * @returns The data URL string.
 */
export function dataUrlFromU8(byte: Uint8Array, mimetype: string): string {
  const base64 =
    typeof window === 'undefined' ? Buffer.from(byte).toString('base64') : window.btoa(new TextDecoder().decode(byte));

  return `data:${mimetype};base64,${base64}`;
}

/**
 * Check if an asset is an image asset.
 * @param asset - The asset to check.
 * @returns `true` if it's an image asset, `false` otherwise.
 */
export function isImageAsset(asset: Asset.Value): asset is Asset.Image {
  return 'w' in asset && 'h' in asset && !('xt' in asset) && 'p' in asset;
}

export class DotLottieUtils {
  private _dotLottie: Uint8Array | undefined;

  /**
   * Get the dotLottie data.
   * @returns The dotLottie data.
   */
  public get dotLottie(): Uint8Array | undefined {
    return this._dotLottie;
  }

  /**
   * Set the dotLottie data.
   * @param dotLottie - The dotLottie data to set.
   */
  public set dotLottie(dotLottie: Uint8Array | undefined) {
    this._dotLottie = dotLottie;
  }

  /**
   * Load .lottie file from URL.
   * @param src - The URL source.
   * @returns Promise that resolves with an instance of DotLottieUtils.
   */
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

    if (!(await instance.isValidDotLottie())) {
      throw new Error('Invalid dotLottie');
    }

    return instance;
  }

  /**
   * Load .lottie file from ArrayBuffer.
   * @param arrayBuffer - The ArrayBuffer.
   * @returns Promise that resolves with an instance of DotLottieUtils.
   */
  public static async loadFromArrayBuffer(arrayBuffer: ArrayBuffer): Promise<DotLottieUtils> {
    const instance = new DotLottieUtils();

    instance.dotLottie = new Uint8Array(arrayBuffer);

    const { error, success } = await instance.validateDotLottie();

    if (!success) {
      throw new Error(error);
    }

    return instance;
  }

  /**
   * Unzip the .lottie file.
   * @param filter - The filter function to apply to the files.
   * @returns Promise that resolves with the unzipped data.
   */
  public async unzip(filter: UnzipFileFilter = (): boolean => true): Promise<Unzipped> {
    const unzippedFile = await new Promise<Unzipped>((resolve, reject) => {
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

    return unzippedFile;
  }

  /**
   * Unzip a specific file from the .lottie file.
   * @param filepath - The filepath to unzip.
   * @returns Promise that resolves with the unzipped data.
   */
  private async _unzipFile(filepath: string): Promise<Uint8Array> {
    const unzipped = await this.unzip((file) => file.name === filepath);

    const data = unzipped[filepath];

    if (!(data instanceof Uint8Array)) {
      throw new Error(`${filepath} not found.`);
    }

    return data;
  }

  public async validateDotLottie(): Promise<{ error?: string; success: boolean }> {
    if (!this._dotLottie) {
      return { success: false, error: 'DotLottie not found' };
    }

    const manifest = this.getManifest();

    const manifestValidationResult = ManifestSchema.safeParse(manifest);

    if (!manifestValidationResult.success) {
      const error = manifestValidationResult.error.toString();

      return { success: false, error };
    }

    return { success: true };
  }

  /**
   * Get the manifest data from the .lottie file.
   * @returns Promise that resolves with the manifest data.
   */
  public async getManifest(): Promise<Manifest> {
    const manifestFileName = 'manifest.json';

    const unzippedManifest = await this._unzipFile(manifestFileName);

    return JSON.parse(strFromU8(unzippedManifest, false)) as Manifest;
  }

  /**
   * Get an image from the .lottie file.
   * @param filename - The filename of the image to get.
   * @returns Promise that resolves with the image data.
   */
  public async getImage(filename: string): Promise<string> {
    const imageFileName = `images/${filename}`;

    const unzippedImage = await this._unzipFile(imageFileName);

    return strFromU8(unzippedImage, false);
  }

  /**
   * Get all images from the .lottie file.
   * @param filter - The filter function to apply to the files.
   * @returns Promise that resolves with the images data.
   */
  public async getImages(filter: UnzipFileFilter = (): boolean => true): Promise<Record<string, string>> {
    const unzippedImages = await this.unzip((file) => file.name.startsWith('images/') && filter(file));

    const images: Record<string, string> = {};

    for (const imagePath in unzippedImages) {
      const data = unzippedImages[imagePath];

      if (data instanceof Uint8Array) {
        const imageId = imagePath.replace('images/', '');

        const imageExtension = imagePath.split('.').pop() || 'png';

        images[imageId] = dataUrlFromU8(data, `image/${imageExtension}`);
      }
    }

    return images;
  }

  /**
   * Get an animation from the .lottie file.
   * @param animationId - The animation ID to get.
   * @param inlineAssets - Options for inlining assets.
   * @returns Promise that resolves with the animation data.
   */
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

    await this.inlineImageAssets({ animationId: animationData });

    return animationData;
  }

  /**
   * Gets multiple animations from the .lottie file, optionally filtered by a provided function.
   * Allows for optionally inlining assets within the animations.
   *
   * @param filter - Optional filter function to apply when retrieving animations
   * @param options - An object containing an optional `inlineAssets` boolean. If true, assets are inlined within the animations
   * @returns A record containing the animations data, keyed by animation ID
   */
  public async getAnimations(
    filter: UnzipFileFilter = (): boolean => true,
    { inlineAssets }: { inlineAssets?: boolean } = {},
  ): Promise<Record<string, AnimationData>> {
    const animationsMap: Record<string, AnimationData> = {};

    const unzippedAnimations = await this.unzip((file) => file.name.startsWith('animations/') && filter(file));

    for (const animationPath in unzippedAnimations) {
      const data = unzippedAnimations[animationPath];

      if (data instanceof Uint8Array) {
        const animationId = animationPath.replace('animations/', '').replace('.json', '');

        const animationData = JSON.parse(strFromU8(data, false)) as AnimationData;

        animationsMap[animationId] = animationData;
      }
    }

    if (!inlineAssets) {
      return animationsMap;
    }

    await this.inlineImageAssets(animationsMap);

    return animationsMap;
  }

  /**
   * Gets a specific theme from the .lottie file by its ID
   * @param themeId - The ID of the theme to get
   * @returns The theme data as a string
   */
  public async getTheme(themeId: string): Promise<string> {
    const themeFilename = `themes/${themeId}.lss`;

    const unzippedTheme = await this._unzipFile(themeFilename);

    return strFromU8(unzippedTheme, false);
  }

  /**
   * Gets multiple themes from the .lottie file, optionally filtered by a provided function
   * @param filter - Optional filter function to apply when retrieving themes
   * @returns A record containing the theme data, keyed by theme ID
   */
  public async getThemes(filter: UnzipFileFilter = (): boolean => true): Promise<Record<string, string>> {
    const themesMap: Record<string, string> = {};

    const unzippedThemes = await this.unzip((file) => file.name.startsWith('themes/') && filter(file));

    for (const themePath in unzippedThemes) {
      const data = unzippedThemes[themePath];

      if (data instanceof Uint8Array) {
        const themeId = themePath.replace('themes/', '').replace('.lss', '');

        themesMap[themeId] = strFromU8(data, false);
      }
    }

    return themesMap;
  }

  public async inlineImageAssets(animations: Record<string, AnimationData>): Promise<void> {
    const imagesMap = new Map<string, Set<string>>();

    for (const [animationId, animationData] of Object.entries(animations)) {
      for (const asset of animationData.assets || []) {
        if (isImageAsset(asset)) {
          const imageId = asset.p;

          if (!imagesMap.has(imageId)) {
            imagesMap.set(imageId, new Set());
          }

          imagesMap.get(imageId)?.add(animationId);
        }
      }
    }

    const unzippedImages = await this.getImages((file) => imagesMap.has(file.name));

    for (const [imageId, animationIdsSet] of imagesMap) {
      const imageDataURL = unzippedImages[`images/${imageId}`];

      if (imageDataURL) {
        for (const animationId of animationIdsSet) {
          const animationData = animations[animationId];

          for (const asset of animationData?.assets || []) {
            if (isImageAsset(asset) && asset.p === imageId) {
              asset.p = imageDataURL;
              asset.u = '';
              asset.e = 1;
            }
          }
        }
      }
    }
  }
}
