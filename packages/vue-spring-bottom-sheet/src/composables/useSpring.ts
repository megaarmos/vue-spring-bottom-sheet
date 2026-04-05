import { ref, onUnmounted, type Ref } from 'vue'

export interface SpringConfig {
  mass: number
  stiffness: number
  damping: number
}

const DEFAULT_SPRING_CONFIG: SpringConfig = {
  mass: 1,
  stiffness: 300,
  damping: 30,
}

const SETTLE_THRESHOLD = 0.5
const VELOCITY_THRESHOLD = 0.5
const MAX_DELTA = 1 / 30 // Cap delta to avoid instability

/**
 * Creates a spring animator that drives an external ref.
 * Call `springTo()` for spring-animated transitions (on snap).
 * The ref can also be set directly (during drag) — call `sync()` before
 * starting a new spring to pick up the current value without animation.
 */
export function useSpring(
  target: Ref<number>,
  config: Partial<SpringConfig> = {},
) {
  const springConfig: SpringConfig = { ...DEFAULT_SPRING_CONFIG, ...config }

  let velocity = 0
  let animationFrame: number | null = null
  let lastTime = 0
  let isAnimating = false
  let springTarget = target.value
  let onSettleCallback: (() => void) | null = null

  function step(timestamp: number) {
    if (!isAnimating) return

    if (lastTime === 0) {
      lastTime = timestamp
      animationFrame = requestAnimationFrame(step)
      return
    }

    const dt = Math.min((timestamp - lastTime) / 1000, MAX_DELTA)
    lastTime = timestamp

    const displacement = target.value - springTarget
    const springForce = -springConfig.stiffness * displacement
    const dampingForce = -springConfig.damping * velocity
    const acceleration = (springForce + dampingForce) / springConfig.mass

    velocity += acceleration * dt
    target.value += velocity * dt

    if (Math.abs(displacement) < SETTLE_THRESHOLD && Math.abs(velocity) < VELOCITY_THRESHOLD) {
      target.value = springTarget
      velocity = 0
      isAnimating = false
      lastTime = 0
      animationFrame = null
      onSettleCallback?.()
      onSettleCallback = null
      return
    }

    animationFrame = requestAnimationFrame(step)
  }

  /**
   * Animate the ref to the target value using spring physics.
   * Picks up the current ref value and velocity.
   */
  function springTo(targetValue: number, onSettle?: () => void) {
    springTarget = targetValue
    onSettleCallback = onSettle ?? null

    if (isAnimating) return // Already running, just update target

    isAnimating = true
    lastTime = 0
    animationFrame = requestAnimationFrame(step)
  }

  /**
   * Sync internal state with the current ref value.
   * Call this before springTo() if the ref was changed externally (e.g. during drag).
   */
  function sync() {
    velocity = 0
  }

  /**
   * Cancel any running spring animation.
   */
  function cancel() {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame)
      animationFrame = null
    }
    isAnimating = false
    lastTime = 0
    velocity = 0
    onSettleCallback = null
  }

  /**
   * Set the current velocity (useful for matching drag velocity on release).
   */
  function setVelocity(v: number) {
    velocity = v
  }

  onUnmounted(cancel)

  return {
    springTo,
    sync,
    cancel,
    setVelocity,
    get isAnimating() {
      return isAnimating
    },
  }
}
