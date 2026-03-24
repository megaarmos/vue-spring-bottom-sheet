<script setup lang="ts">
import type { BottomSheetProps } from './types'

import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, toRef, watch } from 'vue'
import { useElementBounding, useVModel, useWindowSize } from '@vueuse/core'
import { clamp, funnel } from 'remeda'
import { useDragGestures } from './composables/useDragGestures'
import { useFocusManagement } from './composables/useFocusManagement'
import { useSheetScrollLock } from './composables/useSheetScrollLock'
import { useSnapPoints } from './composables/useSnapPoints'
import { resolveSnapPoint } from './utils/resolveSnapPoint'

const props = withDefaults(defineProps<BottomSheetProps>(), {
  blocking: true,
  canSwipeClose: true,
  canBackdropClose: true,
  expandOnContentDrag: true,
  duration: 250,
  teleportTo: 'body',
  teleportDefer: false,
  forceMount: false,
})

const emit = defineEmits<{
  opened: []
  'opening-started': []
  closed: []
  'closing-started': []
  'dragging-up': []
  'dragging-down': []
  snapped: [snapPointIndex?: number]
  instinctHeight: [instinctHeight: number]
  'update:modelValue': []
}>()

const showSheet = useVModel(props, 'modelValue', emit, {
  passive: true,
})

// ── Template refs ─────────────────────────────────────────────────────────────

const sheet = shallowRef<HTMLElement | null>(null)
const sheetHeader = shallowRef<HTMLElement | null>(null)
const sheetFooter = shallowRef<HTMLElement | null>(null)
const sheetScroll = shallowRef<HTMLElement | null>(null)
const sheetContent = shallowRef<HTMLElement | null>(null)
const backdrop = shallowRef<HTMLElement | null>(null)
const keyboardInsetBottom = ref(0)

// ── Dimensions ────────────────────────────────────────────────────────────────

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

// ── Sheet geometry ────────────────────────────────────────────────────────────

const height = ref(0)
const translateY = ref(0)
const renderedSheetHeight = computed(() => {
  return clamp(height.value + keyboardInsetBottom.value, {
    max: windowHeight.value,
  })
})
const durationCss = computed(() => props.duration + 'ms')

// ── Snap points ───────────────────────────────────────────────────────────────

const propSnapPoints = toRef(() => props.snapPoints)
const snapPointsRef = computed(() => propSnapPoints.value ?? [instinctHeight.value])
const {
  flattenedSnapPoints,
  currentSnapPointIndex,
  closestSnapPointIndex,
  minSnapPoint,
  maxSnapPoint,
} = useSnapPoints(snapPointsRef, height, windowHeight)

const blockingRef = toRef(() => props.blocking)
const canSwipeCloseRef = toRef(() => props.canSwipeClose)
const swipeCloseThresholdRef = toRef(() => props.swipeCloseThreshold)
const expandOnContentDragRef = toRef(() => props.expandOnContentDrag)
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

// ── State flags ───────────────────────────────────────────────────────────────

const isOpening = shallowRef(false)
const isClosing = shallowRef(false)

// ── Centralized handlers ──────────────────────────────────────────────────────

/**
 * Activate or deactivate the focus trap based on intent and current state.
 * - Activates focus trap + escape-key listener when shouldActivate=true, the sheet
 *   is visible, and blocking=true (useFocusManagement enforces the blocking check).
 * - Deactivates and tears down listeners when shouldActivate=false.
 */
const handleFocusTrap = (shouldActivate: boolean): void => {
  if (shouldActivate && showSheet.value) {
    focusManagement.activate()
  } else {
    focusManagement.deactivate()
  }
}

/**
 * Lock or unlock body scroll based on intent and current state.
 * - Locks when shouldLock=true, the sheet is visible, AND blocking=true.
 * - Unlocks unconditionally otherwise (unlock is idempotent when already unlocked).
 */
const handleScrollLock = (shouldLock: boolean): void => {
  if (shouldLock && showSheet.value && props.blocking) {
    scrollLock.lock()
  } else {
    scrollLock.unlock()
  }
}

// ── Open / Close ──────────────────────────────────────────────────────────────

const backdropClick = () => {
  if (props.canBackdropClose) close()
}

const updateKeyboardInset = () => {
  const viewport = window.visualViewport
  if (!viewport || !showSheet.value) {
    keyboardInsetBottom.value = 0
    return
  }

  const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
  keyboardInsetBottom.value = Math.round(inset)
}

let cleanupKeyboardAvoidance: (() => void) | null = null
const setupKeyboardAvoidance = () => {
  const viewport = window.visualViewport
  if (!viewport) return

  viewport.addEventListener('resize', updateKeyboardInset)
  viewport.addEventListener('scroll', updateKeyboardInset)
  window.addEventListener('resize', updateKeyboardInset)

  cleanupKeyboardAvoidance = () => {
    viewport.removeEventListener('resize', updateKeyboardInset)
    viewport.removeEventListener('scroll', updateKeyboardInset)
    window.removeEventListener('resize', updateKeyboardInset)
  }
}

