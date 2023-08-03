/**
 * Copyright 2023 Design Barn Inc.
 */

import { z } from 'zod';

export const PlayModeSchema = z.union([z.literal('bounce'), z.literal('normal')]);

export type PlayMode = z.infer<typeof PlayModeSchema>;

export const ManifestAnimationSchema = z.object({
  autoplay: z.boolean().optional(),
  defaultTheme: z.string().optional(),
  direction: z.number().optional(),
  hover: z.boolean().optional(),
  id: z.string(),
  intermission: z.number().optional(),
  loop: z.union([z.boolean(), z.number()]).optional(),
  playMode: PlayModeSchema.optional(),
  speed: z.number().optional(),
  themeColor: z.string().optional(),
});
export type ManifestAnimation = z.infer<typeof ManifestAnimationSchema>;

export const ManifestThemeSchema = z.object({
  animations: z.array(z.string()),
  id: z.string(),
});
export type ManifestTheme = z.infer<typeof ManifestThemeSchema>;

export const ManifestSchema = z.object({
  activeAnimationId: z.string().optional(),
  animations: z.array(ManifestAnimationSchema),
  author: z.string().optional(),
  custom: z.record(z.unknown()).optional(),
  description: z.string().optional(),
  generator: z.string().optional(),
  keywords: z.string().optional(),
  revision: z.number().optional(),
  themes: z.array(ManifestThemeSchema).optional(),
  version: z.string().optional(),
});
export type Manifest = z.infer<typeof ManifestSchema>;
