/**
 * Copyright 2023 Design Barn Inc.
 */

/* eslint-disable no-new */
/* eslint-disable @lottiefiles/import-filename-format */

import type { Animation as AnimationType, Asset } from '@lottie-animation-community/lottie-types';
import { describe, it, expect } from 'vitest';

import audioDotLottie from '../../../__tests__/__fixtures__/audio/2_instrument_animations.lottie?arraybuffer';
import AUDIO_ANIMATION_1_DATA from '../../../__tests__/__fixtures__/audio/instruments_1.json';
import AUDIO_ANIMATION_2_DATA from '../../../__tests__/__fixtures__/audio/instruments_2.json';
import { isAudioAsset } from '../../../utils';
import { DotLottie, LottieAudio } from '../../index.node';

// Minimal ID3v2.3 header — enough for file-type to detect as mp3
const AUDIO_DATA = 'data:audio/mpeg;base64,SUQzAwAAAAAACg==';

describe('LottieAudio', () => {
  it('gets and sets the zipOptions', () => {
    const theme = new LottieAudio({
      id: 'audio_1',
      fileName: 'audio.mp3',
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

  it('throws an error if it receives an invalid id when constructed', () => {
    expect(() => {
      new LottieAudio({
        id: '',
        fileName: 'audio.mp3',
      });
    }).toThrow('Invalid audio id');
  });

  it('throws an error if it receives an invalid fileName when constructed', () => {
    expect(() => {
      new LottieAudio({
        id: 'audio_1',
        fileName: '',
      });
    }).toThrow('Invalid audio fileName');
  });

  it('gets and sets the id', () => {
    const audio = new LottieAudio({
      id: 'audio_1',
      fileName: 'audio.mp3',
    });

    expect(audio.id).toEqual('audio_1');

    audio.id = 'audio_2';

    expect(audio.id).toEqual('audio_2');
  });

  it('throws an error when setting an invalid id', () => {
    const audio = new LottieAudio({
      id: 'audio_1',
      fileName: 'audio.mp3',
    });

    expect(() => {
      audio.id = '';
    }).toThrow('Invalid audio id');
  });

  it('gets and sets the fileName', () => {
    const audio = new LottieAudio({
      id: 'audio_1',
      fileName: 'audio.mp3',
    });

    expect(audio.fileName).toEqual('audio.mp3');

    audio.fileName = 'newaudio.ogg';

    expect(audio.fileName).toEqual('newaudio.ogg');
  });

  it('throws an error when setting an invalid fileName', () => {
    const audio = new LottieAudio({
      id: 'audio_1',
      fileName: 'audio.mp3',
    });

    expect(() => {
      audio.fileName = '';
    }).toThrow('Invalid audio');
  });

  it('gets and sets the data', () => {
    const audio = new LottieAudio({
      id: 'audio_1',
      fileName: 'audio.mp3',
    });

    expect(audio.data).toBeUndefined();

    audio.data = AUDIO_DATA;

    expect(audio.data).toEqual(AUDIO_DATA);
  });

  it('throws an error when setting invalid data', () => {
    const audio = new LottieAudio({
      id: 'audio_1',
      fileName: 'audio.mp3',
      data: AUDIO_DATA,
    });

    expect(() => {
      audio.data = undefined;
    }).toThrow('Invalid data');
  });

  it('converts audio data to DataURL', async () => {
    const audio = new LottieAudio({
      id: 'audio_1',
      fileName: 'audio.mp3',
      data: AUDIO_DATA,
    });

    const dataUrl = await audio.toDataURL();

    expect(dataUrl).toEqual(AUDIO_DATA);
  });

  it('converts audio data to Blob', async () => {
    const audio = new LottieAudio({
      id: 'audio_1',
      fileName: 'audio.mp3',
      data: AUDIO_DATA,
    });

    const blob = await audio.toBlob();

    expect(blob).toBeInstanceOf(Blob);
  });

  it('converts audio data to ArrayBuffer', async () => {
    const audio = new LottieAudio({
      id: 'audio_1',
      fileName: 'audio.mp3',
      data: AUDIO_DATA,
    });

    const arrayBuffer = await audio.toArrayBuffer();

    expect(arrayBuffer).toBeInstanceOf(ArrayBuffer);
  });

  it('renames audio with proper extension detection', async () => {
    const audio = new LottieAudio({
      id: 'audio_1',
      fileName: 'audio.mp3',
      data: AUDIO_DATA,
    });

    await audio.renameAudio('newaudio');

    expect(audio.fileName).toMatch(/\.mp3$/u);
  });

  it('builds dotLottie with audio assets', async () => {
    await new DotLottie()
      .addAnimation({
        id: 'animation_1',
        data: structuredClone(AUDIO_ANIMATION_1_DATA) as unknown as AnimationType,
      })
      .build()
      .then(async (dotLottie: DotLottie) => {
        const arrayBuffer = await dotLottie.toArrayBuffer();

        expect(arrayBuffer).toBeInstanceOf(ArrayBuffer);
        expect(arrayBuffer.byteLength).toBeGreaterThan(0);

        const audio = dotLottie.getAudio();

        expect(audio.length).toBeGreaterThan(0);

        for (const track of audio) {
          expect(track.fileName).toBeDefined();
          expect(track.id).toBeDefined();
        }
      });
  });

  it('inlines audio assets from .lottie file when getAnimation called with inlineAssets option', async () => {
    let dotLottie = new DotLottie();

    dotLottie = await dotLottie.fromArrayBuffer(audioDotLottie as ArrayBuffer);

    expect(dotLottie.animations.length).toBeGreaterThan(0);

    const animationId = dotLottie.animations[0]?.id;

    expect(animationId).toBeDefined();

    const animation = await dotLottie.getAnimation(animationId as string, { inlineAssets: true });

    expect(animation).toBeDefined();

    const assets = animation?.data?.assets;

    expect(assets).toBeDefined();

    const audioAssets = (assets || []).filter((asset) => isAudioAsset(asset as Asset.Value));

    expect(audioAssets.length).toBeGreaterThan(0);

    for (const asset of audioAssets) {
      expect((asset as Asset.Sound).p).toMatch(/^data:/u);
      expect((asset as Asset.Sound).e).toBe(1);
      expect((asset as Asset.Sound).u).toBe('');
    }
  });

  it('inlines audio assets when animation toJSON called with inlineAssets option', async () => {
    let dotLottie = new DotLottie();

    dotLottie = await dotLottie.fromArrayBuffer(audioDotLottie as ArrayBuffer);

    expect(dotLottie.animations.length).toBeGreaterThan(0);

    const animation = dotLottie.animations[0];

    expect(animation).toBeDefined();

    const jsonData = await animation?.toJSON({ inlineAssets: true });

    const assets = jsonData?.assets;

    expect(assets).toBeDefined();

    const audioAssets = (assets || []).filter((asset) => isAudioAsset(asset as Asset.Value));

    expect(audioAssets.length).toBeGreaterThan(0);

    for (const asset of audioAssets) {
      expect((asset as Asset.Sound).p).toMatch(/^data:/u);
      expect((asset as Asset.Sound).e).toBe(1);
      expect((asset as Asset.Sound).u).toBe('');
    }
  });

  it('Adds two instrument animations via data.', async () => {
    await new DotLottie()
      .addAnimation({
        id: 'animation_1',
        data: structuredClone(AUDIO_ANIMATION_1_DATA) as unknown as AnimationType,
      })
      .addAnimation({
        id: 'animation_2',
        data: structuredClone(AUDIO_ANIMATION_2_DATA) as unknown as AnimationType,
      })
      .build()
      .then(async (value: DotLottie) => {
        const audio = value.getAudio();

        expect(audio.length).toBe(6);

        const expectedData: string[] = [];

        // eslint-disable-next-line array-callback-return
        structuredClone(AUDIO_ANIMATION_1_DATA).assets.map((asset): void => {
          if (isAudioAsset(asset as Asset.Value)) {
            expectedData.push(asset.p);
          }
        });

        // eslint-disable-next-line array-callback-return
        structuredClone(AUDIO_ANIMATION_2_DATA).assets.map((asset): void => {
          if (isAudioAsset(asset as Asset.Value)) {
            expectedData.push(asset.p);
          }
        });

        for (let i = 0; i < audio.length; i += 1) {
          expect(await audio[i]?.toDataURL()).toEqual(expectedData[i]);
        }
      });
  });

  it('Adds identical instrument animation twice via data.', async () => {
    await new DotLottie()
      .addAnimation({
        id: 'animation_1',
        data: structuredClone(AUDIO_ANIMATION_1_DATA) as unknown as AnimationType,
      })
      .addAnimation({
        id: 'animation_2',
        data: structuredClone(AUDIO_ANIMATION_1_DATA) as unknown as AnimationType,
      })
      .build()
      .then(async (value: DotLottie) => {
        const audio = value.getAudio();

        expect(audio.length).toBe(6);

        const expectedData: string[] = [];

        // eslint-disable-next-line array-callback-return
        structuredClone(AUDIO_ANIMATION_1_DATA).assets.map((asset): void => {
          if (isAudioAsset(asset as Asset.Value)) {
            expectedData.push(asset.p);
          }
        });

        for (let i = 0; i < audio.length; i += 1) {
          expect(await audio[i]?.toDataURL()).toEqual(expectedData[i % 3]);
        }
      });
  });
});
