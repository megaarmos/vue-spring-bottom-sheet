<p align="center">
  <h1 align="center">Vue Spring Bottom Sheet</h1>
  <p align="center">Modern, performant bottom sheet component for Vue 3 with spring physics, morphing & gestures</p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@opekunov/vue-spring-bottom-sheet"><img src="https://img.shields.io/npm/v/@opekunov/vue-spring-bottom-sheet.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@opekunov/vue-spring-bottom-sheet"><img src="https://img.shields.io/npm/dm/@opekunov/vue-spring-bottom-sheet.svg" alt="npm downloads"></a>
  <a href="https://github.com/opekunov/vue-spring-bottom-sheet/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/@opekunov/vue-spring-bottom-sheet.svg" alt="license"></a>
</p>

<p align="center">
  <a href="#features">Features</a> &bull;
  <a href="#demo">Demo</a> &bull;
  <a href="#installation">Installation</a> &bull;
  <a href="#usage">Usage</a> &bull;
  <a href="#api">API</a> &bull;
  <a href="#styling">Styling</a>
</p>

> Based on [megaarmos/vue-spring-bottom-sheet](https://github.com/megaarmos/vue-spring-bottom-sheet)

**English** | **[Русский](./README.ru.md)**

---

## Features

- Spring physics animations (configurable mass, stiffness, damping)
- iOS-like morphing (compact -> expanded -> fullscreen)
- Drag gestures with velocity-based swipe detection
- Snap points (pixels or percentages)
- v-model support
- Keyboard accessibility (focus trap)
- Teleport support
- Body scroll locking
- Slots: header, content, footer
- CSS custom properties for theming
- TypeScript support
- Vue 3.3+

## Demo

**[Live Examples](https://opekunov.github.io/vue-spring-bottom-sheet/)**

## Installation

```bash
# npm
npm install @opekunov/vue-spring-bottom-sheet

# bun
bun add @opekunov/vue-spring-bottom-sheet

# yarn
yarn add @opekunov/vue-spring-bottom-sheet

# pnpm
pnpm add @opekunov/vue-spring-bottom-sheet
```

## Usage

### Basic

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import BottomSheet from '@opekunov/vue-spring-bottom-sheet'
import '@opekunov/vue-spring-bottom-sheet/dist/style.css'

const sheet = useTemplateRef('sheet')
</script>

<template>
  <button @click="sheet?.open()">Open</button>

  <BottomSheet ref="sheet">
    Your content here
  </BottomSheet>
</template>
```

### With v-model

```vue
<script setup lang="ts">
import { ref } from 'vue'
import BottomSheet from '@opekunov/vue-spring-bottom-sheet'
import '@opekunov/vue-spring-bottom-sheet/dist/style.css'

const isOpen = ref(false)
</script>

<template>
  <button @click="isOpen = true">Open</button>
  <BottomSheet v-model="isOpen">Your content</BottomSheet>
</template>
```

### Snap Points

```vue
<BottomSheet ref="sheet" :snap-points="[200, '50%', '100%']" :initial-snap-point="0">
  Content with three snap positions
</BottomSheet>
```

### Spring Physics

```vue
<BottomSheet ref="sheet" :spring-config="{ mass: 1, stiffness: 300, damping: 30 }">
  Bouncy spring animation
</BottomSheet>
```

### Morphing (iOS-style)

Requires at least 2 snap points (ideally 3: compact / expanded / fullscreen).

```vue
<BottomSheet
  ref="sheet"
  :snap-points="['25%', '50%', '100%']"
  :morphing="{ compactHorizontalInset: 16, compactBottomInset: 16, compactCornerRadius: 20 }"
>
  Morphs from floating card to fullscreen
</BottomSheet>
```

### Slots

```vue
<BottomSheet ref="sheet">
  <template #header>Header</template>
  Main content
  <template #footer>Footer</template>
</BottomSheet>
```

### Cover Slot

Full-bleed background behind header/content/footer (e.g. photo, gradient, map):

```vue
<BottomSheet ref="sheet" :snap-points="[300, '60%', '100%']" :morphing="true">
  <template #cover>
    <img src="/profile-bg.jpg" style="width: 100%; height: 100%; object-fit: cover" />
  </template>
  <template #header>
    <h3 style="color: white">User Profile</h3>
  </template>
  Content on top of the cover image
</BottomSheet>
```

### Nuxt

Wrap in `<ClientOnly>`:

```vue
<ClientOnly>
  <BottomSheet ref="sheet">Content</BottomSheet>
</ClientOnly>
```

## API

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `duration` | `number` | `250` | Animation duration (ms) |
| `snapPoints` | `Array<number \| '${number}%'>` | `[instinctHeight]` | Snap positions |
| `initialSnapPoint` | `number` | `0` | Initial snap point index |
| `blocking` | `boolean` | `true` | Block background interactions |
| `canSwipeClose` | `boolean` | `true` | Allow swipe-to-close |
| `swipeCloseThreshold` | `number \| string` | `'50%'` | Distance to trigger close |
| `canBackdropClose` | `boolean` | `true` | Close on backdrop tap |
| `expandOnContentDrag` | `boolean` | `true` | Expand by dragging content |
| `teleportTo` | `string \| RendererElement` | `'body'` | Teleport target |
| `teleportDefer` | `boolean` | `false` | Defer teleport (Vue 3.5+) |
| `forceMount` | `boolean` | `false` | Keep in DOM when closed |
| `sheetClass` | `string` | `''` | Sheet container CSS class |
| `headerClass` | `string` | `''` | Header CSS class |
| `contentClass` | `string` | `''` | Content CSS class |
| `footerClass` | `string` | `''` | Footer CSS class |
| `scrollClass` | `string` | `''` | Scroll container CSS class |
| `morphing` | `boolean \| MorphingConfig` | `false` | iOS-like morphing |
| `springConfig` | `SpringConfig` | `undefined` | Spring physics config |
| `modelValue` | `boolean` | `undefined` | v-model binding |

> Interactive elements (inputs, textareas, etc.) inside the sheet keep native touch behavior. Use `data-vsbs-no-drag` attribute to opt out of drag on custom elements.

### Methods

| Method | Description |
|---|---|
| `open()` | Open the sheet |
| `close()` | Close the sheet |
| `snapToPoint(index)` | Snap to a specific point |

### Events

| Event | Payload | Description |
|---|---|---|
| `opened` | - | Sheet finished opening |
| `opening-started` | - | Sheet started opening |
| `closed` | - | Sheet finished closing |
| `closing-started` | - | Sheet started closing |
| `dragging-up` | - | User is dragging up |
| `dragging-down` | - | User is dragging down |
| `snapped` | `index: number` | Snapped to a point |
| `instinctHeight` | `height: number` | Content height changed |

## Styling

All library styles are wrapped in `@layer vsbs`, so your CSS always wins — no `!important` needed.

### CSS Custom Properties

```css
[data-vsbs-sheet] {
  /* Colors & background */
  --vsbs-backdrop-bg: rgba(0, 0, 0, 0.5);
  --vsbs-background: #fff;
  --vsbs-shadow-color: rgba(89, 89, 89, 0.2);
  --vsbs-border-color: rgba(46, 59, 66, 0.125);
  --vsbs-outer-border-color: transparent;

  /* Layout */
  --vsbs-border-radius: 16px;
  --vsbs-max-width: 640px;
  --vsbs-padding-x: 16px;

  /* Drag handle */
  --vsbs-handle-background: rgba(0, 0, 0, 0.28);
  --vsbs-handle-width: 36px;
  --vsbs-handle-height: 4px;
  --vsbs-handle-top: 8px;
  --vsbs-handle-radius: 2px;

  /* Section padding */
  --vsbs-header-padding: 20px var(--vsbs-padding-x, 16px) 8px;
  --vsbs-header-empty-padding: 14px var(--vsbs-padding-x, 16px) 10px;
  --vsbs-footer-padding: 16px var(--vsbs-padding-x, 16px);
  --vsbs-content-padding: 8px var(--vsbs-padding-x, 16px);
  --vsbs-content-display: grid;
}
```

### Direct Selector Overrides

Since styles use `@layer vsbs`, any unlayered CSS you write automatically wins:

```css
/* Override the drag handle */
[data-vsbs-header]::before {
  width: 48px;
  height: 6px;
  border-radius: 3px;
}

/* Custom content layout */
[data-vsbs-content] {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
```

### Data Attributes Reference

| Attribute | Element |
|---|---|
| `data-vsbs-sheet` | Sheet container |
| `data-vsbs-backdrop` | Backdrop overlay |
| `data-vsbs-header` | Header (with drag handle) |
| `data-vsbs-scroll` | Scroll container |
| `data-vsbs-content` | Content area |
| `data-vsbs-footer` | Footer |
| `data-vsbs-cover` | Cover slot container |
| `data-vsbs-morphing` | Added when morphing enabled |
| `data-vsbs-shadow` | Added when non-blocking |

## License

[MIT](./LICENSE)
