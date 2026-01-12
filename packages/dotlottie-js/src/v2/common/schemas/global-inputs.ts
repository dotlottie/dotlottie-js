/**
 * Copyright 2025 Design Barn Inc.
 */

import type { Output } from 'valibot';
import { array, boolean, literal, number, object, optional, record, string, union } from 'valibot';

export const ThemeBindingSchema = object({
  themeId: string(),
  ruleId: string(),
  path: string(),
});

export const StateMachineBindingSchema = object({
  stateMachineId: string(),
  inputName: array(string()),
});

export const BindingsSchema = object({
  themes: optional(array(ThemeBindingSchema)),
  stateMachines: optional(array(StateMachineBindingSchema)),
});

export const ColorSchema = object({
  type: literal('Color'),
  value: array(number()),
  bindings: optional(BindingsSchema),
});

export const VectorSchema = object({
  type: literal('Vector'),
  value: array(number()),
  bindings: optional(BindingsSchema),
});

export const NumericSchema = object({
  type: literal('Numeric'),
  value: number(),
  bindings: optional(BindingsSchema),
});

export const BooleanSchema = object({
  type: literal('Boolean'),
  value: boolean(),
  bindings: optional(BindingsSchema),
});

export const GradientSchema = object({
  type: literal('Gradient'),
  value: array(
    object({
      color: array(number()),
      offset: number(),
    }),
  ),
  bindings: optional(BindingsSchema),
});

export const ImageSchema = object({
  type: literal('Image'),
  value: object({
    id: optional(string()),
    width: optional(number()),
    height: optional(number()),
    url: optional(string()),
  }),
  bindings: optional(BindingsSchema),
});

export const StringSchema = object({
  type: literal('String'),
  value: string(),
  bindings: optional(BindingsSchema),
});

const RuleSchema = union([
  BooleanSchema,
  NumericSchema,
  ColorSchema,
  VectorSchema,
  ImageSchema,
  GradientSchema,
  StringSchema,
]);

export const DotLottieGlobalInputsSchema = record(string(), RuleSchema);

export type DotLottieGlobalInputs = Output<typeof DotLottieGlobalInputsSchema>;
export type DotLottieGlobalInput = Output<typeof RuleSchema>;
export type DotLottieGlobalInputBindings = Output<typeof BindingsSchema>;
