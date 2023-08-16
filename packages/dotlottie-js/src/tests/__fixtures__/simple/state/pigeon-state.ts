export const PigeonState = {
  descriptor: {
    id: 'exploding_pigeon',
    initial: 'running',
  },
  states: {
    running: {
      animationId:"pigeon",
      playbackSettings: {
        autoplay: true,
        loop: true,
        direction: 1 as 1,
        segments: 'bird',
      },
      onClick: {
        state: 'exploding',
      },
    },
    exploding: {
      animationId:"pigeon",
      playbackSettings: {
        autoplay: true,
        loop: 3,
        direction: 1 as 1,
        segments: 'explosion',
      },
      onComplete: {
        state: 'feathers',
      },
    },
    feathers: {
      animationId:"pigeon",
      playbackSettings: {
        autoplay: true,
        loop: false,
        direction: 1 as 1,
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
        playbackSettings: {
          autoplay: true,
          loop: true,
          direction: -1 as -1,
          speed: 2,
          defaultTheme: 'bounce-dark',
        },
        onMouseEnter: {
          state: 'wifiState',
        },
      },
      wifiState: {
        animationId: 'wifi',
        playbackSettings: {
          autoplay: true,
          loop: true,
          direction: 1 as 1,
          defaultTheme: 'wifi-dark',
        },
        onMouseLeave: {
          state: 'smileyState',
        },
      },
    },
  }
