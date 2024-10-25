/**
 * Copyright 2023 Design Barn Inc.
 */

import fs from 'fs';

import { DotLottie } from '@dotlottie/dotlottie-js';

async function createDotLottieForTests() {
  const dotLottie = new DotLottie();

  await dotLottie
    .addAnimation({
      id: 'pigeon',
      url: 'https://lottie.host/071a2de9-52ca-4ce4-ba2f-a5befd220bdd/ECzVp4eaMa.json',
    })
    .addStateMachine({
      descriptor: {
        id: 'pigeon_fsm',
        initial: 0,
      },
      states: [
        {
          name: "pigeon",
          animation_id: "pigeon",
          type: "PlaybackState",
          autoplay: true,
          loop: false,
          marker: "bird"
        },
        {
          name: "explosion",
          animation_id: "pigeon",
          type: "PlaybackState",
          autoplay: true,
          speed: 0.8,
          loop: false,
          marker: 'explosion',
        },
        {
          name: "feathers",
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
          name: "pigeon",
          animation_id: "pigeon",
          type: "PlaybackState",
          autoplay: true,
          loop: false,
          marker: "bird"
        },
        {
          name: "feathers",
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
    .addAnimation({
      id: 'pigeon',
      url: 'https://lottie.host/071a2de9-52ca-4ce4-ba2f-a5befd220bdd/ECzVp4eaMa.json',
    })
    .addStateMachine({
      descriptor: {
        id: "explodingPigeon",
        initial: "pigeonRunning"
      },
      states: [
        {
          type: "PlaybackState",
          name: "pigeonRunning",
          animationId: "",
          loop: true,
          autoplay: true,
          segment: "bird",
          transitions: [
            {
              type: "Transition",
              toState: "explosion",
              guards: [
                {
                  type: "Event",
                  triggerName: "explode"
                }
              ]
            }
          ]
        },
        {
          type: "PlaybackState",
          name: "explosion",
          animationId: "",
          loop: false,
          autoplay: true,
          segment: "explosion",
          transitions: [
            {
              type: "Transition",
              toState: "feathersFalling",
              guards: [
                {
                  type: "Event",
                  triggerName: "rainFeathers"
                }
              ]
            }
          ]
        },
        {
          type: "PlaybackState",
          name: "feathersFalling",
          animationId: "",
          loop: false,
          autoplay: true,
          segment: "feathers",
          transitions: [
            {
              type: "Transition",
              toState: "pigeonRunning",
              guards: [
                {
                  type: "Event",
                  triggerName: "restart"
                }
              ]
            }
          ]
        }
      ],
      listeners: [
        {
          type: "PointerDown",
          actions: [
            {
              type: "Fire",
              triggerName: "explode"
            }
          ]
        },
        {
          type: "OnComplete",
          stateName: "explosion",
          actions: [
            {
              type: "Fire",
              triggerName: "rainFeathers"
            }
          ]
        },
        {
          type: "PointerDown",
          actions: [
            {
              type: "Fire",
              triggerName: "restart"
            }
          ]
        }
      ],
      triggers: [
        {
          type: "Event",
          name: "explode"
        },
        {
          type: "Event",
          name: "rainFeathers"
        },
        {
          type: "Event",
          name: "restart"
        }
      ]
    })
    .addStateMachine({
      descriptor: {
        id: "pigeonWithoutExplosion",
        initial: "pigeonRunning"
      },
      states: [
        {
          type: "PlaybackState",
          name: "pigeonRunning",
          animationId: "",
          loop: true,
          autoplay: true,
          segment: "bird",
          transitions: [
            {
              type: "Transition",
              toState: "feathersFalling",
              guards: [
                {
                  type: "Event",
                  triggerName: "explode"
                }
              ]
            }
          ]
        },
        {
          type: "PlaybackState",
          name: "feathersFalling",
          animationId: "",
          loop: false,
          autoplay: true,
          segment: "feathers",
          transitions: [
            {
              type: "Transition",
              toState: "pigeonRunning",
              guards: [
                {
                  type: "Event",
                  triggerName: "restart"
                }
              ]
            }
          ]
        }
      ],
      listeners: [
        {
          type: "PointerDown",
          actions: [
            {
              type: "Fire",
              triggerName: "explode"
            }
          ]
        },
        {
          type: "PointerDown",
          actions: [
            {
              type: "Fire",
              triggerName: "restart"
            }
          ]
        }
      ],
      triggers: [
        {
          type: "Event",
          name: "explode"
        },
        {
          type: "Event",
          name: "rainFeathers"
        },
        {
          type: "Event",
          name: "restart"
        }
      ]
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      fs.writeFileSync('exploding_pigeon.lottie', Buffer.from(value));
    });
}

async function createListenersAnimation() {
  const dotLottie = new DotLottie();

  await dotLottie
    .addAnimation({
      id: 'pigeon',
      url: 'https://lottie.host/071a2de9-52ca-4ce4-ba2f-a5befd220bdd/ECzVp4eaMa.json',
    })
    .addStateMachine({
      descriptor: {
        id: 'pigeon_fsm',
        initial: 0,
      },
      states: [
        {
          name: "pigeon",
          type: "PlaybackState",
          mode: "Forward",
          speed: 1,
          use_frame_interpolation: true,
          autoplay: true,
          loop: true,
          marker: "bird"
        },
        {
          name: "explosion",
          type: "PlaybackState",
          mode: "Forward",
          autoplay: true,
          speed: 0.5,
          loop: false,
          marker: 'explosion',
        },
        {
          name: "feathers",
          type: "PlaybackState",
          autoplay: true,
          speed: 1,
          loop: false,
          marker: 'feathers',
        }
      ],
      transitions: [
        {
          type: "Transition",
          from_state: 0,
          to_state: 1,
          on_pointer_down_event: {},
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
      listeners: [
        {
          type: "PointerUp",
          target: "button_0",
          action: "set",
          value: 1,
          context_key: "counter_0"
        },
        {
          type: "PointerDown"
        },
        {
          type: "PointerEnter"
        },
        {
          type: "PointerExit"
        },
        {
          type: "PointerMove"
        },
      ],
      context_variables: [
        {
          type: "Numeric",
          key: "counter",
          value: "0"
        }
      ]
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      fs.writeFileSync('pigeon_with_listeners.lottie', Buffer.from(value));
    });
}

async function createDotLottie() {
  const dotLottie = new DotLottie();

  await dotLottie
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

async function create_pigeon_fsm_eq_guard() {
  const dotLottie = new DotLottie();

  await dotLottie
    .addAnimation({
      id: 'pigeon',
      url: 'https://lottie.host/071a2de9-52ca-4ce4-ba2f-a5befd220bdd/ECzVp4eaMa.json',
    })
    .addStateMachine({
      descriptor: {
        id: "fsm_eq_guard",
        initial: 0
      },
      states: [
        {
          name: "pigeon",
          type: "PlaybackState",
          loop: true,
          autoplay: true,
          marker: "bird",
          use_frame_interpolation: true,
        },
        {
          name: "explosion",
          type: "PlaybackState",
          loop: false,
          autoplay: true,
          speed: 0.5,
          marker: "explosion",
          use_frame_interpolation: true,
        },
        {
          name: "feather",
          type: "PlaybackState",
          loop: false,
          autoplay: true,
          marker: "feather",
          use_frame_interpolation: true,
        }
      ],
      transitions: [
        {
          type: "Transition",
          from_state: 0,
          to_state: 1,
          string_event: {
            value: "explosion"
          },
          guards: [
            {
              type: "Numeric",
              context_key: "counter_0",
              condition_type: "Equal",
              compare_to: 5.0
            }
          ]
        },
        {
          type: "Transition",
          from_state: 1,
          to_state: 2,
          string_event: {
            value: "complete"
          },
          guards: [
            {
              type: "String",
              context_key: "counter_1",
              condition_type: "Equal",
              compare_to: "to_be_the_same"
            }
          ]
        },
        {
          type: "Transition",
          from_state: 2,
          to_state: 0,
          string_event: {
            value: "done"
          },
          guards: [
            {
              type: "Boolean",
              context_key: "counter_2",
              condition_type: "Equal",
              compare_to: true
            }
          ]
        }
      ],
      listeners: [
        {
          type: "PointerDown"
        }
      ],
      context_variables: [
        {
          type: "Numeric",
          key: "counter_0",
          value: 1
        },
        {
          type: "String",
          key: "counter_1",
          value: "init"
        },
        {
          type: "Boolean",
          key: "counter_2",
          value: false
        }
      ]
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      fs.writeFileSync('pigeon_fsm_eq_guard.lottie', Buffer.from(value));
    });
}

async function create_pigeon_gt_gte_guard() {
  const dotLottie = new DotLottie();

  await dotLottie
    .addAnimation({
      id: 'pigeon',
      url: 'https://lottie.host/071a2de9-52ca-4ce4-ba2f-a5befd220bdd/ECzVp4eaMa.json',
    })
    .addStateMachine({
      descriptor: {
        id: "gt_gte_guard",
        initial: 0
      },
      states: [
        {
          name: "pigeon",
          type: "PlaybackState",
          loop: true,
          autoplay: true,
          marker: "bird",
          use_frame_interpolation: true,
        },
        {
          name: "explosion",
          type: "PlaybackState",
          loop: false,
          autoplay: true,
          speed: 0.5,
          marker: "explosion",
          use_frame_interpolation: true,
        },
        {
          name: "feather",
          type: "PlaybackState",
          loop: false,
          autoplay: true,
          marker: "feather",
          use_frame_interpolation: true,
        }
      ],
      transitions: [
        {
          type: "Transition",
          from_state: 0,
          to_state: 1,
          string_event: {
            value: "explosion"
          },
          guards: [
            {
              type: "Numeric",
              context_key: "counter_0",
              condition_type: "GreaterThan",
              compare_to: 5.0
            }
          ]
        },
        {
          type: "Transition",
          from_state: 1,
          to_state: 2,
          string_event: {
            value: "complete"
          },
          guards: [
            {
              type: "String",
              context_key: "counter_0",
              condition_type: "GreaterThanOrEqual",
              compare_to: 60.0
            }
          ]
        },
        {
          type: "Transition",
          from_state: 2,
          to_state: 0,
          string_event: {
            value: "done"
          },
          guards: [
            {
              type: "Numeric",
              context_key: "counter_0",
              condition_type: "GreaterThanOrEqual",
              compare_to: 65.0
            }
          ]
        }
      ],
      listeners: [
        {
          type: "PointerDown"
        }
      ],
      context_variables: [
        {
          type: "Numeric",
          key: "counter_0",
          value: 1
        },
        {
          type: "String",
          key: "STRING_GUARD",
          value: "SUPER_SECRET_VALUE"
        },
        {
          type: "Boolean",
          key: "counter_2",
          value: false
        }
      ]
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      fs.writeFileSync('pigeon_fsm_gt_gte_guard.lottie', Buffer.from(value));
    });
}

async function create_pigeon_lt_lte_guard() {
  const dotLottie = new DotLottie();

  await dotLottie
    .addAnimation({
      id: 'pigeon',
      url: 'https://lottie.host/071a2de9-52ca-4ce4-ba2f-a5befd220bdd/ECzVp4eaMa.json',
    })
    .addStateMachine({
      descriptor: {
        id: "lt_lte_guard",
        initial: 0
      },
      states: [
        {
          name: "pigeon",
          type: "PlaybackState",
          loop: true,
          autoplay: true,
          mode: "Forward",
          marker: "bird",
          use_frame_interpolation: true,
        },
        {
          name: "explosion",
          type: "PlaybackState",
          loop: false,
          autoplay: true,
          speed: 0.5,
          marker: "explosion",
          use_frame_interpolation: true,
        },
        {
          name: "feather",
          type: "PlaybackState",
          loop: false,
          autoplay: true,
          marker: "feather",
          use_frame_interpolation: true,
        }
      ],
      transitions: [
        {
          type: "Transition",
          from_state: 0,
          to_state: 1,
          string_event: {
            value: "explosion"
          },
          guards: [
            {
              type: "Numeric",
              context_key: "counter_0",
              condition_type: "LessThan",
              compare_to: 5.0
            }
          ]
        },
        {
          type: "Transition",
          from_state: 1,
          to_state: 2,
          string_event: {
            value: "complete"
          },
          guards: [
            {
              type: "String",
              context_key: "counter_0",
              condition_type: "LessThanOrEqual",
              compare_to: 10.0
            }
          ]
        },
        {
          type: "Transition",
          from_state: 2,
          to_state: 0,
          string_event: {
            value: "done"
          },
          guards: [
            {
              type: "Numeric",
              context_key: "counter_0",
              condition_type: "LessThanOrEqual",
              compare_to: 15.0
            }
          ]
        }
      ],
      listeners: [
        {
          type: "PointerDown"
        }
      ],
      context_variables: [
        {
          type: "Numeric",
          key: "counter_0",
          value: 1
        },
        {
          type: "String",
          key: "STRING_GUARD",
          value: "SUPER_SECRET_VALUE"
        },
        {
          type: "Boolean",
          key: "counter_2",
          value: false
        }
      ]
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      fs.writeFileSync('pigeon_fsm_lt_lte_guard.lottie', Buffer.from(value));
    });
}

async function create_pigeon_ne_guard() {
  const dotLottie = new DotLottie();

  await dotLottie
    .addAnimation({
      id: 'pigeon',
      url: 'https://lottie.host/071a2de9-52ca-4ce4-ba2f-a5befd220bdd/ECzVp4eaMa.json',
    })
    .addStateMachine({
      descriptor: {
        id: "ne_guard",
        initial: 0
      },
      states: [
        {
          name: "pigeon",
          type: "PlaybackState",
          loop: true,
          autoplay: true,
          marker: "bird",
          use_frame_interpolation: true,
        },
        {
          name: "explosion",
          type: "PlaybackState",
          loop: false,
          autoplay: true,
          speed: 0.5,
          marker: "explosion",
          use_frame_interpolation: true,
        },
        {
          name: "feather",
          type: "PlaybackState",
          loop: false,
          autoplay: true,
          marker: "feather",
          use_frame_interpolation: true,
          entry_actions: [],
          exit_actions: []
        }
      ],
      transitions: [
        {
          type: "Transition",
          from_state: 0,
          to_state: 1,
          string_event: {
            value: "explosion"
          },
          guards: [
            {
              type: "Numeric",
              context_key: "counter_0",
              condition_type: "NotEqual",
              compare_to: 5.0
            }
          ]
        },
        {
          type: "Transition",
          from_state: 1,
          to_state: 2,
          string_event: {
            value: "complete"
          },
          guards: [
            {
              type: "String",
              context_key: "counter_1",
              condition_type: "NotEqual",
              compare_to: "to_be_the_same"
            }
          ]
        },
        {
          type: "Transition",
          from_state: 2,
          to_state: 0,
          string_event: {
            value: "done"
          },
          guards: [
            {
              type: "Boolean",
              context_key: "counter_2",
              condition_type: "NotEqual",
              compare_to: true
            }
          ]
        }
      ],
      listeners: [
        {
          type: "PointerDown"
        }
      ],
      context_variables: [
        {
          type: "Numeric",
          key: "counter_0",
          value: 1
        },
        {
          type: "String",
          key: "counter_1",
          value: "init"
        },
        {
          type: "Boolean",
          key: "counter_2",
          value: false
        }
      ]
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      fs.writeFileSync('pigeon_fsm_ne_guard.lottie', Buffer.from(value));
    });
}

async function create_toggle_button() {
  const toggle = new DotLottie();

  await toggle
    .addAnimation({
      id: 'toggle',
      url: 'https://assets8.lottiefiles.com/private_files/lf30_tnblylie.json',
    })
    .addStateMachine({
      // Define the id of the state machine and the initial state
      descriptor: {
        id: 'state_toggle',
        initial: 0,
      },
      states: [
        {
          name: 'wait',
          type: 'PlaybackState',
          autoplay: false,
          loop: false,
          segment: [0, 1],
        },
        {
          name: 'play_forward',
          type: 'PlaybackState',
          autoplay: true,
          loop: false,
          segment: [0, 30],
        },
        {
          name: 'play_reverse',
          type: 'PlaybackState',
          autoplay: true,
          loop: false,
          mode: "Reverse",
          segment: [30, 0],
        },
      ],
      transitions: [
        {
          type: "Transition",
          from_state: 0,
          to_state: 1,
          on_pointer_down_event: {},
        },
        {
          type: "Transition",
          from_state: 1,
          to_state: 2,
          on_pointer_down_event: {},
        },
        {
          type: "Transition",
          from_state: 2,
          to_state: 1,
          on_pointer_down_event: {},
        },
      ],
      listeners: [
        {
          type: 'PointerDown',
        },
      ],
      context_variables: [],
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      fs.writeFileSync('toggle.lottie', Buffer.from(value));
    });
}

async function create_sync_animation() {
  const toggle = new DotLottie();

  await toggle
    .addAnimation({
      id: 'toggle',
      url: 'https://assets5.lottiefiles.com/private_files/lf30_hhvn1H.json',
    })
    .addStateMachine({
      descriptor: {
        id: 'sync_to_scroll',
        initial: 0,
      },
      states: [
        {
          name: 'sync_to_scroll',
          type: 'SyncState',
          frame_context_key: "frame"
        },
      ],
      transitions: [
      ],
      listeners: [
      ],
      context_variables: [{
        type: "Numeric",
        key: "frame",
        value: 0
      }],
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      fs.writeFileSync('sync_to_scroll.lottie', Buffer.from(value));
    });
}

async function create_showcase() {
  const showcase = new DotLottie();

  await showcase.addAnimation({
    id: 'firstAnimation',
    url: 'https://lottie.host/7047918e-2ba5-4bf1-a552-3349f19ef789/Q1yB2lgufS.json',
  }).addAnimation({
    id: 'secondAnimation',
    url: 'https://lottie.host/b658c6c9-77dc-4ecf-8519-43a3dc02a36e/tK4tGqJh2u.json'
  }).addAnimation({
    id: 'thirdAnimation',
    url: 'https://lottie.host/e8c3091c-4f51-49b8-91e3-1086ca3b8d00/JWm1lQEuZW.json'
  }).addStateMachine({
    descriptor: {
      id: 'showcaseMachine',
      initial: 0
    },
    states: [
      {
        name: "first_animation",
        animation_id: "firstAnimation",
        type: "PlaybackState",
        autoplay: true,
        loop: false,
      },
      {
        name: "second_animation",
        animation_id: "secondAnimation",
        type: "PlaybackState",
        autoplay: true,
        loop: false,
      },
      {
        name: "third_animation",
        animation_id: "thirdAnimation",
        type: "PlaybackState",
        autoplay: true,
        loop: false,
      },
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
    context_variables: []
  })

    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      fs.writeFileSync('showcase.lottie', Buffer.from(value));
    });
}

async function debugScenario() {
  const dotLottie = new DotLottie();

  await dotLottie
    .addAnimation({
      id: 'folder',
      url: 'https://lottie.host/32e49c72-af7a-4a79-97e4-fb0d115eae3e/wIqFzTMKsk.json',
    })
    .addStateMachine(
      {
        descriptor: {
          id: 'openCloseFolder',
          initial: 0,
        },
        states: [
          {
            name: "initialState",
            type: "PlaybackState",
            autoplay: true,
            loop: false,
            segment: [1.0, 2.0],
          },
          {
            name: "open",
            type: "PlaybackState",
            autoplay: true,
            loop: false,
            segment: [1.0, 30.0],
          },
          {
            name: "close",
            type: "PlaybackState",
            autoplay: true,
            mode: "Reverse",
            loop: false,
            segment: [1.0, 30.0],
          }
        ],
        transitions: [
          {
            type: 'Transition',
            from_state: 0,
            to_state: 1,
            string_event: {
              value: 'open',
            },
          },
          {
            type: 'Transition',
            from_state: 1,
            to_state: 2,
            string_event: {
              value: 'close',
            },
          },
          {
            type: 'Transition',
            from_state: 2,
            to_state: 0,
            on_complete_event: {},
          },
        ],
        listeners: [],
        context_variables: [],
      }
    )
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      fs.writeFileSync('folder.lottie', Buffer.from(value));
    });
}

// create_showcase();

// debugScenario();

createExplodingPigeon();
// createListenersAnimation();
// create_pigeon_fsm_eq_guard();
// create_pigeon_gt_gte_guard();
// create_pigeon_lt_lte_guard();
// create_pigeon_ne_guard();


/** Sun moon toggle button */
// create_toggle_button();

/** Coffee drinker sync to scroll. Recreate the animation on the Interactivity homepage */
/* lottiefiles.com/interactivity */
// create_sync_animation();

