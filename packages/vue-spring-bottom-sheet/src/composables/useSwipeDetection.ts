import { ref } from 'vue'

export interface SwipeResult {
  direction: 'up' | 'down' | 'none'
  velocity: number
  isSwipe: boolean
}

export interface UseSwipeDetectionOptions {
  velocityThreshold?: number
}

export function useSwipeDetection(options: UseSwipeDetectionOptions = {}) {
  const { velocityThreshold = 0.5 } = options // px/ms

  const startY = ref(0)
  const startTime = ref(0)
  const lastY = ref(0)
  const lastTime = ref(0)

  // Track recent positions for velocity calculation
  const recentPositions = ref<Array<{ y: number; time: number }>>([])
  const maxPositions = 5 // Keep last 5 positions for smoothing

  const start = (y: number) => {
    const now = performance.now()
    startY.value = y
    startTime.value = now
    lastY.value = y
    lastTime.value = now
    recentPositions.value = [{ y, time: now }]
  }

  const update = (y: number) => {
    const now = performance.now()
    lastY.value = y
    lastTime.value = now

    // Add to recent positions
    recentPositions.value.push({ y, time: now })

    // Keep only recent positions (last 100ms or maxPositions)
    const cutoffTime = now - 100
    recentPositions.value = recentPositions.value
      .filter((p) => p.time > cutoffTime)
      .slice(-maxPositions)
  }

  const end = (): SwipeResult => {
    const positions = recentPositions.value

    // Calculate velocity from recent positions
    let velocity = 0

    if (positions.length >= 2) {
      const oldest = positions[0]
      const newest = positions[positions.length - 1]
      const deltaY = newest.y - oldest.y
      const deltaTime = newest.time - oldest.time

      if (deltaTime > 0) {
        velocity = deltaY / deltaTime // px/ms (positive = down, negative = up)
      }
    }

    const isSwipe = Math.abs(velocity) >= velocityThreshold
    let direction: 'up' | 'down' | 'none' = 'none'

    if (isSwipe) {
      direction = velocity < 0 ? 'up' : 'down'
    }

    // Reset state
    recentPositions.value = []

    return {
      direction,
      velocity: Math.abs(velocity),
      isSwipe,
    }
  }

  return {
    start,
    update,
    end,
  }
}
