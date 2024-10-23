/**
 * Copyright 2023 Design Barn Inc.
 */

import { object, type Output, string, array, optional } from 'valibot';

export const ManifestAnimationSchema = object({
  initialTheme: optional(string()),
  themes: optional(array(string())),
  id: string(),
  background: optional(string()),
});
export type ManifestAnimation = Output<typeof ManifestAnimationSchema>;

export const ManifestSchema = object({
  animations: array(ManifestAnimationSchema),
  // add the max length of the generator
  generator: string(),
  themes: optional(array(string())),
  stateMachines: optional(array(string())),
  version: string(),
});

export type Manifest = Output<typeof ManifestSchema>;
