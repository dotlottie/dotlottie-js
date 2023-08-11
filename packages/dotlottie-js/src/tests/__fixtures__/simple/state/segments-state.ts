export const SegmentsState = {
  descriptor: {
    id: "state_segments",
    initial: "loopState"
  },
  states: {
    loopState: {
      animationId: "segments",
      statePlaybackSettings: {
        autoplay: true,
        loop: true,
        segments: [
          70,
          500
        ]
      }
    }
  }
}
