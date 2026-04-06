<script setup lang="ts">
import type { BottomSheetProps, MorphingConfig } from './types'

import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, toRef, watch } from 'vue'
import { useElementBounding, useVModel, useWindowSize } from '@vueuse/core'
import { clamp, funnel } from 'remeda'
import { useDragGestures } from './composables/useDragGestures'
import { useFocusManagement } from './composables/useFocusManagement'
import { useSheetScrollLock } from './composables/useSheetScrollLock'
import { useSnapPoints } from './composables/useSnapPoints'
import { useSpring } from './composables/useSpring'
import { useMorphing } from './composables/useMorphing'
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

onMounted(() => {
  setupKeyboardAvoidance()
  if (showSheet.value) open()
})

const sheet = shallowRef<HTMLElement | null>(null)
const sheetHeader = shallowRef<HTMLElement | null>(null)
const sheetFooter = shallowRef<HTMLElement | null>(null)
const sheetScroll = shallowRef<HTMLElement | null>(null)
const sheetContent = shallowRef<HTMLElement | null>(null)
const backdrop = shallowRef<HTMLElement | null>(null)
const keyboardInsetBottom = ref(0)

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

// --- Spring animation setup ---
const springCfg = computed(() => ({
  mass: props.springConfig?.mass ?? 1,
  stiffness: props.springConfig?.stiffness ?? 300,
  damping: props.springConfig?.damping ?? 30,
}))

const useSpringAnimation = computed(() => !!props.springConfig || !!props.morphing)

const height = ref(0)
const translateY = ref(0)

// Springs drive height and translateY refs directly
const heightSpring = useSpring(height, springCfg.value)
const translateYSpring = useSpring(translateY, springCfg.value)

const renderedSheetHeight = computed(() => {
  return clamp(height.value + keyboardInsetBottom.value, {
    max: windowHeight.value,
  })
})
const durationCss = computed(() => props.duration + 'ms')

const propSnapPoints = toRef(() => props.snapPoints)
const snapPointsRef = computed(() => propSnapPoints.value ?? [instinctHeight.value])
const {
  flattenedSnapPoints,
  currentSnapPointIndex,
  closestSnapPointIndex,
  minSnapPoint,
  maxSnapPoint,
} = useSnapPoints(snapPointsRef, height, windowHeight)

// --- Morphing setup ---
const morphingEnabled = computed(() => !!props.morphing)

const morphingConfig = computed<Partial<MorphingConfig>>(() => {
  if (typeof props.morphing === 'object') return props.morphing
  return {}
})

const sortedSnapHeights = computed(() => {
  return [...flattenedSnapPoints.value].sort((a, b) => a - b)
})

const { morphStyle, cornerRadius } = useMorphing(
  height,
  sortedSnapHeights,
  morphingConfig.value,
)

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

const isOpening = shallowRef(false)
const isClosing = shallowRef(false)
let closeTimeoutId: ReturnType<typeof setTimeout> | null = null

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

  // Abort any in-progress close animation
  if (isClosing.value) {
    isClosing.value = false
    translateYSpring.cancel()
    if (closeTimeoutId !== null) {
      clearTimeout(closeTimeoutId)
      closeTimeoutId = null
    }
  }

  showSheet.value = true
  isOpening.value = true
  emit('opening-started')

  scrollLock.lockIfBlocking()

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

  let openHeight: number
  if (props.initialSnapPoint !== undefined) {
    const index = props.initialSnapPoint

    if (index < 0 || index >= snapPointsRef.value.length) {
      console.warn('Index out of bounds')
      return
    }

    const snapValue = snapPointsRef.value[index]
    if (!snapValue) return

    openHeight = resolveSnapPoint(snapValue, windowHeight.value)
  } else {
    openHeight = clamp(minSnapPoint.value, { max: windowHeight.value })
  }

  if (useSpringAnimation.value) {
    // Set height immediately, then spring translateY from offscreen to 0
    height.value = openHeight
    heightSpring.sync()
    translateY.value = openHeight
    translateYSpring.sync()

    requestAnimationFrame(() => {
      translateYSpring.springTo(0, () => {
        if (props.blocking && showSheet.value) {
          emit('opened')
          focusManagement.activate()
        }
      })
    })
  } else {
    height.value = openHeight
    translateY.value = openHeight

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
  }

  isOpening.value = false
}

