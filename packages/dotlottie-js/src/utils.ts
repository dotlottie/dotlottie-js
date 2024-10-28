/**
 * Copyright 2024 Design Barn Inc.
 */

/* eslint-disable guard-for-in */

import type { Animation as AnimationData, Asset } from '@lottie-animation-community/lottie-types';
import type { UnzipFileFilter, Unzipped } from 'fflate';
import { unzip as fflateUnzip, strFromU8 } from 'fflate';

import type { ManifestV1 } from './v1/common/schemas/manifest';
import type { LottieStateMachine } from './v2/browser';
import type { Manifest as ManifestV2 } from './v2/common/schemas';

export interface MimeTypes {
  [key: string]: string;
}

export interface MimeCodes {
  [key: string]: number[];
}

export const MIME_TYPES: MimeTypes = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  bmp: 'image/bmp',
  svg: 'image/svg+xml',
  svgxml: 'image/svg+xml',
  webp: 'image/webp',
  mp3: 'audio/mp3',
};

export const MIME_CODES: MimeCodes = {
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  gif: [0x47, 0x49, 0x46],
  bmp: [0x42, 0x4d],
  webp: [0x52, 0x49, 0x46, 0x46, 0x3f, 0x3f, 0x3f, 0x3f, 0x57, 0x45, 0x42, 0x50],
  // This covers <svg..
  svg: [0x3c, 0x73, 0x76, 0x67],
  // This covers <?xml..
  svgxml: [0x3c, 0x3f, 0x78, 0x6d, 0x6c],
  mp3: [0x49, 0x44, 0x33],
};

export interface MimeToExtension {
  [key: string]: string;
}

export const MIME_TO_EXTENSION: MimeToExtension = {
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/bmp': 'bmp',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
  'audio/mpeg': 'mpeg',
  'audio/mp3': 'mp3',
};

export enum ErrorCodes {
  ASSET_NOT_FOUND = 'ASSET_NOT_FOUND',
  INVALID_DOTLOTTIE = 'INVALID_DOTLOTTIE',
  INVALID_STATEMACHINE = 'INVALID_STATEMACHINE',
  INVALID_URL = 'INVALID_URL',
}

export class DotLottieError extends Error {
  public code: ErrorCodes | undefined;

  public constructor(message: string, code?: ErrorCodes) {
    super(message);
    this.name = '[dotLottie-js]';
    this.code = code;
  }
}

/**
 * Converts a base64 string into a Uint8Array.
 *
 * @remarks
 * This function accepts a base64 string and returns a Uint8Array containing the decoded bytes.
 *
 * @param base64String - The base64-encoded string to decode.
 * @returns A Uint8Array containing the decoded bytes.
 *
 * @example
 * ```typescript
 * const base64 = 'SGVsbG8gd29ybGQ=';
 * const array = base64ToUint8Array(base64);
 * ```
 *
 * @public
 */
export const base64ToUint8Array = (base64String: string): Uint8Array => {
  const withoutMeta = base64String.substring(base64String.indexOf(',') + 1);
  const binaryString =
    typeof window === 'undefined' ? Buffer.from(withoutMeta, 'base64').toString('binary') : atob(withoutMeta);

  const uint8Array = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i += 1) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }

  return uint8Array;
};

/**
 * Determines the MIME type from a base64-encoded string.
 *
 * @remarks
 * This function accepts a base64-encoded string and determines its MIME type by looking at the first few bytes.
 *
 * @param base64 - The base64-encoded string to analyze.
 * @returns The MIME type as a string, or null if the type cannot be determined.
 *
 * @example
 * ```typescript
 * const base64 = 'data:image/jpeg;base64,...';
 * const mimeType = getMimeTypeFromBase64(base64);
 * ```
 *
 * @public
 */
