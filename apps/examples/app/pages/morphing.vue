<script setup lang="ts">
import { useTemplateRef } from 'vue'
import BottomSheet from '@douxcode/vue-spring-bottom-sheet'

const bottomSheet = useTemplateRef('bottomSheet')

const open = () => {
  bottomSheet.value?.open()
}

const snapToPoint = (snapPoint: number) => {
  bottomSheet.value?.snapToPoint(snapPoint)
}
</script>

<template>
  <UContainer>
    <UPageHeader
      title="Morphing Sheet (iOS 26-like)"
      description="Floating card → edge-to-edge → fullscreen with spring-based morphing."
      :links="[{ label: 'Back to examples', to: '/', icon: 'i-lucide-arrow-left' }]"
    />

    <UCard class="mt-6">
      <UButton @click="open">Open Morphing Sheet</UButton>

      <ClientOnly>
        <BottomSheet
          ref="bottomSheet"
          :blocking="true"
          :can-swipe-close="false"
          :initial-snap-point="0"
          :expand-on-content-drag="true"
          :snap-points="[200, '50%', '100%']"
          :morphing="{
            compactHorizontalInset: 16,
            compactBottomInset: 16,
            compactCornerRadius: 24,
            expandedCornerRadius: 0,
            fullscreenCornerRadius: 0,
          }"
          :spring-config="{
            mass: 1,
            stiffness: 200,
            damping: 25,
          }"
        >
          <div class="grid grid-cols-3 gap-2 mb-4">
            <UButton @click="snapToPoint(0)">Compact</UButton>
            <UButton @click="snapToPoint(1)">Expanded</UButton>
            <UButton @click="snapToPoint(2)">Fullscreen</UButton>
          </div>

          <h2 class="text-xl font-semibold mb-2">Morphing Bottom Sheet</h2>
          <p class="text-muted mb-3">
            Drag this sheet to see it morph between three states:
          </p>
          <ul class="list-disc pl-5 mb-4 space-y-1 text-muted">
            <li><strong>Compact:</strong> floating rounded card with insets</li>
            <li><strong>Expanded:</strong> edge-to-edge sheet from bottom</li>
            <li><strong>Fullscreen:</strong> covers the entire screen</li>
          </ul>

          <p v-for="i in 10" :key="i" class="mb-2 text-muted">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iste aperiam,
            accusamus amet veniam officiis libero necessitatibus ipsum.
          </p>

          <template #footer>
            <UButton @click="bottomSheet?.close()">Close</UButton>
          </template>
        </BottomSheet>
      </ClientOnly>
    </UCard>
  </UContainer>
</template>
