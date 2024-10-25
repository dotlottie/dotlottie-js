/**
 * Copyright 2023 Design Barn Inc.
 */

import { type Output, string, array, optional, record, any, object, number } from 'valibot';

export const ManifestAnimationSchema = object({
  id: string(),
});

export const ManifestSchema = object({
  animations: array(ManifestAnimationSchema),
  author: optional(string()),
  custom: optional(record(string(), any())),
  description: optional(string()),
  keywords: optional(string()),
  revision: optional(number()),
  generator: string(),
  version: string(),
});

export type Manifest = Output<typeof ManifestSchema>;
