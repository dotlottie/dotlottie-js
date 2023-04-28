/**
 * Copyright 2023 Design Barn Inc.
 */

import { MIME_TO_EXTENSION, MIME_CODES, MIME_TYPES } from '../common';

export const base64ToUint8Array = (base64String: string): Uint8Array => {
  return new Uint8Array(Buffer.from(base64String.split(',')[1] || ' ', 'base64'));
};

export const getMimeTypeFromBase64 = (base64: string): string | null | undefined => {
  let bytes: number[] = [];

  if (!base64) return null;

  const withoutMeta = base64.substring(base64.indexOf(',') + 1);

  const bufData = Buffer.from(withoutMeta, 'base64');

  // to get the first 8 bytes
  bytes = Array.from(bufData.subarray(0, 8));

  // eslint-disable-next-line guard-for-in
  for (const mimeType in MIME_CODES) {
    const dataArr = MIME_CODES[mimeType];

    if (dataArr && bytes.every((byte, index) => byte === dataArr[index])) {
      return MIME_TYPES[mimeType];
    }
  }

  return null;
};

export const getExtensionTypeFromBase64 = (base64: string): string | null => {
  const mimeType = getMimeTypeFromBase64(base64);

  if (!mimeType) {
    const ext = base64.split(';')[0]?.split('/')[1];

    if (ext) {
      return MIME_TO_EXTENSION[ext] || 'png';
    }

    return 'png';
  }

  return MIME_TO_EXTENSION[mimeType] || 'png';
};
