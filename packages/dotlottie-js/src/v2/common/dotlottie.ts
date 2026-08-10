/**
 * Copyright 2023 Design Barn Inc.
 */

import type { Animation as AnimationType } from '@lottie-animation-community/lottie-types';
import type { Zippable } from 'fflate';
import { strToU8, strFromU8, unzip, zip } from 'fflate';

import { PACKAGE_NAME } from '../../constants';
import type { ConversionOptions, GetAnimationOptions } from '../../types';
import {
  base64ToUint8Array,
  DotLottieError,
  getDotLottieVersion,
  getExtensionTypeFromBase64,
  isAudioAsset,
  isImageAsset,
  isValidURL,
  isVideoAsset,
  uint8ArrayToBase64,
} from '../../utils';

import type { AnimationOptions, LottieAnimationCommon } from './animation';
import { LottieAnimation } from './animation';
import type { LottieAudioCommon } from './audio';
import { LottieAudio } from './audio';
import type { LottieFontCommon } from './font';
import { LottieFont } from './font';
import type { LottieImageCommon } from './image';
import { LottieImage } from './image';
import type { DotLottiePlugin } from './plugin';
import type { Manifest } from './schemas';
import type { DotLottieStateMachineCommonOptions } from './state-machine';
import { DotLottieStateMachineCommon } from './state-machine';
import type { ThemeOptions } from './theme';
import { LottieThemeCommon } from './theme';
import type { LottieVideoCommon } from './video';
import { LottieVideo } from './video';

export interface DotLottieOptions {
  enableDuplicateImageOptimization?: boolean;
  generator?: string;
}

export class DotLottieCommon {
  protected readonly _animationsMap: Map<string, LottieAnimationCommon> = new Map();

  protected readonly _plugins: DotLottiePlugin[] = [];

  protected readonly _themesMap: Map<string, LottieThemeCommon> = new Map();

  protected readonly _stateMachinesMap: Map<string, DotLottieStateMachineCommon> = new Map();

  protected _generator: string = PACKAGE_NAME;

  protected _version: string = '2';

  public enableDuplicateImageOptimization?: boolean;

  public constructor(options?: DotLottieOptions) {
    if (options?.generator) {
      this._generator = options.generator;
    }

    this.enableDuplicateImageOptimization = options?.enableDuplicateImageOptimization ?? false;
  }

  public async toBase64(options?: ConversionOptions): Promise<string> {
    return uint8ArrayToBase64(await this.toArrayBuffer(options));
  }

  public create(_options?: DotLottieOptions): DotLottieCommon {
    throw new DotLottieError('create() method not implemented in concrete class!');
  }

  public async download(_fileName: string, _options: ConversionOptions | undefined = undefined): Promise<void> {
    throw new DotLottieError('download(fileName:string) method not implemented in concrete class!');
  }

  public addPlugins(..._plugins: DotLottiePlugin[]): DotLottieCommon {
    throw new DotLottieError('addPlugins(...plugins: DotLottiePlugin[]) not implemented in concrete class!');
  }

  // Per platform: has to construct the platform's concrete DotLottieV1.
  protected async _fromV1ArrayBuffer(_arrayBuffer: ArrayBuffer): Promise<DotLottieCommon> {
    throw new DotLottieError('_fromV1ArrayBuffer(arrayBuffer: ArrayBuffer) not implemented in concrete class!');
  }

  public addAnimation(animationOptions: AnimationOptions): this {
    const animation = new LottieAnimation(animationOptions);

    if (this._animationsMap.get(animationOptions.id)) {
      throw new DotLottieError('Duplicate animation id detected, aborting.');
    }

    this._animationsMap.set(animation.id, animation);

    return this;
  }

