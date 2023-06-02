/**
 * Copyright 2023 Design Barn Inc.
 */

/* eslint-disable @lottiefiles/import-filename-format */
/* eslint-disable no-new */

import type { Animation as AnimationType } from '@lottiefiles/lottie-types';
import { Base64 } from 'js-base64';

import { LottieAnimation, LottieTheme } from '../node';

import BULL_DATA from './__fixtures__/image-asset-optimization/bull.json';
import animationData from './__fixtures__/simple/animation/animations/lottie1.json';

describe('LottieAnimation', () => {
  it('throws an error if it receives an invalid id when constructed', () => {
    expect(() => {
      new LottieAnimation({ id: '' });
    }).toThrowError('[dotlottie-js]: Invalid animation id');
  });

  it('throws an error if it receives an invalid url when constructed', () => {
    const invalidUrl = 'xyz';

    expect(() => {
      new LottieAnimation({ id: 'test', url: invalidUrl });
    }).toThrowError('[dotlottie-js]: Invalid animation url');
  });

  it('throws an error if it receives an invalid lottie data when constructed', () => {
    const invalidData = {} as Animation;

    expect(() => {
      new LottieAnimation({ id: 'test', data: invalidData });
    }).toThrowError('[dotlottie-js]: Received invalid Lottie data.');
  });

  it('throws an error if it receives an no data or url when constructed', () => {
    expect(() => {
      new LottieAnimation({ id: 'test' });
    }).toThrowError('[dotlottie-js]: No data or url provided.');
  });

  it('gets and sets the id', () => {
    const animation = new LottieAnimation({ id: 'test', data: animationData as unknown as AnimationType });

    expect(animation.id).toEqual('test');

    animation.id = 'test2';

    expect(animation.id).toEqual('test2');
  });

  it('gets and sets the data', () => {
    const animation = new LottieAnimation({ id: 'test', url: 'https://example.com' });

    expect(animation.data).toBeUndefined();

    animation.data = animationData as unknown as AnimationType;

    expect(animation.data).toEqual(animationData as unknown as AnimationType);
  });

  it('gets and sets the url', () => {
    const animation = new LottieAnimation({ id: 'test', data: animationData as unknown as AnimationType });

    expect(animation.url).toBeUndefined();

    animation.url = 'https://example.com';

    expect(animation.url).toEqual('https://example.com');
  });

  it('gets and sets the default theme', () => {
    const animation = new LottieAnimation({ id: 'test', data: animationData as unknown as Animation });

    expect(animation.defaultTheme).toBeUndefined();

    animation.defaultTheme = 'theme1';

    expect(animation.defaultTheme).toEqual('theme1');
  });

  it('gets assigned themes', () => {
    const animation = new LottieAnimation({ id: 'test', data: animationData as unknown as Animation });

    expect(animation.themes).toEqual([]);

    const theme = new LottieTheme({ id: 'theme1', url: 'http://fake.lottiefiles.com/theme.lss' });

    animation.addTheme(theme);

    expect(animation.themes).toEqual([theme]);
  });

  describe('toJSON', () => {
    it('returns the animation data as a JSON object', async () => {
      const animation = new LottieAnimation({ id: 'test', data: animationData as unknown as AnimationType });

      const jsonData = await animation.toJSON();

      expect(jsonData).toEqual(animationData as unknown as AnimationType);
    });

    it('returns the animation with inlined data as a JSON object', async () => {
      const animation = new LottieAnimation({
        id: 'test',
        data: structuredClone(BULL_DATA) as unknown as unknown as Animation,
      });

      const jsonData = await animation.toJSON({ inlineAssets: true });

      expect(jsonData).toEqual(BULL_DATA as unknown as unknown as Animation);
    });

    it('resolves the animation data from the provided url and returns the animation data as a JSON object', async () => {
      const fetchSpy = spyOn(typeof window === 'undefined' ? global : window, 'fetch').and.returnValue(
        Promise.resolve(new Response(JSON.stringify(animationData))),
      );

      const animationURL = 'https://lottiefiles.fake/animation/test.json';

      const animation = new LottieAnimation({
        id: 'test',
        url: animationURL,
      });

      const jsonData = await animation.toJSON();

      expect(fetchSpy).toHaveBeenCalledWith(animationURL);

      expect(jsonData).toEqual(animationData as unknown as AnimationType);
    });

    it('throws an error if the animation data cannot be resolved from the provided url', async () => {
      const animation = new LottieAnimation({
        id: 'test',
        url: 'https://lottie.host/e2dbfe51-c278-465e-a770-0a089bbdb050/invalid.json',
      });

      await expectAsync(animation.toJSON()).toBeRejectedWithError(
        // eslint-disable-next-line optimize-regex/optimize-regex
        /\[dotlottie-js\]:\s.+:?\sInvalid json returned from url/u,
      );
    });
  });

  describe('toBase64', () => {
    it('returns the base64 of the animation', async () => {
      const animation = new LottieAnimation({ id: 'test', data: animationData as unknown as AnimationType });

      const dataUrl = await animation.toBase64();

      expect(dataUrl).toEqual(Base64.toBase64(JSON.stringify(animationData)));
    });

    it('resolves the animation data from the provided url and returns the animation data as a data url', async () => {
      const fetchSpy = spyOn(typeof window === 'undefined' ? global : window, 'fetch').and.returnValue(
        Promise.resolve(new Response(JSON.stringify(animationData))),
      );

      const animationURL = 'https://lottiefiles.fake/animation/test.json';

      const animation = new LottieAnimation({
        id: 'test',
        url: animationURL,
      });

      const dataUrl = await animation.toBase64();

      expect(fetchSpy).toHaveBeenCalledWith(animationURL);

      expect(dataUrl).toEqual(Base64.toBase64(JSON.stringify(animationData)));
    });

    it('throws an error if the animation data cannot be resolved from the provided url', async () => {
      const animation = new LottieAnimation({
        id: 'test',
        url: 'https://lottie.host/e2dbfe51-c278-465e-a770-0a089bbdb050/invalid.json',
      });

      await expectAsync(animation.toBase64()).toBeRejectedWithError(
        // eslint-disable-next-line optimize-regex/optimize-regex
        /\[dotlottie-js\]:\s.+:?\sInvalid json returned from url/u,
      );
    });
  });

  describe('toBlob', () => {
    it('returns the animation data as a blob', async () => {
      const animation = new LottieAnimation({ id: 'test', data: animationData as unknown as AnimationType });

      const blob = await animation.toBlob();

      expect(blob).toBeInstanceOf(Blob);

      const blobText = await blob.text();

      expect(blobText).toEqual(JSON.stringify(animationData));
    });

    it('resolves the animation data from the provided url and returns the animation data as a blob', async () => {
      const fetchSpy = spyOn(typeof window === 'undefined' ? global : window, 'fetch').and.returnValue(
        Promise.resolve(new Response(JSON.stringify(animationData))),
      );

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
    });

    it('throws an error if the animation data cannot be resolved from the provided url', async () => {
      const animation = new LottieAnimation({
        id: 'test',
        url: 'https://lottie.host/e2dbfe51-c278-465e-a770-0a089bbdb050/invalid.json',
      });

      await expectAsync(animation.toBlob()).toBeRejectedWithError(
        // eslint-disable-next-line optimize-regex/optimize-regex
        /\[dotlottie-js\]:\s.+:?\sInvalid json returned from url/u,
      );
    });
  });

  describe('toArrayBuffer', () => {
    it('returns the animation data as an array buffer', async () => {
      const animation = new LottieAnimation({ id: 'test', data: animationData as unknown as AnimationType });

      const arrayBuffer = await animation.toArrayBuffer();

      expect(arrayBuffer).toBeInstanceOf(ArrayBuffer);

      const arrayBufferText = new TextDecoder('utf-8').decode(arrayBuffer);

      expect(arrayBufferText).toEqual(JSON.stringify(animationData));
    });

    it('resolves the animation data from the provided url and returns the animation data as an array buffer', async () => {
      const fetchSpy = spyOn(typeof window === 'undefined' ? global : window, 'fetch').and.returnValue(
        Promise.resolve(new Response(JSON.stringify(animationData))),
      );

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
    });

    it('throws an error if the animation data cannot be resolved from the provided url', async () => {
      const animation = new LottieAnimation({
        id: 'test',
        url: 'https://lottie.host/e2dbfe51-c278-465e-a770-0a089bbdb050/invalid.json',
      });

      await expectAsync(animation.toArrayBuffer()).toBeRejectedWithError(
        // eslint-disable-next-line optimize-regex/optimize-regex
        /\[dotlottie-js\]:\s.+:?\sInvalid json returned from url/u,
      );
    });
  });
});
