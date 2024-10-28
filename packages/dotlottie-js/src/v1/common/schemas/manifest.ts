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

export const ManifestAnimationSchemaV1 = object({
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
export type ManifestAnimationV1 = Output<typeof ManifestAnimationSchemaV1>;

export const ManifestSchemaV1 = object({
  version: optional(string()),
  generator: optional(string()),

  activeAnimationId: optional(string()),
  animations: array(ManifestAnimationSchemaV1),
  author: optional(string()),
  custom: optional(record(string(), any())),
  description: optional(string()),
  keywords: optional(string()),
  revision: optional(number()),
});

export type ManifestV1 = Output<typeof ManifestSchemaV1>;
