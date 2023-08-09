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
  protected _id: string;

  protected _initial: string;

  protected _zipOptions: ZipOptions;

  protected _states: DotLottieStates;

  public constructor(options: DotLottieStateMachineCommonOptions) {
    this._requireValidId(options.descriptor.id);

    this._id = options.descriptor.id;

    this._initial = options.descriptor.initial;

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
    return this._id;
  }

  public set id(id: string) {
    this._requireValidId(id);

    this._id = id;
  }

  public get states(): DotLottieStates {
    return this._states;
  }

  public set states(states: DotLottieStates) {
    this._states = states;
  }

  public get initial(): string {
    return this._initial;
  }

  public set initial(initial: string) {
    this._initial = initial;
  }

  public toString(): string {
    return JSON.stringify({
      descriptor: {
        id: this._id,
        initial: this._initial,
      },
      states: this._states,
    });
  }

  protected _requireValidId(id: string | undefined): void {
    if (!id) {
      throw createError('Invalid id.');
    }
  }
}
