/**
 * Copyright 2025 Design Barn Inc.
 */

/* eslint-disable no-new */

import type { Animation as AnimationType } from '@lottie-animation-community/lottie-types';
import { describe, it, expect } from 'vitest';

import MAGIC_WAND_ANIMATION_DATA from '../../../__tests__/__fixtures__/magic-wand.json';
import { DotLottie } from '../../browser';
import { LottieGlobalVariables } from '../../browser/global-variables';

describe('LottieGlobalVariables', () => {
  const validGlobalVariablesData = {
      primaryColor: {
        type: 'Color' as const,
        value: [1, 0, 0, 1],
      },
      opacity: {
        type: 'Scalar' as const,
        value: 0.5,
      },
      position: {
        type: 'Vector' as const,
        value: [100, 200],
      },
      isVisible: {
        type: 'Boolean' as const,
        value: true,
      },
      backgroundImage: {
        type: 'Image' as const,
        value: {
          id: 'img_1',
          width: 1920,
          height: 1080,
          url: 'https://example.com/image.png',
        },
      },
  };

  it('gets and sets the zipOptions', () => {
    const globalVars = new LottieGlobalVariables({
      id: 'global_vars_1',
      data: validGlobalVariablesData,
      zipOptions: {
        level: 9,
        mem: 1,
      },
    });

    expect(globalVars.zipOptions).toEqual({
      level: 9,
      mem: 1,
    });

    globalVars.zipOptions = {
      level: 1,
    };

    expect(globalVars.zipOptions).toEqual({
      level: 1,
    });
  });

  it('throws an error if it receives an invalid id when constructed', () => {
    expect(() => {
      new LottieGlobalVariables({
        id: '',
        data: validGlobalVariablesData,
      });
    }).toThrow('Invalid bindings id');
  });

  it('throws an error if it receives invalid data when constructed', () => {
    expect(() => {
      new LottieGlobalVariables({
        id: 'global_vars_1',
        data: { variables: { invalid: { type: 'InvalidType', value: 123 } } } as any,
      });
    }).toThrow('Invalid bindings data');
  });

  it('gets and sets the id', () => {
    const globalVars = new LottieGlobalVariables({
      id: 'global_vars_1',
      data: validGlobalVariablesData,
    });

    expect(globalVars.id).toEqual('global_vars_1');

    globalVars.id = 'global_vars_2';

    expect(globalVars.id).toEqual('global_vars_2');
  });

  it('throws an error when setting an invalid id', () => {
    const globalVars = new LottieGlobalVariables({
      id: 'global_vars_1',
      data: validGlobalVariablesData,
    });

    expect(() => {
      globalVars.id = '';
    }).toThrow('Invalid bindings id');
  });

  it('gets and sets the name', () => {
    const globalVars = new LottieGlobalVariables({
      id: 'global_vars_1',
      data: validGlobalVariablesData,
      name: 'Theme Variables',
    });

    expect(globalVars.name).toEqual('Theme Variables');

    globalVars.name = 'Updated Theme';

    expect(globalVars.name).toEqual('Updated Theme');

    globalVars.name = undefined;

    expect(globalVars.name).toBeUndefined();
  });

  it('gets and sets the data', () => {
    const globalVars = new LottieGlobalVariables({
      id: 'global_vars_1',
      data: validGlobalVariablesData,
    });

    expect(globalVars.data).toEqual(validGlobalVariablesData);

    const newData = {
        secondaryColor: {
          type: 'Color' as const,
          value: [0, 1, 0, 1],
        },
    };

    globalVars.data = newData;

    expect(globalVars.data).toEqual(newData);
  });

  it('throws an error when setting invalid data', () => {
    const globalVars = new LottieGlobalVariables({
      id: 'global_vars_1',
      data: validGlobalVariablesData,
    });

    expect(() => {
      globalVars.data = { variables: { invalid: { type: 'InvalidType', value: 123 } } } as any;
    }).toThrow('Invalid bindings data');
  });

  it('converts global variables to string', () => {
    const globalVars = new LottieGlobalVariables({
      id: 'global_vars_1',
      data: validGlobalVariablesData,
    });

    const stringified = globalVars.toString();
    const parsed = JSON.parse(stringified);

    expect(parsed).toHaveProperty('bindings');
    expect(parsed.bindings).toEqual(validGlobalVariablesData);
  });

  it('handles Color variable type', () => {
    const data = {
      variables: {
        color: {
          type: 'Color' as const,
          value: [0.2, 0.4, 0.6, 0.8],
        },
      },
    };

    const globalVars = new LottieGlobalVariables({
      id: 'global_vars_1',
      data,
    });

    expect(globalVars.data['color']).toEqual({
      type: 'Color',
      value: [0.2, 0.4, 0.6, 0.8],
    });
  });

  it('handles Scalar variable type', () => {
    const data = {
        scale: {
          type: 'Scalar' as const,
          value: 1.5,
        },
    };

    const globalVars = new LottieGlobalVariables({
      id: 'global_vars_1',
      data,
    });

    expect(globalVars.data['scale']).toEqual({
      type: 'Scalar',
      value: 1.5,
    });
  });

  it('handles Vector variable type', () => {
    const data = {
        offset: {
          type: 'Vector' as const,
          value: [50, 100, 150],
        },
    };

    const globalVars = new LottieGlobalVariables({
      id: 'global_vars_1',
      data,
    });

    expect(globalVars.data['offset']).toEqual({
      type: 'Vector',
      value: [50, 100, 150],
    });
  });

  it('handles Boolean variable type', () => {
    const data = {
        enabled: {
          type: 'Boolean' as const,
          value: false,
        },
    };

    const globalVars = new LottieGlobalVariables({
      id: 'global_vars_1',
      data,
    });

    expect(globalVars.data['enabled']).toEqual({
      type: 'Boolean',
      value: false,
    });
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

    const globalVars = new LottieGlobalVariables({
      id: 'global_vars_1',
      data,
    });

    expect(globalVars.data['logo']).toEqual({
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

    const globalVars = new LottieGlobalVariables({
      id: 'global_vars_1',
      data,
    });

    expect(globalVars.data['logo']).toEqual({
      type: 'Image',
      value: {},
    });
  });

  it('handles multiple variables of different types', () => {
    const globalVars = new LottieGlobalVariables({
      id: 'global_vars_1',
      data: validGlobalVariablesData,
    });

    expect(Object.keys(globalVars.data)).toHaveLength(5);
    expect(globalVars.data['primaryColor']?.type).toBe('Color');
    expect(globalVars.data['opacity']?.type).toBe('Scalar');
    expect(globalVars.data['position']?.type).toBe('Vector');
    expect(globalVars.data['isVisible']?.type).toBe('Boolean');
    expect(globalVars.data['backgroundImage']?.type).toBe('Image');
  });

  it('handles empty variables object', () => {
    const data = {

    };

    const globalVars = new LottieGlobalVariables({
      id: 'global_vars_1',
      data,
    });

    expect(globalVars.data).toEqual({});
  });

  it('builds dotLottie with global variables asset', async () => {
    const dotLottie = new DotLottie();

    dotLottie.addGlobalVariables({
      id: 'theme_vars',
      data: validGlobalVariablesData,
    });

    dotLottie.addAnimation({
      id: 'animation_1',
      data: structuredClone(MAGIC_WAND_ANIMATION_DATA) as unknown as AnimationType,
    });

    await dotLottie.build();

    const arrayBuffer = await dotLottie.toArrayBuffer();

    expect(arrayBuffer).toBeInstanceOf(ArrayBuffer);
    expect(arrayBuffer.byteLength).toBeGreaterThan(0);

    const globalVarsList = dotLottie.getGlobalVariables();

    expect(globalVarsList.length).toBe(1);
    expect(globalVarsList[0]?.id).toBe('theme_vars');
  });

  it('loads dotLottie with global variables from ArrayBuffer', async () => {
    // First, create and build a dotLottie with global variables
    const dotLottie = new DotLottie();

    dotLottie.addGlobalVariables({
      id: 'theme_vars',
      data: validGlobalVariablesData,
    });

    dotLottie.addAnimation({
      id: 'animation_1',
      data: MAGIC_WAND_ANIMATION_DATA as unknown as AnimationType,
    });

    const arrayBuffer = await dotLottie.build().then(async (dl) => dl.toArrayBuffer());

    // Now load it back from ArrayBuffer
    let loadedDotLottie = new DotLottie();

    loadedDotLottie = await loadedDotLottie.fromArrayBuffer(arrayBuffer);

    const globalVarsList = loadedDotLottie.getGlobalVariables();

    expect(globalVarsList.length).toBe(1);
    expect(globalVarsList[0]?.id).toBe('theme_vars');
    expect(globalVarsList[0]?.data).toEqual(validGlobalVariablesData);
  });

  it('handles multiple global variables assets', async () => {
    const dotLottie = new DotLottie();

    const secondGlobalVarsData = {
        accentColor: {
          type: 'Color' as const,
          value: [0, 0, 1, 1],
        },
        scale: {
          type: 'Scalar' as const,
          value: 2.0,
        },
    };

    dotLottie.addGlobalVariables({
      id: 'theme_vars_1',
      data: validGlobalVariablesData,
    });

    dotLottie.addGlobalVariables({
      id: 'theme_vars_2',
      data: secondGlobalVarsData,
    });

    dotLottie.addAnimation({
      id: 'animation_1',
      data: MAGIC_WAND_ANIMATION_DATA as unknown as AnimationType,
    });

    await dotLottie.build();

    const globalVarsList = dotLottie.getGlobalVariables();

    expect(globalVarsList.length).toBe(2);
    expect(globalVarsList[0]?.id).toBe('theme_vars_1');
    expect(globalVarsList[1]?.id).toBe('theme_vars_2');
  });

  it('retrieves specific global variables by id', async () => {
    const dotLottie = new DotLottie();

    dotLottie.addGlobalVariables({
      id: 'theme_vars',
      name: 'Theme Variables',
      data: validGlobalVariablesData,
    });

    dotLottie.addAnimation({
      id: 'animation_1',
      data: MAGIC_WAND_ANIMATION_DATA as unknown as AnimationType,
    });

    await dotLottie.build();

    const globalVars = dotLottie.getGlobalVariablesById('theme_vars');

    expect(globalVars).toBeDefined();
    expect(globalVars?.id).toBe('theme_vars');
    expect(globalVars?.name).toBe('Theme Variables');
    expect(globalVars?.data).toEqual(validGlobalVariablesData);
  });

  it('persists global variables after toArrayBuffer and fromArrayBuffer round-trip', async () => {
    const dotLottie = new DotLottie();

    const originalData = {
        brandColor: {
          type: 'Color' as const,
          value: [1, 0.5, 0, 1],
        },
        rotation: {
          type: 'Scalar' as const,
          value: 45,
        },
    };

    dotLottie.addGlobalVariables({
      id: 'brand_vars',
      name: 'Brand Variables',
      data: originalData,
    });

    dotLottie.addAnimation({
      id: 'animation_1',
      data: MAGIC_WAND_ANIMATION_DATA as unknown as AnimationType,
    });

    // Build and convert to ArrayBuffer
    const arrayBuffer = await dotLottie.build().then(async (dl) => dl.toArrayBuffer());

    // Load from ArrayBuffer
    let loadedDotLottie = new DotLottie();
    
    loadedDotLottie = await loadedDotLottie.fromArrayBuffer(arrayBuffer);

    const loadedGlobalVars = loadedDotLottie.getGlobalVariablesById('brand_vars');

    expect(loadedGlobalVars).toBeDefined();
    expect(loadedGlobalVars?.id).toBe('brand_vars');
    expect(loadedGlobalVars?.name).toBe('Brand Variables');
    expect(loadedGlobalVars?.data).toEqual(originalData);
  });

  it('handles global variables with animations referencing them', async () => {
    const dotLottie = new DotLottie();

    dotLottie.addGlobalVariables({
      id: 'animation_vars',
      data: validGlobalVariablesData,
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

    // Reload and verify
    let reloadedDotLottie = new DotLottie();
    
    reloadedDotLottie = await reloadedDotLottie.fromArrayBuffer(arrayBuffer);

    expect(reloadedDotLottie.animations.length).toBe(2);
    expect(reloadedDotLottie.getGlobalVariables().length).toBe(1);
  });
});
