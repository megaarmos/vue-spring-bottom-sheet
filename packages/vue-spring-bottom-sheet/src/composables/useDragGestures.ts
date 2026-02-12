import { ref, computed, type Ref, type ComputedRef, type ShallowRef } from 'vue'
import { clamp } from 'remeda'
import { useSwipeDetection } from './useSwipeDetection'
import { rubberbandIfOutOfBounds } from '../utils/rubberbandIfOutOfBounds'
import { resolveSnapPoint } from '../utils/resolveSnapPoint'
import { calculateSwipeThreshold } from '../utils/calculateSwipeThreshold'
import {
  SNAP_POINT_TOLERANCE_PX,
  MOVEMENT_THRESHOLD_PX,
  RUBBERBAND_ELASTICITY,
  RUBBERBAND_ELASTICITY_STRONG,
  DEFAULT_VELOCITY_THRESHOLD,
} from '../utils/constants'

export interface UseDragGesturesOptions {
  sheetRef: ShallowRef<HTMLElement | null>
  sheetScrollRef: ShallowRef<HTMLElement | null>
  height: Ref<number>
  translateY: Ref<number>
  sheetHeight: Ref<number>
  windowHeight: Ref<number>

  snapPointsRef: ComputedRef<Array<number | `${number}%`>>
  flattenedSnapPoints: ComputedRef<number[]>
  currentSnapPointIndex: Ref<number>
  closestSnapPointIndex: ComputedRef<number>
  minSnapPoint: ComputedRef<number>
  maxSnapPoint: ComputedRef<number>

  canSwipeClose: Ref<boolean>
  swipeCloseThreshold: Ref<string | number | undefined>
  expandOnContentDrag: Ref<boolean>

  onClose: () => void
  onSnapped: (index: number) => void
  onDraggingUp: () => void
  onDraggingDown: () => void
}

/**
 * Composable that handles all drag/pan gesture logic for the bottom sheet.
 * Manages header/footer dragging, content area dragging, and snap point navigation.
 */
