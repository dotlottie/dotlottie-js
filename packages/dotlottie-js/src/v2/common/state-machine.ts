/**
 * Copyright 2023 Design Barn Inc.
 */

import type { ZipOptions } from 'fflate';
import { safeParse, flatten } from 'valibot';

import { DotLottieError, ErrorCodes } from '../../utils';

import type {
  DotLottieDescriptor,
  DotLottieListeners,
  DotLottieStateMachine,
  DotLottieStates,
  DotLottieTransitions,
  DotLottieTriggers,
  ManifestStateMachine,
} from './schemas';
import { DescriptorSchema, ListenersSchema, StatesSchema, TransitionsSchema, TriggersSchema } from './schemas';

export interface DotLottieStateMachineCommonOptions extends ManifestStateMachine {
  data: DotLottieStateMachine;
  zipOptions?: ZipOptions;
}

export class DotLottieStateMachineCommon {
  protected _name: string | undefined;

  protected _id: string;

  protected _descriptor: DotLottieDescriptor;

  protected _zipOptions: ZipOptions;

  protected _states: DotLottieStates;

  protected _listeners: DotLottieListeners;

  protected _triggers: DotLottieTriggers;

  public constructor(options: DotLottieStateMachineCommonOptions) {
    this._requireValidId(options.id);
    this._requireValidTriggers(options.data.triggers ?? []);
    this._requireValidListeners(options.data.listeners ?? []);
    this._requireValidStates(options.data.states);
    this._requireValidDescriptor(options.data.descriptor);

    this._name = options.name;

    this._id = options.id;

    this._descriptor = options.data.descriptor;

    this._zipOptions = options.zipOptions ?? {};

    this._states = options.data.states;

    this._listeners = options.data.listeners ?? [];

    this._triggers = options.data.triggers ?? [];
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

  public get name(): string | undefined {
    return this._name;
  }

  public set name(name: string | undefined) {
    this._name = name;
  }

  public get states(): DotLottieStates {
    return this._states;
  }

  public set states(states: DotLottieStates) {
    this._states = states;
  }

  public get listeners(): DotLottieListeners {
    return this._listeners;
  }

  public set listeners(listeners: DotLottieListeners) {
    this._listeners = listeners;
  }

  public get triggers(): DotLottieTriggers {
    return this._triggers;
  }

  public set triggers(triggers: DotLottieTriggers) {
    this._triggers = triggers;
  }

  public get initial(): string {
    return this._descriptor.initial;
  }

  public set initial(initial: string) {
    this._descriptor.initial = initial;
  }

  public get descriptor(): DotLottieDescriptor {
    return this._descriptor;
  }

  public set descriptor(descriptor: DotLottieDescriptor) {
    this._descriptor = descriptor;
  }

  public toString(): string {
    return JSON.stringify({
      descriptor: this._descriptor,
      states: this._states,
      triggers: this._triggers,
      listeners: this._listeners,
    });
  }

  protected _requireValidId(id: string | undefined): void {
    if (!id) {
      throw new DotLottieError('Invalid id.');
    }
  }

  protected _requireValidDescriptor(descriptor: DotLottieDescriptor): void {
    const result = safeParse(DescriptorSchema, descriptor);

    if (!result.success) {
      const error = `Invalid state machine declaration, ${JSON.stringify(flatten(result.issues).nested, null, 2)}`;

      throw new DotLottieError(`Invalid descriptor: ${error}`, ErrorCodes.INVALID_STATEMACHINE);
    }
  }

  protected _requireValidStates(states: DotLottieStates): void {
    const result = safeParse(StatesSchema, states);

    if (!result.success) {
      const error = `Invalid state machine declaration, ${JSON.stringify(flatten(result.issues).nested, null, 2)}`;

      throw new DotLottieError(`Invalid states: ${error}`, ErrorCodes.INVALID_STATEMACHINE);
    }

    // loop over every transition and validate it
    for (const state of states) {
      if (state.transitions) {
        this._requireValidTransitions(state.transitions);
      }
    }
  }

  protected _requireValidTriggers(triggers: DotLottieTriggers): void {
    const result = safeParse(TriggersSchema, triggers);

    if (!result.success) {
      const error = `Invalid state machine declaration, ${JSON.stringify(flatten(result.issues).nested, null, 2)}`;

      throw new DotLottieError(`Invalid context variables: ${error}`, ErrorCodes.INVALID_STATEMACHINE);
    }
  }

  protected _requireValidListeners(listeners: DotLottieListeners): void {
    const result = safeParse(ListenersSchema, listeners);

    if (!result.success) {
      const error = `Invalid state machine declaration, ${JSON.stringify(flatten(result.issues).nested, null, 2)}`;

      throw new DotLottieError(`Invalid listeners: ${error}`, ErrorCodes.INVALID_STATEMACHINE);
    }
  }

  protected _requireValidTransitions(transitions: DotLottieTransitions): void {
    const result = safeParse(TransitionsSchema, transitions);

    if (!result.success) {
      const error = `Invalid state machine declaration, ${JSON.stringify(flatten(result.issues).nested, null, 2)}`;

      throw new DotLottieError(`Invalid transitions: ${error}`, ErrorCodes.INVALID_STATEMACHINE);
    }
  }
}
