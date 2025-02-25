/**
 * Copyright 2023 Design Barn Inc.
 */

import fs from 'fs';

import { DotLottie } from '@dotlottie/dotlottie-js';

async function createStarRating() {
  const dotLottie = new DotLottie();

  await dotLottie
    .addAnimation({
      id: 'star-rating',
      url: 'https://lottie.host/90e7f6e9-462a-4560-b1d7-4cedf81b5421/bWWD1bAgE4.json',
    })
    .addStateMachine({
      id: "starRating",
      name: "Star Rating ⭐",
      data: {
        initial: "global",
        states: [
          {
            name: "global",
            type: "GlobalState",
            animation: "",
            transitions: [
              {
                type: "Transition",
                toState: "star_1",
                guards: [
                  {
                    type: "Numeric",
                    conditionType: "Equal",
                    inputName: "rating",
                    compareTo: 1
                  }
                ]
              },
              {
                type: "Transition",
                toState: "star_2",
                guards: [
                  {
                    type: "Numeric",
                    conditionType: "Equal",
                    inputName: "rating",
                    compareTo: 2
                  }
                ]
              },
              {
                type: "Transition",
                toState: "star_3",
                guards: [
                  {
                    type: "Numeric",
                    conditionType: "Equal",
                    inputName: "rating",
                    compareTo: 3
                  }
                ]
              },
              {
                type: "Transition",
                toState: "star_4",
                guards: [
                  {
                    type: "Numeric",
                    conditionType: "Equal",
                    inputName: "rating",
                    compareTo: 4
                  }
                ]
              },
              {
                type: "Transition",
                toState: "star_5",
                guards: [
                  {
                    type: "Numeric",
                    conditionType: "Equal",
                    inputName: "rating",
                    compareTo: 5
                  }
                ]
              }
            ]
          },
          {
            type: "PlaybackState",
            name: "star_1",
            animation: "",
            autoplay: true,
            segment: "star_1",
            transitions: []
          },
          {
            type: "PlaybackState",
            name: "star_2",
            animation: "",
            autoplay: true,
            segment: "star_2",
            transitions: []
          },
          {
            type: "PlaybackState",
            name: "star_3",
            animation: "",
            autoplay: true,
            segment: "star_3",
            transitions: []
          },
          {
            type: "PlaybackState",
            name: "star_4",
            animation: "",
            autoplay: true,
            segment: "star_4",
            transitions: []
          },
          {
            type: "PlaybackState",
            name: "star_5",
            animation: "",
            autoplay: true,
            segment: "star_5",
            transitions: []
          }
        ],
        interactions: [
          {
            type: "PointerDown",
            layerName: "star1",
            actions: [
              {
                type: "SetNumeric",
                inputName: "rating",
                value: 1
              }
            ]
          },
          {
            type: "PointerDown",
            layerName: "star2",
            actions: [
              {
                type: "SetNumeric",
                inputName: "rating",
                value: 2
              }
            ]
          },
          {
            type: "PointerDown",
            layerName: "star3",
            actions: [
              {
                type: "SetNumeric",
                inputName: "rating",
                value: 3
              }
            ]
          },
          {
            type: "PointerDown",
            layerName: "star4",
            actions: [
              {
                type: "SetNumeric",
                inputName: "rating",
                value: 4
              }
            ]
          },
          {
            type: "PointerDown",
            layerName: "star5",
            actions: [
              {
                type: "SetNumeric",
                inputName: "rating",
                value: 5
              }
            ]
          }
        ],
        inputs: [
          {
            type: "Numeric",
            name: "rating",
            value: 0
          }
        ]
      }
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      let dotLottie = new DotLottie();
      dotLottie = await dotLottie.fromArrayBuffer(value);

      for (let statemachine of dotLottie.stateMachines) {
        // console.log(statemachine.name);
        // console.log(statemachine.states);
        // console.log(statemachine.interactions);
        // console.log(statemachine.inputs);
        // console.log(statemachine.initial);
      }


      fs.writeFileSync('sm_star_rating.lottie', Buffer.from(value));
    });
}