  /**
   * Creates a DotLottie instance from an array buffer
   * @param arrayBuffer - array buffer of the dotlottie file
   * @returns DotLottie instance
   * @throws Error
   */
  public async fromArrayBuffer(arrayBuffer: ArrayBuffer): Promise<this> {
    const dotLottieVersion = await getDotLottieVersion(new Uint8Array(arrayBuffer));

    if (dotLottieVersion !== '2') {
      return (await this._fromV1ArrayBuffer(arrayBuffer)) as this;
    }

    const dotlottie = this.create() as this;

    try {
      const contentObj = await new Promise<Zippable>((resolve, reject) => {
        unzip(new Uint8Array(arrayBuffer), (err, data) => {
          if (err) {
            reject(err);
          }

          resolve(data);
        });
      });

      const tmpImages = [];
      const tmpAudio = [];
      const tmpVideos = [];
      const tmpFonts = [];

      if (contentObj['manifest.json'] instanceof Uint8Array) {
        try {
          // Parse the manifest first so that we can pick up animation settings
          const manifest = JSON.parse(strFromU8(contentObj['manifest.json'], false)) as Manifest;

          for (const key of Object.keys(contentObj)) {
            const decompressedFile = contentObj[key] as Uint8Array;
            // JSON entries are UTF-8; binary assets are base64-encoded from the raw bytes below.
            const decodedStr = strFromU8(decompressedFile, false);

            if (key.startsWith('a/') && key.endsWith('.json')) {
              // extract animationId from key as the key = `a/${animationId}.json`
              const animationId = /a\/(.+)\.json/u.exec(key)?.[1];

              if (!animationId) {
                throw new DotLottieError('Invalid animation id');
              }

              const animation = JSON.parse(decodedStr);

              const animationSettings = manifest.animations.find((anim) => anim.id === animationId);

              if (animationSettings === undefined) {
                throw new DotLottieError('Animation not found inside manifest');
              }

              dotlottie.addAnimation({
                data: animation,
                ...animationSettings,
              });
            } else if (key.startsWith('i/')) {
              // extract imageId from key as the key = `i/${imageId}.${ext}`
              const imageId = /i\/(.+)\./u.exec(key)?.[1];

              if (!imageId) {
                throw new DotLottieError('Invalid image id');
              }

              const base64 = uint8ArrayToBase64(decompressedFile);

              const ext = await getExtensionTypeFromBase64(base64);

              if (!ext) {
                throw new DotLottieError('Unrecognized asset file format.');
              }

              const imgDataURL = `data:image/${ext};base64,${base64}`;

              tmpImages.push(
                new LottieImage({
                  id: imageId,
                  lottieAssetId: imageId,
                  data: imgDataURL,
                  fileName: key.split('/')[1] || '',
                }),
              );
            } else if (key.startsWith('u/')) {
              // extract audioId from key as the key = `u/${audioId}.${ext}`
              const audioId = /u\/(.+)\./u.exec(key)?.[1];

              if (!audioId) {
                throw new DotLottieError('Invalid audio id');
              }

              const base64 = uint8ArrayToBase64(decompressedFile);

              const ext = await getExtensionTypeFromBase64(base64);

              const audioDataURL = `data:audio/${ext};base64,${base64}`;

              tmpAudio.push(
                new LottieAudio({
                  id: audioId,
                  data: audioDataURL,
                  fileName: key.split('/')[1] || '',
                }),
              );
            } else if (key.startsWith('v/')) {
              // extract videoId from key as the key = `v/${videoId}.${ext}`
              const videoId = /v\/(.+)\./u.exec(key)?.[1];

              if (!videoId) {
                throw new DotLottieError('Invalid video id');
              }

              const base64 = uint8ArrayToBase64(decompressedFile);

              const ext = await getExtensionTypeFromBase64(base64);

              const videoDataURL = `data:video/${ext};base64,${base64}`;

              tmpVideos.push(
                new LottieVideo({
                  id: videoId,
                  lottieAssetId: videoId,
                  data: videoDataURL,
                  fileName: key.split('/')[1] || '',
                }),
              );
            } else if (key.startsWith('f/')) {
              // extract fontId from key as the key = `f/${fontId}.${ext}`
              const fontId = /f\/(.+)\./u.exec(key)?.[1];

              if (!fontId) {
                throw new DotLottieError('Invalid font id');
              }

              const base64 = uint8ArrayToBase64(decompressedFile);

              const ext = await getExtensionTypeFromBase64(base64);

              const fontDataURL = `data:font/${ext};base64,${base64}`;

              tmpFonts.push(
                new LottieFont({
                  id: fontId,
                  data: fontDataURL,
                  fileName: key.split('/')[1] || '',
                }),
              );
            } else if (key.startsWith('t/') && key.endsWith('.json')) {
              // extract themeId from key as the key = `t/${themeId}.json`
              const themeId = /t\/(.+)\.json/u.exec(key)?.[1];

              if (!themeId) {
                throw new DotLottieError('Invalid theme id');
              }

              manifest.themes?.forEach((theme) => {
                if (theme.id === themeId) {
                  dotlottie.addTheme({
                    id: theme.id,
                    name: theme.name,
                    data: JSON.parse(decodedStr),
                  });
                }
              });
            } else if (key.startsWith('s/') && key.endsWith('.json')) {
              // extract stateId from key as the key = `s/${stateId}.json`
              const stateId = /s\/(.+)\.json/u.exec(key)?.[1];

              if (!stateId) {
                throw new DotLottieError('Invalid statemachine id');
              }

              manifest.stateMachines?.forEach((stateMachine) => {
                if (stateMachine.id === stateId) {
                  dotlottie.addStateMachine({
                    id: stateMachine.id,
                    name: stateMachine.name,
                    data: JSON.parse(decodedStr),
                  });
                }
              });
            }
          }

          // Restore manifest.initial.animation → per-animation defaultActiveAnimation
          // so that toArrayBuffer() → fromArrayBuffer() is a lossless roundtrip.
          // _buildManifest() derives `manifest.initial` from this flag on write;
          // without this, any parse → serialize cycle drops the initial marker.
          if (manifest.initial?.animation) {
            const initialAnimation = dotlottie.animations.find((anim) => anim.id === manifest.initial?.animation);

            if (initialAnimation) {
              initialAnimation.defaultActiveAnimation = true;
            }
          }

          // Go through the images and find to which animation they belong
          for (const image of tmpImages) {
            for (const parentAnimation of dotlottie.animations) {
              if (parentAnimation.data) {
                const animationAssets = parentAnimation.data.assets as AnimationType['assets'];

                if (animationAssets) {
                  for (const asset of animationAssets) {
                    if (isImageAsset(asset)) {
                      if (asset.p === image.fileName) {
                        image.parentAnimations.push(parentAnimation);
                        parentAnimation.imageAssets.push(image);
                      }
                    }
                  }
                }
              }
            }
          }

          // Go through the audio and find to which animation they belong
          for (const audio of tmpAudio) {
            for (const parentAnimation of dotlottie.animations) {
              if (parentAnimation.data) {
                const animationAssets = parentAnimation.data.assets as AnimationType['assets'];

                if (animationAssets) {
                  for (const asset of animationAssets) {
                    if (isAudioAsset(asset)) {
                      if (asset.p.includes(audio.id)) {
                        audio.parentAnimations.push(parentAnimation);
                        parentAnimation.audioAssets.push(audio);
                      }
                    }
                  }
                }
              }
            }
          }

          // Go through the videos and find to which animation they belong
          for (const video of tmpVideos) {
            for (const parentAnimation of dotlottie.animations) {
              if (parentAnimation.data) {
                const animationAssets = parentAnimation.data.assets as AnimationType['assets'];

                if (animationAssets) {
                  for (const asset of animationAssets) {
                    if (isVideoAsset(asset)) {
                      if (asset.p === video.fileName) {
                        video.parentAnimations.push(parentAnimation);
                        parentAnimation.videoAssets.push(video);
                      }
                    }
                  }
                }
              }
            }
          }

          for (const font of tmpFonts) {
            for (const parentAnimation of dotlottie.animations) {
              if (parentAnimation.data) {
                const fontsList = parentAnimation.data.fonts?.list;

                if (fontsList) {
                  for (const fontDef of fontsList) {
                    if (fontDef.fPath === `/f/${font.fileName}`) {
                      font.parentAnimations.push(parentAnimation);
                      parentAnimation.fontAssets.push(font);
                    }
                  }
                }
              }
            }
          }
        } catch (err: unknown) {
          throw new DotLottieError(
            `Invalid manifest inside buffer! ${err instanceof Error ? err.message : 'Unknown error'}`,
          );
        }
      } else {
        throw new DotLottieError('Invalid buffer');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new DotLottieError(err.message);
      }
    }

    return dotlottie;
  }