export const getMimeTypeFromBase64 = (base64: string): string | undefined => {
  let data: string | null = null;
  let bytes: number[] = [];

  if (!base64) {
    throw new DotLottieError(
      'Failed to determine the MIME type from the base64 asset string. Please check the input data. Supported asset types for dotLottie-js  are: jpeg, png, gif, bmp, svg, webp, mp3',
      ErrorCodes.INVALID_DOTLOTTIE,
    );
  }

  const withoutMeta = base64.substring(base64.indexOf(',') + 1);

  if (typeof window === 'undefined') {
    data = Buffer.from(withoutMeta, 'base64').toString('binary');
  } else {
    data = atob(withoutMeta);
  }

  const bufData = new Uint8Array(data.length);

  for (let i = 0; i < data.length; i += 1) {
    bufData[i] = data.charCodeAt(i);
  }

  for (const mimeType in MIME_CODES) {
    const dataArr = MIME_CODES[mimeType];

    if (mimeType === 'webp' && dataArr && bufData.length > dataArr.length) {
      const riffHeader = Array.from(bufData.subarray(0, 4));
      const webpFormatMarker = Array.from(bufData.subarray(8, 12));

      if (
        riffHeader.every((byte, index) => byte === dataArr[index]) &&
        webpFormatMarker.every((byte, index) => byte === dataArr[index + 8])
      ) {
        return MIME_TYPES[mimeType];
      }
    } else {
      bytes = Array.from(bufData.subarray(0, dataArr?.length));

      if (dataArr && bytes.every((byte, index) => byte === dataArr[index])) {
        return MIME_TYPES[mimeType];
      }
    }
  }

  throw new DotLottieError(
    'Failed to determine the MIME type from the base64 asset string. Please check the input data. Supported asset types for dotLottie-js  are: jpeg, png, gif, bmp, svg, webp, mp3',
    ErrorCodes.INVALID_DOTLOTTIE,
  );
};

/**
 * Determines the file extension from a base64-encoded string.
 *
 * @remarks
 * This function accepts a base64-encoded string and determines its file extension by examining the MIME type.
 *
 * @param base64 - The base64-encoded string to analyze.
 * @returns The file extension as a string, or 'png' if the extension cannot be determined.
 *
 * @example
 * ```typescript
 * const base64 = 'data:image/jpeg;base64,...';
 * const extension = getExtensionTypeFromBase64(base64);
 * ```
 *
 * @public
 */
export const getExtensionTypeFromBase64 = (base64: string): string | null => {
  const mimeType = getMimeTypeFromBase64(base64);

  if (!mimeType) {
    const ext = base64.split(';')[0]?.split('/')[1];

    if (ext) {
      return MIME_TO_EXTENSION[ext] || null;
    }

    return null;
  }

  return MIME_TO_EXTENSION[mimeType] || null;
};

/**
 * Validates a given URL string.
 *
 * @remarks
 * This function accepts a URL string and checks whether it's a valid URL according to the URL constructor.
 * It returns `true` if the URL is valid, `false` otherwise.
 *
 * @param url - The URL string to validate.
 * @returns `true` if the URL is valid, `false` otherwise.
 *
 * @example
 * ```typescript
 * const url = 'https://example.com';
 * const isValid = isValidURL(url); // true
 * ```
 *
 * @public
 */
export const isValidURL = (url: string): boolean => {
  try {
    // eslint-disable-next-line no-new
    new URL(url);

    return true;
  } catch {
    return false;
  }
};

/**
 * Creates a data URL from a Uint8Array.
 *
 * @remarks
 * This function accepts a Uint8Array and a file extension, then converts the Uint8Array into a base64 data URL string.
 * The mimeType is determined based on the provided file extension, or defaults to 'image/png' if the extension is not recognized.
 *
 * @param uint8Data - The Uint8Array containing the binary data.
 * @param fileExtension - The file extension used to determine the mimeType (e.g., 'png', 'jpeg').
 * @returns The data URL string.
 *
 * @example
 * ```typescript
 * const uint8Data = new Uint8Array(...);
 * const fileExtension = 'png';
 * const dataUrl = dataUrlFromU8(uint8Data, fileExtension);
 * ```
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

  const mimeType = getMimeTypeFromBase64(base64);

  return `data:${mimeType};base64,${base64}`;
}

/**
 * Checks if an asset is an image asset.
 *
 * @remarks
 * This function accepts an asset object and determines whether it represents an image asset.
 * It returns `true` if it's an image asset, `false` otherwise.
 *
 * @param asset - The asset object to check.
 * @returns `true` if it's an image asset, `false` otherwise.
 *
 * @example
 * ```typescript
 * const asset = { w: 100, h: 100, p: 'image.png' };
 * const isImage = isImageAsset(asset); // true
 * ```
 *
 * @public
 */
