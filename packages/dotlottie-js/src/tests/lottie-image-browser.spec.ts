/**
 * Copyright 2023 Design Barn Inc.
 */

import type { Animation as AnimationType } from '@lottiefiles/lottie-types';

import { DotLottie, LottieImage } from '..';

import BULL_DATA from './__fixtures__/image-asset-optimization/bull.json';
import IMAGE_ANIMATION_1_DATA from './__fixtures__/image-asset-optimization/image-animation-layer-1.json';
import IMAGE_ANIMATION_5_DATA from './__fixtures__/image-asset-optimization/image-animation-layer-2-3-4-5.json';
import IMAGE_ANIMATION_4_DATA from './__fixtures__/image-asset-optimization/image-animation-layer-2-3-4.json';
import IMAGE_ANIMATION_3_DATA from './__fixtures__/image-asset-optimization/image-animation-layer-2-3.json';
import IMAGE_ANIMATION_2_DATA from './__fixtures__/image-asset-optimization/image-animation-layer-2.json';
import DUPES_DATA from './__fixtures__/image-asset-optimization/lots-of-dupes.json';
import SIMPLE_IMAGE_ANIMATION from './__fixtures__/image-asset-optimization/simple-image-animation.json';
import SVG_IMAGE_DOTLOTTIE from './__fixtures__/simple/svg-image.lottie';
import VIDEO_DOTLOTTIE from './__fixtures__/simple/video-embedded.lottie';
import OPTIMIZED_DOTLOTTIE from './__fixtures__/simple/webp-optimized.lottie';

