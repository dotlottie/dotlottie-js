---
'@dotlottie/dotlottie-js': patch
---

Fix repeated image serialization for asset IDs containing commas or beginning with `data:`. A second `build()` no longer reads the packaged file name as base64, which threw `InvalidCharacterError` in browsers.

Extract every embedded image even when an image that is not a data URL comes before it.
