/**
 * Copyright 2023 Design Barn Inc.
 */

declare module 'DifferenceHashBuilder';

declare module 'sharp-phash';

declare module '*.lottie' {
  const value: Uint8Array;
  export default value;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace jasmine {
  interface Matchers<T extends ArrayBuffer> {
    toBeEqualDotlottieArrayBuffer(expected: T): boolean;
  }
}

/**
 * Top level object, describing the animation
 */
interface Animation {
  assets?: Asset.Value[];
}

declare module 'Asset' {
  interface Main extends Helpers.Name {
    /**
     * ID
     *
     * Unique identifier used by layers when referencing this asset
     */
    id: string;
  }

  /**
   * Asset referencing a file
   */
  interface File extends Main {
    /**
     * Embedded
     *
     * Whether the asset is embedded
     */
    e?: Helpers.IntegerBoolean;
    /**
     * Filename or Data URL
     */
    p: string;
    /**
     * Path
     *
     * Path to the directory containing an asset file
     */
    u?: string;
  }

  /**
   * External image
   */
  interface Image extends File {
    /**
     *
     * Height of the image
     */
    h?: Helpers.Height;
    /**
     * Type
     * Marks as part of an image sequence if present
     */
    t?: 'seq';
    /**
     * Width of the image
     */
    w?: Helpers.Width;
  }

  /**
   * External sound
   */
  interface Sound extends File {}

  /**
   * Asset containing an animation that can be referenced by layers.
   */
  interface Precomposition extends Main, Composition, Helpers.MatchName, Helpers.Framerate {
    /**
     * Extra
     *
     * Extra composition
     */
    xt?: Helpers.IntegerBoolean;
  }

  /**
   * External data source, usually a JSON file"
   */
  interface DataSource extends File {
    /**
     * Type
     */
    t: 3;
  }

  type Value = Image | Precomposition | Sound | DataSource;
}
