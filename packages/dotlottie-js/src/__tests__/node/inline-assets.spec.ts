/**
 * Copyright 2026 Design Barn Inc.
 */

import { strToU8, zipSync } from 'fflate';
import { describe, it, expect } from 'vitest';

import { getAnimation, getAnimations, uint8ArrayToBase64 } from '../../utils';

// A 1x1 PNG. The data URI's MIME type is read from these bytes, not from the file name.
const PNG = Uint8Array.from(
  // eslint-disable-next-line no-secrets/no-secrets -- a base64 1x1 PNG, not a secret
  atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='),
  (char) => char.charCodeAt(0),
);

const PNG_DATA_URL = `data:image/png;base64,${uint8ArrayToBase64(PNG)}`;

function animation(id: string, assetPath: string, directory: string): Uint8Array {
  return strToU8(
    JSON.stringify({
      v: '5.7.0',
      fr: 30,
      ip: 0,
      op: 30,
      w: 64,
      h: 64,
      nm: id,
      layers: [{ ty: 2, refId: 'image_0', ind: 1, ip: 0, op: 30, st: 0 }],
      assets: [{ id: 'image_0', w: 1, h: 1, u: directory, p: assetPath, e: 0 }],
    }),
  );
}

function v1Archive(assetPath: string, directory: string): Uint8Array {
  const files: Record<string, Uint8Array> = {
    'manifest.json': strToU8(
      JSON.stringify({ version: '1.0', generator: 'test', author: 'test', animations: [{ id: 'spin' }] }),
    ),
  };

  files['animations/spin.json'] = animation('spin', assetPath, directory);
  files['images/img_0.png'] = PNG;

  return zipSync(files);
}

function v2Archive(assetPath: string, directory: string): Uint8Array {
  const files: Record<string, Uint8Array> = {
    'manifest.json': strToU8(
      JSON.stringify({ version: '2', generator: 'test', animations: [{ id: 'spin' }], initial: { animation: 'spin' } }),
    ),
  };

  files['a/spin.json'] = animation('spin', assetPath, directory);
  files['i/img_0.png'] = PNG;

  return zipSync(files);
}

const NAMES = [
  ['with its extension', 'img_0.png'],
  ['without its extension', 'img_0'],
] as const;

const DIRECTORIES = ['', 'images/', '/images/', 'i/', '/i/'] as const;

describe('getAnimation with inlineAssets, on both archive versions', () => {
  for (const [version, archive] of [
    ['v1', v1Archive],
    ['v2', v2Archive],
  ] as const) {
    for (const [what, assetPath] of NAMES) {
      for (const directory of DIRECTORIES) {
        it(`${version}: asset.p ${what}, asset.u ${JSON.stringify(directory)}`, async () => {
          const animationData = await getAnimation(archive(assetPath, directory), 'spin', { inlineAssets: true });

          expect(animationData).toBeDefined();
          expect(animationData?.assets).toEqual([{ id: 'image_0', w: 1, h: 1, u: '', p: PNG_DATA_URL, e: 1 }]);
        });
      }
    }

    it(`${version}: getAnimation finds the animation and getAnimations agrees`, async () => {
      const bytes = archive('img_0.png', '');

      expect((await getAnimation(bytes, 'spin'))?.nm).toBe('spin');
      expect(await getAnimation(bytes, 'missing')).toBeUndefined();
      expect(Object.keys(await getAnimations(bytes, { inlineAssets: true }))).toEqual(['spin']);
    });
  }

  it('leaves an image the archive does not hold as it was', async () => {
    const animationData = await getAnimation(v2Archive('other.png', 'i/'), 'spin', { inlineAssets: true });

    expect(animationData?.assets).toEqual([{ id: 'image_0', w: 1, h: 1, u: 'i/', p: 'other.png', e: 0 }]);
  });
});
