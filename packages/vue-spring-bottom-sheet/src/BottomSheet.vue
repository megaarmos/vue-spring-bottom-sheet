<script setup lang="ts">
import type { BottomSheetProps } from './types'

import { computed, nextTick, onUnmounted, ref, shallowRef, watch, onMounted, toRef } from 'vue'
import { useElementBounding, useVModel, useWindowSize } from '@vueuse/core'
import { useSnapPoints } from './composables/useSnapPoints'
import { useSheetScrollLock } from './composables/useSheetScrollLock'
import { useFocusManagement } from './composables/useFocusManagement'
import { clamp, funnel } from 'remeda'
import { resolveSnapPoint } from './utils/resolveSnapPoint'
import { RUBBERBAND_ELASTICITY, SNAP_POINT_TOLERANCE_PX } from './utils/constants'
import { rubberbandIfOutOfBounds } from './utils/rubberbandIfOutOfBounds'
import { calculateSwipeThreshold } from './utils/calculateSwipeThreshold'
import { useSwipeDetection } from './composables/useSwipeDetection'
import { isInteractable } from './utils/isInteractable'

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

const height = ref(0)
const translateY = ref(0)
const renderedSheetHeight = computed(() => {
  return clamp(height.value + keyboardInsetBottom.value, { max: windowHeight.value })
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

const swipe = useSwipeDetection()

const isOpening = shallowRef(false)
const isClosing = shallowRef(false)

const isDragging = shallowRef(false)
let preventContentScroll = true

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

const emitDragDirection = (movementY: number) => {
  if (movementY > 0) {
    emit('dragging-down')
  } else if (movementY < 0) {
    emit('dragging-up')
  }
}

const handleSheetScroll = (event: TouchEvent) => {
  if (typeof event.cancelable !== 'boolean' || event.cancelable) {
    if (preventContentScroll) {
      event.preventDefault()
    }
  } else {
    console.warn(`The following event couldn't be canceled:`)
  }
}

let heightAccumulator: number
let translateYAccumulator: number
let hasDismissedFocusOnDrag = false

const dismissFocusOnDragStart = () => {
  if (hasDismissedFocusOnDrag) return

  const activeElement = document.activeElement
  if (!(activeElement instanceof HTMLElement)) return
  if (activeElement === document.body) return

  activeElement.blur()
  hasDismissedFocusOnDrag = true
}

const handlePointerDown = (event: PointerEvent, type: 'header' | 'footer') => {
  if (!sheetHeader.value) return
  if (event.button !== 0) return

  heightAccumulator = height.value
  translateYAccumulator = translateY.value

  hasDismissedFocusOnDrag = false
  isDragging.value = true

  swipe.start(event.clientY)
  if (type === 'header') {
    sheetHeader.value?.setPointerCapture(event.pointerId)
  } else {
    sheetFooter.value?.setPointerCapture(event.pointerId)
  }
}

let contentStartY = 0
const handleContentPointerDown = (event: PointerEvent) => {
  if (!sheetHeader.value) return
  if (event.button !== 0) return
  if (expandOnContentDragRef.value === false) return
  if (isInteractable(event.target as Element)) return

  heightAccumulator = height.value
  translateYAccumulator = translateY.value
  contentStartY = event.clientY

  hasDismissedFocusOnDrag = false
  isDragging.value = true

  swipe.start(event.clientY)
  sheetContent.value?.setPointerCapture(event.pointerId)
}

const handlePointerMove = (event: PointerEvent) => {
  if (!isDragging.value) return

  if (Math.abs(event.movementY) > 0) {
    dismissFocusOnDragStart()
  }

  swipe.update(event.clientY)

  emitDragDirection(event.movementY)

  if (translateY.value > 0) {
    if (canSwipeCloseRef.value) {
      translateY.value = translateY.value + event.movementY
    } else {
      translateYAccumulator = translateYAccumulator + event.movementY

      translateY.value = rubberbandIfOutOfBounds(
        translateYAccumulator,
        -minSnapPoint.value,
        0,
        RUBBERBAND_ELASTICITY,
      )
    }

    return
  }

  heightAccumulator = clamp(heightAccumulator - event.movementY, { min: minSnapPoint.value })

  height.value = rubberbandIfOutOfBounds(
    heightAccumulator,
    0,
    maxSnapPoint.value,
    RUBBERBAND_ELASTICITY,
  )

  if (height.value <= minSnapPoint.value) {
    translateY.value = translateY.value + event.movementY
  }
}

let shutDownScroll = false
let moveSamples = 0
const movementDetection = (event: PointerEvent) => {
  if (moveSamples >= 2) {
    return
  }

  const isScrollAtTop = sheetScroll.value?.scrollTop === 0
  const isDraggingDown = event.clientY - contentStartY > 0
  const hasSingleSnapPoint = flattenedSnapPoints.value.length === 1
  const isAtTheTop = 0.5 > Math.abs(height.value - maxSnapPoint.value)
  const hasScroll = (sheetScroll.value?.scrollHeight ?? 0) > (sheetScroll.value?.clientHeight ?? 0)

  if (hasSingleSnapPoint) {
    if (!props.expandOnContentDrag) {
      preventContentScroll = false
      return
    }

    if (translateY.value === 0 && isScrollAtTop && isDraggingDown) {
      preventContentScroll = true
    }
    if (translateY.value === 0 && isScrollAtTop && !isDraggingDown) {
      preventContentScroll = false
    }
  } else {
    preventContentScroll = true
    if (isAtTheTop) {
      if (isDraggingDown && isScrollAtTop) {
        preventContentScroll = true
      }
      if (!isDraggingDown && isScrollAtTop) {
        preventContentScroll = false
      }
      if (!isScrollAtTop) {
        preventContentScroll = false
      }
    }
  }

  shutDownScroll = !hasScroll

  moveSamples++
}

const handleContentPointerMove = (event: PointerEvent) => {
  if (!isDragging.value) return
  if (!sheetScroll.value) return

  if (Math.abs(event.movementY) > 0) {
    dismissFocusOnDragStart()
  }

  movementDetection(event)

  if (moveSamples <= 1) return

  swipe.update(event.clientY)

  emitDragDirection(event.movementY)

  if (translateY.value > 0) {
    if (canSwipeCloseRef.value) {
      translateY.value = clamp(translateY.value + event.movementY, { min: 0 })
    }

    return
  }

  height.value = clamp(height.value - event.movementY, {
    min: minSnapPoint.value,
    max: maxSnapPoint.value,
  })

  const hasSingleSnapPoint = flattenedSnapPoints.value.length === 1
  if (!hasSingleSnapPoint) {
    if (height.value === maxSnapPoint.value) {
      preventContentScroll = false
    }
  }

  if (height.value <= minSnapPoint.value) {
    translateY.value = clamp(translateY.value + event.movementY, {
      min: 0,
      ...(canSwipeCloseRef.value === false ? { max: 0 } : {}),
    })
  }
}

const resetSheetState = () => {
  const swipeResult = swipe.end()

  if (
    swipeResult.isSwipe &&
    swipeResult.direction === 'down' &&
    canSwipeCloseRef.value &&
    height.value <= minSnapPoint.value + SNAP_POINT_TOLERANCE_PX
  ) {
    close()
    return
  }

  if (canSwipeCloseRef.value) {
    const threshold = calculateSwipeThreshold(swipeCloseThresholdRef.value, height.value)

    if (translateY.value > threshold) {
      close()
      return
    }
  }

  if (swipeResult.isSwipe && flattenedSnapPoints.value.length > 1) {
    const sortedSnapPoints = [...flattenedSnapPoints.value].sort((a, b) => a - b)

    let targetSnapIndex = closestSnapPointIndex.value

    if (swipeResult.direction === 'up') {
      const nextHigher = sortedSnapPoints.find((point) => point > height.value + 1)
      if (nextHigher !== undefined) {
        targetSnapIndex = flattenedSnapPoints.value.indexOf(nextHigher)
      }
    } else if (swipeResult.direction === 'down') {
      const nextLower = [...sortedSnapPoints].reverse().find((point) => point < height.value - 1)
      if (nextLower !== undefined) {
        targetSnapIndex = flattenedSnapPoints.value.indexOf(nextLower)
      }
    }

    snapToPoint(targetSnapIndex)
    translateY.value = 0
    return
  }

  snapToPoint(closestSnapPointIndex.value)
  translateY.value = 0
}

const handleLostPointerCapture = (event: PointerEvent, type: 'header' | 'footer' | 'content') => {
  isDragging.value = false
  if (type === 'header') {
    sheetHeader.value?.releasePointerCapture(event.pointerId)
  } else if (type === 'footer') {
    sheetFooter.value?.releasePointerCapture(event.pointerId)
  } else if (type === 'content') {
    sheetContent.value?.releasePointerCapture(event.pointerId)
  }

  moveSamples = 0
  hasDismissedFocusOnDrag = false

  resetSheetState()
}

const handleTouchStart = (event: TouchEvent) => {
  if (isInteractable(event.target as Element)) {
    return
  }

  if (shutDownScroll) {
    event.preventDefault()
  }
}

watch(windowHeight, () => {
  debouncedSnapToPoint.call(currentSnapPointIndex.value)
})

watch(instinctHeight, (value) => {
  emit('instinctHeight', value)
})

onUnmounted(() => {
  cleanupKeyboardAvoidance?.()
  focusManagement.cleanup()
})

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
          v-if="showSheet && blocking"
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
        v-if="showSheet"
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
