# [3.2.0](https://github.com/megaarmos/vue-spring-bottom-sheet/compare/v3.1.0...v3.2.0) (2026-03-23)


### Features

* add forceMount prop ([712e7f9](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/712e7f9245f5ecad92a7a86a962c664a9aeac988))
* enhance drag gesture handling ([9fd74bd](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/9fd74bdfd4c29a4cd9f5d23af42e17e0fbbba6d5))

# [3.1.0](https://github.com/megaarmos/vue-spring-bottom-sheet/compare/v3.0.0...v3.1.0) (2026-03-08)


### Bug Fixes

* broken backdrop transition ([ed4fda5](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/ed4fda5fa15edf26d536eb489056ea133fb5ac15))
* broken dragging when reaches last snap point ([db6461f](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/db6461f77caf7140f0d8beada44aee7ad92f97b8))
* enhance drag gesture handling in BottomSheet component ([8086f6d](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/8086f6dff1ef00dca1d007d82f61b93dbc460af9))
* extract drag logic into composable ([055bd63](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/055bd6361ce311c32b028f9ca7bb8fdcfb30f16a))


### Features

* drag inconsistencies and add keyboard avoidance ([3056eab](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/3056eab17a480a555e3653e1f26a69ccca6785ac))

# [3.0.0](https://github.com/megaarmos/vue-spring-bottom-sheet/compare/v2.5.0...v3.0.0) (2026-02-06)