export function isImageAsset(asset: Asset.Value): asset is Asset.Image {
  return 'w' in asset && 'h' in asset && !('xt' in asset) && 'p' in asset;
}

/**
 * Checks if an asset is an audio asset.
 *
 * @remarks
 * This function accepts an asset object and determines whether it represents an audio asset.
 * It returns `true` if it's an audio asset, `false` otherwise.
 *
 * @param asset - The asset object to check.
 * @returns `true` if it's an audio asset, `false` otherwise.
 *
 * @example
 * ```typescript
 * const asset = { e: 0, u: 'music/', p: 'audio.mp3' };
 * const isAudio = isAudioAsset(asset); // true
 * ```
 *
 * @public
 */
export function isAudioAsset(asset: Asset.Value): asset is Asset.Image {
  return !('h' in asset) && !('w' in asset) && 'p' in asset && 'e' in asset && 'u' in asset && 'id' in asset;
}

/**
 * Unzips the .lottie file.
 *
 * @remarks
 * This function accepts a .lottie file as a Uint8Array and an optional filter function to refine the unzipping process.
 * It returns a Promise that resolves with the unzipped data.
 *
 * @param dotLottie - The .lottie data as a Uint8Array.
 * @param filter - The filter function to apply to the files. Defaults to a function that always returns true.
 * @returns A Promise that resolves with the unzipped data.
 * @throws {@link dotLottieError} if the .lottie data is not provided or is invalid.
 *
 * @example
 * ```typescript
 * const dotLottie = new Uint8Array(...);
 * const unzippedData = await unzipDotLottie(dotLottie);
 * ```
 *
 * @public
 */