describe('LottieImage', () => {
  it('gets and sets the zipOptions', () => {
    const theme = new LottieImage({
      id: 'image_1',
      fileName: 'image_1.png',
      zipOptions: {
        level: 9,
        mem: 1,
      },
    });

    expect(theme.zipOptions).toEqual({
      level: 9,
      mem: 1,
    });

    theme.zipOptions = {
      level: 1,
    };

    expect(theme.zipOptions).toEqual({
      level: 1,
    });
  });

  it('Adds two bull animations via data.', async () => {
    await new DotLottie({ enableDuplicateImageOptimization: true })
      .addAnimation({
        id: 'animation_1',
        data: structuredClone(BULL_DATA) as unknown as AnimationType,
      })
      .addAnimation({
        id: 'animation_2',
        data: structuredClone(BULL_DATA) as unknown as AnimationType,
      })
      .build()
      .then(async (value: DotLottie) => {
        const images = value.getImages();

        // filter out unique images
        const uniqueImages = images.filter(
          (image, index, self) => self.findIndex((compareImage) => compareImage.fileName === image.fileName) === index,
        );

        expect(uniqueImages.length).toBe(5);
        expect(uniqueImages.map((image) => image.fileName)).toEqual([
          'image_1.png',
          'image_2.png',
          'image_3.png',
          'image_4.png',
          'image_5.png',
        ]);
        expect(uniqueImages.map((image) => image.id)).toEqual(['image_1', 'image_2', 'image_3', 'image_4', 'image_5']);
      });
  });

  it('Disables image duplicate detection.', async () => {
    await new DotLottie()
      .addAnimation({
        id: 'animation_1',
        data: structuredClone(BULL_DATA) as unknown as AnimationType,
      })
      .addAnimation({
        id: 'animation_2',
        data: structuredClone(BULL_DATA) as unknown as AnimationType,
      })
      .build()
      .then(async (value: DotLottie) => {
        expect(value.getImages().length).toBe(10);
      });
  });

  it('Adds two bull animations, one via data the other via URL.', async () => {
    await new DotLottie({ enableDuplicateImageOptimization: true })
      .addAnimation({
        id: 'animation_1',
        data: structuredClone(BULL_DATA) as unknown as AnimationType,
      })
      .addAnimation({
        id: 'animation_2',
        data: structuredClone(BULL_DATA) as unknown as AnimationType,
      })
      .build()
      .then(async (value: DotLottie) => {
        const images = value.getImages();

        // filter out unique images
        const uniqueImages = images.filter(
          (image, index, self) => self.findIndex((compareImage) => compareImage.fileName === image.fileName) === index,
        );

        expect(uniqueImages.length).toBe(5);
        expect(uniqueImages.map((image) => image.id)).toEqual(['image_1', 'image_2', 'image_3', 'image_4', 'image_5']);
        expect(uniqueImages.map((image) => image.fileName)).toEqual([
          'image_1.png',
          'image_2.png',
          'image_3.png',
          'image_4.png',
          'image_5.png',
        ]);
      });
  });

  it('Adds an animation with lots of duplicate images.', async () => {
    await new DotLottie({ enableDuplicateImageOptimization: true })
      .addAnimation({
        id: 'animation_1',
        data: structuredClone(DUPES_DATA) as unknown as AnimationType,
      })
      .build()
      .then(async (value: DotLottie) => {
        const images = value.getImages();

        // filter out unique images
        const uniqueImages = images.filter(
          (image, index, self) => self.findIndex((compareImage) => compareImage.fileName === image.fileName) === index,
        );

        expect(uniqueImages.length).toBe(4);

        expect(uniqueImages.map((image) => image.fileName)).toEqual([
          'image_0.jpeg',
          'image_1.jpeg',
          'image_3.png',
          'image_4.png',
        ]);
        expect(uniqueImages.map((image) => image.id)).toEqual(['image_0', 'image_1', 'image_3', 'image_4']);
      });
  });

  it('Adds an animation with lots of duplicate images but disables image duplicate detection.', async () => {
    await new DotLottie({ enableDuplicateImageOptimization: false })
      .addAnimation({
        id: 'animation_1',
        data: structuredClone(DUPES_DATA) as unknown as AnimationType,
      })
      .build()
      .then(async (value: DotLottie) => {
        const images = value.getImages();

        // filter out unique images
        const uniqueImages = images.filter(
          (image, index, self) => self.findIndex((compareImage) => compareImage.fileName === image.fileName) === index,
        );

        expect(uniqueImages.length).toBe(5);

        expect(uniqueImages.map((image) => image.fileName)).toEqual([
          'image_0.jpeg',
          'image_1.jpeg',
          'image_2.jpeg',
          'image_3.png',
          'image_4.png',
        ]);
        expect(uniqueImages.map((image) => image.id)).toEqual(['image_0', 'image_1', 'image_2', 'image_3', 'image_4']);
      });
  });

  it('Adds multiple variants of an animation with duplicate images.', async () => {
    await new DotLottie({ enableDuplicateImageOptimization: true })
      .addAnimation({
        id: 'animation_0',
        data: structuredClone(SIMPLE_IMAGE_ANIMATION) as unknown as AnimationType,
      })
      .addAnimation({
        id: 'animation_1',
        data: structuredClone(IMAGE_ANIMATION_1_DATA) as unknown as AnimationType,
      })
      .addAnimation({
        id: 'animation_2',
        data: structuredClone(IMAGE_ANIMATION_2_DATA) as unknown as AnimationType,
      })
      .addAnimation({
        id: 'animation_3',
        data: structuredClone(IMAGE_ANIMATION_3_DATA) as unknown as AnimationType,
      })
      .addAnimation({
        id: 'animation_4',
        data: structuredClone(IMAGE_ANIMATION_4_DATA) as unknown as AnimationType,
      })
      .addAnimation({
        id: 'animation_5',
        data: structuredClone(IMAGE_ANIMATION_5_DATA) as unknown as AnimationType,
      })
      .build()
      .then(async (value: DotLottie) => {
        const images = value.getImages();

        // filter out unique images
        const uniqueImages = images.filter(
          (image, index, self) => self.findIndex((compareImage) => compareImage.fileName === image.fileName) === index,
        );

        expect(uniqueImages.length).toBe(5);

        expect(uniqueImages.map((image) => image.fileName)).toEqual([
          'image_1.jpeg',
          'image_2.jpeg',
          'image_4.png',
          'image_5.png',
          'image_9.png',
        ]);
        expect(uniqueImages.map((image) => image.id)).toEqual(['image_1', 'image_2', 'image_4', 'image_5', 'image_9']);
      });
  });

  it('Properly detects mimetype of images.', async () => {
    let dotlottie = new DotLottie();

    dotlottie = await dotlottie.fromArrayBuffer(OPTIMIZED_DOTLOTTIE);

    const animations = dotlottie.getAnimations();

    if (animations) {
      animations.map(async (animation) => {
        const anim = await animation[1].toJSON({
          inlineAssets: true,
        });

        expect(JSON.stringify(anim).includes('image/webp'));
        expect(!JSON.stringify(anim).includes('image/png'));
        expect(!JSON.stringify(anim).includes('image/jpeg'));
      });
    }

    let bullWithSvg = new DotLottie();

    bullWithSvg = await bullWithSvg.fromArrayBuffer(SVG_IMAGE_DOTLOTTIE);

    const bullAnimations = bullWithSvg.getAnimations();

    if (bullAnimations) {
      bullAnimations.map(async (animation) => {
        const anim = await animation[1].toJSON({
          inlineAssets: true,
        });

        expect(JSON.stringify(anim).includes('image/webp'));
        expect(JSON.stringify(anim).includes('image/svg'));
        expect(!JSON.stringify(anim).includes('image/png'));
        expect(!JSON.stringify(anim).includes('image/jpeg'));
      });
    }

    try {
      let videoDotLottie = new DotLottie();

      videoDotLottie = await videoDotLottie.fromArrayBuffer(VIDEO_DOTLOTTIE);

      const videoAnimation = videoDotLottie.getAnimations();

      if (videoAnimation) {
        videoAnimation.map(async (animation) => {
          await animation[1].toJSON({
            inlineAssets: true,
          });
        });
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