* Next ([#38](https://github.com/megaarmos/vue-spring-bottom-sheet/issues/38)) ([34270e8](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/34270e88d8b49ddef80b2c57b729828a1113af19))


### BREAKING CHANGES

* removed motion-v dependency

* chore(release): 3.0.0-next.1 [skip ci]

# [3.0.0-next.1](https://github.com/megaarmos/vue-spring-bottom-sheet/compare/v2.6.0-next.1...v3.0.0-next.1) (2026-01-13)

### Bug Fixes

* ensure bottom sheet swipe-based snapping and closing only trigger when actually dragging the sheet, not scrolling content ([9c9fae9](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/9c9fae986d59f3c2763660dade71fd0dd899d058))

### BREAKING CHANGES

* removed motion-v dependency

* fix: https://github.com/megaarmos/vue-spring-bottom-sheet/issues/31

* chore(release): 3.0.0-next.2 [skip ci]

# [3.0.0-next.2](https://github.com/megaarmos/vue-spring-bottom-sheet/compare/v3.0.0-next.1...v3.0.0-next.2) (2026-01-14)

### Bug Fixes

* https://github.com/megaarmos/vue-spring-bottom-sheet/issues/31 ([f8cc5c1](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/f8cc5c1f0d222ab9dca108133a44c2192178c040))

* feat: update dependencies
fix: typescript errors

* chore(release): 3.0.0-next.3 [skip ci]

# [3.0.0-next.3](https://github.com/megaarmos/vue-spring-bottom-sheet/compare/v3.0.0-next.2...v3.0.0-next.3) (2026-01-14)

### Features

* update dependencies ([a6b9a40](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/a6b9a4038bd6ab186139f3dd5892d0b8b439596a))

* fix: context menu disrupting mouse dragging

* refactor: enhance bottom sheet functionality with drag gestures and focus management

- Updated `BottomSheet.vue` to utilize new composables for better code organization and maintainability.

* chore(release): 3.0.0-next.4 [skip ci]

# [3.0.0-next.4](https://github.com/megaarmos/vue-spring-bottom-sheet/compare/v3.0.0-next.3...v3.0.0-next.4) (2026-01-14)

### Bug Fixes

* context menu disrupting mouse dragging ([afaeeed](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/afaeeeda65b1d60adf9ec0ec829d5459e4e4fee1))

* docs(README): updated docs
chore: updated release config and package json

* chore(release): 3.0.0-next.5 [skip ci]

# [3.0.0-next.5](https://github.com/megaarmos/vue-spring-bottom-sheet/compare/v3.0.0-next.4...v3.0.0-next.5) (2026-01-22)

* chore: update build and start scripts in package.json

* chore: migrate to monorepo and update playground packages

* fix: showSheet model does not trigger watch https://github.com/megaarmos/vue-spring-bottom-sheet/issues/37

* chore: update semantic-release configuration for monorepo support and add workspace release settings

* ci: remove unused plugins array from workspace release configuration

* chore: add .npmrc configuration to disable workspaces update

* chore(release): 3.0.0-next.6 [skip ci]

# [3.0.0-next.6](https://github.com/megaarmos/vue-spring-bottom-sheet/compare/v3.0.0-next.5...v3.0.0-next.6) (2026-02-06)

### Bug Fixes

* showSheet model does not trigger watch https://github.com/megaarmos/vue-spring-bottom-sheet/issues/37 ([a72c5ff](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/a72c5ff04ac22595be0a767414e5c91dfa8865d3))

# [3.0.0-next.6](https://github.com/megaarmos/vue-spring-bottom-sheet/compare/v3.0.0-next.5...v3.0.0-next.6) (2026-02-06)


### Bug Fixes

* showSheet model does not trigger watch https://github.com/megaarmos/vue-spring-bottom-sheet/issues/37 ([a72c5ff](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/a72c5ff04ac22595be0a767414e5c91dfa8865d3))

# [3.0.0-next.5](https://github.com/megaarmos/vue-spring-bottom-sheet/compare/v3.0.0-next.4...v3.0.0-next.5) (2026-01-22)

# [3.0.0-next.4](https://github.com/megaarmos/vue-spring-bottom-sheet/compare/v3.0.0-next.3...v3.0.0-next.4) (2026-01-14)


### Bug Fixes

* context menu disrupting mouse dragging ([afaeeed](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/afaeeeda65b1d60adf9ec0ec829d5459e4e4fee1))

# [3.0.0-next.3](https://github.com/megaarmos/vue-spring-bottom-sheet/compare/v3.0.0-next.2...v3.0.0-next.3) (2026-01-14)


### Features

* update dependencies ([a6b9a40](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/a6b9a4038bd6ab186139f3dd5892d0b8b439596a))

# [3.0.0-next.2](https://github.com/megaarmos/vue-spring-bottom-sheet/compare/v3.0.0-next.1...v3.0.0-next.2) (2026-01-14)


### Bug Fixes

* https://github.com/megaarmos/vue-spring-bottom-sheet/issues/31 ([f8cc5c1](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/f8cc5c1f0d222ab9dca108133a44c2192178c040))

# [3.0.0-next.1](https://github.com/megaarmos/vue-spring-bottom-sheet/compare/v2.6.0-next.1...v3.0.0-next.1) (2026-01-13)


### Bug Fixes

* ensure bottom sheet swipe-based snapping and closing only trigger when actually dragging the sheet, not scrolling content ([9c9fae9](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/9c9fae986d59f3c2763660dade71fd0dd899d058))


### BREAKING CHANGES

* removed motion-v dependency

# [2.6.0-next.1](https://github.com/megaarmos/vue-spring-bottom-sheet/compare/v2.5.0...v2.6.0-next.1) (2026-01-13)


### Bug Fixes

* improve initial content pan handling with total delta and threshold to prevent 0 delta issues on touch devices ([8458496](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/8458496a0a2e08bd8f9a0fddc7fe8f763a5b9297))


### Features

* separate BottomSheet backdrop and sheet teleportation, removing the container div ([4e2e354](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/4e2e354f536831c0751971184e06e1dd1068347e))
* swipe support https://github.com/megaarmos/vue-spring-bottom-sheet/issues/27 ([e8641cc](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/e8641cc68dc0542ee415cbdd339504e2f21060ce))

# [2.5.0](https://github.com/megaarmos/vue-spring-bottom-sheet/compare/v2.4.3...v2.5.0) (2025-09-07)


### Features

* swipe close threshold ([#35](https://github.com/megaarmos/vue-spring-bottom-sheet/issues/35)) ([3d553b5](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/3d553b5e1c1779a326a1730b3ab26b864ca07b5b))

## [2.4.3](https://github.com/megaarmos/vue-spring-bottom-sheet/compare/v2.4.2...v2.4.3) (2025-08-15)


### Bug Fixes

* https://github.com/megaarmos/vue-spring-bottom-sheet/issues/34 ([ece642f](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/ece642f6a25b0c80678c9e41d442a030b3f300eb))

## [2.4.2](https://github.com/megaarmos/vue-spring-bottom-sheet/compare/v2.4.1...v2.4.2) (2025-07-24)


### Bug Fixes

* https://github.com/megaarmos/vue-spring-bottom-sheet/issues/33; ([d536f18](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/d536f1898d648181d53076789d2bff6293b20597))

## [2.4.1](https://github.com/megaarmos/vue-spring-bottom-sheet/compare/v2.4.0...v2.4.1) (2025-07-10)


### Bug Fixes

* compatiblity with motion-v 1.5.0 ([22358ff](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/22358ff15ac5c77d71b2aa0e1663c7fc56cd076b))
* remove initial y state to fix the first instance not working ([8445925](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/8445925fb1f4e711eea51decb24920a6bc5d8d74))

# [2.4.0](https://github.com/megaarmos/vue-spring-bottom-sheet/compare/v2.3.0...v2.4.0) (2025-06-09)


### Features

* new events; ([cf8490c](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/cf8490c814422cf5d5961f5f9d3986a52ee535df))

# [2.3.0](https://github.com/megaarmos/vue-spring-bottom-sheet/compare/v2.2.2...v2.3.0) (2025-05-19)


### Features

* add customizable header, content, and footer classes https://github.com/megaarmos/vue-spring-bottom-sheet/issues/20 ([fbb7b30](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/fbb7b301774803e51edfdce45a09cba3789bcea2))

## [2.2.2](https://github.com/megaarmos/vue-spring-bottom-sheet/compare/v2.2.1...v2.2.2) (2025-05-18)


### Bug Fixes

* https://github.com/megaarmos/vue-spring-bottom-sheet/issues/22 ([4cbbbcf](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/4cbbbcf5bf392b11e4752b14230c265063445ae8))

## [2.2.1](https://github.com/megaarmos/vue-spring-bottom-sheet/compare/v2.2.0...v2.2.1) (2025-05-18)


### Bug Fixes

* update build step to change directory before running prepublishOnly ([08daeae](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/08daeae87171170f9b7cc1bb80cc28b61ffff8b3))
* update npm ci command to remove workspace specification ([95d69d6](https://github.com/megaarmos/vue-spring-bottom-sheet/commit/95d69d6b6d677335493eb109900b611af5780e44))
