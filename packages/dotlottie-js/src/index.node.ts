/**
 * Copyright 2024 Design Barn Inc.
 */

import type { DotLottieV1Options } from './v1/common';
import { DotLottieV1 } from './v1/node';
import type { DotLottieOptions } from './v2/common';
import { DotLottie } from './v2/node';

export function makeDotLottie<T extends 'v1' | 'v2'>(
  version: T,
  options?: T extends 'v1' ? DotLottieV1Options : DotLottieOptions,
): T extends 'v1' ? DotLottieV1 : DotLottie {
  if (version === 'v1') {
    return new DotLottieV1(options as DotLottieV1Options) as T extends 'v1' ? DotLottieV1 : DotLottie;
  }

  return new DotLottie(options as DotLottieOptions) as T extends 'v1' ? DotLottieV1 : DotLottie;
}

export * from './v1/node';
export * from './v1/common';
export * from './v2/node';
export * from './v2/common';
export * from './utils';
export * from './types';