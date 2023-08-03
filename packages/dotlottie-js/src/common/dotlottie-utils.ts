/**
 * Copyright 2023 Design Barn Inc.
 */

/* eslint-disable guard-for-in */

import type { Animation as AnimationData, Asset } from '@lottiefiles/lottie-types';
import type { UnzipFileFilter, Unzipped } from 'fflate';
import { unzip as fflateUnzip, strFromU8 } from 'fflate';

import { getExtensionTypeFromBase64 } from '../utils';

import type { Manifest } from './manifest';
import { ManifestSchema } from './manifest';
import { isValidURL } from './utils';

export enum ErrorCodes {
  ASSET_NOT_FOUND = 'ASSET_NOT_FOUND',
  INVALID_DOTLOTTIE = 'INVALID_DOTLOTTIE',
  INVALID_URL = 'INVALID_URL',
}

export class DotLottieError extends Error {
  public code: ErrorCodes;

  public constructor(message: string, code: ErrorCodes) {
    super(message);
    this.name = 'DotLottieError';
    this.code = code;
  }
}

/**
 * Create a data URL from Uint8Array or ArrayBuffer.
 * @param byte - The Uint8Array or ArrayBuffer byte.
 * @param mimeType - The mimeType of the data.
 * @returns The data URL string.
 */
export function dataUrlFromU8(uint8Data: Uint8Array): string {
  let base64: string;

  if (typeof window === 'undefined') {
    // Using Node.js Buffer for non-browser environments
    base64 = Buffer.from(uint8Data).toString('base64');
  } else {
    // Using window.btoa for browser environments
    const binaryString = Array.prototype.map.call(uint8Data, (byte: number) => String.fromCharCode(byte)).join('');

    base64 = window.btoa(binaryString);
  }

  const mimeType = `image/${getExtensionTypeFromBase64(base64)}`;

  return `data:${mimeType};base64,${base64}`;
}

/**
 * Check if an asset is an image asset.
 * @param asset - The asset to check.
 * @returns `true` if it's an image asset, `false` otherwise.
 */
export function isImageAsset(asset: Asset.Value): asset is Asset.Image {
  return 'w' in asset && 'h' in asset && !('xt' in asset) && 'p' in asset;
}

/**
 * Unzip the .lottie file.
 * @param dotLottie - The .lottie data as a Uint8Array.
 * @param filter - The filter function to apply to the files. Defaults to a function that always returns true.
 * @returns Promise that resolves with the unzipped data.
 * @throws Error if the .lottie data is not provided.
 */
