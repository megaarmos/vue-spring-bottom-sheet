<script setup lang="ts">
import type { BottomSheetProps } from './types'

import { Motion, AnimatePresence, useMotionValue, animate } from 'motion-v'
import type { PanInfo } from 'motion-v'

import { computed, nextTick, onUnmounted, ref, toRefs, watch, onMounted } from 'vue'
import { useElementBounding, useScrollLock, useVModel, useWindowSize } from '@vueuse/core'
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'
import { useSnapPoints } from './composables/useSnapPoints'
import { clamp, funnel } from 'remeda'
import { rubberbandIfOutOfBounds } from './utils/rubberbandIfOutOfBounds'
import { heightPercentToPixels } from './utils/heightPercentToPixels'

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

const sheet = ref()
const sheetHeader = ref<HTMLElement | null>(null)
const sheetFooter = ref<HTMLElement | null>(null)
const sheetScroll = ref<HTMLElement | null>(null)
const sheetContentWrapper = ref<HTMLElement | null>(null)
const sheetContent = ref<HTMLElement | null>(null)

const backdrop = ref<HTMLElement | null>(null)
const preventContentScroll = ref(props.expandOnContentDrag)

const { height: windowHeight } = useWindowSize()
const { height: sheetHeight } = useElementBounding(sheet)
const { height: sheetHeaderHeight } = useElementBounding(sheetHeader)
const { height: sheetContentHeight } = useElementBounding(sheetContent)
const { height: sheetFooterHeight } = useElementBounding(sheetFooter)

const instinctHeight = computed({
  get() {
    return clamp(
      Math.ceil(sheetContentHeight.value + sheetHeaderHeight.value + sheetFooterHeight.value),
      {
        max: windowHeight.value,
      },
    )
  },
  set(newValue: number[]) {
    ;[sheetHeaderHeight.value, sheetContentHeight.value, sheetFooterHeight.value] = newValue
  },
})

const height = ref(0)
const translateY = ref(0)

const heightValue = useMotionValue(0)
const translateYValue = useMotionValue(0)

const { snapPoints: propSnapPoints } = toRefs(props)
const snapPointsRef = computed(() => propSnapPoints.value ?? [instinctHeight.value])
const {
  flattenedSnapPoints,
  currentSnapPointIndex,
  closestSnapPointIndex,
  minSnapPoint,
  maxSnapPoint,
} = useSnapPoints(snapPointsRef, height, windowHeight)

// eslint-disable-next-line
let controls: any

const isWindowScrollLocked = useScrollLock(document.body)
const isWindowRootScrollLocked = useScrollLock(document.documentElement)

const focusTrap = useFocusTrap([sheet, backdrop], {
  immediate: false,
  fallbackFocus: () => sheet.value?.$el || document.body,
})

function handleTouchMove(event: TouchEvent) {
  preventContentScroll.value = true
  handleSheetScroll(event)
}

function handleSheetScroll(event: TouchEvent) {
  if (preventContentScroll.value) {
    event.preventDefault()
  }
}

const handleEscapeKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close()
}

const backdropClick = () => {
  if (props.canBackdropClose) close()
}

