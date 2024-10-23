/**
 * Copyright 2023 Design Barn Inc.
 */

import { object, type Output, string, array, optional, nativeEnum } from 'valibot';

export enum PlayMode {
  Bounce = 'bounce',
  Normal = 'normal',
}

export const PlayModeSchema = nativeEnum(PlayMode);

export const ManifestAnimationSchema = object({
  initialTheme: optional(string()),
  id: string(),
  background: optional(string()),
});
export type ManifestAnimation = Output<typeof ManifestAnimationSchema>;

export const ManifestSchema = object({
  animations: array(ManifestAnimationSchema),
  generator: optional(string()),
  themes: optional(array(string())),
  states: optional(array(string())),
  version: optional(string()),
});

export type Manifest = Output<typeof ManifestSchema>;
