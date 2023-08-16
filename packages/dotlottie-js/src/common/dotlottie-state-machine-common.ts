/**
 * Copyright 2023 Design Barn Inc.
 */

import type { ZipOptions } from 'fflate';

import type { DotLottieStates, StateInfo } from './dotlottie-state';
import { createError } from './utils';

export interface DotLottieStateMachineCommonOptions {
  descriptor: StateInfo;
  states: DotLottieStates;
  zipOptions?: ZipOptions;
}

export class DotLottieStateMachineCommon {
  protected _descriptor: StateInfo;

  protected _zipOptions: ZipOptions;

  protected _states: DotLottieStates;

  public constructor(options: DotLottieStateMachineCommonOptions) {
    this._requireValidId(options.descriptor.id);

    this._descriptor = options.descriptor;

    this._zipOptions = options.zipOptions ?? {};

    this._states = options.states;
  }

  public get zipOptions(): ZipOptions {
    return this._zipOptions;
  }

  public set zipOptions(zipOptions: ZipOptions) {
    this._zipOptions = zipOptions;
  }

  public get id(): string {
    return this._descriptor.id;
  }

  public set id(id: string) {
    this._requireValidId(id);

    this._descriptor.id = id;
  }

  public get states(): DotLottieStates {
    return this._states;
  }

  public set states(states: DotLottieStates) {
    this._states = states;
  }

  public get initial(): string {
    return this._descriptor.initial;
  }

  public set initial(initial: string) {
    this._descriptor.initial = initial;
  }

  public get descriptor(): StateInfo {
    return this._descriptor;
  }

  public set descriptor(descriptor: StateInfo) {
    this._descriptor = descriptor;
  }

  public toString(): string {
    return JSON.stringify({
      descriptor: this._descriptor,
      states: this._states,
    });
  }

  protected _requireValidId(id: string | undefined): void {
    if (!id) {
      throw createError('Invalid id.');
    }
  }
}
