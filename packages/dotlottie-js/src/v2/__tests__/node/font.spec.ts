/**
 * Copyright 2025 Design Barn Inc.
 */

/* eslint-disable no-new */

import type { Animation as AnimationType } from '@lottie-animation-community/lottie-types';
import { describe, it, expect } from 'vitest';

import TEXT_ANIMATION_DATA from '../../../__tests__/__fixtures__/text.json';
import textDotLottie from '../../../__tests__/__fixtures__/text.lottie?arraybuffer';
import { DotLottie, LottieFont } from '../../index.browser';

describe('LottieFont', () => {
  it('gets and sets the zipOptions', () => {
    const font = new LottieFont({
      id: 'font_1',
      fileName: 'font.ttf',
      zipOptions: {
        level: 9,
        mem: 1,
      },
    });

    expect(font.zipOptions).toEqual({
      level: 9,
      mem: 1,
    });

    font.zipOptions = {
      level: 1,
    };

    expect(font.zipOptions).toEqual({
      level: 1,
    });
  });

  it('throws an error if it receives an invalid id when constructed', () => {
    expect(() => {
      new LottieFont({
        id: '',
        fileName: 'font.ttf',
      });
    }).toThrow('Invalid font id');
  });

  it('throws an error if it receives an invalid fileName when constructed', () => {
    expect(() => {
      new LottieFont({
        id: 'font_1',
        fileName: '',
      });
    }).toThrow('Invalid font fileName');
  });

  it('gets and sets the id', () => {
    const font = new LottieFont({
      id: 'font_1',
      fileName: 'font.ttf',
    });

    expect(font.id).toEqual('font_1');

    font.id = 'font_2';

    expect(font.id).toEqual('font_2');
  });

  it('throws an error when setting an invalid id', () => {
    const font = new LottieFont({
      id: 'font_1',
      fileName: 'font.ttf',
    });

    expect(() => {
      font.id = '';
    }).toThrow('Invalid font id');
  });

  it('gets and sets the fileName', () => {
    const font = new LottieFont({
      id: 'font_1',
      fileName: 'font.ttf',
    });

    expect(font.fileName).toEqual('font.ttf');

    font.fileName = 'newfont.otf';

    expect(font.fileName).toEqual('newfont.otf');
  });

  it('throws an error when setting an invalid fileName', () => {
    const font = new LottieFont({
      id: 'font_1',
      fileName: 'font.ttf',
    });

    expect(() => {
      font.fileName = '';
    }).toThrow('Invalid font fileName');
  });

  it('gets and sets the data', () => {
    const fontData = 'data:font/ttf;base64,AAEAAAASAQAABAAgR1BPU3m8P9g=';

    const font = new LottieFont({
      id: 'font_1',
      fileName: 'font.ttf',
    });

    expect(font.data).toBeUndefined();

    font.data = fontData;

    expect(font.data).toEqual(fontData);
  });

  it('throws an error when setting invalid data', () => {
    const font = new LottieFont({
      id: 'font_1',
      fileName: 'font.ttf',
      data: 'data:font/ttf;base64,AAEAAAASAQAABAAgR1BPU3m8P9g=',
    });

    expect(() => {
      font.data = undefined;
    }).toThrow('Invalid data');
  });

  it('gets and sets the parentAnimations', () => {
    const font = new LottieFont({
      id: 'font_1',
      fileName: 'font.ttf',
    });

    expect(font.parentAnimations).toEqual([]);
  });

  it('converts font data to DataURL', async () => {
    const fontData = 'data:font/ttf;base64,AAEAAAASAQAABAAgR1BPU3m8P9g=';

    const font = new LottieFont({
      id: 'font_1',
      fileName: 'font.ttf',
      data: fontData,
    });

    const dataUrl = await font.toDataURL();

    expect(dataUrl).toEqual(fontData);
  });

  it('converts font data to Blob', async () => {
    const fontData = 'data:font/ttf;base64,AAEAAAASAQAABAAgR1BPU3m8P9g=';

    const font = new LottieFont({
      id: 'font_1',
      fileName: 'font.ttf',
      data: fontData,
    });

    const blob = await font.toBlob();

    expect(blob).toBeInstanceOf(Blob);
  });

  it('converts font data to ArrayBuffer', async () => {
    const fontData = 'data:font/ttf;base64,AAEAAAASAQAABAAgR1BPU3m8P9g=';

    const font = new LottieFont({
      id: 'font_1',
      fileName: 'font.ttf',
      data: fontData,
    });

    const arrayBuffer = await font.toArrayBuffer();

    expect(arrayBuffer).toBeInstanceOf(ArrayBuffer);
  });

  it('renames font with proper extension detection', async () => {
    const fontData = 'data:font/ttf;base64,AAEAAAASAQAABAAgR1BPU3m8P9g=';

    const font = new LottieFont({
      id: 'font_1',
      fileName: 'font.ttf',
      data: fontData,
    });

    await font.renameFont('newfont');

    expect(font.fileName).toEqual('newfont.ttf');
  });

  it('extracts fonts from animation with text', async () => {
    await new DotLottie()
      .addAnimation({
        id: 'text_animation',
        data: structuredClone(TEXT_ANIMATION_DATA) as unknown as AnimationType,
      })
      .build()
      .then(async (dotLottie: DotLottie) => {
        const fonts = dotLottie.getFonts();

        expect(fonts.length).toBeGreaterThanOrEqual(1);

        for (const font of fonts) {
          expect(font.id).toBeDefined();
          expect(font.fileName).toBeDefined();
        }
      });
  });

  it('handles animation with multiple font assets', async () => {
    const dotLottie = new DotLottie();

    dotLottie.addAnimation({
      id: 'text_animation_1',
      data: structuredClone(TEXT_ANIMATION_DATA) as unknown as AnimationType,
    });

    dotLottie.addAnimation({
      id: 'text_animation_2',
      data: structuredClone(TEXT_ANIMATION_DATA) as unknown as AnimationType,
    });

    await dotLottie.build();

    const fonts = dotLottie.getFonts();

    expect(fonts.length).toBeGreaterThanOrEqual(2);
  });

  it('builds dotLottie with font assets', async () => {
    await new DotLottie()
      .addAnimation({
        id: 'text_animation',
        data: structuredClone(TEXT_ANIMATION_DATA) as unknown as AnimationType,
      })
      .build()
      .then(async (dotLottie: DotLottie) => {
        const arrayBuffer = await dotLottie.toArrayBuffer();

        expect(arrayBuffer).toBeInstanceOf(ArrayBuffer);
        expect(arrayBuffer.byteLength).toBeGreaterThan(0);

        const fonts = dotLottie.getFonts();

        expect(fonts.length).toBe(2);

        expect(fonts[0]?.fileName).toBe('Ubuntu Light Italic.ttf');
        expect(fonts[1]?.fileName).toBe('cartoon.ttf');
      });
  });

  it('inlines font assets from .lottie file when getAnimation called with inlineAssets option', async () => {
    let dotLottie = new DotLottie();

    dotLottie = await dotLottie.fromArrayBuffer(textDotLottie as ArrayBuffer);

    expect(dotLottie.animations.length).toBeGreaterThan(0);

    const animationId = dotLottie.animations[0]?.id;

    expect(animationId).toBeDefined();

    const animation = await dotLottie.getAnimation(animationId as string, { inlineAssets: true });

    expect(animation).toBeDefined();

    const fontsList = animation?.data?.fonts?.list;

    expect(fontsList).toBeDefined();
    expect(fontsList?.length).toBeGreaterThan(0);

    for (const fontDef of fontsList || []) {
      if (fontDef.fPath) {
        expect(fontDef.fPath).toMatch(/^data:/u);
        expect(fontDef.origin).toBe(3);
      }
    }
  });

  it('inlines font assets when animation toJSON called with inlineAssets option', async () => {
    let dotLottie = new DotLottie();

    dotLottie = await dotLottie.fromArrayBuffer(textDotLottie as ArrayBuffer);

    expect(dotLottie.animations.length).toBeGreaterThan(0);

    const animation = dotLottie.animations[0];

    expect(animation).toBeDefined();

    const jsonData = await animation?.toJSON({ inlineAssets: true });

    const fontsList = jsonData?.fonts?.list;

    expect(fontsList).toBeDefined();
    expect(fontsList?.length).toBeGreaterThan(0);

    for (const fontDef of fontsList || []) {
      if (fontDef.fPath) {
        expect(fontDef.fPath).toMatch(/^data:/u);
        expect(fontDef.origin).toBe(3);
      }
    }
  });
});
