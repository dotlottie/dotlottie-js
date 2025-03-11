/**
 * Copyright 2023 Design Barn Inc.
 */

import type { ZipOptions } from 'fflate';
import { safeParse, flatten } from 'valibot';

import { DotLottieError, ErrorCodes } from '../../utils';

import type {
  DotLottieStateMachine,
  DotLottieStates,
  DotLottieTransitions,
  DotLottieInputs,
  ManifestStateMachine,
  DotLottieInteractions,
} from './schemas';
import { InteractionsSchema, StatesSchema, TransitionsSchema, InputsSchema } from './schemas';

export interface DotLottieStateMachineCommonOptions extends ManifestStateMachine {
  data: DotLottieStateMachine;
  zipOptions?: ZipOptions;
}

export class DotLottieStateMachineCommon {
  protected _name: string | undefined;

  protected _id: string;

  protected _initial: string;

  protected _zipOptions: ZipOptions;

  protected _states: DotLottieStates;

  protected _interactions: DotLottieInteractions;

  protected _inputs: DotLottieInputs;

  public constructor(options: DotLottieStateMachineCommonOptions) {
    this._requireValidId(options.id);
    if (options.data.inputs) {
      this._requireValidInputs(options.data.inputs);
    }
    if (options.data.interactions) {
      this._requireValidInteractions(options.data.interactions);
    }
    this._requireValidStates(options.data.states);
    this._requireValidInitial(options.data.initial, options.data.states);

    this._name = options.name;

    this._id = options.id;

    this._initial = options.data.initial;

    this._zipOptions = options.zipOptions ?? {};

    this._states = options.data.states;

    this._interactions = options.data.interactions ?? [];

    this._inputs = options.data.inputs ?? [];
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

  public get interactions(): DotLottieInteractions {
    return this._interactions;
  }

  public set interactions(interactions: DotLottieInteractions) {
    this._interactions = interactions;
  }

  public get inputs(): DotLottieInputs {
    return this._inputs;
  }

  public set inputs(inputs: DotLottieInputs) {
    this._inputs = inputs;
  }

  public get initial(): string {
    return this._initial;
  }

  public set initial(initial: string) {
    this.initial = initial;
  }

  public toString(): string {
    return JSON.stringify({
      initial: this._initial,
      states: this._states,
      inputs: this._inputs,
      interactions: this._interactions,
    });
  }

  protected _requireValidId(id: string | undefined): void {
    if (!id) {
      throw new DotLottieError('Invalid id.');
    }
  }

  protected _requireValidInitial(initial: string, states: DotLottieStates): void {
    const result = safeParse(StatesSchema, states);

    if (!result.success) {
      const error = `${JSON.stringify(flatten(result.issues).nested, null, 2)}`;

      throw new DotLottieError(`Invalid initial state: ${error}`, ErrorCodes.INVALID_STATEMACHINE);
    }

    let found = false;

    for (const state of states) {
      if (state.name === initial) {
        found = true;
      }
    }

    if (!found) {
      throw new DotLottieError(`Initial state not found.`, ErrorCodes.INVALID_STATEMACHINE);
    }
  }

  protected _requireValidStates(states: DotLottieStates): void {
    const result = safeParse(StatesSchema, states);

    if (!result.success) {
      const error = `${JSON.stringify(flatten(result.issues).nested, null, 2)}`;

      throw new DotLottieError(`Invalid state declaration: ${error}`, ErrorCodes.INVALID_STATEMACHINE);
    }
  }

  protected _requireValidInputs(inputs: DotLottieInputs): void {
    const result = safeParse(InputsSchema, inputs);

    if (!result.success) {
      const error = `${JSON.stringify(flatten(result.issues).nested, null, 2)}`;

      throw new DotLottieError(`Invalid inputs: ${error}`, ErrorCodes.INVALID_STATEMACHINE);
    }
  }

  protected _requireValidInteractions(interactions: DotLottieInteractions): void {
    const result = safeParse(InteractionsSchema, interactions);

    if (!result.success) {
      const error = `${JSON.stringify(flatten(result.issues).nested, null, 2)}`;

      throw new DotLottieError(`Invalid interactions: ${error}`, ErrorCodes.INVALID_STATEMACHINE);
    }
  }

  protected _requireValidTransitions(transitions: DotLottieTransitions): void {
    const result = safeParse(TransitionsSchema, transitions);

    if (!result.success) {
      const error = `${JSON.stringify(flatten(result.issues).nested, null, 2)}`;

      throw new DotLottieError(`Invalid transition: ${error}`, ErrorCodes.INVALID_STATEMACHINE);
    }
  }
}
