<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import BottomSheet from '@opekunov/vue-spring-bottom-sheet'

// --- Demo sheets ---
const sheetDefault = useTemplateRef('sheetDefault')
const sheetMinimal = useTemplateRef('sheetMinimal')
const sheetLargeInset = useTemplateRef('sheetLargeInset')
const sheetHeavySpring = useTemplateRef('sheetHeavySpring')
const sheetSnappySpring = useTemplateRef('sheetSnappySpring')
const sheetLongContent = useTemplateRef('sheetLongContent')
const sheetShortContent = useTemplateRef('sheetShortContent')
const sheetListMenu = useTemplateRef('sheetListMenu')
const sheetForm = useTemplateRef('sheetForm')
const sheetNonBlocking = useTemplateRef('sheetNonBlocking')
const sheetCoverPhoto = useTemplateRef('sheetCoverPhoto')
const sheetCoverGradient = useTemplateRef('sheetCoverGradient')

// --- Interactive playground ---
const sheetPlayground = useTemplateRef('sheetPlayground')
const pgHorizontalInset = ref(16)
const pgBottomInset = ref(16)
const pgCornerRadius = ref(24)
const pgMass = ref(1)
const pgStiffness = ref(200)
const pgDamping = ref(25)

const pgMorphingConfig = computed(() => ({
  compactHorizontalInset: pgHorizontalInset.value,
  compactBottomInset: pgBottomInset.value,
  compactCornerRadius: pgCornerRadius.value,
  expandedCornerRadius: 0,
  fullscreenCornerRadius: 0,
}))

const pgSpringConfig = computed(() => ({
  mass: pgMass.value,
  stiffness: pgStiffness.value,
  damping: pgDamping.value,
}))

const menuActions = [
  { label: 'Share', icon: 'i-lucide-share-2' },
  { label: 'Copy Link', icon: 'i-lucide-link' },
  { label: 'Bookmark', icon: 'i-lucide-bookmark' },
  { label: 'Edit', icon: 'i-lucide-pencil' },
  { label: 'Archive', icon: 'i-lucide-archive' },
  { label: 'Delete', icon: 'i-lucide-trash-2', color: 'error' as const },
]

const demos = [
  {
    title: 'Default Morphing',
    description: 'Standard iOS 26-like morphing with balanced spring.',
    ref: sheetDefault,
  },
  {
    title: 'Minimal Insets',
    description: 'Subtle floating effect with small insets (8px).',
    ref: sheetMinimal,
  },
  {
    title: 'Large Insets',
    description: 'Pronounced floating card with 24px insets and 32px radius.',
    ref: sheetLargeInset,
  },
  {
    title: 'Heavy Spring',
    description: 'Heavier feel: more mass, lower stiffness, more damping.',
    ref: sheetHeavySpring,
  },
  {
    title: 'Snappy Spring',
    description: 'High stiffness, low damping — fast and bouncy.',
    ref: sheetSnappySpring,
  },
  {
    title: 'Long Content',
    description: 'Scrollable content that works across all three states.',
    ref: sheetLongContent,
  },
  {
    title: 'Short Content',
    description: 'Minimal content showing compact-to-expanded morph.',
    ref: sheetShortContent,
  },
  {
    title: 'List / Menu',
    description: 'Action sheet style with morphing.',
    ref: sheetListMenu,
  },
  {
    title: 'Form',
    description: 'Form inputs inside morphing sheet.',
    ref: sheetForm,
  },
  {
    title: 'Non-Blocking',
    description: 'Non-blocking morphing sheet with shadow.',
    ref: sheetNonBlocking,
  },
  {
    title: 'Cover: Photo',
    description: 'Full-bleed background image behind content.',
    ref: sheetCoverPhoto,
  },
  {
    title: 'Cover: Gradient',
    description: 'Decorative gradient background with cover slot.',
    ref: sheetCoverGradient,
  },
]
</script>