let isOpening = false
const open = async () => {
  if (isOpening) return

  showSheet.value = true
  isOpening = true
  emit('opening-started')

  if (props.blocking) {
    isWindowScrollLocked.value = true
    isWindowRootScrollLocked.value = true
  }

  await nextTick()

  const sheetElement = sheet.value.$el as HTMLElement
  sheetHeight.value = sheetElement.getBoundingClientRect().height

  const sheetContentElement = sheetElement.querySelector('[data-vsbs-content]') as HTMLElement
  const sheetHeaderElement = sheetElement.querySelector('[data-vsbs-header]') as HTMLElement
  const sheetFooterElement = sheetElement.querySelector('[data-vsbs-footer]') as HTMLElement

  instinctHeight.value = [
    sheetHeaderElement.getBoundingClientRect().height,
    sheetContentElement.getBoundingClientRect().height,
    sheetFooterElement.getBoundingClientRect().height,
  ]

  await nextTick()

  currentSnapPointIndex.value = flattenedSnapPoints.value.findIndex(
    (point) => point === minSnapPoint.value,
  )

  if (props.initialSnapPoint) {
    const index = props.initialSnapPoint

    if (index < 0 || index >= snapPointsRef.value.length) {
      console.warn('Index out of bounds')
      return
    }

    let snapPoint
    if (typeof snapPointsRef.value[index] === 'number') {
      snapPoint = clamp(snapPointsRef.value[index], {
        max: windowHeight.value,
      })
    } else {
      snapPoint = heightPercentToPixels(snapPointsRef.value[index], windowHeight.value)
    }

    height.value = snapPoint
  } else {
    height.value = clamp(minSnapPoint.value, {
      max: windowHeight.value,
    })
  }

  translateY.value = height.value

  heightValue.jump(height.value)
  translateYValue.jump(height.value)

  requestAnimationFrame(() => {
    controls = animate(heightValue, height.value, {
      duration: props.duration / 1000,
      ease: 'easeInOut',
    })

    controls = animate(translateYValue, 0, {
      duration: props.duration / 1000,
      ease: 'easeInOut',
      onComplete: () => {
        if (props.blocking) {
          emit('opened')
          focusTrap.activate()
        }
      },
    })
  })

  window.addEventListener('keydown', handleEscapeKey)

  isOpening = false
}

let isClosing = false
const close = () => {
  if (isClosing) return

  showSheet.value = false
  isClosing = true
  emit('closing-started')

  if (props.blocking) {
    isWindowScrollLocked.value = false
    isWindowRootScrollLocked.value = false
  }

  window.removeEventListener('keydown', handleEscapeKey)

  if (props.blocking) {
    focusTrap.deactivate()
  }

  setTimeout(() => {
    emit('closed')
    isClosing = false
  }, props.duration)
}

const snapToPoint = (index: number) => {
  if (!snapPointsRef.value) return

  if (index < 0 || index >= snapPointsRef.value.length) {
    console.warn('Index out of bounds')
    return
  }

  currentSnapPointIndex.value = index

  let snapPoint
  if (typeof snapPointsRef.value[index] === 'number') {
    snapPoint = clamp(snapPointsRef.value[index], {
      max: windowHeight.value,
    })
  } else {
    snapPoint = heightPercentToPixels(snapPointsRef.value[index], windowHeight.value)
  }

  height.value = snapPoint

  controls = animate(heightValue, height.value, {
    duration: props.duration / 1000,
    ease: 'easeInOut',
    onComplete: () => emit('snapped', snapPointsRef.value.indexOf(snapPointsRef.value[index])),
  })
}

function emitDragDirection(deltaY: number) {
  if (deltaY > 0) {
    emit('dragging-down')
  } else if (deltaY < 0) {
    emit('dragging-up')
  }
}

const handlePanStart = () => {
  height.value = sheetHeight.value
  translateY.value = translateYValue.get()

  heightValue.jump(height.value)
  translateYValue.jump(translateY.value)
}

const handlePan = async (_: PointerEvent, info: PanInfo) => {
  await nextTick()

  if (!sheet.value) return

  if (translateY.value <= 0) {
    height.value -= info.delta.y
  }

  if (height.value <= minSnapPoint.value) {
    height.value = minSnapPoint.value

    translateY.value += info.delta.y

    translateYValue.set(
      props.canSwipeClose
        ? clamp(translateY.value, { min: 0 })
        : clamp(rubberbandIfOutOfBounds(translateY.value, -sheetHeight.value, 0, 0.5), {
            min: 0,
          }),
    )
  }

  heightValue.set(
    clamp(rubberbandIfOutOfBounds(height.value, 0, maxSnapPoint.value, 0.25), {
      min: 0,
      max: windowHeight.value,
    }),
  )

  emitDragDirection(info.delta.y)
}

