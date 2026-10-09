---
'@dotlottie/dotlottie-js': patch
---

Fix repeated audio serialization for asset IDs containing commas or beginning with `data:`, and preserve full audio filenames when loading archives with nested asset paths.

Preserve audio source references across repeated multi-animation builds and archive reloads, including authored IDs such as `audio_0` and `audio_1` and audio shared between animations.
