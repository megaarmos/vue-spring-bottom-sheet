<script setup lang="ts">
import { examples } from '~/utils/examples'
</script>

<template>
  <div>
    <UPageHero
      title="Vue Spring Bottom Sheet Examples"
      description="Explore various usage examples of the Vue Spring Bottom Sheet component. Click any example to see it in action."
    />

    <UPageSection
      id="examples"
      title="Examples"
      description="Interactive demos you can try out."
    >
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="example in examples"
          :key="example.slug"
          :to="`/${example.slug}`"
          class="block"
        >
          <UCard
            class="h-full transition-opacity hover:opacity-90"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="font-semibold">
                  {{ example.title }}
                </h3>
                <UIcon
                  name="i-lucide-arrow-right"
                  class="w-4 h-4 text-muted shrink-0"
                />
              </div>
            </template>
            <p class="text-sm text-muted">
              {{ example.description }}
            </p>
          </UCard>
        </NuxtLink>
      </div>
    </UPageSection>
  </div>
</template>