export function useDragGestures(options: UseDragGesturesOptions) {
  const {
    sheetRef,
    sheetScrollRef,
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
    canSwipeClose,
    swipeCloseThreshold,
    expandOnContentDrag,
    onClose,
    onSnapped,
    onDraggingUp,
    onDraggingDown,
  } = options

  const isDragging = ref(false)
  const dragStartY = ref(0)
  const dragStartHeight = ref(0)
  const dragStartTranslateY = ref(0)
  const lastDragY = ref(0)
  const isFirstContentMove = ref(true)
  const preventContentScroll = ref(true)
  const heightToTranslateDelta = ref<number | null>(null)
  const activeDragMode = ref<'header' | 'content' | null>(null)
  const isUsingTouchFallback = ref(false)

  const swipe = useSwipeDetection({ velocityThreshold: DEFAULT_VELOCITY_THRESHOLD })

  const emitDragDirection = (deltaY: number) => {
    if (deltaY > 0) {
      onDraggingDown()
    } else if (deltaY < 0) {
      onDraggingUp()
    }
  }

  const captureCurrentState = () => {
    if (!sheetRef.value) return

    const style = window.getComputedStyle(sheetRef.value)
    const currentHeight = parseFloat(style.height)
    let currentTranslateY = 0

    if (style.transform && style.transform !== 'none') {
      const matrix = new DOMMatrix(style.transform)
      currentTranslateY = matrix.m42
    }

    height.value = currentHeight
    translateY.value = currentTranslateY
  }

  const snapToClosestPoint = () => {
    const targetSnapIndex = closestSnapPointIndex.value
    currentSnapPointIndex.value = targetSnapIndex

    const snapValue = snapPointsRef.value[targetSnapIndex]
    if (!snapValue) return

    const snapPoint = resolveSnapPoint(snapValue, windowHeight.value)
    height.value = snapPoint
    translateY.value = 0

    onSnapped(snapPointsRef.value.indexOf(snapValue))
  }

  const handleSnapAfterPan = (wasActuallyDragging = true) => {
    const swipeResult = swipe.end()

    if (
      wasActuallyDragging &&
      swipeResult.isSwipe &&
      swipeResult.direction === 'down' &&
      canSwipeClose.value &&
      height.value <= minSnapPoint.value + SNAP_POINT_TOLERANCE_PX
    ) {
      translateY.value = height.value
      onClose()
      return true
    }

    let targetSnapIndex: number

    if (wasActuallyDragging && swipeResult.isSwipe && flattenedSnapPoints.value.length > 1) {
      const sortedSnapPoints = [...flattenedSnapPoints.value].sort((a, b) => a - b)

      if (swipeResult.direction === 'up') {
        const nextHigher = sortedSnapPoints.find((p) => p > height.value + 1)
        targetSnapIndex =
          nextHigher !== undefined
            ? flattenedSnapPoints.value.indexOf(nextHigher)
            : closestSnapPointIndex.value
      } else {
        const nextLower = [...sortedSnapPoints].reverse().find((p) => p < height.value - 1)
        targetSnapIndex =
          nextLower !== undefined
            ? flattenedSnapPoints.value.indexOf(nextLower)
            : closestSnapPointIndex.value
      }
    } else {
      targetSnapIndex = closestSnapPointIndex.value
    }

    currentSnapPointIndex.value = targetSnapIndex

    const snapValue = snapPointsRef.value[targetSnapIndex]
    if (!snapValue) {
      onClose()
      return true
    }

    const snapPoint = resolveSnapPoint(snapValue, windowHeight.value)

    if (snapPoint === 0) {
      onClose()
      return true
    }

    height.value = snapPoint
    translateY.value = 0

    onSnapped(snapPointsRef.value.indexOf(snapValue))
    return false
  }

  const handlePanStart = (event: PointerEvent) => {
    if (!sheetRef.value) return
    if (event.button !== 0) return

    captureCurrentState()

    isDragging.value = true
    activeDragMode.value = 'header'
    dragStartY.value = event.clientY
    dragStartHeight.value = height.value
    dragStartTranslateY.value = translateY.value
    lastDragY.value = event.clientY
    heightToTranslateDelta.value = null

    swipe.start(event.clientY)
    ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
  }

  const handlePan = (event: PointerEvent) => {
    if (!isDragging.value) return
    if (event.pointerType === 'mouse' && event.buttons !== 1) {
      handlePanEnd(event)
      return
    }

    const deltaY = event.clientY - dragStartY.value
    const currentY = event.clientY

    if (translateY.value <= 0) {
      height.value = dragStartHeight.value - deltaY
    }

    if (height.value <= minSnapPoint.value) {
      height.value = minSnapPoint.value

      if (heightToTranslateDelta.value === null) {
        heightToTranslateDelta.value = deltaY
      }
      translateY.value = deltaY - heightToTranslateDelta.value

      if (canSwipeClose.value) {
        translateY.value = clamp(translateY.value, { min: 0 })
      } else {
        translateY.value = clamp(
          rubberbandIfOutOfBounds(
            translateY.value,
            -sheetHeight.value,
            0,
            RUBBERBAND_ELASTICITY_STRONG,
          ),
          { min: 0 },
        )
      }
    }

    height.value = clamp(
      rubberbandIfOutOfBounds(height.value, 0, maxSnapPoint.value, RUBBERBAND_ELASTICITY),
      {
        min: 0,
        max: windowHeight.value,
      },
    )

    emitDragDirection(event.clientY - lastDragY.value)
    swipe.update(event.clientY)
    lastDragY.value = currentY
  }

  const finalizePanEnd = () => {
    isDragging.value = false
    activeDragMode.value = null
    isUsingTouchFallback.value = false
    removeTouchFallback()
  }

  const handlePanEnd = (event: PointerEvent) => {
    finalizePanEnd()
    ;(event.target as HTMLElement).releasePointerCapture(event.pointerId)

    if (canSwipeClose.value) {
      const threshold = calculateSwipeThreshold(swipeCloseThreshold.value, height.value)

      if (translateY.value > threshold) {
        translateY.value = height.value
        onClose()
        return
      }
    } else {
      translateY.value = 0
    }

    if (translateY.value === height.value) {
      translateY.value = 0
      onClose()
      return
    }

    handleSnapAfterPan()
  }

  const handleContentPanStartLogic = (deltaY: number) => {
    if (!sheetScrollRef.value) return

    const isScrollAtTop = sheetScrollRef.value.scrollTop === 0
    const isDraggingDown = deltaY > 0
    const hasSingleSnapPoint = flattenedSnapPoints.value.length === 1
    const isAtTheTop = 0.5 > Math.abs(height.value - maxSnapPoint.value)

    if (hasSingleSnapPoint) {
      if (!expandOnContentDrag.value) {
        preventContentScroll.value = false
        return
      }

      if (translateY.value === 0 && isScrollAtTop && isDraggingDown) {
        preventContentScroll.value = true
      }
      if (translateY.value === 0 && isScrollAtTop && !isDraggingDown) {
        preventContentScroll.value = false
      }
    } else {
      if (!expandOnContentDrag.value) {
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

  const handleContentPanStart = (event: PointerEvent) => {
    if (!sheetRef.value) return
    if (event.button !== 0) return

    captureCurrentState()

    isDragging.value = true
    activeDragMode.value = 'content'
    dragStartY.value = event.clientY
    dragStartHeight.value = height.value
    dragStartTranslateY.value = translateY.value
    lastDragY.value = event.clientY
    heightToTranslateDelta.value = null
    isFirstContentMove.value = true

    swipe.start(event.clientY)
    ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
  }

  const handleContentPan = (event: PointerEvent) => {
    if (!isDragging.value) return
    if (event.pointerType === 'mouse' && event.buttons !== 1) {
      handleContentPanEnd(event)
      return
    }

    if (!expandOnContentDrag.value) {
      preventContentScroll.value = false
      return
    }

    const deltaY = event.clientY - dragStartY.value
    const currentY = event.clientY
    const moveDelta = event.clientY - lastDragY.value

    // On first move, determine direction with threshold
    if (isFirstContentMove.value) {
      const totalDelta = event.clientY - dragStartY.value
      if (Math.abs(totalDelta) > MOVEMENT_THRESHOLD_PX) {
        isFirstContentMove.value = false
        handleContentPanStartLogic(totalDelta)
      } else {
        lastDragY.value = currentY
        return
      }
    }

    if (translateY.value === 0 && preventContentScroll.value && expandOnContentDrag.value) {
      height.value = dragStartHeight.value - deltaY
    }

    if (height.value <= minSnapPoint.value) {
      height.value = minSnapPoint.value

      if (preventContentScroll.value && expandOnContentDrag.value) {
        if (heightToTranslateDelta.value === null) {
          heightToTranslateDelta.value = deltaY
        }
        translateY.value = deltaY - heightToTranslateDelta.value
      }

      translateY.value = clamp(translateY.value, { min: 0, max: minSnapPoint.value })

      if (canSwipeClose.value) {
        translateY.value = clamp(translateY.value, { min: 0 })
      } else {
        translateY.value = clamp(
          rubberbandIfOutOfBounds(
            translateY.value,
            -sheetHeight.value,
            0,
            RUBBERBAND_ELASTICITY_STRONG,
          ),
          { min: 0 },
        )
      }
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

    emitDragDirection(moveDelta)
    swipe.update(event.clientY)
    lastDragY.value = currentY
  }

  const handleContentPanEnd = (event: PointerEvent) => {
    finalizePanEnd()
    isFirstContentMove.value = true
    ;(event.target as HTMLElement).releasePointerCapture(event.pointerId)

    if (canSwipeClose.value) {
      const threshold = calculateSwipeThreshold(swipeCloseThreshold.value, height.value)

      if (translateY.value > threshold) {
        translateY.value = height.value
        onClose()
        return
      }
    } else {
      translateY.value = 0
    }

    if (translateY.value === height.value) {
      translateY.value = 0
      onClose()
      return
    }

    const wasActuallyDragging = preventContentScroll.value
    handleSnapAfterPan(wasActuallyDragging)
  }

  const handleContextMenu = (event: MouseEvent) => {
    if (isDragging.value) {
      event.preventDefault()
      finalizePanEnd()
      isFirstContentMove.value = true
      snapToClosestPoint()
    }
  }

  // --- Touch event fallback for when pointercancel fires ---
  // Touch events always fire regardless of pointer cancellation,
  // so we can use them to continue tracking the gesture.

  const handleTouchMoveFallback = (e: TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    if (!touch || !isDragging.value) return

    const clientY = touch.clientY

    if (activeDragMode.value === 'header') {
      // Reuse header pan logic
      const deltaY = clientY - dragStartY.value
      const currentY = clientY

      if (translateY.value <= 0) {
        height.value = dragStartHeight.value - deltaY
      }

      if (height.value <= minSnapPoint.value) {
        height.value = minSnapPoint.value
        if (heightToTranslateDelta.value === null) {
          heightToTranslateDelta.value = deltaY
        }
        translateY.value = deltaY - heightToTranslateDelta.value
        if (canSwipeClose.value) {
          translateY.value = clamp(translateY.value, { min: 0 })
        } else {
          translateY.value = clamp(
            rubberbandIfOutOfBounds(
              translateY.value,
              -sheetHeight.value,
              0,
              RUBBERBAND_ELASTICITY_STRONG,
            ),
            { min: 0 },
          )
        }
      }

      height.value = clamp(
        rubberbandIfOutOfBounds(height.value, 0, maxSnapPoint.value, RUBBERBAND_ELASTICITY),
        { min: 0, max: windowHeight.value },
      )

      emitDragDirection(clientY - lastDragY.value)
      swipe.update(clientY)
      lastDragY.value = currentY
    } else if (activeDragMode.value === 'content') {
      // Reuse content pan logic
      const deltaY = clientY - dragStartY.value
      const currentY = clientY
      const moveDelta = clientY - lastDragY.value

      if (isFirstContentMove.value) {
        const totalDelta = clientY - dragStartY.value
        if (Math.abs(totalDelta) > MOVEMENT_THRESHOLD_PX) {
          isFirstContentMove.value = false
          handleContentPanStartLogic(totalDelta)
        } else {
          lastDragY.value = currentY
          return
        }
      }

      if (translateY.value === 0 && preventContentScroll.value && expandOnContentDrag.value) {
        height.value = dragStartHeight.value - deltaY
      }

      if (height.value <= minSnapPoint.value) {
        height.value = minSnapPoint.value
        if (preventContentScroll.value && expandOnContentDrag.value) {
          if (heightToTranslateDelta.value === null) {
            heightToTranslateDelta.value = deltaY
          }
          translateY.value = deltaY - heightToTranslateDelta.value
        }
        translateY.value = clamp(translateY.value, { min: 0, max: minSnapPoint.value })
        if (canSwipeClose.value) {
          translateY.value = clamp(translateY.value, { min: 0 })
        } else {
          translateY.value = clamp(
            rubberbandIfOutOfBounds(
              translateY.value,
              -sheetHeight.value,
              0,
              RUBBERBAND_ELASTICITY_STRONG,
            ),
            { min: 0 },
          )
        }
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

      emitDragDirection(moveDelta)
      swipe.update(clientY)
      lastDragY.value = currentY
    }
  }

  const handleTouchEndFallback = () => {
    if (!isDragging.value) return

    const wasHeader = activeDragMode.value === 'header'
    finalizePanEnd()
    isFirstContentMove.value = true

    if (canSwipeClose.value) {
      const threshold = calculateSwipeThreshold(swipeCloseThreshold.value, height.value)
      if (translateY.value > threshold) {
        translateY.value = height.value
        onClose()
        return
      }
    } else {
      translateY.value = 0
    }

    if (translateY.value === height.value) {
      translateY.value = 0
      onClose()
      return
    }

    const wasActuallyDragging = wasHeader || preventContentScroll.value
    handleSnapAfterPan(wasActuallyDragging)
  }

  const installTouchFallback = () => {
    document.addEventListener('touchmove', handleTouchMoveFallback, { passive: false })
    document.addEventListener('touchend', handleTouchEndFallback)
    document.addEventListener('touchcancel', handleTouchEndFallback)
  }

  const removeTouchFallback = () => {
    document.removeEventListener('touchmove', handleTouchMoveFallback)
    document.removeEventListener('touchend', handleTouchEndFallback)
    document.removeEventListener('touchcancel', handleTouchEndFallback)
  }

  const handlePointerCancel = (event: PointerEvent) => {
    // Don't end the drag — switch to touch event fallback
    // Touch events always fire even after pointer events are cancelled
    ;(event.target as HTMLElement).releasePointerCapture(event.pointerId)
    isUsingTouchFallback.value = true
    installTouchFallback()
  }

  const contentTouchAction = computed(() => {
    return preventContentScroll.value ? 'none' : 'pan-y'
  })

  const handleTouchMove = (event: TouchEvent) => {
    preventContentScroll.value = true
    handleSheetScroll(event)
  }

  const handleSheetScroll = (event: TouchEvent) => {
    if (preventContentScroll.value || isUsingTouchFallback.value) {
      event.preventDefault()
    }
  }

  const scrollEnd = () => {
    if (!sheetScrollRef.value) return
    const isScrollAtTop = sheetScrollRef.value.scrollTop === 0
    preventContentScroll.value = isScrollAtTop
  }

  const headerFooterHandlers = computed(() => ({
    onPointerdown: handlePanStart,
    onPointermove: handlePan,
    onPointerup: handlePanEnd,
    onPointercancel: handlePointerCancel,
    onContextmenu: handleContextMenu,
    onTouchmove: handleTouchMove,
  }))

  const contentWrapperHandlers = computed(() => ({
    onPointerdown: handleContentPanStart,
    onPointermove: handleContentPan,
    onPointerup: handleContentPanEnd,
    onPointercancel: handlePointerCancel,
    onContextmenu: handleContextMenu,
    onTouchmove: handleSheetScroll,
  }))

  return {
    isDragging,
    preventContentScroll,
    contentTouchAction,
    headerFooterHandlers,
    contentWrapperHandlers,
    scrollEnd,
  }
}
