import { DotLottieStateMachine } from "../../../../v2/common/schemas/state-machine"

export const PigeonState: {
  id: string;
  data: DotLottieStateMachine;
} = {
  id: "explodingPigeon",
  data: {
    descriptor: {
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
  }
}


export const PigeonWithoutExplosion: {
  id: string;
  data: DotLottieStateMachine;
} = {
  id: "pigeonWithoutExplosion",
  data: {
    descriptor: {
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
  }
}

export const SmileyWifi: {
  id: string;
  data: DotLottieStateMachine;
} = {
  id: 'simple_click_to_next_prev',
  data: {
    descriptor: {
    initial: "smiley",
  },
  states: [
    {
      name: "smiley",
      type: "PlaybackState",
      animationId: 'smiley',
      autoplay: true,
      loop: true,
      mode: "Reverse",
      speed: 2,
      transitions: [
        {
          type: "Transition",
          toState: "wifi",
          guards: [
            {
              type: "Event",
              triggerName: "click"
            }
          ]
        }
      ]
    },
    {
      name: "wifi",
      type: "PlaybackState",
      animationId: 'wifi',
      autoplay: true,
      loop: true,
      mode: "Forward",
    },
  ],
  listeners: [],
  triggers: [{
    type: "Event",
    name: "click"
    }]
  },
};