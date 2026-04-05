<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import BottomSheet from '@opekunov/vue-spring-bottom-sheet'

const bottomSheet = useTemplateRef<InstanceType<typeof BottomSheet>>('bottomSheet')
const open = ref(false)

const toggle = () => {
  open.value = !open.value

  if (open.value) {
    bottomSheet.value?.open()
  } else {
    bottomSheet.value?.close()
  }
}

const snapToPoint = (index: number) => {
  bottomSheet.value?.snapToPoint(index)
}
</script>

<template>
  <UContainer>
    <UPageHeader
      title="Event Handling Example"
      description="Demonstrating all lifecycle events."
      :links="[{ label: 'Back to examples', to: '/', icon: 'i-lucide-arrow-left' }]"
    />

    <UCard class="mt-6">
      <UButton class="mb-6" @click="toggle"> Open Sheet </UButton>

      <ClientOnly>
        <BottomSheet
          ref="bottomSheet"
          :blocking="false"
          :snap-points="['25%', '60%']"
          @closed="open = false"
          @vue:mounted="toggle()"
        >
          <template #header>
            <UInput type="text" placeholder="Search..." class="w-full" />
          </template>
          <div class="button-group">
            <UButton type="button" @click="snapToPoint(1)">Top</UButton>
            <UButton type="button" @click="snapToPoint(0)">Bottom</UButton>
          </div>
          <p v-for="i in 3" class="mb-4" :key="i">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iste aperiam, accusamus amet
            veniam officiis libero necessitatibus ipsum, reprehenderit eveniet neque ad delectus
            fugit!
          </p>
        </BottomSheet>
      </ClientOnly>
    </UCard>
  </UContainer>
</template>
