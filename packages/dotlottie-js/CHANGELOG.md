# @dotlottie/dotlottie-js

## 1.3.1

### Patch Changes

- 65dc3c0: imageId fix in getImages util function
- dfea96e: fix: add VectorRule and VectorKeyframe schemas to theme

## 1.3.0

### Minor Changes

- 4287478: added tweened transitions to state machine schema

## 1.2.0

### Minor Changes

- 3f005f1: renamed triggers and listeners

## 1.1.0

### Minor Changes

- 838f5c2: adds loop complete listener to state machines and openurl target

## 1.0.2

### Patch Changes

- 9088311: fixed wrong boolean trigger schema type

## 1.0.1

### Patch Changes

- abc69b3: fixed up test animation's manifest versioning incoherance

## 1.0.0

### Major Changes

- 55f2a5c: added support for v2 dotLottie files. Added retro-compatibility for v1 dotLotties.

## 0.9.0

### Minor Changes

- 9457abf: feat: init dotLottie v2
- c7749c3: refactor: remove setGenerator method from DotLottieCommonV1 and DotLottieCommon classes

### Patch Changes

- c7749c3: fix: dotLottie v1 <-> v2 conversion
- c7749c3: fix: dotLottie manifest version format
- c7749c3: small changes to state machine format.
- c7749c3: fix: export missing types for dotLottie v1
- c7749c3: fix: update theme schema slotId
- c7749c3: refactor: update v2 manifest schema
- c7749c3: refactor: dotLottie conversion methods
- c7749c3: fix(conversion): 🐛 never build dotLottie instance before conversion
- c7749c3: fix: remove themes & stateMachines from manifest if non available
- f2a1db8: chore: bump lottie-types pkg to v1.2.0
- c7749c3: refactor: add tests && update LottieThemeCommon toString method
- c7749c3: image asset ids
- c7749c3: small fixes
- c7749c3: fix: getAnimations & getImages & getAudios for v2
- c7749c3: fix: add theme data schema
- c7749c3: fix: export missing types

## 0.9.0-beta.14

### Minor Changes

- b2aae20: refactor: remove setGenerator method from DotLottieCommonV1 and DotLottieCommon classes

## 0.9.0-beta.13

### Patch Changes

- c6fa979: refactor: add tests && update LottieThemeCommon toString method

## 0.9.0-beta.12

### Patch Changes

- dc0ce5d: fix: update theme schema slotId

## 0.9.0-beta.11

### Patch Changes

- b167892: refactor: update v2 manifest schema

## 0.9.0-beta.10

### Patch Changes

- 2134d08: fix(conversion): 🐛 never build dotLottie instance before conversion

## 0.9.0-beta.9

### Patch Changes

- 28e6b57: fix: getAnimations & getImages & getAudios for v2

## 0.9.0-beta.8

### Patch Changes

- 926de78: fix: export missing types

## 0.9.0-beta.7

### Patch Changes

- 1611716: fix: add theme data schema

## 0.9.0-beta.6

### Patch Changes

- 74bfed1: fix: dotLottie manifest version format

## 0.9.0-beta.5

### Patch Changes

- df94db0: fix: remove themes & stateMachines from manifest if non available

## 0.9.0-beta.4

### Patch Changes

- 9a32fd4: fix: export missing types for dotLottie v1

## 0.9.0-beta.3

### Patch Changes

- 81014cb: fix: dotLottie v1 <-> v2 conversion

## 0.9.0-beta.2

### Patch Changes

- 9e7fa8b: small fixes

## 0.9.0-beta.1

### Patch Changes

- 5570a8f: refactor: dotLottie conversion methods

## 0.9.0-beta.0

### Minor Changes

- 9457abf: feat: init dotLottie v2

### Patch Changes

- f2a1db8: chore: bump lottie-types pkg to v1.2.0

## 0.8.1

### Patch Changes

- d36acf1: updated syncState schema
- 6df03bc: chore(lottie-types): replace deprecated definitions from LottieFiles to OSS lottie-animation-communiy

## 0.8.0

### Minor Changes

- ba21d35: New dotLottie state machine format

### Patch Changes

- ddb1786: move @lottiefiles/lottie-types from devDependencies to dependencies to resolve import errors during
  typechecking when the package is used from typescript

## 0.7.2

### Patch Changes

- a641781: fix: 🐛 loadFromURL for application/octet-stream Content-Type
- 340d9aa: fix: 🐛 allow empty str author,generator,keywords in manifest

## 0.7.1

### Patch Changes

- 94a9a93: fixes webp detection

## 0.7.0

### Minor Changes

- 63a0769: feat: 🎸 represent themes data as json (lottie slots)

## 0.6.2

### Patch Changes

- 00fe1b3: chore: 🤖 upgrade dependencies

## 0.6.1

### Patch Changes

- 1e74b26: removed url fetching for images