  public async toArrayBuffer(options: ConversionOptions | undefined = undefined): Promise<ArrayBuffer> {
    const manifest = this._buildManifest();

    const dotlottie: Zippable = {
      'manifest.json': [strToU8(JSON.stringify(manifest)), {}],
    };

    for (const animation of this.animations) {
      const json = await animation.toJSON();

      dotlottie[`a/${animation.id}.json`] = [strToU8(JSON.stringify(json)), animation.zipOptions];

      for (const asset of animation.imageAssets) {
        const dataAsString = await asset.toDataURL();

        dotlottie[`i/${asset.fileName}`] = [base64ToUint8Array(dataAsString), asset.zipOptions];
      }

      for (const asset of animation.audioAssets) {
        const dataAsString = await asset.toDataURL();

        dotlottie[`u/${asset.fileName}`] = [base64ToUint8Array(dataAsString), asset.zipOptions];
      }

      for (const asset of animation.videoAssets) {
        const dataAsString = await asset.toDataURL();

        dotlottie[`v/${asset.fileName}`] = [base64ToUint8Array(dataAsString), asset.zipOptions];
      }

      for (const font of animation.fontAssets) {
        const dataAsString = await font.toDataURL();

        dotlottie[`f/${font.fileName}`] = [base64ToUint8Array(dataAsString), font.zipOptions];
      }
    }

    for (const theme of this.themes) {
      const themeData = await theme.toString();

      dotlottie[`t/${theme.id}.json`] = [strToU8(themeData), theme.zipOptions];
    }

    for (const state of this.stateMachines) {
      const stateData = state.toString();

      dotlottie[`s/${state.id}.json`] = [strToU8(stateData), state.zipOptions];
    }

    return new Promise<ArrayBuffer>((resolve, reject) => {
      zip(dotlottie, options?.zipOptions || {}, (err, data) => {
        if (err) {
          reject(err);

          return;
        }

        resolve(data.buffer as ArrayBuffer);
      });
    });
  }