export async function unzipDotLottie(
  dotLottie: Uint8Array | undefined,
  filter: UnzipFileFilter = (): boolean => true,
): Promise<Unzipped> {
  if (!(dotLottie instanceof Uint8Array)) {
    throw new DotLottieError('DotLottie not found', ErrorCodes.INVALID_DOTLOTTIE);
  }

  const unzipped = await new Promise<Unzipped>((resolve, reject) => {
    fflateUnzip(dotLottie, { filter }, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });

  return unzipped;
}

/**
 * Unzips a specific file from a `.lottie` archive.
 *
 * @remarks
 * This function accepts a `.lottie` file as a `Uint8Array`, a path string representing the
 * target file to extract, and an optional filter function to further refine the extraction.
 * It returns a `Promise` that resolves to the unzipped `Uint8Array` of the target file.
 *
 * @param dotLottie - The `.lottie` file content as a `Uint8Array`.
 * @param path - The path of the target file within the `.lottie` archive to extract.
 * @param filter - An optional filter function to apply on the unzipping process.
 *                 Accepts a file object and returns a boolean indicating whether the file should be included.
 * @returns A `Promise` that resolves to the `Uint8Array` of the unzipped target file.
 *
 * @throws {@link DotLottieError} if the input is not a valid `.lottie` file or if the target file is not found.
 *
 * @example
 * ```typescript
 * const dotLottie = new Uint8Array(...);
 * const targetPath = 'assets/image.png';
 * const unzippedFile = await unzipDotLottieFile(dotLottie, targetPath);
 * ```
 *
 * @public
 */
export async function unzipDotLottieFile(
  dotLottie: Uint8Array,
  path: string,
  filter?: UnzipFileFilter,
): Promise<Uint8Array> {
  if (!(dotLottie instanceof Uint8Array)) {
    throw new DotLottieError('DotLottie not found', ErrorCodes.INVALID_DOTLOTTIE);
  }

  const unzipped = await unzipDotLottie(dotLottie, (file) => file.name === path && (!filter || filter(file)));

  const unzippedFile = unzipped[path];

  if (!(unzippedFile instanceof Uint8Array)) {
    throw new DotLottieError(`File not found: ${path}`, ErrorCodes.ASSET_NOT_FOUND);
  }

  return unzippedFile;
}

/**
 * Get the manifest data from the .lottie file.
 * @param dotLottie - The dotLottie data.
 * @returns Promise that resolves with the manifest data.
 */
export async function getManifest(dotLottie: Uint8Array): Promise<Manifest> {
  const manifestFileName = 'manifest.json';

  const unzipped = await unzipDotLottie(dotLottie, (file) => file.name === manifestFileName);

  const unzippedManifest = unzipped[manifestFileName];

  if (!(unzippedManifest instanceof Uint8Array)) {
    throw new DotLottieError('Invalid .lottie file, manifest.json is missing', ErrorCodes.INVALID_DOTLOTTIE);
  }

  return JSON.parse(strFromU8(unzippedManifest, false)) as Manifest;
}

/**
 * Validates the provided dotLottie data.
 * @param dotLottie - The dotLottie data as Uint8Array.
 * @returns An object containing a success boolean and an optional error string.
 */
export async function validateDotLottie(dotLottie: Uint8Array): Promise<{ error?: string; success: boolean }> {
  if (!(dotLottie instanceof Uint8Array)) {
    return { success: false, error: 'DotLottie not found' };
  }

  const manifest = await getManifest(dotLottie);

  const manifestValidationResult = ManifestSchema.safeParse(manifest);

  if (!manifestValidationResult.success) {
    const error = `Invalid .lottie file, manifest.json structure is invalid, ${manifestValidationResult.error.toString()}`;

    return { success: false, error };
  }

  return { success: true };
}

/**
 * Load .lottie file from ArrayBuffer.
 * @param arrayBuffer - The ArrayBuffer.
 * @returns dotLottie data as Uint8Array.
 */
export async function loadFromArrayBuffer(arrayBuffer: ArrayBuffer): Promise<Uint8Array> {
  const dotLottie = new Uint8Array(arrayBuffer);

  const validationResult = await validateDotLottie(dotLottie);

  if (validationResult.error) {
    throw new DotLottieError(validationResult.error, ErrorCodes.INVALID_DOTLOTTIE);
  }

  return dotLottie;
}

/**
 * Load .lottie file from URL.
 * @param src - The URL source.
 * @returns Promise that resolves with the dotLottie data as Uint8Array.
 */
export async function loadFromURL(src: string): Promise<Uint8Array> {
  if (!isValidURL(src)) {
    throw new DotLottieError('Invalid url provided for .lottie file', ErrorCodes.INVALID_URL);
  }

  const response = await fetch(src);

  const arrayBuffer = await response.arrayBuffer();

  const contentType = response.headers.get('content-type');

  if (!contentType?.includes('application/zip')) {
    throw new DotLottieError(
      'Invalid content type provided for .lottie file, expected application/zip',
      ErrorCodes.INVALID_DOTLOTTIE,
    );
  }

  const dotLottie = await loadFromArrayBuffer(arrayBuffer);

  return dotLottie;
}

/**
 * Get an image from the .lottie file.
 * @param dotLottie - The Uint8Array of dotLottie data.
 * @param filename - The filename of the image to get.
 * @returns Promise that resolves with the image data.
 */
export async function getImage(dotLottie: Uint8Array, filename: string, filter?: UnzipFileFilter): Promise<string> {
  const imageFilename = `images/${filename}`;

  const unzipped = await unzipDotLottieFile(dotLottie, imageFilename, filter);

  return dataUrlFromU8(unzipped);
}

export async function getImages(dotLottie: Uint8Array, filter?: UnzipFileFilter): Promise<Record<string, string>> {
  const unzippedImages = await unzipDotLottie(
    dotLottie,
    (file) => file.name.startsWith('images/') && (!filter || filter(file)),
  );

  const images: Record<string, string> = {};

  for (const imagePath in unzippedImages) {
    const unzippedImage = unzippedImages[imagePath];

    if (unzippedImage instanceof Uint8Array) {
      const imageId = imagePath.replace('images/', '');

      images[imageId] = dataUrlFromU8(unzippedImage);
    }
  }

  return images;
}

/**
 * Inlines image assets for the given animations within a DotLottie object.
 * This function identifies the images used in the animations and replaces their references with the actual image data.
 *
 * @param dotLottie - The DotLottie object containing the animations.
 * @param animations - A record containing the animations to process.
 * @returns A Promise that resolves when the operation is complete, returning nothing.
 */
export async function inlineImageAssets(
  dotLottie: Uint8Array,
  animations: Record<string, AnimationData>,
): Promise<void> {
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

  const unzippedImages = await getImages(dotLottie, (file) => imagesMap.has(file.name));

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

/**
 * Get an animation from the .lottie file.
 * @param dotLottie - The Uint8Array of dotLottie data.
 * @param animationId - The animation ID to get.
 * @param options - An object containing an optional `inlineAssets` boolean.
 * @returns Promise that resolves with the animation data.
 */
export async function getAnimation(
  dotLottie: Uint8Array,
  animationId: string,
  { inlineAssets }: { inlineAssets?: boolean } = {},
): Promise<AnimationData> {
  const animationFilename = `animations/${animationId}.json`;

  const unzippedAnimation = await unzipDotLottieFile(dotLottie, animationFilename);

  const animationData = JSON.parse(strFromU8(unzippedAnimation, false)) as AnimationData;

  if (!inlineAssets) {
    return animationData;
  }

  const animationsMap = {
    animationId: animationData,
  };

  await inlineImageAssets(dotLottie, animationsMap);

  return animationData;
}

/**
 * Retrieves the animations from the given DotLottie object, with an optional filter and inlineAssets option.
 *
 * @param dotLottie - The DotLottie object containing the animations.
 * @param filter - An optional function to filter the files to be unzipped.
 * @param inlineAssets - An optional object that specifies whether or not to inline the assets.
 * @returns A Promise that resolves to a record containing the animation data mapped by their ID.
 */
export async function getAnimations(
  dotLottie: Uint8Array,
  { inlineAssets }: { inlineAssets?: boolean } = {},
  filter?: UnzipFileFilter,
): Promise<Record<string, AnimationData>> {
  const animationsMap: Record<string, AnimationData> = {};
  const unzippedAnimations = await unzipDotLottie(
    dotLottie,
    (file) => file.name.startsWith('animations/') && (!filter || filter(file)),
  );

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

  await inlineImageAssets(dotLottie, animationsMap);

  return animationsMap;
}

/**
 * Retrieves the themes from the given DotLottie object, with an optional filter.
 *
 * @param dotLottie - The DotLottie object containing the themes.
 * @param filter - An optional function to filter the files to be unzipped.
 * @returns A Promise that resolves to a record containing the themes mapped by their ID.
 */
export async function getThemes(dotLottie: Uint8Array, filter?: UnzipFileFilter): Promise<Record<string, string>> {
  const themesMap: Record<string, string> = {};

  const unzippedThemes = await unzipDotLottie(
    dotLottie,
    (file) => file.name.startsWith('themes/') && (!filter || filter(file)),
  );

  for (const themePath in unzippedThemes) {
    const data = unzippedThemes[themePath];

    if (data instanceof Uint8Array) {
      const themeId = themePath.replace('themes/', '').replace('.lss', '');

      themesMap[themeId] = strFromU8(data, false);
    }
  }

  return themesMap;
}

/**
 * Retrieves a specific theme by ID from the given DotLottie object, with an optional filter.
 *
 * @param dotLottie - The DotLottie object containing the theme.
 * @param themeId - The ID of the theme to retrieve.
 * @param filter - An optional function to filter the files to be unzipped.
 * @returns A Promise that resolves to the theme as a string.
 */
export async function getTheme(dotLottie: Uint8Array, themeId: string, filter?: UnzipFileFilter): Promise<string> {
  const themeFilename = `themes/${themeId}.lss`;

  const unzippedTheme = await unzipDotLottieFile(dotLottie, themeFilename, filter);

  return strFromU8(unzippedTheme, false);
}
