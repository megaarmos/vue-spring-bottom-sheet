# Usage Patterns

Learn different ways to use Vue Spring Bottom Sheet in your application.

## Template Ref Pattern

The most common pattern using template refs:

```vue
<script setup>
import BottomSheet from '@opekunov/vue-spring-bottom-sheet'
import '@opekunov/vue-spring-bottom-sheet/dist/style.css'
import { useTemplateRef } from 'vue'

const bottomSheet = useTemplateRef('bottomSheet')

const openSheet = () => {
  bottomSheet.value.open()
}

const closeSheet = () => {
  bottomSheet.value.close()
}
</script>

<template>
  <button @click="openSheet">Open</button>
  <BottomSheet ref="bottomSheet"> Your content here </BottomSheet>
</template>
```

## v-model Pattern

For reactive state management:

```vue
<script setup>
import BottomSheet from '@opekunov/vue-spring-bottom-sheet'
import '@opekunov/vue-spring-bottom-sheet/dist/style.css'

const isOpen = ref(false)
</script>

<template>
  <button @click="isOpen = true">Open</button>
  <BottomSheet v-model="isOpen"> Your content here </BottomSheet>
</template>
```

::: tip When to use v-model
Use `v-model` when you need to:

- Track the open/closed state in your component
- Coordinate with other UI elements
- Integrate with state management libraries
  :::

## Using Slots

Bottom Sheet provides three slots for complete layout control:

```vue
<template>
  <BottomSheet ref="bottomSheet">
    <template #header>
      <div class="sheet-header">
        <h3>Header Content</h3>
      </div>
    </template>

    <!-- Default slot for main content -->
    <div class="sheet-body">
      <p>Your main content goes here</p>
    </div>

    <template #footer>
      <div class="sheet-footer">
        <button @click="save">Save</button>
        <button @click="bottomSheet.close()">Cancel</button>
      </div>
    </template>
  </BottomSheet>
</template>
```

### Header Slot

The header slot is perfect for:

- Titles and headings
- Close buttons
- Progress indicators
- Tabs or navigation

The header includes a drag handle by default (the line at the top).

### Default Slot

The main content area that:

- Automatically scrolls when content exceeds the sheet height
- Can be dragged to expand when `expandOnContentDrag` is enabled
- Supports any Vue content

### Footer Slot

The footer slot is ideal for:

- Action buttons
- Form submission controls
- Navigation
- Status information

::: warning Empty Slots
Footer slots that are empty will be hidden automatically.
:::

## Snap Points

Define custom stopping positions for the sheet:

```vue
<script setup>
import { useTemplateRef } from 'vue'

const bottomSheet = useTemplateRef('bottomSheet')

// Mix of pixel values and percentages
const snapPoints = [200, 400, '80%']
</script>

<template>
  <BottomSheet ref="bottomSheet" :snap-points="snapPoints" :initial-snap-point="0">
    <p>Drag me to snap between 200px, 400px, or 80% of viewport!</p>
  </BottomSheet>
</template>
```

### Programmatic Snapping

```vue
<script setup>
import { useTemplateRef } from 'vue'

const bottomSheet = useTemplateRef('bottomSheet')
const snapPoints = [300, 500, '90%']

const snapToMiddle = () => {
  bottomSheet.value.snapToPoint(1) // Snap to 500px
}

const snapToTop = () => {
  bottomSheet.value.snapToPoint(2) // Snap to 90%
}
</script>

<template>
  <BottomSheet ref="bottomSheet" :snap-points="snapPoints">
    <button @click="snapToMiddle">Snap to Middle</button>
    <button @click="snapToTop">Snap to Top</button>
  </BottomSheet>
</template>
```

## Blocking vs Non-Blocking

### Blocking Mode (Default)

Creates a backdrop that blocks interaction with the page:

```vue
<template>
  <BottomSheet :blocking="true">
    <!-- This is the default behavior -->
    User must close this sheet to interact with the page
  </BottomSheet>
</template>
```

### Non-Blocking Mode

Sheet floats above the page without blocking interaction:

```vue
<template>
  <BottomSheet :blocking="false">
    <!-- Page remains interactive -->
    User can interact with the page while sheet is open
  </BottomSheet>
</template>
```

