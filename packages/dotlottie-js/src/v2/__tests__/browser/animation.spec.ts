/**
 * Copyright 2023 Design Barn Inc.
 */

/* eslint-disable no-new */
/* eslint-disable @lottiefiles/import-filename-format */

import type { Animation as AnimationType } from '@lottie-animation-community/lottie-types';
import { Base64 } from 'js-base64';
import { describe, test, expect, vi } from 'vitest';

import BULL_DATA from '../../../__tests__/__fixtures__/image-asset-optimization/bull.json';
import animationData from '../../../__tests__/__fixtures__/simple/animation/animations/lottie1.json';
import { LottieAnimation } from '../../index.browser';

test('throws an error if it receives an invalid id when constructed', () => {
  expect(() => {
    new LottieAnimation({ id: '' });
  }).toThrow('Invalid animation id');
});

test('throws an error if it receives an invalid url when constructed', () => {
  const invalidUrl = 'xyz';

  expect(() => {
    new LottieAnimation({ id: 'test', url: invalidUrl });
  }).toThrow('Invalid animation url');
});

test('throws an error if it receives an invalid lottie data when constructed', () => {
  const invalidData = {} as AnimationType;

  expect(() => {
    new LottieAnimation({ id: 'test', data: invalidData });
  }).toThrow('Received invalid Lottie data.');
});

test('throws an error if it receives an no data or url when constructed', () => {
  expect(() => {
    new LottieAnimation({ id: 'test' });
  }).toThrow('No data or url provided.');
});

test('gets and sets the zipOptions', () => {
  const animation = new LottieAnimation({
    id: 'test',
    data: animationData as unknown as AnimationType,
    zipOptions: {
      level: 9,
      mem: 1,
    },
  });

  expect(animation.zipOptions).toEqual({
    level: 9,
    mem: 1,
  });

  animation.zipOptions = {
    level: 1,
  };

  expect(animation.zipOptions).toEqual({
    level: 1,
  });
});

test('gets and sets the id', () => {
  const animation = new LottieAnimation({ id: 'test', data: animationData as unknown as AnimationType });

  expect(animation.id).toEqual('test');

  animation.id = 'test2';

  expect(animation.id).toEqual('test2');
});

test('gets and sets the data', () => {
  const animation = new LottieAnimation({ id: 'test', url: 'https://example.com' });

  expect(animation.data).toBeUndefined();

  animation.data = animationData as unknown as AnimationType;

  expect(animation.data).toEqual(animationData as unknown as AnimationType);
});

test('gets and sets the url', () => {
  const animation = new LottieAnimation({ id: 'test', data: animationData as unknown as AnimationType });

  expect(animation.url).toBeUndefined();

  animation.url = 'https://example.com';

  expect(animation.url).toEqual('https://example.com');
});

describe('toJSON', () => {
  test('returns the animation data as a JSON object', async () => {
    const animation = new LottieAnimation({ id: 'test', data: animationData as unknown as AnimationType });

    const jsonData = await animation.toJSON();

    expect(jsonData).toEqual(animationData as unknown as AnimationType);
  });

  test('returns the animation with inlined data as a JSON object', async () => {
    const animation = new LottieAnimation({
      id: 'test',
      data: structuredClone(BULL_DATA) as unknown as unknown as AnimationType,
    });

    const jsonData = await animation.toJSON({ inlineAssets: true });

    expect(jsonData).toEqual(BULL_DATA as unknown as unknown as AnimationType);
  });

  test('does not mutate original animation data when inlineAssets is true', async () => {
    const animation = new LottieAnimation({
      id: 'test',
      data: structuredClone(BULL_DATA) as unknown as unknown as AnimationType,
    });

    // Get the original data size
    const originalData = await animation.toJSON({ inlineAssets: false });
    const originalSize = JSON.stringify(originalData).length;

    // Call toJSON with inlineAssets
    const inlinedData = await animation.toJSON({ inlineAssets: true });

    // Check if original is still the same size after inlining
    const afterData = await animation.toJSON({ inlineAssets: false });
    const afterSize = JSON.stringify(afterData).length;

    // Original data should not be mutated
    expect(afterSize).toBe(originalSize);

    // Inlined and original should be different objects
    expect(inlinedData).not.toBe(originalData);
    expect(inlinedData).not.toBe(afterData);
  });

  test('returns different object references for different inlineAssets options', async () => {
    const animation = new LottieAnimation({
      id: 'test',
      data: structuredClone(BULL_DATA) as unknown as unknown as AnimationType,
    });

    const withoutInline1 = await animation.toJSON({ inlineAssets: false });
    const withInline = await animation.toJSON({ inlineAssets: true });
    const withoutInline2 = await animation.toJSON({ inlineAssets: false });

    // Each call should return a different object when inlineAssets is true
    expect(withInline).not.toBe(withoutInline1);
    expect(withInline).not.toBe(withoutInline2);

    // Verify sizes are consistent for same options
    const size1 = JSON.stringify(withoutInline1).length;
    const size2 = JSON.stringify(withoutInline2).length;
    
    expect(size1).toBe(size2);
  });

  test('multiple calls to toJSON with inlineAssets return independent clones', async () => {
    const animation = new LottieAnimation({
      id: 'test',
      data: structuredClone(BULL_DATA) as unknown as unknown as AnimationType,
    });

    const clone1 = await animation.toJSON({ inlineAssets: true });
    const clone2 = await animation.toJSON({ inlineAssets: true });

    // Should be different objects
    expect(clone1).not.toBe(clone2);

    // Should have the same content
    expect(JSON.stringify(clone1)).toEqual(JSON.stringify(clone2));

    // Modifying one should not affect the other
    if (clone1.assets && clone1.assets[0]) {
      // @ts-expect-error - Modifying for test purposes
      clone1.assets[0].testProp = 'modified';
    }

    if (clone2.assets && clone2.assets[0]) {
      // @ts-expect-error - Accessing test property
      expect(clone2.assets[0].testProp).toBeUndefined();
    }
  });

  test('resolves the animation data from the provided url and returns the animation data as a JSON object', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(new Response(JSON.stringify(animationData)));

    const animationURL = 'https://lottiefiles.fake/animation/test.json';

    const animation = new LottieAnimation({
      id: 'test',
      url: animationURL,
    });

    const jsonData = await animation.toJSON();

    expect(fetchSpy).toHaveBeenCalledWith(animationURL);

    expect(jsonData).toEqual(animationData as unknown as AnimationType);

    fetchSpy.mockRestore();
  });

  test('throws an error if the animation data cannot be resolved from the provided url', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(new Response('Invalid JSON', { status: 200 }));

    const animation = new LottieAnimation({
      id: 'test',
      url: 'https://lottie.host/invalid.json',
    });

    await expect(animation.toJSON()).rejects.toThrow(/invalid json returned from url/iu);

    fetchSpy.mockRestore();
  });
});

