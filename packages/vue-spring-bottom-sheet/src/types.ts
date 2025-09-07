import type { RendererElement } from 'vue'

export interface BottomSheetProps {
  duration?: number
  snapPoints?: Array<number | `${number}%`>
  initialSnapPoint?: number
  blocking?: boolean
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
}
