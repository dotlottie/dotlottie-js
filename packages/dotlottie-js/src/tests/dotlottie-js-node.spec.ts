/**
 * Copyright 2023 Design Barn Inc.
 */

/* eslint-disable @lottiefiles/import-filename-format */
/* eslint-disable max-classes-per-file */

import type { Animation as AnimationType } from '@lottiefiles/lottie-types';
import { Base64 } from 'js-base64';

import pkg from '../../package.json';
import type { AnimationData, AnimationOptions, Manifest, ManifestAnimation } from '../common';
import { LottieThemeCommon, PlayMode, DotLottiePlugin } from '../common';
import { DotLottie, LottieAnimation } from '../node';

import bullData from './__fixtures__/image-asset-optimization/bull.json';
import IMAGE_ANIMATION_1_DATA from './__fixtures__/image-asset-optimization/image-animation-layer-1.json';
import IMAGE_ANIMATION_5_DATA from './__fixtures__/image-asset-optimization/image-animation-layer-2-3-4-5.json';
import IMAGE_ANIMATION_4_DATA from './__fixtures__/image-asset-optimization/image-animation-layer-2-3-4.json';
import IMAGE_ANIMATION_3_DATA from './__fixtures__/image-asset-optimization/image-animation-layer-2-3.json';
import IMAGE_ANIMATION_2_DATA from './__fixtures__/image-asset-optimization/image-animation-layer-2.json';
import SIMPLE_IMAGE_ANIMATION from './__fixtures__/image-asset-optimization/simple-image-animation.json';
import dotlottieAnimation from './__fixtures__/simple/animation.lottie';
import animationData from './__fixtures__/simple/animation/animations/lottie1.json';
import manifest from './__fixtures__/simple/animation/manifest.json';
import themeData from './__fixtures__/simple/animation/themes/theme1.lss';
import bigMergedDotLottie from './__fixtures__/simple/big-merged-dotlottie.lottie';
import editedDotlottieAnimation from './__fixtures__/simple/edited-settings.lottie';
import editedAnimationData from './__fixtures__/simple/edited-settings/animations/lottie01.json';
import editedManifest from './__fixtures__/simple/edited-settings/manifest.json';
import { customMatchers } from './test-utils';

