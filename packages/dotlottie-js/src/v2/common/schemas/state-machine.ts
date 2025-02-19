/**
 * Copyright 2023 Design Barn Inc.
 */

import { type Output, boolean, number, object, optional, string, array, union } from 'valibot';

export const NumericGuardSchema = object({
  type: string('Numeric'),
  triggerName: string(),
  conditionType: string(),
  compareTo: union([string(), number(), boolean()]),
});
export const StringGuardSchema = object({
  type: string('String'),
  triggerName: string(),
  conditionType: string(),
  compareTo: string(),
});
export const BooleanGuardSchema = object({
  type: string('Boolean'),
  triggerName: string(),
  conditionType: string(),
  compareTo: union([string(), boolean()]),
});
export const EventGuardSchema = object({
  type: string('Event'),
  triggerName: string(),
});

export const GuardSchema = union([NumericGuardSchema, StringGuardSchema, BooleanGuardSchema, EventGuardSchema]);

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
  toState: string(),
  guards: optional(array(GuardSchema)),
});

export const TransitionsSchema = array(TransitionSchema);

// Entry/Exit Action Schema
const URLActionSchema = object({ type: string(), url: string(), target: string() });
const ThemeActionSchema = object({ type: string(), themeId: string() });
const IncrementSchema = object({
  type: string(),
  triggerName: string(),
  value: optional(union([string(), number()])),
});
const DecrementSchema = object({
  type: string(),
  triggerName: string(),
  value: optional(union([string(), number()])),
});
const ToggleSchema = object({
  type: string(),
  triggerName: string(),
});
const SetBooleanSchema = object({
  type: string(),
  triggerName: string(),
  value: optional(boolean()),
});
const SetStringSchema = object({
  type: string(),
  triggerName: string(),
  value: optional(string()),
});
const SetNumericSchema = object({
  type: string(),
  triggerName: string(),
  value: optional(number()),
});
const FireSchema = object({
  type: string(),
  triggerName: string(),
});
const ResetSchema = object({
  type: string(),
  triggerName: string(),
});
const SetExpressionSchema = object({
  type: string(),
  layerName: string(),
  propertyIndex: number(),
  varName: string(),
  value: number(),
});
const SetThemeSchema = object({
  type: string(),
  themeId: string(),
});
const SetFrameSchema = object({
  type: string(),
  value: union([string(), number()]),
});
const SetProgressSchema = object({
  type: string(),
  value: union([string(), number()]),
});
const SetSlotSchema = object({
  type: string(),
  value: string(),
});
const FireCustomEventSchema = object({
  type: string(),
  value: string(),
});

const ActionSchema = union([
  URLActionSchema,
  ThemeActionSchema,
  IncrementSchema,
  DecrementSchema,
  ToggleSchema,
  SetBooleanSchema,
  SetStringSchema,
  SetNumericSchema,
  FireSchema,
  ResetSchema,
  SetExpressionSchema,
  SetThemeSchema,
  SetFrameSchema,
  SetProgressSchema,
  SetSlotSchema,
  FireCustomEventSchema,
]);

const Modes = union([string('Forward'), string('Reverse'), string('Bounce'), string('ReverseBounce')]);

const StateType = union([string('PlaybackState'), string('GlobalState')]);

export const PlaybackStateSchema = object({
  name: string(),
  type: StateType,
  animation: string(),
  loop: optional(boolean()),
  autoplay: optional(boolean()),
  final: optional(boolean()),
  mode: optional(Modes),
  speed: optional(number()),
  segment: optional(string()),
  backgroundColor: optional(number()),
  useFrameInterpolation: optional(boolean()),
  entryActions: optional(array(ActionSchema)),
  exitActions: optional(array(ActionSchema)),
  transitions: optional(TransitionsSchema),
});

export const GlobalStateSchema = object({
  name: string(),
  type: StateType,
  entryActions: optional(array(ActionSchema)),
  exitActions: optional(array(ActionSchema)),
  transitions: optional(TransitionsSchema),
});

export const StateSchema = union([PlaybackStateSchema, GlobalStateSchema]);
export const StatesSchema = array(StateSchema);

export const PointerUpSchema = object({
  type: string(),
  layerName: optional(string()),
  actions: array(ActionSchema),
});

export const PointerDownSchema = object({
  type: string(),
  layerName: optional(string()),
  actions: array(ActionSchema),
});

export const PointerEnterSchema = object({
  type: string(),
  layerName: optional(string()),
  actions: array(ActionSchema),
});

export const PointerMoveSchema = object({
  type: string(),
  actions: array(ActionSchema),
});

export const PointerExitSchema = object({
  type: string(),
  layerName: optional(string()),
  actions: array(ActionSchema),
});

export const OnCompleteSchema = object({
  type: string(),
  stateName: string(),
  actions: array(ActionSchema),
});

export const OnLoopCompleteSchema = object({
  type: string(),
  stateName: string(),
  actions: array(ActionSchema),
});

export const ListenerSchema = union([
  PointerUpSchema,
  PointerDownSchema,
  PointerEnterSchema,
  PointerMoveSchema,
  PointerExitSchema,
  OnCompleteSchema,
  OnLoopCompleteSchema,
]);
export const ListenersSchema = array(ListenerSchema);

export const NumericTriggerSchema = object({
  type: string('Numeric'),
  name: string(),
  value: number(),
});

export const StringTriggerSchema = object({
  type: string('String'),
  name: string(),
  value: string(),
});

export const BooleanTriggerSchema = object({
  type: string('Boolean'),
  name: string(),
  value: boolean(),
});

export const EventTriggerSchema = object({
  type: string('Event'),
  name: string(),
});

export const TriggerSchema = union([
  NumericTriggerSchema,
  StringTriggerSchema,
  BooleanTriggerSchema,
  EventTriggerSchema,
]);

export const TriggersSchema = array(TriggerSchema);

export type DotLottieStates = Output<typeof StatesSchema>;
export type DotLottieState = Output<typeof StateSchema>;
export type DotLottieAction = Output<typeof ActionSchema>;
export type DotLottieNumericEvent = Output<typeof NumericEventSchema>;
export type DotLottieBooleanEvent = Output<typeof BooleanEventSchema>;
export type DotLottieStringEvent = Output<typeof StringEventSchema>;
export type DotLottiePointerEvent = Output<typeof PointerEventSchema>;
export type DotLottieGuard = Output<typeof GuardSchema>;
export type DotLottieTrigger = Output<typeof TriggerSchema>;
export type DotLottieTriggers = Output<typeof TriggersSchema>;
export type DotLottieListener = Output<typeof ListenerSchema>;
export type DotLottieListeners = Output<typeof ListenersSchema>;
export type DotLottieTransition = Output<typeof TransitionSchema>;
export type DotLottieTransitions = Output<typeof TransitionsSchema>;

// DotLottieStateMachine Schema
export const DotLottieStateMachineSchema = object({
  initial: string(),
  states: StatesSchema,
  listeners: optional(ListenersSchema),
  triggers: optional(TriggersSchema),
});
export type DotLottieStateMachine = Output<typeof DotLottieStateMachineSchema>;
