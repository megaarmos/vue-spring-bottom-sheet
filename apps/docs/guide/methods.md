# Methods

Vue Spring Bottom Sheet exposes methods for programmatic control via template refs.

## Accessing Methods

To use these methods, create a template ref:

```vue
<script setup>
import { useTemplateRef } from 'vue'
import BottomSheet from '@opekunov/vue-spring-bottom-sheet'

const bottomSheet = useTemplateRef('bottomSheet')

// Now you can call methods
const openSheet = () => {
  bottomSheet.value.open()
}
</script>

<template>
  <button @click="openSheet">Open</button>
  <BottomSheet ref="bottomSheet"> Content </BottomSheet>
</template>
```

## Methods Reference

### open()

Opens the bottom sheet.

```typescript
open(): Promise<void>
```

**Example:**

```vue
<script setup>
import { useTemplateRef } from 'vue'

const bottomSheet = useTemplateRef('bottomSheet')

const handleClick = async () => {
  await bottomSheet.value.open()
  console.log('Sheet is now open')
}
</script>

<template>
  <button @click="handleClick">Open Sheet</button>
  <BottomSheet ref="bottomSheet"> Content </BottomSheet>
</template>
```

**Behavior:**

- If the sheet is already opening, the call is ignored
- Triggers the `opening-started` event
- Animates the sheet from bottom to the initial snap point
- Triggers the `opened` event when complete
- Updates `v-model` value to `true`

**Use cases:**

- Opening the sheet from a button click
- Opening programmatically after an action
- Chaining with async operations

### close()

Closes the bottom sheet.

```typescript
close(): void
```

**Example:**

```vue
<script setup>
import { useTemplateRef } from 'vue'

const bottomSheet = useTemplateRef('bottomSheet')

const handleSave = () => {
  // Save data...
  bottomSheet.value.close()
}
</script>

<template>
  <BottomSheet ref="bottomSheet">
    <form @submit.prevent="handleSave">
      <input type="text" />
      <button type="submit">Save & Close</button>
    </form>
  </BottomSheet>
</template>
```

**Behavior:**

- If the sheet is already closing, the call is ignored
- Triggers the `closing-started` event
- Animates the sheet from current position to off-screen
- Triggers the `closed` event when complete
- Updates `v-model` value to `false`

**Use cases:**

- Closing after form submission
- Closing from a cancel button
- Closing after a successful action
- Programmatic cleanup

### snapToPoint()

Snaps the sheet to a specific snap point index.

```typescript
snapToPoint(index: number): void
```

**Parameters:**

- `index` - The index of the snap point (0-based)

**Example:**

```vue
<script setup>
import { useTemplateRef } from 'vue'

const bottomSheet = useTemplateRef('bottomSheet')
const snapPoints = [300, 500, '90%']

const snapToSmall = () => {
  bottomSheet.value.snapToPoint(0) // 300px
}

const snapToMedium = () => {
  bottomSheet.value.snapToPoint(1) // 500px
}

const snapToLarge = () => {
  bottomSheet.value.snapToPoint(2) // 90%
}
</script>

<template>
  <BottomSheet ref="bottomSheet" :snap-points="snapPoints">
    <div>
      <button @click="snapToSmall">Small</button>
      <button @click="snapToMedium">Medium</button>
      <button @click="snapToLarge">Large</button>
    </div>
  </BottomSheet>
</template>
```

**Behavior:**

- Animates the sheet to the specified snap point
- Uses the configured `duration` prop
- Triggers the `snapped` event with the index
- Logs a warning if the index is out of bounds

**Use cases:**

- Expanding to show more content
- Creating size presets
- Guided tours or tutorials
- Responding to content changes

::: warning Index Validation
The index must be valid (0 to `snapPoints.length - 1`). Out-of-bounds indices will log a warning and be ignored.
:::

## Next Steps

- [Events](/guide/events) - React to sheet interactions
- [Props](/guide/props) - Configuration options
- [Examples](/examples) - More practical examples
