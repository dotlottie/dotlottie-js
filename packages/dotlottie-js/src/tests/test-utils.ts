/**
 * Copyright 2023 Design Barn Inc.
 */

import { unzipSync, strFromU8 } from 'fflate';

const toBeEqualDotlottieArrayBuffer: jasmine.CustomMatcherFactory = (matchersUtil: jasmine.MatchersUtil) => {
  return {
    compare: (actual: ArrayBuffer, expected: ArrayBuffer): jasmine.CustomMatcherResult => {
      const result: jasmine.CustomMatcherResult = {
        pass: false,
      };

      const actualUint8Array = new Uint8Array(actual);
      const expectedUint8Array = new Uint8Array(expected);

      const actualUnzipped = unzipSync(actualUint8Array);
      const expectedUnzipped = unzipSync(expectedUint8Array);

      // eslint-disable-next-line guard-for-in
      for (const key in actualUnzipped) {
        if (!(key in expectedUnzipped)) {
          result.message = `actual dotlottie has ${key} that is not in the expected dotlottie`;

          return result;
        }

        const actualValue = actualUnzipped[key] as Uint8Array;
        const expectedValue = expectedUnzipped[key] as Uint8Array;

        if (key === 'manifest.json') {
          const actualManifest = JSON.parse(strFromU8(actualValue));
          const expectedManifest = JSON.parse(strFromU8(expectedValue));

          const areEqual = matchersUtil.equals(actualManifest, expectedManifest);

          if (!areEqual) {
            result.message = `expected dotlottie manifest to equal ${JSON.stringify(
              expectedManifest,
              null,
              2,
            )} but got ${JSON.stringify(actualManifest, null, 2)}}`;

            return result;
          }
        }

        if (key.startsWith('animations/')) {
          const actualAnimation = JSON.parse(strFromU8(actualValue));
          const expectedAnimation = JSON.parse(strFromU8(expectedValue));

          const areEqual = matchersUtil.equals(actualAnimation, expectedAnimation);

          if (!areEqual) {
            result.message = `expected dotlottie animation ${key} to equal the actual dotlottie animation ${key}`;

            return result;
          }
        }
      }

      result.pass = true;

      return result;
    },
  };
};

export const customMatchers = {
  toBeEqualDotlottieArrayBuffer,
};
