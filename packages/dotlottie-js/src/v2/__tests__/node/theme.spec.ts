/**
 * Copyright 2025 Design Barn Inc.
 */

import type { ZipOptions } from 'fflate';
import { describe, expect, it, beforeEach } from 'vitest';

import { LottieTheme } from '../../node';

describe('LottieTheme', () => {
  describe('constructor', () => {
    it('should create a theme with valid options', () => {
      const themeOptions = {
        id: 'test-theme',
        data: {
          rules: [],
        },
      };

      const theme = new LottieTheme(themeOptions);

      expect(theme.id).toBe('test-theme');
      expect(theme.data).toEqual({ rules: [] });
      expect(theme.name).toBeUndefined();
    });

    it('should create a theme with name', () => {
      const themeOptions = {
        id: 'test-theme',
        name: 'Test Theme',
        data: {
          rules: [],
        },
      };

      const theme = new LottieTheme(themeOptions);

      expect(theme.id).toBe('test-theme');
      expect(theme.name).toBe('Test Theme');
    });

    it('should throw error with invalid id', () => {
      const themeOptions = {
        id: '',
        data: {
          rules: [],
        },
      };

      expect(() => new LottieTheme(themeOptions)).toThrow('Invalid theme id');
    });

    it('should create a theme with color rule', () => {
      const themeOptions = {
        id: 'theme-with-color',
        data: {
          rules: [
            {
              id: 'color-rule',
              type: 'Color',
              value: [1, 0, 0, 1],
            },
          ],
        },
      };

      const theme = new LottieTheme(themeOptions);

      expect(theme.id).toBe('theme-with-color');
      expect(theme.data.rules).toHaveLength(1);
      expect(theme.data.rules[0].id).toBe('color-rule');
      expect(theme.data.rules[0].type).toBe('Color');
      expect(theme.data.rules[0].value).toEqual([1, 0, 0, 1]);
    });
  });

  describe('rule type validation', () => {
    // Color Rule tests
    describe('Color rule', () => {
      it('creates a theme with a Color rule value', () => {
        const theme = new LottieTheme({
          id: 'color-theme',
          data: {
            rules: [
              {
                id: 'color-rule',
                type: 'Color',
                value: [0.5, 0.4, 0.3, 1],
              },
            ],
          },
        });

        expect(theme.data.rules[0].type).toBe('Color');
        expect(theme.data.rules[0].value).toEqual([0.5, 0.4, 0.3, 1]);
      });

      it('creates a theme with a Color rule and keyframes', () => {
        const theme = new LottieTheme({
          id: 'color-keyframes-theme',
          data: {
            rules: [
              {
                id: 'color-keyframes-rule',
                type: 'Color',
                keyframes: [
                  {
                    frame: 0,
                    value: [1, 0, 0, 1],
                  },
                  {
                    frame: 30,
                    value: [0, 1, 0, 1],
                    inTangent: { x: 10, y: 20 },
                    outTangent: { x: 15, y: 25 },
                  },
                ],
              },
            ],
          },
        });

        expect(theme.data.rules[0].type).toBe('Color');
        expect(theme.data.rules[0].keyframes).toHaveLength(2);
        expect(theme.data.rules[0].keyframes?.[0].frame).toBe(0);
        expect(theme.data.rules[0].keyframes?.[1].value).toEqual([0, 1, 0, 1]);
      });

      it('creates a theme with a Color rule and expression', () => {
        const theme = new LottieTheme({
          id: 'color-expression-theme',
          data: {
            rules: [
              {
                id: 'color-expression-rule',
                type: 'Color',
                expression: 'rgb(255, 0, 0)',
              },
            ],
          },
        });

        expect(theme.data.rules[0].type).toBe('Color');
        expect(theme.data.rules[0].expression).toBe('rgb(255, 0, 0)');
      });
    });

    // Scalar Rule tests
    describe('Scalar rule', () => {
      it('creates a theme with a Scalar rule value', () => {
        const theme = new LottieTheme({
          id: 'scalar-theme',
          data: {
            rules: [
              {
                id: 'scalar-rule',
                type: 'Scalar',
                value: 42,
              },
            ],
          },
        });

        expect(theme.data.rules[0].type).toBe('Scalar');
        expect(theme.data.rules[0].value).toBe(42);
      });

      it('creates a theme with a Scalar rule and keyframes', () => {
        const theme = new LottieTheme({
          id: 'scalar-keyframes-theme',
          data: {
            rules: [
              {
                id: 'scalar-keyframes-rule',
                type: 'Scalar',
                keyframes: [
                  {
                    frame: 0,
                    value: 10,
                  },
                  {
                    frame: 30,
                    value: 50,
                    hold: true,
                  },
                ],
              },
            ],
          },
        });

        expect(theme.data.rules[0].type).toBe('Scalar');
        expect(theme.data.rules[0].keyframes).toHaveLength(2);
        expect(theme.data.rules[0].keyframes?.[0].frame).toBe(0);
        expect(theme.data.rules[0].keyframes?.[1].value).toBe(50);
        expect(theme.data.rules[0].keyframes?.[1].hold).toBe(true);
      });

      it('creates a theme with a Scalar rule and expression', () => {
        const theme = new LottieTheme({
          id: 'scalar-expression-theme',
          data: {
            rules: [
              {
                id: 'scalar-expression-rule',
                type: 'Scalar',
                expression: 'time * 2',
              },
            ],
          },
        });

        expect(theme.data.rules[0].type).toBe('Scalar');
        expect(theme.data.rules[0].expression).toBe('time * 2');
      });
    });

    // Position Rule tests
    describe('Position rule', () => {
      it('creates a theme with a Position rule and keyframes', () => {
        const theme = new LottieTheme({
          id: 'position-theme',
          data: {
            rules: [
              {
                id: 'position-rule',
                type: 'Position',
                keyframes: [
                  {
                    frame: 0,
                    value: [100, 200],
                  },
                  {
                    frame: 60,
                    value: [300, 400],
                    valueInTangent: 0.5,
                    valueOutTangent: 0.8,
                  },
                ],
                split: true,
              },
            ],
          },
        });

        expect(theme.data.rules[0].type).toBe('Position');
        expect(theme.data.rules[0].keyframes).toHaveLength(2);
        expect(theme.data.rules[0].keyframes?.[0].value).toEqual([100, 200]);
        expect(theme.data.rules[0].keyframes?.[1].valueInTangent).toBe(0.5);
        expect(theme.data.rules[0].split).toBe(true);
      });

      it('creates a theme with a Position rule and expression', () => {
        const theme = new LottieTheme({
          id: 'position-expression-theme',
          data: {
            rules: [
              {
                id: 'position-expression-rule',
                type: 'Position',
                expression: '[100 + time, 200 + time]',
              },
            ],
          },
        });

        expect(theme.data.rules[0].type).toBe('Position');
        expect(theme.data.rules[0].expression).toBe('[100 + time, 200 + time]');
      });
    });

    // Vector Rule tests
    describe('Vector rule', () => {
      it('creates a theme with a Vector rule value', () => {
        const theme = new LottieTheme({
          id: 'vector-theme',
          data: {
            rules: [
              {
                id: 'vector-rule',
                type: 'Vector',
                value: [10, 20, 30],
              },
            ],
          },
        });

        expect(theme.data.rules[0].type).toBe('Vector');
        expect(theme.data.rules[0].value).toEqual([10, 20, 30]);
      });

      it('creates a theme with a Vector rule and keyframes', () => {
        const theme = new LottieTheme({
          id: 'vector-keyframes-theme',
          data: {
            rules: [
              {
                id: 'vector-keyframes-rule',
                type: 'Vector',
                keyframes: [
                  {
                    frame: 0,
                    value: [10, 20],
                  },
                  {
                    frame: 30,
                    value: [30, 40],
                    inTangent: { x: [1, 2], y: [3, 4] },
                  },
                ],
              },
            ],
          },
        });

        expect(theme.data.rules[0].type).toBe('Vector');
        expect(theme.data.rules[0].keyframes).toHaveLength(2);
        expect(theme.data.rules[0].keyframes?.[0].value).toEqual([10, 20]);
        expect(theme.data.rules[0].keyframes?.[1].inTangent?.x).toEqual([1, 2]);
      });
    });

    // Image Rule tests
    describe('Image rule', () => {
      it('creates a theme with an Image rule', () => {
        const theme = new LottieTheme({
          id: 'image-theme',
          data: {
            rules: [
              {
                id: 'image-rule',
                type: 'Image',
                value: {
                  id: 'image1',
                  width: 200,
                  height: 150,
                  url: 'https://example.com/image.png',
                },
              },
            ],
          },
        });

        expect(theme.data.rules[0].type).toBe('Image');
        expect(theme.data.rules[0].value.id).toBe('image1');
        expect(theme.data.rules[0].value.width).toBe(200);
        expect(theme.data.rules[0].value.height).toBe(150);
        expect(theme.data.rules[0].value.url).toBe('https://example.com/image.png');
      });

      it('creates a theme with a minimal Image rule', () => {
        const theme = new LottieTheme({
          id: 'minimal-image-theme',
          data: {
            rules: [
              {
                id: 'minimal-image-rule',
                type: 'Image',
                value: {},
              },
            ],
          },
        });

        expect(theme.data.rules[0].type).toBe('Image');
        expect(theme.data.rules[0].value).toEqual({});
      });
    });

    // Gradient Rule tests
    describe('Gradient rule', () => {
      it('creates a theme with a Gradient rule value', () => {
        const theme = new LottieTheme({
          id: 'gradient-theme',
          data: {
            rules: [
              {
                id: 'gradient-rule',
                type: 'Gradient',
                value: [
                  {
                    color: [1, 0, 0, 1],
                    offset: 0,
                  },
                  {
                    color: [0, 0, 1, 1],
                    offset: 1,
                  },
                ],
              },
            ],
          },
        });

        expect(theme.data.rules[0].type).toBe('Gradient');
        expect(theme.data.rules[0].value).toHaveLength(2);
        expect(theme.data.rules[0].value?.[0].color).toEqual([1, 0, 0, 1]);
        expect(theme.data.rules[0].value?.[1].offset).toBe(1);
      });

      it('creates a theme with a Gradient rule and keyframes', () => {
        const theme = new LottieTheme({
          id: 'gradient-keyframes-theme',
          data: {
            rules: [
              {
                id: 'gradient-keyframes-rule',
                type: 'Gradient',
                keyframes: [
                  {
                    frame: 0,
                    value: [
                      {
                        color: [1, 0, 0, 1],
                        offset: 0,
                      },
                      {
                        color: [0, 1, 0, 1],
                        offset: 1,
                      },
                    ],
                  },
                  {
                    frame: 30,
                    value: [
                      {
                        color: [0, 0, 1, 1],
                        offset: 0,
                      },
                      {
                        color: [1, 1, 0, 1],
                        offset: 1,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        });

        expect(theme.data.rules[0].type).toBe('Gradient');
        expect(theme.data.rules[0].keyframes).toHaveLength(2);
        expect(theme.data.rules[0].keyframes?.[0].value).toHaveLength(2);
        expect(theme.data.rules[0].keyframes?.[1].value[0].color).toEqual([0, 0, 1, 1]);
      });
    });

    // Test themes with multiple rule types
    describe('Multiple rule types', () => {
      it('creates a theme with multiple rule types', () => {
        const theme = new LottieTheme({
          id: 'mixed-rules-theme',
          data: {
            rules: [
              {
                id: 'color-rule',
                type: 'Color',
                value: [1, 0, 0, 1],
              },
              {
                id: 'scalar-rule',
                type: 'Scalar',
                value: 42,
              },
              {
                id: 'position-rule',
                type: 'Position',
                keyframes: [
                  { frame: 0, value: [0, 0] },
                  { frame: 60, value: [100, 100] },
                ],
              },
            ],
          },
        });

        expect(theme.data.rules).toHaveLength(3);
        expect(theme.data.rules[0].type).toBe('Color');
        expect(theme.data.rules[1].type).toBe('Scalar');
        expect(theme.data.rules[2].type).toBe('Position');
      });

      it('creates a theme with rules that have animations specified', () => {
        const theme = new LottieTheme({
          id: 'scoped-rules-theme',
          data: {
            rules: [
              {
                id: 'animation-specific-rule',
                type: 'Color',
                value: [1, 0, 0, 1],
                animations: ['animation1', 'animation2'],
              },
              {
                id: 'global-rule',
                type: 'Scalar',
                value: 42,
              },
            ],
          },
        });

        expect(theme.data.rules).toHaveLength(2);
        expect(theme.data.rules[0].animations).toEqual(['animation1', 'animation2']);
        expect(theme.data.rules[1].animations).toBeUndefined();
      });
    });
  });

  describe('getters and setters', () => {
    let theme: LottieTheme;

    beforeEach(() => {
      theme = new LottieTheme({
        id: 'test-theme',
        data: {
          rules: [],
        },
      });
    });

    it('should get and set id', () => {
      expect(theme.id).toBe('test-theme');

      theme.id = 'new-id';

      expect(theme.id).toBe('new-id');
    });

    it('should throw error when setting invalid id', () => {
      expect(() => {
        theme.id = '';
      }).toThrow('Invalid theme id');
    });

    it('should get and set name', () => {
      expect(theme.name).toBeUndefined();

      theme.name = 'New Theme Name';

      expect(theme.name).toBe('New Theme Name');
    });

    it('should get and set data', () => {
      const newData = {
        rules: [
          {
            id: 'scalar-rule',
            type: 'Scalar',
            value: 42,
          },
        ],
      };

      theme.data = newData;

      expect(theme.data).toEqual(newData);
    });

    it('should get and set zipOptions', () => {
      expect(theme.zipOptions).toEqual({});

      const newZipOptions: ZipOptions = {
        level: 1,
      };

      theme.zipOptions = newZipOptions;

      expect(theme.zipOptions).toEqual(newZipOptions);
    });
  });

  describe('toString', () => {
    it('should convert theme data to JSON string', async () => {
      // Test with blue color RGBA
      const themeData = {
        rules: [
          {
            id: 'color-rule',
            type: 'Color',
            value: [0, 0, 1, 1],
          },
        ],
      };

      const theme = new LottieTheme({
        id: 'blue-theme',
        data: themeData,
      });

      const result = await theme.toString();

      expect(result).toBe(JSON.stringify(themeData));
    });
  });
});
