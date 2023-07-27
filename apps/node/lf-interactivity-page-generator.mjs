/**
 * Copyright 2023 Design Barn Inc.
 */

import fs from 'fs';

import { DotLottie } from '@dotlottie/dotlottie-js/node';

async function createDotLottie() {
  const dotLottie = new DotLottie();

  // This dotlottie doesnt contain scrolling interactivity
  // Interactions skipped:
  // sync-with-scroll
  // scroll relative to container
  // scroll with offset
  // Scroll effect with offset and segment looping
  // Sync animation with cursor position
  // Sync animation with cursor horizontal movement
  // Play animation on click
  // Toggle (But can be done with segments)
  // Play animation when visible
  // Play animation on hold
  // Pausehold animation
  // Clicking X amount of times (onEnter)
  // Hovering X amount of times (onEnter)
  // Can't change to a different animation
  // TODO: MACROS!! START_FRAME / END_FRAME
  await dotLottie
    .setAuthor('Sam!')
    .setVersion('1.0')
    .addAnimation({
      id: 'segments',
      url: 'https://assets2.lottiefiles.com/packages/lf20_4fET62.json',
    })
    .addState({
      id: 'state_segments',
      state: {
        descriptor: {
          id: 'state_segments',
          initial: 'loopState',
        },
        states: {
          animationId: 'segments',
          loopState: {
            statePlaybackSettings: {
              autoplay: true,
              loop: true,
              segments: [70, 500],
            },
          },
        },
      },
    })
    .addAnimation({
      id: 'segments_on_hover',
      url: 'https://assets9.lottiefiles.com/packages/lf20_gr2cHM.json',
    })
    .addState({
      id: 'state_segments_on_hover',
      state: {
        descriptor: {
          id: 'state_segments_on_hover',
          initial: 'loopState',
        },
        states: {
          animationId: 'segments_on_hover',
          loopState: {
            statePlaybackSettings: {
              autoplay: true,
              loop: true,
              hover: true,
              segments: [45, 60],
            },
          },
        },
      },
    })
    .addAnimation({
      id: 'animation_on_hover',
      url: 'https://assets8.lottiefiles.com/packages/lf20_zwath9pn.json',
    })
    .addState({
      id: 'state_animation_on_hover',
      state: {
        descriptor: {
          id: 'state_animation_on_hover',
          initial: 'loopState',
        },
        states: {
          loopState: {
            animationId: 'animation_on_hover',
            statePlaybackSettings: {
              autoplay: true,
              loop: true,
              hover: true,
            },
          },
        },
      },
    })
    .addAnimation({
      id: 'toggle',
      url: 'https://assets8.lottiefiles.com/private_files/lf30_tnblylie.json',
    })
    .addState({
      id: 'state_toggle',
      state: {
        descriptor: {
          id: 'state_toggle',
          initial: 'startIdle',
        },
        states: {
          startIdle: {
            animationId: 'toggle',
            statePlaybackSettings: {
              autoplay: false,
              loop: false,
              segments: [0, 0],
            },
            onClick: {
              state: 'playSun',
            },
          },
          playSun: {
            animationId: 'toggle',
            statePlaybackSettings: {
              autoplay: true,
              loop: false,
              segments: [0, 30],
            },
            onComplete: {
              state: 'endIdle',
            },
          },
          endIdle: {
            animationId: 'toggle',
            statePlaybackSettings: {
              autoplay: false,
              loop: false,
              segments: [30, 30],
            },
            onClick: {
              state: 'playReverse',
            },
          },
          playReverse: {
            animationId: 'toggle',
            statePlaybackSettings: {
              autoplay: true,
              loop: false,
              segments: [30, 0],
            },
            onComplete: {
              state: 'startIdle',
            },
          },
        },
      },
    })
    .addAnimation({
      id: 'pigeon',
      url: 'https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json',
    })
    .addState({
      id: 'exploding_pigeon',
      state: {
        descriptor: {
          id: 'exploding_pigeon',
          initial: 'running',
        },
        states: {
          running: {
            animationId: 'pigeon',
            statePlaybackSettings: {
              autoplay: true,
              loop: true,
              direction: 1,
              segments: 'bird',
            },
            onClick: {
              state: 'exploding',
            },
          },
          exploding: {
            animationId: 'pigeon',
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
          feathers: {
            animationId: 'pigeon',
            statePlaybackSettings: {
              autoplay: true,
              loop: false,
              direction: 1,
              segments: 'feathers',
            },
            onComplete: {
              state: 'running',
            },
          },
        },
      },
    })
    .addAnimation({
      id: 'repeat',
      url: 'https://assets4.lottiefiles.com/packages/lf20_bshezgfo.json',
    })
    .addAnimation({
      id: 'repeat_second_animation',
      url: 'https://assets2.lottiefiles.com/packages/lf20_2m1smtya.json',
    })
    .addState({
      id: 'state_repeat',
      state: {
        descriptor: {
          id: 'state_repeat',
          initial: 'repeat_3_times',
        },
        states: {
          repeat_3_times: {
            animationId: 'repeat',
            statePlaybackSettings: {
              autoplay: true,
              loop: 3,
              direction: 1,
              segments: 'repeat',
            },
            onComplete: {
              state: 'success',
            },
          },
          success: {
            animationId: 'repeat_second_animation',
            statePlaybackSettings: {
              autoplay: true,
              loop: false,
              direction: 1,
            },
            onComplete: {
              state: 'repeat_3_times',
            },
          },
        },
      },
    })
    .addAnimation({
      id: 'bullseye',
      url: 'https://assets5.lottiefiles.com/packages/lf20_9ZfVw0.json',
    })
    .addAnimation({
      id: 'confetti',
      url: 'https://assets6.lottiefiles.com/packages/lf20_opn6z1qt.json',
    })
    .addAnimation({
      id: 'well_done',
      url: 'https://assets9.lottiefiles.com/packages/lf20_pKiaUR.json',
    })
    .addState({
      id: 'state_load_in_queue_1',
      state: {
        descriptor: {
          id: 'state_load_in_queue_1',
          initial: 'bullseye_idle',
        },
        states: {
          bullseye_idle: {
            animationId: 'bullseye',
            statePlaybackSettings: {
              autoplay: false,
              loop: false,
              direction: 1,
            },
            onClick: {
              state: 'bullseye_hit',
            },
          },
          bullseye_hit: {
            animationId: 'bullseye',
            statePlaybackSettings: {
              autoplay: true,
              loop: false,
              direction: 1,
            },
            onComplete: {
              state: 'state_load_in_queue_2',
            },
          },
          state_load_in_queue_2: {
            animationId: 'confetti',
            statePlaybackSettings: {
              autoplay: true,
              loop: false,
              direction: 1,
            },
            onComplete: {
              state: 'state_load_in_queue_3',
            },
          },
          state_load_in_queue_3: {
            animationId: 'well_done',
            statePlaybackSettings: {
              autoplay: true,
              loop: false,
              direction: 1,
            },
            onComplete: {
              state: 'bullseye_idle',
            },
          },
        },
      },
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      fs.writeFileSync('lf_interactivity_page.lottie', Buffer.from(value));

      let test = new DotLottie();

      test = await test.fromArrayBuffer(value);

      console.log(test.getState('state_segments'));
      console.log(test.getState('exploding_pigeon'));
      console.log(test.getState('exploding_pigeon').state.states.running);
    });
}

async function createSingles() {
  const stateSegments = new DotLottie();

  await stateSegments
    .setAuthor('Sam!')
    .setVersion('1.0')
    .addAnimation({
      id: 'segments',
      url: 'https://assets2.lottiefiles.com/packages/lf20_4fET62.json',
    })
    .addState({
      id: 'state_segments',
      state: {
        descriptor: {
          id: 'state_segments',
          initial: 'loopState',
        },
        states: {
          animationId: 'segments',
          loopState: {
            statePlaybackSettings: {
              autoplay: true,
              loop: true,
              segments: [70, 500],
            },
          },
        },
      },
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      fs.writeFileSync('stateSegments.lottie', Buffer.from(value));
    });

  const stateSegmentsOnHover = new DotLottie();

  await stateSegmentsOnHover
    .addAnimation({
      id: 'segments_on_hover',
      url: 'https://assets9.lottiefiles.com/packages/lf20_gr2cHM.json',
    })
    .addState({
      id: 'state_segments_on_hover',
      state: {
        descriptor: {
          id: 'state_segments_on_hover',
          initial: 'loopState',
        },
        states: {
          animationId: 'segments_on_hover',
          loopState: {
            statePlaybackSettings: {
              autoplay: true,
              loop: true,
              hover: true,
              segments: [45, 60],
            },
          },
        },
      },
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      fs.writeFileSync('segmentsOnHover.lottie', Buffer.from(value));
    });

  const animationOnHover = new DotLottie();

  await animationOnHover
    .addAnimation({
      id: 'animation_on_hover',
      url: 'https://assets8.lottiefiles.com/packages/lf20_zwath9pn.json',
    })
    .addState({
      id: 'state_animation_on_hover',
      state: {
        descriptor: {
          id: 'state_animation_on_hover',
          initial: 'loopState',
        },
        states: {
          loopState: {
            animationId: 'animation_on_hover',
            statePlaybackSettings: {
              autoplay: true,
              loop: true,
              hover: true,
            },
          },
        },
      },
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      fs.writeFileSync('animationOnHover.lottie', Buffer.from(value));
    });

  const toggle = new DotLottie();

  await toggle
    .addAnimation({
      id: 'toggle',
      url: 'https://assets8.lottiefiles.com/private_files/lf30_tnblylie.json',
    })
    .addState({
      id: 'state_toggle',
      state: {
        descriptor: {
          id: 'state_toggle',
          initial: 'startIdle',
        },
        states: {
          startIdle: {
            animationId: 'toggle',
            statePlaybackSettings: {
              autoplay: false,
              loop: false,
            },
            onClick: {
              state: 'playSun',
            },
          },
          playSun: {
            animationId: 'toggle',
            statePlaybackSettings: {
              autoplay: true,
              loop: false,
              segments: [0, 30],
            },
            onComplete: {
              state: 'endIdle',
            },
          },
          endIdle: {
            animationId: 'toggle',
            statePlaybackSettings: {
              autoplay: false,
              loop: false,
            },
            onClick: {
              state: 'playReverse',
            },
          },
          playReverse: {
            animationId: 'toggle',
            statePlaybackSettings: {
              autoplay: true,
              loop: false,
              segments: [30, 0],
            },
            onComplete: {
              state: 'startIdle',
            },
          },
        },
      },
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      fs.writeFileSync('toggle.lottie', Buffer.from(value));
    });

  const pigeon = new DotLottie();

  await pigeon
    .addAnimation({
      id: 'pigeon',
      url: 'https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json',
    })
    .addState({
      id: 'exploding_pigeon',
      state: {
        descriptor: {
          id: 'exploding_pigeon',
          initial: 'running',
        },
        states: {
          running: {
            animationId: 'pigeon',
            statePlaybackSettings: {
              autoplay: true,
              loop: true,
              direction: 1,
              segments: 'bird',
            },
            onClick: {
              state: 'exploding',
            },
          },
          exploding: {
            animationId: 'pigeon',
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
          feathers: {
            animationId: 'pigeon',
            statePlaybackSettings: {
              autoplay: true,
              loop: false,
              direction: 1,
              segments: 'feathers',
            },
            onComplete: {
              state: 'running',
            },
          },
        },
      },
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      fs.writeFileSync('pigeon.lottie', Buffer.from(value));
    });

  const repeat = new DotLottie();

  await repeat
    .addAnimation({
      id: 'repeat',
      url: 'https://assets4.lottiefiles.com/packages/lf20_bshezgfo.json',
    })
    .addAnimation({
      id: 'repeat_second_animation',
      url: 'https://assets2.lottiefiles.com/packages/lf20_2m1smtya.json',
    })
    .addState({
      id: 'state_repeat',
      state: {
        descriptor: {
          id: 'state_repeat',
          initial: 'repeat_3_times',
        },
        states: {
          repeat_3_times: {
            animationId: 'repeat',
            statePlaybackSettings: {
              autoplay: true,
              loop: 3,
              direction: 1,
              segments: 'repeat',
            },
            onComplete: {
              state: 'success',
            },
          },
          success: {
            animationId: 'repeat_second_animation',
            statePlaybackSettings: {
              autoplay: true,
              loop: false,
              direction: 1,
            },
            onComplete: {
              state: 'repeat_3_times',
            },
          },
        },
      },
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      fs.writeFileSync('repeat.lottie', Buffer.from(value));
    });

  const loadInQueue = new DotLottie();

  await loadInQueue
    .addAnimation({
      id: 'bullseye',
      url: 'https://assets5.lottiefiles.com/packages/lf20_9ZfVw0.json',
    })
    .addAnimation({
      id: 'confetti',
      url: 'https://assets6.lottiefiles.com/packages/lf20_opn6z1qt.json',
    })
    .addAnimation({
      id: 'well_done',
      url: 'https://assets9.lottiefiles.com/packages/lf20_pKiaUR.json',
    })
    .addState({
      id: 'state_load_in_queue_1',
      state: {
        descriptor: {
          id: 'state_load_in_queue_1',
          initial: 'bullseye_idle',
        },
        states: {
          bullseye_idle: {
            animationId: 'bullseye',
            statePlaybackSettings: {
              autoplay: false,
              loop: false,
              direction: 1,
            },
            onClick: {
              state: 'bullseye_hit',
            },
          },
          bullseye_hit: {
            animationId: 'bullseye',
            statePlaybackSettings: {
              autoplay: true,
              loop: false,
              direction: 1,
            },
            onComplete: {
              state: 'state_load_in_queue_2',
            },
          },
          state_load_in_queue_2: {
            animationId: 'confetti',
            statePlaybackSettings: {
              autoplay: true,
              loop: false,
              direction: 1,
            },
            onComplete: {
              state: 'state_load_in_queue_3',
            },
          },
          state_load_in_queue_3: {
            animationId: 'well_done',
            statePlaybackSettings: {
              autoplay: true,
              loop: false,
              direction: 1,
            },
            onComplete: {
              state: 'bullseye_idle',
            },
          },
        },
      },
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      fs.writeFileSync('loadInQueue.lottie', Buffer.from(value));
    });

  const onAfter = new DotLottie();

  await onAfter
    .addAnimation({
      id: 'onAfter',
      url: 'https://assets8.lottiefiles.com/packages/lf20_zwath9pn.json',
    })
    .addState({
      id: 'onAfter',
      state: {
        descriptor: {
          id: 'onAfter',
          initial: 'wait',
        },
        states: {
          wait: {
            animationId: 'onAfter',
            statePlaybackSettings: {
              autoplay: true,
              loop: true,
              intermission: 3000,
            },
            onComplete: {
              state: 'after3000',
            },
          },
          after3000: {
            statePlaybackSettings: {
              autoplay: true,
              loop: true,
              speed: 5,
              direction: -1,
            },
          },
        },
      },
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      fs.writeFileSync('onAfter.lottie', Buffer.from(value));
    });
}

createDotLottie();
createSingles();
