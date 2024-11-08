/**
 * Copyright 2024 Design Barn Inc.
 */

import type { Animation as AnimationType } from '@lottie-animation-community/lottie-types';
import type { ZipOptions } from 'fflate';

export interface GetAnimationOptions {
  inlineAssets?: boolean;
}

export interface ConversionOptions {
  zipOptions?: ZipOptions;
}

export type AnimationData = AnimationType;

export interface ExportOptions {
  inlineAssets?: boolean;
}

export type ImageData = string | ArrayBuffer | Blob;
export type AudioData = string | ArrayBuffer | Blob;
