<script setup lang="ts">
import { useTemplateRef } from 'vue'
import BottomSheet from '@douxcode/vue-spring-bottom-sheet'

const bottomSheet = useTemplateRef<InstanceType<typeof BottomSheet>>('bottomSheet')
const open = () => bottomSheet.value?.open()
</script>

<template>
  <div>
    <UPageHeader
      title="Basic Example"
      description="The simplest implementation with default settings."
      :links="[{ label: 'Back to examples', to: '/', icon: 'i-lucide-arrow-left' }]"
    />

    <UCard class="mt-6">
      <UButton @click="open">
        Open Sheet
      </UButton>

      <ClientOnly>
        <BottomSheet ref="bottomSheet">
          <h2 class="text-xl font-semibold mb-2">
            Basic Example
          </h2>
          <p class="text-muted">
            This is a simple bottom sheet with default settings.
          </p>
        </BottomSheet>
      </ClientOnly>
    </UCard>
  </div>
</template>
