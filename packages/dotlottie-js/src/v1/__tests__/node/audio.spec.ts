/**
 * Copyright 2023 Design Barn Inc.
 */

/* eslint-disable @lottiefiles/import-filename-format */

import type { Animation as AnimationType, Asset } from '@lottie-animation-community/lottie-types';
import { describe, it, expect } from 'vitest';

import AUDIO_ANIMATION_1_DATA from '../../../__tests__/__fixtures__/audio/instruments_1.json';
import AUDIO_ANIMATION_2_DATA from '../../../__tests__/__fixtures__/audio/instruments_2.json';
import { isAudioAsset } from '../../../utils';
import { DotLottieV1, LottieAudioV1 } from '../../index.node';

describe('LottieAudioV1', () => {
  it('gets and sets the zipOptions', () => {
    const theme = new LottieAudioV1({
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

  it('Adds two instrument animations via data.', async () => {
    await new DotLottieV1()
      .addAnimation({
        id: 'animation_1',
        data: structuredClone(AUDIO_ANIMATION_1_DATA) as unknown as AnimationType,
      })
      .addAnimation({
        id: 'animation_2',
        data: structuredClone(AUDIO_ANIMATION_2_DATA) as unknown as AnimationType,
      })
      .build()
      .then(async (value: DotLottieV1) => {
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
    await new DotLottieV1()
      .addAnimation({
        id: 'animation_1',
        data: structuredClone(AUDIO_ANIMATION_1_DATA) as unknown as AnimationType,
      })
      .addAnimation({
        id: 'animation_2',
        data: structuredClone(AUDIO_ANIMATION_1_DATA) as unknown as AnimationType,
      })
      .build()
      .then(async (value: DotLottieV1) => {
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