  public get plugins(): DotLottiePlugin[] {
    return this._plugins;
  }

  public get version(): string {
    return this._version;
  }

  public get generator(): string {
    return this._generator;
  }

  public get animations(): LottieAnimationCommon[] {
    return Array.from(this._animationsMap.values());
  }

  public get manifest(): Manifest {
    return this._buildManifest();
  }

  public get themes(): LottieThemeCommon[] {
    return Array.from(this._themesMap.values());
  }

  public get stateMachines(): DotLottieStateMachineCommon[] {
    return Array.from(this._stateMachinesMap.values());
  }

  /**
   * Renames the underlying LottieImage, as well as updating the image asset path inside the animation data.
   * @param newName - desired id and fileName,
   * @param imageId - The id of the LottieImage to rename
   */
  private async _renameImage(
    animation: LottieAnimationCommon,
    newLottieAssetId: string,
    lottieAssetId: string,
  ): Promise<void> {
    for (const imageAsset of animation.imageAssets) {
      if (imageAsset.lottieAssetId === lottieAssetId) {
        const oldPath = imageAsset.fileName;

        // Rename image will change the fileName using the newLottieAssetId and append the detected extension
        await imageAsset.renameImage(newLottieAssetId);

        if (!animation.data) throw new DotLottieError('No animation data available.');

        const animationAssets = animation.data.assets as AnimationType['assets'];

        if (!animationAssets) throw new DotLottieError('No image assets to rename.');

        // Find the image asset inside the animation data and rename its path
        for (const asset of animationAssets) {
          if (isImageAsset(asset)) {
            if (asset.p === oldPath) {
              asset.p = imageAsset.fileName;
            }
          }
        }
      }
    }
  }

  /**
   * Generates a map of duplicate image ids and their count.
   * @returns Map of duplicate image ids and their count.
   */
  private _generateMapOfOccurencesFromImageIds(): Map<string, number> {
    const dupeMap = new Map<string, number>();

    this.animations.forEach((animation) => {
      animation.imageAssets.forEach((imageAsset) => {
        if (dupeMap.has(imageAsset.lottieAssetId)) {
          const count = dupeMap.get(imageAsset.lottieAssetId) ?? 0;

          dupeMap.set(imageAsset.lottieAssetId, count + 1);
        } else {
          dupeMap.set(imageAsset.lottieAssetId, 1);
        }
      });
    });

    return dupeMap;
  }

  /**
   * Renames the image assets in all animations to avoid conflicts.
   *
   * Steps:
   *  - Generate how many times across all animations the same image id has been used.
   *  - Loop through every animation in reverse order
   *  - Every time an animation uses an image asset that is also used elsewhere, append the count to the image's asset id and then decrement.
   *
   * Result of renaming for every animation:
   *
   * - Inside the Lottie's data and it's Asset object:
   *  - The Asset id stays the same, meaning that every reference to the asset is still valid (refId)
   *  - The path is changed to the new asset id with the format \{assetId\}_\{count\}
   *
   * - On the dotLottie file system scope:
   *  - The image file name is changed to the new asset id \{assetId\}_\{count\}.\{ext\}
   */
  private async _renameImageAssets(): Promise<void> {
    const occurenceMap = this._generateMapOfOccurencesFromImageIds();

    // Loop over every animation
    for (let i = this.animations.length - 1; i >= 0; i -= 1) {
      const animation = this.animations.at(i);

      if (animation) {
        // Loop over every image asset of the animation
        for (let j = animation.imageAssets.length - 1; j >= 0; j -= 1) {
          const image = animation.imageAssets.at(j);

          if (image) {
            // Get how many times the same image id has been used
            let count = occurenceMap.get(image.lottieAssetId) ?? 0;

            if (count > 0) {
              count -= 1;
            }

            // Decrement the count
            occurenceMap.set(image.lottieAssetId, count);

            if (count > 0) {
              // Rename the with n-1 count
              await this._renameImage(animation, `${image.lottieAssetId}_${count}`, image.lottieAssetId);
            }
          }
        }
      }
    }
  }

