# Examples

Explore various usage examples of the Vue Spring Bottom Sheet component.

::: tip Live Demo
For interactive demos, visit the [live demo site](https://vue-spring-bottom-sheet.douxcode.com/)
:::

## Basic Example

The simplest implementation:

```vue
<script setup>
import BottomSheet from '@douxcode/vue-spring-bottom-sheet'
import '@douxcode/vue-spring-bottom-sheet/dist/style.css'
import { useTemplateRef } from 'vue'

const bottomSheet = useTemplateRef()
</script>

<template>
  <button @click="bottomSheet.open()">Open Sheet</button>

  <BottomSheet ref="bottomSheet">
    <h2>Basic Example</h2>
    <p>This is a simple bottom sheet with default settings.</p>
  </BottomSheet>
</template>
```

## Snap Points Example

Define custom stopping positions:

```vue
<script setup>
import { useTemplateRef } from 'vue'

const bottomSheet = useTemplateRef('bottomSheet')
const snapPoints = [200, 400, '80%']
</script>

<template>
  <button @click="bottomSheet.open()">Open Sheet</button>

  <BottomSheet ref="bottomSheet" :snap-points="snapPoints" :initial-snap-point="1">
    <h2>Snap Points Example</h2>
    <p>This sheet has 3 snap points:</p>
    <ul>
      <li>200px from top</li>
      <li>400px from top</li>
      <li>80% of viewport</li>
    </ul>
  </BottomSheet>
</template>
```

## With Header and Footer

Using slots for complete layout control:

```vue
<script setup>
import { useTemplateRef } from 'vue'

const bottomSheet = useTemplateRef('bottomSheet')
const email = ref('')
</script>

<template>
  <button @click="bottomSheet.open()">Subscribe</button>

  <BottomSheet ref="bottomSheet">
    <template #header>
      <div style="text-align: center; padding: 1rem;">
        <h3 style="margin: 0;">Newsletter</h3>
      </div>
    </template>

    <div style="padding: 0 1rem;">
      <p>Subscribe to our newsletter for updates!</p>
      <input
        v-model="email"
        type="email"
        placeholder="Enter your email"
        style="width: 100%; padding: 0.75rem; margin: 1rem 0;"
      />
    </div>

    <template #footer>
      <div style="padding: 1rem; display: flex; gap: 1rem;">
        <button @click="bottomSheet.close()" style="flex: 1; padding: 0.75rem;">Cancel</button>
        <button
          @click="bottomSheet.close()"
          style="flex: 1; padding: 0.75rem; background: #007bff; color: white;"
        >
          Subscribe
        </button>
      </div>
    </template>
  </BottomSheet>
</template>
```

## List/Menu Example

Perfect for action sheets and menus:

```vue
<script setup>
import { useTemplateRef } from 'vue'

const bottomSheet = useTemplateRef('bottomSheet')

const actions = [
  { label: 'Share', icon: '🔗' },
  { label: 'Edit', icon: '✏️' },
  { label: 'Delete', icon: '🗑️', danger: true },
]

const handleAction = (action) => {
  console.log('Selected:', action.label)
  bottomSheet.value.close()
}
</script>

<template>
  <button @click="bottomSheet.open()">Show Actions</button>

  <BottomSheet ref="bottomSheet" :snap-points="[300]">
    <template #header>
      <div style="text-align: center; padding: 1rem; border-bottom: 1px solid #eee;">
        <h3 style="margin: 0;">Actions</h3>
      </div>
    </template>

    <div>
      <button
        v-for="action in actions"
        :key="action.label"
        @click="handleAction(action)"
        style="
          width: 100%;
          padding: 1rem;
          text-align: left;
          border: none;
          border-bottom: 1px solid #eee;
          background: none;
          cursor: pointer;
          font-size: 1rem;
          color: v-bind('action.danger ? "#ff4444" : "inherit"');
        "
      >
        <span style="margin-right: 0.5rem;">{{ action.icon }}</span>
        {{ action.label }}
      </button>
    </div>

    <template #footer>
      <div style="padding: 1rem;">
        <button
          @click="bottomSheet.close()"
          style="width: 100%; padding: 1rem;"
        >
          Cancel
        </button>
      </div>
    </template>
  </BottomSheet>
</template>
```

## Form Example

A sheet containing a complete form:

```vue
<script setup>
import { useTemplateRef } from 'vue'

const bottomSheet = useTemplateRef('bottomSheet')

const formData = ref({
  name: '',
  email: '',
  message: '',
})

const submitForm = () => {
  console.log('Form submitted:', formData.value)
  bottomSheet.value.close()
  // Reset form
  formData.value = { name: '', email: '', message: '' }
}
</script>

<template>
  <button @click="bottomSheet.open()">Contact Us</button>

  <BottomSheet ref="bottomSheet" :snap-points="['90%']">
    <template #header>
      <div style="padding: 1rem; border-bottom: 1px solid #eee;">
        <h3 style="margin: 0;">Contact Form</h3>
      </div>
    </template>

    <form @submit.prevent="submitForm" style="padding: 1rem;">
      <div style="margin-bottom: 1rem;">
        <label style="display: block; margin-bottom: 0.5rem;">Name</label>
        <input
          v-model="formData.name"
          type="text"
          required
          style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;"
        />
      </div>

      <div style="margin-bottom: 1rem;">
        <label style="display: block; margin-bottom: 0.5rem;">Email</label>
        <input
          v-model="formData.email"
          type="email"
          required
          style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;"
        />
      </div>

      <div style="margin-bottom: 1rem;">
        <label style="display: block; margin-bottom: 0.5rem;">Message</label>
        <textarea
          v-model="formData.message"
          required
          rows="4"
          style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; resize: vertical;"
        ></textarea>
      </div>

      <button
        type="submit"
        style="width: 100%; padding: 1rem; background: #007bff; color: white; border: none; border-radius: 4px;"
      >
        Send Message
      </button>
    </form>
  </BottomSheet>
</template>
```

## Image Gallery Example

Display images in a bottom sheet:

```vue
<script setup>
import { useTemplateRef } from 'vue'

const bottomSheet = useTemplateRef('bottomSheet')
const selectedImage = ref(null)

const images = [
  { id: 1, src: '/image1.jpg', title: 'Image 1' },
  { id: 2, src: '/image2.jpg', title: 'Image 2' },
  { id: 3, src: '/image3.jpg', title: 'Image 3' },
]

const openImage = (image) => {
  selectedImage.value = image
  bottomSheet.value.open()
}
</script>

<template>
  <div style="display: flex; gap: 1rem; padding: 1rem;">
    <img
      v-for="image in images"
      :key="image.id"
      :src="image.src"
      :alt="image.title"
      @click="openImage(image)"
      style="width: 100px; height: 100px; object-fit: cover; cursor: pointer; border-radius: 8px;"
    />
  </div>

  <BottomSheet ref="bottomSheet" :snap-points="['80%']">
    <template #header>
      <div style="padding: 1rem; text-align: center;">
        <h3 style="margin: 0;">{{ selectedImage?.title }}</h3>
      </div>
    </template>

    <div v-if="selectedImage" style="padding: 1rem;">
      <img
        :src="selectedImage.src"
        :alt="selectedImage.title"
        style="width: 100%; height: auto; border-radius: 8px;"
      />
      <p style="margin-top: 1rem;">Click the image or swipe down to close.</p>
    </div>
  </BottomSheet>
</template>
```

## Event Handling Example

Demonstrating all lifecycle events:

```vue
<script setup>
import { useTemplateRef } from 'vue'
import BottomSheet from '@douxcode/vue-spring-bottom-sheet'
import '@douxcode/vue-spring-bottom-sheet/dist/style.css'

const bottomSheet = useTemplateRef('bottomSheet')
const logs = ref([])

const addLog = (message) => {
  logs.value.unshift({
    time: new Date().toLocaleTimeString(),
    message,
  })
  // Keep only last 10 logs
  if (logs.value.length > 10) {
    logs.value = logs.value.slice(0, 10)
  }
}

const onOpeningStarted = () => addLog('Opening started')
const onOpened = () => addLog('Opened')
const onClosingStarted = () => addLog('Closing started')
const onClosed = () => addLog('Closed')
const onDraggingUp = () => addLog('Dragging up')
const onDraggingDown = () => addLog('Dragging down')
const onInstinctHeight = (height) => addLog(`Height changed: ${height}px`)
const onSnapped = (index) => addLog(`Snapped to point: ${index}`)
</script>

<template>
  <div style="padding: 1rem;">
    <button @click="bottomSheet.open()">Open Sheet</button>

    <div style="margin-top: 2rem;">
      <h3>Event Log:</h3>
      <div
        style="background: #f5f5f5; padding: 1rem; border-radius: 8px; max-height: 300px; overflow-y: auto;"
      >
        <p v-for="(log, i) in logs" :key="i" style="margin: 0.25rem 0; font-family: monospace;">
          <span style="color: #666;">[{{ log.time }}]</span> {{ log.message }}
        </p>
        <p v-if="logs.length === 0" style="color: #999; font-style: italic;">
          No events yet. Open the sheet to see events.
        </p>
      </div>
    </div>

    <BottomSheet
      ref="bottomSheet"
      :snap-points="[300, 500]"
      @opening-started="onOpeningStarted"
      @opened="onOpened"
      @closing-started="onClosingStarted"
      @closed="onClosed"
      @dragging-up="onDraggingUp"
      @dragging-down="onDraggingDown"
      @instinct-height="onInstinctHeight"
      @snapped="onSnapped"
    >
      <div style="padding: 1rem;">
        <h2>Event Demo</h2>
        <p>Interact with this sheet to see events in the log above.</p>
        <ul>
          <li>Try opening and closing</li>
          <li>Drag up and down</li>
          <li>Watch it snap between points</li>
        </ul>
      </div>
    </BottomSheet>
  </div>
</template>
```

## More Examples

Visit the [live demo](https://vue-spring-bottom-sheet.douxcode.com/) to see:

- **Blocking mode** - Control backdrop interactions
- **Non-blocking mode** - Sheet floats above interactive content
- **Custom snap behaviors** - Various snap point configurations
- **Sticky headers/footers** - Fixed elements while scrolling
- **Drag threshold variations** - Different close sensitivities
- **Animation speed variations** - Fast and slow transitions
- **Custom styling** - Various theme implementations
