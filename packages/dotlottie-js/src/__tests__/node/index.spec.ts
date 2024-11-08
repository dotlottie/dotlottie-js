/**
 * Copyright 2024 Design Barn Inc.
 */

/* eslint-disable @typescript-eslint/naming-convention */

import type { Animation } from '@lottie-animation-community/lottie-types';
import { strFromU8, unzipSync } from 'fflate';
import { expect, test, describe } from 'vitest';

import { PACKAGE_NAME } from '../../constants';
import { makeDotLottie } from '../../index.node';
import { DotLottieV1, toDotLottieV1 } from '../../v1/node';
import { DotLottie, toDotLottieV2 } from '../../v2/node';
import bull from '../__fixtures__/bull.json';

const bullAnimationData = bull as Animation;

describe('makeDotLottie', () => {
  test('make dotLottie v1', () => {
    const dotLottie = makeDotLottie('v1');

    expect(dotLottie.version).toBe('1');

    expect(dotLottie).toBeInstanceOf(DotLottieV1);
  });

  test('make dotLottie v2', () => {
    const dotLottie = makeDotLottie('v2');

    expect(dotLottie.version).toBe('2');

    expect(dotLottie).toBeInstanceOf(DotLottie);
  });
});

describe('toDotLottieV2', () => {
  test('convert dotLottie version 1 to version 2 format', async () => {
    const dotLottie = new DotLottieV1();

    dotLottie.addAnimation({ data: structuredClone(bullAnimationData), id: 'bull' });
    await dotLottie.build();

    const expectedManifest = {
      animations: [{ id: 'bull' }],
      author: PACKAGE_NAME,
      generator: PACKAGE_NAME,
      version: '1',
    };

    expect(dotLottie.manifest).toEqual(expectedManifest);

    const dotLottieFile = await dotLottie.toArrayBuffer();
    const unzipped = unzipSync(new Uint8Array(dotLottieFile));
    const filenames = Object.keys(unzipped);

    expect(filenames).toEqual([
      'manifest.json',
      'animations/bull.json',
      'images/image_0.png',
      'images/image_1.png',
      'images/image_2.png',
      'images/image_3.png',
      'images/image_4.png',
    ]);

    const dotLottieV2 = await toDotLottieV2(dotLottieFile);

    expect(dotLottieV2.manifest).toEqual({
      version: '2',
      generator: PACKAGE_NAME,
      animations: [{ id: 'bull' }],
    });

    const dotLottieV2File = await dotLottieV2.toArrayBuffer();
    const unzippedV2 = unzipSync(new Uint8Array(dotLottieV2File));
    const filenamesV2 = Object.keys(unzippedV2);

    expect(filenamesV2).toEqual([
      'manifest.json',
      'a/bull.json',
      'i/image_0.png',
      'i/image_1.png',
      'i/image_2.png',
      'i/image_3.png',
      'i/image_4.png',
    ]);

    const assetMapping: Record<string, string> = {
      'animations/bull.json': 'a/bull.json',
      'images/image_0.png': 'i/image_0.png',
      'images/image_1.png': 'i/image_1.png',
      'images/image_2.png': 'i/image_2.png',
      'images/image_3.png': 'i/image_3.png',
      'images/image_4.png': 'i/image_4.png',
    };

    for (const [v1Path, v2Path] of Object.entries(assetMapping)) {
      if (v1Path.endsWith('.json')) {
        const v1Content = unzipped[v1Path] ? JSON.parse(strFromU8(unzipped[v1Path] as Uint8Array)) : {};
        const v2Content = unzippedV2[v2Path] ? JSON.parse(strFromU8(unzippedV2[v2Path] as Uint8Array)) : {};

        delete v1Content.assets;
        delete v2Content.assets;
        expect(v1Content).toEqual(v2Content);
      } else {
        const v1Content = unzipped[v1Path] ? strFromU8(unzipped[v1Path] as Uint8Array) : '';
        const v2Content = unzippedV2[v2Path] ? strFromU8(unzippedV2[v2Path] as Uint8Array) : '';

        expect(v1Content).toMatch(v2Content);
      }
    }
  });
});

