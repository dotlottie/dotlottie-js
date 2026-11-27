---
'@dotlottie/dotlottie-js': patch
---

`getAnimation` reads a v2 archive's animation from `a/<id>.json` (it only looked in `animations/`, so it returned `undefined`), and `inlineImageAssets` matches an archive image by `asset.p` with or without its extension, under an `asset.u` of `""`, `images/`, `/images/`, `i/` or `/i/` (`getImages` keys the files without the extension, so an image named `img_0.png` was never inlined).
