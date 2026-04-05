import type { BottomSheetProps } from '../types'
import type { Ref, ShallowRef } from 'vue'

import { shallowRef } from 'vue'
import { clamp } from 'remeda'

import { useSwipeDetection } from './useSwipeDetection'
import { calculateSwipeThreshold } from '../utils/calculateSwipeThreshold'
import { RUBBERBAND_ELASTICITY, SNAP_POINT_TOLERANCE_PX } from '../utils/constants'
import { isInteractable } from '../utils/isInteractable'
import { rubberbandIfOutOfBounds } from '../utils/rubberbandIfOutOfBounds'

type DragHandle = 'header' | 'footer'
type PointerCaptureTarget = DragHandle | 'content'

interface UseDragGesturesOptions {
  sheetHeaderRef: ShallowRef<HTMLElement | null>
  sheetFooterRef: ShallowRef<HTMLElement | null>
  sheetContentRef: ShallowRef<HTMLElement | null>
  sheetScrollRef: ShallowRef<HTMLElement | null>

  height: Ref<number>
  translateY: Ref<number>

  minSnapPoint: Readonly<Ref<number>>
  maxSnapPoint: Readonly<Ref<number>>
  closestSnapPointIndex: Readonly<Ref<number>>
  flattenedSnapPoints: Readonly<Ref<number[]>>

  canSwipeClose: Readonly<Ref<boolean>>
  expandOnContentDrag: Readonly<Ref<boolean>>
  swipeCloseThreshold: Readonly<Ref<BottomSheetProps['swipeCloseThreshold']>>

  onClose: () => void
  onSnapToPoint: (index: number) => void
  onResetTranslateY?: () => void
  onDraggingUp?: () => void
  onDraggingDown?: () => void
}