export async function unzipDotLottie(
  dotLottie: Uint8Array | undefined,
  filter: UnzipFileFilter = (): boolean => true,
): Promise<Unzipped> {
  if (!(dotLottie instanceof Uint8Array)) {
    throw new DotLottieError('dotLottie not found', ErrorCodes.INVALID_DOTLOTTIE);
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
 * @throws {@link dotLottieError} if the input is not a valid `.lottie` file or if the target file is not found.
 *
 * @example
 * ```typescript
 * const dotLottie = new Uint8Array(...);
 * const targetPath = 'images/image.png';
 * const unzippedFile = await unzipDotLottieFile(dotLottie, targetPath);
 * ```
 *
 * @public
 */
export async function unzipDotLottieFile(
  dotLottie: Uint8Array,
  path: string,
  filter?: UnzipFileFilter,
): Promise<Uint8Array | undefined> {
  if (!(dotLottie instanceof Uint8Array)) {
    throw new DotLottieError('Invalid dotLottie', ErrorCodes.INVALID_DOTLOTTIE);
  }

  const unzipped = await unzipDotLottie(dotLottie, (file) => file.name === path && (!filter || filter(file)));

  return unzipped[path];
}

/**
 * Retrieves the manifest data from the given dotLottie object.
 *
 * @remarks
 * This function accepts a dotLottie object as a Uint8Array and extracts the manifest data from it.
 * The manifest contains metadata information about the .lottie file, such as the list of animations, themes, and image assets.
 * It returns a Promise that resolves to the manifest data or `undefined` if the manifest is not found.
 *
 * @param dotLottie - The Uint8Array of dotLottie data.
 * @returns A Promise that resolves with the manifest data or `undefined` if not found.
 *
 * @example
 * ```typescript
 * const dotLottie = new Uint8Array(...);
 * const manifestData = await getManifest(dotLottie);
 * ```
 *
 * @public
 */
export async function getManifest(dotLottie: Uint8Array): Promise<ManifestV1 | ManifestV2 | undefined> {
  const manifestFileName = 'manifest.json';

  const unzipped = await unzipDotLottie(dotLottie, (file) => file.name === manifestFileName);

  const unzippedManifest = unzipped[manifestFileName];

  if (typeof unzippedManifest === 'undefined') {
    return undefined;
  }

  return JSON.parse(strFromU8(unzippedManifest, false)) as ManifestV1 | ManifestV2;
}

export async function getDotLottieVersion(dotLottie: Uint8Array): Promise<string> {
  const manifest = await getManifest(dotLottie);

  return manifest?.version ?? '1.0.0';
}

/**
 * Validates the provided dotLottie data.
 *
 * @remarks
 * This function accepts a Uint8Array containing .lottie data and validates its structure and content.
 * It returns a Promise that resolves with an object containing a success boolean and an optional error string.
 *
 * @param dotLottie - The dotLottie data as a Uint8Array.
 * @returns A Promise that resolves with an object containing a success boolean and an optional error string.
 *
 * @example
 * ```typescript
 * const dotLottie = new Uint8Array(...);
 * const validationResult = await validatedotLottie(dotLottie);
 * ```
 *
 * @public
 */
export async function validateDotLottie(dotLottie: Uint8Array): Promise<{ error?: string; success: boolean }> {
  if (!(dotLottie instanceof Uint8Array)) {
    return { success: false, error: 'dotLottie not found' };
  }

  const manifest = await getManifest(dotLottie);

  if (typeof manifest === 'undefined') {
    return { success: false, error: 'manifest.json is missing' };
  }

  return { success: true };
}

/**
 * Loads a .lottie file from an ArrayBuffer.
 *
 * @remarks
 * This function takes an ArrayBuffer containing .lottie data and converts it into a Uint8Array.
 * It validates the data and returns a Promise that resolves with the dotLottie data as a Uint8Array.
 *
 * @param arrayBuffer - The ArrayBuffer containing .lottie data.
 * @returns A Promise that resolves with the dotLottie data as a Uint8Array.
 * @throws {@link dotLottieError} if the data is invalid.
 *
 * @example
 * ```typescript
 * const arrayBuffer = new ArrayBuffer(...);
 * const dotLottie = await loadFromArrayBuffer(arrayBuffer);
 * ```
 *
 * @public
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
 * Loads a .lottie file from a given URL.
 *
 * @remarks
 * This function takes a URL string as input and fetches the .lottie file from the provided URL.
 * It returns a Promise that resolves with the dotLottie data as a Uint8Array.
 *
 * @param src - The URL source of the .lottie file.
 * @returns A Promise that resolves with the dotLottie data as a Uint8Array.
 * @throws {@link dotLottieError} if the URL is invalid or if the content type is incorrect.
 *
 * @example
 * ```typescript
 * const url = 'https://example.com/animation.lottie';
 * const dotLottie = await loadFromURL(url);
 * ```
 *
 * @public
 */
export async function loadFromURL(src: string): Promise<Uint8Array> {
  if (!isValidURL(src)) {
    throw new DotLottieError('Invalid url provided for .lottie file', ErrorCodes.INVALID_URL);
  }

  const response = await fetch(src);

  const arrayBuffer = await response.arrayBuffer();

  const zipMagicHeader = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);

  const header = new Uint8Array(arrayBuffer.slice(0, 4));

  if (!header.every((value, index) => value === zipMagicHeader[index])) {
    throw new DotLottieError('Invalid .lottie file', ErrorCodes.INVALID_DOTLOTTIE);
  }

  const dotLottie = await loadFromArrayBuffer(arrayBuffer);

  return dotLottie;
}

/**
 * Retrieves an audio from the given dotLottie object by its filename.
 *
 * @remarks
 * This function accepts a dotLottie object as a Uint8Array, the filename of the audio to retrieve, and an optional filter function.
 * It returns a Promise that resolves to the audio data URL or `undefined` if not found.
 *
 * @param dotLottie - The Uint8Array of dotLottie data.
 * @param filename - The filename of the image to get.
 * @param filter - An optional filter function to apply on the unzipping process.
 * @returns A Promise that resolves with the audio data URL or `undefined` if not found.
 *
 * @example
 * ```typescript
 * const dotLottie = new Uint8Array(...);
 * const filename = 'alarm.mp3';
 * const imageData = await getAudio(dotLottie, filename);
 * ```
 *
 * @public
 */
export async function getAudio(
  dotLottie: Uint8Array,
  filename: string,
  filter?: UnzipFileFilter,
): Promise<string | undefined> {
  const version = await getDotLottieVersion(dotLottie);

  let audioPath = 'audio/';

  if (version === '2.0.0') {
    audioPath = 'u/';
  }

  const audioFilename = `${audioPath}${filename}`;

  const unzipped = await unzipDotLottieFile(dotLottie, audioFilename, filter);

  if (typeof unzipped === 'undefined') {
    return undefined;
  }

  return dataUrlFromU8(unzipped);
}

/**
 * Retrieves all audio files from the given dotLottie object.
 *
 * @remarks
 * This function accepts a dotLottie object as a Uint8Array and an optional filter function to further refine the extraction.
 * It returns a Promise that resolves to a record containing the audio data URLs mapped by their ID.
 *
 * @param dotLottie - The Uint8Array of dotLottie data.
 * @param filter - An optional filter function to apply on the unzipping process.
 * @returns A Promise that resolves to a record containing the audio data URLs mapped by their ID.
 *
 * @example
 * ```typescript
 * const dotLottie = new Uint8Array(...);
 * const allAudio = await getAllAudio(dotLottie);
 * ```
 *
 * @public
 */
export async function getAllAudio(dotLottie: Uint8Array, filter?: UnzipFileFilter): Promise<Record<string, string>> {
  const version = await getDotLottieVersion(dotLottie);

  let audioPath = 'audio/';

  if (version === '2.0.0') {
    audioPath = 'u/';
  }

  const unzippedAudio = await unzipDotLottie(dotLottie, (file) => {
    const name = file.name.replace(audioPath, '');

    return file.name.startsWith(audioPath) && (!filter || filter({ ...file, name }));
  });

  const audio: Record<string, string> = {};

  for (const audioFilename in unzippedAudio) {
    const unzippedSingleAudio = unzippedAudio[audioFilename];

    if (unzippedSingleAudio instanceof Uint8Array) {
      const audioId = audioFilename.replace(audioPath, '');

      audio[audioId] = dataUrlFromU8(unzippedSingleAudio);
    }
  }

  return audio;
}

/**
 * Inlines audio assets for the given animations within a dotLottie object.
 *
 * @remarks
 * This function accepts a dotLottie object as a Uint8Array and a record containing the animations to process.
 * It identifies the audio used in the animations and replaces their references with the actual audio data.
 * This operation is performed asynchronously, and the function returns a Promise that resolves when the operation is complete.
 *
 * @param dotLottie - The dotLottie object containing the animations.
 * @param animations - A record containing the animations to process.
 * @returns A Promise that resolves when the operation is complete, returning nothing.
 *
 * @example
 * ```typescript
 * const dotLottie = new Uint8Array(...);
 * const animations = { animation1: {...}, animation2: {...} };
 * await inlineAudioAssets(dotLottie, animations);
 * ```
 *
 * @public
 */
export async function inlineAudioAssets(
  dotLottie: Uint8Array,
  animations: Record<string, AnimationData>,
): Promise<void> {
  const audioMap = new Map<string, Set<string>>();

  for (const [animationId, animationData] of Object.entries(animations)) {
    for (const asset of animationData.assets || []) {
      if (isAudioAsset(asset)) {
        const audioId = asset.p;

        if (!audioMap.has(audioId)) {
          audioMap.set(audioId, new Set());
        }
        audioMap.get(audioId)?.add(animationId);
      }
    }
  }

  const unzippedAudio = await getAllAudio(dotLottie, (file) => audioMap.has(file.name));

  for (const [audioId, animationIdsSet] of audioMap) {
    const audioDataURL = unzippedAudio[audioId];

    if (audioDataURL) {
      for (const animationId of animationIdsSet) {
        const animationData = animations[animationId];

        for (const asset of animationData?.assets || []) {
          if (isAudioAsset(asset) && asset.p === audioId) {
            asset.p = audioDataURL;
            asset.u = '';
            asset.e = 1;
          }
        }
      }
    }
  }
}

/**
 * Retrieves an image from the given dotLottie object by its filename.
 *
 * @remarks
 * This function accepts a dotLottie object as a Uint8Array, the filename of the image to retrieve, and an optional filter function.
 * It returns a Promise that resolves to the image data URL or `undefined` if not found.
 *
 * @param dotLottie - The Uint8Array of dotLottie data.
 * @param filename - The filename of the image to get.
 * @param filter - An optional filter function to apply on the unzipping process.
 * @returns A Promise that resolves with the image data URL or `undefined` if not found.
 *
 * @example
 * ```typescript
 * const dotLottie = new Uint8Array(...);
 * const filename = 'image.png';
 * const imageData = await getImage(dotLottie, filename);
 * ```
 *
 * @public
 */
export async function getImage(
  dotLottie: Uint8Array,
  filename: string,
  filter?: UnzipFileFilter,
): Promise<string | undefined> {
  const version = await getDotLottieVersion(dotLottie);

  let imagesPath = 'images/';

  if (version === '2.0.0') {
    imagesPath = 'i/';
  }

  const imageFilename = `${imagesPath}${filename}`;

  const unzipped = await unzipDotLottieFile(dotLottie, imageFilename, filter);

  if (typeof unzipped === 'undefined') {
    return undefined;
  }

  return dataUrlFromU8(unzipped);
}

/**
 * Retrieves all images from the given dotLottie object.
 *
 * @remarks
 * This function accepts a dotLottie object as a Uint8Array and an optional filter function to further refine the extraction.
 * It returns a Promise that resolves to a record containing the image data URLs mapped by their ID.
 *
 * @param dotLottie - The Uint8Array of dotLottie data.
 * @param filter - An optional filter function to apply on the unzipping process.
 * @returns A Promise that resolves to a record containing the image data URLs mapped by their ID.
 *
 * @example
 * ```typescript
 * const dotLottie = new Uint8Array(...);
 * const images = await getImages(dotLottie);
 * ```
 *
 * @public
 */
export async function getImages(dotLottie: Uint8Array, filter?: UnzipFileFilter): Promise<Record<string, string>> {
  const version = await getDotLottieVersion(dotLottie);

  let imagesPath = 'images/';

  if (version === '2.0.0') {
    imagesPath = 'i/';
  }

  const unzippedImages = await unzipDotLottie(dotLottie, (file) => {
    const name = file.name.replace(imagesPath, '');

    return file.name.startsWith(imagesPath) && (!filter || filter({ ...file, name }));
  });

  const images: Record<string, string> = {};

  for (const imagePath in unzippedImages) {
    const unzippedImage = unzippedImages[imagePath];

    if (unzippedImage instanceof Uint8Array) {
      const imageId = imagePath.replace(imagePath, '');

      images[imageId] = dataUrlFromU8(unzippedImage);
    }
  }

  return images;
}

/**
 * Inlines image assets for the given animations within a dotLottie object.
 *
 * @remarks
 * This function accepts a dotLottie object as a Uint8Array and a record containing the animations to process.
 * It identifies the images used in the animations and replaces their references with the actual image data.
 * This operation is performed asynchronously, and the function returns a Promise that resolves when the operation is complete.
 *
 * @param dotLottie - The dotLottie object containing the animations.
 * @param animations - A record containing the animations to process.
 * @returns A Promise that resolves when the operation is complete, returning nothing.
 *
 * @example
 * ```typescript
 * const dotLottie = new Uint8Array(...);
 * const animations = { animation1: {...}, animation2: {...} };
 * await inlineImageAssets(dotLottie, animations);
 * ```
 *
 * @public
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
    const imageDataURL = unzippedImages[imageId];

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
 * Retrieves an animation from the given dotLottie object by its ID.
 *
 * @remarks
 * This function accepts a dotLottie object as a Uint8Array, the animation ID to retrieve, and an optional inlineAssets option.
 * It returns a Promise that resolves to the animation data or `undefined` if not found.
 *
 * @param dotLottie - The Uint8Array of dotLottie data.
 * @param animationId - The animation ID to get.
 * @param options - An object containing an optional `inlineAssets` boolean to control whether image assets should be inlined.
 * @param filter - An optional function to filter the files to be unzipped.
 * @returns A Promise that resolves with the animation data or `undefined` if not found.
 *
 * @example
 * ```typescript
 * const dotLottie = new Uint8Array(...);
 * const animationId = 'example';
 * const animationData = await getAnimation(dotLottie, animationId, { inlineAssets: true });
 * ```
 *
 * @public
 */
export async function getAnimation(
  dotLottie: Uint8Array,
  animationId: string,
  { inlineAssets }: { inlineAssets?: boolean } = {},
  filter?: UnzipFileFilter,
): Promise<AnimationData | undefined> {
  const animationFilename = `animations/${animationId}.json`;

  const unzippedAnimation = await unzipDotLottieFile(dotLottie, animationFilename, filter);

  if (typeof unzippedAnimation === 'undefined') {
    return undefined;
  }

  const animationData = JSON.parse(strFromU8(unzippedAnimation, false)) as AnimationData;

  if (!inlineAssets) {
    return animationData;
  }

  const animationsMap = {
    [animationId]: animationData,
  };

  await inlineImageAssets(dotLottie, animationsMap);

  await inlineAudioAssets(dotLottie, animationsMap);

  return animationData;
}

/**
 * Retrieves the animations from the given dotLottie object, with optional filtering and asset inlining.
 *
 * @remarks
 * This function accepts a dotLottie object as a Uint8Array, an optional inlineAssets option, and an optional filter function.
 * It returns a Promise that resolves to a record containing the animation data mapped by their ID.
 *
 * @param dotLottie - The Uint8Array of dotLottie data.
 * @param options - An object containing an optional `inlineAssets` boolean to control whether assets should be inlined.
 * @param filter - An optional function to filter the files to be unzipped.
 * @returns A Promise that resolves to a record containing the animation data mapped by their ID.
 *
 * @example
 * ```typescript
 * const dotLottie = new Uint8Array(...);
 * const animations = await getAnimations(dotLottie, { inlineAssets: true });
 * ```
 *
 * @public
 */
export async function getAnimations(
  dotLottie: Uint8Array,
  { inlineAssets }: { inlineAssets?: boolean } = {},
  filter?: UnzipFileFilter,
): Promise<Record<string, AnimationData>> {
  const animationsMap: Record<string, AnimationData> = {};

  const version = await getDotLottieVersion(dotLottie);

  let animationsPath = 'animations/';

  if (version === '2.0.0') {
    animationsPath = 'a/';
  }

  const unzippedAnimations = await unzipDotLottie(dotLottie, (file) => {
    const filename = file.name.replace(animationsPath, '').replace('.json', '');

    return file.name.startsWith(animationsPath) && (!filter || filter({ ...file, name: filename }));
  });

  for (const animationPath in unzippedAnimations) {
    const data = unzippedAnimations[animationPath];

    if (data instanceof Uint8Array) {
      const animationId = animationPath.replace(animationsPath, '').replace('.json', '');
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
 * Retrieves the themes from the given DotLottie object.
 *
 * @remarks
 * This function accepts a DotLottie object as a Uint8Array and an optional filter function to refine the extraction of themes.
 * It returns a Promise that resolves to a record containing the themes mapped by their ID.
 *
 * @param dotLottie - The DotLottie object containing the themes.
 * @param filter - An optional function to filter the files to be unzipped.
 * @returns A Promise that resolves to a record containing the themes mapped by their ID.
 *
 * @example
 * ```typescript
 * const dotLottie = new Uint8Array(...);
 * const themes = await getThemes(dotLottie);
 * ```
 */
export async function getThemes(
  dotLottie: Uint8Array,
  filter?: UnzipFileFilter,
): Promise<Record<string, Record<string, unknown>>> {
  const themesMap: Record<string, Record<string, unknown>> = {};

  const unzippedThemes = await unzipDotLottie(dotLottie, (file) => {
    const name = file.name.replace('t/', '').replace('.json', '');

    return file.name.startsWith('t/') && (!filter || filter({ ...file, name }));
  });

  for (const themePath in unzippedThemes) {
    const data = unzippedThemes[themePath];

    if (data instanceof Uint8Array) {
      const themeId = themePath.replace('t/', '').replace('.json', '');

      themesMap[themeId] = JSON.parse(strFromU8(data, false));
    }
  }

  return themesMap;
}

/**
 * Retrieves a specific theme by ID from the given DotLottie object.
 *
 * @remarks
 * This function accepts a DotLottie object as a Uint8Array, the theme ID to retrieve, and an optional filter function.
 * It returns a Promise that resolves to the theme as a string or `undefined` if not found.
 *
 * @param dotLottie - The DotLottie object containing the theme.
 * @param themeId - The ID of the theme to retrieve.
 * @param filter - An optional function to filter the files to be unzipped.
 * @returns A Promise that resolves to the theme as a string or `undefined` if not found.
 *
 * @example
 * ```typescript
 * const dotLottie = new Uint8Array(...);
 * const themeId = 'dark';
 * const theme = await getTheme(dotLottie, themeId);
 * ```
 */
export async function getTheme(
  dotLottie: Uint8Array,
  themeId: string,
  filter?: UnzipFileFilter,
): Promise<Record<string, unknown> | undefined> {
  const themeFilename = `t/${themeId}.json`;

  const unzippedTheme = await unzipDotLottieFile(dotLottie, themeFilename, filter);

  if (typeof unzippedTheme === 'undefined') {
    return undefined;
  }

  return JSON.parse(strFromU8(unzippedTheme, false));
}

/**
 * Retrieves the state machines from the given DotLottie object.
 *
 * @remarks
 * This function accepts a DotLottie object as a Uint8Array and an optional filter function to refine the extraction of state machines.
 * It returns a Promise that resolves to a record containing the state machines mapped by their ID.
 *
 * @param dotLottie - The DotLottie object containing the state machines.
 * @param filter - An optional function to filter the files to be unzipped.
 * @returns A Promise that resolves to a record containing the state machines mapped by their ID.
 *
 * @example
 * ```typescript
 * const dotLottie = new Uint8Array(...);
 * const machines = await getStateMachines(dotLottie);
 * ```
 */
export async function getStateMachines(
  dotLottie: Uint8Array,
  filter?: UnzipFileFilter,
): Promise<Record<string, string>> {
  const statesMap: Record<string, string> = {};

  const unzippedStates = await unzipDotLottie(dotLottie, (file) => {
    const name = file.name.replace('s/', '').replace('.json', '');

    return file.name.startsWith('s/') && (!filter || filter({ ...file, name }));
  });

  for (const statePath in unzippedStates) {
    const data = unzippedStates[statePath];

    if (data instanceof Uint8Array) {
      const themeId = statePath.replace('s/', '').replace('.json', '');

      statesMap[themeId] = strFromU8(data, false);
    }
  }

  return statesMap;
}

/**
 * Retrieves a specific state machine by ID from the given DotLottie object.
 *
 * @remarks
 * This function accepts a DotLottie object as a Uint8Array, the state ID to retrieve, and an optional filter function.
 * It returns a Promise that resolves to the state machine as a string or `undefined` if not found.
 *
 * @param dotLottie - The DotLottie object containing the theme.
 * @param stateMachineId - The ID of the state machine to retrieve.
 * @param filter - An optional function to filter the files to be unzipped.
 * @returns A Promise that resolves to the state machine as a string or `undefined` if not found.
 *
 * @example
 * ```typescript
 * const dotLottie = new Uint8Array(...);
 * const stateMachineId = 'walk';
 * const stateMachine = await getState(dotLottie, stateMachineId);
 * ```
 */
export async function getStateMachine(
  dotLottie: Uint8Array,
  stateMachineId: string,
  filter?: UnzipFileFilter,
): Promise<LottieStateMachine | undefined> {
  const stateMachineFilename = `s/${stateMachineId}.json`;

  const unzippedStateMachine = await unzipDotLottieFile(dotLottie, stateMachineFilename, filter);

  if (typeof unzippedStateMachine === 'undefined') {
    return undefined;
  }

  const stateMachine = JSON.parse(strFromU8(unzippedStateMachine, false)) as LottieStateMachine;

  return stateMachine;
}
