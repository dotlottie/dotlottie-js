/**
 * Copyright 2023 Design Barn Inc.
 */

/* eslint-disable @typescript-eslint/naming-convention */

import type { Output } from 'valibot';
import { boolean, number, object, optional, string, array, union, tuple } from 'valibot';

const NumericStringBooleanType = union([string('Numeric'), string('String'), string('Boolean')]);

// Guard Schema
export const GuardSchema = object({
  type: NumericStringBooleanType,
  context_key: string(),
  condition_type: string(),
  compare_to: union([string(), number(), boolean()]),
});

// Event Schemas
const NumericEventSchema = object({ value: number() });
const BooleanEventSchema = object({ value: boolean() });
const StringEventSchema = object({ value: string() });
const PointerEventSchema = object({ target: optional(string()) });

// const TransitionType = union([string('Transition')]);
const TransitionType = string('Transition');

// Transition Schema
export const TransitionSchema = object({
  type: TransitionType,
  from_state: number(),
  to_state: number(),
  guards: optional(array(GuardSchema)),
  numeric_event: optional(NumericEventSchema),
  boolean_event: optional(BooleanEventSchema),
  string_event: optional(StringEventSchema),
  on_complete_event: optional(object({})),
  on_pointer_down_event: optional(PointerEventSchema),
  on_pointer_up_event: optional(PointerEventSchema),
  on_pointer_enter_event: optional(PointerEventSchema),
  on_pointer_exit_event: optional(PointerEventSchema),
  on_pointer_move_event: optional(PointerEventSchema),
});

export const TransitionsSchema = array(TransitionSchema);

// Entry/Exit Action Schema
const URLActionSchema = object({ type: string(), url: string(), target: string() });
const ThemeActionSchema = object({ type: string(), themeId: string() });
const SoundActionSchema = object({ type: string(), soundId: string() });
const LogActionSchema = object({ type: string(), message: string() });

const ActionSchema = union([URLActionSchema, ThemeActionSchema, SoundActionSchema, LogActionSchema]);

const Modes = union([string('Forward'), string('Reverse'), string('Bounce'), string('ReverseBounce')]);

const StateType = union([string('PlaybackState'), string('FinalState'), string('SyncState'), string('GobalState')]);

export const PlaybackStateSchema = object({
  type: StateType,
  animation_id: optional(string()),
  loop: optional(boolean()),
  autoplay: optional(boolean()),
  mode: optional(Modes),
  speed: optional(number()),
  marker: optional(string()),
  segment: optional(optional(tuple([number(), number()]))),
  use_frame_interpolation: optional(boolean()),
  reset_context: optional(string()),
  entry_actions: optional(array(ActionSchema)),
  exit_actions: optional(array(ActionSchema)),
});

export const SyncStateSchema = object({
  type: string(),
  animation_id: optional(string()),
  frame_context_key: string(),
  reset_context: string(),
  entry_actions: optional(array(ActionSchema)),
  exit_actions: optional(array(ActionSchema)),
});

export const FinalStateSchema = object({
  type: string(),
  reset_context: string(),
  entry_actions: optional(array(ActionSchema)),
  exit_actions: optional(array(ActionSchema)),
});

export const GlobalStateSchema = object({
  type: string(),
  reset_context: string(),
  entry_actions: optional(array(ActionSchema)),
  exit_actions: optional(array(ActionSchema)),
});

export const StateSchema = union([PlaybackStateSchema, SyncStateSchema, FinalStateSchema, GlobalStateSchema]);
export const StatesSchema = array(StateSchema);

// Listener Schema
export const ListenerSchema = object({
  type: string(),
  target: optional(string()),
  action: string(),
  value: union([string(), boolean(), number()]),
  context_key: string(),
});

export const ListenersSchemas = array(ListenerSchema);

// Context Variable Schema
export const ContextVariableSchema = object({
  type: NumericStringBooleanType,
  key: string(),
  value: union([number(), string(), boolean()]),
});

export const ContextVariablesSchema = array(ContextVariableSchema);

// Descriptor Schema
export const DescriptorSchema = object({
  id: string(),
  initial: number(),
});

export type DotLottieStates = Output<typeof StatesSchema>;
export type DotLottieDescriptor = Output<typeof DescriptorSchema>;
export type DotLottieState = Output<typeof StateSchema>;
export type DotLottieAction = Output<typeof ActionSchema>;
export type DotLottieNumericEvent = Output<typeof NumericEventSchema>;
export type DotLottieBooleanEvent = Output<typeof BooleanEventSchema>;
export type DotLottieStringEvent = Output<typeof StringEventSchema>;
export type DotLottiePointerEvent = Output<typeof PointerEventSchema>;
export type DotLottieGuard = Output<typeof GuardSchema>;
export type DotLottieContextVariables = Output<typeof ContextVariablesSchema>;
export type DotLottieListener = Output<typeof ListenerSchema>;
export type DotLottieListeners = Output<typeof ListenersSchemas>;
export type DotLottieTransition = Output<typeof TransitionSchema>;
export type DotLottieTransitions = Output<typeof TransitionsSchema>;

// DotLottieStateMachine Schema
export const DotLottieStateMachineSchema = object({
  descriptor: DescriptorSchema,
  states: StatesSchema,
  transitions: TransitionsSchema,
  listeners: ListenersSchemas,
  context_variables: ContextVariablesSchema,
});
export type DotLottieStateMachine = Output<typeof DotLottieStateMachineSchema>;