async function createSyncToCursor() {
  const dotLottie = new DotLottie();

  await dotLottie
    .addAnimation({
      id: 'sync-to-cursor',
      url: 'https://lottie.host/a72900c7-2bb0-49d4-a8ae-58190f96b73d/PFTcmzsGhc.json',
    })
    .addStateMachine({
      id: "syncToCursor",
      name: "Sync to Cursor 🖱️",
      data: {
        initial: "Start",
        states: [
          {
            animation: "scroll",
            type: "PlaybackState",
            name: "Start",
            transitions: [
              {
                type: "Transition",
                toState: "Start",
                guards: [
                  {
                    type: "Event",
                    inputName: "Step"
                  }
                ]
              }
            ],
            entryActions: [
              {
                type: "SetFrame",
                value: "$Progress"
              }
            ]
          }
        ],
        interactions: [{
          type: "PointerDown",
          actions: [
            {
              type: "Increment",
              inputName: "Progress"
            }
          ]
        }],
        inputs: [
          {
            type: "Numeric",
            name: "Progress",
            value: 0
          },
          {
            type: "Event",
            name: "Step"
          }
        ]
      }
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      fs.writeFileSync('sm_sync_to_cursor.lottie', Buffer.from(value));
    });
}

async function createHoverButton() {
  const dotLottie = new DotLottie();

  await dotLottie
    .addAnimation({
      id: 'hoverBtn',
      url: 'https://lottie.host/9be40797-ef92-451f-add9-d6f66a78635a/lqnums50Xh.json',
    })
    .addStateMachine({
      id: "hoverButton",
      name: "Hover Button 🖱️",
      data: {
        initial: "Start",
        states: [
          {
            animation: "",
            type: "GlobalState",
            name: "Start",
            transitions: [
              {
                type: "Transition",
                toState: "Forward",
                guards: [
                  {
                    type: "Event",
                    inputName: "Forward"
                  }
                ]
              },
              {
                type: "Transition",
                toState: "Reverse",
                guards: [
                  {
                    type: "Event",
                    inputName: "Reverse"
                  }
                ]
              }
            ]
          },
          {
            animation: "",
            type: "PlaybackState",
            name: "Forward",
            mode: "Forward",
            autoplay: true,
            transitions: []
          },
          {
            animation: "",
            type: "PlaybackState",
            name: "Reverse",
            mode: "Reverse",
            autoplay: true,
            transitions: []
          }
        ],
        interactions: [
          {
            type: "PointerEnter",
            actions: [
              {
                type: "Fire",
                inputName: "Forward"
              }
            ]
          },
          {
            type: "PointerExit",
            actions: [
              {
                type: "Fire",
                inputName: "Reverse"
              }
            ]
          }
        ],
        inputs: [
          {
            type: "Event",
            name: "Forward"
          },
          {
            type: "Event",
            name: "Reverse"
          }
        ]
      }
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      fs.writeFileSync('sm_hover_button.lottie', Buffer.from(value));
    });
}

