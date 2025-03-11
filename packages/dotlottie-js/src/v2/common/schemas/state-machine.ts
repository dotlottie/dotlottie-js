/**
 * Copyright 2023 Design Barn Inc.
 */

import { type Output, boolean, number, object, optional, string, array, union, literal } from 'valibot';

export const NumericGuardSchema = object({
  type: literal('Numeric'),
  inputName: string(),
  conditionType: string(),
  compareTo: union([string(), number(), boolean()]),
});
export const StringGuardSchema = object({
  type: literal('String'),
  inputName: string(),
  conditionType: string(),
  compareTo: string(),
});
export const BooleanGuardSchema = object({
  type: literal('Boolean'),
  inputName: string(),
  conditionType: string(),
  compareTo: union([string(), boolean()]),
});
export const EventGuardSchema = object({
  type: literal('Event'),
  inputName: string(),
});

export const GuardSchema = union([NumericGuardSchema, StringGuardSchema, BooleanGuardSchema, EventGuardSchema]);

// Event Schemas
const NumericEventSchema = object({ value: number() });
const BooleanEventSchema = object({ value: boolean() });
const StringEventSchema = object({ value: string() });
const PointerEventSchema = object({ target: optional(string()) });

// Transition Schema
export const TransitionTransitionSchema = object({
  type: literal('Transition'),
  toState: string(),
  guards: optional(array(GuardSchema)),
});

export const TweenedTransitionSchema = object({
  type: literal('Tweened'),
  toState: string(),
  guards: optional(array(GuardSchema)),
  duration: number(),
  easing: array(number()),
});

export const TransitionsSchema = array(union([TransitionTransitionSchema, TweenedTransitionSchema]));
export const TransitionSchema = union([TransitionTransitionSchema, TweenedTransitionSchema]);

const OpenUrlModes = union([
  string('_blank'),
  string('_self'),
  string('_parent'),
  string('_top'),
  string('_unfencedTop'),
]);

// Entry/Exit Action Schema
const URLActionSchema = object({ type: literal('OpenUrl'), url: string(), target: OpenUrlModes });
const ThemeActionSchema = object({ type: literal('SetTheme'), value: string() });
const IncrementSchema = object({
  type: literal('Increment'),
  inputName: string(),
  value: optional(union([string(), number()])),
});
const DecrementSchema = object({
  type: literal('Decrement'),
  inputName: string(),
  value: optional(union([string(), number()])),
});
const ToggleSchema = object({
  type: literal('Toggle'),
  inputName: string(),
});
const SetBooleanSchema = object({
  type: literal('SetBoolean'),
  inputName: string(),
  value: optional(boolean()),
});
const SetStringSchema = object({
  type: literal('SetString'),
  inputName: string(),
  value: optional(string()),
});
const SetNumericSchema = object({
  type: literal('SetNumeric'),
  inputName: string(),
  value: optional(number()),
});
const FireSchema = object({
  type: literal('Fire'),
  inputName: string(),
});
const ResetSchema = object({
  type: literal('Reset'),
  inputName: string(),
});
const SetExpressionSchema = object({
  type: literal('SetExpression'),
  layerName: string(),
  propertyIndex: number(),
  varName: string(),
  value: number(),
});
const SetThemeSchema = object({
  type: literal('SetTheme'),
  themeId: string(),
});
const SetFrameSchema = object({
  type: literal('SetFrame'),
  value: union([string(), number()]),
});
const SetProgressSchema = object({
  type: literal('SetProgress'),
  value: union([string(), number()]),
});
const SetSlotSchema = object({
  type: literal('SetSlot'),
  value: string(),
});
const FireCustomEventSchema = object({
  type: literal('FireCustomEvent'),
  value: string(),
});

export const ActionSchema = union([
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

const Modes = union([literal('Forward'), literal('Reverse'), literal('Bounce'), literal('ReverseBounce')]);

export const PlaybackStateSchema = object({
  name: string(),
  type: literal('PlaybackState'),
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
  type: literal('GlobalState'),
  entryActions: optional(array(ActionSchema)),
  exitActions: optional(array(ActionSchema)),
  transitions: optional(TransitionsSchema),
});

export const StateSchema = union([PlaybackStateSchema, GlobalStateSchema]);
export const StatesSchema = array(StateSchema);

export const PointerUpSchema = object({
  type: literal('PointerUp'),
  layerName: optional(string()),
  actions: array(ActionSchema),
});

export const PointerDownSchema = object({
  type: literal('PointerDown'),
  layerName: optional(string()),
  actions: array(ActionSchema),
});

export const PointerEnterSchema = object({
  type: literal('PointerEnter'),
  layerName: optional(string()),
  actions: array(ActionSchema),
});

export const PointerMoveSchema = object({
  type: literal('PointerMove'),
  actions: array(ActionSchema),
});

export const PointerExitSchema = object({
  type: literal('PointerExit'),
  layerName: optional(string()),
  actions: array(ActionSchema),
});

export const ClickSchema = object({
  type: literal('Click'),
  layerName: optional(string()),
  actions: array(ActionSchema),
});

export const OnCompleteSchema = object({
  type: literal('OnComplete'),
  stateName: string(),
  actions: array(ActionSchema),
});

export const OnLoopCompleteSchema = object({
  type: literal('OnLoopComplete'),
  stateName: string(),
  actions: array(ActionSchema),
});

export const InteractionSchema = union([
  PointerUpSchema,
  PointerDownSchema,
  PointerEnterSchema,
  PointerMoveSchema,
  PointerExitSchema,
  ClickSchema,
  OnCompleteSchema,
  OnLoopCompleteSchema,
]);
export const InteractionsSchema = array(InteractionSchema);

export const NumericInputSchema = object({
  type: literal('Numeric'),
  name: string(),
  value: number(),
});

export const StringInputSchema = object({
  type: literal('String'),
  name: string(),
  value: string(),
});

export const BooleanInputSchema = object({
  type: literal('Boolean'),
  name: string(),
  value: boolean(),
});

export const EventInputSchema = object({
  type: literal('Event'),
  name: string(),
});

export const InputSchema = union([NumericInputSchema, StringInputSchema, BooleanInputSchema, EventInputSchema]);

export const InputsSchema = array(InputSchema);

export type DotLottieStates = Output<typeof StatesSchema>;
export type DotLottieState = Output<typeof StateSchema>;
export type DotLottieAction = Output<typeof ActionSchema>;
export type DotLottieNumericEvent = Output<typeof NumericEventSchema>;
export type DotLottieBooleanEvent = Output<typeof BooleanEventSchema>;
export type DotLottieStringEvent = Output<typeof StringEventSchema>;
export type DotLottiePointerEvent = Output<typeof PointerEventSchema>;
export type DotLottieGuard = Output<typeof GuardSchema>;
export type DotLottieInput = Output<typeof InputSchema>;
export type DotLottieInputs = Output<typeof InputsSchema>;
export type DotLottieInteraction = Output<typeof InteractionSchema>;
export type DotLottieInteractions = Output<typeof InteractionsSchema>;
export type DotLottieTransition = Output<typeof TransitionSchema>;
export type DotLottieTransitions = Output<typeof TransitionsSchema>;

// DotLottieStateMachine Schema
export const DotLottieStateMachineSchema = object({
  initial: string(),
  states: StatesSchema,
  interactions: optional(InteractionsSchema),
  inputs: optional(InputsSchema),
});
export type DotLottieStateMachine = Output<typeof DotLottieStateMachineSchema>;
