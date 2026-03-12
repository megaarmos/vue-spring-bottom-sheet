import { ref } from 'vue'

export interface SwipeResult {
  direction: 'up' | 'down' | 'none'
  velocity: number
  isSwipe: boolean
}

interface Sample {
  y: number
  time: number
}

const MAX_SAMPLES = 5
const SWIPE_THRESHOLD = 30 // px
const VELOCITY_THRESHOLD = 400 // px/s

export function useSwipeDetection() {
  const samples = ref<Sample[]>([])

  function start(y: number) {
    samples.value = [{ y, time: performance.now() }]
  }

  function update(y: number) {
    const s = samples.value
    s.push({ y, time: performance.now() })
    if (s.length > MAX_SAMPLES) {
      s.shift()
    }
  }

  function end(): SwipeResult {
    const s = samples.value
    if (s.length < 2) {
      return { direction: 'none', velocity: 0, isSwipe: false }
    }

    const first = s[0]
    const last = s[s.length - 1]

    if (!first || !last) {
      return { direction: 'none', velocity: 0, isSwipe: false }
    }

    const deltaY = first.y - last.y
    const elapsed = (last.time - first.time) / 1000

    const velocity = elapsed > 0 ? Math.abs(deltaY) / elapsed : 0
    const isSwipe = Math.abs(deltaY) >= SWIPE_THRESHOLD && velocity >= VELOCITY_THRESHOLD

    let direction: SwipeResult['direction'] = 'none'
    if (isSwipe) {
      direction = deltaY > 0 ? 'up' : 'down'
    }

    samples.value = []

    return { direction, velocity, isSwipe }
  }

  return { start, update, end }
}
