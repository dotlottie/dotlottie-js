/**
 * Copyright 2023 Design Barn Inc.
 */

import type { DotLottieCommonV1 } from './dotlottie';
import { createError } from './utils';

interface DotLottieV1PluginOptions {
  parallel?: boolean;
}

export class DotLottieV1Plugin {
  protected DotLottieV1: DotLottieCommonV1 | undefined;

  protected _parallel: boolean = false;

  public constructor(options?: DotLottieV1PluginOptions) {
    this.DotLottieV1 = undefined;

    if (options?.parallel) {
      this._parallel = options.parallel;
    }
  }

  public install(DotLottieV1: DotLottieCommonV1): void {
    this.DotLottieV1 = DotLottieV1;
  }

  public uninstall(): void {
    this.DotLottieV1 = undefined;
  }

  public get parallel(): boolean {
    return this._parallel;
  }

  public set parallel(value: boolean) {
    this._parallel = value;
  }

  public async onBuild(): Promise<void> {
    throw createError('DotLottieV1-plugin build Not implemented!');
  }

  protected _requireDotLottieV1(DotLottieV1: DotLottieCommonV1 | undefined): asserts DotLottieV1 {
    if (!DotLottieV1) throw createError('DotLottieV1 context is null inside of duplicate image detector plugin.');
  }
}