  /**
   * Renames the underlying LottieAudio, as well as updating the audio asset path inside the animation data.
   * @param newName - desired id and fileName,
   * @param audioId - The id of the LottieAudio to rename
   */
  private async _renameAudio(animation: LottieAnimationCommon, newName: string, audioId: string): Promise<void> {
    for (const audioAsset of animation.audioAssets) {
      if (audioAsset.id === audioId) {
        // Rename the LottieImage
        await audioAsset.renameAudio(newName);

        if (!animation.data) throw new DotLottieError('No animation data available.');

        const animationAssets = animation.data.assets as AnimationType['assets'];

        if (!animationAssets) throw new DotLottieError('No audio assets to rename.');

        // Find the audio asset inside the animation data and rename its path
        for (const asset of animationAssets) {
          if (isAudioAsset(asset)) {
            if (asset.id === audioId) {
              asset.p = audioAsset.fileName;
            }
          }
        }
      }
    }
  }

  private async _renameAudioAssets(): Promise<void> {
    const audio: Map<string, LottieAudioCommon[]> = new Map();

    this.animations.forEach((animation) => {
      audio.set(animation.id, animation.audioAssets);
    });

    let size = 0;

    audio.forEach((value) => {
      size += value.length;
    });

    for (let i = this.animations.length - 1; i >= 0; i -= 1) {
      const animation = this.animations.at(i);

      if (animation) {
        for (let j = animation.audioAssets.length - 1; j >= 0; j -= 1) {
          const audioAsset = animation.audioAssets.at(j);

          if (audioAsset) {
            await this._renameAudio(animation, `audio_${size}`, audioAsset.id);
            size -= 1;
          }
        }
      }
    }
  }

  /**
   * Renames the underlying LottieVideo, as well as updating the video asset path inside the animation data.
   * @param animation - The animation containing the video
   * @param newLottieAssetId - desired id and fileName
   * @param lottieAssetId - The Lottie asset id of the LottieVideo to rename
   */
  private async _renameVideo(
    animation: LottieAnimationCommon,
    newLottieAssetId: string,
    lottieAssetId: string,
  ): Promise<void> {
    for (const videoAsset of animation.videoAssets) {
      if (videoAsset.lottieAssetId === lottieAssetId) {
        const oldPath = videoAsset.fileName;

        // Rename video will change the fileName using the newLottieAssetId and append the detected extension
        await videoAsset.renameVideo(newLottieAssetId);

        if (!animation.data) throw new DotLottieError('No animation data available.');

        const animationAssets = animation.data.assets as AnimationType['assets'];

        if (!animationAssets) throw new DotLottieError('No video assets to rename.');

        // Find the video asset inside the animation data and rename its path
        for (const asset of animationAssets) {
          if (isVideoAsset(asset) && asset.p === oldPath) {
            asset.p = videoAsset.fileName;
          }
        }
      }
    }
  }

  /**
   * Renames the video assets in all animations to avoid conflicts.
   *
   * Follows the same scheme as {@link DotLottieCommon._renameImageAssets}: the Lottie asset id is left
   * untouched so that every layer referencing it stays valid, only the packaged file name changes.
   */
  private async _renameVideoAssets(): Promise<void> {
    const occurenceMap = new Map<string, number>();

    this.animations.forEach((animation) => {
      animation.videoAssets.forEach((videoAsset) => {
        occurenceMap.set(videoAsset.lottieAssetId, (occurenceMap.get(videoAsset.lottieAssetId) ?? 0) + 1);
      });
    });

    for (let i = this.animations.length - 1; i >= 0; i -= 1) {
      const animation = this.animations.at(i);

      if (animation) {
        for (let j = animation.videoAssets.length - 1; j >= 0; j -= 1) {
          const video = animation.videoAssets.at(j);

          if (video) {
            let count = occurenceMap.get(video.lottieAssetId) ?? 0;

            if (count > 0) {
              count -= 1;
            }

            occurenceMap.set(video.lottieAssetId, count);

            if (count > 0) {
              await this._renameVideo(animation, `${video.lottieAssetId}_${count}`, video.lottieAssetId);
            }
          }
        }
      }
    }
  }

