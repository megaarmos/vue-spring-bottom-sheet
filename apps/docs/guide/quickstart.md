# Quick Start

Get started with Vue Spring Bottom Sheet in minutes.

## Prerequisites

- Vue 3.0+

## Basic Usage

### 1. Import the Component and Styles

```vue
<script setup>
import BottomSheet from '@opekunov/vue-spring-bottom-sheet'
import '@opekunov/vue-spring-bottom-sheet/dist/style.css'
import { useTemplateRef } from 'vue'
</script>
```

::: tip Vue 3.5+
We recommend using `useTemplateRef` for better type safety and cleaner code. If you're using Vue 3.0-3.4, use `ref` instead (see below).
:::

### 2. Create a Template Reference

```vue
<script setup>
import BottomSheet from '@opekunov/vue-spring-bottom-sheet'
import '@opekunov/vue-spring-bottom-sheet/dist/style.css'
import { useTemplateRef } from 'vue'

const bottomSheet = useTemplateRef('bottomSheet')
</script>
```

### 3. Add Control Methods

```vue
<script setup>
import BottomSheet from '@opekunov/vue-spring-bottom-sheet'
import '@opekunov/vue-spring-bottom-sheet/dist/style.css'
import { useTemplateRef } from 'vue'

const bottomSheet = useTemplateRef('bottomSheet')

const open = () => {
  bottomSheet.value?.open()
}

const close = () => {
  bottomSheet.value?.close()
}
</script>
```

### 4. Use in Template

```vue
<template>
  <button @click="open">Open Bottom Sheet</button>
  <BottomSheet ref="bottomSheet"> Your awesome content </BottomSheet>
</template>
```

### Complete Example

```vue
<script setup>
import BottomSheet from '@opekunov/vue-spring-bottom-sheet'
import '@opekunov/vue-spring-bottom-sheet/dist/style.css'
import { useTemplateRef } from 'vue'

const bottomSheet = useTemplateRef('bottomSheet')

const open = () => {
  bottomSheet.value?.open()
}

const close = () => {
  bottomSheet.value?.close()
}
</script>

<template>
  <button @click="open">Open Bottom Sheet</button>
  <BottomSheet ref="bottomSheet">
    <h2>Hello World!</h2>
    <p>This is your first bottom sheet.</p>
    <button @click="close">Close</button>
  </BottomSheet>
</template>
```

## TypeScript Support

For TypeScript users with Vue 3.5+:

```vue
<script setup lang="ts">
import BottomSheet from '@opekunov/vue-spring-bottom-sheet'
import '@opekunov/vue-spring-bottom-sheet/dist/style.css'
import { useTemplateRef } from 'vue'

const bottomSheet = useTemplateRef<InstanceType<typeof BottomSheet>>('bottomSheet')

const open = () => {
  bottomSheet.value?.open()
}

const close = () => {
  bottomSheet.value?.close()
}
</script>

<template>
  <button @click="open">Open Bottom Sheet</button>
  <BottomSheet ref="bottomSheet"> Your awesome content </BottomSheet>
</template>
```

### Using `ref` (Vue 3.0 - 3.4)

If you're using Vue 3.0 to 3.4, use `ref` instead:

```vue
<script setup lang="ts">
import BottomSheet from '@opekunov/vue-spring-bottom-sheet'
import '@opekunov/vue-spring-bottom-sheet/dist/style.css'
import { ref } from 'vue'

const bottomSheet = ref<InstanceType<typeof BottomSheet>>()

const open = () => {
  bottomSheet.value?.open()
}

const close = () => {
  bottomSheet.value?.close()
}
</script>

<template>
  <button @click="open">Open Bottom Sheet</button>
  <BottomSheet ref="bottomSheet"> Your awesome content </BottomSheet>
</template>
```

## v-model Usage

For reactive control with `v-model`:

```vue
<script setup lang="ts">
import BottomSheet from '@opekunov/vue-spring-bottom-sheet'
import '@opekunov/vue-spring-bottom-sheet/dist/style.css'

const isOpen = ref(false)
</script>

<template>
  <button type="button" @click="isOpen = true">Open bottom sheet</button>

  <BottomSheet v-model="isOpen">
    <h2>v-model Example</h2>
    <p>This sheet is controlled by a reactive boolean.</p>
    <button @click="isOpen = false">Close</button>
  </BottomSheet>
</template>
```

## Next Steps

- [Usage Patterns](/guide/usage) - Learn different ways to use the component
- [Props Reference](/guide/props) - Explore all available options
- [Events](/guide/events) - Handle sheet lifecycle events
- [Styling](/guide/styling) - Customize the appearance
- [Examples](/examples) - See practical examples
