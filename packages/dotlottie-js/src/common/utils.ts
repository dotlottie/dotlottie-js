/**
 * Copyright 2023 Design Barn Inc.
 */

export const createError = (message: string): Error => {
  const error = new Error(`[dotlottie-js]: ${message}`);

  return error;
};

export const isValidURL = (url: string): boolean => {
  try {
    // eslint-disable-next-line no-new
    new URL(url);

    return true;
  } catch {
    return false;
  }
};

export interface MimeTypes {
  [key: string]: string;
}

export interface MimeCodes {
  [key: string]: number[];
}

export const MIME_TYPES: MimeTypes = {
  jpeg: 'image/jpeg',
  jpeg2: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  bmp: 'image/bmp',
  svg: 'image/svg+xml',
};

export const MIME_CODES: MimeCodes = {
  jpeg: [0xff, 0xd8, 0xff],
  jpeg2: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  png: [0x89, 0x50, 0x4e],
  gif: [0x47, 0x49, 0x46],
  bmp: [0x42, 0x4d],
  svg: [0x3c, 0x3f, 0x78],
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
};
