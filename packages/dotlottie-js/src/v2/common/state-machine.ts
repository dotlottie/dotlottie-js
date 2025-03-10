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
import {
  InteractionsSchema,
  StatesSchema,
  ActionSchema,
  TransitionsSchema,
  InputsSchema,
  TweenedTransitionSchema,
  TransitionTransitionSchema,
  PlaybackStateSchema,
  GlobalStateSchema,
} from './schemas';

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
      const error = `Invalid state machine declaration, ${JSON.stringify(flatten(result.issues).nested, null, 2)}`;

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
      const error = `Invalid state machine declaration, ${JSON.stringify(flatten(result.issues).nested, null, 2)}`;

      throw new DotLottieError(`Invalid states: ${error}`, ErrorCodes.INVALID_STATEMACHINE);
    }

    for (const state of states) {
      if (state.type === 'PlaybackState') {
        const stateResult = safeParse(PlaybackStateSchema, state);

        if (!stateResult.success) {
          const error = `Invalid state machine declaration, ${JSON.stringify(
            flatten(stateResult.issues).nested,
            null,
            2,
          )}`;

          throw new DotLottieError(`Invalid transitions: ${error}`, ErrorCodes.INVALID_STATEMACHINE);
        }
      } else if (state.type === 'GlobalState') {
        const stateResult = safeParse(GlobalStateSchema, state);

        if (!stateResult.success) {
          const error = `Invalid state machine declaration, ${JSON.stringify(
            flatten(stateResult.issues).nested,
            null,
            2,
          )}`;

          throw new DotLottieError(`Invalid transitions: ${error}`, ErrorCodes.INVALID_STATEMACHINE);
        }
      } else {
        const error = `Invalid state machine declaration, type: ${state.type} does not match any known State types.`;

        throw new DotLottieError(`Invalid transitions: ${error}`, ErrorCodes.INVALID_STATEMACHINE);
      }
    }

    // loop over every transition and validate it
    for (const state of states) {
      if (state.transitions) {
        this._requireValidTransitions(state.transitions);
      }
    }
  }

  protected _requireValidInputs(inputs: DotLottieInputs): void {
    const result = safeParse(InputsSchema, inputs);

    if (!result.success) {
      const error = `Invalid state machine declaration, ${JSON.stringify(flatten(result.issues).nested, null, 2)}`;

      throw new DotLottieError(`Invalid context variables: ${error}`, ErrorCodes.INVALID_STATEMACHINE);
    }
  }

  protected _requireValidInteractions(interactions: DotLottieInteractions): void {
    const result = safeParse(InteractionsSchema, interactions);

    for (const interaction of interactions) {
      for (const action of interaction.actions) {
        const actionResult = safeParse(ActionSchema, action);

        if (!actionResult.success) {
          const error = `Invalid state machine declaration, ${JSON.stringify(
            flatten(actionResult.issues).nested,
            null,
            2,
          )}`;

          throw new DotLottieError(`Invalid interaction actions: ${error}`, ErrorCodes.INVALID_STATEMACHINE);
        }
      }
    }

    if (!result.success) {
      const error = `Invalid state machine declaration, ${JSON.stringify(flatten(result.issues).nested, null, 2)}`;

      throw new DotLottieError(`Invalid interactions: ${error}`, ErrorCodes.INVALID_STATEMACHINE);
    }
  }

  protected _requireValidTransitions(transitions: DotLottieTransitions): void {
    const result = safeParse(TransitionsSchema, transitions);

    if (!result.success) {
      const error = `Invalid state machine declaration, ${JSON.stringify(flatten(result.issues).nested, null, 2)}`;

      throw new DotLottieError(`Invalid transitions: ${error}`, ErrorCodes.INVALID_STATEMACHINE);
    }

    for (const transition of transitions) {
      if (transition.type === 'Tweened') {
        const transitionResult = safeParse(TweenedTransitionSchema, transition);

        if (!transitionResult.success) {
          const error = `Invalid state machine declaration, ${JSON.stringify(
            flatten(transitionResult.issues).nested,
            null,
            2,
          )}`;

          throw new DotLottieError(`Invalid transitions: ${error}`, ErrorCodes.INVALID_STATEMACHINE);
        }
      } else if (transition.type === 'Transition') {
        const transitionResult = safeParse(TransitionTransitionSchema, transition);

        if (!transitionResult.success) {
          const error = `Invalid state machine declaration, ${JSON.stringify(
            flatten(transitionResult.issues).nested,
            null,
            2,
          )}`;

          throw new DotLottieError(`Invalid transitions: ${error}`, ErrorCodes.INVALID_STATEMACHINE);
        }
      } else {
        const error = `Invalid state machine declaration, type: ${transition.type} does not match any known Transition types.`;

        throw new DotLottieError(`Invalid transitions: ${error}`, ErrorCodes.INVALID_STATEMACHINE);
      }
    }
  }
}
