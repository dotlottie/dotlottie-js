export const PigeonState = {
  descriptor: {
    id: 'exploding_pigeon',
    initial: 'running',
  },
  states: {
    running: {
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
}


export const SmileyWifi = {
    descriptor: {
      id: 'simple_click_to_next_prev',
      initial: 'bounceState',
    },
    states: {
      smileyState: {
        animationId: 'smiley',
        statePlaybackSettings: {
          autoplay: true,
          loop: true,
          direction: -1,
          speed: 2,
          defaultTheme: 'bounce-dark',
        },
        onMouseEnter: {
          state: 'wifiState',
        },
      },
      wifiState: {
        animationId: 'wifi',
        statePlaybackSettings: {
          autoplay: true,
          loop: true,
          direction: 1,
          defaultTheme: 'wifi-dark',
        },
        onMouseLeave: {
          state: 'smileyState',
        },
      },
    },
  }