<template>
  <UContainer>
    <UPageHeader
      title="Morphing Bottom Sheet"
      description="iOS 26-like adaptive sheet: floating card, edge-to-edge, fullscreen — with spring-based morphing."
      :links="[{ label: 'Back to examples', to: '/', icon: 'i-lucide-arrow-left' }]"
    />

    <!-- Demo Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      <UCard v-for="demo in demos" :key="demo.title">
        <template #header>
          <h3 class="font-semibold text-sm">{{ demo.title }}</h3>
        </template>
        <p class="text-xs text-muted mb-3">{{ demo.description }}</p>
        <UButton size="sm" @click="demo.ref.value?.open()">
          Open
        </UButton>
      </UCard>
    </div>

    <!-- Interactive Playground -->
    <UCard class="mt-8">
      <template #header>
        <h2 class="text-lg font-bold">Interactive Playground</h2>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <h3 class="font-semibold text-sm">Morphing</h3>

          <div>
            <label class="text-xs text-muted block mb-1">
              Horizontal Inset: {{ pgHorizontalInset }}px
            </label>
            <input v-model.number="pgHorizontalInset" type="range" min="0" max="48" step="1" class="w-full" />
          </div>

          <div>
            <label class="text-xs text-muted block mb-1">
              Bottom Inset: {{ pgBottomInset }}px
            </label>
            <input v-model.number="pgBottomInset" type="range" min="0" max="48" step="1" class="w-full" />
          </div>

          <div>
            <label class="text-xs text-muted block mb-1">
              Corner Radius: {{ pgCornerRadius }}px
            </label>
            <input v-model.number="pgCornerRadius" type="range" min="0" max="48" step="1" class="w-full" />
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="font-semibold text-sm">Spring Physics</h3>

          <div>
            <label class="text-xs text-muted block mb-1">
              Mass: {{ pgMass.toFixed(1) }}
            </label>
            <input v-model.number="pgMass" type="range" min="0.1" max="5" step="0.1" class="w-full" />
          </div>

          <div>
            <label class="text-xs text-muted block mb-1">
              Stiffness: {{ pgStiffness }}
            </label>
            <input v-model.number="pgStiffness" type="range" min="50" max="800" step="10" class="w-full" />
          </div>

          <div>
            <label class="text-xs text-muted block mb-1">
              Damping: {{ pgDamping }}
            </label>
            <input v-model.number="pgDamping" type="range" min="5" max="80" step="1" class="w-full" />
          </div>
        </div>
      </div>

      <div class="mt-4 flex items-center gap-3">
        <UButton @click="sheetPlayground?.open()">
          Open Playground Sheet
        </UButton>
        <span class="text-xs text-muted">Adjust sliders, then open to see the effect</span>
      </div>
    </UCard>

    <!-- ============================================ -->
    <!-- ALL SHEETS (rendered once, opened on demand) -->
    <!-- ============================================ -->
    <ClientOnly>
      <!-- 1. Default Morphing -->
      <BottomSheet
        ref="sheetDefault"
        :blocking="true"
        :can-swipe-close="false"
        :expand-on-content-drag="true"
        :snap-points="[200, '50%', '100%']"
        :initial-snap-point="0"
        :morphing="{
          compactHorizontalInset: 16,
          compactBottomInset: 16,
          compactCornerRadius: 24,
        }"
        :spring-config="{ mass: 1, stiffness: 200, damping: 25 }"
      >
        <div class="flex gap-2 mb-4">
          <UButton size="xs" @click="sheetDefault?.snapToPoint(0)">Compact</UButton>
          <UButton size="xs" @click="sheetDefault?.snapToPoint(1)">Expanded</UButton>
          <UButton size="xs" @click="sheetDefault?.snapToPoint(2)">Fullscreen</UButton>
        </div>
        <h2 class="text-lg font-semibold mb-2">Default Morphing</h2>
        <p class="text-muted mb-2">
          This sheet morphs from a floating card to edge-to-edge to fullscreen.
          Drag it to see smooth interpolation of insets, corner radius and height.
        </p>
        <p v-for="i in 8" :key="i" class="text-sm text-muted/70 mb-2">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iste aperiam,
          accusamus amet veniam officiis libero necessitatibus ipsum, reprehenderit
          eveniet neque ad delectus fugit!
        </p>
        <template #footer>
          <UButton variant="outline" color="neutral" block @click="sheetDefault?.close()">Close</UButton>
        </template>
      </BottomSheet>

      <!-- 2. Minimal Insets -->
      <BottomSheet
        ref="sheetMinimal"
        :blocking="true"
        :can-swipe-close="false"
        :expand-on-content-drag="true"
        :snap-points="[180, '45%', '100%']"
        :initial-snap-point="0"
        :morphing="{
          compactHorizontalInset: 8,
          compactBottomInset: 8,
          compactCornerRadius: 12,
        }"
        :spring-config="{ mass: 1, stiffness: 200, damping: 25 }"
      >
        <div class="flex gap-2 mb-4">
          <UButton size="xs" @click="sheetMinimal?.snapToPoint(0)">Compact</UButton>
          <UButton size="xs" @click="sheetMinimal?.snapToPoint(1)">Expanded</UButton>
          <UButton size="xs" @click="sheetMinimal?.snapToPoint(2)">Fullscreen</UButton>
        </div>
        <h2 class="text-lg font-semibold mb-2">Minimal Insets</h2>
        <p class="text-muted">
          Subtle floating effect with just 8px of inset and 12px corner radius.
          Still morphs smoothly to edge-to-edge.
        </p>
        <p v-for="i in 6" :key="i" class="text-sm text-muted/70 mb-2">
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur.
        </p>
        <template #footer>
          <UButton variant="outline" color="neutral" block @click="sheetMinimal?.close()">Close</UButton>
        </template>
      </BottomSheet>

      <!-- 3. Large Insets -->
      <BottomSheet
        ref="sheetLargeInset"
        :blocking="true"
        :can-swipe-close="false"
        :expand-on-content-drag="true"
        :snap-points="[220, '55%', '100%']"
        :initial-snap-point="0"
        :morphing="{
          compactHorizontalInset: 24,
          compactBottomInset: 24,
          compactCornerRadius: 32,
        }"
        :spring-config="{ mass: 1, stiffness: 200, damping: 25 }"
      >
        <div class="flex gap-2 mb-4">
          <UButton size="xs" @click="sheetLargeInset?.snapToPoint(0)">Compact</UButton>
          <UButton size="xs" @click="sheetLargeInset?.snapToPoint(1)">Expanded</UButton>
          <UButton size="xs" @click="sheetLargeInset?.snapToPoint(2)">Fullscreen</UButton>
        </div>
        <h2 class="text-lg font-semibold mb-2">Large Insets</h2>
        <p class="text-muted">
          Pronounced floating card effect with 24px insets and 32px corner radius.
          The morphing transition is more dramatic.
        </p>
        <p v-for="i in 6" :key="i" class="text-sm text-muted/70 mb-2">
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
          doloremque laudantium, totam rem aperiam.
        </p>
        <template #footer>
          <UButton variant="outline" color="neutral" block @click="sheetLargeInset?.close()">Close</UButton>
        </template>
      </BottomSheet>

      <!-- 4. Heavy Spring -->
      <BottomSheet
        ref="sheetHeavySpring"
        :blocking="true"
        :can-swipe-close="false"
        :expand-on-content-drag="true"
        :snap-points="[200, '50%', '100%']"
        :initial-snap-point="0"
        :morphing="{
          compactHorizontalInset: 16,
          compactBottomInset: 16,
          compactCornerRadius: 24,
        }"
        :spring-config="{ mass: 3, stiffness: 120, damping: 35 }"
      >
        <div class="flex gap-2 mb-4">
          <UButton size="xs" @click="sheetHeavySpring?.snapToPoint(0)">Compact</UButton>
          <UButton size="xs" @click="sheetHeavySpring?.snapToPoint(1)">Expanded</UButton>
          <UButton size="xs" @click="sheetHeavySpring?.snapToPoint(2)">Fullscreen</UButton>
        </div>
        <h2 class="text-lg font-semibold mb-2">Heavy Spring</h2>
        <p class="text-muted mb-2">
          Mass: 3, Stiffness: 120, Damping: 35
        </p>
        <p class="text-muted">
          Feels heavy and deliberate. The sheet moves slowly with high inertia,
          like dragging something with real weight.
        </p>
        <p v-for="i in 6" :key="i" class="text-sm text-muted/70 mb-2">
          At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis
          praesentium voluptatum deleniti atque corrupti.
        </p>
        <template #footer>
          <UButton variant="outline" color="neutral" block @click="sheetHeavySpring?.close()">Close</UButton>
        </template>
      </BottomSheet>

      <!-- 5. Snappy Spring -->
      <BottomSheet
        ref="sheetSnappySpring"
        :blocking="true"
        :can-swipe-close="false"
        :expand-on-content-drag="true"
        :snap-points="[200, '50%', '100%']"
        :initial-snap-point="0"
        :morphing="{
          compactHorizontalInset: 16,
          compactBottomInset: 16,
          compactCornerRadius: 24,
        }"
        :spring-config="{ mass: 0.5, stiffness: 600, damping: 18 }"
      >
        <div class="flex gap-2 mb-4">
          <UButton size="xs" @click="sheetSnappySpring?.snapToPoint(0)">Compact</UButton>
          <UButton size="xs" @click="sheetSnappySpring?.snapToPoint(1)">Expanded</UButton>
          <UButton size="xs" @click="sheetSnappySpring?.snapToPoint(2)">Fullscreen</UButton>
        </div>
        <h2 class="text-lg font-semibold mb-2">Snappy Spring</h2>
        <p class="text-muted mb-2">
          Mass: 0.5, Stiffness: 600, Damping: 18
        </p>
        <p class="text-muted">
          Fast and bouncy. Snaps into position quickly with a slight overshoot.
          Try tapping the snap buttons to see the bounce.
        </p>
        <p v-for="i in 6" :key="i" class="text-sm text-muted/70 mb-2">
          Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
          sed quia consequuntur magni dolores eos.
        </p>
        <template #footer>
          <UButton variant="outline" color="neutral" block @click="sheetSnappySpring?.close()">Close</UButton>
        </template>
      </BottomSheet>

      <!-- 6. Long Content -->
      <BottomSheet
        ref="sheetLongContent"
        :blocking="true"
        :can-swipe-close="false"
        :expand-on-content-drag="true"
        :snap-points="[200, '50%', '100%']"
        :initial-snap-point="0"
        :morphing="{
          compactHorizontalInset: 16,
          compactBottomInset: 16,
          compactCornerRadius: 24,
        }"
        :spring-config="{ mass: 1, stiffness: 200, damping: 25 }"
      >
        <div class="flex gap-2 mb-4">
          <UButton size="xs" @click="sheetLongContent?.snapToPoint(0)">Compact</UButton>
          <UButton size="xs" @click="sheetLongContent?.snapToPoint(1)">Expanded</UButton>
          <UButton size="xs" @click="sheetLongContent?.snapToPoint(2)">Fullscreen</UButton>
        </div>
        <h2 class="text-lg font-semibold mb-2">Long Scrollable Content</h2>
        <p class="text-muted mb-3">
          This sheet has lots of content. Scroll behavior is coordinated with
          the sheet drag — you can only scroll when at max height.
        </p>
        <div v-for="i in 25" :key="i" class="mb-3 p-3 bg-muted/20 rounded-lg">
          <p class="text-sm font-medium mb-1">Item {{ i }}</p>
          <p class="text-xs text-muted">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatum
            nesciunt quas ratione {{ i % 3 === 0 ? 'excepturi dignissimos impedit' : 'amet veniam officiis' }}.
          </p>
        </div>
        <template #footer>
          <UButton variant="outline" color="neutral" block @click="sheetLongContent?.close()">Close</UButton>
        </template>
      </BottomSheet>

      <!-- 7. Short Content -->
      <BottomSheet
        ref="sheetShortContent"
        :blocking="true"
        :can-swipe-close="true"
        :expand-on-content-drag="true"
        :snap-points="[120, '40%']"
        :initial-snap-point="0"
        :morphing="{
          compactHorizontalInset: 16,
          compactBottomInset: 16,
          compactCornerRadius: 20,
        }"
        :spring-config="{ mass: 1, stiffness: 200, damping: 25 }"
      >
        <h2 class="text-lg font-semibold mb-2">Quick Note</h2>
        <p class="text-muted text-sm">
          A small sheet with minimal content. Two snap points only: compact and expanded.
          Swipe down to close.
        </p>
      </BottomSheet>

      <!-- 8. List / Menu -->
      <BottomSheet
        ref="sheetListMenu"
        :blocking="true"
        :can-swipe-close="true"
        :expand-on-content-drag="true"
        :snap-points="[320, '60%']"
        :initial-snap-point="0"
        :morphing="{
          compactHorizontalInset: 12,
          compactBottomInset: 12,
          compactCornerRadius: 20,
        }"
        :spring-config="{ mass: 0.8, stiffness: 250, damping: 22 }"
      >
        <template #header>
          <h3 class="font-semibold text-base m-0">Actions</h3>
        </template>
        <div class="flex flex-col -mx-4">
          <button
            v-for="action in menuActions"
            :key="action.label"
            type="button"
            class="w-full px-5 py-4 text-left border-b border-default hover:bg-muted/50 transition-colors flex items-center gap-3"
            :class="action.color === 'error' ? 'text-red-500' : ''"
            @click="sheetListMenu?.close()"
          >
            <UIcon :name="action.icon" class="w-5 h-5 shrink-0" />
            <span class="text-sm">{{ action.label }}</span>
          </button>
        </div>
        <template #footer>
          <UButton variant="outline" color="neutral" block @click="sheetListMenu?.close()">Cancel</UButton>
        </template>
      </BottomSheet>

      <!-- 9. Form -->
      <BottomSheet
        ref="sheetForm"
        :blocking="true"
        :can-swipe-close="false"
        :expand-on-content-drag="true"
        :snap-points="[300, '65%', '100%']"
        :initial-snap-point="0"
        :morphing="{
          compactHorizontalInset: 16,
          compactBottomInset: 16,
          compactCornerRadius: 24,
        }"
        :spring-config="{ mass: 1, stiffness: 200, damping: 25 }"
      >
        <template #header>
          <h3 class="font-semibold text-base m-0">New Contact</h3>
        </template>
        <form class="space-y-4" @submit.prevent>
          <div>
            <label class="block text-sm font-medium mb-1">First Name</label>
            <input
              type="text"
              placeholder="John"
              class="w-full rounded-lg border border-default bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Last Name</label>
            <input
              type="text"
              placeholder="Doe"
              class="w-full rounded-lg border border-default bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="john@example.com"
              class="w-full rounded-lg border border-default bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              class="w-full rounded-lg border border-default bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Notes</label>
            <textarea
              placeholder="Add notes..."
              rows="3"
              class="w-full rounded-lg border border-default bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </form>
        <template #footer>
          <div class="flex gap-2">
            <UButton variant="outline" color="neutral" class="flex-1" @click="sheetForm?.close()">Cancel</UButton>
            <UButton class="flex-1" @click="sheetForm?.close()">Save</UButton>
          </div>
        </template>
      </BottomSheet>

      <!-- 10. Non-Blocking -->
      <BottomSheet
        ref="sheetNonBlocking"
        :blocking="false"
        :can-swipe-close="true"
        :expand-on-content-drag="true"
        :snap-points="[180, '45%', '100%']"
        :initial-snap-point="0"
        :morphing="{
          compactHorizontalInset: 16,
          compactBottomInset: 16,
          compactCornerRadius: 24,
        }"
        :spring-config="{ mass: 1, stiffness: 200, damping: 25 }"
      >
        <div class="flex gap-2 mb-4">
          <UButton size="xs" @click="sheetNonBlocking?.snapToPoint(0)">Compact</UButton>
          <UButton size="xs" @click="sheetNonBlocking?.snapToPoint(1)">Expanded</UButton>
          <UButton size="xs" @click="sheetNonBlocking?.snapToPoint(2)">Fullscreen</UButton>
        </div>
        <h2 class="text-lg font-semibold mb-2">Non-Blocking</h2>
        <p class="text-muted text-sm mb-2">
          This sheet doesn't block interaction with the page behind it.
          You can scroll the page and interact with other elements.
        </p>
        <p class="text-muted text-sm">
          Swipe down to dismiss. Notice the shadow instead of backdrop overlay.
        </p>
      </BottomSheet>

      <!-- 11. Cover: Photo -->
      <BottomSheet
        ref="sheetCoverPhoto"
        :blocking="true"
        :can-swipe-close="false"
        :expand-on-content-drag="true"
        :snap-points="[280, '55%', '100%']"
        :initial-snap-point="0"
        :morphing="{
          compactHorizontalInset: 16,
          compactBottomInset: 16,
          compactCornerRadius: 24,
        }"
        :spring-config="{ mass: 1, stiffness: 200, damping: 25 }"
      >
        <template #cover>
          <div
            style="
              width: 100%;
              height: 100%;
              background: url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80')
                center / cover no-repeat;
            "
          />
          <div
            style="
              position: absolute;
              inset: 0;
              background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 60%);
            "
          />
        </template>
        <template #header>
          <h3 class="font-bold text-white text-lg m-0 mt-2">Mountain View</h3>
        </template>
        <div class="flex gap-2 mb-4">
          <UButton size="xs" @click="sheetCoverPhoto?.snapToPoint(0)">Compact</UButton>
          <UButton size="xs" @click="sheetCoverPhoto?.snapToPoint(1)">Expanded</UButton>
          <UButton size="xs" @click="sheetCoverPhoto?.snapToPoint(2)">Fullscreen</UButton>
        </div>
        <p class="text-muted text-sm mb-2">
          A full-bleed background photo using the cover slot.
          The image fills the entire sheet and morphs with the container.
        </p>
        <p class="text-muted text-sm mb-2">
          Header, content and footer are layered above the cover image.
          The gradient overlay ensures text readability.
        </p>
        <p v-for="i in 6" :key="i" class="text-sm text-muted/70 mb-2">
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem
          accusantium doloremque laudantium.
        </p>
        <template #footer>
          <UButton variant="outline" color="neutral" block @click="sheetCoverPhoto?.close()">Close</UButton>
        </template>
      </BottomSheet>

      <!-- 12. Cover: Gradient -->
      <BottomSheet
        ref="sheetCoverGradient"
        :blocking="true"
        :can-swipe-close="true"
        :expand-on-content-drag="true"
        :snap-points="[220, '50%', '100%']"
        :initial-snap-point="0"
        :morphing="{
          compactHorizontalInset: 16,
          compactBottomInset: 16,
          compactCornerRadius: 24,
        }"
        :spring-config="{ mass: 1, stiffness: 200, damping: 25 }"
      >
        <template #cover>
          <div
            style="
              width: 100%;
              height: 100%;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            "
          />
        </template>
        <template #header>
          <h3 class="font-bold text-white text-lg m-0 mt-2">Gradient Cover</h3>
        </template>
        <div class="flex gap-2 mb-4">
          <UButton size="xs" @click="sheetCoverGradient?.snapToPoint(0)">Compact</UButton>
          <UButton size="xs" @click="sheetCoverGradient?.snapToPoint(1)">Expanded</UButton>
          <UButton size="xs" @click="sheetCoverGradient?.snapToPoint(2)">Fullscreen</UButton>
        </div>
        <p class="text-white/80 text-sm mb-2">
          A decorative gradient as the sheet background using the cover slot.
          All content is layered on top with full readability.
        </p>
        <p v-for="i in 4" :key="i" class="text-sm text-white/60 mb-2">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          Pariatur ab recusandae quis nesciunt dolores.
        </p>
        <template #footer>
          <UButton variant="outline" color="neutral" block @click="sheetCoverGradient?.close()">Close</UButton>
        </template>
      </BottomSheet>

      <!-- Playground Sheet -->
      <BottomSheet
        ref="sheetPlayground"
        :blocking="true"
        :can-swipe-close="false"
        :expand-on-content-drag="true"
        :snap-points="[200, '50%', '100%']"
        :initial-snap-point="0"
        :morphing="pgMorphingConfig"
        :spring-config="pgSpringConfig"
      >
        <div class="flex gap-2 mb-4">
          <UButton size="xs" @click="sheetPlayground?.snapToPoint(0)">Compact</UButton>
          <UButton size="xs" @click="sheetPlayground?.snapToPoint(1)">Expanded</UButton>
          <UButton size="xs" @click="sheetPlayground?.snapToPoint(2)">Fullscreen</UButton>
        </div>
        <h2 class="text-lg font-semibold mb-2">Playground Sheet</h2>
        <div class="bg-muted/20 rounded-lg p-3 mb-3">
          <p class="text-xs font-mono text-muted">
            Inset: {{ pgHorizontalInset }}px | Bottom: {{ pgBottomInset }}px | Radius: {{ pgCornerRadius }}px
          </p>
          <p class="text-xs font-mono text-muted">
            Mass: {{ pgMass }} | Stiffness: {{ pgStiffness }} | Damping: {{ pgDamping }}
          </p>
        </div>
        <p class="text-muted text-sm mb-2">
          This sheet uses the playground sliders above. Close it, adjust the values,
          and reopen to see the difference.
        </p>
        <p v-for="i in 10" :key="i" class="text-sm text-muted/70 mb-2">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Pariatur ab
          recusandae quis nesciunt dolores.
        </p>
        <template #footer>
          <UButton variant="outline" color="neutral" block @click="sheetPlayground?.close()">Close</UButton>
        </template>
      </BottomSheet>
    </ClientOnly>
  </UContainer>
</template>
