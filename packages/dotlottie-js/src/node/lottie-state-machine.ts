/**
 * Copyright 2023 Design Barn Inc.
 */

import type { DotLottieStateMachineCommonOptions } from '../common/dotlottie-state-machine-common';
import { DotLottieStateMachineCommon } from '../common/dotlottie-state-machine-common';

export type { DotLottieStateMachineCommonOptions };

export class LottieState extends DotLottieStateMachineCommon {
  public constructor(options: DotLottieStateMachineCommonOptions) {
    super(options);
  }
}
