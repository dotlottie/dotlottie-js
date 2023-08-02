/**
 * Copyright 2023 Design Barn Inc.
 */

import type { ZipOptions } from 'fflate';

import type { DotLottieState } from './dotlottie-state';
import { createError } from './utils';

export interface StateOptions {
  state: DotLottieState;
  zipOptions?: ZipOptions;
}

export class DotLottieStateCommon {
  protected _id: string = '';

  protected _zipOptions: ZipOptions;

  protected _state: DotLottieState;

  public constructor(options: StateOptions) {
    this._requireValidId(options.state.descriptor.id);

    if (options.state.descriptor.id) this._id = options.state.descriptor.id;

    this._zipOptions = options.zipOptions ?? {};

    this._state = options.state;
  }

  public get zipOptions(): ZipOptions {
    return this._zipOptions;
  }

  public set zipOptions(zipOptions: ZipOptions) {
    this._zipOptions = zipOptions;
  }

  public get id(): string {
    return this._id;
  }

  public set id(id: string) {
    this._requireValidId(id);

    this._id = id;
  }

  public get state(): DotLottieState {
    return this._state;
  }

  public set state(state: DotLottieState) {
    this._state = state;
  }

  public toString(): string {
    return JSON.stringify(this._state);
  }

  protected _requireValidId(id: string | undefined): void {
    if (!id) {
      throw createError('Invalid id.');
    }
  }
}
