/**
 * Copyright 2023 Design Barn Inc.
 */

import type { ZipOptions } from 'fflate';
import { safeParse, flatten } from 'valibot';

import {
  DotLottieStatesSchema,
  type DotLottieStates,
  type DotLottieStateMachineDescriptor,
  DotLottieStateMachineDescriptorSchema,
} from './dotlottie-state';
import { DotLottieError, ErrorCodes, createError } from './utils';

export interface DotLottieStateMachineCommonOptions {
  descriptor: DotLottieStateMachineDescriptor;
  states: DotLottieStates;
  zipOptions?: ZipOptions;
}

export class DotLottieStateMachineCommon {
  protected _descriptor: DotLottieStateMachineDescriptor;

  protected _zipOptions: ZipOptions;

  protected _states: DotLottieStates;

  public constructor(options: DotLottieStateMachineCommonOptions) {
    this._requireValidId(options.descriptor.id);
    this._requireValidStates(options.states);
    this._requireValidDescriptor(options.descriptor);

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

  public get descriptor(): DotLottieStateMachineDescriptor {
    return this._descriptor;
  }

  public set descriptor(descriptor: DotLottieStateMachineDescriptor) {
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

  protected _requireValidDescriptor(descriptor: DotLottieStateMachineDescriptor): void {
    const result = safeParse(DotLottieStateMachineDescriptorSchema, descriptor);

    if (!result.success) {
      const error = `Invalid state machine declaration, ${JSON.stringify(flatten(result.error).nested, null, 2)}`;

      throw new DotLottieError(`Invalid descriptor: ${error}`, ErrorCodes.INVALID_STATEMACHINE);
    }
  }

  protected _requireValidStates(states: DotLottieStates): void {
    const result = safeParse(DotLottieStatesSchema, states);

    if (!result.success) {
      const error = `Invalid state machine declaration, ${JSON.stringify(flatten(result.error).nested, null, 2)}`;

      throw new DotLottieError(`Invalid states: ${error}`, ErrorCodes.INVALID_STATEMACHINE);
    }
  }
}
