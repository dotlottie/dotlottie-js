/**
 * Copyright 2023 Design Barn Inc.
 */

import { DotLottieStateCommon, type StateOptions } from './common/dotlottie-state-common';

export type { StateOptions };
export { DotLottieStateCommon };

export class LottieState extends DotLottieStateCommon {
  public constructor(options: StateOptions) {
    super(options);
  }
}
