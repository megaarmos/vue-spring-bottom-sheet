import { useScrollLock } from '@vueuse/core'
import type { Ref } from 'vue'

export interface UseSheetScrollLockOptions {
  blocking: Ref<boolean>
}

/**
 * Manage scroll locking for the sheet.
 * When blocking mode is enabled, locks body scroll when sheet is open.
 * When non-blocking, temporarily locks during touch interactions.
 */
export function useSheetScrollLock(options: UseSheetScrollLockOptions) {
  const { blocking } = options

  const isWindowScrollLocked = useScrollLock(document.body)
  const isWindowRootScrollLocked = useScrollLock(document.documentElement)

  const lock = () => {
    isWindowScrollLocked.value = true
    isWindowRootScrollLocked.value = true
  }

  const unlock = () => {
    isWindowScrollLocked.value = false
    isWindowRootScrollLocked.value = false
  }

  const lockIfBlocking = () => {
    if (blocking.value) {
      lock()
    }
  }

  const unlockIfBlocking = () => {
    if (blocking.value) {
      unlock()
    }
  }

  const touchStartHandler = () => {
    if (!blocking.value) {
      lock()
    }
  }

  const touchEndHandler = () => {
    if (!blocking.value) {
      unlock()
    }
  }

  return {
    lock,
    unlock,
    lockIfBlocking,
    unlockIfBlocking,
    touchStartHandler,
    touchEndHandler,
  }
}
