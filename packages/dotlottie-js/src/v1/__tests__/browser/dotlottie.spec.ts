/**
 * Copyright 2023 Design Barn Inc.
 */

/* eslint-disable @lottiefiles/import-filename-format */

import type { Animation as AnimationType } from '@lottie-animation-community/lottie-types';
import { unzipSync } from 'fflate';
import { Base64 } from 'js-base64';
import { describe, test, expect, vi } from 'vitest';

import pkg from '../../../../package.json';
import bullData from '../../../__tests__/__fixtures__/image-asset-optimization/bull.json';
import IMAGE_ANIMATION_1_DATA from '../../../__tests__/__fixtures__/image-asset-optimization/image-animation-layer-1.json';
import IMAGE_ANIMATION_5_DATA from '../../../__tests__/__fixtures__/image-asset-optimization/image-animation-layer-2-3-4-5.json';
import IMAGE_ANIMATION_4_DATA from '../../../__tests__/__fixtures__/image-asset-optimization/image-animation-layer-2-3-4.json';
import IMAGE_ANIMATION_3_DATA from '../../../__tests__/__fixtures__/image-asset-optimization/image-animation-layer-2-3.json';
import IMAGE_ANIMATION_2_DATA from '../../../__tests__/__fixtures__/image-asset-optimization/image-animation-layer-2.json';
import SIMPLE_IMAGE_ANIMATION from '../../../__tests__/__fixtures__/image-asset-optimization/simple-image-animation.json';
import dotlottieAnimation from '../../../__tests__/__fixtures__/simple/animation.lottie?arraybuffer';
import animationData from '../../../__tests__/__fixtures__/simple/animation/animations/lottie1.json';
import manifest from '../../../__tests__/__fixtures__/simple/animation/manifest.json';
import bigMergedDotLottie from '../../../__tests__/__fixtures__/simple/big-merged-dotlottie.lottie?arraybuffer';
import editedDotlottieAnimation from '../../../__tests__/__fixtures__/simple/edited-settings.lottie?arraybuffer';
import editedAnimationData from '../../../__tests__/__fixtures__/simple/edited-settings/animations/lottie01.json';
import editedManifest from '../../../__tests__/__fixtures__/simple/edited-settings/manifest.json';
import type { AnimationData } from '../../../types';
import type { AnimationOptionsV1 as AnimationOptions, ManifestAnimationV1, ManifestV1 } from '../../index.browser';
import { DotLottieV1 as DotLottie, LottieAnimationV1 as LottieAnimation, PlayMode } from '../../index.browser';

describe('setAuthor', () => {
  test('returns the dotlottie instance', () => {
    const dotlottie = new DotLottie();

    const result = dotlottie.setAuthor('Design Barn');

    expect(result).toBe(dotlottie);
  });

  test('sets the author', () => {
    const dotlottie = new DotLottie();

    dotlottie.setAuthor('Design Barn');

    expect(dotlottie.author).toBe('Design Barn');
  });

  test('accepts empty string', () => {
    const dotlottie = new DotLottie();

    dotlottie.setAuthor('');

    expect(dotlottie.author).toBe('');
  });
});

describe('setRevision', () => {
  test('returns the dotlottie instance', () => {
    const dotlottie = new DotLottie();

    const result = dotlottie.setRevision(1);

    expect(result).toBe(dotlottie);
  });

  test('sets the revision', () => {
    const dotlottie = new DotLottie();

    const revision = 1.5;

    dotlottie.setRevision(revision);

    expect(dotlottie.revision).toBe(revision);
  });
});

describe('setDescription', () => {
  test('returns the dotlottie instance', () => {
    const dotlottie = new DotLottie();

    const result = dotlottie.setDescription('A description');

    expect(result).toBe(dotlottie);
  });

  test('sets the description', () => {
    const dotlottie = new DotLottie();

    dotlottie.setDescription('A description');

    expect(dotlottie.description).toBe('A description');
  });

  test('accepts empty string', () => {
    const dotlottie = new DotLottie();

    dotlottie.setDescription('');

    expect(dotlottie.description).toBe('');
  });
});

describe('generator', () => {
  test('has proper generator when no input provided', () => {
    const dotLottie = new DotLottie();

    expect(dotLottie.generator).toBe(`${pkg.name}@${pkg.version}`);
  });
});

describe('setRevision', () => {
  test('returns the dotlottie instance', () => {
    const dotlottie = new DotLottie();

    const result = dotlottie.setRevision(1);

    expect(result).toBe(dotlottie);
  });

  test('sets the revision', () => {
    const dotlottie = new DotLottie();

    const revision = 1.5;

    dotlottie.setRevision(revision);

    expect(dotlottie.revision).toBe(revision);
  });
});

