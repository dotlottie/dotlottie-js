/**
 * Copyright 2023 Design Barn Inc.
 */

/* eslint-disable @lottiefiles/import-filename-format */

import { zipSync, unzipSync } from 'fflate';

import type { AnimationData, Manifest } from '..';
import {
  DotLottieError,
  ErrorCodes,
  dataUrlFromU8,
  getAnimation,
  getAnimations,
  getImage,
  getImages,
  getManifest,
  getTheme,
  getThemes,
  loadFromURL,
} from '..';

import dotLottieAnimation from './__fixtures__/simple/animation.lottie';
import dotLottieLottie1 from './__fixtures__/simple/animation/animations/lottie1.json';
import dotLottieManifest from './__fixtures__/simple/animation/manifest.json';
import dotLottieTheme from './__fixtures__/simple/animation/themes/theme1.lss';
import dotLottieAnimationWithImages from './__fixtures__/simple/big-merged-dotlottie.lottie';

describe('loadFromUrl', () => {
  it('throws when url is not valid', async () => {
    await expectAsync(loadFromURL('')).toBeRejectedWith(
      new DotLottieError('Invalid url provided for .lottie file', ErrorCodes.INVALID_DOTLOTTIE),
    );
  });

  it('throws an error if invalid content-type is returned', async () => {
    spyOn(typeof window === 'undefined' ? global : window, 'fetch').and.returnValue(
      Promise.resolve(new Response(dotLottieAnimation, { headers: { 'content-type': 'text/html' } })),
    );

    const dotLottieURL = 'https://lottiefiles.fake/animation/animation.lottie';

    await expectAsync(loadFromURL(dotLottieURL)).toBeRejectedWith(
      new DotLottieError(
        'Invalid content type provided for .lottie file, expected application/zip',
        ErrorCodes.INVALID_DOTLOTTIE,
      ),
    );
  });

  it('loads a dotlottie from a url', async () => {
    const fetchSpy = spyOn(typeof window === 'undefined' ? global : window, 'fetch').and.returnValue(
      Promise.resolve(new Response(dotLottieAnimation, { headers: { 'content-type': 'application/zip' } })),
    );

    const dotLottieURL = 'https://lottiefiles.fake/animation/animation.lottie';

    const dotLottie = await loadFromURL(dotLottieURL);

    expect(dotLottie).toBeDefined();
    expect(dotLottie).toBeInstanceOf(Uint8Array);

    expect(fetchSpy).toHaveBeenCalledWith(dotLottieURL);
  });

  it('throws error if dotlottie with no manifest is loaded', async () => {
    const data: Record<string, Uint8Array> = {};

    // convert the lottie to uint8array
    data['animations/lottie1.json'] = new TextEncoder().encode(JSON.stringify(dotLottieLottie1));

    const dotLottieWithNoManifest = zipSync(data);

    const fetchSpy = spyOn(typeof window === 'undefined' ? global : window, 'fetch').and.returnValue(
      Promise.resolve(new Response(dotLottieWithNoManifest, { headers: { 'content-type': 'application/zip' } })),
    );

    const dotLottieURL = 'https://lottiefiles.fake/animation/animation.lottie';

    await expectAsync(loadFromURL(dotLottieURL)).toBeRejectedWith(
      new DotLottieError('Invalid .lottie file, manifest.json is missing', ErrorCodes.INVALID_DOTLOTTIE),
    );

    expect(fetchSpy).toHaveBeenCalledWith(dotLottieURL);
  });

  it('throws error if manifest.json has invalid structure', async () => {
    const data: Record<string, Uint8Array> = {};

    data['manifest.json'] = new TextEncoder().encode(
      JSON.stringify({
        version: '1.0',
        revision: 1,
        keywords: 'dotLottie',
        author: 'LottieFiles',
        generator: 'dotLottie-js_v2.0',
        // animations array is missing
        themes: [{ id: 'theme1', animations: ['lottie1'] }],
      }),
    );

    const dotLottieWithInvalidManifest = zipSync(data);

    const fetchSpy = spyOn(typeof window === 'undefined' ? global : window, 'fetch').and.returnValue(
      Promise.resolve(new Response(dotLottieWithInvalidManifest, { headers: { 'content-type': 'application/zip' } })),
    );

    const dotLottieURL = 'https://lottiefiles.fake/animation/animation.lottie';

    await expectAsync(loadFromURL(dotLottieURL)).toBeRejectedWithError(
      /invalid .lottie file, manifest.json structure is invalid/iu,
    );

    expect(fetchSpy).toHaveBeenCalledWith(dotLottieURL);
  });
});

