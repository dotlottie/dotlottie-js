import { DotLottieStateMachine } from "../../../../common";

export const PigeonWithoutExplosion: DotLottieStateMachine = 
  {
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
  }