  /**
   * Renames the underlying LottieFont, as well as updating the font path inside the animation data.
   * @param animation - The animation containing the font
   * @param newFileName - desired new fileName (without extension),
   * @param oldFileName - The current fileName of the LottieFont to rename
   */
  private async _renameFont(animation: LottieAnimationCommon, newFileName: string, oldFileName: string): Promise<void> {
    for (const fontAsset of animation.fontAssets) {
      if (fontAsset.fileName === oldFileName) {
        // Rename font will change the fileName
        await fontAsset.renameFont(newFileName);

        if (!animation.data) throw new DotLottieError('No animation data available.');

        const fontsList = animation.data.fonts?.list;

        if (!fontsList) throw new DotLottieError('No font list to rename.');

        for (const font of fontsList) {
          if (font.fPath === `/f/${oldFileName}`) {
            font.fPath = `/f/${fontAsset.fileName}`;
          }
        }
      }
    }
  }

  private async _renameFontAssets(): Promise<void> {
    const fonts: Map<string, LottieFontCommon[]> = new Map();

    this.animations.forEach((animation) => {
      fonts.set(animation.id, animation.fontAssets);
    });

    let size = 0;

    fonts.forEach((value) => {
      size += value.length;
    });

    for (let i = this.animations.length - 1; i >= 0; i -= 1) {
      const animation = this.animations.at(i);

      if (animation) {
        for (let j = animation.fontAssets.length - 1; j >= 0; j -= 1) {
          const fontAsset = animation.fontAssets.at(j);

          if (fontAsset) {
            const oldFileName = fontAsset.fileName;

            await this._renameFont(animation, `font_${size}`, oldFileName);
            size -= 1;
          }
        }
      }
    }
  }

  protected _addLottieAnimation(animation: LottieAnimationCommon): DotLottieCommon {
    if (this._animationsMap.get(animation.id)) {
      throw new DotLottieError('Duplicate animation id detected, aborting.');
    }

    this._animationsMap.set(animation.id, animation);

    return this;
  }

  /**
   * Inlines all assets of the passed animation
   * @param animation - Animation whose asset are to be inlined
   * @returns LottieAnimationCommon with inlined assets
   */
  private async _findAssetsAndInline(animation: LottieAnimationCommon): Promise<LottieAnimationCommon> {
    const animationAssets = animation.data?.assets as AnimationType['assets'];

    if (!animationAssets) throw new DotLottieError("Failed to inline assets, the animation's assets are undefined.");

    const images = this.getImages();
    const audios = this.getAudio();
    const videos = this.getVideos();
    const fonts = this.getFonts();

    for (const asset of animationAssets) {
      if (isVideoAsset(asset)) {
        for (const video of videos) {
          if (video.fileName === asset.p) {
            // encoded is true
            asset.e = 1;
            asset.u = '';
            asset.p = await video.toDataURL();
          }
        }
      } else if (isImageAsset(asset)) {
        for (const image of images) {
          if (image.fileName === asset.p) {
            // encoded is true
            asset.e = 1;
            asset.u = '';
            asset.p = await image.toDataURL();
          }
        }
      } else if (isAudioAsset(asset)) {
        for (const audio of audios) {
          if (audio.fileName === asset.p) {
            // encoded is true
            asset.e = 1;
            asset.u = '';
            asset.p = await audio.toDataURL();
          }
        }
      }
    }

    // Inline fonts from fonts.list
    const fontsList = animation.data?.fonts?.list;

    if (fontsList) {
      for (const fontDef of fontsList) {
        for (const font of fonts) {
          if (fontDef.fPath === `/f/${font.fileName}`) {
            fontDef.fPath = await font.toDataURL();
            fontDef.origin = 3;
          }
        }
      }
    }

    return animation;
  }

  /**
   * Returns the desired animation
   * @param animationId - desired animation id
   * @param inlineAssets - if true will inline the assets inside the data of the LottieAnimationV1
   * @returns
   */
  public async getAnimation(
    animationId: string,
    options?: GetAnimationOptions,
  ): Promise<LottieAnimationCommon | undefined> {
    if (!options?.inlineAssets) return this._animationsMap.get(animationId);

    let dataWithInlinedImages = this._animationsMap.get(animationId);

    if (!dataWithInlinedImages) throw new DotLottieError('Failed to find animation.');

    dataWithInlinedImages = await this._findAssetsAndInline(dataWithInlinedImages);

    return dataWithInlinedImages;
  }

  public getAnimations(): Array<[string, LottieAnimationCommon]> | undefined {
    return Array.from(this._animationsMap);
  }

  public removeAnimation(animationId: string): DotLottieCommon {
    const targetAnimation = this._animationsMap.get(animationId);

    if (targetAnimation) {
      const assignedThemes = targetAnimation.themes;

      for (const assignedTheme of assignedThemes) {
        this.unscopeTheme({
          animationId: targetAnimation.id,
          themeId: assignedTheme.id,
        });
      }

      this._animationsMap.delete(targetAnimation.id);
    }

    return this;
  }

