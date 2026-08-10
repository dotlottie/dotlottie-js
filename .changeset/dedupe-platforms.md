---
'@dotlottie/dotlottie-js': minor
---

deduplicate browser/node implementations and remove dotLottie v1 audio

Removed: `LottieAudioV1`, `LottieAudioCommonV1`, `AudioOptionsV1`, `DotLottieV1.getAudio()`, `LottieAnimationV1.audioAssets`. v1 files with an off-spec `audio/` folder lose that audio on read.

Also fixes six browser/node behaviour differences, including non-ASCII text corruption in the browser. `addAnimation({ url })` now throws the HTTP status on a failed fetch instead of a JSON parse error.
