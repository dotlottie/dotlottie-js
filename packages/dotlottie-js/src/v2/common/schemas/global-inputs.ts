/**
 * Copyright 2025 Design Barn Inc.
 */

import type { Output} from "valibot";
import { array, boolean, literal, number, object, optional, record, string, union } from "valibot";

export const ColorSchema = object({
  type: literal('Color'),
  value: array(number())
});

export const VectorSchema = object({
  type: literal('Vector'),
  value: array(number())
});

export const ScalarSchema = object({
  type: literal('Scalar'),
  value: number()
});

export const BooleanSchema = object({
  type: literal('Boolean'),
  value: boolean()
});

export const GradientSchema = object({
  type: literal('Gradient'),
  value: array(
    object({
      value: optional(union([string(), array(number())])),
      offset: number(),
    }),
  ),
});

export const ImageSchema = object({
  type: literal('Image'),
  value: object({
    id: optional(string()),
    width: optional(number()),
    height: optional(number()),
    url: optional(string()),
  }),
});

const RuleSchema = union([
  BooleanSchema, 
  ScalarSchema,  
  ColorSchema,   
  VectorSchema,  
  ImageSchema,   
  GradientSchema,
]);

export const GlobalInputsSchema = record(string(), RuleSchema);

export type GlobalInputs = Output<typeof GlobalInputsSchema>;
