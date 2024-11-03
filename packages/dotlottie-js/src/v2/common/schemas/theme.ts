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
  slotId: string(),
};

const ScalarRuleSchema = object({
  ...BaseRuleSchema,
  type: literal('Scalar'),
  value: optional(number()),
  keyframes: optional(array(ScalarKeyframeSchema)),
});

const PositionKeyframeSchema = object({
  ...BaseKeyframeSchema,
  value: array(number()),
  valueInTangent: optional(number()),
  valueOutTangent: optional(number()),
});

const PositionRuleSchema = object({
  ...BaseRuleSchema,
  type: literal('Position'),
  keyframes: optional(array(PositionKeyframeSchema)),
});

const ColorRuleSchema = object({
  ...BaseRuleSchema,
  type: literal('Color'),
  value: optional(array(number())),
  keyframes: optional(array(ColorKeyframeSchema)),
});

export const RulesSchema = array(union([ColorRuleSchema, ScalarRuleSchema, PositionRuleSchema]));

export const ThemeDataSchema = object({
  id: optional(string()),
  rules: RulesSchema,
});

export type ThemeData = Output<typeof ThemeDataSchema>;
export type Rules = Output<typeof RulesSchema>;
