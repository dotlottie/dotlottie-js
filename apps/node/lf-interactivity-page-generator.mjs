/**
 * Copyright 2023 Design Barn Inc.
 */

import fs from 'fs';

import { DotLottie } from '@dotlottie/dotlottie-js/node';
import { getStateMachine } from '@dotlottie/dotlottie-js/node';

async function createDotLottie() {
  const dotLottie = new DotLottie();

  // This dotlottie doesnt contain scrolling interactivity
  // Interactions skipped:
  // tldlr: scrolling, syncing to cursor, playing when visible, clicking x amount of times

  // sync-with-scroll
  // scroll relative to container
  // scroll with offset
  // Scroll effect with offset and segment looping
  // Sync animation with cursor position
  // Sync animation with cursor horizontal movement
  // Play animation when visible
  // Play animation on hold -> done
  // Pausehold animation -> done
  // Clicking X amount of times (onEnter)
  // Hovering X amount of times (onEnter)
  // Can't change to a different animation
  // TODO: MACROS!! START_FRAME / END_FRAME
  const dl = await dotLottie
    .setAuthor('Sam!')
    .setVersion('1.0')
    .addAnimation({
      id: 'segments',
      url: 'https://assets2.lottiefiles.com/packages/lf20_4fET62.json',
    })
    .addStateMachine({
      descriptor: {
        id: 'state_segments',
        initial: 'loopState',
      },
      states: {
        loopState: {
          animationId: 'segments',
          playbackSettings: {
            autoplay: true,
            loop: true,
            segments: [70, 500],
          },
        },
      },
    })
    .addAnimation({
      id: 'segments_on_hover',
      url: 'https://assets9.lottiefiles.com/packages/lf20_gr2cHM.json',
    })
    .addStateMachine({
      descriptor: {
        id: 'state_segments_on_hover',
        initial: 'idleState',
      },
      states: {
        idleState: {
          animationId: 'segments_on_hover',
          playbackSettings: {
            autoplay: false,
            loop: false,
          },
          onMouseEnter: {
            state: 'loopState',
          },
        },
        loopState: {
          animationId: 'segments_on_hover',
          playbackSettings: {
            autoplay: true,
            loop: true,
            hover: true,
            segments: [45, 60],
          },
          onMouseLeave: {
            state: 'idleState',
          },
        },
      },
    })
    .addAnimation({
      id: 'animation_on_hover',
      url: 'https://assets8.lottiefiles.com/packages/lf20_zwath9pn.json',
    })
    .addStateMachine({
      descriptor: {
        id: 'state_animation_on_hover',
        initial: 'loopState',
      },
      states: {
        loopState: {
          animationId: 'animation_on_hover',
          playbackSettings: {
            autoplay: true,
            loop: true,
            hover: true,
          },
        },
      },
    })
    .addAnimation({
      id: 'on_enter_test',
      url: 'https://lottie.host/fbfc80fb-5505-4445-a4af-d1171f077038/jB5EtesVh1.json',
    })
    .addStateMachine({
      descriptor: {
        id: 'on_enter_test',
        initial: 'startState',
      },
      states: {
        startState: {
          animationId: 'on_enter_test',
          playbackSettings: {
            autoplay: false,
            loop: false,
          },
          onClick: {
            state: 'playState',
          },
        },
        playState: {
          playbackSettings: {
            autoplay: true,
            loop: false,
          },
          onEnter: {
            count: 5,
            state: 'successState',
          },
          onComplete: {
            state: 'startState',
          },
        },
        successState: {
          animationId: 'confetti',
          playbackSettings: {
            autoplay: true,
            loop: false,
          },
          onComplete: {
            state: 'startState',
          },
        },
      },
    })
    .addAnimation({
      id: 'play_on_hold',
      url: 'https://assets10.lottiefiles.com/packages/lf20_dmd1gncl.json',
    })
    .addStateMachine({
      descriptor: {
        id: 'play_on_hold',
        initial: 'idleState',
      },
      states: {
        idleState: {
          animationId: 'play_on_hold',
          playbackSettings: {
            autoplay: false,
            loop: false,
            direction: 1,
          },
          onMouseEnter: {
            state: 'playState',
          },
        },
        playState: {
          playbackSettings: {
            autoplay: true,
            loop: false,
            direction: 1,
          },
          onMouseLeave: {
            state: 'reversePlayState',
          },
        },
        reversePlayState: {
          playbackSettings: {
            autoplay: true,
            loop: false,
            direction: -1,
          },
          onMouseEnter: {
            state: 'playState',
          },
          onComplete: {
            state: 'idleState',
          },
        },
      },
    })
    .addStateMachine({
      descriptor: {
        id: 'play_on_hold_pause',
        initial: 'idleState',
      },
      states: {
        idleState: {
          animationId: 'play_on_hold',
          playbackSettings: {
            autoplay: false,
            loop: false,
          },
          onMouseEnter: {
            state: 'playState',
          },
        },
        playState: {
          playbackSettings: {
            autoplay: true,
            loop: false,
            direction: 1,
          },
          onMouseLeave: {
            state: 'idleState',
          },
        },
      },
    })
    .addAnimation({
      id: 'toggle',
      url: 'https://assets8.lottiefiles.com/private_files/lf30_tnblylie.json',
    })
    .addStateMachine({
      descriptor: {
        id: 'state_toggle',
        initial: 'startIdle',
      },
      states: {
        startIdle: {
          animationId: 'toggle',
          playbackSettings: {
            autoplay: false,
            loop: false,
          },
          onClick: {
            state: 'playSun',
          },
        },
        playSun: {
          playbackSettings: {
            autoplay: true,
            loop: false,
            segments: [0, 30],
          },
          onComplete: {
            state: 'endIdle',
          },
        },
        endIdle: {
          playbackSettings: {
            autoplay: false,
            loop: false,
          },
          onClick: {
            state: 'playReverse',
          },
        },
        playReverse: {
          playbackSettings: {
            autoplay: true,
            loop: false,
            segments: [30, 0],
          },
          onComplete: {
            state: 'startIdle',
          },
        },
      },
    })
    .addAnimation({
      id: 'pigeon',
      url: 'https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json',
    })
    .addStateMachine({
      descriptor: {
        id: 'exploding_pigeon',
        initial: 'running',
      },
      states: {
        running: {
          animationId: 'pigeon',
          playbackSettings: {
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
          playbackSettings: {
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
          playbackSettings: {
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
    })
    .addAnimation({
      id: 'repeat',
      url: 'https://lottie.host/82f9aac1-c166-4124-9143-002bf32e235f/p1fb9yQ3lu.json',
    })
    .addAnimation({
      id: 'repeat_second_animation',
      url: 'https://lottie.host/5f095db6-2486-4020-ba31-77ef9697d031/izCcpDAsdG.json',
    })
    .addStateMachine({
      descriptor: {
        id: 'state_repeat',
        initial: 'repeat_3_times',
      },
      states: {
        repeat_3_times: {
          animationId: 'repeat',
          playbackSettings: {
            autoplay: true,
            loop: 3,
            direction: 1,
          },
          onComplete: {
            state: 'success',
          },
        },
        success: {
          animationId: 'repeat_second_animation',
          playbackSettings: {
            autoplay: true,
            loop: false,
            direction: 1,
          },
          onComplete: {
            state: 'repeat_3_times',
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
    .addStateMachine({
      descriptor: {
        id: 'state_load_in_queue_1',
        initial: 'bullseye_idle',
      },
      states: {
        bullseye_idle: {
          animationId: 'bullseye',
          playbackSettings: {
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
          playbackSettings: {
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
          playbackSettings: {
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
          playbackSettings: {
            autoplay: true,
            loop: false,
            direction: 1,
          },
          onComplete: {
            state: 'bullseye_idle',
          },
        },
      },
    })
    .addAnimation({
      id: 'lighthouse',
      url: 'https://lottie.host/3bc6c6e9-36f0-4e1b-9a22-beb871207737/5pVAM4rz72.json',
    })
    .addAnimation({
      id: 'timeline',
      url: 'https://lottie.host/fd2ec8b2-d8c3-4750-995f-ed07e2719eb2/h4dpZu5Vm0.json',
    })
    .addStateMachine({
      descriptor: {
        id: 'onScrollZero',
        initial: 'onScrollState',
      },
      states: {
        onScrollState: {
          animationId: 'lighthouse',
          playbackSettings: {
            playOnScroll: [0, 1.0],
          },
        },
      },
    })
    .addStateMachine({
      descriptor: {
        id: 'onScrollOne',
        initial: 'onScrollState',
      },
      states: {
        onScrollState: {
          animationId: 'lighthouse',
          playbackSettings: {
            playOnScroll: [0.5, 1],
          },
        },
      },
    })
    .addStateMachine({
      descriptor: {
        id: 'onScrollTwo',
        initial: 'onScrollState',
      },
      states: {
        onScrollState: {
          animationId: 'lighthouse',
          playbackSettings: {
            playOnScroll: [0, 1],
            segments: [0, 100],
          },
        },
      },
    })
    .addStateMachine({
      descriptor: {
        id: 'onScrollThree',
        initial: 'onScrollState',
      },
      states: {
        onScrollState: {
          animationId: 'lighthouse',
          playbackSettings: {
            playOnScroll: [0, 1],
            segments: [0, 100],
            speed: 3,
            autoplay: true,
            loop: true,
            direction: -1,
          },
        },
      },
    })
    .addStateMachine({
      descriptor: {
        id: 'onShowZero',
        initial: 'initialState',
      },
      states: {
        initialState: {
          animationId: 'lighthouse',
          playbackSettings: {
            autoplay: false,
            loop: false,
          },
          onShow: {
            state: 'playState',
          },
        },
        playState: {
          playbackSettings: {
            autoplay: true,
            loop: true,
            speed: 4,
          },
          onComplete: {
            state: 'initialState',
          },
        },
      },
    })
    .addStateMachine({
      descriptor: {
        id: 'onShowOne',
        initial: 'initialState',
      },
      states: {
        initialState: {
          animationId: 'timeline',
          playbackSettings: {
            autoplay: false,
            loop: false,
          },
          onShow: {
            state: 'playState',
          },
        },
        playState: {
          playbackSettings: {
            autoplay: true,
            loop: true,
            speed: 2,
          },
          onComplete: {
            state: 'initialState',
          },
        },
      },
    })
    .addStateMachine({
      descriptor: {
        id: 'onShowTwo',
        initial: 'initialState',
      },
      states: {
        initialState: {
          animationId: 'timeline',
          playbackSettings: {
            autoplay: false,
            loop: false,
          },
          onShow: {
            state: 'playState',
          },
        },
        playState: {
          playbackSettings: {
            autoplay: true,
            loop: false,
            speed: 2,
          },
          onComplete: {
            state: 'lightHouseState',
          },
        },
        lightHouseState: {
          animationId: 'lighthouse',
          playbackSettings: {
            playOnScroll: [0, 1],
          },
          onComplete: {
            state: 'initialState',
          },
          onClick: {
            state: 'initialState',
          },
        },
      },
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      const filename = 'lf_interactivity_page.lottie';

      const stateMachine = await getStateMachine(new Uint8Array(value), 'state_segments');

      console.log('> Writing to file: ', filename);
      fs.writeFileSync(filename, Buffer.from(value));
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
    .addStateMachine({
      descriptor: {
        id: 'state_segments',
        initial: 'loopState',
      },
      states: {
        loopState: {
          animationId: 'segments',
          playbackSettings: {
            autoplay: true,
            loop: true,
            segments: [70, 500],
          },
        },
      },
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      const filename = 'stateSegments.lottie';

      console.log('> Writing to file: ', filename);
      fs.writeFileSync(filename, Buffer.from(value));
    });

  const stateSegmentsOnHover = new DotLottie();

  await stateSegmentsOnHover
    .addAnimation({
      id: 'segments_on_hover',
      url: 'https://assets9.lottiefiles.com/packages/lf20_gr2cHM.json',
    })
    .addStateMachine({
      descriptor: {
        id: 'state_segments_on_hover',
        initial: 'loopState',
      },
      states: {
        loopState: {
          animationId: 'segments_on_hover',
          playbackSettings: {
            autoplay: true,
            loop: true,
            hover: true,
            segments: [45, 60],
          },
        },
      },
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      const filename = 'segmentsOnHover.lottie';

      console.log('> Writing to file: ', filename);
      fs.writeFileSync(filename, Buffer.from(value));
    });

  const animationOnHover = new DotLottie();

  await animationOnHover
    .addAnimation({
      id: 'animation_on_hover',
      url: 'https://assets8.lottiefiles.com/packages/lf20_zwath9pn.json',
    })
    .addStateMachine({
      descriptor: {
        id: 'state_animation_on_hover',
        initial: 'loopState',
      },
      states: {
        loopState: {
          animationId: 'animation_on_hover',
          playbackSettings: {
            autoplay: true,
            loop: true,
            hover: true,
          },
        },
      },
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      const filename = 'animationOnHover.lottie';

      console.log('> Writing to file: ', filename);
      fs.writeFileSync(filename, Buffer.from(value));
    });

  const toggle = new DotLottie();

  await toggle
    .addAnimation({
      id: 'toggle',
      url: 'https://assets8.lottiefiles.com/private_files/lf30_tnblylie.json',
    })
    .addStateMachine({
      descriptor: {
        id: 'state_toggle',
        initial: 'startIdle',
      },
      states: {
        startIdle: {
          playbackSettings: {
            autoplay: false,
            loop: false,
          },
          onClick: {
            state: 'playSun',
          },
        },
        playSun: {
          playbackSettings: {
            autoplay: true,
            loop: false,
            segments: [0, 30],
          },
          onComplete: {
            state: 'endIdle',
          },
        },
        endIdle: {
          playbackSettings: {
            autoplay: false,
            loop: false,
          },
          onClick: {
            state: 'playReverse',
          },
        },
        playReverse: {
          playbackSettings: {
            autoplay: true,
            loop: false,
            segments: [30, 0],
          },
          onComplete: {
            state: 'startIdle',
          },
        },
      },
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      const filename = 'toggle.lottie';

      console.log('> Writing to file: ', filename);
      fs.writeFileSync(filename, Buffer.from(value));
    });

  const toggleTest = new DotLottie();

  await toggleTest
    .addAnimation({
      id: 'toggle',
      url: 'https://assets8.lottiefiles.com/private_files/lf30_tnblylie.json',
    })
    .addStateMachine({
      descriptor: {
        id: 'state_toggle',
        initial: 'startIdle',
      },
      states: {
        startIdle: {
          playbackSettings: {
            autoplay: false,
            loop: false,
          },
          onClick: {
            state: 'playSun',
          },
        },
        playSun: {
          playbackSettings: {
            autoplay: true,
            loop: false,
            segments: [0, 30],
          },
        },
        // endIdle: {
        //   playbackSettings: {
        //     autoplay: false,
        //     loop: false,
        //   },
        //   onClick: {
        //     state: 'playReverse',
        //   },
        // },
        // playReverse: {
        //   playbackSettings: {
        //     autoplay: true,
        //     loop: false,
        //     segments: [30, 0],
        //   },
        //   onComplete: {
        //     state: 'startIdle',
        //   },
        // },
      },
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      const filename = 'toggle_test.lottie';

      console.log('> Writing to file: ', filename);
      fs.writeFileSync(filename, Buffer.from(value));
    });

  const mouseEnterMouseLeave = new DotLottie();

  await mouseEnterMouseLeave
    .addAnimation({
      id: 'mouseEnterMouseLeave',
      url: 'https://assets8.lottiefiles.com/private_files/lf30_tnblylie.json',
    })
    .addStateMachine({
      descriptor: {
        id: 'mouseEnterMouseLeave',
        initial: 'startIdle',
      },
      states: {
        startIdle: {
          animationId: 'mouseEnterMouseLeave',
          playbackSettings: {
            autoplay: false,
            loop: false,
          },
          onMouseEnter: {
            state: 'playSun',
          },
        },
        playSun: {
          animationId: 'mouseEnterMouseLeave',
          playbackSettings: {
            autoplay: true,
            loop: false,
          },
          onMouseLeave: {
            state: 'playReverse',
          },
        },
        playReverse: {
          animationId: 'mouseEnterMouseLeave',
          playbackSettings: {
            autoplay: true,
            loop: false,
            direction: -1,
          },
          onComplete: {
            state: 'startIdle',
          },
        },
      },
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      const filename = 'mouseEnterLeave.lottie';

      console.log('> Writing to file: ', filename);
      fs.writeFileSync(filename, Buffer.from(value));
    });

  const pigeon = new DotLottie();

  await pigeon
    .addAnimation({
      id: 'pigeon',
      url: 'https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json',
    })
    .addStateMachine({
      descriptor: {
        id: 'exploding_pigeon',
        initial: 'running',
      },
      states: {
        running: {
          animationId: 'pigeon',
          playbackSettings: {
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
          playbackSettings: {
            autoplay: true,
            loop: 1,
            direction: 1,
            segments: 'explosion',
          },
          onComplete: {
            state: 'feathers',
          },
        },
        feathers: {
          animationId: 'pigeon',
          playbackSettings: {
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
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      const filename = 'pigeon.lottie';

      console.log('> Writing to file: ', filename);

      fs.writeFileSync(filename, Buffer.from(value));
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
    .addStateMachine({
      descriptor: {
        id: 'state_repeat',
        initial: 'repeat_3_times',
      },
      states: {
        repeat_3_times: {
          animationId: 'repeat',
          playbackSettings: {
            autoplay: true,
            loop: 3,
          },
          onComplete: {
            state: 'success',
          },
        },
        success: {
          animationId: 'repeat_second_animation',
          playbackSettings: {
            autoplay: true,
            loop: false,
            direction: 1,
          },
          onComplete: {
            state: 'repeat_3_times',
          },
        },
      },
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      const filename = 'repeat.lottie';

      console.log('> Writing to file: repeat.lottie');
      fs.writeFileSync(filename, Buffer.from(value));
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
    .addStateMachine({
      descriptor: {
        id: 'state_load_in_queue_1',
        initial: 'bullseye_idle',
      },
      states: {
        bullseye_idle: {
          animationId: 'bullseye',
          playbackSettings: {
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
          playbackSettings: {
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
          playbackSettings: {
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
          playbackSettings: {
            autoplay: true,
            loop: false,
            direction: 1,
          },
          onComplete: {
            state: 'bullseye_idle',
          },
        },
      },
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      const filename = 'loadInQueue.lottie';
      console.log('> Writing to file: loadInQueue.lottie');

      fs.writeFileSync(filename, Buffer.from(value));
    });

  const onAfter = new DotLottie();

  await onAfter
    .addAnimation({
      id: 'onAfter',
      url: 'https://assets8.lottiefiles.com/packages/lf20_zwath9pn.json',
    })
    .addAnimation({
      id: 'well_done',
      url: 'https://assets9.lottiefiles.com/packages/lf20_pKiaUR.json',
    })
    .addAnimation({
      id: 'confetti',
      url: 'https://assets6.lottiefiles.com/packages/lf20_opn6z1qt.json',
    })
    .addStateMachine({
      descriptor: {
        id: 'onAfter',
        initial: 'wait',
      },
      states: {
        wait: {
          animationId: 'onAfter',
          playbackSettings: {
            autoplay: true,
            loop: true,
            intermission: 500,
          },
          onAfter: {
            ms: 3000,
            state: 'after3000',
          },
        },
        after3000: {
          animationId: 'well_done',
          playbackSettings: {
            autoplay: true,
            loop: true,
            speed: 1.5,
            direction: -1,
          },
          onAfter: {
            ms: 5000,
            state: 'after5000',
          },
        },
        after5000: {
          animationId: 'confetti',
          playbackSettings: {
            autoplay: true,
            speed: 2,
            direction: 1,
          },
          onComplete: {
            state: 'wait',
          },
          onClick: {
            state: 'wait',
          },
        },
      },
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      const filename = 'onAfter.lottie';

      console.log('> Writing to file: onAfter.lottie');
      fs.writeFileSync(filename, Buffer.from(value));
    });

  const onComplete = new DotLottie();

  await onComplete
    .addAnimation({
      id: 'well_done',
      url: 'https://assets9.lottiefiles.com/packages/lf20_pKiaUR.json',
    })
    .addAnimation({
      id: 'confetti',
      url: 'https://assets6.lottiefiles.com/packages/lf20_opn6z1qt.json',
    })
    .addStateMachine({
      descriptor: {
        id: 'onComplete',
        initial: 'startState',
      },
      states: {
        startState: {
          animationId: 'well_done',
          playbackSettings: {
            autoplay: true,
            speed: 0.5,
            direction: 1,
          },
          onComplete: {
            state: 'afterOnComplete',
          },
        },
        afterOnComplete: {
          animationId: 'confetti',
          playbackSettings: {
            autoplay: true,
          },
          onComplete: {
            state: 'startState',
          },
        },
      },
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      const filename = 'onComplete.lottie';

      console.log('> Writing to file: ' + filename);
      fs.writeFileSync(filename, Buffer.from(value));
    });

  const inheritAttributes = new DotLottie();

  await inheritAttributes
    .addAnimation({
      id: 'car',
      url: 'https://lottie.host/82f9aac1-c166-4124-9143-002bf32e235f/p1fb9yQ3lu.json',
    })
    .addStateMachine({
      descriptor: {
        id: 'start',
        initial: 'firstGear',
      },
      states: {
        firstGear: {
          playbackSettings: {
            autoplay: true,
            loop: true,
            speed: 0.5,
          },
          onClick: {
            state: 'secondGear',
          },
        },
        secondGear: {
          playbackSettings: {
            autoplay: true,
            loop: true,
            speed: 1,
          },
          onClick: {
            state: 'thirdGear',
          },
        },
        thirdGear: {
          playbackSettings: {
            autoplay: true,
            loop: true,
            speed: 2,
          },
          onClick: {
            state: 'fourthGear',
          },
        },
        fourthGear: {
          playbackSettings: {
            autoplay: true,
            loop: true,
            speed: 4,
          },
          onClick: {
            state: 'firstGear',
          },
        },
      },
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      const filename = 'car.lottie';

      console.log('> Writing to file: ' + filename);
      fs.writeFileSync(filename, Buffer.from(value));
    });

  const lighthouseOnScroll = new DotLottie();

  await lighthouseOnScroll
    .addAnimation({
      id: 'lighthouse',
      url: 'https://lottie.host/3bc6c6e9-36f0-4e1b-9a22-beb871207737/5pVAM4rz72.json',
    })
    .addAnimation({
      id: 'timeline',
      url: 'https://lottie.host/fd2ec8b2-d8c3-4750-995f-ed07e2719eb2/h4dpZu5Vm0.json',
    })
    .addStateMachine({
      descriptor: {
        id: 'onScrollZero',
        initial: 'onScrollState',
      },
      states: {
        onScrollState: {
          animationId: 'lighthouse',
          playbackSettings: {
            playOnScroll: [0, 1.0],
          },
        },
      },
    })
    .addStateMachine({
      descriptor: {
        id: 'onScrollOne',
        initial: 'onScrollState',
      },
      states: {
        onScrollState: {
          animationId: 'lighthouse',
          playbackSettings: {
            playOnScroll: [0.5, 1],
          },
        },
      },
    })
    .addStateMachine({
      descriptor: {
        id: 'onScrollTwo',
        initial: 'onScrollState',
      },
      states: {
        onScrollState: {
          animationId: 'lighthouse',
          playbackSettings: {
            playOnScroll: [0, 1],
            segments: [0, 100],
          },
        },
      },
    })
    .addStateMachine({
      descriptor: {
        id: 'onScrollThree',
        initial: 'onScrollState',
      },
      states: {
        onScrollState: {
          animationId: 'lighthouse',
          playbackSettings: {
            playOnScroll: [0, 1],
            segments: [0, 100],
            speed: 3,
            autoplay: true,
            loop: true,
            direction: -1,
          },
        },
      },
    })
    .addStateMachine({
      descriptor: {
        id: 'onShowZero',
        initial: 'initialState',
      },
      states: {
        initialState: {
          animationId: 'lighthouse',
          playbackSettings: {
            autoplay: false,
            loop: false,
          },
          onShow: {
            state: 'playState',
          },
        },
        playState: {
          playbackSettings: {
            autoplay: true,
            loop: true,
            speed: 4,
          },
          onComplete: {
            state: 'initialState',
          },
        },
      },
    })
    .addStateMachine({
      descriptor: {
        id: 'onShowOne',
        initial: 'initialState',
      },
      states: {
        initialState: {
          animationId: 'timeline',
          playbackSettings: {
            autoplay: false,
            loop: false,
          },
          onShow: {
            state: 'playState',
            threshold: [0.9, 1],
          },
        },
        playState: {
          playbackSettings: {
            autoplay: true,
            loop: true,
            speed: 2,
          },
          onComplete: {
            state: 'initialState',
          },
        },
      },
    })
    .addStateMachine({
      descriptor: {
        id: 'onShowTwo',
        initial: 'initialState',
      },
      states: {
        initialState: {
          animationId: 'timeline',
          playbackSettings: {
            autoplay: false,
            loop: false,
          },
          onShow: {
            state: 'playState',
          },
        },
        playState: {
          playbackSettings: {
            autoplay: true,
            loop: false,
            speed: 2,
          },
          onComplete: {
            state: 'lightHouseState',
          },
        },
        lightHouseState: {
          animationId: 'lighthouse',
          playbackSettings: {
            playOnScroll: [0, 1],
          },
          onComplete: {
            state: 'initialState',
          },
          onClick: {
            state: 'initialState',
          },
        },
      },
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      const filename = 'lighthouseOnScroll.lottie';

      console.log('> Writing to file: ' + filename);
      fs.writeFileSync(filename, Buffer.from(value));
    });
  // const errorDotLottie = await new DotLottie().fromURL(
  //   'https://lottie.host/d76e204a-35eb-4258-ab86-1473a6966765/WUvJ2K6yO0.lottie',
  // );

  // const animation = await errorDotLottie.getAnimation(errorDotLottie.manifest.animations[0].id);

  // console.log(">> Writing errorDotLottie.json")
  // fs.writeFileSync(
  //   'errorDotLottie.json',
  //   JSON.stringify(
  //     await animation.toJSON({
  //       inlineAssets: true,
  //     }),
  //   ),
  // );
}

createDotLottie();
createSingles();