describe('setKeywords', () => {
  test('returns the dotlottie instance', () => {
    const dotlottie = new DotLottie();

    const result = dotlottie.setKeywords('animation, design, lottie');

    expect(result).toBe(dotlottie);
  });

  test('sets the keywords', () => {
    const dotlottie = new DotLottie();

    const keywords = 'animation, design, lottie';

    dotlottie.setKeywords(keywords);

    expect(dotlottie.keywords).toBe(keywords);
  });

  test('accepts empty string', () => {
    const dotlottie = new DotLottie();

    dotlottie.setKeywords('');

    expect(dotlottie.keywords).toBe('');
  });
});

describe('addAnimation', () => {
  test('throws an error if it receives a duplicate id when constructed', () => {
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
    }).toThrow('Duplicate animation id detected, aborting.');
  });

  test('returns the dotlottie instance', () => {
    const dotlottie = new DotLottie();

    const result = dotlottie.addAnimation({
      id: manifest.animations[0]?.id as string,
      data: animationData as unknown as AnimationType,
    });

    expect(result).toBe(dotlottie);
  });

  test('adds an animation', () => {
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

  test('adds an animation using all customizable options', async () => {
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

    const manifestDataToCompare: ManifestAnimationV1 = {
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
  test('returns the dotlottie instance', () => {
    const dotlottie = new DotLottie();

    const result = dotlottie.addAnimation({
      id: manifest.animations[0]?.id as string,
      data: animationData as unknown as AnimationType,
    });

    expect(result).toBe(dotlottie);
  });

  test('removes an animation', () => {
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
  test('returns animation instance', async () => {
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

  test('returns undefined if the animation does not exist', async () => {
    const dotlottie = new DotLottie();

    const animation = await dotlottie.getAnimation('non_existent_animation');

    expect(animation).toBeUndefined();
  });

  test('returns animation instance with inlined assets', async () => {
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

  test('adds multiple animations and verifies their inlined assets', async () => {
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

  test('adds multiple animations, optimizes the images and verifies their inlined assets', async () => {
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
  test('throws error on node environment', async () => {
    // skip test if running in browser environment
    if (typeof window !== 'undefined') return;

    const dotlottie = new DotLottie();

    await expect(
      await dotlottie
        .addAnimation({
          id: 'test_animation',
          data: animationData as unknown as AnimationType,
        })
        .download('file'),
    ).rejects.toThrow('Cannot download dotlottie in a non-browser environment');
  });

  test('downloads dotlottie file on browser', async () => {
    // skip test if running in node environment
    if (typeof window === 'undefined') return;

    const dotlottie = new DotLottie();

    const fileName = 'test.lottie';

    const fakeLink = document.createElement('a');

    const clickSpy = vi.spyOn(fakeLink, 'click').mockImplementation(() => {
      // do nothing
    });

    vi.spyOn(document, 'createElement').mockImplementation(() => {
      return fakeLink;
    });

    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL');

    await dotlottie
      .setAuthor(manifest.author)
      .addAnimation({
        id: 'lottie1',
        data: animationData as unknown as AnimationType,
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
  test('returns a blob', async () => {
    const dotlottie = new DotLottie();

    const blob = await dotlottie
      .setAuthor(manifest.author)
      .addAnimation({
        id: manifest.animations[0]?.id as string,
        data: animationData as unknown as AnimationType,
      })
      .toBlob();

    expect(blob).toBeInstanceOf(Blob);

    // const arrayBuffer = await blob.arrayBuffer();

    // expect(arrayBuffer).toBeEqualDotlottieArrayBuffer(dotlottieAnimation);
  });

  test('Controls the compression level of the whole dotLottie file', async () => {
    const dotlottie = new DotLottie();

    const blob1 = await dotlottie
      .setAuthor(manifest.author)
      .addAnimation({
        id: manifest.animations[0]?.id as string,
        data: animationData as unknown as AnimationType,
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

    // expect(arrayBuffer1).toBeEqualDotlottieArrayBuffer(dotlottieAnimation);
    // expect(arrayBuffer2).toBeEqualDotlottieArrayBuffer(dotlottieAnimation);

    expect(arrayBuffer1.byteLength).toBeLessThan(arrayBuffer2.byteLength);
  });
});

describe('toArrayBuffer', () => {
  test('returns an array buffer', async () => {
    const dotlottie = new DotLottie();

    const arrayBuffer = await dotlottie
      .setAuthor(manifest.author)
      .addAnimation({
        id: manifest.animations[0]?.id as string,
        data: animationData as unknown as AnimationType,
      })
      .toArrayBuffer();

    expect(arrayBuffer).toBeInstanceOf(ArrayBuffer);
    // expect(arrayBuffer).toBeEqualDotlottieArrayBuffer(dotlottieAnimation);
  });

  test('Controls the compression level of the whole dotLottie file', async () => {
    const dotLottie1 = new DotLottie();

    const arrayBuffer1 = await dotLottie1
      .setAuthor(manifest.author)
      .addAnimation({
        id: manifest.animations[0]?.id as string,
        data: animationData as unknown as AnimationType,
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
    // expect(arrayBuffer1).toBeEqualDotlottieArrayBuffer(dotlottieAnimation);

    expect(arrayBuffer2).toBeInstanceOf(ArrayBuffer);
    // expect(arrayBuffer2).toBeEqualDotlottieArrayBuffer(dotlottieAnimation);

    expect(arrayBuffer1.byteLength).toBeLessThan(arrayBuffer2.byteLength);
  });
});

describe('toBase64', () => {
  test('returns base64 string', async () => {
    const dotlottie = new DotLottie();

    const dataURL = await dotlottie
      .setAuthor(manifest.author)
      .addAnimation({
        id: manifest.animations[0]?.id as string,
        data: animationData as unknown as AnimationType,
      })
      .toBase64();

    const actualArrayBuffer = Base64.toUint8Array(dataURL).buffer;

    expect(actualArrayBuffer).toBeInstanceOf(ArrayBuffer);

    const actualContent = unzipSync(new Uint8Array(actualArrayBuffer));

    expect(Object.keys(actualContent).length).toBeGreaterThan(0);
    expect(actualContent[`animations/${manifest.animations[0]?.id}.json`]).toBeDefined();
  });

  test('Controls the compression level of the whole dotLottie file', async () => {
    const dotLottie1 = new DotLottie();

    const dataURL1 = await dotLottie1
      .setAuthor(manifest.author)
      .addAnimation({
        id: manifest.animations[0]?.id as string,
        data: animationData as unknown as AnimationType,
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

    // expect(actualArrayBuffer1).toBeEqualDotlottieArrayBuffer(dotlottieAnimation);
    // expect(actualArrayBuffer2).toBeEqualDotlottieArrayBuffer(dotlottieAnimation);

    expect(actualArrayBuffer1.byteLength).toBeLessThan(actualArrayBuffer2.byteLength);
  });
});

describe('fromURL', () => {
  test('throws an error if the URL is invalid', async () => {
    const dotLottie = new DotLottie();

    await expect(dotLottie.fromURL('invalid-url')).rejects.toThrow('Invalid URL');
  });

  test('loads a dotlottie file from a URL', async () => {
    const fetchSpy = vi
      .spyOn(typeof window === 'undefined' ? global : window, 'fetch')
      .mockResolvedValue(new Response(dotlottieAnimation));

    const animationURL = 'https://lottiefiles.fake/animation/animation.lottie';

    const dotLottie = await new DotLottie().fromURL(animationURL);

    manifest.generator = `${pkg.name}@${pkg.version}`;

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(animationURL);
    expect(dotLottie.animations.length).toBe(1);
    expect(dotLottie.animations[0]?.id).toEqual(manifest.animations[0]?.id as string);
    expect(dotLottie.animations[0]?.data).toEqual(animationData as unknown as AnimationType);
    expect(dotLottie.manifest).toEqual(manifest as ManifestV1);

    fetchSpy.mockRestore();
  });

  test('loads a dotLottie with non-default settings from a URL and verifies the animation settings', async () => {
    const fetchSpy = vi
      .spyOn(typeof window === 'undefined' ? global : window, 'fetch')
      .mockResolvedValue(new Response(editedDotlottieAnimation));

    const animationURL = 'https://lottiefiles.fake/animation/animation.lottie';

    let dotlottie = new DotLottie();

    dotlottie = await dotlottie.fromURL('https://lottiefiles.fake/animation/animation.lottie');

    editedManifest.generator = `${pkg.name}@${pkg.version}`;

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(animationURL);
    expect(dotlottie.animations.length).toBe(1);
    expect(dotlottie.animations[0]?.id).toEqual(editedManifest.animations[0]?.id as string);
    expect(dotlottie.animations[0]?.data).toEqual(editedAnimationData as unknown as AnimationType);
    expect(dotlottie.manifest).toEqual(editedManifest as ManifestV1);

    fetchSpy.mockRestore();
  });
});

describe('fromArrayBuffer', () => {
  test('loads a dotlottie file from an array buffer', async () => {
    const arrayBuffer = dotlottieAnimation;

    let dotlottie = new DotLottie();

    dotlottie = await dotlottie.fromArrayBuffer(arrayBuffer);

    expect(dotlottie.animations.length).toBe(1);
    expect(dotlottie.animations[0]?.id).toEqual(manifest.animations[0]?.id as string);
    expect(dotlottie.animations[0]?.data).toEqual(animationData as unknown as AnimationType);
    expect(dotlottie.manifest).toEqual(manifest as ManifestV1);
  });

  test('loads a dotLottie containing images from an array buffer', async () => {
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

describe('imageAssets', () => {
  test('Adds the Bull animation and checks number of images.', async () => {
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
  test('merges two dotlottie files', async () => {
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
  test('it resolves lottie animations', async () => {
    const fetchSpy = vi
      .spyOn(typeof window === 'undefined' ? global : window, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify(animationData)));

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

    fetchSpy.mockRestore();
  });
});
