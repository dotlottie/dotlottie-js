/**
 * Copyright 2023 Design Barn Inc.
 */

import fs from 'fs';

import { DotLottie } from '@dotlottie/dotlottie-js/node';

async function createDotLottieForTests() {
  const dotLottie = new DotLottie();

  await dotLottie
    .setAuthor('Joe')
    .setVersion('1.0')
    .addAnimation({
      id: 'pigeon',
      url: 'https://lottie.host/071a2de9-52ca-4ce4-ba2f-a5befd220bdd/ECzVp4eaMa.json',
    })
    .addStateMachine({
      descriptor: {
        id: 'exploding_pigeon',
        initial: 0,
      },
      states: [
        {
          animation_id: "pigeon",
          type: "PlaybackState",
          autoplay: true,
          loop: false,
          marker: "bird"
        },
        {
          animation_id: "pigeon",
          type: "PlaybackState",
          autoplay: true,
          speed: 0.8,
          loop: false,
          marker: 'explosion',
        },
        {
          animation_id: "pigeon",
          type: "PlaybackState",
          autoplay: true,
          speed: 0.8,
          loop: false,
          marker: 'feathers',
        }
      ],
      transitions: [
        {
          type: "Transition",
          from_state: 0,
          to_state: 1,
          on_complete_event: {},
        },
        {
          type: "Transition",
          from_state: 1,
          to_state: 2,
          on_complete_event: {},
        },
        {
          type: "Transition",
          from_state: 2,
          to_state: 0,
          on_complete_event: {},
        },
      ],
      context_variables: [],
      listeners: []
    })
    .addStateMachine({
      descriptor: {
        id: 'pigeon_without_explosion',
        initial: 0,
      },
      states: [
        {
          animation_id: "pigeon",
          type: "PlaybackState",
          autoplay: true,
          loop: false,
          marker: "bird"
        },
        {
          animation_id: "pigeon",
          type: "PlaybackState",
          autoplay: true,
          speed: 0.8,
          loop: false,
          marker: 'feathers',
        }
      ],
      transitions: [
        {
          type: "Transition",
          from_state: 0,
          to_state: 1,
          on_complete_event: {},
        },
        {
          type: "Transition",
          from_state: 1,
          to_state: 0,
          on_complete_event: {},
        },
      ],
      context_variables: [],
      listeners: []
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      fs.writeFileSync('exploding-pigeons-test-file.lottie', Buffer.from(value));
    });
}

async function createExplodingPigeon() {
  const dotLottie = new DotLottie();

  await dotLottie
    .setAuthor('Joe')
    .setVersion('1.0')
    .addAnimation({
      id: 'pigeon',
      url: 'https://lottie.host/071a2de9-52ca-4ce4-ba2f-a5befd220bdd/ECzVp4eaMa.json',
    })
    .addStateMachine({
      descriptor: {
        id: 'exploding_pigeon',
        initial: 0,
      },
      states: [
        {
          animation_id: "pigeon",
          type: "PlaybackState",
          autoplay: true,
          loop: false,
          marker: "bird"
        },

        {
          animation_d: "pigeon",
          type: "PlaybackState",
          autoplay: true,
          speed: 0.8,
          loop: false,
          marker: 'explosion',
        },
        {
          animation_id: "pigeon",
          type: "PlaybackState",
          autoplay: true,
          speed: 0.8,
          loop: false,
          marker: 'feathers',
        }
      ],
      transitions: [
        {
          type: "Transition",
          from_state: 0,
          to_state: 1,
          on_complete_event: {},
        },
        {
          type: "Transition",
          from_state: 1,
          to_state: 2,
          on_complete_event: {},
        },
        {
          type: "Transition",
          from_state: 2,
          to_state: 0,
          on_complete_event: {},
        },
      ],
      listeners: [],
      context_variables: [
        {
          type: "Numeric",
          key: "counter_6",
          value: 6
        }
      ]
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      fs.writeFileSync('exploding_pigeon.zip', Buffer.from(value));
    });
}

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
    .addStateMachine({
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

// createDotLottie();
// createExplodingPigeon();
createDotLottieForTests();
