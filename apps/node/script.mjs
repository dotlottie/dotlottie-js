/**
 * Copyright 2023 Design Barn Inc.
 */

import fs from 'fs';

import { DotLottie } from '@dotlottie/dotlottie-js/node';

async function createDotLottie() {
  const dotLottie = new DotLottie();

  await dotLottie
    .setAuthor('Joe')
    .setVersion('1.0')
    .addAnimation({
      id: 'animation_1',
      url: 'https://lottie.host/18b639d1-a200-4225-ba0e-3456d40f95a5/wlrsaqWa8r.json',
    })
    .addAnimation({
      id: 'animation_2',
      url: 'https://lottie.host/cf7b43d1-3d6b-407a-970b-6305b18bebfa/uB1Jboo1o1.json',
      autoplay: true,
    })
    .addState({
      id: 'state_1',
      state: {
        descriptor: {
          id: 'state_1',
          animationId: 'animation_1',
        },
        states: {
          runState: {
            statePlaybackSettings: {
              autoplay: true,
              loop: 3,
              direction: 1,
              segments: 'explosion',
            },
            onComplete: {
              state: 'feathers',
            },
          },
        },
      },
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      fs.writeFileSync('test_from_node.lottie', Buffer.from(value));
    });
}

createDotLottie();
