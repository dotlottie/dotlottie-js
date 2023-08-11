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
  createError,
  isValidURL,
  getStateMachine,
  getStateMachines,
} from '..';

import dotLottieAnimation from './__fixtures__/simple/animation.lottie';
import bullJson from './__fixtures__/simple/animation/animations/bull.json';
import dotLottieLottie1 from './__fixtures__/simple/animation/animations/lottie1.json';
import dotLottieManifest from './__fixtures__/simple/animation/manifest.json';
import dotLottieTheme from './__fixtures__/simple/animation/themes/theme1.lss';
import dotLottieAnimationWithImages from './__fixtures__/simple/big-merged-dotlottie.lottie';
import bullAnimation from './__fixtures__/simple/bull.lottie';
import stateAnimation from './__fixtures__/simple/states.lottie';

describe('createError', () => {
  it('returns an instance of Error with the correct message', () => {
    const errorMessage = 'This is an error';
    const error = createError(errorMessage);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(`[dotlottie-js]: ${errorMessage}`);
  });
});

describe('isValidURL', () => {
  it('returns true for a valid URL', () => {
    expect(isValidURL('https://www.valid.com')).toBe(true);
  });

  it('returns false for an invalid URL', () => {
    expect(isValidURL('invalid')).toBe(false);
  });
});

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

  it('returns undefined if manifest is not found', async () => {
    const data: Record<string, Uint8Array> = {};

    // convert the lottie to uint8array
    data['animations/lottie1.json'] = new TextEncoder().encode(JSON.stringify(dotLottieLottie1));

    const dotLottieWithNoManifest = zipSync(data);

    const manifest = await getManifest(dotLottieWithNoManifest);

    expect(manifest).toBeUndefined();
  });
});

describe('getImage', () => {
  it('returns undefined if image is not found', async () => {
    const image = await getImage(dotLottieAnimation, 'invalid_image');

    expect(image).toBeUndefined();
  });
});

describe('getAnimation', () => {
  it('returns undefined if animation not found', async () => {
    const animation = await getAnimation(dotLottieAnimation, 'invalid_animation');

    expect(animation).toBeUndefined();
  });

  it('get animation by id', async () => {
    const animation = await getAnimation(dotLottieAnimation, 'lottie1');

    expect(animation).toEqual(dotLottieLottie1 as AnimationData);
  });

  it('returns inlined images within the animation', async () => {
    const manifest = await getManifest(bullAnimation);

    const animationId = manifest?.animations[0]?.id || '';

    const animation = await getAnimation(bullAnimation, animationId, { inlineAssets: true });

    expect(JSON.stringify(animation?.assets)).toEqual(JSON.stringify(bullJson.assets));
  });
});

describe('getTheme', () => {
  it('returns undefined if theme not found', async () => {
    const theme = await getTheme(dotLottieAnimation, 'invalid_theme');

    expect(theme).toBeUndefined();
  });

  it('gets theme by id', async () => {
    const theme = await getTheme(dotLottieAnimation, 'theme1');

    expect(theme).toEqual(dotLottieTheme);
  });
});

describe('getStateMachine', () => {
  it('returns undefined if state machine is not found', async () => {
    const stateMachine = await getStateMachine(stateAnimation, 'invalid_state');

    expect(stateMachine).toBeUndefined();
  });

  it('gets state machine by id', async () => {
    const stateMachine = await getStateMachine(stateAnimation, 'state_segments');

    expect(stateMachine).toEqual(
      JSON.stringify({
        descriptor: {
          id: 'state_segments',
          initial: 'loopState',
        },
        states: {
          loopState: {
            animationId: 'segments',
            statePlaybackSettings: {
              autoplay: true,
              loop: true,
              segments: [70, 500],
            },
          },
        },
      }),
    );
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

describe('getStateMachines', () => {
  it('returns a map of state machines', async () => {
    const stateMachines = await getStateMachines(stateAnimation);

    // Not all states are being checked
    const stateSegments = `{"descriptor":{"id":"state_segments","initial":"loopState"},"states":{"loopState":{"animationId":"segments","statePlaybackSettings":{"autoplay":true,"loop":true,"segments":[70,500]}}}}`;
    const explodingPigeon = `{"descriptor":{"id":"exploding_pigeon","initial":"running"},"states":{"running":{"animationId":"pigeon","statePlaybackSettings":{"autoplay":true,"loop":true,"direction":1,"segments":"bird"},"onClick":{"state":"exploding"}},"exploding":{"animationId":"pigeon","statePlaybackSettings":{"autoplay":true,"loop":3,"direction":1,"segments":"explosion"},"onComplete":{"state":"feathers"}},"feathers":{"animationId":"pigeon","statePlaybackSettings":{"autoplay":true,"loop":false,"direction":1,"segments":"feathers"},"onComplete":{"state":"running"}}}}`;

    expect(stateMachines['state_segments']).toEqual(stateSegments);
    expect(stateMachines['exploding_pigeon']).toEqual(explodingPigeon);
  });

  it('returns a map of themes with filter', async () => {
    const states = await getThemes(dotLottieAnimation, (file) => file.name.startsWith('states/invalid'));

    expect(states).toEqual({});
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