describe('getManifest', () => {
  it('return manifest from dotlottie', async () => {
    const manifest = await getManifest(dotLottieAnimation);

    expect(manifest).toEqual(dotLottieManifest as Manifest);
  });
});

describe('getImage', () => {
  it('throws error if image not found', async () => {
    await expectAsync(getImage(dotLottieAnimationWithImages, 'invalid.png')).toBeRejectedWith(
      new DotLottieError('File not found: images/invalid.png', ErrorCodes.ASSET_NOT_FOUND),
    );
  });
});

describe('getAnimation', () => {
  it('throws error if animation not found', async () => {
    await expectAsync(getAnimation(dotLottieAnimationWithImages, 'animation_id')).toBeRejectedWith(
      new DotLottieError('File not found: animations/animation_id.json', ErrorCodes.ASSET_NOT_FOUND),
    );
  });

  it('get animation by id', async () => {
    const animation = await getAnimation(dotLottieAnimation, 'lottie1');

    expect(animation).toEqual(dotLottieLottie1 as AnimationData);
  });
});

describe('getTheme', () => {
  it('throws error if animation not found', async () => {
    await expectAsync(getTheme(dotLottieAnimationWithImages, 'theme_id')).toBeRejectedWith(
      new DotLottieError('File not found: themes/theme_id.lss', ErrorCodes.ASSET_NOT_FOUND),
    );
  });

  it('gets theme by id', async () => {
    const theme = await getTheme(dotLottieAnimation, 'theme1');

    expect(theme).toEqual(dotLottieTheme);
  });
});

describe('getImages', () => {
  it('returns a map of images', async () => {
    const images = await getImages(dotLottieAnimationWithImages);

    const unzippedDotLottie = unzipSync(dotLottieAnimationWithImages);
    const expectedImages: Record<string, string> = {};

    // eslint-disable-next-line guard-for-in
    for (const key in unzippedDotLottie) {
      const data = unzippedDotLottie[key];

      if (key.startsWith('images/') && data) {
        expectedImages[key.replace('images/', '')] = dataUrlFromU8(data);
      }
    }

    expect(images).toEqual(expectedImages);
  });

  it('returns a map of images with filter', async () => {
    const images = await getImages(dotLottieAnimationWithImages, (file) => file.name.startsWith('images/invalid'));

    expect(images).toEqual({});
  });
});

describe('getThemes', () => {
  it('returns a map of themes', async () => {
    const themes = await getThemes(dotLottieAnimation);

    const expectedThemes = {
      theme1: dotLottieTheme,
    };

    expect(themes).toEqual(expectedThemes);
  });

  it('returns a map of themes with filter', async () => {
    const themes = await getThemes(dotLottieAnimation, (file) => file.name.startsWith('themes/invalid'));

    expect(themes).toEqual({});
  });
});

describe('getAnimations', () => {
  it('returns a map of animations', async () => {
    const animations = await getAnimations(dotLottieAnimation);

    const expectedAnimations = {
      lottie1: dotLottieLottie1 as AnimationData,
    };

    expect(animations).toEqual(expectedAnimations);
  });

  it('returns a map of animations with filter', async () => {
    const animations = await getAnimations(dotLottieAnimation, { inlineAssets: false }, (file) =>
      file.name.startsWith('animations/invalid'),
    );

    expect(animations).toEqual({});
  });
});
