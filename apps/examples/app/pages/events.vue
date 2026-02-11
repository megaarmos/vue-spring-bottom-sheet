<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import BottomSheet from '@douxcode/vue-spring-bottom-sheet'

const bottomSheet = useTemplateRef<InstanceType<typeof BottomSheet>>('bottomSheet')
const logs = ref<{ time: string, message: string }[]>([])

const addLog = (message: string) => {
  logs.value.unshift({
    time: new Date().toLocaleTimeString(),
    message
  })
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
const onInstinctHeight = (height: number) => addLog(`Height changed: ${height}px`)
const onSnapped = (index?: number) => addLog(`Snapped to point: ${index ?? '?'}`)

const open = () => bottomSheet.value?.open()
</script>

<template>
  <div>
    <UPageHeader
      title="Event Handling Example"
      description="Demonstrating all lifecycle events."
      :links="[{ label: 'Back to examples', to: '/', icon: 'i-lucide-arrow-left' }]"
    />

    <UCard class="mt-6">
      <UButton class="mb-6" @click="open">
        Open Sheet
      </UButton>

      <div class="space-y-2">
        <h3 class="font-semibold">
          Event Log:
        </h3>
        <div class="bg-muted/50 p-4 rounded-lg max-h-80 overflow-y-auto">
          <p
            v-for="(log, i) in logs"
            :key="i"
            class="m-1 font-mono text-sm"
          >
            <span class="text-muted">[{{ log.time }}]</span> {{ log.message }}
          </p>
          <p v-if="logs.length === 0" class="text-muted italic">
            No events yet. Open the sheet to see events.
          </p>
        </div>
      </div>

      <ClientOnly>
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
          <div class="space-y-2">
            <h2 class="text-xl font-semibold">
              Event Demo
            </h2>
            <p>Interact with this sheet to see events in the log above.</p>
            <ul class="list-disc list-inside space-y-1">
              <li>Try opening and closing</li>
              <li>Drag up and down</li>
              <li>Watch it snap between points</li>
            </ul>
          </div>
        </BottomSheet>
      </ClientOnly>
    </UCard>
  </div>
</template>