const handlePanEnd = () => {
  translateY.value = props.canSwipeClose
    ? [0, height.value].reduce((prev, curr) =>
        Math.abs(curr - translateY.value) < Math.abs(prev - translateY.value) ? curr : prev,
      )
    : 0

  controls = animate(translateYValue, translateY.value, {
    duration: props.duration / 1000,
    ease: 'easeInOut',
  })

  if (translateY.value === height.value) {
    translateY.value = 0

    close()
  }

  currentSnapPointIndex.value = closestSnapPointIndex.value

  let snapPoint
  if (typeof snapPointsRef.value[closestSnapPointIndex.value] === 'number') {
    snapPoint = clamp(snapPointsRef.value[closestSnapPointIndex.value] as number, {
      max: windowHeight.value,
    })
  } else {
    snapPoint = heightPercentToPixels(
      snapPointsRef.value[closestSnapPointIndex.value] as string,
      windowHeight.value,
    )
  }

  height.value = snapPoint

  controls = animate(heightValue, height.value, {
    duration: props.duration / 1000,
    ease: 'easeInOut',
    onComplete: () =>
      emit(
        'snapped',
        snapPointsRef.value.indexOf(snapPointsRef.value[closestSnapPointIndex.value]),
      ),
  })
  controls = animate(translateYValue, 0, {
    duration: props.duration / 1000,
    ease: 'easeInOut',
  })
}

const handleContentPanStart = (_: PointerEvent, info: PanInfo) => {
  height.value = sheetHeight.value
  translateY.value = translateYValue.get()

  if (controls) {
    controls.stop()
  }

  if (!sheetScroll.value) return

  const isScrollAtTop = sheetScroll.value.scrollTop === 0
  const isDraggingDown = info.delta.y > 0
  const hasSingleSnapPoint = flattenedSnapPoints.value.length === 1
  const isAtTheTop = 0.5 > Math.abs(height.value - maxSnapPoint.value)

  if (hasSingleSnapPoint) {
    if (!props.expandOnContentDrag) {
      preventContentScroll.value = false
      return
    }

    if (translateYValue.get() === 0 && isScrollAtTop && isDraggingDown) {
      preventContentScroll.value = true
    }
    if (translateYValue.get() === 0 && isScrollAtTop && !isDraggingDown) {
      preventContentScroll.value = false
    }
  } else {
    if (!props.expandOnContentDrag) {
      preventContentScroll.value = false
      return
    }

    preventContentScroll.value = true
    if (isAtTheTop) {
      if (isDraggingDown && isScrollAtTop) {
        preventContentScroll.value = true
      }
      if (!isDraggingDown && isScrollAtTop) {
        preventContentScroll.value = false
      }
      if (!isScrollAtTop) {
        preventContentScroll.value = false
      }
    }
  }
}

const handleContentPan = async (_: PointerEvent, info: PanInfo) => {
  await nextTick()

  if (!props.expandOnContentDrag) {
    preventContentScroll.value = false
    return
  }

  if (!sheet.value) return

  if (translateY.value === 0 && preventContentScroll.value && props.expandOnContentDrag) {
    height.value -= info.delta.y
  }

  if (height.value <= minSnapPoint.value) {
    height.value = minSnapPoint.value

    if (preventContentScroll.value && props.expandOnContentDrag) {
      translateY.value += info.delta.y
    }

    translateY.value = clamp(translateY.value, { min: 0, max: minSnapPoint.value })

    translateYValue.set(
      props.canSwipeClose
        ? clamp(translateY.value, { min: 0 })
        : clamp(rubberbandIfOutOfBounds(translateY.value, -sheetHeight.value, 0, 0.5), {
            min: 0,
          }),
    )
  }

  if (height.value > maxSnapPoint.value) {
    height.value = maxSnapPoint.value
  }

  height.value = clamp(height.value, { max: windowHeight.value })

  const hasSingleSnapPoint = flattenedSnapPoints.value.length === 1
  if (!hasSingleSnapPoint) {
    if (height.value === maxSnapPoint.value) {
      preventContentScroll.value = false
    }
  }

  heightValue.set(height.value)

  emitDragDirection(info.delta.y)
}

