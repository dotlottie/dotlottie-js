/**
 * Copyright 2023 Design Barn Inc.
 */

import type { Animation as AnimationType } from '@lottiefiles/lottie-types';

import { DotLottie } from '../node';

// eslint-disable-next-line import/no-namespace
import * as BULL_DATA from './__fixtures__/image-asset-optimization/bull.json';
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
import * as DUPES_DATA from './__fixtures__/image-asset-optimization/lots-of-dupes.json';
// eslint-disable-next-line import/no-namespace
import * as SIMPLE_IMAGE_ANIMATION from './__fixtures__/image-asset-optimization/simple-image-animation.json';

describe('LottieImage', () => {
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
          'image_1.jpeg',
          'image_2.jpeg',
          'image_3.jpeg',
          'image_4.jpeg',
          'image_5.jpeg',
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
          'image_1.jpeg',
          'image_2.jpeg',
          'image_3.jpeg',
          'image_4.jpeg',
          'image_5.jpeg',
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
          'image_0.png',
          'image_1.png',
          'image_3.jpeg',
          'image_4.jpeg',
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
          'image_0.png',
          'image_1.png',
          'image_2.png',
          'image_3.jpeg',
          'image_4.jpeg',
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
          'image_1.png',
          'image_2.png',
          'image_4.jpeg',
          'image_5.jpeg',
          'image_9.jpeg',
        ]);
        expect(uniqueImages.map((image) => image.id)).toEqual(['image_1', 'image_2', 'image_4', 'image_5', 'image_9']);
      });
  });
});
