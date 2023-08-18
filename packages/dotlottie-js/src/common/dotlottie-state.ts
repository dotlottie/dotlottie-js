/**
 * Copyright 2023 Design Barn Inc.
 */

import type { Output } from 'valibot';
import {
  merge,
  number,
  object,
  optional,
  string,
  union,
  omit,
  record,
  tuple,
  maxValue,
  minValue,
  array,
} from 'valibot';

import { ManifestAnimationSchema } from './manifest';

export const PlaybackOptionsSchema = omit(ManifestAnimationSchema, ['id']);

export type PlaybackOptions = Output<typeof PlaybackOptionsSchema>;

export const TransitionableSchema = object({
  state: string(),
});
export type Transitionable = Output<typeof TransitionableSchema>;

export const StateTransitionOnClickSchema = TransitionableSchema;

export type StateTransitionOnClick = Output<typeof StateTransitionOnClickSchema>;

export const StateTransitionOnAfterSchema = merge([TransitionableSchema, object({ ms: number() })]);

export type StateTransitionOnAfter = Output<typeof StateTransitionOnAfterSchema>;

export const StateTransitionOnEnterSchema = merge([TransitionableSchema, object({ count: number() })]);

export type StateTransitionOnEnter = Output<typeof StateTransitionOnEnterSchema>;

export const StateTransitionOnMouseEnterSchema = TransitionableSchema;

export type StateTransitionOnMouseEnter = Output<typeof StateTransitionOnMouseEnterSchema>;

export const StateTransitionOnMouseLeaveSchema = TransitionableSchema;

export type StateTransitionOnMouseLeave = Output<typeof StateTransitionOnMouseLeaveSchema>;

export const StateTransitionOnCompleteSchema = TransitionableSchema;

export type StateTransitionOnComplete = Output<typeof StateTransitionOnCompleteSchema>;

export const StateTransitionOnShowSchema = merge([
  TransitionableSchema,
  object({ threshold: optional(array(number([minValue(0), maxValue(1)]))) }),
]);
export type StateTransitionOnShow = Output<typeof StateTransitionOnShowSchema>;

export const DotLottieStateTransitionEventsSchema = object({
  onAfter: optional(StateTransitionOnAfterSchema),
  onClick: optional(StateTransitionOnClickSchema),
  onComplete: optional(StateTransitionOnCompleteSchema),
  onEnter: optional(StateTransitionOnEnterSchema),
  onMouseEnter: optional(StateTransitionOnMouseEnterSchema),
  onMouseLeave: optional(StateTransitionOnMouseLeaveSchema),
  onShow: optional(StateTransitionOnShowSchema),
});
export type DotLottieStateTransitionEvents = Output<typeof DotLottieStateTransitionEventsSchema>;

export const DotLottieStatePlaybackSettingsSchema = merge([
  PlaybackOptionsSchema,
  object({
    playOnScroll: optional(tuple([number([minValue(0), maxValue(1)]), number([minValue(0), maxValue(1)])])),
    segments: optional(union([tuple([number(), number()]), string()])),
  }),
]);
export type DotLottieStatePlaybackSettings = Output<typeof DotLottieStatePlaybackSettingsSchema>;

export const DotLottieStateSchema = merge([
  DotLottieStateTransitionEventsSchema,
  object({
    animationId: optional(string()),
    playbackSettings: DotLottieStatePlaybackSettingsSchema,
  }),
]);
export type DotLottieState = Output<typeof DotLottieStateSchema>;

export const DotLottieStatesSchema = record(string(), DotLottieStateSchema);
export type DotLottieStates = Output<typeof DotLottieStatesSchema>;

export const DotLottieStateMachineDescriptorSchema = object({
  id: string(),
  initial: string(),
});
export type DotLottieStateMachineDescriptor = Output<typeof DotLottieStateMachineDescriptorSchema>;

export const DotLottieStateMachineSchema = object({
  descriptor: DotLottieStateMachineDescriptorSchema,
  states: DotLottieStatesSchema,
});
export type DotLottieStateMachine = Output<typeof DotLottieStateMachineSchema>;