const close = () => {
  if (isClosing.value) return

  showSheet.value = false
  isClosing.value = true
  emit('closing-started')

  scrollLock.unlockIfBlocking()
  focusManagement.deactivate()

  if (useSpringAnimation.value) {
    translateYSpring.sync()
    translateYSpring.springTo(height.value, () => {
      emit('closed')
      isClosing.value = false
    })
  } else {
    translateY.value = height.value

    closeTimeoutId = setTimeout(() => {
      closeTimeoutId = null
      emit('closed')
      isClosing.value = false
    }, props.duration)
  }
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

  const targetH = resolveSnapPoint(snapValue, windowHeight.value)

  if (useSpringAnimation.value) {
    heightSpring.sync()
    heightSpring.springTo(targetH)
  } else {
    height.value = targetH
  }

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
  onResetTranslateY: () => {
    if (useSpringAnimation.value) {
      translateYSpring.sync()
      translateYSpring.springTo(0)
    } else {
      translateY.value = 0
    }
  },
  onDraggingUp: () => emit('dragging-up'),
  onDraggingDown: () => emit('dragging-down'),
})

// When drag starts, cancel any running spring animations
watch(isDragging, (dragging) => {
  if (dragging && useSpringAnimation.value) {
    heightSpring.cancel()
    translateYSpring.cancel()
  }
})

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

  if (useSpringAnimation.value) {
    heightSpring.sync()
    heightSpring.springTo(clamp(currentSnapPoint, { max: windowHeight.value }))
  } else {
    height.value = clamp(currentSnapPoint, { max: windowHeight.value })
  }
})

watch(windowHeight, () => {
  debouncedSnapToPoint.call(currentSnapPointIndex.value)
})

watch(instinctHeight, (value) => {
  emit('instinctHeight', value)
})

onUnmounted(() => {
  cleanupKeyboardAvoidance?.()
  focusManagement.cleanup()
  heightSpring.cancel()
  translateYSpring.cancel()
  if (closeTimeoutId !== null) {
    clearTimeout(closeTimeoutId)
    closeTimeoutId = null
  }
})

// CSS transition (only used when spring animation is disabled)
const cssTransition = computed(() => {
  if (useSpringAnimation.value) return 'none'
  if (isDragging.value) return 'none'
  return `transform ${props.duration}ms ease, height ${props.duration}ms ease`
})

const onLeave = (el: Element) => {
  const element = el as HTMLElement
  if (useSpringAnimation.value) {
    // Spring animation handles the leave
    element.style.transition = 'none'
    element.style.transform = `translateY(${renderedSheetHeight.value}px)`
  } else {
    element.style.transition = `transform ${props.duration}ms ease, height ${props.duration}ms ease`
    element.style.transform = `translateY(${renderedSheetHeight.value}px)`
  }
}

// Morphing-aware container style
const sheetStyle = computed(() => {
  const base: Record<string, string> = {
    transform: `translateY(${translateY.value}px)`,
    height: `${renderedSheetHeight.value}px`,
    paddingBottom: `${keyboardInsetBottom.value}px`,
    transition: cssTransition.value,
  }

  if (morphingEnabled.value) {
    const ms = morphStyle.value
    base.left = ms.left as string
    base.right = ms.right as string
    base.bottom = ms.bottom as string
    base.borderRadius = ms.borderRadius as string
    // Override the default margin-left/right auto for morphing
    base.marginLeft = '0'
    base.marginRight = '0'
    base.width = 'auto'
  }

  return base
})

// Morphing-aware header style (corner radius on header too)
const headerMorphStyle = computed(() => {
  if (!morphingEnabled.value) return {}
  const r = cornerRadius.value
  return {
    borderTopLeftRadius: `${r}px`,
    borderTopRightRadius: `${r}px`,
  }
})