describe('DotLottie', () => {
  beforeAll(() => {
    jasmine.addMatchers(customMatchers);
  });

  describe('setVersion', () => {
    it('returns the dotlottie instance', () => {
      const dotlottie = new DotLottie();

      const result = dotlottie.setVersion('1.0.0');

      expect(result).toBe(dotlottie);
    });

    it('sets the version', () => {
      const dotlottie = new DotLottie();

      const version = '1.0.0';

      dotlottie.setVersion(version);

      expect(dotlottie.version).toBe(version);
    });
  });

  describe('setAuthor', () => {
    it('returns the dotlottie instance', () => {
      const dotlottie = new DotLottie();

      const result = dotlottie.setAuthor('Design Barn');

      expect(result).toBe(dotlottie);
    });

    it('sets the author', () => {
      const dotlottie = new DotLottie();

      dotlottie.setAuthor('Design Barn');

      expect(dotlottie.author).toBe('Design Barn');
    });
  });

  describe('setRevision', () => {
    it('returns the dotlottie instance', () => {
      const dotlottie = new DotLottie();

      const result = dotlottie.setRevision(1);

      expect(result).toBe(dotlottie);
    });

    it('sets the revision', () => {
      const dotlottie = new DotLottie();

      const revision = 1.5;

      dotlottie.setRevision(revision);

      expect(dotlottie.revision).toBe(revision);
    });
  });

  describe('setDescription', () => {
    it('returns the dotlottie instance', () => {
      const dotlottie = new DotLottie();

      const result = dotlottie.setDescription('A description');

      expect(result).toBe(dotlottie);
    });

    it('sets the description', () => {
      const dotlottie = new DotLottie();

      dotlottie.setDescription('A description');

      expect(dotlottie.description).toBe('A description');
    });
  });

  describe('setGenerator', () => {
    it('returns the dotlottie instance', () => {
      const dotlottie = new DotLottie();

      const result = dotlottie.setGenerator('Design Barn');

      expect(result).toBe(dotlottie);
    });

    it('sets the generator', () => {
      const dotlottie = new DotLottie();

      const generator = 'Design Barn';

      dotlottie.setGenerator(generator);

      expect(dotlottie.generator).toBe(generator);
    });

    it('has proper generator when no input provided', () => {
      const dotLottie = new DotLottie();

      expect(dotLottie.generator).toBe(`${pkg.name}/node@${pkg.version}`);
    });
  });

  describe('setRevision', () => {
    it('returns the dotlottie instance', () => {
      const dotlottie = new DotLottie();

      const result = dotlottie.setRevision(1);

      expect(result).toBe(dotlottie);
    });

    it('sets the revision', () => {
      const dotlottie = new DotLottie();

      const revision = 1.5;

      dotlottie.setRevision(revision);

      expect(dotlottie.revision).toBe(revision);
    });
  });

  describe('setKeywords', () => {
    it('returns the dotlottie instance', () => {
      const dotlottie = new DotLottie();

      const result = dotlottie.setKeywords('animation, design, lottie');

      expect(result).toBe(dotlottie);
    });

    it('sets the keywords', () => {
      const dotlottie = new DotLottie();

      const keywords = 'animation, design, lottie';

      dotlottie.setKeywords(keywords);

      expect(dotlottie.keywords).toBe(keywords);
    });
  });

  describe('addAnimation', () => {
    it('throws an error if it receives a duplicate id when constructed', () => {
      expect(() => {
        const dotLottie = new DotLottie();

        dotLottie.addAnimation({
          id: 'test',
          url: 'https://example.com/test.lottie',
        });
        dotLottie.addAnimation({
          id: 'test',
          url: 'https://example.com/test.lottie',
        });
      }).toThrowError('[dotlottie-js]: Duplicate animation id detected, aborting.');
    });

    it('returns the dotlottie instance', () => {
      const dotlottie = new DotLottie();

      const result = dotlottie.addAnimation({
        id: manifest.animations[0]?.id as string,
        data: animationData as unknown as AnimationType,
      });

      expect(result).toBe(dotlottie);
    });

    it('adds an animation', () => {
      const animationId = manifest.animations[0]?.id as string;

      const dotlottie = new DotLottie();

      dotlottie.addAnimation({
        id: animationId,
        data: animationData as unknown as AnimationType,
      });

      expect(dotlottie.animations.length).toBe(1);

      const animation = dotlottie.animations[0];

      expect(animation?.id).toBe(manifest.animations[0]?.id);
    });

    it('adds an animation using all customizable options', async () => {
      const animationId = 'test_animation';

      const dotlottie = new DotLottie();

      const animationOptions: AnimationOptions = {
        id: animationId,
        data: animationData as unknown as AnimationType,
        autoplay: true,
        direction: -1,
        hover: true,
        intermission: 1000,
        loop: true,
        playMode: PlayMode.Bounce,
        speed: 1.5,
      };

      const manifestDataToCompare: ManifestAnimation = {
        id: animationId,
        autoplay: true,
        direction: -1,
        hover: true,
        intermission: 1000,
        loop: true,
        playMode: PlayMode.Bounce,
        speed: 1.5,
      };

      dotlottie.addAnimation({
        ...animationOptions,
      });

      await dotlottie.build();

      const animationManifest = dotlottie.manifest.animations[0];

      expect(animationManifest).toEqual(manifestDataToCompare);
    });
  });

  describe('removeAnimation', () => {
    it('returns the dotlottie instance', () => {
      const dotlottie = new DotLottie();

      const result = dotlottie.addAnimation({
        id: manifest.animations[0]?.id as string,
        data: animationData as unknown as AnimationType,
      });

      expect(result).toBe(dotlottie);
    });

    it('removes an animation', () => {
      const dotlottie = new DotLottie();

      dotlottie.addAnimation({
        id: manifest.animations[0]?.id as string,
        data: animationData as unknown as AnimationType,
      });

      expect(dotlottie.animations.length).toBe(1);

      dotlottie.removeAnimation(manifest.animations[0]?.id as string);

      expect(dotlottie.animations.length).toBe(0);
    });
  });

  describe('getAnimation', () => {
    it('returns animation instance', async () => {
      const dotlottie = new DotLottie();

      dotlottie.addAnimation({
        id: manifest.animations[0]?.id as string,
        data: animationData as unknown as AnimationType,
      });

      const animation = await dotlottie.getAnimation(manifest.animations[0]?.id as string);

      expect(animation).toBeInstanceOf(LottieAnimation);

      expect(animation?.id).toBe(manifest.animations[0]?.id);
      expect(animation?.data).toEqual(animationData as unknown as AnimationType);
    });

    it('returns undefined if the animation does not exist', async () => {
      const dotlottie = new DotLottie();

      const animation = await dotlottie.getAnimation('non_existent_animation');

      expect(animation).toBeUndefined();
    });

    it('returns animation instance with inlined assets', async () => {
      const dotlottie = new DotLottie();

      dotlottie.addAnimation({
        id: manifest.animations[0]?.id as string,
        data: structuredClone(bullData) as unknown as AnimationData,
      });

      const animation = await dotlottie.getAnimation(manifest.animations[0]?.id as string, { inlineAssets: true });

      expect(animation).toBeInstanceOf(LottieAnimation);
      expect(animation?.id).toBe(manifest.animations[0]?.id);
      expect(animation?.data).toEqual(bullData as unknown as AnimationData);
    });

    it('adds multiple animations and verifies their inlined assets', async () => {
      const dotlottie = new DotLottie({ enableDuplicateImageOptimization: false });

      dotlottie
        .addAnimation({
          id: 'v1',
          data: structuredClone(IMAGE_ANIMATION_1_DATA) as unknown as AnimationData,
        })
        .addAnimation({
          id: 'v2',
          data: structuredClone(IMAGE_ANIMATION_2_DATA) as unknown as AnimationData,
        })
        .addAnimation({
          id: 'v3',
          data: structuredClone(IMAGE_ANIMATION_3_DATA) as unknown as AnimationData,
        })
        .addAnimation({
          id: 'v4',
          data: structuredClone(IMAGE_ANIMATION_4_DATA) as unknown as AnimationData,
        })
        .addAnimation({
          id: 'v5',
          data: structuredClone(IMAGE_ANIMATION_5_DATA) as unknown as AnimationData,
        })
        .addAnimation({
          id: 'v6',
          data: structuredClone(SIMPLE_IMAGE_ANIMATION) as unknown as AnimationData,
        });

      const animationV1 = await dotlottie.getAnimation('v1', { inlineAssets: true });
      const animationV2 = await dotlottie.getAnimation('v2', { inlineAssets: true });
      const animationV3 = await dotlottie.getAnimation('v3', { inlineAssets: true });
      const animationV4 = await dotlottie.getAnimation('v4', { inlineAssets: true });
      const animationV5 = await dotlottie.getAnimation('v5', { inlineAssets: true });
      const animationV6 = await dotlottie.getAnimation('v6', { inlineAssets: true });

      expect(animationV1).toBeInstanceOf(LottieAnimation);
      expect(animationV1?.id).toBe('v1');
      expect(animationV1?.data).toEqual(IMAGE_ANIMATION_1_DATA as unknown as AnimationData);

      expect(animationV2).toBeInstanceOf(LottieAnimation);
      expect(animationV2?.id).toBe('v2');
      expect(animationV2?.data).toEqual(IMAGE_ANIMATION_2_DATA as unknown as AnimationData);

      expect(animationV3).toBeInstanceOf(LottieAnimation);
      expect(animationV3?.id).toBe('v3');
      expect(animationV3?.data).toEqual(IMAGE_ANIMATION_3_DATA as unknown as AnimationData);

      expect(animationV4).toBeInstanceOf(LottieAnimation);
      expect(animationV4?.id).toBe('v4');
      expect(animationV4?.data).toEqual(IMAGE_ANIMATION_4_DATA as unknown as AnimationData);

      expect(animationV5).toBeInstanceOf(LottieAnimation);
      expect(animationV5?.id).toBe('v5');
      expect(animationV5?.data).toEqual(IMAGE_ANIMATION_5_DATA as unknown as AnimationData);

      expect(animationV6).toBeInstanceOf(LottieAnimation);
      expect(animationV6?.id).toBe('v6');
      expect(animationV6?.data).toEqual(SIMPLE_IMAGE_ANIMATION as unknown as AnimationData);
    });

    it('adds multiple animations, optimizes the images and verifies their inlined assets', async () => {
      const dotlottie = new DotLottie({ enableDuplicateImageOptimization: true });

      await dotlottie
        .addAnimation({
          id: 'v1',
          data: structuredClone(IMAGE_ANIMATION_1_DATA as unknown as AnimationData),
        })
        .addAnimation({
          id: 'v2',
          data: structuredClone(IMAGE_ANIMATION_2_DATA as unknown as AnimationData),
        })
        .addAnimation({
          id: 'v3',
          data: structuredClone(IMAGE_ANIMATION_3_DATA as unknown as AnimationData),
        })
        .addAnimation({
          id: 'v4',
          data: structuredClone(IMAGE_ANIMATION_4_DATA as unknown as AnimationData),
        })
        .addAnimation({
          id: 'v5',
          data: structuredClone(IMAGE_ANIMATION_5_DATA as unknown as AnimationData),
        })
        .addAnimation({
          id: 'v6',
          data: structuredClone(SIMPLE_IMAGE_ANIMATION as unknown as AnimationData),
        })
        .build();

      const animationV1 = await dotlottie.getAnimation('v1', { inlineAssets: true });
      const animationV2 = await dotlottie.getAnimation('v2', { inlineAssets: true });
      const animationV3 = await dotlottie.getAnimation('v3', { inlineAssets: true });
      const animationV4 = await dotlottie.getAnimation('v4', { inlineAssets: true });
      const animationV5 = await dotlottie.getAnimation('v5', { inlineAssets: true });
      const animationV6 = await dotlottie.getAnimation('v6', { inlineAssets: true });

      expect(animationV1).toBeInstanceOf(LottieAnimation);
      expect(animationV1?.id).toBe('v1');
      expect(animationV1?.data).toEqual(IMAGE_ANIMATION_1_DATA as unknown as AnimationData);

      expect(animationV2).toBeInstanceOf(LottieAnimation);
      expect(animationV2?.id).toBe('v2');
      expect(animationV2?.data).toEqual(IMAGE_ANIMATION_2_DATA as unknown as AnimationData);

      expect(animationV3).toBeInstanceOf(LottieAnimation);
      expect(animationV3?.id).toBe('v3');
      expect(animationV3?.data).toEqual(IMAGE_ANIMATION_3_DATA as unknown as AnimationData);

      expect(animationV4).toBeInstanceOf(LottieAnimation);
      expect(animationV4?.id).toBe('v4');
      expect(animationV4?.data).toEqual(IMAGE_ANIMATION_4_DATA as unknown as AnimationData);

      expect(animationV5).toBeInstanceOf(LottieAnimation);
      expect(animationV5?.id).toBe('v5');
      expect(animationV5?.data).toEqual(IMAGE_ANIMATION_5_DATA as unknown as AnimationData);

      expect(animationV6).toBeInstanceOf(LottieAnimation);
      expect(animationV6?.id).toBe('v6');
      expect(animationV6?.data).toEqual(SIMPLE_IMAGE_ANIMATION as unknown as AnimationData);
    });
  });

  describe('download', () => {
    it('throws error on node environment', async () => {
      // skip test if running in browser environment
      if (typeof window !== 'undefined') return;

      const dotlottie = new DotLottie();

      await expectAsync(
        dotlottie
          .addAnimation({
            id: 'test_animation',
            data: animationData as unknown as AnimationType,
          })
          .download('file'),
      ).toBeRejectedWithError('[dotlottie-js]: Cannot download dotlottie in a non-browser environment');
    });

    it('downloads dotlottie file on browser', async () => {
      // skip test if running in node environment
      if (typeof window === 'undefined') return;

      const dotlottie = new DotLottie();

      const fileName = 'test.lottie';

      const fakeLink = document.createElement('a');

      const clickSpy = spyOn(fakeLink, 'click').and.callFake(() => {
        // do nothing
      });

      spyOn(document, 'createElement').and.callFake(() => {
        return fakeLink;
      });

      const createObjectURLSpy = spyOn(URL, 'createObjectURL').and.callThrough();

      await dotlottie
        .setAuthor(manifest.author)
        .setVersion(manifest.version)
        .setGenerator(manifest.generator)
        .addAnimation({
          id: 'lottie1',
          data: animationData as unknown as AnimationType,
        })
        .addTheme({
          id: 'theme1',
          data: themeData,
        })
        .assignTheme({
          animationId: 'lottie1',
          themeId: 'theme1',
        })
        .build();

      await dotlottie.download(fileName);

      const blob = await dotlottie.toBlob();

      expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
      expect(createObjectURLSpy).toHaveBeenCalledWith(blob);

      expect(fakeLink.download).toBe(fileName);
      expect(fakeLink.style.display).toBe('none');
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('toBlob', () => {
    it('returns a blob', async () => {
      const dotlottie = new DotLottie();

      const blob = await dotlottie
        .setAuthor(manifest.author)
        .setVersion(manifest.version)
        .setGenerator(manifest.generator)
        .addAnimation({
          id: manifest.animations[0]?.id as string,
          data: animationData as unknown as AnimationType,
        })
        .addTheme({
          id: manifest.themes[0]?.id as string,
          data: themeData,
        })
        .assignTheme({
          animationId: manifest.animations[0]?.id as string,
          themeId: manifest.themes[0]?.id as string,
        })
        .toBlob();

      expect(blob).toBeInstanceOf(Blob);

      const arrayBuffer = await blob.arrayBuffer();

      expect(arrayBuffer).toBeEqualDotlottieArrayBuffer(dotlottieAnimation);
    });

    it('Controls the compression level of the whole dotLottie file', async () => {
      const dotlottie = new DotLottie();

      const blob1 = await dotlottie
        .setAuthor(manifest.author)
        .setVersion(manifest.version)
        .setGenerator(manifest.generator)
        .addAnimation({
          id: manifest.animations[0]?.id as string,
          data: animationData as unknown as AnimationType,
        })
        .addTheme({
          id: manifest.themes[0]?.id as string,
          data: themeData,
        })
        .assignTheme({
          animationId: manifest.animations[0]?.id as string,
          themeId: manifest.themes[0]?.id as string,
        })
        .toBlob({
          zipOptions: {
            level: 9,
          },
        });

      const blob2 = await dotlottie.toBlob({
        zipOptions: {
          level: 0,
        },
      });

      expect(blob1).toBeInstanceOf(Blob);
      expect(blob2).toBeInstanceOf(Blob);

      const arrayBuffer1 = await blob1.arrayBuffer();
      const arrayBuffer2 = await blob2.arrayBuffer();

      expect(arrayBuffer1).toBeEqualDotlottieArrayBuffer(dotlottieAnimation);
      expect(arrayBuffer2).toBeEqualDotlottieArrayBuffer(dotlottieAnimation);

      expect(arrayBuffer1.byteLength).toBeLessThan(arrayBuffer2.byteLength);
    });
  });

  describe('toArrayBuffer', () => {
    it('returns an array buffer', async () => {
      const dotlottie = new DotLottie();

      const arrayBuffer = await dotlottie
        .setAuthor(manifest.author)
        .setVersion(manifest.version)
        .setGenerator(manifest.generator)
        .addAnimation({
          id: manifest.animations[0]?.id as string,
          data: animationData as unknown as AnimationType,
        })
        .addTheme({
          id: manifest.themes[0]?.id as string,
          data: themeData,
        })
        .assignTheme({
          animationId: manifest.animations[0]?.id as string,
          themeId: manifest.themes[0]?.id as string,
        })
        .toArrayBuffer();

      expect(arrayBuffer).toBeInstanceOf(ArrayBuffer);
      expect(arrayBuffer).toBeEqualDotlottieArrayBuffer(dotlottieAnimation);
    });

    it('Controls the compression level of the whole dotLottie file', async () => {
      const dotLottie1 = new DotLottie();

      const arrayBuffer1 = await dotLottie1
        .setAuthor(manifest.author)
        .setVersion(manifest.version)
        .setGenerator(manifest.generator)
        .addAnimation({
          id: manifest.animations[0]?.id as string,
          data: animationData as unknown as AnimationType,
        })
        .addTheme({
          id: manifest.themes[0]?.id as string,
          data: themeData,
        })
        .assignTheme({
          animationId: manifest.animations[0]?.id as string,
          themeId: manifest.themes[0]?.id as string,
        })
        .toArrayBuffer({
          zipOptions: {
            level: 9,
          },
        });

      const arrayBuffer2 = await dotLottie1.toArrayBuffer({
        zipOptions: {
          level: 0,
        },
      });

      expect(arrayBuffer1).toBeInstanceOf(ArrayBuffer);
      expect(arrayBuffer1).toBeEqualDotlottieArrayBuffer(dotlottieAnimation);

      expect(arrayBuffer2).toBeInstanceOf(ArrayBuffer);
      expect(arrayBuffer2).toBeEqualDotlottieArrayBuffer(dotlottieAnimation);

      expect(arrayBuffer1.byteLength).toBeLessThan(arrayBuffer2.byteLength);
    });
  });

  describe('toBase64', () => {
    it('returns base64 string', async () => {
      const dotlottie = new DotLottie();

      const dataURL = await dotlottie
        .setAuthor(manifest.author)
        .setVersion(manifest.version)
        .setGenerator(manifest.generator)
        .addAnimation({
          id: manifest.animations[0]?.id as string,
          data: animationData as unknown as AnimationType,
        })
        .addTheme({
          id: manifest.themes[0]?.id as string,
          data: themeData,
        })
        .assignTheme({
          animationId: manifest.animations[0]?.id as string,
          themeId: manifest.themes[0]?.id as string,
        })
        .toBase64();

      const actualArrayBuffer = Base64.toUint8Array(dataURL).buffer;

      expect(actualArrayBuffer).toBeEqualDotlottieArrayBuffer(dotlottieAnimation);
    });

    it('Controls the compression level of the whole dotLottie file', async () => {
      const dotLottie1 = new DotLottie();

      const dataURL1 = await dotLottie1
        .setAuthor(manifest.author)
        .setVersion(manifest.version)
        .setGenerator(manifest.generator)
        .addAnimation({
          id: manifest.animations[0]?.id as string,
          data: animationData as unknown as AnimationType,
        })
        .addTheme({
          id: manifest.themes[0]?.id as string,
          data: themeData,
        })
        .assignTheme({
          animationId: manifest.animations[0]?.id as string,
          themeId: manifest.themes[0]?.id as string,
        })
        .toBase64({
          zipOptions: {
            level: 9,
          },
        });

      const dataURL2 = await dotLottie1.toBase64({
        zipOptions: {
          level: 0,
        },
      });

      const actualArrayBuffer1 = Base64.toUint8Array(dataURL1).buffer;
      const actualArrayBuffer2 = Base64.toUint8Array(dataURL2).buffer;

      expect(actualArrayBuffer1).toBeEqualDotlottieArrayBuffer(dotlottieAnimation);
      expect(actualArrayBuffer2).toBeEqualDotlottieArrayBuffer(dotlottieAnimation);

      expect(actualArrayBuffer1.byteLength).toBeLessThan(actualArrayBuffer2.byteLength);
    });
  });

  describe('fromURL', () => {
    it('throws an error if the URL is invalid', async () => {
      const dotLottie = new DotLottie();

      await expectAsync(dotLottie.fromURL('invalid-url')).toBeRejectedWithError('[dotlottie-js]: Invalid URL');
    });

    it('loads a dotlottie file from a URL', async () => {
      const fetchSpy = spyOn(typeof window === 'undefined' ? global : window, 'fetch').and.returnValue(
        Promise.resolve(new Response(dotlottieAnimation)),
      );

      const animationURL = 'https://lottiefiles.fake/animation/animation.lottie';

      const dotLottie = await new DotLottie().fromURL(animationURL);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(animationURL);
      expect(dotLottie.animations.length).toBe(1);
      expect(dotLottie.animations[0]?.id).toEqual(manifest.animations[0]?.id as string);
      expect(dotLottie.animations[0]?.data).toEqual(animationData as unknown as AnimationType);
      expect(dotLottie.manifest).toEqual(manifest as Manifest);
      expect(dotLottie.themes.length).toBe(1);
      expect(dotLottie.themes[0]?.id).toEqual(manifest.themes[0]?.id);
      expect(dotLottie.themes[0]?.data).toEqual(themeData);
    });

    it('loads a dotLottie with non-default settings from a URL and verifies the animation settings', async () => {
      const fetchSpy = spyOn(typeof window === 'undefined' ? global : window, 'fetch').and.returnValue(
        Promise.resolve(new Response(editedDotlottieAnimation)),
      );

      const animationURL = 'https://lottiefiles.fake/animation/animation.lottie';

      let dotlottie = new DotLottie();

      dotlottie = await dotlottie.fromURL('https://lottiefiles.fake/animation/animation.lottie');

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(animationURL);
      expect(dotlottie.animations.length).toBe(1);
      expect(dotlottie.animations[0]?.id).toEqual(editedManifest.animations[0]?.id as string);
      expect(dotlottie.animations[0]?.data).toEqual(editedAnimationData as unknown as AnimationType);
      expect(dotlottie.manifest).toEqual(editedManifest as Manifest);
    });
  });

  describe('fromArrayBuffer', () => {
    it('loads a dotlottie file from an array buffer', async () => {
      const arrayBuffer = dotlottieAnimation;

      let dotlottie = new DotLottie();

      dotlottie = await dotlottie.fromArrayBuffer(arrayBuffer);

      expect(dotlottie.animations.length).toBe(1);
      expect(dotlottie.animations[0]?.id).toEqual(manifest.animations[0]?.id as string);
      expect(dotlottie.animations[0]?.data).toEqual(animationData as unknown as AnimationType);
      expect(dotlottie.manifest).toEqual(manifest as Manifest);
      expect(dotlottie.themes.length).toBe(1);
      expect(dotlottie.themes[0]?.id).toEqual(manifest.themes[0]?.id);
      expect(dotlottie.themes[0]?.data).toEqual(themeData);
    });

    it('loads a dotLottie containing images from an array buffer', async () => {
      const arrayBuffer = bigMergedDotLottie;
      let dotlottie = new DotLottie();

      dotlottie = await dotlottie.fromArrayBuffer(arrayBuffer);

      expect(dotlottie.animations.length).toBe(6);
      expect(dotlottie.getImages().length).toBe(16);
      expect(dotlottie.animations[0]?.id).toEqual('v1');
      expect(dotlottie.animations[1]?.id).toEqual('v2');
      expect(dotlottie.animations[2]?.id).toEqual('v3');
      expect(dotlottie.animations[3]?.id).toEqual('v4');
      expect(dotlottie.animations[4]?.id).toEqual('v5');
      expect(dotlottie.animations[5]?.id).toEqual('v6');
      expect(dotlottie.animations.map((animation) => animation.id)).toEqual(['v1', 'v2', 'v3', 'v4', 'v5', 'v6']);
    });
  });

  describe('addPlugins', () => {
    it('adds plugins to the animation', () => {
      class TestPlugin extends DotLottiePlugin {
        public readonly name = 'test';

        public override async onBuild(): Promise<void> {
          return Promise.resolve();
        }
      }

      const dotlottie = new DotLottie();

      const plugin = new TestPlugin();

      dotlottie.addPlugins(plugin);

      expect(dotlottie.plugins).toContain(plugin);
    });
  });

  describe('removePlugins', () => {
    it('removes plugins from the animation', () => {
      class TestPlugin extends DotLottiePlugin {
        public readonly name = 'test';

        public override async onBuild(): Promise<void> {
          return Promise.resolve();
        }
      }

      const dotlottie = new DotLottie();

      const plugin = new TestPlugin();

      dotlottie.addPlugins(plugin);

      expect(dotlottie.plugins).toContain(plugin);

      dotlottie.removePlugins(plugin);

      expect(dotlottie.plugins).not.toContain(plugin);
    });
  });

  describe('imageAssets', () => {
    it('Adds the Bull animation and checks number of images.', async () => {
      const dotlottie = await new DotLottie()
        .addAnimation({
          id: 'animation_1',
          data: structuredClone(bullData) as unknown as AnimationData,
        })
        .build();

      const animation1 = await dotlottie.getAnimation('animation_1');

      expect(animation1?.imageAssets.length).toBe(5);
    });
  });

  describe('merge', () => {
    it('merges two dotlottie files', async () => {
      const dotlottie1 = new DotLottie().addAnimation({
        id: 'lottie1',
        data: animationData as unknown as AnimationType,
      });

      const dotlottie2 = new DotLottie().addAnimation({
        id: 'lottie2',
        data: animationData as unknown as AnimationType,
      });

      const dotlottie3 = new DotLottie().addAnimation({
        id: 'lottie3',
        data: structuredClone(bullData as unknown as AnimationData),
      });

      const dotlottie4 = new DotLottie().addAnimation({
        id: 'lottie4',
        data: structuredClone(bullData as unknown as AnimationData),
      });

      const shrekVariant1 = new DotLottie().addAnimation({
        id: 'v1',
        data: structuredClone(IMAGE_ANIMATION_1_DATA as unknown as AnimationData),
      });

      const shrekVariant2 = new DotLottie().addAnimation({
        id: 'v2',
        data: structuredClone(IMAGE_ANIMATION_2_DATA as unknown as AnimationData),
      });

      const shrekVariant3 = new DotLottie().addAnimation({
        id: 'v3',
        data: structuredClone(IMAGE_ANIMATION_3_DATA as unknown as AnimationData),
      });

      const shrekVariant4 = new DotLottie().addAnimation({
        id: 'v4',
        data: structuredClone(IMAGE_ANIMATION_4_DATA as unknown as AnimationData),
      });

      const shrekVariant5 = new DotLottie().addAnimation({
        id: 'v5',
        data: structuredClone(IMAGE_ANIMATION_5_DATA as unknown as AnimationData),
      });

      const shrekVariant6 = new DotLottie().addAnimation({
        id: 'v6',
        data: structuredClone(SIMPLE_IMAGE_ANIMATION as unknown as AnimationData),
      });

      const [mergedImageLottie] = await Promise.all([
        new DotLottie().merge(dotlottie3, dotlottie4),
        new DotLottie().merge(dotlottie3, dotlottie4).build(),
      ]);

      const [bigMergedImageLottie, mergedDotlottie] = await Promise.all([
        new DotLottie()
          .merge(shrekVariant1, shrekVariant2, shrekVariant3, shrekVariant4, shrekVariant5, shrekVariant6)
          .build(),
        new DotLottie().merge(dotlottie1, dotlottie2).build(),
      ]);

      expect(mergedImageLottie.animations.length).toBe(2);

      expect(bigMergedImageLottie.animations.length).toBe(6);

      expect(bigMergedImageLottie.animations.map((animation) => animation.id)).toEqual([
        'v1',
        'v2',
        'v3',
        'v4',
        'v5',
        'v6',
      ]);

      expect(mergedDotlottie).toBeInstanceOf(DotLottie);

      expect(mergedDotlottie.animations.length).toBe(2);

      expect(mergedDotlottie.animations[0]?.id).toEqual('lottie1');
      expect(mergedDotlottie.animations[0]?.data).toEqual(animationData as unknown as AnimationType);

      expect(mergedDotlottie.animations[1]?.id).toEqual('lottie2');
      expect(mergedDotlottie.animations[1]?.data).toEqual(animationData as unknown as AnimationType);
    });
  });

  describe('build', () => {
    it('it resolves lottie animations', async () => {
      const fetchSpy = spyOn(typeof window === 'undefined' ? global : window, 'fetch').and.returnValue(
        Promise.resolve(new Response(JSON.stringify(animationData))),
      );

      const animationURL = 'https://lottiefiles.fake/animation.json';

      const dotlottie = new DotLottie().addAnimation({
        url: animationURL,
        id: 'lottie1',
      });

      expect(dotlottie.animations[0]?.data).toBeUndefined();

      await dotlottie.build();

      expect(dotlottie.animations[0]?.data).toEqual(animationData as unknown as AnimationType);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(animationURL);
    });

    it('runs plugins in correct order', async () => {
      const parallel1OnBuild = jasmine.createSpy('parallel1OnBuild');
      const parallel2OnBuild = jasmine.createSpy('parallel2OnBuild');

      const sequential1OnBuild = jasmine.createSpy('sequential1OnBuild');
      const sequential2OnBuild = jasmine.createSpy('sequential2OnBuild');

      class Parallel1TestPlugin extends DotLottiePlugin {
        public readonly name = 'parallel-test';

        public constructor() {
          super({ parallel: true });
        }

        public override async onBuild(): Promise<void> {
          parallel1OnBuild(this.dotlottie);
        }
      }
      class Parallel2TestPlugin extends DotLottiePlugin {
        public readonly name = 'parallel-test';

        public constructor() {
          super({ parallel: true });
        }

        public override async onBuild(): Promise<void> {
          parallel2OnBuild(this.dotlottie);
        }
      }

      class Sequential1TestPlugin extends DotLottiePlugin {
        public readonly name = 'sequential-test';

        public override async onBuild(): Promise<void> {
          sequential1OnBuild(this.dotlottie);
        }
      }

      class Sequential2TestPlugin extends DotLottiePlugin {
        public readonly name = 'sequential-test';

        public override async onBuild(): Promise<void> {
          sequential2OnBuild(this.dotlottie);
        }
      }

      const dotlottie = new DotLottie()
        .addAnimation({
          id: 'lottie1',
          data: animationData as unknown as AnimationType,
        })
        .addPlugins(
          new Sequential1TestPlugin(),
          new Parallel1TestPlugin(),
          new Parallel2TestPlugin(),
          new Sequential2TestPlugin(),
        );

      expect(parallel1OnBuild).not.toHaveBeenCalled();
      expect(parallel2OnBuild).not.toHaveBeenCalled();
      expect(sequential1OnBuild).not.toHaveBeenCalled();
      expect(sequential2OnBuild).not.toHaveBeenCalled();

      await dotlottie.build();

      expect(parallel1OnBuild).toHaveBeenCalledTimes(1);
      expect(parallel2OnBuild).toHaveBeenCalledTimes(1);
      expect(sequential1OnBuild).toHaveBeenCalledTimes(1);
      expect(sequential2OnBuild).toHaveBeenCalledTimes(1);

      expect(parallel1OnBuild).toHaveBeenCalledWith(dotlottie);
      expect(parallel2OnBuild).toHaveBeenCalledWith(dotlottie);
      expect(sequential1OnBuild).toHaveBeenCalledWith(dotlottie);
      expect(sequential2OnBuild).toHaveBeenCalledWith(dotlottie);

      expect(parallel1OnBuild).toHaveBeenCalledBefore(parallel2OnBuild);
      expect(parallel2OnBuild).toHaveBeenCalledBefore(sequential1OnBuild);
      expect(sequential1OnBuild).toHaveBeenCalledBefore(sequential2OnBuild);
    });

    describe('addTheme', () => {
      it('returns dotLottie instance', () => {
        // arrange
        const dotlottie = new DotLottie();

        const theme = {
          id: 'theme_1',
          data: `FillShape { fill-color: red; }`,
        };

        // act
        const result = dotlottie.addTheme(theme);

        // assert
        expect(result).toBe(dotlottie);
      });

      it('adds theme', () => {
        // arrange
        const dotlottie = new DotLottie();

        const theme1 = {
          id: 'theme_1',
          data: `FillShape { fill-color: red; }`,
        };

        const theme2 = {
          id: 'theme_2',
          url: 'https://fake.lottiefiles.com/theme.lss',
        };

        // act
        dotlottie.addTheme(theme1).addTheme(theme2);

        const themes = dotlottie.themes;

        // assert
        expect(themes.length).toBe(2);

        expect(themes[0]).toBeInstanceOf(LottieThemeCommon);
        expect(themes[0]?.id).toBe(theme1.id);
        expect(themes[0]?.data).toBe(theme1.data);
        expect(themes[0]?.url).toBeUndefined();

        expect(themes[1]).toBeInstanceOf(LottieThemeCommon);
        expect(themes[1]?.id).toBe(theme2.id);
        expect(themes[1]?.url).toBe(theme2.url);
        expect(themes[1]?.data).toBeUndefined();
      });
    });

    describe('removeTheme', () => {
      it('returns dotLottie instance', () => {
        // arrange
        const dotlottie = new DotLottie();

        const theme = {
          id: 'theme_1',
          data: `FillShape { fill-color: red; }`,
        };

        // act
        const result = dotlottie.addTheme(theme).removeTheme(theme.id);

        // assert
        expect(result).toBe(dotlottie);
      });

      it('removes theme', () => {
        // arrange
        const dotlottie = new DotLottie();

        const theme1 = {
          id: 'theme_1',
          data: `FillShape { fill-color: red; }`,
        };

        const theme2 = {
          id: 'theme_2',
          url: 'https://fake.lottiefiles.com/theme.lss',
        };

        // act
        dotlottie.addTheme(theme1).addTheme(theme2).removeTheme(theme1.id);

        // assert
        expect(dotlottie.themes.length).toBe(1);
        expect(dotlottie.themes[0]?.id).toBe(theme2.id);
      });
    });

    describe('getTheme', () => {
      it('returns theme by id', () => {
        // arrange
        const dotLottie = new DotLottie();

        const theme = {
          id: 'theme_1',
          data: `FillShape { fill-color: red; }`,
        };

        dotLottie.addTheme(theme);

        // act
        const result = dotLottie.getTheme(theme.id);

        // assert
        expect(result).toBeInstanceOf(LottieThemeCommon);
        expect(result?.id).toBe(theme.id);
        expect(result?.data).toBe(theme.data);
      });

      it('returns undefined if theme does not exist', () => {
        // arrange
        const dotLottie = new DotLottie();

        // act
        const result = dotLottie.getTheme('theme_1');

        // assert
        expect(result).toBeUndefined();
      });
    });

    describe('assignTheme', () => {
      it('returns dotLottie instance', () => {
        // arrange
        const dotlottie = new DotLottie();

        // act
        const result = dotlottie
          .addAnimation({
            id: 'animation_1',
            data: animationData as unknown as AnimationType,
          })
          .addTheme({
            id: 'theme_1',
            data: `FillShape { fill-color: red; }`,
          })
          .assignTheme({
            themeId: 'theme_1',
            animationId: 'animation_1',
          });

        // assert
        expect(result).toBe(dotlottie);
      });

      it('throws error if animation does not exist', () => {
        // arrange
        const dotlottie = new DotLottie();

        const theme = {
          id: 'theme_1',
          data: `FillShape { fill-color: red; }`,
        };

        const animation = {
          id: 'animation_1',
          data: animationData as unknown as AnimationType,
        };

        expect(() => {
          // act
          dotlottie.addTheme(theme).assignTheme({
            themeId: theme.id,
            animationId: animation.id,
          });
          // assert
        }).toThrowError(`[dotlottie-js]: Failed to find animation with id ${animation.id}`);
      });

      it('throws error if theme does not exist', () => {
        // arrange
        const dotlottie = new DotLottie();

        const theme = {
          id: 'theme_1',
          data: `FillShape { fill-color: red; }`,
        };

        const animation = {
          id: 'animation_1',
          data: animationData as unknown as AnimationType,
        };

        expect(() => {
          // act
          dotlottie.addAnimation(animation).assignTheme({
            themeId: theme.id,
            animationId: animation.id,
          });
          // assert
        }).toThrowError(`[dotlottie-js]: Failed to find theme with id ${theme.id}`);
      });

      it('assigns an existing theme to an existing animation', async () => {
        // arrange
        const dotlottie = new DotLottie();

        // act
        dotlottie
          .addAnimation({
            id: 'animation_1',
            data: animationData as unknown as AnimationType,
          })
          .addTheme({
            id: 'theme_1',
            data: `FillShape { fill-color: red; }`,
          })
          .assignTheme({
            themeId: 'theme_1',
            animationId: 'animation_1',
          });

        // assert
        const assignedTheme = dotlottie.getTheme('theme_1');
        const animation = await dotlottie.getAnimation('animation_1');

        expect(assignedTheme?.animations.length).toBe(1);
        expect(assignedTheme?.animations[0]).toBe(animation);

        expect(animation?.themes.length).toBe(1);
        expect(animation?.themes[0]).toBe(assignedTheme);

        expect(dotlottie.manifest.themes).toEqual([
          {
            id: 'theme_1',
            animations: ['animation_1'],
          },
        ]);
      });
    });
  });
});
