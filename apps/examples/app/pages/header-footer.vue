<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import BottomSheet from '@douxcode/vue-spring-bottom-sheet'

const bottomSheet = useTemplateRef<InstanceType<typeof BottomSheet>>('bottomSheet')
const email = ref('')
const open = () => bottomSheet.value?.open()
const close = () => bottomSheet.value?.close()
</script>

<template>
  <UContainer>
    <UPageHeader
      title="With Header and Footer"
      description="Using slots for complete layout control."
      :links="[{ label: 'Back to examples', to: '/', icon: 'i-lucide-arrow-left' }]"
    />

    <UCard class="mt-6">
      <UButton @click="open"> Subscribe </UButton>

      <ClientOnly>
        <BottomSheet ref="bottomSheet">
          <template #header>
            <h3 class="font-semibold text-lg m-0">Newsletter</h3>
          </template>

          <div class="space-y-4">
            <p>Subscribe to our newsletter for updates!</p>
            <UInput v-model="email" type="email" placeholder="Enter your email" class="w-full" />
          </div>

          <template #footer>
            <div class="flex gap-4">
              <UButton variant="outline" color="neutral" block @click="close"> Cancel </UButton>
              <UButton block @click="close"> Subscribe </UButton>
            </div>
          </template>
        </BottomSheet>
      </ClientOnly>
    </UCard>
  </UContainer>
</template>
