/**
 * Copyright 2023 Design Barn Inc.
 */

import { type Output, string, array, optional, object } from 'valibot';

export const ManifestAnimationSchema = object({
  id: string(),
  name: optional(string()),
  initialTheme: optional(string()),
  background: optional(string()),
  themes: optional(array(string())),
});
export type ManifestAnimation = Output<typeof ManifestAnimationSchema>;

export const ManifestThemeSchema = object({
  id: string(),
  name: optional(string()),
});
export type ManifestTheme = Output<typeof ManifestThemeSchema>;

export const ManifestStateMachineSchema = object({
  id: string(),
  name: optional(string()),
});
export type ManifestStateMachine = Output<typeof ManifestStateMachineSchema>;

export const InitialObjectSchema = object({
  animation: optional(string()),
  stateMachine: optional(string()),
});

export const ManifestSchema = object({
  version: string(),
  generator: string(),
  initial: optional(InitialObjectSchema),
  animations: array(ManifestAnimationSchema),
  themes: optional(array(ManifestThemeSchema)),
  stateMachines: optional(array(ManifestStateMachineSchema)),
});

export type Manifest = Output<typeof ManifestSchema>;