async function createToggleButton() {
  const dotLottie = new DotLottie();

  await dotLottie
    .addAnimation({
      id: 'toggleBtn',
      url: 'https://lottie.host/8c2590c3-3aaa-4d47-b6cd-1ef979e284f4/2ykhbXYDAc.json',
    })
    .addStateMachine({
      id: "toggleButton",
      name: "Toggle Button 🔄",
      data: {
        initial: "initial-wait",
        states: [
          {
            name: "initial-wait",
            type: "PlaybackState",
            animation: "",
            transitions: [
              {
                type: "Transition",
                toState: "a",
                guards: [
                  {
                    type: "Boolean",
                    conditionType: "Equal",
                    inputName: "OnOffSwitch",
                    compareTo: true
                  }
                ]
              }
            ]
          },
          {
            name: "a",
            type: "PlaybackState",
            animation: "",
            autoplay: true,
            speed: 2.0,
            transitions: [
              {
                type: "Transition",
                toState: "b",
                guards: [
                  {
                    type: "Boolean",
                    conditionType: "Equal",
                    inputName: "OnOffSwitch",
                    compareTo: false
                  }
                ]
              }
            ]
          },
          {
            name: "b",
            type: "PlaybackState",
            animation: "",
            autoplay: true,
            speed: 2.0,
            mode: "Reverse",
            transitions: [
              {
                type: "Transition",
                toState: "a",
                guards: [
                  {
                    type: "Boolean",
                    conditionType: "Equal",
                    inputName: "OnOffSwitch",
                    compareTo: true
                  }
                ]
              }
            ]
          }
        ],
        interactions: [
          {
            type: "PointerDown",
            actions: [
              {
                type: "Toggle",
                inputName: "OnOffSwitch"
              }
            ]
          }
        ],
        inputs: [
          {
            type: "Boolean",
            name: "OnOffSwitch",
            value: false
          }
        ]
      }
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      fs.writeFileSync('sm_toggle_button.lottie', Buffer.from(value));
    });
}

async function createThemeAction() {
  const dotLottie = new DotLottie();

  dotLottie.fromURL('https://lottie.host/9a5a6605-fc90-4935-8d10-9df4c83902ff/PFUKH53LJk.lottie').then((value) => {
    value.addStateMachine({
      id: "themeAction",
      name: "Theme Action 🎨",
      data: {
        initial: "initial-wait",
        states: [
          {
            name: "initial-wait",
            type: "PlaybackState",
            animation: "",
            transitions: [
              {
                type: "Transition",
                toState: "a",
                guards: [
                  {
                    type: "Boolean",
                    conditionType: "Equal",
                    inputName: "OnOffSwitch",
                    compareTo: true
                  }
                ]
              }
            ],
            entryActions: [
              {
                type: "SetTheme",
                value: "air"
              }
            ]
          },
          {
            name: "a",
            type: "PlaybackState",
            animation: "",
            autoplay: true,
            speed: 2.0,
            transitions: [
              {
                type: "Transition",
                toState: "b",
                guards: [
                  {
                    type: "Boolean",
                    conditionType: "Equal",
                    inputName: "OnOffSwitch",
                    compareTo: false
                  }
                ]
              }
            ],
            entryActions: [
              {
                type: "SetTheme",
                value: "Water"
              }
            ]
          },
          {
            name: "b",
            type: "PlaybackState",
            animation: "",
            autoplay: true,
            speed: 2.0,
            mode: "Reverse",
            transitions: [
              {
                type: "Transition",
                toState: "a",
                guards: [
                  {
                    type: "Boolean",
                    conditionType: "Equal",
                    inputName: "OnOffSwitch",
                    compareTo: true
                  }
                ]
              }
            ],
            entryActions: [
              {
                type: "SetTheme",
                value: "earth"
              }
            ]
          }
        ],
        interactions: [
          {
            type: "PointerDown",
            actions: [
              {
                type: "Toggle",
                inputName: "OnOffSwitch"
              }
            ]
          }
        ],
        inputs: [
          {
            type: "Boolean",
            name: "OnOffSwitch",
            value: false
          }
        ]
      }
    })
      .build()
      .then((value) => {
        return value.toArrayBuffer();
      })
      .then((value) => {
        fs.writeFileSync('sm_theme_action.lottie', Buffer.from(value));
      });
  });
}

