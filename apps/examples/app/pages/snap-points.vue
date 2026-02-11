<script setup lang="ts">
import { useTemplateRef } from 'vue'
import BottomSheet from '@douxcode/vue-spring-bottom-sheet'

const bottomSheet = useTemplateRef<InstanceType<typeof BottomSheet>>('bottomSheet')
// const snapPoints: (number | `${number}%`)[] = [200, 400, '80%']
const open = () => bottomSheet.value?.open()
</script>

<template>
  <div>
    <UPageHeader
      title="Snap Points Example"
      description="Define custom stopping positions (px or %)."
      :links="[{ label: 'Back to examples', to: '/', icon: 'i-lucide-arrow-left' }]"
    />

    <UCard class="mt-6">
      <UButton @click="open"> Open Sheet </UButton>

      <ClientOnly>
        <BottomSheet ref="bottomSheet" :snap-points="[200, 400, '80%']">
          <h2 class="text-xl font-semibold mb-2">Snap Points Example</h2>
          <p class="mb-2">This sheet has 3 snap points:</p>
          <ul class="list-disc list-inside space-y-1">
            <li>200px from top</li>
            <li>400px from top</li>
            <li>80% of viewport</li>
          </ul>
        </BottomSheet>
      </ClientOnly>
    </UCard>
  </div>
</template>
