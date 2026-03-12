<script setup lang="ts">
import { useTemplateRef } from 'vue'
import BottomSheet from '@douxcode/vue-spring-bottom-sheet'

const bottomSheet = useTemplateRef<InstanceType<typeof BottomSheet>>('bottomSheet')

const actions = [
  { label: 'Share', icon: '🔗' },
  { label: 'Edit', icon: '✏️' },
  { label: 'Delete', icon: '🗑️', danger: true },
]

const handleAction = (action: (typeof actions)[number]) => {
  console.log('Selected:', action.label)
  bottomSheet.value?.close()
}

const open = () => bottomSheet.value?.open()
const close = () => bottomSheet.value?.close()
</script>

<template>
  <UContainer>
    <UPageHeader
      title="List/Menu Example"
      description="Perfect for action sheets and menus."
      :links="[{ label: 'Back to examples', to: '/', icon: 'i-lucide-arrow-left' }]"
    />

    <UCard class="mt-6">
      <UButton @click="open"> Show Actions </UButton>

      <ClientOnly>
        <BottomSheet ref="bottomSheet">
          <template #header>
            <h3 class="font-semibold text-lg m-0">Actions</h3>
          </template>

          <div class="flex flex-col">
            <button
              v-for="action in actions"
              :key="action.label"
              type="button"
              class="w-full px-4 py-4 text-left border-b border-default hover:bg-muted/50 transition-colors flex items-center gap-2"
              :class="{ 'text-danger': action.danger }"
              @click="handleAction(action)"
            >
              <span>{{ action.icon }}</span>
              {{ action.label }}
            </button>
          </div>

          <template #footer>
            <div class="p-4">
              <UButton variant="outline" color="neutral" block @click="close"> Cancel </UButton>
            </div>
          </template>
        </BottomSheet>
      </ClientOnly>
    </UCard>
  </UContainer>
</template>