describe('toDotLottieV1', () => {
  test('convert dotLottie version 2 to version 1 format', async () => {
    const dotLottie = new DotLottie();

    dotLottie.addAnimation({ data: structuredClone(bullAnimationData), id: 'bull' });
    await dotLottie.build();

    const dotLottieFile = await dotLottie.toArrayBuffer();
    const unzipped = unzipSync(new Uint8Array(dotLottieFile));
    const filenames = Object.keys(unzipped);

    expect(filenames).toEqual([
      'manifest.json',
      'a/bull.json',
      'i/image_0.png',
      'i/image_1.png',
      'i/image_2.png',
      'i/image_3.png',
      'i/image_4.png',
    ]);

    const dotLottieV1 = await toDotLottieV1(dotLottieFile);

    expect(dotLottieV1.manifest).toEqual({
      animations: [{ id: 'bull' }],
      version: '1',
      author: PACKAGE_NAME,
      generator: PACKAGE_NAME,
    });

    const dotLottieV1File = await dotLottieV1.toArrayBuffer();
    const unzippedV1 = unzipSync(new Uint8Array(dotLottieV1File));
    const filenamesV1 = Object.keys(unzippedV1);

    expect(filenamesV1).toEqual([
      'manifest.json',
      'animations/bull.json',
      'images/image_0.png',
      'images/image_1.png',
      'images/image_2.png',
      'images/image_3.png',
      'images/image_4.png',
    ]);

    const assetMapping = {
      'a/bull.json': 'animations/bull.json',
      'i/image_0.png': 'images/image_0.png',
      'i/image_1.png': 'images/image_1.png',
      'i/image_2.png': 'images/image_2.png',
      'i/image_3.png': 'images/image_3.png',
      'i/image_4.png': 'images/image_4.png',
    };

    for (const [v2Path, v1Path] of Object.entries(assetMapping)) {
      if (v2Path.endsWith('.json')) {
        const v2Content = unzipped[v2Path] ? JSON.parse(strFromU8(unzipped[v2Path] as Uint8Array)) : {};
        const v1Content = unzippedV1[v1Path] ? JSON.parse(strFromU8(unzippedV1[v1Path] as Uint8Array)) : {};

        delete v2Content.assets;
        delete v1Content.assets;
        expect(v2Content).toEqual(v1Content);
      } else {
        const v2Content = unzipped[v2Path] ? strFromU8(unzipped[v2Path] as Uint8Array) : '';
        const v1Content = unzippedV1[v1Path] ? strFromU8(unzippedV1[v1Path] as Uint8Array) : '';

        expect(v2Content).toEqual(v1Content);
      }
    }
  });
});

describe('DotLottie v2', () => {
  test('loads from a v1 dotLottie', async () => {
    const dotLottieV1 = new DotLottieV1();

    dotLottieV1.addAnimation({ data: structuredClone(bullAnimationData), id: 'bull' });
    await dotLottieV1.build();

    const dotLottieV1File = await dotLottieV1.toArrayBuffer();

    const dotLottieV2 = await new DotLottie().fromArrayBuffer(dotLottieV1File);

    expect(dotLottieV2.manifest).toEqual({
      version: '2',
      generator: PACKAGE_NAME,
      animations: [{ id: 'bull' }],
    });
  });
});

describe('DotLottie v1', () => {
  test('loads from a v2 dotLottie', async () => {
    const dotLottieV2 = new DotLottie();

    dotLottieV2.addAnimation({ data: structuredClone(bullAnimationData), id: 'bull' });
    await dotLottieV2.build();

    const dotLottieV2File = await dotLottieV2.toArrayBuffer();

    const dotLottieV1 = await new DotLottieV1().fromArrayBuffer(dotLottieV2File);

    expect(dotLottieV1.manifest).toEqual({
      version: '1',
      generator: PACKAGE_NAME,
      author: PACKAGE_NAME,
      animations: [{ id: 'bull' }],
    });
  });
});
