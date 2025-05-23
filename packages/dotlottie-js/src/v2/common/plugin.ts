/**
 * Copyright 2023 Design Barn Inc.
 */

import { DotLottieError } from '../../utils';

import type { DotLottieCommon } from './dotlottie';

interface DotLottiePluginOptions {
  parallel?: boolean;
}

export class DotLottiePlugin {
  protected dotlottie: DotLottieCommon | undefined;

  protected _parallel: boolean = false;

  public constructor(options?: DotLottiePluginOptions) {
    this.dotlottie = undefined;

    if (options?.parallel) {
      this._parallel = options.parallel;
    }
  }

  public install(dotlottie: DotLottieCommon): void {
    this.dotlottie = dotlottie;
  }

  public uninstall(): void {
    this.dotlottie = undefined;
  }

  public get parallel(): boolean {
    return this._parallel;
  }

  public set parallel(value: boolean) {
    this._parallel = value;
  }

  public async onBuild(): Promise<void> {
    throw new DotLottieError('dotlottie-plugin build Not implemented!');
  }

  protected _requireDotLottie(dotLottie: DotLottieCommon | undefined): asserts dotLottie {
    if (!dotLottie) throw new DotLottieError('dotLottie context is null inside of duplicate image detector plugin.');
  }
}