export const useDragGestures = (options: UseDragGesturesOptions) => {
  const swipe = useSwipeDetection()
  const isDragging = shallowRef(false)

  let preventContentScroll = true
  let heightAccumulator = 0
  let translateYAccumulator = 0
  let hasDismissedFocusOnDrag = false
  let contentStartY = 0
  let shutDownScroll = false
  let moveSamples = 0

  const emitDragDirection = (movementY: number) => {
    if (movementY > 0) {
      options.onDraggingDown?.()
    } else if (movementY < 0) {
      options.onDraggingUp?.()
    }
  }

  const dismissFocusOnDragStart = () => {
    if (hasDismissedFocusOnDrag) return

    const activeElement = document.activeElement
    if (!(activeElement instanceof HTMLElement)) return
    if (activeElement === document.body) return

    activeElement.blur()
    hasDismissedFocusOnDrag = true
  }

  const handleSheetScroll = (event: TouchEvent) => {
    const target = event.target as Element | null
    if (target && isInteractable(target)) {
      event.preventDefault()
    }

    if (typeof event.cancelable !== 'boolean' || event.cancelable) {
      if (preventContentScroll) {
        event.preventDefault()
      }
    } else {
      console.warn(`The following event couldn't be canceled:`)
    }
  }

  const handlePointerDown = (event: PointerEvent, type: DragHandle) => {
    const target = type === 'header' ? options.sheetHeaderRef.value : options.sheetFooterRef.value

    if (!target) return
    if (event.button !== 0) return

    heightAccumulator = options.height.value
    translateYAccumulator = options.translateY.value
    hasDismissedFocusOnDrag = false
    moveSamples = 0
    shutDownScroll = false
    preventContentScroll = true
    isDragging.value = true

    swipe.start(event.clientY)
    target.setPointerCapture(event.pointerId)
  }

  const handleContentPointerDown = (event: PointerEvent) => {
    const target = event.target as Element | null

    if (!options.sheetContentRef.value) return
    if (event.button !== 0) return
    if (options.expandOnContentDrag.value === false) return
    if (target && isInteractable(target)) return

    heightAccumulator = options.height.value
    translateYAccumulator = options.translateY.value
    contentStartY = event.clientY
    hasDismissedFocusOnDrag = false
    moveSamples = 0
    shutDownScroll = false
    preventContentScroll = true
    isDragging.value = true

    swipe.start(event.clientY)
    options.sheetContentRef.value.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: PointerEvent) => {
    if (!isDragging.value) return

    if (Math.abs(event.movementY) > 0) {
      dismissFocusOnDragStart()
    }

    swipe.update(event.clientY)
    emitDragDirection(event.movementY)

    if (options.translateY.value > 0) {
      if (options.canSwipeClose.value) {
        options.translateY.value = options.translateY.value + event.movementY
      } else {
        translateYAccumulator = translateYAccumulator + event.movementY

        options.translateY.value = rubberbandIfOutOfBounds(
          translateYAccumulator,
          -options.minSnapPoint.value,
          0,
          RUBBERBAND_ELASTICITY,
        )
      }

      return
    }

    heightAccumulator = clamp(heightAccumulator - event.movementY, {
      min: options.minSnapPoint.value,
    })

    options.height.value = rubberbandIfOutOfBounds(
      heightAccumulator,
      0,
      options.maxSnapPoint.value,
      RUBBERBAND_ELASTICITY,
    )

    if (options.height.value <= options.minSnapPoint.value) {
      options.translateY.value = options.translateY.value + event.movementY
    }
  }

  const movementDetection = (event: PointerEvent) => {
    if (moveSamples >= 2) {
      return
    }

    const scrollEl = options.sheetScrollRef.value
    const isScrollAtTop = scrollEl?.scrollTop === 0
    const isDraggingDown = event.clientY - contentStartY > 0
    const hasSingleSnapPoint = options.flattenedSnapPoints.value.length === 1
    const isAtTheTop = 0.5 > Math.abs(options.height.value - options.maxSnapPoint.value)
    const hasScroll = (scrollEl?.scrollHeight ?? 0) > (scrollEl?.clientHeight ?? 0)

    if (hasSingleSnapPoint) {
      if (!options.expandOnContentDrag.value) {
        preventContentScroll = false
        return
      }

      if (options.translateY.value === 0 && isScrollAtTop && isDraggingDown) {
        preventContentScroll = true
      }

      if (options.translateY.value === 0 && isScrollAtTop && !isDraggingDown) {
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
    if (!options.sheetScrollRef.value) return

    if (Math.abs(event.movementY) > 0) {
      dismissFocusOnDragStart()
    }

    movementDetection(event)

    if (moveSamples <= 1) return

    swipe.update(event.clientY)
    emitDragDirection(event.movementY)

    if (options.translateY.value > 0) {
      if (options.canSwipeClose.value) {
        options.translateY.value = clamp(options.translateY.value + event.movementY, { min: 0 })
      }

      return
    }

    options.height.value = clamp(options.height.value - event.movementY, {
      min: options.minSnapPoint.value,
      max: options.maxSnapPoint.value,
    })

    const hasSingleSnapPoint = options.flattenedSnapPoints.value.length === 1

    if (!hasSingleSnapPoint && options.height.value === options.maxSnapPoint.value) {
      preventContentScroll = false
    }

    if (options.height.value <= options.minSnapPoint.value) {
      options.translateY.value = clamp(options.translateY.value + event.movementY, {
        min: 0,
        ...(options.canSwipeClose.value === false ? { max: 0 } : {}),
      })
    }
  }

  const resetSheetState = () => {
    const swipeResult = swipe.end()

    if (
      swipeResult.isSwipe &&
      swipeResult.direction === 'down' &&
      options.canSwipeClose.value &&
      options.height.value <= options.minSnapPoint.value + SNAP_POINT_TOLERANCE_PX
    ) {
      options.onClose()
      return
    }

    if (options.canSwipeClose.value) {
      const threshold = calculateSwipeThreshold(
        options.swipeCloseThreshold.value,
        options.height.value,
      )

      if (options.translateY.value > threshold) {
        options.onClose()
        return
      }
    }

    if (swipeResult.isSwipe && options.flattenedSnapPoints.value.length > 1) {
      const sortedSnapPoints = [...options.flattenedSnapPoints.value].sort((a, b) => a - b)

      let targetSnapIndex = options.closestSnapPointIndex.value

      if (swipeResult.direction === 'up') {
        const nextHigher = sortedSnapPoints.find((point) => point > options.height.value + 1)

        if (nextHigher !== undefined) {
          targetSnapIndex = options.flattenedSnapPoints.value.indexOf(nextHigher)
        }
      } else if (swipeResult.direction === 'down') {
        const nextLower = [...sortedSnapPoints]
          .reverse()
          .find((point) => point < options.height.value - 1)

        if (nextLower !== undefined) {
          targetSnapIndex = options.flattenedSnapPoints.value.indexOf(nextLower)
        }
      }

      options.onSnapToPoint(targetSnapIndex)
      resetTranslateY()
      return
    }

    options.onSnapToPoint(options.closestSnapPointIndex.value)
    resetTranslateY()
  }

  const resetTranslateY = () => {
    if (options.onResetTranslateY) {
      options.onResetTranslateY()
    } else {
      options.translateY.value = 0
    }
  }

  const handleLostPointerCapture = (event: PointerEvent, type: PointerCaptureTarget) => {
    isDragging.value = false

    if (type === 'header') {
      options.sheetHeaderRef.value?.releasePointerCapture(event.pointerId)
    } else if (type === 'footer') {
      options.sheetFooterRef.value?.releasePointerCapture(event.pointerId)
    } else {
      options.sheetContentRef.value?.releasePointerCapture(event.pointerId)
    }

    moveSamples = 0
    shutDownScroll = false
    hasDismissedFocusOnDrag = false

    resetSheetState()
  }

  const handleTouchStart = (event: TouchEvent) => {
    if (shutDownScroll) {
      event.preventDefault()
    }
  }

  return {
    isDragging,
    handleSheetScroll,
    handlePointerDown,
    handleContentPointerDown,
    handlePointerMove,
    handleContentPointerMove,
    handleLostPointerCapture,
    handleTouchStart,
  }
}