const open = async () => {
  if (isOpening.value) return

  showSheet.value = true
  isOpening.value = true
  emit('opening-started')

  handleScrollLock(true)

  await nextTick()
  updateKeyboardInset()

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
          handleFocusTrap(true)
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

  handleScrollLock(false)
  handleFocusTrap(false)

  translateY.value = height.value

  setTimeout(() => {
    emit('closed')
    isClosing.value = false
  }, props.duration)
}

// ── Snap-point helpers ────────────────────────────────────────────────────────

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

const {
  isDragging,
  handleSheetScroll,
  handlePointerDown,
  handleContentPointerDown,
  handlePointerMove,
  handleContentPointerMove,
  handleLostPointerCapture,
  handleTouchStart,
} = useDragGestures({
  sheetHeaderRef: sheetHeader,
  sheetFooterRef: sheetFooter,
  sheetContentRef: sheetContent,
  sheetScrollRef: sheetScroll,
  height,
  translateY,
  minSnapPoint,
  maxSnapPoint,
  closestSnapPointIndex,
  flattenedSnapPoints,
  canSwipeClose: canSwipeCloseRef,
  expandOnContentDrag: expandOnContentDragRef,
  swipeCloseThreshold: swipeCloseThresholdRef,
  onClose: close,
  onSnapToPoint: snapToPoint,
  onDraggingUp: () => emit('dragging-up'),
  onDraggingDown: () => emit('dragging-down'),
})

const debouncedSnapToPoint = funnel((index) => snapToPoint(index), {
  minQuietPeriodMs: props.duration,
  reducer: (_prev: number | undefined, index: number) => index,
})

// ── Watchers ──────────────────────────────────────────────────────────────────

watch(showSheet, (value) => {
  value ? open() : close()
})
watch(showSheet, async (value) => {
  if (!value) {
    keyboardInsetBottom.value = 0
    return
  }

  await nextTick()
  updateKeyboardInset()
})

// Re-synchronize focus trap and scroll lock whenever `blocking` toggles while
// the sheet is already open. nextTick ensures blockingRef has settled before
// the handlers read props.blocking / useFocusManagement's blocking ref.
watch(blockingRef, async (newBlocking) => {
  if (!showSheet.value) return
  await nextTick()
  handleScrollLock(newBlocking)
  handleFocusTrap(newBlocking)
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

// ── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(() => {
  setupKeyboardAvoidance()
  if (showSheet.value) open()
})

onUnmounted(() => {
  cleanupKeyboardAvoidance?.()
  focusManagement.cleanup()
})

// ── Transition hooks ──────────────────────────────────────────────────────────

const onLeave = (el: Element) => {
  const element = el as HTMLElement
  element.style.transition = `transform ${props.duration}ms ease, height ${props.duration}ms ease`
  element.style.transform = `translateY(${renderedSheetHeight.value}px)`
}

defineExpose({ open, close, snapToPoint })
</script>

<template>
  <Teleport :to="teleportTo" :defer="teleportDefer">
    <div>
      <Transition name="vsbs-backdrop">
        <div
          v-if="forceMount || (showSheet && blocking)"
          v-show="showSheet && blocking"
          ref="backdrop"
          data-vsbs-backdrop
          @click="backdropClick()"
        />
      </Transition>
    </div>
  </Teleport>

  <Teleport :to="teleportTo" :defer="teleportDefer">
    <Transition name="vsbs-sheet" @leave="onLeave">
      <div
        v-if="forceMount || showSheet"
        v-show="showSheet"
        ref="sheet"
        :style="{
          transform: `translateY(${translateY}px)`,
          height: `${renderedSheetHeight}px`,
          paddingBottom: `${keyboardInsetBottom}px`,
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
          :class="headerClass"
          @pointerdown="handlePointerDown($event, 'header')"
          @pointermove="handlePointerMove"
          @lostpointercapture="handleLostPointerCapture($event, 'header')"
        >
          <slot name="header" />
        </div>
        <div
          ref="sheetScroll"
          data-vsbs-scroll
          @touchstart="handleTouchStart"
          @touchmove="handleSheetScroll"
          @pointerdown="handleContentPointerDown"
          @pointermove="handleContentPointerMove"
          @lostpointercapture="handleLostPointerCapture($event, 'content')"
        >
          <div ref="sheetContent" data-vsbs-content :class="contentClass">
            <slot />
          </div>
        </div>
        <div
          ref="sheetFooter"
          data-vsbs-footer
          :class="footerClass"
          @pointerdown="handlePointerDown($event, 'footer')"
          @pointermove="handlePointerMove"
          @lostpointercapture="handleLostPointerCapture($event, 'footer')"
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
  box-sizing: border-box;
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
  touch-action: none;

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
  touch-action: none;
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
