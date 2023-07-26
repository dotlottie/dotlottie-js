/**
 * Copyright 2023 Design Barn Inc.
 */

import { DotLottieStateCommon, type StateOptions } from './common/dotlottie-state-common';

export * from './common/dotlottie-state';

export class LottieState extends DotLottieStateCommon {
  public constructor(options: StateOptions) {
    super(options);
  }
}
