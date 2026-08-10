/**
 * Copyright 2025 Design Barn Inc.
 */

/* eslint-disable no-new */
/* eslint-disable @lottiefiles/import-filename-format */

import type { Animation as AnimationType, Asset } from '@lottie-animation-community/lottie-types';
import { strFromU8, unzip } from 'fflate';
import { describe, it, expect } from 'vitest';

import VIDEO_ANIMATION_DATA from '../../../__tests__/__fixtures__/video/video_animation.json';
import { getAllVideos, getAnimations, getVideo, isImageAsset, isVideoAsset, isVideoDataUrl } from '../../../utils';
import { DotLottie, LottieVideo } from '../../index.node';

// Minimal `ftyp` box — enough for file-type to detect it as video/mp4
// eslint-disable-next-line no-secrets/no-secrets
const VIDEO_DATA = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDE=';

async function unzipToRecord(arrayBuffer: ArrayBuffer): Promise<Record<string, Uint8Array>> {
  return new Promise((resolve, reject) => {
    unzip(new Uint8Array(arrayBuffer), (err, data) => {
      if (err) reject(err);
      else resolve(data as Record<string, Uint8Array>);
    });
  });
}

function animationData(): AnimationType {
  return structuredClone(VIDEO_ANIMATION_DATA) as unknown as AnimationType;
}

describe('LottieVideo', () => {
  it('gets and sets the zipOptions', () => {
    const video = new LottieVideo({
      id: 'video_1',
      fileName: 'video.mp4',
      zipOptions: {
        level: 9,
        mem: 1,
      },
    });

    expect(video.zipOptions).toEqual({
      level: 9,
      mem: 1,
    });

    video.zipOptions = {
      level: 1,
    };

    expect(video.zipOptions).toEqual({
      level: 1,
    });
  });

  it('throws an error if it receives an invalid id when constructed', () => {
    expect(() => {
      new LottieVideo({
        id: '',
        fileName: 'video.mp4',
      });
    }).toThrow('Invalid video id');
  });

  it('throws an error if it receives an invalid fileName when constructed', () => {
    expect(() => {
      new LottieVideo({
        id: 'video_1',
        fileName: '',
      });
    }).toThrow('Invalid video fileName');
  });

  it('gets and sets the id', () => {
    const video = new LottieVideo({
      id: 'video_1',
      fileName: 'video.mp4',
    });

    expect(video.id).toEqual('video_1');

    video.id = 'video_2';

    expect(video.id).toEqual('video_2');
  });

  it('defaults the lottieAssetId to the id', () => {
    const video = new LottieVideo({
      id: 'video_1',
      fileName: 'video.mp4',
    });

    expect(video.lottieAssetId).toEqual('video_1');
  });

  it('gets and sets the data', () => {
    const video = new LottieVideo({
      id: 'video_1',
      fileName: 'video.mp4',
    });

    expect(video.data).toBeUndefined();

    video.data = VIDEO_DATA;

    expect(video.data).toEqual(VIDEO_DATA);
  });

  it('converts video data to DataURL', async () => {
    const video = new LottieVideo({
      id: 'video_1',
      fileName: 'video.mp4',
      data: VIDEO_DATA,
    });

    expect(await video.toDataURL()).toEqual(VIDEO_DATA);
  });

  it('converts video data to an ArrayBuffer holding the decoded bytes', async () => {
    const video = new LottieVideo({
      id: 'video_1',
      fileName: 'video.mp4',
      data: VIDEO_DATA,
    });

    const arrayBuffer = await video.toArrayBuffer();

    expect(arrayBuffer).toBeInstanceOf(ArrayBuffer);

    // `ftyp` box: the payload must be the decoded bytes, not the base64 text
    expect(Buffer.from(arrayBuffer).subarray(4, 8).toString('ascii')).toEqual('ftyp');
  });

  it('renames video with proper extension detection', async () => {
    const video = new LottieVideo({
      id: 'video_1',
      fileName: 'video.mp4',
      data: VIDEO_DATA,
    });

    await video.renameVideo('newvideo');

    expect(video.id).toEqual('newvideo');
    expect(video.fileName).toEqual('newvideo.mp4');
  });
});

describe('video asset detection', () => {
  it('detects an inlined video asset and excludes it from the image assets', () => {
    const asset = { id: 'video_0', w: 512, h: 512, u: '', e: 1, p: VIDEO_DATA } as unknown as Asset.Value;

    expect(isVideoAsset(asset)).toBe(true);
    expect(isImageAsset(asset)).toBe(false);
  });

  it('detects a packaged video asset', () => {
    const asset = { id: 'video_0', w: 512, h: 512, u: '/v/', e: 0, p: 'video_0.mp4' } as unknown as Asset.Value;

    expect(isVideoAsset(asset)).toBe(true);
    expect(isImageAsset(asset)).toBe(false);
  });

  it('leaves image assets alone', () => {
    const asset = { id: 'image_0', w: 1, h: 1, u: '/i/', e: 0, p: 'image_0.png' } as unknown as Asset.Value;

    expect(isVideoAsset(asset)).toBe(false);
    expect(isImageAsset(asset)).toBe(true);
  });

  it('treats a video packaged under i/ by an older release as an image', () => {
    // Before video support, a video asset was mistaken for an image and packaged under `i/`.
    // Such a bundle must keep round-tripping through the image path rather than falling between
    // the two — ThorVG itself only recognizes a video by its `data:video/` prefix, never by extension.
    const asset = { id: 'image_0', w: 512, h: 512, u: '/i/', e: 0, p: 'image_0.mp4' } as unknown as Asset.Value;

    expect(isVideoAsset(asset)).toBe(false);
    expect(isImageAsset(asset)).toBe(true);
  });

  it('detects video data URIs', () => {
    expect(isVideoDataUrl(VIDEO_DATA)).toBe(true);
    expect(isVideoDataUrl('data:image/png;base64,iVBORw0KGgo=')).toBe(false);
  });
});