const touchStart = () => {
  if (!props.blocking) {
    isWindowScrollLocked.value = true
    isWindowRootScrollLocked.value = true
  }
}

const touchEnd = () => {
  if (!props.blocking) {
    isWindowScrollLocked.value = false
    isWindowRootScrollLocked.value = false
  }
}

const scrollEnd = () => {
  if (!sheetScroll.value) return

  const isScrollAtTop = sheetScroll.value.scrollTop === 0

  preventContentScroll.value = isScrollAtTop
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

  if (typeof currentSnapPoint === 'string') return
  if (typeof previousSnapPoint === 'string') return

  height.value = clamp(currentSnapPoint, {
    max: windowHeight.value,
  })
  if (currentSnapPoint !== previousSnapPoint) {
    controls = animate(heightValue, height.value, {
      duration: props.duration / 1000,
      ease: 'easeInOut',
    })
  }
})

watch(windowHeight, () => {
  debouncedSnapToPoint.call(currentSnapPointIndex.value)
})

watch(instinctHeight, (value) => {
  emit('instinctHeight', value)
})

onUnmounted(() => {
  focusTrap.deactivate()
})

defineExpose({ open, close, snapToPoint })
</script>

<template>
  <Teleport :to="teleportTo" :defer="teleportDefer">
    <div data-vsbs-container>
      <AnimatePresence>
        <Motion
          v-if="showSheet && blocking"
          ref="backdrop"
          data-vsbs-backdrop
          @click="backdropClick()"
          :transition="{
            ease: 'easeInOut',
            duration: duration / 1000,
          }"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
        />
      </AnimatePresence>

      <AnimatePresence>
        <Motion
          v-if="showSheet"
          ref="sheet"
          :exit="{ y: '100%', height: sheetHeight }"
          :initial="false"
          :style="{ y: translateYValue, height: heightValue }"
          :data-vsbs-shadow="!blocking"
          :data-vsbs-sheet-show="showSheet"
          aria-modal="true"
          data-vsbs-sheet
          tabindex="-1"
          @touchstart="touchStart"
          @touchend="touchEnd"
        >
          <Motion
            ref="sheetHeader"
            data-vsbs-header
            @pan-start="handlePanStart"
            @pan="handlePan"
            @pan-end="handlePanEnd"
            @touchmove="handleTouchMove"
            :class="headerClass"
          >
            <slot name="header" />
          </Motion>
          <div ref="sheetScroll" data-vsbs-scroll @scrollend="scrollEnd">
            <Motion
              ref="sheetContentWrapper"
              data-vsbs-content-wrapper
              @pan-start="handleContentPanStart"
              @pan="handleContentPan"
              @pan-end="handlePanEnd"
              @touchmove="handleSheetScroll"
            >
              <div ref="sheetContent" data-vsbs-content :class="contentClass">
                <slot />
              </div>
            </Motion>
          </div>
          <Motion
            ref="sheetFooter"
            data-vsbs-footer
            @pan-start="handlePanStart"
            @pan="handlePan"
            @pan-end="handlePanEnd"
            @touchmove="handleTouchMove"
            :class="footerClass"
          >
            <slot name="footer" />
          </Motion>
        </Motion>
      </AnimatePresence>
    </div>
  </Teleport>
</template>

<style scoped>
[data-vsbs-container] {
  position: fixed;
  inset: 0px;
  overflow: hidden;
  pointer-events: none;
  z-index: 9999;
  visibility: visible;
}

[data-vsbs-backdrop] {
  background-color: var(--vsbs-backdrop-bg, rgba(0, 0, 0, 0.5));
  inset: 0;
  pointer-events: auto;
  position: fixed;
  user-select: none;
  will-change: opacity;
  z-index: 1;
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
  max-height: inherit;
  max-width: var(--vsbs-max-width, 640px);
  pointer-events: all;
  position: fixed;
  right: 0;
  width: 100%;
  will-change: height;
  z-index: 2;
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
</style>
