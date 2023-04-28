/**
 * Copyright 2023 Design Barn Inc.
 */

import { MIME_TO_EXTENSION, MIME_CODES, MIME_TYPES } from './common';

export const base64ToUint8Array = (base64String: string): Uint8Array => {
  // Decode the base64 string into a binary string
  const withoutMeta = base64String.substring(base64String.indexOf(',') + 1);

  const binaryString = atob(withoutMeta);

  // Create an Uint8Array from the binary string
  const uint8Array = Uint8Array.from(binaryString, (char): number => char.charCodeAt(0));

  return uint8Array;
};

export const getMimeTypeFromBase64 = (base64: string): string | null | undefined => {
  let data: string | null = null;
  let bytes: number[] = [];

  if (!base64) return null;

  const withoutMeta = base64.substring(base64.indexOf(',') + 1);

  data = atob(withoutMeta);
  const bufData = new Uint8Array(data.length);

  for (let i = 0; i < data.length; i += 1) {
    bufData[i] = data.charCodeAt(i);
  }

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
