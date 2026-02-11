# Props

Complete reference for all Vue Spring Bottom Sheet props.

## Props Overview

| Prop                                        | Type                          | Default            | Description                                |
| ------------------------------------------- | ----------------------------- | ------------------ | ------------------------------------------ |
| [duration](#duration)                       | `Number`                      | `250`              | Animation duration in milliseconds         |
| [snapPoints](#snappoints)                   | `Array<number\|'${number}%'>` | `[instinctHeight]` | Custom snapping positions                  |
| [initialSnapPoint](#initialsnappoint)       | `Number`                      | `0`                | Initial snap point index                   |
| [blocking](#blocking)                       | `Boolean`                     | `true`             | Block interactions with underlying content |
| [canSwipeClose](#canswipeclose)             | `Boolean`                     | `true`             | Enable swipe-to-close gesture              |
| [swipeCloseThreshold](#swipeclosethreshold) | `Number\|'${number}%'`        | `"50%"`            | Threshold for swipe-to-close               |
| [canBackdropClose](#canbackdropclose)       | `Boolean`                     | `true`             | Allow closing by tapping backdrop          |
| [expandOnContentDrag](#expandoncontentdrag) | `Boolean`                     | `true`             | Enable expanding by dragging content       |
| [modelValue](#modelvalue)                   | `Boolean`                     | `undefined`        | v-model support for open/closed state      |
| [teleportTo](#teleportto)                   | `String\|RendererElement`     | `'body'`           | Teleport target element                    |
| [teleportDefer](#teleportdefer)             | `Boolean`                     | `false`            | Defer teleporting until opened             |
| [headerClass](#headerclass)                 | `String`                      | `''`               | Custom class for header element            |
| [contentClass](#contentclass)               | `String`                      | `''`               | Custom class for content element           |
| [footerClass](#footerclass)                 | `String`                      | `''`               | Custom class for footer element            |

## Detailed Reference

### duration

- **Type:** `Number`
- **Default:** `250`
- **Unit:** milliseconds

Controls the speed of opening, closing, and snapping animations.

```vue
<template>
  <!-- Fast animation (150ms) -->
  <BottomSheet :duration="150"> Quick transitions </BottomSheet>

  <!-- Default animation (250ms) -->
  <BottomSheet> Standard speed </BottomSheet>

  <!-- Slow animation (500ms) -->
  <BottomSheet :duration="500"> Smooth, leisurely transitions </BottomSheet>
</template>
```

::: tip Performance
Lower values (100-200ms) feel snappier, while higher values (400-600ms) feel more elegant. The default 250ms is a balanced choice.
:::

### snapPoints

- **Type:** `Array<number | string>`
- **Default:** `[instinctHeight]` (automatically calculated based on content)

Defines the heights at which the sheet can "snap" or settle. Values can be:

- **Pixels** (number): `300` means 300 pixels from the bottom
- **Percentage** (string): `"80%"` means 80% of the viewport height

```vue
<script setup>
const snapPoints = [300, 500, '90%']
</script>

<template>
  <BottomSheet :snap-points="snapPoints">
    <!-- Sheet can snap to 300px, 500px, or 90% of viewport -->
  </BottomSheet>
</template>
```

**Default Behavior:**
When not provided, the sheet automatically calculates its height based on content (header + content + footer).

```vue
<template>
  <!-- Automatically sizes to fit content -->
  <BottomSheet>
    <p>The sheet will be exactly tall enough for this content</p>
  </BottomSheet>
</template>
```

::: warning Order Matters
Snap points should typically be ordered from smallest to largest for intuitive dragging behavior.
:::

### initialSnapPoint

- **Type:** `Number`
- **Default:** `0` (first snap point)

The index of the snap point to use when the sheet first opens.

```vue
<script setup>
const snapPoints = [200, 400, '80%']
</script>

<template>
  <!-- Opens at 400px (index 1) -->
  <BottomSheet :snap-points="snapPoints" :initial-snap-point="1"> Content </BottomSheet>
</template>
```

::: warning Index Bounds
The value must be a valid index (0 to `snapPoints.length - 1`). Out-of-bounds values will log a warning.
:::

### blocking

- **Type:** `Boolean`
- **Default:** `true`

When `true`, shows a backdrop and prevents interaction with the underlying page. When `false`, the page remains fully interactive.

```vue
<template>
  <!-- Blocking mode: backdrop prevents interaction -->
  <BottomSheet :blocking="true"> User must close this to interact with page </BottomSheet>

  <!-- Non-blocking: page remains interactive -->
  <BottomSheet :blocking="false"> Page content is still clickable </BottomSheet>
</template>
```

**Effects of blocking mode:**

- ✅ Backdrop overlay appears
- ✅ Scrolling on the page is locked
- ✅ Focus is trapped within the sheet
- ✅ ESC key closes the sheet

**Non-blocking mode:**

- ❌ No backdrop
- ❌ Page remains scrollable
- ❌ No focus trap
- ✅ Sheet floats above content

::: tip Use Cases

- **Blocking:** Forms, important dialogs, consent screens
- **Non-blocking:** Music players, chat widgets, persistent tools
  :::

### canSwipeClose

- **Type:** `Boolean`
- **Default:** `true`

Enables or disables the ability to close the sheet by swiping down.

```vue
<template>
  <!-- Can swipe down to close -->
  <BottomSheet :can-swipe-close="true"> Swipe down to close </BottomSheet>

  <!-- Cannot swipe to close -->
  <BottomSheet :can-swipe-close="false">
    Must use close button
    <button @click="bottomSheet.close()">Close</button>
  </BottomSheet>
</template>
```

::: warning User Experience
Disabling swipe-to-close can frustrate users on touch devices. Always provide an alternative close method (button, backdrop click, etc.).
:::

### swipeCloseThreshold

- **Type:** `Number | String`
- **Default:** `"50%"`

The distance the user must drag down before the sheet closes.

**As Percentage:**

```vue
<template>
  <!-- Must drag down 50% of sheet height -->
  <BottomSheet swipe-close-threshold="50%"> Default behavior </BottomSheet>

  <!-- Must drag down 70% of sheet height -->
  <BottomSheet swipe-close-threshold="70%"> Harder to accidentally close </BottomSheet>

  <!-- Must drag down only 30% -->
  <BottomSheet swipe-close-threshold="30%"> Easier to close </BottomSheet>
</template>
```

**As Pixels:**

```vue
<template>
  <!-- Must drag down 100 pixels -->
  <BottomSheet :swipe-close-threshold="100"> Fixed pixel distance </BottomSheet>
</template>
```

::: tip Choosing a Value

- **30-40%**: Easy to close (good for dismissable content)
- **50%**: Balanced (default)
- **60-70%**: Harder to close accidentally (good for important forms)
  :::

### canBackdropClose

- **Type:** `Boolean`
- **Default:** `true`

When `true`, clicking/tapping the backdrop closes the sheet. Only applies when `blocking` is `true`.

```vue
<template>
  <!-- Backdrop click closes sheet -->
  <BottomSheet :blocking="true" :can-backdrop-close="true"> Click backdrop to close </BottomSheet>

  <!-- Backdrop click does nothing -->
  <BottomSheet :blocking="true" :can-backdrop-close="false"> Must use close button </BottomSheet>
</template>
```

::: tip Combining Close Options
You can disable multiple close methods:

```vue
<BottomSheet :can-swipe-close="false" :can-backdrop-close="false">
  <!-- Only closeable via button or programmatic close() -->
</BottomSheet>
```

:::

### expandOnContentDrag

- **Type:** `Boolean`
- **Default:** `true`

When `true`, users can drag the content area (not just header/footer) to expand or collapse the sheet.

```vue
<template>
  <!-- Can drag content to expand -->
  <BottomSheet :expand-on-content-drag="true">
    <p>You can drag anywhere in this content!</p>
  </BottomSheet>

  <!-- Only header/footer are draggable -->
  <BottomSheet :expand-on-content-drag="false">
    <p>Only the header and footer can be dragged</p>
  </BottomSheet>
</template>
```

::: warning Scrollable Content
This prop only affects non-scrollable content. Once content becomes scrollable (exceeds sheet height), normal scrolling takes precedence.
:::

### modelValue

- **Type:** `Boolean`
- **Default:** `undefined`

Enables v-model support for reactive control of the sheet's open/closed state.

```vue
<script setup>
const isOpen = ref(false)

const openSheet = () => {
  isOpen.value = true
}
</script>

<template>
  <button @click="openSheet">Open</button>
  <button @click="isOpen = false">Close</button>

  <BottomSheet v-model="isOpen">
    <!-- Sheet opens when isOpen is true -->
    Content
  </BottomSheet>
</template>
```

**Reactive updates:**

```vue
<script setup>
import { ref, watch } from 'vue'

const isOpen = ref(false)

// React to sheet state changes
watch(isOpen, (newValue) => {
  console.log('Sheet is now:', newValue ? 'open' : 'closed')
})
</script>
```

::: tip Template Ref vs v-model

- Use **template ref** when you want imperative control (`ref.open()`, `ref.close()`)
- Use **v-model** when you want reactive state management
- You can use both together!
  :::

### teleportTo

- **Type:** `String | RendererElement`
- **Default:** `'body'`

The element to teleport the sheet to. Useful for avoiding z-index stacking issues.

```vue
<template>
  <!-- Default: teleport to body -->
  <BottomSheet> Content </BottomSheet>

  <!-- Teleport to specific element -->
  <BottomSheet teleport-to="#modal-root"> Content </BottomSheet>

  <!-- Disable teleport (render in place) -->
  <BottomSheet :teleport-to="false"> Content </BottomSheet>
</template>
```

**Setting up a custom target:**

```html
<!-- index.html -->
<body>
  <div id="app"></div>
  <div id="modal-root"></div>
</body>
```

```vue
<template>
  <BottomSheet teleport-to="#modal-root"> Rendered in #modal-root </BottomSheet>
</template>
```

### teleportDefer

- **Type:** `Boolean`
- **Default:** `false`
- **Requires:** Vue 3.5+

When `true`, defers the teleport until the sheet is opened. Useful when the target element might not be available immediately.

```vue
<template>
  <BottomSheet teleport-to="#late-mount" :teleport-defer="true">
    Waits for #late-mount to exist
  </BottomSheet>
</template>
```

::: warning Vue Version
This prop uses Vue 3.5's deferred teleport feature. In earlier versions, it has no effect.
:::

### headerClass

- **Type:** `String`
- **Default:** `''`

Custom CSS class to apply to the header element.

```vue
<template>
  <BottomSheet header-class="custom-header">
    <template #header> Styled Header </template>
  </BottomSheet>
</template>
```

### contentClass

- **Type:** `String`
- **Default:** `''`

Custom CSS class to apply to the content element.

```vue
<template>
  <BottomSheet content-class="custom-content"> Styled Content </BottomSheet>
</template>
```

### footerClass

- **Type:** `String`
- **Default:** `''`

Custom CSS class to apply to the footer element.

```vue
<template>
  <BottomSheet footer-class="custom-footer">
    <template #footer> Footer Actions </template>
  </BottomSheet>
</template>
```

## Next Steps

- [Events Reference](/guide/events) - Handle lifecycle events
- [Methods](/guide/methods) - Exposed component methods
- [Styling](/guide/styling) - CSS customization guide
- [Examples](/examples) - See props in action