  public getImages(): LottieImageCommon[] {
    const images: LottieImageCommon[] = [];

    this.animations.map((animation) => {
      return images.push(...animation.imageAssets);
    });

    return images;
  }

  public getAudio(): LottieAudioCommon[] {
    const audio: LottieAudioCommon[] = [];

    this.animations.map((animation) => {
      return audio.push(...animation.audioAssets);
    });

    return audio;
  }

  public getVideos(): LottieVideoCommon[] {
    const videos: LottieVideoCommon[] = [];

    this.animations.map((animation) => {
      return videos.push(...animation.videoAssets);
    });

    return videos;
  }

  public getFonts(): LottieFontCommon[] {
    const fonts: LottieFontCommon[] = [];

    this.animations.map((animation) => {
      return fonts.push(...animation.fontAssets);
    });

    return fonts;
  }

  public getTheme(themeId: string): LottieThemeCommon | undefined {
    return this._themesMap.get(themeId);
  }

  protected _buildManifest(): Manifest {
    const animationsList = Array.from(this._animationsMap.values());
    const themesList = Array.from(this._themesMap.values());
    const stateMachinesList = Array.from(this._stateMachinesMap.values());
    const activeAnimationId = animationsList.find((value) => value.defaultActiveAnimation)?.id ?? '';

    const manifest: Manifest = {
      version: this.version,
      generator: this.generator,
      animations: animationsList.map((animation) => ({
        id: animation.id,
        ...(animation.name ? { name: animation.name } : {}),
        ...(animation.initialTheme ? { initialTheme: animation.initialTheme } : {}),
        ...(animation.background ? { background: animation.background } : {}),
        ...(animation.themes.length > 0 ? { themes: animation.themes.map((theme) => theme.id) } : {}),
      })),
    };

    if (themesList.length > 0) {
      manifest.themes = themesList.map((theme) => ({
        id: theme.id,
        ...(theme.name ? { name: theme.name } : {}),
      }));
    }

    if (stateMachinesList.length > 0) {
      manifest.stateMachines = stateMachinesList.map((stateMachine) => ({
        id: stateMachine.id,
        ...(stateMachine.name ? { name: stateMachine.name } : {}),
      }));
    }

    if (activeAnimationId) {
      manifest.initial = {
        animation: activeAnimationId,
      };
    }

    return manifest;
  }

  /**
   * Validates that all animation IDs referenced in state machines exist in the bundle.
   * @throws DotLottieError if a state references an animation that doesn't exist
   */
  private _validateStateMachineAnimations(): void {
    const availableAnimationIds = Array.from(this._animationsMap.keys());

    for (const stateMachine of this.stateMachines) {
      for (const state of stateMachine.states) {
        if ('animation' in state && state.animation && state.animation.trim() !== '') {
          if (!availableAnimationIds.includes(state.animation)) {
            throw new DotLottieError(
              `State machine "${stateMachine.id}": State "${state.name}" references animation "${
                state.animation
              }" which does not exist in the bundle. Available animations: ${availableAnimationIds.join(', ')}`,
            );
          }
        }
      }
    }
  }

  /**
   * Constructs the manifest and calls toJSON on the animations
   * so the data is fetched for every animation.
   *
   * @returns DotLottie context
   */
  public async build(): Promise<this> {
    this._buildManifest();

    // Validate state machine animation references
    this._validateStateMachineAnimations();

    for (const animation of this.animations) {
      await animation.toJSON();
    }

    if (this.animations.length > 1) {
      // Rename assets incrementally if there are multiple animations
      await this._renameImageAssets();
      await this._renameAudioAssets();
      await this._renameVideoAssets();
      await this._renameFontAssets();
    }

    const parallelPlugins = [];
    const sequentialPlugins = [];

    for (const plugin of this.plugins) {
      if (plugin.parallel) {
        parallelPlugins.push(plugin);
      } else {
        sequentialPlugins.push(plugin);
      }
    }

    // Run parallel plugins
    await Promise.all(parallelPlugins.map(async (plugin) => plugin.onBuild()));

    // Run sequential plugins
    for (const plugin of sequentialPlugins) {
      await plugin.onBuild();
    }

    return this;
  }

  public async toBlob(options: ConversionOptions | undefined = undefined): Promise<Blob> {
    const arrayBuffer = await this.toArrayBuffer(options);

    return new Blob([arrayBuffer], { type: 'application/zip' });
  }

  /**
   * Creates a DotLottie instance from a url to a dotlottie file
   * @param url - url to the dotlottie file
   * @returns DotLottie instance
   */
  public async fromURL(url: string): Promise<this> {
    if (!isValidURL(url)) throw new DotLottieError('Invalid URL');

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new DotLottieError(response.statusText);
      }

