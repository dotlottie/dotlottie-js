/**
 * Copyright 2025 Design Barn Inc.
 */

/* eslint-disable no-new */

import type { ZipOptions } from 'fflate';
import { describe, it, expect, beforeEach } from 'vitest';

import animationData from '../../../__tests__/__fixtures__/simple/animation/animations/pigeon.json';
import { HelloWorldScript, AnimationControlScript } from '../../../__tests__/__fixtures__/simple/script/sample-scripts';
import type { AnimationData } from '../../../types';
import { DotLottie, LottieScript } from '../../index.node';

describe('LottieScript', () => {
  describe('constructor', () => {
    it('should create a script with valid options', () => {
      const script = new LottieScript({
        id: 'test-script',
        data: 'console.log("test");',
      });

      expect(script.id).toBe('test-script');
      expect(script.data).toBe('console.log("test");');
      expect(script.name).toBeUndefined();
    });

    it('should create a script with name', () => {
      const script = new LottieScript({
        id: 'test-script',
        name: 'Test Script',
        data: 'console.log("test");',
      });

      expect(script.id).toBe('test-script');
      expect(script.name).toBe('Test Script');
    });

    it('should throw error with empty id', () => {
      expect(() => {
        new LottieScript({
          id: '',
          data: 'console.log("test");',
        });
      }).toThrow('Invalid script id');
    });

    it('should throw error with non-string data', () => {
      expect(() => {
        new LottieScript({
          id: 'test',
          data: 123 as unknown as string,
        });
      }).toThrow('Invalid script data');
    });
  });

  describe('getters and setters', () => {
    let script: LottieScript;

    beforeEach(() => {
      script = new LottieScript({
        id: 'test-script',
        data: 'console.log("hello");',
      });
    });

    it('should get and set id', () => {
      expect(script.id).toBe('test-script');

      script.id = 'new-id';

      expect(script.id).toBe('new-id');
    });

    it('should throw error when setting invalid id', () => {
      expect(() => {
        script.id = '';
      }).toThrow('Invalid script id');
    });

    it('should get and set name', () => {
      expect(script.name).toBeUndefined();

      script.name = 'New Script Name';

      expect(script.name).toBe('New Script Name');
    });

    it('should get and set data', () => {
      const newData = 'const x = 42;';

      script.data = newData;

      expect(script.data).toBe(newData);
    });

    it('should get and set zipOptions', () => {
      expect(script.zipOptions).toEqual({});

      const newZipOptions: ZipOptions = {
        level: 1,
      };

      script.zipOptions = newZipOptions;

      expect(script.zipOptions).toEqual(newZipOptions);
    });
  });

  describe('toString', () => {
    it('should return raw JS string', () => {
      const script = new LottieScript({
        id: 'test',
        data: 'console.log("hello");',
      });

      const result = script.toString();

      expect(result).toBe('console.log("hello");');
    });

    it('should not JSON-stringify the data', () => {
      const data = 'const x = "hello";';

      const script = new LottieScript({
        id: 'test',
        data,
      });

      const result = script.toString();

      expect(result).toBe(data);
      expect(result).not.toBe(JSON.stringify(data));
    });
  });

  describe('DotLottie integration', () => {
    it('should add and get scripts', () => {
      const dotlottie = new DotLottie();

      dotlottie.addScript(HelloWorldScript);

      expect(dotlottie.scripts.length).toBe(1);
      expect(dotlottie.getScript(HelloWorldScript.id)?.id).toBe(HelloWorldScript.id);
      expect(dotlottie.getScript(HelloWorldScript.id)?.data).toBe(HelloWorldScript.data);
    });

    it('should add multiple scripts', () => {
      const dotlottie = new DotLottie();

      dotlottie.addScript(HelloWorldScript).addScript(AnimationControlScript);

      expect(dotlottie.scripts.length).toBe(2);
      expect(dotlottie.getScript(HelloWorldScript.id)?.data).toBe(HelloWorldScript.data);
      expect(dotlottie.getScript(AnimationControlScript.id)?.data).toBe(AnimationControlScript.data);
      expect(dotlottie.getScript(AnimationControlScript.id)?.name).toBe(AnimationControlScript.name);
    });

    it('should remove a script', () => {
      const dotlottie = new DotLottie();

      dotlottie.addScript(HelloWorldScript).addScript(AnimationControlScript);

      expect(dotlottie.scripts.length).toBe(2);

      dotlottie.removeScript(HelloWorldScript.id);

      expect(dotlottie.scripts.length).toBe(1);
      expect(dotlottie.getScript(HelloWorldScript.id)).toBeUndefined();
      expect(dotlottie.getScript(AnimationControlScript.id)?.id).toBe(AnimationControlScript.id);
    });

    it('should return undefined for non-existent script', () => {
      const dotlottie = new DotLottie();

      expect(dotlottie.getScript('non-existent')).toBeUndefined();
    });
  });

  describe('manifest generation', () => {
    it('should include scripts in manifest when scripts are added', async () => {
      const dotlottie = new DotLottie();

      dotlottie
        .addAnimation({
          id: 'pigeon',
          data: animationData as unknown as AnimationData,
        })
        .addScript(HelloWorldScript)
        .addScript(AnimationControlScript);

      await dotlottie.build();

      expect(dotlottie.manifest.scripts).toBeDefined();
      expect(dotlottie.manifest.scripts?.length).toBe(2);
      expect(dotlottie.manifest.scripts?.[0]?.id).toBe(HelloWorldScript.id);
      expect(dotlottie.manifest.scripts?.[1]?.id).toBe(AnimationControlScript.id);
      expect(dotlottie.manifest.scripts?.[1]?.name).toBe(AnimationControlScript.name);
    });

    it('should not include scripts in manifest when no scripts are added', async () => {
      const dotlottie = new DotLottie();

      dotlottie.addAnimation({
        id: 'pigeon',
        data: animationData as unknown as AnimationData,
      });

      await dotlottie.build();

      expect(dotlottie.manifest.scripts).toBeUndefined();
    });
  });

  describe('serialization round-trip', () => {
    it('should preserve scripts through toArrayBuffer and fromArrayBuffer', async () => {
      const dotlottie = new DotLottie();

      dotlottie
        .addAnimation({
          id: 'pigeon',
          data: animationData as unknown as AnimationData,
        })
        .addScript(HelloWorldScript)
        .addScript(AnimationControlScript);

      await dotlottie.build();

      const arrayBuffer = await dotlottie.toArrayBuffer();

      const loaded = await new DotLottie().fromArrayBuffer(arrayBuffer);

      expect(loaded.scripts.length).toBe(2);
      expect(loaded.getScript(HelloWorldScript.id)?.data).toBe(HelloWorldScript.data);
      expect(loaded.getScript(AnimationControlScript.id)?.data).toBe(AnimationControlScript.data);
      expect(loaded.getScript(AnimationControlScript.id)?.name).toBe(AnimationControlScript.name);
    });

    it('should handle scripts with special characters and Unicode', async () => {
      const specialScript = {
        id: 'special-chars',
        data: 'const msg = "Hello 世界! 🌍 äöü <>&\'"";',
      };

      const dotlottie = new DotLottie();

      dotlottie
        .addAnimation({
          id: 'pigeon',
          data: animationData as unknown as AnimationData,
        })
        .addScript(specialScript);

      await dotlottie.build();

      const arrayBuffer = await dotlottie.toArrayBuffer();

      const loaded = await new DotLottie().fromArrayBuffer(arrayBuffer);

      expect(loaded.getScript('special-chars')?.data).toBe(specialScript.data);
    });

    it('should handle empty string data', async () => {
      const emptyScript = {
        id: 'empty-script',
        data: '',
      };

      const dotlottie = new DotLottie();

      dotlottie
        .addAnimation({
          id: 'pigeon',
          data: animationData as unknown as AnimationData,
        })
        .addScript(emptyScript);

      await dotlottie.build();

      const arrayBuffer = await dotlottie.toArrayBuffer();

      const loaded = await new DotLottie().fromArrayBuffer(arrayBuffer);

      expect(loaded.getScript('empty-script')?.data).toBe('');
    });
  });
});