async function createExplodingPigeon() {
  const dotLottie = new DotLottie();

  await dotLottie
    .addAnimation({
      id: 'exploding-pigeon',
      url: 'https://lottie.host/899f8fbb-55db-4a51-8a64-96f1bc4e45d7/9BiY1S0tDm.json',
    })
    .addStateMachine({
      "id": "Exploding Pigeon",
      "name": "Pigeon Running",
      "data": {
        "initial": "Pigeon Running",
        "states": [
          {
            "animation": "pigeon",
            "type": "PlaybackState",
            "name": "Pigeon Running",
            "loop": true,
            "autoplay": true,
            "segment": "bird",
            "transitions": [
              {
                "type": "Transition",
                "toState": "Explosion",
                "guards": [
                  {
                    "type": "Event",
                    "inputName": "Explode"
                  }
                ]
              }
            ]
          },
          {
            "animation": "pigeon",
            "type": "PlaybackState",
            "name": "Explosion",
            "loop": false,
            "autoplay": true,
            "segment": "explosion",
            "speed": 0.1,
            "transitions": [
              {
                "type": "Transition",
                "toState": "Feathers falling",
                "guards": [
                  {
                    "type": "Event",
                    "inputName": "Rain feathers"
                  }
                ]
              }
            ]
          },
          {
            "animation": "pigeon",
            "type": "PlaybackState",
            "name": "Feathers falling",
            "loop": false,
            "autoplay": true,
            "segment": "feather",
            "transitions": [
              {
                "type": "Transition",
                "toState": "Pigeon Running",
                "guards": [
                  {
                    "type": "Event",
                    "inputName": "Restart"
                  }
                ]
              }
            ]
          }
        ],
        "inputs": [
          {
            "type": "Event",
            "name": "Explode"
          },
          {
            "type": "Event",
            "name": "Rain feathers"
          },
          {
            "type": "Event",
            "name": "Restart"
          }
        ],
        "interactions": [
          {
            "type": "PointerDown",
            "actions": [
              {
                "type": "Fire",
                "inputName": "Explode"
              }
            ]
          },
          {
            "type": "OnComplete",
            "stateName": "Explosion",
            "actions": [
              {
                "type": "Fire",
                "inputName": "Rain feathers"
              }
            ]
          },
          {
            "type": "OnComplete",
            "stateName": "Feathers falling",
            "actions": [
              {
                "type": "Fire",
                "inputName": "Restart"
              }
            ]
          }
        ]
      }
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      fs.writeFileSync('sm_exploding_pigeon.lottie', Buffer.from(value));
    });
}

async function createHoldButton() {
  const dotLottie = new DotLottie();

  await dotLottie
    .addAnimation({
      id: 'holdBtn',
      url: 'https://lottie.host/9be40797-ef92-451f-add9-d6f66a78635a/lqnums50Xh.json',
    })
    .addStateMachine({
      id: "holdButton",
      name: "Hold Button 🖱️",
      data: {
        initial: "Start",
        states: [
          {
            animation: "",
            type: "GlobalState",
            name: "Start",
            transitions: [
              {
                type: "Transition",
                toState: "Forward",
                guards: [
                  {
                    type: "Event",
                    inputName: "Forward"
                  }
                ]
              },
              {
                type: "Transition",
                toState: "Reverse",
                guards: [
                  {
                    type: "Event",
                    inputName: "Reverse"
                  }
                ]
              }
            ]
          },
          {
            animation: "",
            type: "PlaybackState",
            name: "Forward",
            mode: "Forward",
            autoplay: true,
            transitions: []
          },
          {
            animation: "",
            type: "PlaybackState",
            name: "Reverse",
            mode: "Reverse",
            autoplay: true,
            transitions: []
          }
        ],
        interactions: [
          {
            type: "PointerDown",
            actions: [
              {
                type: "Fire",
                inputName: "Forward"
              }
            ]
          },
          {
            type: "PointerUp",
            actions: [
              {
                type: "Fire",
                inputName: "Reverse"
              }
            ]
          }
        ],
        inputs: [
          {
            type: "Event",
            name: "Forward"
          },
          {
            type: "Event",
            name: "Reverse"
          }
        ]
      }
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      fs.writeFileSync('sm_hold_button.lottie', Buffer.from(value));
    });
}

