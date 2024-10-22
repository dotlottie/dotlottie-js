/**
 * Copyright 2023 Design Barn Inc.
 */

import {
  object,
  type Output,
  string,
  array,
  boolean,
  number,
  union,
  optional,
  record,
  any,
  nativeEnum,
  literal,
} from 'valibot';

export enum PlayMode {
  Bounce = 'bounce',
  Normal = 'normal',
}

export const PlayModeSchema = nativeEnum(PlayMode);

export const ManifestAnimationSchema = object({
  autoplay: optional(boolean()),
  defaultTheme: optional(string()),
  direction: optional(union([literal(1), literal(-1)])),
  hover: optional(boolean()),
  id: string(),
  intermission: optional(number()),
  loop: optional(union([boolean(), number()])),
  playMode: optional(PlayModeSchema),
  speed: optional(number()),
  themeColor: optional(string()),
});
export type ManifestAnimation = Output<typeof ManifestAnimationSchema>;

export const ManifestThemeSchema = object({
  animations: array(string()),
  id: string(),
});
export type ManifestTheme = Output<typeof ManifestThemeSchema>;

export const ManifestSchema = object({
  activeAnimationId: optional(string()),
  animations: array(ManifestAnimationSchema),
  author: optional(string()),
  custom: optional(record(string(), any())),
  description: optional(string()),
  generator: optional(string()),
  keywords: optional(string()),
  revision: optional(number()),
  themes: optional(array(ManifestThemeSchema)),
  states: optional(array(string())),
  version: optional(string()),
});

export type Manifest = Output<typeof ManifestSchema>;
