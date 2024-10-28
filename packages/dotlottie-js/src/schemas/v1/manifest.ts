/**
 * Copyright 2024 Design Barn Inc.
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
  id: string(),

  autoplay: optional(boolean()),
  loop: optional(union([boolean(), number()])),
  speed: optional(number()),
  direction: optional(union([literal(1), literal(-1)])),
  playMode: optional(PlayModeSchema),
  hover: optional(boolean()),
  intermission: optional(number()),
  themeColor: optional(string()),
});
export type ManifestAnimation = Output<typeof ManifestAnimationSchema>;

export const ManifestThemeSchema = object({
  animations: array(string()),
  id: string(),
});
export type ManifestTheme = Output<typeof ManifestThemeSchema>;

export const ManifestSchema = object({
  version: optional(string()),
  generator: optional(string()),

  activeAnimationId: optional(string()),
  animations: array(ManifestAnimationSchema),
  author: optional(string()),
  custom: optional(record(string(), any())),
  description: optional(string()),
  keywords: optional(string()),
  revision: optional(number()),
});

export type Manifest = Output<typeof ManifestSchema>;
