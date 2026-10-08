/**
 * Copyright 2023 Design Barn Inc.
 */

/* eslint-disable no-new */
/* eslint-disable @lottiefiles/import-filename-format */

import type { Animation as AnimationType, Asset } from '@lottie-animation-community/lottie-types';
import { unzipSync } from 'fflate';
import { describe, it, expect } from 'vitest';

import AUDIO_ANIMATION_1_DATA from '../../../__tests__/__fixtures__/audio/instruments_1.json';
import AUDIO_ANIMATION_2_DATA from '../../../__tests__/__fixtures__/audio/instruments_2.json';
import { isAudioAsset } from '../../../utils';
import { DotLottie, LottieAudio } from '../../index.browser';

// Minimal ID3v2.3 header — enough for file-type to detect as mp3
const AUDIO_DATA = 'data:audio/mpeg;base64,SUQzAwAAAAAACg==';
const AUDIO_BYTES = [73, 68, 51, 3, 0, 0, 0, 0, 0, 10];

function animationDataWithAudio(assets: Asset.Sound[]): AnimationType {
  const animation = structuredClone(AUDIO_ANIMATION_1_DATA) as unknown as AnimationType;

  animation.assets = assets;

  return animation;
}

describe('LottieAudio', () => {
  // v1 has no audio, so these fixtures can only be exercised through a v2 file.
  async function buildV2WithAudio(): Promise<ArrayBuffer> {
    const built = new DotLottie().addAnimation({
      id: 'animation_1',
      data: structuredClone(AUDIO_ANIMATION_1_DATA) as unknown as AnimationType,
    });

    await built.build();

    return built.toArrayBuffer();
  }
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

  it('gets and sets the parentAnimations', () => {
    const audio = new LottieAudio({
      id: 'audio_1',
      fileName: 'audio.mp3',
    });

    expect(audio.parentAnimations).toEqual([]);
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

  it.each([
    'audio,track',
    'data:track',
    'data:audio,track',
    'data:audio;base64,track',
    'data:audio/mpeg;base64,track',
    'folder/track',
  ])('keeps audio id %s stable across repeated serialization and archive reload', async (id) => {
    const dotLottie = new DotLottie().addAnimation({
      id: 'animation_1',
      data: animationDataWithAudio([{ id, u: '', p: AUDIO_DATA, e: 1 }]),
    });

    await dotLottie.build();

    const animation = dotLottie.animations[0];

    if (!animation) throw new Error('Expected animation_1 to exist');

    const firstBuffer = await dotLottie.toArrayBuffer();

    await animation.toJSON();
    await dotLottie.build();

    const secondBuffer = await dotLottie.toArrayBuffer();
    const json = await animation.toJSON();

    for (const buffer of [firstBuffer, secondBuffer]) {
      const contents = unzipSync(new Uint8Array(buffer));

      expect(Object.keys(contents).filter((path) => path.startsWith('u/'))).toEqual([`u/${id}.mp3`]);
      expect(Array.from(contents[`u/${id}.mp3`] ?? [])).toEqual(AUDIO_BYTES);
    }

    expect(dotLottie.getAudio().map((audio) => audio.fileName)).toEqual([`${id}.mp3`]);
    expect(json.assets?.find(isAudioAsset)).toMatchObject({
      id,
      u: '/u/',
      p: `${id}.mp3`,
      e: 0,
    });

    const loaded = await new DotLottie().fromArrayBuffer(secondBuffer);

    await loaded.build();

    const loadedContents = unzipSync(new Uint8Array(await loaded.toArrayBuffer()));

    expect(loaded.getAudio().map((audio) => audio.fileName)).toEqual([`${id}.mp3`]);
    expect(Object.keys(loadedContents).filter((path) => path.startsWith('u/'))).toEqual([`u/${id}.mp3`]);
    expect(Array.from(loadedContents[`u/${id}.mp3`] ?? [])).toEqual(AUDIO_BYTES);

    const loadedAnimation = loaded.animations[0];

    if (!loadedAnimation) throw new Error('Expected animation_1 after reload');

    expect((await loadedAnimation.toJSON()).assets?.find(isAudioAsset)).toMatchObject({
      id,
      u: '/u/',
      p: `${id}.mp3`,
      e: 0,
    });
  });

  it.each(['Audio/MPEG', 'application/octet-stream', '', 'application/octet-stream;charset=binary', 'text/plain'])(
    'extracts audio bytes with the MIME header %s across repeated serialization',
    async (mediaType) => {
      const dotLottie = new DotLottie().addAnimation({
        id: 'animation_1',
        data: animationDataWithAudio([
          { id: 'audio,track', u: '', p: `data:${mediaType};base64,SUQzAwAAAAAACg==`, e: 1 },
        ]),
      });

      for (let run = 0; run < 2; run += 1) {
        await dotLottie.build();

        const contents = unzipSync(new Uint8Array(await dotLottie.toArrayBuffer()));

        expect(dotLottie.getAudio().map((audio) => audio.fileName)).toEqual(['audio,track.mp3']);
        expect(Object.keys(contents).filter((path) => path.startsWith('u/'))).toEqual(['u/audio,track.mp3']);
        expect(Array.from(contents['u/audio,track.mp3'] ?? [])).toEqual(AUDIO_BYTES);
      }

      const animation = dotLottie.animations[0];

      if (!animation) throw new Error('Expected animation_1 to exist');

      expect((await animation.toJSON()).assets?.find(isAudioAsset)).toMatchObject({
        id: 'audio,track',
        u: '/u/',
        p: 'audio,track.mp3',
        e: 0,
      });
    },
  );

  it('extracts a fresh data URL with e:0 and does not mistake its packaged filename for data', async () => {
    const id = 'data:audio,track';
    const dotLottie = new DotLottie().addAnimation({
      id: 'animation_1',
      data: animationDataWithAudio([{ id, u: '', p: AUDIO_DATA, e: 0 }]),
    });

    for (let run = 0; run < 2; run += 1) {
      await dotLottie.build();

      const contents = unzipSync(new Uint8Array(await dotLottie.toArrayBuffer()));

      expect(dotLottie.getAudio().map((audio) => audio.fileName)).toEqual([`${id}.mp3`]);
      expect(Object.keys(contents).filter((path) => path.startsWith('u/'))).toEqual([`u/${id}.mp3`]);
      expect(Array.from(contents[`u/${id}.mp3`] ?? [])).toEqual(AUDIO_BYTES);
    }
  });

  it.each(['', '/u/'])(
    'extracts fresh inline audio with u:%s even when its data URL matches a cached filename',
    async (u) => {
      const dotLottie = new DotLottie().addAnimation({
        id: 'animation_1',
        data: animationDataWithAudio([{ id: 'fresh', u, p: AUDIO_DATA, e: 0 }]),
      });
      const animation = dotLottie.animations[0];

      if (!animation) throw new Error('Expected animation_1 to exist');

      animation.audioAssets.push(
        new LottieAudio({ id: 'cached', fileName: AUDIO_DATA, data: 'data:audio/mpeg;base64,SUQzAwAAAAAACw==' }),
      );

      await dotLottie.build();

      expect((await animation.toJSON()).assets?.find(isAudioAsset)).toMatchObject({
        id: 'fresh',
        u: '/u/',
        p: 'fresh.mp3',
        e: 0,
      });

      const contents = unzipSync(new Uint8Array(await dotLottie.toArrayBuffer()));

      expect(Array.from(contents['u/fresh.mp3'] ?? [])).toEqual(AUDIO_BYTES);
    },
  );

  it('extracts embedded audio after an externalized audio asset', async () => {
    const dotLottie = await new DotLottie()
      .addAnimation({
        id: 'animation_1',
        data: animationDataWithAudio([
          { id: 'external_audio', u: '/u/', p: 'external_audio.mp3', e: 0 },
          { id: 'embedded_audio', u: '', p: AUDIO_DATA, e: 1 },
        ]),
      })
      .build();

    const buffer = await dotLottie.toArrayBuffer();
    const contents = unzipSync(new Uint8Array(buffer));

    expect(dotLottie.getAudio().map((audio) => audio.fileName)).toEqual(['embedded_audio.mp3']);
    expect(Object.keys(contents).filter((path) => path.startsWith('u/'))).toEqual(['u/embedded_audio.mp3']);
    expect(Array.from(contents['u/embedded_audio.mp3'] ?? [])).toEqual(AUDIO_BYTES);
  });

  it.each([
    ['missing payload', 'data:audio/mpeg'],
    ['empty payload', 'data:audio/mpeg;base64,'],
  ])('leaves malformed audio (%s) inline and extracts the following valid audio', async (_case, malformedData) => {
    const dotLottie = await new DotLottie()
      .addAnimation({
        id: 'animation_1',
        data: animationDataWithAudio([
          { id: 'malformed_audio', u: '', p: malformedData, e: 1 },
          { id: 'embedded_audio', u: '', p: AUDIO_DATA, e: 1 },
        ]),
      })
      .build();

    const animation = dotLottie.animations[0];

    if (!animation) throw new Error('Expected animation_1 to exist');

    const contents = unzipSync(new Uint8Array(await dotLottie.toArrayBuffer()));

    expect((await animation.toJSON()).assets?.find((asset) => asset.id === 'malformed_audio')).toMatchObject({
      id: 'malformed_audio',
      u: '',
      p: malformedData,
      e: 1,
    });
    expect(Object.keys(contents).filter((path) => path.startsWith('u/'))).toEqual(['u/embedded_audio.mp3']);
    expect(Array.from(contents['u/embedded_audio.mp3'] ?? [])).toEqual(AUDIO_BYTES);
  });

  it('writes audio under u/ and inlines it when getAnimation is called with inlineAssets', async () => {
    const buffer = await buildV2WithAudio();

    expect(Object.keys(unzipSync(new Uint8Array(buffer))).some((key) => key.startsWith('u/'))).toBe(true);

    let dotLottie = new DotLottie();

    dotLottie = await dotLottie.fromArrayBuffer(buffer);

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

    dotLottie = await dotLottie.fromArrayBuffer(await buildV2WithAudio());

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
