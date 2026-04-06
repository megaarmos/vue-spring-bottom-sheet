import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import BottomSheet from '../BottomSheet.vue'

/*
 * Race Condition Tests
 *
 * These tests verify that reopening the bottom sheet during a closing animation
 * does not produce spurious events or leave the component in a broken state.
 *
 * We mock requestAnimationFrame and timers to control animation timing.
 */

// --- rAF mock infrastructure ---
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

function flushRaf(timestamp: number) {
  const pending = rafCallbacks
  rafCallbacks = []
  for (const { cb } of pending) {
    cb(timestamp)
  }
}

function runUntilSettled(maxFrames = 500, dtMs = 16) {
  let time = 0
  for (let i = 0; i < maxFrames; i++) {
    time += dtMs
    flushRaf(time)
    if (rafCallbacks.length === 0) return time
  }
  return time
}

// --- Mock getBoundingClientRect to return consistent dimensions ---
function mockBoundingClientRect() {
  const original = Element.prototype.getBoundingClientRect
  Element.prototype.getBoundingClientRect = function () {
    // Return a sensible default for all elements
    return {
      x: 0,
      y: 0,
      width: 375,
      height: 300,
      top: 0,
      right: 375,
      bottom: 300,
      left: 0,
      toJSON() {
        return this
      },
    }
  }
  return () => {
    Element.prototype.getBoundingClientRect = original
  }
}

function createWrapper(props: Record<string, unknown> = {}) {
  return mount(BottomSheet, {
    props: {
      modelValue: false,
      blocking: false,
      teleportTo: 'body',
      ...props,
    },
    slots: {
      default: '<div>Content</div>',
      header: '<div>Header</div>',
      footer: '<div>Footer</div>',
    },
    attachTo: document.body,
  })
}

describe('BottomSheet race condition: reopen during close', () => {
  let restoreBoundingClientRect: () => void

  beforeEach(() => {
    rafCallbacks = []
    nextRafId = 1
    vi.stubGlobal('requestAnimationFrame', mockRaf)
    vi.stubGlobal('cancelAnimationFrame', mockCancelRaf)
    vi.useFakeTimers()
    restoreBoundingClientRect = mockBoundingClientRect()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
    restoreBoundingClientRect()
  })

  describe('with spring animation', () => {
    const springProps = {
      springConfig: { mass: 1, stiffness: 300, damping: 30 },
    }

    it('should not emit closed when reopened during spring close animation', async () => {
      const wrapper = createWrapper(springProps)

      // Open the sheet
      await wrapper.setProps({ modelValue: true })
      await nextTick()
      await nextTick()
      // Flush rAF for open animation to complete
      runUntilSettled()

      // Start closing
      await wrapper.setProps({ modelValue: false })
      await nextTick()

      // Run a few frames of close animation (but don't let it settle)
      flushRaf(16)
      flushRaf(32)

      // Reopen while closing animation is still running
      await wrapper.setProps({ modelValue: true })
      await nextTick()
      await nextTick()

      // Let all animations settle
      runUntilSettled()

      // 'closed' should NOT have been emitted since we reopened before animation finished
      const closedEvents = wrapper.emitted('closed') || []
      expect(closedEvents.length).toBe(0)

      wrapper.unmount()
    })

    it('should allow closing again after reopen-during-close (isClosing not stuck)', async () => {
      const wrapper = createWrapper(springProps)

      // Open
      await wrapper.setProps({ modelValue: true })
      await nextTick()
      await nextTick()
      runUntilSettled()

      // Close (start animation)
      await wrapper.setProps({ modelValue: false })
      await nextTick()
      flushRaf(16)
      flushRaf(32)

      // Reopen during close
      await wrapper.setProps({ modelValue: true })
      await nextTick()
      await nextTick()
      runUntilSettled()

      // Now close again — this should work (isClosing should not be stuck at true)
      await wrapper.setProps({ modelValue: false })
      await nextTick()
      runUntilSettled()

      // 'closing-started' should have been emitted for the second close
      const closingStartedEvents = wrapper.emitted('closing-started') || []
      expect(closingStartedEvents.length).toBe(2)

      wrapper.unmount()
    })
  })

  describe('with CSS transition (no spring)', () => {
    const cssProps = {
      duration: 250,
      // No springConfig = CSS transitions
    }

    it('should not emit closed when reopened during CSS close animation', async () => {
      const wrapper = createWrapper(cssProps)

      // Open
      await wrapper.setProps({ modelValue: true })
      await nextTick()
      await nextTick()
      runUntilSettled()
      vi.advanceTimersByTime(300)

      // Close
      await wrapper.setProps({ modelValue: false })
      await nextTick()

      // Advance partway through the CSS duration
      vi.advanceTimersByTime(100)

      // Reopen before the setTimeout fires
      await wrapper.setProps({ modelValue: true })
      await nextTick()
      await nextTick()

      // Advance past the original duration — the old setTimeout should NOT fire
      vi.advanceTimersByTime(300)
      runUntilSettled()

      // 'closed' should NOT have been emitted
      const closedEvents = wrapper.emitted('closed') || []
      expect(closedEvents.length).toBe(0)

      wrapper.unmount()
    })

    it('should allow closing again after reopen-during-close with CSS transitions', async () => {
      const wrapper = createWrapper(cssProps)

      // Open
      await wrapper.setProps({ modelValue: true })
      await nextTick()
      await nextTick()
      runUntilSettled()
      vi.advanceTimersByTime(300)

      // Close
      await wrapper.setProps({ modelValue: false })
      await nextTick()
      vi.advanceTimersByTime(100)

      // Reopen during close
      await wrapper.setProps({ modelValue: true })
      await nextTick()
      await nextTick()
      vi.advanceTimersByTime(300)
      runUntilSettled()

      // Close again — should work
      await wrapper.setProps({ modelValue: false })
      await nextTick()

      // Let the full duration pass
      vi.advanceTimersByTime(300)

      // 'closing-started' should have fired twice (both close attempts)
      const closingStartedEvents = wrapper.emitted('closing-started') || []
      expect(closingStartedEvents.length).toBe(2)

      wrapper.unmount()
    })
  })
})
