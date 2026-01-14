<script setup lang="ts">
import type { BottomSheetProps } from './types'

import { computed, nextTick, onUnmounted, ref, shallowRef, toRefs, watch, onMounted } from 'vue'
import { useElementBounding, useVModel, useWindowSize } from '@vueuse/core'
import { useSnapPoints } from './composables/useSnapPoints'
import { useDragGestures } from './composables/useDragGestures'
import { useSheetScrollLock } from './composables/useSheetScrollLock'
import { useFocusManagement } from './composables/useFocusManagement'
import { clamp, funnel } from 'remeda'
import { resolveSnapPoint } from './utils/resolveSnapPoint'

const props = withDefaults(defineProps<BottomSheetProps>(), {
  blocking: true,
  canSwipeClose: true,
  canBackdropClose: true,
  expandOnContentDrag: true,
  duration: 250,
  teleportTo: 'body',
  teleportDefer: false,
})

const emit = defineEmits<{
  (e: 'opened'): void
  (e: 'opening-started'): void
  (e: 'closed'): void
  (e: 'closing-started'): void
  (e: 'ready'): void
  (e: 'dragging-up'): void
  (e: 'dragging-down'): void
  (e: 'snapped', snapPointIndex?: number): void
  (e: 'instinctHeight', instinctHeight: number): void
  (e: 'update:modelValue'): void
}>()

const showSheet = useVModel(props, 'modelValue', emit, {
  passive: true,
})

watch(showSheet, (value) => {
  if (value) {
    open()
  }
})

onMounted(() => {
  if (showSheet.value) {
    open()
  }
})

const sheet = shallowRef<HTMLElement | null>(null)
const sheetHeader = shallowRef<HTMLElement | null>(null)
const sheetFooter = shallowRef<HTMLElement | null>(null)
const sheetScroll = shallowRef<HTMLElement | null>(null)
const sheetContent = shallowRef<HTMLElement | null>(null)
const backdrop = shallowRef<HTMLElement | null>(null)

const { height: windowHeight } = useWindowSize()
const { height: sheetHeight } = useElementBounding(sheet)
const { height: sheetHeaderHeight } = useElementBounding(sheetHeader)
const { height: sheetContentHeight } = useElementBounding(sheetContent)
const { height: sheetFooterHeight } = useElementBounding(sheetFooter)

const instinctHeight = computed(() => {
  return clamp(
    Math.ceil(sheetContentHeight.value + sheetHeaderHeight.value + sheetFooterHeight.value),
    { max: windowHeight.value },
  )
})

const setInstinctHeights = (header: number, content: number, footer: number) => {
  sheetHeaderHeight.value = header
  sheetContentHeight.value = content
  sheetFooterHeight.value = footer
}

const height = ref(0)
const translateY = ref(0)
const durationCss = computed(() => props.duration + 'ms')

const { snapPoints: propSnapPoints } = toRefs(props)
const snapPointsRef = computed(() => propSnapPoints.value ?? [instinctHeight.value])
const {
  flattenedSnapPoints,
  currentSnapPointIndex,
  closestSnapPointIndex,
  minSnapPoint,
  maxSnapPoint,
} = useSnapPoints(snapPointsRef, height, windowHeight)

const blockingRef = computed(() => props.blocking)
const canSwipeCloseRef = computed(() => props.canSwipeClose)
const swipeCloseThresholdRef = computed(() => props.swipeCloseThreshold)
const expandOnContentDragRef = computed(() => props.expandOnContentDrag)
const scrollLock = useSheetScrollLock({ blocking: blockingRef })

const focusManagement = useFocusManagement({
  sheetRef: sheet,
  backdropRef: backdrop,
  blocking: blockingRef,
  onEscape: () => close(),
})

const { isDragging, headerFooterHandlers, contentWrapperHandlers, scrollEnd } = useDragGestures({
  sheetRef: sheet,
  sheetScrollRef: sheetScroll,
  height,
  translateY,
  sheetHeight,
  windowHeight,
  snapPointsRef,
  flattenedSnapPoints,
  currentSnapPointIndex,
  closestSnapPointIndex,
  minSnapPoint,
  maxSnapPoint,
  canSwipeClose: canSwipeCloseRef,
  swipeCloseThreshold: swipeCloseThresholdRef,
  expandOnContentDrag: expandOnContentDragRef,
  onClose: () => close(),
  onSnapped: (index) => emit('snapped', index),
  onDraggingUp: () => emit('dragging-up'),
  onDraggingDown: () => emit('dragging-down'),
})

