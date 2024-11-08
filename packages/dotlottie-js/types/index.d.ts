/**
 * Copyright 2023 Design Barn Inc.
 */

declare module 'DifferenceHashBuilder';

declare module 'sharp-phash';

declare module '*.lottie?uint8array' {
  const value: Uint8Array;
  export default value;
}

declare module '*.txt?raw' {
  const value: string;
  export default value;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace jasmine {
  interface Matchers<T extends ArrayBuffer> {
    toBeEqualDotlottieArrayBuffer(expected: T): boolean;
  }
}
