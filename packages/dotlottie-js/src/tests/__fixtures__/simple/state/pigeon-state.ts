import { DotLottieStateMachine } from "../../../../common"

export const PigeonState: DotLottieStateMachine = {
  descriptor: {
    id: 'exploding_pigeon',
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
}


export const SmileyWifi: DotLottieStateMachine = {
  descriptor: {
    id: 'simple_click_to_next_prev',
    initial: 0,
  },
  states: [
    {
      name: "smiley",
      type: "PlaybackState",
      animation_id: 'smiley',
      autoplay: true,
      loop: true,
      mode: "Reverse",
      speed: 2,
    },
    {
      name: "wifi",
      type: "PlaybackState",
      animation_id: 'wifi',
      autoplay: true,
      loop: true,
      mode: "Forward",
    },
  ],
  transitions: [
    {
      type: "Transition",
      from_state: 0,
      to_state: 1,
      string_event: { value: 'click' },
    }
  ],
  listeners: [],
  context_variables: []
};