const isOpening = ref(false)
const isClosing = ref(false)

const backdropClick = () => {
  if (props.canBackdropClose) close()
}

const open = async () => {
  if (isOpening.value) return

  showSheet.value = true
  isOpening.value = true
  emit('opening-started')

  scrollLock.lockIfBlocking()

  await nextTick()

  const sheetElement = sheet.value as HTMLElement
  sheetHeight.value = sheetElement.getBoundingClientRect().height

  const sheetContentElement = sheetElement.querySelector('[data-vsbs-content]') as HTMLElement
  const sheetHeaderElement = sheetElement.querySelector('[data-vsbs-header]') as HTMLElement
  const sheetFooterElement = sheetElement.querySelector('[data-vsbs-footer]') as HTMLElement

  setInstinctHeights(
    sheetHeaderElement.getBoundingClientRect().height,
    sheetContentElement.getBoundingClientRect().height,
    sheetFooterElement.getBoundingClientRect().height,
  )

  await nextTick()

  currentSnapPointIndex.value = flattenedSnapPoints.value.findIndex(
    (point) => point === minSnapPoint.value,
  )

  if (props.initialSnapPoint !== undefined) {
    const index = props.initialSnapPoint

    if (index < 0 || index >= snapPointsRef.value.length) {
      console.warn('Index out of bounds')
      return
    }

    const snapValue = snapPointsRef.value[index]
    if (!snapValue) return

    height.value = resolveSnapPoint(snapValue, windowHeight.value)
  } else {
    height.value = clamp(minSnapPoint.value, { max: windowHeight.value })
  }

  translateY.value = height.value

  requestAnimationFrame(() => {
    translateY.value = 0

    if (props.blocking) {
      setTimeout(() => {
        if (showSheet.value) {
          emit('opened')
          focusManagement.activate()
        }
      }, props.duration)
    }
  })

  isOpening.value = false
}

const close = () => {
  if (isClosing.value) return

  showSheet.value = false
  isClosing.value = true
  emit('closing-started')

  scrollLock.unlockIfBlocking()
  focusManagement.deactivate()

  translateY.value = height.value

  setTimeout(() => {
    emit('closed')
    isClosing.value = false
  }, props.duration)
}

const snapToPoint = (index: number) => {
  if (!snapPointsRef.value) return

  if (index < 0 || index >= snapPointsRef.value.length) {
    console.warn('Index out of bounds')
    return
  }

  currentSnapPointIndex.value = index

  const snapValue = snapPointsRef.value[index]
  if (!snapValue) return

  height.value = resolveSnapPoint(snapValue, windowHeight.value)
  emit('snapped', snapPointsRef.value.indexOf(snapValue))
}

const debouncedSnapToPoint = funnel((index) => snapToPoint(index), {
  minQuietPeriodMs: props.duration,
  reducer: (_prev: number | undefined, index: number) => index,
})

watch(snapPointsRef, (value, oldValue) => {
  if (showSheet.value === false) return

  if (!value) return
  if (!oldValue) return

  const currentSnapPoint = value[currentSnapPointIndex.value]
  const previousSnapPoint = oldValue[currentSnapPointIndex.value]

  if (!currentSnapPoint || typeof currentSnapPoint === 'string') return
  if (!previousSnapPoint || typeof previousSnapPoint === 'string') return

  height.value = clamp(currentSnapPoint, { max: windowHeight.value })
})

watch(windowHeight, () => {
  debouncedSnapToPoint.call(currentSnapPointIndex.value)
})

watch(instinctHeight, (value) => {
  emit('instinctHeight', value)
})

onUnmounted(() => {
  focusManagement.cleanup()
})

const onLeave = (el: Element) => {
  const element = el as HTMLElement
  element.style.transition = `transform ${props.duration}ms ease, height ${props.duration}ms ease`
  element.style.transform = `translateY(${height.value}px)`
}

defineExpose({ open, close, snapToPoint })
</script>