// Morphing-aware shadow pseudo style
const shadowMorphStyle = computed(() => {
  if (!morphingEnabled.value) return {}
  const r = cornerRadius.value
  return {
    '--vsbs-border-radius': `${r}px`,
  }
})

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
        :style="sheetStyle"
        :class="sheetClass"
        :data-vsbs-shadow="!blocking"
        :data-vsbs-sheet-show="showSheet"
        :data-vsbs-morphing="morphingEnabled || undefined"
        :data-vsbs-has-cover="$slots.cover ? '' : undefined"
        aria-modal="true"
        data-vsbs-sheet
        tabindex="-1"
        @touchstart="scrollLock.touchStartHandler"
        @touchend="scrollLock.touchEndHandler"
      >
        <div v-if="$slots.cover" data-vsbs-cover>
          <slot name="cover" />
        </div>
        <div
          ref="sheetHeader"
          data-vsbs-header
          :class="headerClass"
          :style="headerMorphStyle"
          @pointerdown="handlePointerDown($event, 'header')"
          @pointermove="handlePointerMove"
          @lostpointercapture="handleLostPointerCapture($event, 'header')"
        >
          <slot name="header" />
        </div>
        <div
          ref="sheetScroll"
          data-vsbs-scroll
          :class="scrollClass"
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

<style>
@layer vsbs {
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

  /* Morphing mode overrides */
  [data-vsbs-morphing] {
    max-width: none;
    overflow: hidden;
    will-change: height, transform, border-radius, left, right, bottom;
    box-shadow: 0 -2px 20px 0 var(--vsbs-shadow-color, rgba(0, 0, 0, 0.12)),
      0 0 40px 0 var(--vsbs-shadow-color, rgba(0, 0, 0, 0.06));
  }

  /* Clip cover content when cover slot is used */
  [data-vsbs-has-cover] {
    overflow: hidden;
  }

  [data-vsbs-sheet-show='true'] {
    visibility: visible;
  }

  /* Cover slot: full-bleed background behind header/content/footer */
  [data-vsbs-cover] {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
  }

  [data-vsbs-header] {
    touch-action: none;

    box-shadow: 0 1px 0 var(--vsbs-border-color, rgba(46, 59, 66, 0.125));
    flex-shrink: 0;
    padding: var(--vsbs-header-padding, 20px var(--vsbs-padding-x, 16px) 8px);
    user-select: none;
    position: relative;
    z-index: 3;

    border-top-left-radius: var(--vsbs-border-radius, 16px);
    border-top-right-radius: var(--vsbs-border-radius, 16px);

    border-top: 1px solid var(--vsbs-outer-border-color, transparent);
  }

  [data-vsbs-header]::before {
    background-color: var(--vsbs-handle-background, rgba(0, 0, 0, 0.28));
    border-radius: var(--vsbs-handle-radius, 2px);
    content: '';
    display: block;
    height: var(--vsbs-handle-height, 4px);
    left: 50%;
    position: absolute;
    top: var(--vsbs-handle-top, 8px);
    transform: translateX(-50%);
    width: var(--vsbs-handle-width, 36px);
  }

  [data-vsbs-header]:empty {
    box-shadow: none;
    padding: var(--vsbs-header-empty-padding, 14px var(--vsbs-padding-x, 16px) 10px);
  }

  [data-vsbs-footer] {
    touch-action: none;
    box-shadow: 0 -1px 0 var(--vsbs-border-color, rgba(46, 59, 66, 0.125));
    flex-grow: 0;
    flex-shrink: 0;
    padding: var(--vsbs-footer-padding, 16px var(--vsbs-padding-x, 16px));
    position: relative;
    user-select: none;
    z-index: 1;
  }

  [data-vsbs-footer]:empty {
    display: none;
  }

  [data-vsbs-scroll] {
    flex-grow: 1;
    overflow-y: auto;
    overscroll-behavior: none;
    position: relative;
    z-index: 1;
  }

  [data-vsbs-content] {
    display: var(--vsbs-content-display, grid);
    padding: var(--vsbs-content-padding, 8px var(--vsbs-padding-x, 16px));
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
}
</style>
