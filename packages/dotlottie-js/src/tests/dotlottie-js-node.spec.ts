/**
 * Copyright 2023 Design Barn Inc.
 */

/* eslint-disable max-classes-per-file */

import { Base64 } from 'js-base64';

import type { AnimationData, Manifest } from '../common';
import { DotLottiePlugin } from '../common';
import { DotLottie, LottieAnimation } from '../node';

// eslint-disable-next-line import/no-namespace
import * as bullData from './__fixtures__/image-asset-optimization/bull.json';
// eslint-disable-next-line import/no-namespace
import * as IMAGE_ANIMATION_1_DATA from './__fixtures__/image-asset-optimization/image-animation-layer-1.json';
// eslint-disable-next-line import/no-namespace
import * as IMAGE_ANIMATION_5_DATA from './__fixtures__/image-asset-optimization/image-animation-layer-2-3-4-5.json';
// eslint-disable-next-line import/no-namespace
import * as IMAGE_ANIMATION_4_DATA from './__fixtures__/image-asset-optimization/image-animation-layer-2-3-4.json';
// eslint-disable-next-line import/no-namespace
import * as IMAGE_ANIMATION_3_DATA from './__fixtures__/image-asset-optimization/image-animation-layer-2-3.json';
// eslint-disable-next-line import/no-namespace
import * as IMAGE_ANIMATION_2_DATA from './__fixtures__/image-asset-optimization/image-animation-layer-2.json';
// eslint-disable-next-line import/no-namespace
import * as SIMPLE_IMAGE_ANIMATION from './__fixtures__/image-asset-optimization/simple-image-animation.json';
import dotlottieAnimation from './__fixtures__/simple/animation.lottie';
import animationData from './__fixtures__/simple/animation/animations/lottie-1.json';
import manifest from './__fixtures__/simple/animation/manifest.json';
import bigMergedDotLottie from './__fixtures__/simple/big-merged-dotlottie.lottie';
import { customMatchers } from './test-utils';

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
  it('returns the dotlottie instance', () => {
    const dotlottie = new DotLottie();

    const result = dotlottie.addAnimation({
      id: manifest.animations[0]?.id as string,
      data: animationData as AnimationData,
    });

    expect(result).toBe(dotlottie);
  });

  it('adds an animation', () => {
    const animationId = manifest.animations[0]?.id as string;

    const dotlottie = new DotLottie();

    dotlottie.addAnimation({
      id: animationId,
      data: animationData as AnimationData,
    });

    expect(dotlottie.animations.length).toBe(1);

    const animation = dotlottie.animations[0];

    expect(animation?.id).toBe(manifest.animations[0]?.id);
  });
});

describe('removeAnimation', () => {
  it('returns the dotlottie instance', () => {
    const dotlottie = new DotLottie();

    const result = dotlottie.addAnimation({
      id: manifest.animations[0]?.id as string,
      data: animationData as AnimationData,
    });

    expect(result).toBe(dotlottie);
  });

  it('removes an animation', () => {
    const dotlottie = new DotLottie();

    dotlottie.addAnimation({
      id: manifest.animations[0]?.id as string,
      data: animationData as AnimationData,
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
      data: animationData as AnimationData,
    });

    const animation = await dotlottie.getAnimation(manifest.animations[0]?.id as string);

    expect(animation).toBeInstanceOf(LottieAnimation);

    expect(animation?.id).toBe(manifest.animations[0]?.id);
    expect(animation?.data).toEqual(animationData as AnimationData);
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
    // skip te st if running in browser environment
    if (typeof window !== 'undefined') return;

    const dotlottie = new DotLottie();

    await expectAsync(
      dotlottie
        .addAnimation({
          id: 'test_animation',
          data: animationData as AnimationData,
        })
        .download('file'),
    ).toBeRejectedWithError('[dotlottie-js]: Cannot download dotlottie in a non-browser environment');
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
        data: animationData as AnimationData,
      })
      .toBlob();

    expect(blob).toBeInstanceOf(Blob);

    const arrayBuffer = await blob.arrayBuffer();

    expect(arrayBuffer).toBeEqualDotlottieArrayBuffer(dotlottieAnimation);
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
        data: animationData as AnimationData,
      })
      .toArrayBuffer();

    expect(arrayBuffer).toBeInstanceOf(ArrayBuffer);
    expect(arrayBuffer).toBeEqualDotlottieArrayBuffer(dotlottieAnimation);
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
        data: animationData as AnimationData,
      })
      .toBase64();

    const actualArrayBuffer = Base64.toUint8Array(dataURL).buffer;

    expect(actualArrayBuffer).toBeEqualDotlottieArrayBuffer(dotlottieAnimation);
  });
});

describe('fromURL', () => {
  it('throws an error if the URL is invalid', async () => {
    const dotlottie = new DotLottie();

    await expectAsync(dotlottie.fromURL('invalid-url')).toBeRejectedWithError('[dotlottie-js]: Invalid URL');
  });

  it('loads a dotlottie file from a URL', async () => {
    const fetchSpy = spyOn(typeof window === 'undefined' ? global : window, 'fetch').and.returnValue(
      Promise.resolve(new Response(dotlottieAnimation)),
    );

    const animationURL = 'https://lottiefiles.fake/animation/animation.lottie';

    let dotlottie = new DotLottie();

    dotlottie = (await dotlottie.fromURL(animationURL)) as DotLottie;

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(animationURL);
    expect(dotlottie.animations.length).toBe(1);
    expect(dotlottie.animations[0]?.id).toEqual(manifest.animations[0]?.id as string);
    expect(dotlottie.animations[0]?.data).toEqual(animationData as AnimationData);
    expect(dotlottie.manifest).toEqual(manifest as Manifest);
  });
});

describe('fromArrayBuffer', () => {
  it('loads a dotlottie file from an array buffer', async () => {
    const arrayBuffer = dotlottieAnimation;
    let dotlottie = new DotLottie();

    dotlottie = (await dotlottie.fromArrayBuffer(arrayBuffer)) as DotLottie;

    expect(dotlottie.animations.length).toBe(1);
    expect(dotlottie.animations[0]?.id).toEqual(manifest.animations[0]?.id as string);
    expect(dotlottie.animations[0]?.data).toEqual(animationData as AnimationData);
    expect(dotlottie.manifest).toEqual(manifest as Manifest);
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
      data: animationData as AnimationData,
    });

    const dotlottie2 = new DotLottie().addAnimation({
      id: 'lottie2',
      data: animationData as AnimationData,
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
    expect(mergedDotlottie.animations[0]?.data).toEqual(animationData as AnimationData);

    expect(mergedDotlottie.animations[1]?.id).toEqual('lottie2');
    expect(mergedDotlottie.animations[1]?.data).toEqual(animationData as AnimationData);
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

    expect(dotlottie.animations[0]?.data).toEqual(animationData as AnimationData);

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
        data: animationData as AnimationData,
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
});
