/**
 * Copyright 2023 Design Barn Inc.
 */

import { createError, isValidURL } from '../common';

describe('utils', () => {
  describe('createError', () => {
    it('returns an instance of Error with the correct message', () => {
      const errorMessage = 'This is an error';
      const error = createError(errorMessage);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(`[dotlottie-js]: ${errorMessage}`);
    });
  });

  describe('isValidURL', () => {
    it('returns true for a valid URL', () => {
      expect(isValidURL('https://www.valid.com')).toBe(true);
    });

    it('returns false for an invalid URL', () => {
      expect(isValidURL('invalid')).toBe(false);
    });
  });
});
