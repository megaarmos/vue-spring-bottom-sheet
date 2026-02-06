import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'
import { ref, type Ref, type ShallowRef } from 'vue'

export interface UseFocusManagementOptions {
  sheetRef: ShallowRef<HTMLElement | null>
  backdropRef: ShallowRef<HTMLElement | null>
  blocking: Ref<boolean>
  onEscape: () => void
}

/**
 * Manage focus trap and aria-expanded observer for accessibility.
 * Handles keyboard escape, focus trapping, and pausing trap when
 * nested aria-expanded elements (like dropdowns) are open.
 */
export function useFocusManagement(options: UseFocusManagementOptions) {
  const { sheetRef, backdropRef, blocking, onEscape } = options

  const ariaExpandedObserver = ref<MutationObserver | null>(null)

  const focusTrap = useFocusTrap([sheetRef, backdropRef], {
    immediate: false,
    fallbackFocus: () => sheetRef.value || document.body,
  })

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onEscape()
    }
  }

  const setupAriaExpandedObserver = () => {
    if (!sheetRef.value) return

    ariaExpandedObserver.value = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'aria-expanded') {
          const target = mutation.target as HTMLElement
          const isExpanded = target.getAttribute('aria-expanded') === 'true'

          if (isExpanded) {
            focusTrap.pause()
          } else {
            const hasExpandedElements = sheetRef.value?.querySelector('[aria-expanded="true"]')
            if (!hasExpandedElements) {
              focusTrap.unpause()
            }
          }
        }
      }
    })

    ariaExpandedObserver.value.observe(sheetRef.value, {
      attributes: true,
      attributeFilter: ['aria-expanded'],
      subtree: true,
    })
  }

  const cleanupAriaExpandedObserver = () => {
    if (ariaExpandedObserver.value) {
      ariaExpandedObserver.value.disconnect()
      ariaExpandedObserver.value = null
    }
  }

  const activate = () => {
    if (blocking.value) {
      focusTrap.activate()
      setupAriaExpandedObserver()
    }
    window.addEventListener('keydown', handleEscapeKey)
  }

  const deactivate = () => {
    window.removeEventListener('keydown', handleEscapeKey)
    cleanupAriaExpandedObserver()
    if (blocking.value) {
      focusTrap.deactivate()
    }
  }

  const cleanup = () => {
    cleanupAriaExpandedObserver()
    focusTrap.deactivate()
  }

  return {
    activate,
    deactivate,
    cleanup,
  }
}
