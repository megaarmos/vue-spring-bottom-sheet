import type { RendererElement } from 'vue'

export interface SpringConfig {
  mass?: number
  stiffness?: number
  damping?: number
}

export interface MorphingConfig {
  /** Horizontal inset in compact state (px). Default: 16 */
  compactHorizontalInset?: number
  /** Bottom inset in compact state (px). Default: 16 */
  compactBottomInset?: number
  /** Corner radius in compact state (px). Default: 20 */
  compactCornerRadius?: number
  /** Corner radius in expanded state (px). Default: 0 */
  expandedCornerRadius?: number
  /** Corner radius in fullscreen state (px). Default: 0 */
  fullscreenCornerRadius?: number
}

export interface BottomSheetProps {
  duration?: number
  snapPoints?: Array<number | `${number}%`>
  initialSnapPoint?: number
  blocking?: boolean
  forceMount?: boolean
  canSwipeClose?: boolean
  swipeCloseThreshold?: string | number
  canBackdropClose?: boolean
  expandOnContentDrag?: boolean
  modelValue?: boolean
  teleportTo?: string | RendererElement
  teleportDefer?: boolean
  headerClass?: string
  contentClass?: string
  footerClass?: string
  /**
   * Enable iOS 26-like morphing behavior.
   * When enabled, the sheet morphs from a floating card (compact)
   * to edge-to-edge (expanded) to fullscreen.
   * Requires at least 2 snap points (ideally 3 for compact/expanded/fullscreen).
   */
  morphing?: boolean | MorphingConfig
  /**
   * Spring physics configuration for animations.
   * When provided, replaces CSS ease transitions with spring-based animations.
   */
  springConfig?: SpringConfig
}
