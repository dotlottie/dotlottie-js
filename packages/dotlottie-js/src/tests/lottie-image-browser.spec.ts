/**
 * Copyright 2023 Design Barn Inc.
 */

import type { Animation as AnimationType } from '@lottie-animation-community/lottie-types';

import { DotLottie, LottieImage, getMimeTypeFromBase64 } from '..';

import BULL_DATA from './__fixtures__/image-asset-optimization/bull.json';
import IMAGE_ANIMATION_1_DATA from './__fixtures__/image-asset-optimization/image-animation-layer-1.json';
import IMAGE_ANIMATION_5_DATA from './__fixtures__/image-asset-optimization/image-animation-layer-2-3-4-5.json';
import IMAGE_ANIMATION_4_DATA from './__fixtures__/image-asset-optimization/image-animation-layer-2-3-4.json';
import IMAGE_ANIMATION_3_DATA from './__fixtures__/image-asset-optimization/image-animation-layer-2-3.json';
import IMAGE_ANIMATION_2_DATA from './__fixtures__/image-asset-optimization/image-animation-layer-2.json';
import DUPES_DATA from './__fixtures__/image-asset-optimization/lots-of-dupes.json';
import SIMPLE_IMAGE_ANIMATION from './__fixtures__/image-asset-optimization/simple-image-animation.json';
import AUDIO_TEST from './__fixtures__/mimetype-tests/mp-3-test.txt';
import SVG_XML_TEST from './__fixtures__/mimetype-tests/svg-xml-test.txt';
import VIDEO_DOTLOTTIE from './__fixtures__/simple/video-embedded.lottie';

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
          'image_0.png',
          'image_1.png',
          'image_2.png',
          'image_3.png',
          'image_4.png',
        ]);
        expect(uniqueImages.map((image) => image.id)).toEqual(['image_0', 'image_1', 'image_2', 'image_3', 'image_4']);
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
        expect(uniqueImages.map((image) => image.id)).toEqual(['image_0', 'image_1', 'image_2', 'image_3', 'image_4']);
        expect(uniqueImages.map((image) => image.fileName)).toEqual([
          'image_0.png',
          'image_1.png',
          'image_2.png',
          'image_3.png',
          'image_4.png',
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
          'image_0.jpeg',
          'image_1.jpeg',
          'image_3.png',
          'image_4.png',
          'image_1_1.png',
        ]);
        expect(uniqueImages.map((image) => image.id)).toEqual([
          'image_0',
          'image_1',
          'image_3',
          'image_4',
          'image_1_1',
        ]);
      });
  });

  it('getMimeTypeFromBase64 Properly detects mimetype of images.', async () => {
    const jpegFormat = getMimeTypeFromBase64(
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAZABkAAD/2wCEABQQEBkSGScXFycyJh8mMi4mJiYmLj41NTU1NT5EQUFBQUFBREREREREREREREREREREREREREREREREREREREQBFRkZIBwgJhgYJjYmICY2RDYrKzZERERCNUJERERERERERERERERERERERERERERERERERERERERERERERERERP/AABEIAAEAAQMBIgACEQEDEQH/xABMAAEBAAAAAAAAAAAAAAAAAAAABQEBAQAAAAAAAAAAAAAAAAAABQYQAQAAAAAAAAAAAAAAAAAAAAARAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AJQA9Yv/2Q==',
    );

    expect(jpegFormat).toEqual('image/jpeg');

    const pngFormat = getMimeTypeFromBase64(
      // eslint-disable-next-line no-secrets/no-secrets
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mP4z8AAAAMBAQD3A0FDAAAAAElFTkSuQmCC',
    );

    expect(pngFormat).toEqual('image/png');

    const gifFormat = getMimeTypeFromBase64('data:image/gif;base64,R0lGODdhAQABAPAAAP8AAAAAACwAAAAAAQABAAACAkQBADs=');

    expect(gifFormat).toEqual('image/gif');

    const bmpFormat = getMimeTypeFromBase64(
      'data:image/bmp;base64,Qk06AAAAAAAAADYAAAAoAAAAAQAAAAEAAAABABgAAAAAAAQAAADEDgAAxA4AAAAAAAAAAAAAAgD+AA==',
    );

    expect(bmpFormat).toEqual('image/bmp');

    const webpFormat = getMimeTypeFromBase64(
      // eslint-disable-next-line no-secrets/no-secrets
      'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoB+AAETAAA/vW4f/6aR40jxpHxcP/ugT90CfugT/3NoAAA',
    );

    expect(webpFormat).toEqual('image/webp');

    const svgFormat = getMimeTypeFromBase64(
      // eslint-disable-next-line no-secrets/no-secrets
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InJlZCIvPjwvc3ZnPg==',
    );

    expect(svgFormat).toEqual('image/svg+xml');

    const svgXmlFormat = getMimeTypeFromBase64(SVG_XML_TEST);

    expect(svgXmlFormat).toEqual('image/svg+xml');

    const mp3Format = getMimeTypeFromBase64(AUDIO_TEST);

    expect(mp3Format).toEqual('audio/mp3');
  });

  it('Throws an error when an unrecognized file mimetype is detected.', async () => {
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
