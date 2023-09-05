/**
 * Copyright 2023 Design Barn Inc.
 */

import type { Animation as AnimationType } from '@lottiefiles/lottie-types';

import { DotLottie, LottieAudio } from '..';

// eslint-disable-next-line @lottiefiles/import-filename-format
import AUDIO_ANIMATION_1_DATA from './__fixtures__/audio/instruments_1.json';
// eslint-disable-next-line @lottiefiles/import-filename-format
import AUDIO_ANIMATION_2_DATA from './__fixtures__/audio/instruments_2.json';

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
        expect(audio.map((aud) => aud.fileName)).toEqual([
          'audio_1.mpeg',
          'audio_2.mpeg',
          'audio_3.mpeg',
          'audio_4.mpeg',
          'audio_5.mpeg',
          'audio_6.mpeg',
        ]);
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
        expect(audio.map((aud) => aud.fileName)).toEqual([
          'audio_1.mpeg',
          'audio_2.mpeg',
          'audio_3.mpeg',
          'audio_4.mpeg',
          'audio_5.mpeg',
          'audio_6.mpeg',
        ]);
      });
  });
});