<template>
  <Teleport :to="teleportTo" :defer="teleportDefer">
    <Transition name="vsbs-backdrop">
      <div
        v-if="showSheet && blocking"
        ref="backdrop"
        data-vsbs-backdrop
        @click="backdropClick()"
      />
    </Transition>
  </Teleport>

  <Teleport :to="teleportTo" :defer="teleportDefer">
    <Transition name="vsbs-sheet" @leave="onLeave">
      <div
        v-if="showSheet"
        ref="sheet"
        :style="{
          transform: `translateY(${translateY}px)`,
          height: `${height}px`,
          transition: isDragging
            ? 'none'
            : `transform ${duration}ms ease, height ${duration}ms ease`,
        }"
        :data-vsbs-shadow="!blocking"
        :data-vsbs-sheet-show="showSheet"
        aria-modal="true"
        data-vsbs-sheet
        tabindex="-1"
        @touchstart="scrollLock.touchStartHandler"
        @touchend="scrollLock.touchEndHandler"
      >
        <div
          ref="sheetHeader"
          data-vsbs-header
          v-bind="headerFooterHandlers"
          :class="headerClass"
          style="touch-action: none"
        >
          <slot name="header" />
        </div>
        <div ref="sheetScroll" data-vsbs-scroll @scrollend="scrollEnd">
          <div
            data-vsbs-content-wrapper
            v-bind="contentWrapperHandlers"
            :style="{ touchAction: 'pan-y' }"
          >
            <div ref="sheetContent" data-vsbs-content :class="contentClass">
              <slot />
            </div>
          </div>
        </div>
        <div
          ref="sheetFooter"
          data-vsbs-footer
          v-bind="headerFooterHandlers"
          :class="footerClass"
          style="touch-action: none"
        >
          <slot name="footer" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
[data-vsbs-backdrop] {
  background-color: var(--vsbs-backdrop-bg, rgba(0, 0, 0, 0.5));
  inset: 0;
  pointer-events: auto;
  position: fixed;
  user-select: none;
  will-change: opacity;

  --vsbs-duration: v-bind(durationCss);
}

[data-vsbs-shadow='true']::before {
  content: '';
  z-index: -1;
  position: absolute;
  top: 0;
  height: 100lvh;
  width: 100%;
  border-radius: var(--vsbs-border-radius, 16px);
  box-shadow: 0 -5px 60px 0 var(--vsbs-shadow-color, rgba(89, 89, 89, 0.2));
}

[data-vsbs-sheet] {
  background-color: var(--vsbs-background, #fff);
  border-top-left-radius: var(--vsbs-border-radius, 16px);
  border-top-right-radius: var(--vsbs-border-radius, 16px);

  border-right: 1px solid var(--vsbs-outer-border-color, transparent);
  border-left: 1px solid var(--vsbs-outer-border-color, transparent);

  bottom: 0;
  display: flex;
  flex-direction: column;
  left: 0;
  margin-left: auto;
  margin-right: auto;
  max-width: var(--vsbs-max-width, 640px);
  pointer-events: all;
  position: fixed;
  right: 0;
  width: 100%;
  will-change: height, transform;
}

[data-vsbs-sheet-show='true'] {
  visibility: visible;
}

[data-vsbs-header] {
  box-shadow: 0 1px 0 var(--vsbs-border-color, rgba(46, 59, 66, 0.125));
  flex-shrink: 0;
  padding: 20px var(--vsbs-padding-x, 16px) 8px;
  user-select: none;
  z-index: 3;

  border-top-left-radius: var(--vsbs-border-radius, 16px);
  border-top-right-radius: var(--vsbs-border-radius, 16px);

  border-top: 1px solid var(--vsbs-outer-border-color, transparent);
}

[data-vsbs-header]:before {
  background-color: var(--vsbs-handle-background, rgba(0, 0, 0, 0.28));
  border-radius: 2px;
  content: '';
  display: block;
  height: 4px;
  left: 50%;
  position: absolute;
  top: 8px;
  transform: translateX(-50%);
  width: 36px;
}

[data-vsbs-header]:empty {
  box-shadow: none;
  padding: 14px var(--vsbs-padding-x, 16px) 10px;
}

[data-vsbs-footer] {
  box-shadow: 0 -1px 0 var(--vsbs-border-color, rgba(46, 59, 66, 0.125));
  flex-grow: 0;
  flex-shrink: 0;
  padding: 16px var(--vsbs-padding-x, 16px);
  user-select: none;
}

[data-vsbs-footer]:empty {
  display: none;
}

[data-vsbs-scroll] {
  flex-grow: 1;
  overflow-y: auto;
  overscroll-behavior: none;
}

[data-vsbs-content-wrapper] {
  height: 100%;
}

[data-vsbs-content] {
  display: grid;
  padding: 8px var(--vsbs-padding-x, 16px);
  user-select: none;
}

.vsbs-backdrop-enter-active,
.vsbs-backdrop-leave-active {
  transition: opacity var(--vsbs-duration) ease;
}

.vsbs-backdrop-enter-from,
.vsbs-backdrop-leave-to {
  opacity: 0;
}
</style>
