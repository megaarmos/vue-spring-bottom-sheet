<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import BottomSheet from '@opekunov/vue-spring-bottom-sheet'

const bottomSheet = useTemplateRef<InstanceType<typeof BottomSheet>>('bottomSheet')

const formData = ref({
  name: '',
  email: '',
  message: '',
})

const submitForm = () => {
  console.log('Form submitted:', formData.value)
  bottomSheet.value?.close()
  formData.value = { name: '', email: '', message: '' }
}

const open = () => bottomSheet.value?.open()
</script>

<template>
  <UContainer>
    <UPageHeader
      title="Form Example"
      description="A sheet containing a complete form."
      :links="[{ label: 'Back to examples', to: '/', icon: 'i-lucide-arrow-left' }]"
    />

    <UCard class="mt-6">
      <UButton @click="open"> Contact Us </UButton>

      <ClientOnly>
        <BottomSheet ref="bottomSheet" :snap-points="['90%']">
          <template #header>
            <h3 class="font-semibold text-lg m-0">Contact Form</h3>
          </template>

          <form class="space-y-4" @submit.prevent="submitForm">
            <UFormField label="Name" required>
              <UInput v-model="formData.name" type="text" required />
            </UFormField>

            <UFormField label="Email" required>
              <UInput v-model="formData.email" type="email" required />
            </UFormField>

            <UFormField label="Message" required>
              <UTextarea v-model="formData.message" required :rows="4" />
            </UFormField>

            <UButton type="submit" block> Send Message </UButton>
          </form>
        </BottomSheet>
      </ClientOnly>
    </UCard>
  </UContainer>
</template>