      const arrayBuffer = await response.arrayBuffer();

      return this.fromArrayBuffer(arrayBuffer);
    } catch (err) {
      if (err instanceof Error) {
        throw new DotLottieError(err.message);
      }
    }

    throw new DotLottieError('Unknown error');
  }

  public merge(...dotlotties: DotLottieCommon[]): DotLottieCommon {
    const mergedDotlottie = this.create();

    for (const dotlottie of [this, ...dotlotties]) {
      dotlottie.themes.forEach((theme) => {
        mergedDotlottie.addTheme({
          id: theme.id,
          name: theme.name,
          data: theme.data,
        });
      });

      dotlottie.animations.forEach((animation) => {
        if (animation.data) {
          mergedDotlottie.addAnimation({
            id: animation.id,
            name: animation.name,
            data: animation.data,
          });
        } else if (animation.url) {
          mergedDotlottie.addAnimation({
            id: animation.id,
            name: animation.name,
            url: animation.url,
          });
        }

        animation.themes.forEach((theme) => {
          mergedDotlottie.scopeTheme({
            animationId: animation.id,
            themeId: theme.id,
          });
        });
      });

      dotlottie.stateMachines.forEach((stateMachine) => {
        const stateOption = {
          id: stateMachine.id,
          name: stateMachine.name,
          data: {
            states: stateMachine.states,
            initial: stateMachine.initial,
            interactions: stateMachine.interactions,
            inputs: stateMachine.inputs,
          },
          zipOptions: stateMachine.zipOptions,
        };

        mergedDotlottie.addStateMachine(stateOption);
      });
    }

    return mergedDotlottie;
  }

  public addTheme(themeOptions: ThemeOptions): DotLottieCommon {
    const theme = new LottieThemeCommon(themeOptions);

    this._themesMap.set(theme.id, theme);

    return this;
  }

  public removeTheme(id: string): DotLottieCommon {
    const targetTheme = this._themesMap.get(id);

    if (targetTheme) {
      for (const animation of this.animations) {
        if (animation.themes.includes(targetTheme)) {
          animation.unscopeTheme(targetTheme.id);
        }
      }

      this._themesMap.delete(targetTheme.id);
    }

    return this;
  }

  public scopeTheme({ animationId, themeId }: { animationId: string; themeId: string }): DotLottieCommon {
    const theme = this._themesMap.get(themeId);

    if (!theme) throw new DotLottieError(`Failed to find theme with id ${themeId}`);

    const animation = this._animationsMap.get(animationId);

    if (!animation) throw new DotLottieError(`Failed to find animation with id ${animationId}`);

    animation.scopeTheme(theme);

    return this;
  }

  public unscopeTheme({ animationId, themeId }: { animationId: string; themeId: string }): DotLottieCommon {
    const theme = this._themesMap.get(themeId);

    if (!theme) throw new DotLottieError(`Failed to find theme with id ${themeId}`);

    const animation = this._animationsMap.get(animationId);

    if (!animation) throw new DotLottieError(`Failed to find animation with id ${animationId}`);

    animation.unscopeTheme(theme.id);

    return this;
  }

  public addStateMachine(stateMachineOptions: DotLottieStateMachineCommonOptions): DotLottieCommon {
    const newState = new DotLottieStateMachineCommon(stateMachineOptions);

    this._stateMachinesMap.set(stateMachineOptions.id, newState);

    return this;
  }

  public getStateMachine(stateId: string): DotLottieStateMachineCommon | undefined {
    return this._stateMachinesMap.get(stateId);
  }

  public removeStateMachine(stateMachineId: string): DotLottieCommon {
    this._stateMachinesMap.delete(stateMachineId);

    return this;
  }

  protected _requireValidDescription(description: string | undefined): asserts description is string {
    if (typeof description !== 'string') throw new DotLottieError('Invalid description');
  }

  protected _requireValidGenerator(generator: string | undefined): asserts generator is string {
    if (typeof generator !== 'string') throw new DotLottieError('Invalid generator');
  }

  protected _requireValidKeywords(keywords: string | undefined): asserts keywords is string {
    if (typeof keywords !== 'string') throw new DotLottieError('Invalid keywords');
  }

  protected _requireValidVersion(version: string | undefined): asserts version is string {
    if (typeof version !== 'string') throw new DotLottieError('Invalid version');
  }

  protected _requireValidCustomData(
    customData: Record<string, unknown> | undefined,
  ): asserts customData is Record<string, unknown> {
    if (!customData) throw new DotLottieError('Invalid customData');
  }
}