## 0.6.0

### Minor Changes

- fcbe995: adds audio asset support

### Patch Changes

- 84d03bf: chore: 🤖 upgrade packages

## 0.5.2

### Patch Changes

- 9da84dd: changed segment type to tuple

## 0.5.1

### Patch Changes

- 28724bc: refactor: 💡 update state machine related types

## 0.5.0

### Minor Changes

- 51e65ee: adds state machine creation

## 0.4.2

### Patch Changes

- da46709: refactor: 💡 improve manifest schema validation error
- 2fac1b7: fix: 🐛 utils/getAnimation handling of inlined assets

## 0.4.0

### Minor Changes

- 28d0edc: added scroll and play on show types for state
- 95f2acb: added state exporting

### Patch Changes

- 2f8e0a5: added guards to XState type
- d931786: moved actions,context and guards
- b80f29e: renamed node LottieState class
- 90124c8: more exports for state types
- e4269cc: added manifest export
- 6f02bd3: fixed fromArrayBuffer and states
- 50ef8b3: context type
- 07649de: added context and action types
- 8b41442: context type
- 81f058e: added after and enter state
- 231a342: export state common class
- 1bfa6c9: context types
- d216293: added threshold to onShow transition
- 0d9c084: reverted hover to playbackoptions
- 49e7ad1: added dotlottiestatecommon export
- 6a39ffa: refactored state machine definition
- 736b6b1: added actions to XState class
- e2d0a17: removed hover from stateplaybacksettings
- 114419c: reverted changes
- 128dd80: added actions and context to types
- a40a74f: changed context type
- edbb450: removed extra id outside of descriptor

## 0.4.1

### Patch Changes

- 85eb000: fix: 🐛 direction type in ManifestAnimation

## 0.4.0

### Minor Changes

- aec10fc: feat: 🎸 DotLottie utils

## 0.3.2

### Patch Changes

- 97fda37: fix: 🐛 unzipped image to data url

## 0.3.1

### Patch Changes

- 76cbfee: fix: 🐛 export all types

## 0.4.0-beta.23

### Patch Changes

- added threshold to onShow transition

## 0.4.0-beta.22

### Minor Changes

- added scroll and play on show types for state

## 0.4.0-beta.21

### Patch Changes

- reverted changes

## 0.4.0-beta.20

### Patch Changes

- context type

## 0.4.0-beta.19

### Patch Changes

- context type

## 0.4.0-beta.18

### Patch Changes

- context types

## 0.4.0-beta.17

### Patch Changes

- changed context type

## 0.4.0-beta.16

### Patch Changes

- added context and action types

## 0.4.0-beta.15

### Patch Changes

- moved actions,context and guards

## 0.4.0-beta.14

### Patch Changes

- added guards to XState type

## 0.4.0-beta.13

### Patch Changes

- added actions to XState class

## 0.4.0-beta.12

### Patch Changes

- added actions and context to types

## 0.4.0-beta.11

### Patch Changes

- renamed node LottieState class

## 0.4.0-beta.10

### Patch Changes

- refactored state machine definition

## 0.4.0-beta.9

### Patch Changes

- removed extra id outside of descriptor

## 0.4.0-beta.8

### Patch Changes

- reverted hover to playbackoptions

## 0.4.0-beta.7

### Patch Changes

- added after and enter state

## 0.4.0-beta.6

### Patch Changes

- removed hover from stateplaybacksettings

## 0.4.0-beta.5

### Patch Changes

- added manifest export

## 0.4.0-beta.4

### Patch Changes

- export state common class

## 0.4.0-beta.3

### Patch Changes

- more exports for state types

## 0.4.0-beta.2

### Patch Changes

- added dotlottiestatecommon export

## 0.4.0-beta.1

### Patch Changes

- fixed fromArrayBuffer and states

## 0.4.0-beta.0

### Minor Changes

- 6e1b901: added state exporting

## 0.3.0

### Minor Changes

- 86ef0bf: feat: 🎸 control compression level and other zip options

## 0.2.1

### Patch Changes

- 0e3df79: chore: 🤖 export necessary types

## 0.2.0

### Minor Changes

- ee228ac: feat: 🎸 theming

## 0.1.5

### Patch Changes

- bb21a10: added lottie-types

## 0.1.4

### Patch Changes

- 724343a: added duplicate id check on dotlottie node
- cf16497: fixed missing animation settings when using fromURL
- b1e8ed0: added revision
- ac6ba71: added hover and intermission to animation settings

## 0.1.3

### Patch Changes

- 893aaa6: added keywords and repository to package.json

## 0.1.2

### Patch Changes

- 9541d50: fix: 🐛 default generator in manifest
- 4ac5090: added homepage to package.json
- bf7cd66: added token to release action

## 0.1.1

### Patch Changes

- 123a15a: chore: preparing repo for release
