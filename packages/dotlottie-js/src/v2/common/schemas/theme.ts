/**
 * Copyright 2024 Design Barn Inc.
 */

import type { Output } from 'valibot';
import { object, union, number, array, optional, boolean, string, literal } from 'valibot';

const TangentSchema = object({
  x: union([number(), array(number())]),
  y: union([number(), array(number())]),
});

const BaseKeyframeSchema = {
  frame: number(),
  inTangent: optional(TangentSchema),
  outTangent: optional(TangentSchema),
  hold: optional(boolean()),
};

const ScalarKeyframeSchema = object({
  ...BaseKeyframeSchema,
  value: number(),
});

const ColorKeyframeSchema = object({
  ...BaseKeyframeSchema,
  value: array(number()),
});

const BaseRuleSchema = {
  animations: optional(array(string())),
  id: string(),
};

export const ScalarRuleSchema = object({
  ...BaseRuleSchema,
  type: literal('Scalar'),
  value: optional(union([string(), number()])),

  keyframes: optional(array(ScalarKeyframeSchema)),
  expression: optional(string()),
});

const PositionKeyframeSchema = object({
  ...BaseKeyframeSchema,
  value: optional(union([string(), array(number())])),
  valueInTangent: optional(number()),
  valueOutTangent: optional(number()),
});

const PositionRuleSchema = object({
  ...BaseRuleSchema,
  type: literal('Position'),
  split: optional(boolean()),
  keyframes: optional(array(PositionKeyframeSchema)),
  expression: optional(string()),
});

const VectorKeyframeSchema = object({
  ...BaseKeyframeSchema,
  value: array(number()),
});

const VectorRuleSchema = object({
  ...BaseRuleSchema,
  type: literal('Vector'),
  value: optional(union([string(), array(number())])),
  keyframes: optional(array(VectorKeyframeSchema)),
  expression: optional(string()),
});

const ColorRuleSchema = object({
  ...BaseRuleSchema,
  type: literal('Color'),
  value: optional(union([string(), array(number())])),
  keyframes: optional(array(ColorKeyframeSchema)),
  expression: optional(string()),
});

const ImageRuleSchema = object({
  ...BaseRuleSchema,
  type: literal('Image'),
  value: object({
    id: optional(string()),
    width: optional(number()),
    height: optional(number()),
    url: optional(string()),
  }),
});

const GradientKeyframeSchema = object({
  ...BaseKeyframeSchema,
  value: array(
    object({
      value: optional(union([string(), array(number())])),
      offset: number(),
    }),
  ),
});

const GradientRuleSchema = object({
  ...BaseRuleSchema,
  type: literal('Gradient'),
  value: optional(
    array(
      object({
        value: optional(union([string(), array(number())])),
        offset: number(),
      }),
    ),
  ),
  keyframes: optional(array(GradientKeyframeSchema)),
});

const RuleSchema = union([
  ColorRuleSchema,
  ScalarRuleSchema,
  PositionRuleSchema,
  VectorRuleSchema,
  ImageRuleSchema,
  GradientRuleSchema,
]);

export const RulesSchema = array(RuleSchema);

export const ThemeDataSchema = object({
  rules: RulesSchema,
});

export type ThemeData = Output<typeof ThemeDataSchema>;
export type Rules = Output<typeof RulesSchema>;