describe('toBase64', () => {
  test('returns the base64 of the animation', async () => {
    const animation = new LottieAnimation({ id: 'test', data: animationData as unknown as AnimationType });

    const dataUrl = await animation.toBase64();

    expect(dataUrl).toEqual(Base64.toBase64(JSON.stringify(animationData)));
  });

  test('resolves the animation data from the provided url and returns the animation data as a data url', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(new Response(JSON.stringify(animationData)));

    const animationURL = 'https://lottiefiles.fake/animation/test.json';

    const animation = new LottieAnimation({
      id: 'test',
      url: animationURL,
    });

    const dataUrl = await animation.toBase64();

    expect(fetchSpy).toHaveBeenCalledWith(animationURL);

    expect(dataUrl).toEqual(Base64.toBase64(JSON.stringify(animationData)));

    fetchSpy.mockRestore();
  });

  test('throws an error if the animation data cannot be resolved from the provided url', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(new Response('Invalid JSON', { status: 200 }));

    const animation = new LottieAnimation({
      id: 'test',
      url: 'https://lottie.host/invalid.json',
    });

    await expect(animation.toBase64()).rejects.toThrow(/invalid json returned from url/iu);

    fetchSpy.mockRestore();
  });
});

describe('toBlob', () => {
  test('returns the animation data as a blob', async () => {
    const animation = new LottieAnimation({ id: 'test', data: animationData as unknown as AnimationType });

    const blob = await animation.toBlob();

    expect(blob).toBeInstanceOf(Blob);

    const blobText = await blob.text();

    expect(blobText).toEqual(JSON.stringify(animationData));
  });

  test('resolves the animation data from the provided url and returns the animation data as a blob', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(new Response(JSON.stringify(animationData)));

    const animationURL = 'https://lottiefiles.fake/animation/test.json';

    const animation = new LottieAnimation({
      id: 'test',
      url: animationURL,
    });

    const blob = await animation.toBlob();

    expect(blob).toBeInstanceOf(Blob);

    expect(fetchSpy).toHaveBeenCalledWith(animationURL);

    const blobText = await blob.text();

    expect(blobText).toEqual(JSON.stringify(animationData));

    fetchSpy.mockRestore();
  });

  test('throws an error if the animation data cannot be resolved from the provided url', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(new Response('Invalid JSON', { status: 200 }));

    const animation = new LottieAnimation({
      id: 'test',
      url: 'https://lottie.host/e2dbfe51-c278-465e-a770-0a089bbdb050/invalid.json',
    });

    await expect(animation.toBlob()).rejects.toThrow(/invalid json returned from url/iu);

    fetchSpy.mockRestore();
  });
});

describe('toArrayBuffer', () => {
  test('returns the animation data as an array buffer', async () => {
    const animation = new LottieAnimation({ id: 'test', data: animationData as unknown as AnimationType });

    const arrayBuffer = await animation.toArrayBuffer();

    expect(arrayBuffer).toBeInstanceOf(ArrayBuffer);

    const arrayBufferText = new TextDecoder('utf-8').decode(arrayBuffer);

    expect(arrayBufferText).toEqual(JSON.stringify(animationData));
  });

  test('resolves the animation data from the provided url and returns the animation data as an array buffer', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(new Response(JSON.stringify(animationData)));

    const animationURL = 'https://lottiefiles.fake/animation/test.json';

    const animation = new LottieAnimation({
      id: 'test',
      url: animationURL,
    });

    const arrayBuffer = await animation.toArrayBuffer();

    expect(arrayBuffer).toBeInstanceOf(ArrayBuffer);

    expect(fetchSpy).toHaveBeenCalledWith(animationURL);

    const arrayBufferText = new TextDecoder('utf-8').decode(arrayBuffer);

    expect(arrayBufferText).toEqual(JSON.stringify(animationData));

    fetchSpy.mockRestore();
  });

  test('throws an error if the animation data cannot be resolved from the provided url', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(new Response('Invalid JSON', { status: 200 }));

    const animation = new LottieAnimation({
      id: 'test',
      url: 'https://lottie.host/invalid.json',
    });

    await expect(animation.toArrayBuffer()).rejects.toThrow(/invalid json returned from url/iu);

    fetchSpy.mockRestore();
  });
});
