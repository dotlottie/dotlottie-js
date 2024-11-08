/**
 * Copyright 2024 Design Barn Inc.
 */

/**
 * This is a playground for creating/testing .lottie files.
 */

import fs from 'fs';

import { DotLottie } from './dist/index.node.js';
import BALL_DATA from './src/__tests__/__fixtures__/ball.json' assert { type: 'json' };

async function main() {
  const dotLottie = new DotLottie();

  dotLottie.addAnimation({
    id: 'ball',
    data: BALL_DATA,
  });

  dotLottie.addTheme({
    id: 'dark',
    data: {
      rules: [
        { id: 'ball_color', type: 'Color', value: [0, 1, 0, 1] },
        {
          id: 'bg_color',
          type: 'Color',
          keyframes: [
            {
              frame: 0,
              value: [0, 0, 0, 1],
              inTangent: { x: 0.6, y: 0.6 },
              outTangent: { x: 0.6, y: 0.6 },
            },
            { frame: 60, value: [1, 1, 1, 1] },
          ],
        },
      ],
    },
  });

  dotLottie.addTheme({
    id: 'light',
    data: {
      rules: [
        {
          id: 'ball_color',
          type: 'Color',
          keyframes: [
            { frame: 0, value: [0, 0, 0, 1], inTangent: { x: 0.6, y: 0.6 }, outTangent: { x: 0.6, y: 0.6 } },
            { frame: 60, value: [1, 1, 1, 1] },
          ],
        },
        { id: 'bg_color', type: 'Color', value: [0, 0.6, 0.6, 1] },
      ],
    },
  });

  await dotLottie.build();

  const buffer = await dotLottie.toArrayBuffer();

  fs.writeFileSync('output.lottie', new Uint8Array(buffer));
}

main();
