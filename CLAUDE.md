# CLAUDE.md

## Project Overview

**Vue Spring Bottom Sheet** (`@opekunov/vue-spring-bottom-sheet`) is a Vue 3 bottom sheet component library featuring spring physics animations, iOS-like morphing behavior, drag gestures, snap points, and accessibility support.

- **Repository**: `opekunov/vue-spring-bottom-sheet`
- **License**: MIT
- **Published as**: `@opekunov/vue-spring-bottom-sheet` on npm
- **Requires**: Vue >= 3.3

## Monorepo Structure

This is a **Turbo monorepo** using **Bun 1.3.6** as the package manager.

```
├── packages/
│   └── vue-spring-bottom-sheet/   # Core library (the npm package)
├── apps/
│   ├── examples/                  # Nuxt 4 demo app (deployed to GitHub Pages)
│   └── docs/                      # VitePress documentation site
├── turbo.json                     # Turbo task pipeline
└── package.json                   # Root workspace config
```

### Key Paths

| What | Path |
|---|---|
| Library source | `packages/vue-spring-bottom-sheet/src/` |
| Main component | `packages/vue-spring-bottom-sheet/src/BottomSheet.vue` |
| Types & interfaces | `packages/vue-spring-bottom-sheet/src/types.ts` |
| Composables | `packages/vue-spring-bottom-sheet/src/composables/` |
| Utilities | `packages/vue-spring-bottom-sheet/src/utils/` |
| Vite build config | `packages/vue-spring-bottom-sheet/vite.config.ts` |
| Example app pages | `apps/examples/app/pages/` |
| Docs content | `apps/docs/guide/` |

## Commands

All commands run from the **repository root** unless noted otherwise.

### Essential Commands

```bash
bun install                  # Install all dependencies
bun run build                # Build all packages (turbo)
bun run dev                  # Dev mode for all packages (turbo, persistent)
bun run type-check           # TypeScript checking across all packages
bun run format               # Prettier formatting across all packages
```

### Documentation

```bash
bun run docs:dev             # Start VitePress dev server
bun run docs:build           # Build docs for production
bun run docs:preview         # Preview built docs
```

### Library-specific (run from `packages/vue-spring-bottom-sheet/`)

```bash
bun run build                # vite build (outputs to dist/)
bun run dev                  # vite build --watch
bun run type-check           # vue-tsc --build
bun run format               # prettier --write src/
```

## Architecture

### Library Exports (`src/index.ts`)

- **Default export**: `BottomSheet` component
- **Named exports**: `useSpring`, `useMorphing`, all types from `types.ts`
- **CSS**: Separate import via `@opekunov/vue-spring-bottom-sheet/dist/style.css`

### Composables

| Composable | Purpose |
|---|---|
| `useSpring` | Spring physics animation engine (mass/stiffness/damping) using rAF |
| `useDragGestures` | Unified pointer/touch event handling with velocity tracking |
| `useMorphing` | iOS 26-like morphing between compact/expanded/fullscreen states |
| `useFocusManagement` | Keyboard focus trap via `focus-trap` library |
| `useSnapPoints` | Converts snap point values (numbers/percentages) to pixels |
| `useSwipeDetection` | Swipe direction and velocity detection |
| `useSheetScrollLock` | Body scroll locking when sheet is open |

### Component Events

`opened`, `opening-started`, `closed`, `closing-started`, `dragging-up`, `dragging-down`, `snapped`, `instinctHeight`

### Exposed Methods

`open()`, `close()`, `snapToPoint(index)`

### CSS Custom Properties (for theming)

`--vsbs-backdrop-bg`, `--vsbs-shadow-color`, `--vsbs-background`, `--vsbs-border-radius`, `--vsbs-outer-border-color`, `--vsbs-max-width`, `--vsbs-border-color`, `--vsbs-padding-x`, `--vsbs-handle-background`

## Build & Output

- **Build tool**: Vite in library mode
- **Output format**: ES modules only (`dist/index.mjs`)
- **TypeScript declarations**: Generated via `vite-plugin-dts` (`dist/index.d.ts`)
- **Styles**: Extracted to `dist/style.css`
- **External dependencies** (not bundled): `vue`, `@vueuse/core`, `@vueuse/integrations/useFocusTrap`

## Code Style & Conventions

### Formatting (Prettier)

- No semicolons (`"semi": false`)
- Single quotes (`"singleQuote": true`)
- Print width: 100 (`"printWidth": 100`)
- 2-space indentation
- Unix line endings (LF)

### Linting (ESLint 9 flat config)

- `eslint-plugin-vue` essential rules
- `@vue/eslint-config-typescript`
- Prettier compatibility via skip-formatting
- Ignores: `dist/`, `dist-ssr/`, `coverage/`, `apps/`

### TypeScript

- Strict mode enabled
- `noUnusedLocals` and `noUnusedParameters` enforced
- Vue SFC type checking via `vue-tsc`

### Code Patterns

- Composition API exclusively (no Options API)
- Composables follow `use*` naming convention
- Utility functions are small, single-purpose files in `utils/`
- Props interface defined in `types.ts`, not inline
- Spring physics implemented natively with `requestAnimationFrame` (no heavy animation libraries)
- `remeda` used for functional utilities (clamp, funnel, etc.)
- `@vueuse/core` for reactive utilities

## CI/CD

### Release Pipeline (`release.yml`)

- Triggers on push to `master`, `next`, `alpha`, `beta` branches
- Uses semantic-release for automated versioning and npm publishing
- Tag format: `v${version}`
- Pre-release branches: `next`, `beta`, `alpha`

### GitHub Pages Deploy (`deploy-pages.yml`)

- Triggers on push to `master` and pull requests
- Builds the Nuxt example app and deploys to GitHub Pages
- Sets `NUXT_APP_BASE_URL=/vue-spring-bottom-sheet/`

### Commit Convention

Uses [Conventional Commits](https://www.conventionalcommits.org/) for semantic-release:
- `feat:` — new feature (minor version bump)
- `fix:` — bug fix (patch version bump)
- `docs:` — documentation changes
- `chore:` — maintenance tasks
- `BREAKING CHANGE:` in commit body — major version bump

## Testing

No formal test framework is configured. Validation relies on:
- TypeScript type checking (`vue-tsc`)
- Manual testing via the example app (`apps/examples/`)
- Build verification

## Dependencies (Runtime)

| Package | Purpose |
|---|---|
| `@vueuse/core` | Vue 3 composition utilities |
| `@vueuse/integrations` | Focus trap integration adapter |
| `focus-trap` | Keyboard focus management / accessibility |
| `remeda` | Functional utilities (clamp, etc.) |

## Tips for AI Assistants

- Always run `bun run type-check` after modifying TypeScript/Vue files to catch type errors
- The main component (`BottomSheet.vue`) is large (~667 lines); changes there should be surgical
- When adding new composables, export them from `src/index.ts` if they're part of the public API
- Snap points accept both pixel numbers and percentage strings (e.g., `"50%"`)
- The morphing feature requires at least 2 snap points (ideally 3 for compact/expanded/fullscreen)
- The example app uses Nuxt 4 with Nuxt UI v4; the library itself is framework-agnostic Vue 3
- Docs are in VitePress; update `apps/docs/guide/` when adding/changing public API
