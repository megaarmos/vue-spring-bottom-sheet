<script setup lang="ts">
import { useTemplateRef } from 'vue'
import BottomSheet from '@opekunov/vue-spring-bottom-sheet'

const bottomSheet = useTemplateRef('bottomSheet')
const instinctHeight = ref(0)

const expandOnContentDrag = ref(true)

const open = () => {
  bottomSheet.value?.open()
}

const close = () => {
  bottomSheet.value?.close()
}

const snapToPoint = (snapPoint: number) => {
  bottomSheet.value?.snapToPoint(snapPoint)
}
</script>

<template>
  <UContainer>
    <UPageHeader
      title="Snap Points Example"
      description="Define custom stopping positions (px or %)."
      :links="[{ label: 'Back to examples', to: '/', icon: 'i-lucide-arrow-left' }]"
    />

    <UCard class="mt-6">
      <UButton @click="open"> Open Sheet </UButton>

      <ClientOnly>
        <BottomSheet
          ref="bottomSheet"
          :blocking="true"
          :can-swipe-close="false"
          :initial-snap-point="1"
          :expand-on-content-drag="expandOnContentDrag"
          :snap-points="['90%', '50%', 250, instinctHeight]"
          @instinct-height="(n) => (instinctHeight = n)"
        >
          <div class="grid grid-cols-4 gap-2 justify-between mb-3">
            <UButton type="button" @click="snapToPoint(0)">Top</UButton>
            <UButton type="button" @click="snapToPoint(1)">Middle</UButton>
            <UButton type="button" @click="snapToPoint(2)">Bottom</UButton>
            <UButton type="button" @click="snapToPoint(3)">Instinct</UButton>
          </div>
          <UButton
            type="button"
            style="margin-bottom: 1rem"
            @click="expandOnContentDrag = !expandOnContentDrag"
          >
            {{ expandOnContentDrag ? 'Enable' : 'Disable' }} expand on content drag
          </UButton>


          <p v-for="i in 14" :key="i">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iste aperiam, accusamus amet
            veniam officiis libero necessitatibus ipsum, reprehenderit eveniet neque ad delectus
            fugit!
          </p>
          <template #footer>
            <UButton type="button" @click="close">Close bottom sheet</UButton>
          </template>
        </BottomSheet>
      </ClientOnly>
    </UCard>
  </UContainer>
</template>