::: tip Use Cases

- **Blocking**: Modals, forms requiring attention, critical decisions
- **Non-blocking**: Persistent players, chat widgets, mini tools
  :::

## Close Behaviors

### Swipe to Close

```vue
<template>
  <BottomSheet :can-swipe-close="true" swipe-close-threshold="50%">
    Swipe down past 50% to close
  </BottomSheet>
</template>
```

The threshold can be:

- Percentage: `"50%"` - closes when dragged down 50% of current height
- Pixels: `100` - closes when dragged down 100 pixels

### Backdrop Click to Close

```vue
<template>
  <BottomSheet :can-backdrop-close="true"> Click the backdrop to close </BottomSheet>
</template>
```

### Disable All Close Behaviors

```vue
<template>
  <BottomSheet :can-swipe-close="false" :can-backdrop-close="false">
    Must use a button or programmatic close
    <button @click="bottomSheet.close()">Close</button>
  </BottomSheet>
</template>
```

## Content Dragging

Enable expanding the sheet by dragging its content:

```vue
<template>
  <BottomSheet :expand-on-content-drag="true" :snap-points="[300, 600]">
    <div style="padding: 2rem;">
      <p>You can drag anywhere in this content to expand the sheet!</p>
      <p>This is useful when the entire sheet should be interactive.</p>
    </div>
  </BottomSheet>
</template>
```

::: warning Content Dragging Behavior
When `expandOnContentDrag` is enabled:

- Dragging up expands the sheet
- Dragging down collapses or closes it
- This applies to non-scrollable content areas
- Scrollable content still scrolls normally
  :::

## Nuxt 3 Integration

Wrap the component in `<ClientOnly>` for SSR compatibility:

```vue
<script setup>
import BottomSheet from '@opekunov/vue-spring-bottom-sheet'
import '@opekunov/vue-spring-bottom-sheet/dist/style.css'
import { useTemplateRef } from 'vue'

const bottomSheet = useTemplateRef('bottomSheet')
</script>

<template>
  <ClientOnly>
    <BottomSheet ref="bottomSheet"> Your content </BottomSheet>
  </ClientOnly>
</template>
```

::: tip Why ClientOnly?
Bottom Sheet relies on browser APIs that aren't available during SSR. Wrapping it in `<ClientOnly>` ensures it only renders on the client side.
:::

## Teleporting

By default, the sheet teleports to `body`, but you can customize this:

```vue
<template>
  <!-- Teleport to a specific element -->
  <BottomSheet teleport-to="#modal-container"> Content </BottomSheet>

  <!-- Disable teleport -->
  <BottomSheet teleport-to="false"> Rendered in place </BottomSheet>
</template>
```

### Deferred Teleport (Vue 3.5+)

```vue
<template>
  <BottomSheet teleport-to="#late-mount" :teleport-defer="true">
    Waits for target to be available
  </BottomSheet>
</template>
```

## Custom Classes

Apply custom classes to different sections:

```vue
<template>
  <BottomSheet
    header-class="custom-header"
    content-class="custom-content"
    footer-class="custom-footer"
  >
    <template #header>Styled Header</template>
    <div>Styled Content</div>
    <template #footer>Styled Footer</template>
  </BottomSheet>
</template>

<style>
.custom-header {
  background: linear-gradient(to right, #667eea, #764ba2);
  color: white;
}

.custom-content {
  font-size: 1.1rem;
  line-height: 1.6;
}

.custom-footer {
  border-top: 2px solid #667eea;
}
</style>
```

## Animation Duration

Control the animation speed:

```vue
<template>
  <!-- Fast animation -->
  <BottomSheet :duration="150"> Quick transitions </BottomSheet>

  <!-- Slow animation -->
  <BottomSheet :duration="500"> Smooth, leisurely transitions </BottomSheet>
</template>
```

Default is `250ms`.

## Next Steps

- [Props Reference](/guide/props) - Complete API documentation
- [Events](/guide/events) - Handle lifecycle events
- [Styling](/guide/styling) - Customize appearance
- [Examples](/examples) - Practical examples