async function createClickButton() {
  const dotLottie = new DotLottie();

  await dotLottie
    .addAnimation({
      id: 'clickBtn',
      url: 'https://lottie.host/9be40797-ef92-451f-add9-d6f66a78635a/lqnums50Xh.json',
    })
    .addStateMachine({
      id: "clickButton",
      name: "Click Button 🖱️",
      data: {
        initial: "Start",
        states: [
          {
            animation: "",
            type: "GlobalState",
            name: "Start",
            transitions: [
              {
                type: "Transition",
                toState: "Forward",
                guards: [
                  {
                    type: "Event",
                    inputName: "Forward"
                  }
                ]
              }
            ]
          },
          {
            animation: "",
            type: "PlaybackState",
            name: "Forward",
            mode: "Forward",
            autoplay: true,
            transitions: []
          }
        ],
        interactions: [
          {
            type: "PointerDown",
            actions: [
              {
                type: "Fire",
                inputName: "Forward"
              }
            ]
          }
        ],
        inputs: [
          {
            type: "Event",
            name: "Forward"
          }
        ]
      }
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      fs.writeFileSync('sm_click_button.lottie', Buffer.from(value));
    });
}

async function createInteractiveStats() {
  const dotLottie = new DotLottie();

  await dotLottie
    .addAnimation({
      id: 'interactive-stats',
      url: 'https://lottie.host/fba88936-b753-4751-a6ca-94db246157cf/5pGajCeC0B.json',
    })
    .addStateMachine({
      id: "interactiveStats",
      name: "Interactive Statistics 📊",
      data: {
        initial: "Start",
        states: [
          {
            animation: "stats",
            type: "PlaybackState",
            name: "Start",
            transitions: [
              {
                type: "Transition",
                toState: "Start",
                guards: [
                  {
                    type: "Event",
                    inputName: "Step"
                  }
                ]
              }
            ],
            entryActions: [
              {
                type: "SetProgress",
                value: "$Progress"
              }
            ]
          }
        ],
        interactions: [
          {
            type: "PointerDown",
            actions: [
              {
                type: "Increment",
                inputName: "Progress"
              }
            ]
          }
        ],
        inputs: [
          {
            type: "Numeric",
            name: "Progress",
            value: 0
          },
          {
            type: "Event",
            name: "Step"
          }
        ]
      }
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      fs.writeFileSync('sm_interactive_stats.lottie', Buffer.from(value));
    });
}

async function createLoader() {
  const dotLottie = new DotLottie();

  await dotLottie
    .addAnimation({
      id: 'loader',
      url: 'https://lottie.host/8bec049d-6b29-48f2-9592-df21853df42e/5AqIkEhG0r.json',
    })
    .addStateMachine({
      id: "loader",
      name: "Pretty Loader ⌛",
      data: {
        "initial": "pigeonRunning",
        "states": [
          {
            "type": "PlaybackState",
            "name": "pigeonRunning",
            "animation": "",
            "loop": true,
            "autoplay": true,
            "segment": "bird",
            "transitions": [
              {
                "type": "Transition",
                "toState": "explosion",
                "guards": [
                  {
                    "type": "Numeric",
                    "inputName": "loopCount",
                    "conditionType": "GreaterThanOrEqual",
                    "compareTo": 4
                  }
                ]
              }
            ]
          },
          {
            "type": "PlaybackState",
            "name": "explosion",
            "animation": "",
            "final": true,
            "loop": false,
            "autoplay": true,
            "segment": "explosion",
            "transitions": []
          }
        ],
        "inputs": [
          {
            "type": "Event",
            "name": "explode"
          },
          {
            "type": "Event",
            "name": "rainFeathers"
          },
          {
            "type": "Event",
            "name": "restart"
          },
          {
            "type": "Numeric",
            "name": "loopCount",
            "value": 0
          }
        ],
        "interactions": [
          {
            "type": "OnLoopComplete",
            "stateName": "pigeonRunning",
            "actions": [
              {
                "type": "Increment",
                "inputName": "loopCount"
              }
            ]
          }
        ]
      }
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      fs.writeFileSync('sm_loader.lottie', Buffer.from(value));
    });
}

createStarRating();
createSyncToCursor();
createHoverButton();
createToggleButton();
createThemeAction();
createExplodingPigeon();
createHoldButton();
createClickButton();
createInteractiveStats();
createLoader();