import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { useSpring } from '../useSpring'

// Mock rAF to run synchronously with controllable timestamps
let rafCallbacks: Array<{ id: number; cb: FrameRequestCallback }> = []
let nextRafId = 1

function mockRaf(cb: FrameRequestCallback): number {
  const id = nextRafId++
  rafCallbacks.push({ id, cb })
  return id
}

function mockCancelRaf(id: number) {
  rafCallbacks = rafCallbacks.filter((entry) => entry.id !== id)
}

/** Advance all pending rAF callbacks by one frame at the given timestamp */
function flushRaf(timestamp: number) {
  const pending = rafCallbacks
  rafCallbacks = []
  for (const { cb } of pending) {
    cb(timestamp)
  }
}

/** Run rAF frames until the spring settles or maxFrames is reached */
function runUntilSettled(maxFrames = 500, dtMs = 16) {
  let time = 0
  for (let i = 0; i < maxFrames; i++) {
    time += dtMs
    flushRaf(time)
    if (rafCallbacks.length === 0) return time
  }
  return time
}

describe('useSpring', () => {
  beforeEach(() => {
    rafCallbacks = []
    nextRafId = 1
    vi.stubGlobal('requestAnimationFrame', mockRaf)
    vi.stubGlobal('cancelAnimationFrame', mockCancelRaf)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should animate value towards target', () => {
    const value = ref(100)
    const spring = useSpring(value)

    spring.springTo(0)
    runUntilSettled()

    expect(value.value).toBe(0)
  })

  it('should call onSettle callback when animation completes', () => {
    const value = ref(100)
    const spring = useSpring(value)
    const onSettle = vi.fn()

    spring.springTo(0, onSettle)
    runUntilSettled()

    expect(onSettle).toHaveBeenCalledOnce()
  })

  it('cancel() should stop animation and clear callback', () => {
    const value = ref(100)
    const spring = useSpring(value)
    const onSettle = vi.fn()

    spring.springTo(0, onSettle)
    // Run a couple of frames to start animation
    flushRaf(16)
    flushRaf(32)

    expect(spring.isAnimating).toBe(true)

    spring.cancel()

    expect(spring.isAnimating).toBe(false)
    // Value should NOT be at target — animation was interrupted
    expect(value.value).not.toBe(0)
    // No more rAF callbacks queued
    expect(rafCallbacks.length).toBe(0)

    // Run more frames — callback should never fire
    flushRaf(48)
    flushRaf(64)
    expect(onSettle).not.toHaveBeenCalled()
  })

  it('springTo() after cancel() should start fresh animation', () => {
    const value = ref(100)
    const spring = useSpring(value)
    const firstCallback = vi.fn()
    const secondCallback = vi.fn()

    // Start first animation
    spring.springTo(0, firstCallback)
    flushRaf(16)
    flushRaf(32)

    // Cancel
    spring.cancel()
    expect(spring.isAnimating).toBe(false)

    // Start new animation
    spring.springTo(50, secondCallback)
    expect(spring.isAnimating).toBe(true)

    runUntilSettled()

    expect(value.value).toBe(50)
    expect(firstCallback).not.toHaveBeenCalled()
    expect(secondCallback).toHaveBeenCalledOnce()
  })

  it('springTo() while animating should update target and callback without restarting', () => {
    const value = ref(100)
    const spring = useSpring(value)
    const firstCallback = vi.fn()
    const secondCallback = vi.fn()

    // Start animating to 0
    spring.springTo(0, firstCallback)
    flushRaf(16)
    flushRaf(32)

    // Redirect to 50 — replaces callback
    spring.springTo(50, secondCallback)

    runUntilSettled()

    expect(value.value).toBe(50)
    // First callback was replaced, so it should NOT be called
    expect(firstCallback).not.toHaveBeenCalled()
    expect(secondCallback).toHaveBeenCalledOnce()
  })
})
