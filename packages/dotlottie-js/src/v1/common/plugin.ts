/**
 * Copyright 2023 Design Barn Inc.
 */

import { DotLottieError } from '../../utils';

import type { DotLottieCommonV1 } from './dotlottie';

interface DotLottieV1PluginOptions {
  parallel?: boolean;
}

export class DotLottieV1Plugin {
  protected dotLottieV1: DotLottieCommonV1 | undefined;

  protected _parallel: boolean = false;

  public constructor(options?: DotLottieV1PluginOptions) {
    this.dotLottieV1 = undefined;

    if (options?.parallel) {
      this._parallel = options.parallel;
    }
  }

  public install(dotLottieV1: DotLottieCommonV1): void {
    this.dotLottieV1 = dotLottieV1;
  }

  public uninstall(): void {
    this.dotLottieV1 = undefined;
  }

  public get parallel(): boolean {
    return this._parallel;
  }

  public set parallel(value: boolean) {
    this._parallel = value;
  }

  public async onBuild(): Promise<void> {
    throw new DotLottieError('DotLottieV1-plugin build Not implemented!');
  }

  protected _requireDotLottieV1(dotLottieV1: DotLottieCommonV1 | undefined): asserts dotLottieV1 {
    if (!dotLottieV1)
      throw new DotLottieError('DotLottieV1 context is null inside of duplicate image detector plugin.');
  }
}
