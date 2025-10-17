/**
 * Copyright 2025 Design Barn Inc.
 */

/* eslint-disable no-new */

import type { Animation as AnimationType } from '@lottie-animation-community/lottie-types';
import { describe, it, expect } from 'vitest';

import MAGIC_WAND_ANIMATION_DATA from '../../../__tests__/__fixtures__/magic-wand.json';
import { DotLottie } from '../../browser';
import { LottieGlobalInputs } from '../../browser/global-variables';
import type { GlobalInputs } from '../../common';

describe('LottieGlobalInputs', () => {
  const validGlobalInputsData: GlobalInputs = {
    primaryColor: {
      type: 'Color',
      value: [1, 0, 0, 1],
    },
    opacity: {
      type: 'Scalar',
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
        data:  { invalid: { type: 'InvalidType', value: 123 } } as any,
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
      globalInputs.data = { variables: { invalid: { type: 'InvalidType', value: 123 } } } as any;
    }).toThrow('Invalid bindings data');
  });

  it('converts global variables to string', () => {
    const globalInputs = new LottieGlobalInputs({
      id: 'global_vars_1',
      data: validGlobalInputsData,
    });

    const stringified = globalInputs.toString();
    const parsed = JSON.parse(stringified);

    expect(parsed).toHaveProperty('bindings');
    expect(parsed.bindings).toEqual(validGlobalInputsData);
  });

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

  it('handles Scalar variable type', () => {
    const data = {
        scale: {
          type: 'Scalar' as const,
          value: 1.5,
        },
    };

    const globalInputs = new LottieGlobalInputs({
      id: 'global_vars_1',
      data,
    });

    expect(globalInputs.data['scale']).toEqual({
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

    const globalInputs = new LottieGlobalInputs({
      id: 'global_vars_1',
      data,
    });

    expect(globalInputs.data['offset']).toEqual({
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

    const globalInputs = new LottieGlobalInputs({
      id: 'global_vars_1',
      data,
    });

    expect(globalInputs.data['enabled']).toEqual({
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

  it('handles multiple variables of different types', () => {
    const globalInputs = new LottieGlobalInputs({
      id: 'global_vars_1',
      data: validGlobalInputsData,
    });

    expect(Object.keys(globalInputs.data)).toHaveLength(5);
    expect(globalInputs.data['primaryColor']?.type).toBe('Color');
    expect(globalInputs.data['opacity']?.type).toBe('Scalar');
    expect(globalInputs.data['position']?.type).toBe('Vector');
    expect(globalInputs.data['isVisible']?.type).toBe('Boolean');
    expect(globalInputs.data['backgroundImage']?.type).toBe('Image');
  });

  it('handles empty variables object', () => {
    const data = {

    };

    const globalInputs = new LottieGlobalInputs({
      id: 'global_vars_1',
      data,
    });

    expect(globalInputs.data).toEqual({});
  });

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
    // First, create and build a dotLottie with global variables
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

    // Now load it back from ArrayBuffer
    let loadedDotLottie = new DotLottie();

    loadedDotLottie = await loadedDotLottie.fromArrayBuffer(arrayBuffer);

    const globalInputsList = loadedDotLottie.getGlobalInputs();

    expect(globalInputsList.length).toBe(1);
    expect(globalInputsList[0]?.id).toBe('theme_vars');
    expect(globalInputsList[0]?.data).toEqual(validGlobalInputsData);
  });

  it('handles multiple global variables assets', async () => {
    const dotLottie = new DotLottie();

    const secondglobalInputsData = {
        accentColor: {
          type: 'Color' as const,
          value: [0, 0, 1, 1],
        },
        scale: {
          type: 'Scalar' as const,
          value: 2.0,
        },
    };

    dotLottie.addGlobalInputs({
      id: 'theme_vars_1',
      data: validGlobalInputsData,
    });

    dotLottie.addGlobalInputs({
      id: 'theme_vars_2',
      data: secondglobalInputsData,
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

    dotLottie.addGlobalInputs({
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

    const loadedglobalInputs = loadedDotLottie.getGlobalInputsById('brand_vars');

    expect(loadedglobalInputs).toBeDefined();
    expect(loadedglobalInputs?.id).toBe('brand_vars');
    expect(loadedglobalInputs?.name).toBe('Brand Variables');
    expect(loadedglobalInputs?.data).toEqual(originalData);
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

    // Reload and verify
    let reloadedDotLottie = new DotLottie();
    
    reloadedDotLottie = await reloadedDotLottie.fromArrayBuffer(arrayBuffer);

    expect(reloadedDotLottie.animations.length).toBe(2);
    expect(reloadedDotLottie.getGlobalInputs().length).toBe(1);
  });
});
