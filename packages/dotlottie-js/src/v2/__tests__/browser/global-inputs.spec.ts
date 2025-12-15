/**
 * Copyright 2025 Design Barn Inc.
 */

/* eslint-disable no-new */

import type { Animation as AnimationType } from '@lottie-animation-community/lottie-types';
import { describe, it, expect } from 'vitest';

import MAGIC_WAND_ANIMATION_DATA from '../../../__tests__/__fixtures__/magic-wand.json';
import { DotLottie } from '../../browser';
import { LottieGlobalInputs } from '../../browser/global-inputs';
import type { GlobalInputs } from '../../common';

describe('LottieGlobalInputs', () => {
  const validGlobalInputsData: GlobalInputs = {
    primaryColor: {
      type: 'Color',
      value: [1, 0, 0, 1],
    },
    opacity: {
      type: 'Numeric',
      value: 0.5,
    },
    position: {
      type: 'Vector',
      value: [100, 200],
    },
    isVisible: {
      type: 'Boolean',
      value: true,
    },
    backgroundImage: {
      type: 'Image',
      value: {
        id: 'img_1',
        width: 1920,
        height: 1080,
        url: 'https://example.com/image.png',
      },
    },
  };

  describe('constructor and basic properties', () => {
    it('gets and sets the zipOptions', () => {
      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data: validGlobalInputsData,
        zipOptions: {
          level: 9,
          mem: 1,
        },
      });

      expect(globalInputs.zipOptions).toEqual({
        level: 9,
        mem: 1,
      });

      globalInputs.zipOptions = {
        level: 1,
      };

      expect(globalInputs.zipOptions).toEqual({
        level: 1,
      });
    });

    it('throws an error if it receives an invalid id when constructed', () => {
      expect(() => {
        new LottieGlobalInputs({
          id: '',
          data: validGlobalInputsData,
        });
      }).toThrow('Invalid bindings id');
    });

    it('throws an error if it receives invalid data when constructed', () => {
      expect(() => {
        new LottieGlobalInputs({
          id: 'global_vars_1',
          data: { variables: { invalid: { type: 'InvalidType', value: 123 } } } as unknown as GlobalInputs,
        });
      }).toThrow('Invalid bindings data');
    });

    it('gets and sets the id', () => {
      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data: validGlobalInputsData,
      });

      expect(globalInputs.id).toEqual('global_vars_1');

      globalInputs.id = 'global_vars_2';

      expect(globalInputs.id).toEqual('global_vars_2');
    });

    it('throws an error when setting an invalid id', () => {
      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data: validGlobalInputsData,
      });

      expect(() => {
        globalInputs.id = '';
      }).toThrow('Invalid bindings id');
    });

    it('gets and sets the name', () => {
      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data: validGlobalInputsData,
        name: 'Theme Variables',
      });

      expect(globalInputs.name).toEqual('Theme Variables');

      globalInputs.name = 'Updated Theme';

      expect(globalInputs.name).toEqual('Updated Theme');

      globalInputs.name = undefined;

      expect(globalInputs.name).toBeUndefined();
    });

    it('gets and sets the data', () => {
      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data: validGlobalInputsData,
      });

      expect(globalInputs.data).toEqual(validGlobalInputsData);

      const newData = {
        secondaryColor: {
          type: 'Color' as const,
          value: [0, 1, 0, 1],
        },
      };

      globalInputs.data = newData;

      expect(globalInputs.data).toEqual(newData);
    });

    it('throws an error when setting invalid data', () => {
      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data: validGlobalInputsData,
      });

      expect(() => {
        globalInputs.data = { variables: { invalid: { type: 'InvalidType', value: 123 } } } as unknown as GlobalInputs;
      }).toThrow('Invalid bindings data');
    });

    it('converts global variables to string', () => {
      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data: validGlobalInputsData,
      });

      const stringified = globalInputs.toString();
      const parsed = JSON.parse(stringified);

      expect(parsed).toEqual(validGlobalInputsData);
    });

    it('handles empty variables object', () => {
      const data = {};

      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data,
      });

      expect(globalInputs.data).toEqual({});
    });
  });

  describe('variable types', () => {
    it('handles Color variable type', () => {
      const data = {
        color: {
          type: 'Color' as const,
          value: [0.2, 0.4, 0.6, 0.8],
        },
      };

      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data,
      });

      expect(globalInputs.data['color']).toEqual({
        type: 'Color',
        value: [0.2, 0.4, 0.6, 0.8],
      });
    });

    it('handles Color with RGB (no alpha)', () => {
      const data = {
        color: {
          type: 'Color' as const,
          value: [1, 0, 0],
        },
      };

      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data,
      });

      expect(globalInputs.data['color']?.value).toHaveLength(3);
    });

    it('handles Numeric variable type', () => {
      const data = {
        scale: {
          type: 'Numeric' as const,
          value: 1.5,
        },
      };

      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data,
      });

      expect(globalInputs.data['scale']).toEqual({
        type: 'Numeric',
        value: 1.5,
      });
    });

    it('handles Numeric with negative values', () => {
      const data = {
        offset: {
          type: 'Numeric' as const,
          value: -100,
        },
      };

      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data,
      });

      expect(globalInputs.data['offset']?.value).toBe(-100);
    });

    it('handles Numeric with zero value', () => {
      const data = {
        offset: {
          type: 'Numeric' as const,
          value: 0,
        },
      };

      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data,
      });

      expect(globalInputs.data['offset']?.value).toBe(0);
    });

    it('handles Vector variable type', () => {
      const data = {
        offset: {
          type: 'Vector' as const,
          value: [50, 100, 150],
        },
      };

      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data,
      });

      expect(globalInputs.data['offset']).toEqual({
        type: 'Vector',
        value: [50, 100, 150],
      });
    });

    it('handles Vector with 2D coordinates', () => {
      const data = {
        position: {
          type: 'Vector' as const,
          value: [100, 200],
        },
      };

      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data,
      });

      expect(globalInputs.data['position']?.value).toHaveLength(2);
    });

    it('handles Boolean variable type', () => {
      const data = {
        enabled: {
          type: 'Boolean' as const,
          value: false,
        },
      };

      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data,
      });

      expect(globalInputs.data['enabled']).toEqual({
        type: 'Boolean',
        value: false,
      });
    });

    it('handles Boolean with true value', () => {
      const data = {
        visible: {
          type: 'Boolean' as const,
          value: true,
        },
      };

      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data,
      });

      expect(globalInputs.data['visible']?.value).toBe(true);
    });

    it('handles Image variable type with all properties', () => {
      const data = {
        logo: {
          type: 'Image' as const,
          value: {
            id: 'logo_1',
            width: 500,
            height: 500,
            url: 'https://example.com/logo.png',
          },
        },
      };

      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data,
      });

      expect(globalInputs.data['logo']).toEqual({
        type: 'Image',
        value: {
          id: 'logo_1',
          width: 500,
          height: 500,
          url: 'https://example.com/logo.png',
        },
      });
    });

    it('handles Image variable type with optional properties', () => {
      const data = {
        logo: {
          type: 'Image' as const,
          value: {},
        },
      };

      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data,
      });

      expect(globalInputs.data['logo']).toEqual({
        type: 'Image',
        value: {},
      });
    });

    it('handles Image with partial properties', () => {
      const data = {
        logo: {
          type: 'Image' as const,
          value: {
            id: 'logo_1',
            url: 'https://example.com/logo.png',
          },
        },
      };

      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data,
      });

      expect(globalInputs.data['logo']?.value).toEqual({
        id: 'logo_1',
        url: 'https://example.com/logo.png',
      });
    });

    it('handles Gradient variable type', () => {
      const data = {
        gradient: {
          type: 'Gradient' as const,
          value: [
            { color: [1, 0, 0, 1], offset: 0 },
            { color: [0, 0, 1, 1], offset: 1 },
          ],
        },
      };

      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data,
      });

      expect(globalInputs.data['gradient']).toEqual({
        type: 'Gradient',
        value: [
          { color: [1, 0, 0, 1], offset: 0 },
          { color: [0, 0, 1, 1], offset: 1 },
        ],
      });
    });

    it('handles Gradient with multiple color stops', () => {
      const data = {
        gradient: {
          type: 'Gradient' as const,
          value: [
            { color: [1, 0, 0, 1], offset: 0 },
            { color: [0, 1, 0, 1], offset: 0.5 },
            { color: [0, 0, 1, 1], offset: 1 },
          ],
        },
      };

      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data,
      });

      expect(globalInputs.data['gradient']?.value).toHaveLength(3);
    });

    it('handles String variable type', () => {
      const data = {
        label: {
          type: 'String' as const,
          value: 'Hello World',
        },
      };

      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data,
      });

      expect(globalInputs.data['label']).toEqual({
        type: 'String',
        value: 'Hello World',
      });
    });

    it('handles String with empty value', () => {
      const data = {
        label: {
          type: 'String' as const,
          value: '',
        },
      };

      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data,
      });

      expect(globalInputs.data['label']?.value).toBe('');
    });

    it('handles multiple variables of different types', () => {
      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data: validGlobalInputsData,
      });

      expect(Object.keys(globalInputs.data)).toHaveLength(5);
      expect(globalInputs.data['primaryColor']?.type).toBe('Color');
      expect(globalInputs.data['opacity']?.type).toBe('Numeric');
      expect(globalInputs.data['position']?.type).toBe('Vector');
      expect(globalInputs.data['isVisible']?.type).toBe('Boolean');
      expect(globalInputs.data['backgroundImage']?.type).toBe('Image');
    });
  });

  describe('bindings inside data items', () => {
    it('handles input with theme bindings', () => {
      const data = {
        primaryColor: {
          type: 'Color' as const,
          value: [1, 0, 0, 1],
          bindings: {
            themes: [
              { themeId: 'dark-theme', ruleId: 'rule-1', path: '$.layers[0].color' },
            ],
          },
        },
      };

      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data,
      });

      expect(globalInputs.data['primaryColor']?.bindings?.themes).toHaveLength(1);
      expect(globalInputs.data['primaryColor']?.bindings?.themes?.[0]?.themeId).toBe('dark-theme');
      expect(globalInputs.data['primaryColor']?.bindings?.themes?.[0]?.ruleId).toBe('rule-1');
      expect(globalInputs.data['primaryColor']?.bindings?.themes?.[0]?.path).toBe('$.layers[0].color');
    });

    it('handles input with multiple theme bindings', () => {
      const data = {
        primaryColor: {
          type: 'Color' as const,
          value: [1, 0, 0, 1],
          bindings: {
            themes: [
              { themeId: 'dark-theme', ruleId: 'rule-1', path: '$.layers[0].color' },
              { themeId: 'light-theme', ruleId: 'rule-2', path: '$.layers[1].color' },
            ],
          },
        },
      };

      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data,
      });

      expect(globalInputs.data['primaryColor']?.bindings?.themes).toHaveLength(2);
    });

    it('handles input with state machine bindings', () => {
      const data = {
        opacity: {
          type: 'Numeric' as const,
          value: 0.5,
          bindings: {
            stateMachines: [
              { stateMachineId: 'hover-sm', inputName: ['opacity', 'fadeLevel'] },
            ],
          },
        },
      };

      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data,
      });

      expect(globalInputs.data['opacity']?.bindings?.stateMachines).toHaveLength(1);
      expect(globalInputs.data['opacity']?.bindings?.stateMachines?.[0]?.stateMachineId).toBe('hover-sm');
      expect(globalInputs.data['opacity']?.bindings?.stateMachines?.[0]?.inputName).toEqual(['opacity', 'fadeLevel']);
    });

    it('handles input with both theme and state machine bindings', () => {
      const data = {
        primaryColor: {
          type: 'Color' as const,
          value: [1, 0, 0, 1],
          bindings: {
            themes: [
              { themeId: 'dark-theme', ruleId: 'rule-1', path: '$.layers[0].color' },
            ],
            stateMachines: [
              { stateMachineId: 'hover-sm', inputName: ['colorInput'] },
            ],
          },
        },
      };

      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data,
      });

      expect(globalInputs.data['primaryColor']?.bindings?.themes).toHaveLength(1);
      expect(globalInputs.data['primaryColor']?.bindings?.stateMachines).toHaveLength(1);
    });

    it('handles multiple inputs with different bindings', () => {
      const data = {
        primaryColor: {
          type: 'Color' as const,
          value: [1, 0, 0, 1],
          bindings: {
            themes: [
              { themeId: 'dark-theme', ruleId: 'color-rule', path: '$.layers[0].color' },
            ],
          },
        },
        opacity: {
          type: 'Numeric' as const,
          value: 0.5,
          bindings: {
            stateMachines: [
              { stateMachineId: 'hover-sm', inputName: ['opacity'] },
            ],
          },
        },
        position: {
          type: 'Vector' as const,
          value: [100, 200],
          // No bindings
        },
      };

      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data,
      });

      expect(globalInputs.data['primaryColor']?.bindings?.themes).toHaveLength(1);
      expect(globalInputs.data['opacity']?.bindings?.stateMachines).toHaveLength(1);
      expect(globalInputs.data['position']?.bindings).toBeUndefined();
    });

    it('handles input with empty bindings object', () => {
      const data = {
        primaryColor: {
          type: 'Color' as const,
          value: [1, 0, 0, 1],
          bindings: {},
        },
      };

      const globalInputs = new LottieGlobalInputs({
        id: 'global_vars_1',
        data,
      });

      expect(globalInputs.data['primaryColor']?.bindings).toEqual({});
      expect(globalInputs.data['primaryColor']?.bindings?.themes).toBeUndefined();
      expect(globalInputs.data['primaryColor']?.bindings?.stateMachines).toBeUndefined();
    });
  });

  describe('DotLottie integration', () => {
    it('builds dotLottie with global variables asset', async () => {
      const dotLottie = new DotLottie();

      dotLottie.addGlobalInputs({
        id: 'theme_vars',
        data: validGlobalInputsData,
      });

      dotLottie.addAnimation({
        id: 'animation_1',
        data: structuredClone(MAGIC_WAND_ANIMATION_DATA) as unknown as AnimationType,
      });

      await dotLottie.build();

      const arrayBuffer = await dotLottie.toArrayBuffer();

      expect(arrayBuffer).toBeInstanceOf(ArrayBuffer);
      expect(arrayBuffer.byteLength).toBeGreaterThan(0);

      const globalInputsList = dotLottie.getGlobalInputs();

      expect(globalInputsList.length).toBe(1);
      expect(globalInputsList[0]?.id).toBe('theme_vars');
    });

    it('loads dotLottie with global variables from ArrayBuffer', async () => {
      const dotLottie = new DotLottie();

      dotLottie.addGlobalInputs({
        id: 'theme_vars',
        data: validGlobalInputsData,
      });

      dotLottie.addAnimation({
        id: 'animation_1',
        data: MAGIC_WAND_ANIMATION_DATA as unknown as AnimationType,
      });

      const arrayBuffer = await dotLottie.build().then(async (dl) => dl.toArrayBuffer());

      let loadedDotLottie = new DotLottie();

      loadedDotLottie = await loadedDotLottie.fromArrayBuffer(arrayBuffer);

      const globalInputsList = loadedDotLottie.getGlobalInputs();

      expect(globalInputsList.length).toBe(1);
      expect(globalInputsList[0]?.id).toBe('theme_vars');
      expect(globalInputsList[0]?.data).toEqual(validGlobalInputsData);
    });

    it('handles multiple global variables assets', async () => {
      const dotLottie = new DotLottie();

      const secondGlobalInputsData = {
        accentColor: {
          type: 'Color' as const,
          value: [0, 0, 1, 1],
        },
        scale: {
          type: 'Numeric' as const,
          value: 2.0,
        },
      };

      dotLottie.addGlobalInputs({
        id: 'theme_vars_1',
        data: validGlobalInputsData,
      });

      dotLottie.addGlobalInputs({
        id: 'theme_vars_2',
        data: secondGlobalInputsData,
      });

      dotLottie.addAnimation({
        id: 'animation_1',
        data: MAGIC_WAND_ANIMATION_DATA as unknown as AnimationType,
      });

      await dotLottie.build();

      const globalInputsList = dotLottie.getGlobalInputs();

      expect(globalInputsList.length).toBe(2);
      expect(globalInputsList[0]?.id).toBe('theme_vars_1');
      expect(globalInputsList[1]?.id).toBe('theme_vars_2');
    });

    it('retrieves specific global variables by id', async () => {
      const dotLottie = new DotLottie();

      dotLottie.addGlobalInputs({
        id: 'theme_vars',
        name: 'Theme Variables',
        data: validGlobalInputsData,
      });

      dotLottie.addAnimation({
        id: 'animation_1',
        data: MAGIC_WAND_ANIMATION_DATA as unknown as AnimationType,
      });

      await dotLottie.build();

      const globalInputs = dotLottie.getGlobalInputsById('theme_vars');

      expect(globalInputs).toBeDefined();
      expect(globalInputs?.id).toBe('theme_vars');
      expect(globalInputs?.name).toBe('Theme Variables');
      expect(globalInputs?.data).toEqual(validGlobalInputsData);
    });

    it('returns undefined for non-existent global inputs id', async () => {
      const dotLottie = new DotLottie();

      dotLottie.addGlobalInputs({
        id: 'theme_vars',
        data: validGlobalInputsData,
      });

      dotLottie.addAnimation({
        id: 'animation_1',
        data: MAGIC_WAND_ANIMATION_DATA as unknown as AnimationType,
      });

      await dotLottie.build();

      const globalInputs = dotLottie.getGlobalInputsById('non_existent_id');

      expect(globalInputs).toBeUndefined();
    });

    it('persists global variables after toArrayBuffer and fromArrayBuffer round-trip', async () => {
      const dotLottie = new DotLottie();

      const originalData = {
        brandColor: {
          type: 'Color' as const,
          value: [1, 0.5, 0, 1],
        },
        rotation: {
          type: 'Numeric' as const,
          value: 45,
        },
      };

      dotLottie.addGlobalInputs({
        id: 'brand_vars',
        name: 'Brand Variables',
        data: originalData,
      });

      dotLottie.addAnimation({
        id: 'animation_1',
        data: MAGIC_WAND_ANIMATION_DATA as unknown as AnimationType,
      });

      const arrayBuffer = await dotLottie.build().then(async (dl) => dl.toArrayBuffer());

      let loadedDotLottie = new DotLottie();

      loadedDotLottie = await loadedDotLottie.fromArrayBuffer(arrayBuffer);

      const loadedGlobalInputs = loadedDotLottie.getGlobalInputsById('brand_vars');

      expect(loadedGlobalInputs).toBeDefined();
      expect(loadedGlobalInputs?.id).toBe('brand_vars');
      expect(loadedGlobalInputs?.name).toBe('Brand Variables');
      expect(loadedGlobalInputs?.data).toEqual(originalData);
    });

    it('persists bindings inside data after round-trip', async () => {
      const dotLottie = new DotLottie();

      const dataWithBindings = {
        primaryColor: {
          type: 'Color' as const,
          value: [1, 0, 0, 1],
          bindings: {
            themes: [
              { themeId: 'main-theme', ruleId: 'global-rule', path: '$.global' },
            ],
            stateMachines: [
              { stateMachineId: 'global-sm', inputName: ['globalInput'] },
            ],
          },
        },
        opacity: {
          type: 'Numeric' as const,
          value: 0.5,
          bindings: {
            stateMachines: [
              { stateMachineId: 'hover-sm', inputName: ['opacity'] },
            ],
          },
        },
      };

      dotLottie.addGlobalInputs({
        id: 'bound_vars',
        data: dataWithBindings,
      });

      dotLottie.addAnimation({
        id: 'animation_1',
        data: MAGIC_WAND_ANIMATION_DATA as unknown as AnimationType,
      });

      const arrayBuffer = await dotLottie.build().then(async (dl) => dl.toArrayBuffer());

      let loadedDotLottie = new DotLottie();

      loadedDotLottie = await loadedDotLottie.fromArrayBuffer(arrayBuffer);

      const loadedGlobalInputs = loadedDotLottie.getGlobalInputsById('bound_vars');

      expect(loadedGlobalInputs?.data).toEqual(dataWithBindings);
      expect(loadedGlobalInputs?.data['primaryColor']?.bindings?.themes).toHaveLength(1);
      expect(loadedGlobalInputs?.data['primaryColor']?.bindings?.stateMachines).toHaveLength(1);
      expect(loadedGlobalInputs?.data['opacity']?.bindings?.stateMachines).toHaveLength(1);
    });

    it('handles global variables with animations referencing them', async () => {
      const dotLottie = new DotLottie();

      dotLottie.addGlobalInputs({
        id: 'animation_vars',
        data: validGlobalInputsData,
      });

      dotLottie.addAnimation({
        id: 'animation_1',
        data: MAGIC_WAND_ANIMATION_DATA as unknown as AnimationType,
      });

      dotLottie.addAnimation({
        id: 'animation_2',
        data: MAGIC_WAND_ANIMATION_DATA as unknown as AnimationType,
      });

      await dotLottie.build();

      const arrayBuffer = await dotLottie.toArrayBuffer();

      expect(arrayBuffer).toBeInstanceOf(ArrayBuffer);

      let reloadedDotLottie = new DotLottie();

      reloadedDotLottie = await reloadedDotLottie.fromArrayBuffer(arrayBuffer);

      expect(reloadedDotLottie.animations.length).toBe(2);
      expect(reloadedDotLottie.getGlobalInputs().length).toBe(1);
    });

    it('handles dotLottie with no global inputs', async () => {
      const dotLottie = new DotLottie();

      dotLottie.addAnimation({
        id: 'animation_1',
        data: MAGIC_WAND_ANIMATION_DATA as unknown as AnimationType,
      });

      await dotLottie.build();

      const globalInputsList = dotLottie.getGlobalInputs();

      expect(globalInputsList.length).toBe(0);
    });
  });
});
