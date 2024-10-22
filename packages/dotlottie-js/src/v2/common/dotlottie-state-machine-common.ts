/**
 * Copyright 2023 Design Barn Inc.
 */

/* eslint-disable @typescript-eslint/naming-convention */

import type { ZipOptions } from 'fflate';
import { safeParse, flatten } from 'valibot';

import type {
  DotLottieContextVariables,
  DotLottieDescriptor,
  DotLottieListener,
  DotLottieListeners,
  DotLottieStates,
  DotLottieTransition,
  DotLottieTransitions,
} from './dotlottie-state';
import {
  ContextVariablesSchema,
  DescriptorSchema,
  ListenersSchemas,
  StatesSchema,
  TransitionsSchema,
} from './dotlottie-state';
import { DotLottieError, ErrorCodes } from './utils';

export interface DotLottieStateMachineCommonOptions {
  context_variables: DotLottieContextVariables;
  descriptor: DotLottieDescriptor;
  listeners: DotLottieListeners;
  states: DotLottieStates;
  transitions: DotLottieTransitions;
  zipOptions?: ZipOptions;
}

export class DotLottieStateMachineCommon {
  protected _descriptor: DotLottieDescriptor;

  protected _zipOptions: ZipOptions;

  protected _states: DotLottieStates;

  protected _transitions: DotLottieTransition[];

  protected _listeners: DotLottieListener[];

  protected _contextVariables: DotLottieContextVariables;

  public constructor(options: DotLottieStateMachineCommonOptions) {
    this._requireValidContextVariables(options.context_variables);
    this._requireValidListeners(options.listeners);
    this._requireValidTransitions(options.transitions);
    this._requireValidId(options.descriptor.id);
    this._requireValidStates(options.states);
    this._requireValidDescriptor(options.descriptor);

    this._descriptor = options.descriptor;

    this._zipOptions = options.zipOptions ?? {};

    this._states = options.states;

    this._descriptor = options.descriptor;

    this._listeners = options.listeners;

    this._transitions = options.transitions;

    this._contextVariables = options.context_variables;
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

  public get transitions(): DotLottieTransition[] {
    return this._transitions;
  }

  public set transitions(transitions: DotLottieTransition[]) {
    this._transitions = transitions;
  }

  public get listeners(): DotLottieListener[] {
    return this._listeners;
  }

  public set listeners(listeners: DotLottieListener[]) {
    this._listeners = listeners;
  }

  public get contextVariables(): DotLottieContextVariables {
    return this._contextVariables;
  }

  public set contextVariables(contextVariables: DotLottieContextVariables) {
    this._contextVariables = contextVariables;
  }

  public get initial(): number {
    return this._descriptor.initial;
  }

  public set initial(initial: number) {
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
      transitions: this._transitions,
      context_variables: this._contextVariables,
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
  }

  protected _requireValidContextVariables(contextVariables: DotLottieContextVariables): void {
    const result = safeParse(ContextVariablesSchema, contextVariables);

    if (!result.success) {
      const error = `Invalid state machine declaration, ${JSON.stringify(flatten(result.issues).nested, null, 2)}`;

      throw new DotLottieError(`Invalid context variables: ${error}`, ErrorCodes.INVALID_STATEMACHINE);
    }
  }

  protected _requireValidListeners(listeners: DotLottieListeners): void {
    const result = safeParse(ListenersSchemas, listeners);

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
