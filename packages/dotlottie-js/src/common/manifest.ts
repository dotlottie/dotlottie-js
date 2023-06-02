/**
 * Copyright 2023 Design Barn Inc.
 */

export enum PlayMode {
  Bounce = 'bounce',
  Normal = 'normal',
}

export interface ManifestAnimation {
  autoplay?: boolean;

  // default theme id
  defaultTheme?: string;

  // Define playback direction 1 forward, -1 backward
  direction?: number;

  // Play on hover
  hover?: boolean;

  id: string;

  // Time to wait between loops in milliseconds
  intermission?: number;

  loop?: boolean | number;

  // Choice between 'bounce' and 'normal'
  playMode?: PlayMode;

  // Desired playback speed, default 1.0
  speed?: number;

  // Theme color
  themeColor?: string;
}

export interface ManifestTheme {
  // scoped animations ids
  animations: string[];

  id: string;
}

export interface Manifest {
  // Default animation to play
  activeAnimationId?: string;

  // List of animations
  animations: ManifestAnimation[];

  // Name of the author
  author?: string | undefined;

  // Custom data to be made available to the player and animations
  custom?: Record<string, unknown>;

  // Description of the animation
  description?: string | undefined;

  // Name and version of the software that created the dotLottie
  generator?: string | undefined;

  // Description of the animation
  keywords?: string | undefined;

  // Revision version number of the dotLottie
  revision?: number | undefined;

  // List of themes
  themes?: ManifestTheme[];

  // Target dotLottie version
  version?: string | undefined;
}
