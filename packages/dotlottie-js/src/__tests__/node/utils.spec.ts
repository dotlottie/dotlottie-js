/**
 * Copyright 2026 Design Barn Inc.
 */

import { describe, it, expect } from 'vitest';

import { uint8ArrayToBase64, base64ToUint8Array } from '../../utils';

// Reference encoder, independent of Buffer and btoa, so it holds in either runtime.
function referenceBase64(bytes: Uint8Array): string {
  // eslint-disable-next-line no-secrets/no-secrets -- this is the standard base64 alphabet, not a secret
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';

  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i] as number;
    const b1 = i + 1 < bytes.length ? (bytes[i + 1] as number) : 0;
    const b2 = i + 2 < bytes.length ? (bytes[i + 2] as number) : 0;

    out += alphabet[b0 >> 2];
    out += alphabet[((b0 & 3) << 4) | (b1 >> 4)];
    out += i + 1 < bytes.length ? alphabet[((b1 & 15) << 2) | (b2 >> 6)] : '=';
    out += i + 2 < bytes.length ? alphabet[b2 & 63] : '=';
  }

  return out;
}

describe('uint8ArrayToBase64', () => {
  // 0x8000 is the browser branch's chunk size; the sizes around it catch an off-by-one.
  it('matches a reference encoder across chunk boundaries', () => {
    for (const size of [0, 1, 2, 3, 0x8000 - 1, 0x8000, 0x8000 + 1, 1024 * 1024 + 7]) {
      const bytes = new Uint8Array(size);

      for (let i = 0; i < size; i += 1) {
        bytes[i] = (i * 31 + (i >> 8)) & 0xff;
      }

      const encoded = uint8ArrayToBase64(bytes);

      expect(encoded).toBe(referenceBase64(bytes));
      expect(base64ToUint8Array(encoded)).toEqual(bytes);
    }
  });

  it('accepts an ArrayBuffer as well as a Uint8Array', () => {
    const bytes = new Uint8Array([72, 101, 108, 108, 111]);

    expect(uint8ArrayToBase64(bytes.buffer)).toBe(uint8ArrayToBase64(bytes));
  });
});
