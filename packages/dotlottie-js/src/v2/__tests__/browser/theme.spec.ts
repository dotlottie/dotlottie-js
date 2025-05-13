/**
 * Copyright 2025 Design Barn Inc.
 */

import type { ZipOptions } from 'fflate';
import { describe, expect, it, beforeEach } from 'vitest';

import { LottieTheme } from '../../browser';

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
      const theme = new LottieTheme({
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
      });

      expect(theme.id).toBe('theme-with-color');
      expect(theme.data.rules).toHaveLength(1);
      expect(theme.data.rules[0]?.id).toBe('color-rule');

      const rule = theme.data.rules[0] as { type: 'Color'; value: number[] };

      expect(rule.type).toBe('Color');
      expect(rule.value).toEqual([1, 0, 0, 1]);
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

        const rule = theme.data.rules[0] as { type: 'Color'; value: number[] };

        expect(rule.type).toBe('Color');
        expect(rule.value).toEqual([0.5, 0.4, 0.3, 1]);
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

        const rule = theme.data.rules[0] as { keyframes: Array<{ frame: number; value: number[] }>; type: 'Color' };

        expect(rule.type).toBe('Color');
        expect(rule.keyframes).toHaveLength(2);
        expect(rule.keyframes[0]?.frame).toBe(0);
        expect(rule.keyframes[1]?.value).toEqual([0, 1, 0, 1]);
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

        const rule = theme.data.rules[0] as { expression: string; type: 'Color' };

        expect(rule.type).toBe('Color');
        expect(rule.expression).toBe('rgb(255, 0, 0)');
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

        const rule = theme.data.rules[0] as { type: 'Scalar'; value: number };

        expect(rule.type).toBe('Scalar');
        expect(rule.value).toBe(42);
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

        const rule = theme.data.rules[0] as {
          keyframes: Array<{ frame: number; hold?: boolean; value: number }>;
          type: 'Scalar';
        };

        expect(rule.type).toBe('Scalar');
        expect(rule.keyframes).toHaveLength(2);
        expect(rule.keyframes[0]?.frame).toBe(0);
        expect(rule.keyframes[1]?.value).toBe(50);
        expect(rule.keyframes[1]?.hold).toBe(true);
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

        const rule = theme.data.rules[0] as { expression: string; type: 'Scalar' };

        expect(rule.type).toBe('Scalar');
        expect(rule.expression).toBe('time * 2');
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

        const rule = theme.data.rules[0] as {
          keyframes: Array<{ frame: number; value: number[]; valueInTangent?: number }>;
          split?: boolean;
          type: 'Position';
        };

        expect(rule.type).toBe('Position');
        expect(rule.keyframes).toHaveLength(2);
        expect(rule.keyframes[0]?.value).toEqual([100, 200]);
        expect(rule.keyframes[1]?.valueInTangent).toBe(0.5);
        expect(rule.split).toBe(true);
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

        const rule = theme.data.rules[0] as { expression: string; type: 'Position' };

        expect(rule.type).toBe('Position');
        expect(rule.expression).toBe('[100 + time, 200 + time]');
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

        const rule = theme.data.rules[0] as { type: 'Vector'; value: number[] };

        expect(rule.type).toBe('Vector');
        expect(rule.value).toEqual([10, 20, 30]);
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

        const rule = theme.data.rules[0] as {
          keyframes: Array<{
            frame: number;
            inTangent?: { x: number | number[]; y: number | number[] };
            value: number[];
          }>;
          type: 'Vector';
        };

        expect(rule.type).toBe('Vector');
        expect(rule.keyframes).toHaveLength(2);
        expect(rule.keyframes[0]?.value).toEqual([10, 20]);
        expect(rule.keyframes[1]?.inTangent?.x).toEqual([1, 2]);
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

        const rule = theme.data.rules[0] as {
          type: 'Image';
          value: {
            height?: number;
            id?: string;
            url?: string;
            width?: number;
          };
        };

        expect(rule.type).toBe('Image');
        expect(rule.value.id).toBe('image1');
        expect(rule.value.width).toBe(200);
        expect(rule.value.height).toBe(150);
        expect(rule.value.url).toBe('https://example.com/image.png');
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

        const rule = theme.data.rules[0] as { type: 'Image'; value: Record<string, unknown> };

        expect(rule.type).toBe('Image');
        expect(rule.value).toEqual({});
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

        const rule = theme.data.rules[0] as {
          type: 'Gradient';
          value: Array<{ color: number[]; offset: number }>;
        };

        expect(rule.type).toBe('Gradient');
        expect(rule.value).toHaveLength(2);
        expect(rule.value[0]?.color).toEqual([1, 0, 0, 1]);
        expect(rule.value[1]?.offset).toBe(1);
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

        const rule = theme.data.rules[0] as {
          keyframes: Array<{
            frame: number;
            value: Array<{ color: number[]; offset: number }>;
          }>;
          type: 'Gradient';
        };

        expect(rule.type).toBe('Gradient');
        expect(rule.keyframes).toHaveLength(2);
        expect(rule.keyframes[0]?.value).toHaveLength(2);
        expect(rule.keyframes[1]?.value[0]?.color).toEqual([0, 0, 1, 1]);
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
        const colorRule = theme.data.rules[0] as { type: 'Color' };
        const scalarRule = theme.data.rules[1] as { type: 'Scalar' };
        const positionRule = theme.data.rules[2] as { type: 'Position' };

        expect(colorRule.type).toBe('Color');
        expect(scalarRule.type).toBe('Scalar');
        expect(positionRule.type).toBe('Position');
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
        const rule1 = theme.data.rules[0] as { animations?: string[] };
        const rule2 = theme.data.rules[1] as { animations?: string[] };

        expect(rule1.animations).toEqual(['animation1', 'animation2']);
        expect(rule2.animations).toBeUndefined();
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
            type: 'Scalar' as const,
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
            type: 'Color' as const,
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