describe('DotLottie with video assets', () => {
  it('packages video assets under v/ and leaves images under i/', async () => {
    const dotLottie = await new DotLottie().addAnimation({ id: 'animation_1', data: animationData() }).build();

    const arrayBuffer = await dotLottie.toArrayBuffer();
    const contents = await unzipToRecord(arrayBuffer);

    expect(Object.keys(contents)).toContain('v/video_0.mp4');
    expect(Object.keys(contents)).toContain('i/image_0.png');

    // The packaged file must hold the decoded video bytes
    expect(Buffer.from(contents['v/video_0.mp4'] as Uint8Array).subarray(4, 8).toString('ascii')).toEqual('ftyp');

    const videos = dotLottie.getVideos();

    expect(videos.length).toBe(1);
    expect(videos[0]?.fileName).toEqual('video_0.mp4');
    expect(videos[0]?.lottieAssetId).toEqual('video_0');

    // The video must not have been picked up as an image
    expect(dotLottie.getImages().length).toBe(1);
    expect(dotLottie.getImages()[0]?.fileName).toEqual('image_0.png');
  });

  it('points the video asset at the v/ folder inside the animation', async () => {
    const dotLottie = await new DotLottie().addAnimation({ id: 'animation_1', data: animationData() }).build();

    const animation = await dotLottie.getAnimation('animation_1');
    const asset = animation?.data?.assets?.find((value) => value.id === 'video_0') as Asset.Image;

    expect(asset.p).toEqual('video_0.mp4');
    expect(asset.u).toEqual('/v/');
    expect(asset.e).toBe(0);
  });

  it('does not re-extract the video on a second toJSON call', async () => {
    const dotLottie = await new DotLottie().addAnimation({ id: 'animation_1', data: animationData() }).build();

    await dotLottie.toArrayBuffer();
    await dotLottie.toArrayBuffer();

    expect(dotLottie.getVideos().length).toBe(1);
  });

  it('inlines the video back as a data:video/ URI when getAnimation is called with inlineAssets', async () => {
    const dotLottie = await new DotLottie().addAnimation({ id: 'animation_1', data: animationData() }).build();

    const animation = await dotLottie.getAnimation('animation_1', { inlineAssets: true });
    const asset = animation?.data?.assets?.find((value) => value.id === 'video_0') as Asset.Image;

    expect(isVideoDataUrl(asset.p)).toBe(true);
    expect(asset.p).toEqual(VIDEO_DATA);
    expect(asset.e).toBe(1);
    expect(asset.u).toEqual('');
  });

  it('round-trips video assets through toArrayBuffer/fromArrayBuffer', async () => {
    const dotLottie = await new DotLottie().addAnimation({ id: 'animation_1', data: animationData() }).build();

    const arrayBuffer = await dotLottie.toArrayBuffer();

    const parsed = await new DotLottie().fromArrayBuffer(arrayBuffer);

    const videos = parsed.getVideos();

    expect(videos.length).toBe(1);
    expect(videos[0]?.fileName).toEqual('video_0.mp4');
    expect(await videos[0]?.toDataURL()).toEqual(VIDEO_DATA);
    expect(parsed.getImages().length).toBe(1);
  });

  it('renames colliding video assets when bundling multiple animations', async () => {
    const dotLottie = await new DotLottie()
      .addAnimation({ id: 'animation_1', data: animationData() })
      .addAnimation({ id: 'animation_2', data: animationData() })
      .build();

    const arrayBuffer = await dotLottie.toArrayBuffer();
    const contents = await unzipToRecord(arrayBuffer);
    const fileNames = Object.keys(contents);

    const videoFiles = fileNames.filter((name) => name.startsWith('v/'));

    expect(videoFiles.length).toBe(2);

    // Each animation must point at a video file that actually made it into the archive
    for (const animationId of ['animation_1', 'animation_2']) {
      const animation = JSON.parse(strFromU8(contents[`a/${animationId}.json`] as Uint8Array, false)) as AnimationType;
      const asset = animation.assets?.find((value) => value.id === 'video_0') as Asset.Image;

      expect(asset.u).toEqual('/v/');
      expect(fileNames).toContain(`v/${asset.p}`);
    }
  });
});

describe('video helpers', () => {
  it('reads packaged videos out of a .lottie buffer', async () => {
    const dotLottie = await new DotLottie().addAnimation({ id: 'animation_1', data: animationData() }).build();

    const buffer = new Uint8Array(await dotLottie.toArrayBuffer());

    expect(await getVideo(buffer, 'video_0.mp4')).toEqual(VIDEO_DATA);

    const allVideos = await getAllVideos(buffer);

    expect(Object.keys(allVideos)).toEqual(['video_0.mp4']);
  });

  it('inlines videos via the standalone getAnimations helper', async () => {
    const dotLottie = await new DotLottie().addAnimation({ id: 'animation_1', data: animationData() }).build();

    const buffer = new Uint8Array(await dotLottie.toArrayBuffer());

    const animations = await getAnimations(buffer, { inlineAssets: true });

    const asset = animations['animation_1']?.assets?.find((value) => value.id === 'video_0') as Asset.Image;

    expect(asset.p).toEqual(VIDEO_DATA);
    expect(asset.e).toBe(1);
    expect(asset.u).toEqual('');
  });
});
