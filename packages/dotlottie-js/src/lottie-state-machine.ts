/**
 * Copyright 2023 Design Barn Inc.
 */

import {
  DotLottieStateMachineCommon,
  type DotLottieStateMachineCommonOptions,
} from './common/dotlottie-state-machine-common';

export * from './common/dotlottie-state';

export class LottieStateMachine extends DotLottieStateMachineCommon {
  public constructor(options: DotLottieStateMachineCommonOptions) {
    super(options);
  }
}
