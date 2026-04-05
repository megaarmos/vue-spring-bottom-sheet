<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import BottomSheet from '@opekunov/vue-spring-bottom-sheet'

const bottomSheet = useTemplateRef<InstanceType<typeof BottomSheet>>('bottomSheet')
const selectedImage = ref<{ id: number; src: string; title: string } | null>(null)

const images = [
  { id: 1, src: 'https://picsum.photos/seed/1/800/600', title: 'Image 1' },
  { id: 2, src: 'https://picsum.photos/seed/2/800/600', title: 'Image 2' },
  { id: 3, src: 'https://picsum.photos/seed/3/800/600', title: 'Image 3' },
]

const openImage = (image: (typeof images)[number]) => {
  selectedImage.value = image
  bottomSheet.value?.open()
}
</script>

<template>
  <UContainer>
    <UPageHeader
      title="Image Gallery Example"
      description="Display images in a bottom sheet."
      :links="[{ label: 'Back to examples', to: '/', icon: 'i-lucide-arrow-left' }]"
    />

    <UCard class="mt-6">
      <div class="flex gap-4 flex-wrap">
        <img
          v-for="image in images"
          :key="image.id"
          :src="image.src"
          :alt="image.title"
          class="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          @click="openImage(image)"
        />
      </div>

      <ClientOnly>
        <BottomSheet ref="bottomSheet" :snap-points="['80%']">
          <template #header>
            <h3 class="font-semibold text-lg m-0">
              {{ selectedImage?.title }}
            </h3>
          </template>

          <div v-if="selectedImage" class="space-y-4">
            <img
              :src="selectedImage.src"
              :alt="selectedImage.title"
              class="w-full h-auto rounded-lg"
            />
            <p class="text-muted text-sm">Click the image or swipe down to close.</p>
          </div>
        </BottomSheet>
      </ClientOnly>
    </UCard>
  </UContainer>
</template>
