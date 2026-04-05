import { computed, type CSSProperties, type Ref } from 'vue'

export interface MorphingConfig {
  /** Horizontal inset in compact state (px). Default: 16 */
  compactHorizontalInset: number
  /** Bottom inset in compact state (px). Default: 16 */
  compactBottomInset: number
  /** Corner radius in compact state (px). Default: 20 */
  compactCornerRadius: number
  /** Corner radius in expanded state (px). Default: 0 */
  expandedCornerRadius: number
  /** Corner radius in fullscreen state (px). Default: 0 */
  fullscreenCornerRadius: number
}

const DEFAULT_MORPHING_CONFIG: MorphingConfig = {
  compactHorizontalInset: 16,
  compactBottomInset: 16,
  compactCornerRadius: 20,
  expandedCornerRadius: 0,
  fullscreenCornerRadius: 0,
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v))
}

/**
 * Computes morphing container styles based on the current sheet height
 * and the defined snap points for compact / expanded / fullscreen states.
 *
 * The snap points array must have exactly 3 entries (sorted ascending by resolved pixel height):
 *   [compact, expanded, fullscreen]
 *
 * Between compact→expanded:
 *   - horizontalInset interpolates from compactHorizontalInset → 0
 *   - bottomInset interpolates from compactBottomInset → 0
 *   - cornerRadius interpolates from compactCornerRadius → expandedCornerRadius
 *
 * Between expanded→fullscreen:
 *   - insets stay at 0
 *   - cornerRadius interpolates from expandedCornerRadius → fullscreenCornerRadius
 */
export function useMorphing(
  currentHeight: Ref<number>,
  sortedSnapHeights: Ref<number[]>,
  config: Partial<MorphingConfig> = {},
) {
  const cfg: MorphingConfig = { ...DEFAULT_MORPHING_CONFIG, ...config }

  const morphProgress = computed(() => {
    const snaps = sortedSnapHeights.value
    if (snaps.length < 2) {
      return { compactToExpanded: 0, expandedToFullscreen: 0 }
    }

    const h = currentHeight.value
    const compact = snaps[0]!
    const expanded = snaps.length >= 3 ? snaps[1]! : snaps[1]!
    const fullscreen = snaps.length >= 3 ? snaps[2]! : snaps[1]!

    const compactToExpanded =
      expanded > compact ? clamp01((h - compact) / (expanded - compact)) : h >= compact ? 1 : 0

    const expandedToFullscreen =
      snaps.length >= 3 && fullscreen > expanded
        ? clamp01((h - expanded) / (fullscreen - expanded))
        : 0

    return { compactToExpanded, expandedToFullscreen }
  })

  const horizontalInset = computed(() => {
    const { compactToExpanded } = morphProgress.value
    return lerp(cfg.compactHorizontalInset, 0, compactToExpanded)
  })

  const bottomInset = computed(() => {
    const { compactToExpanded } = morphProgress.value
    return lerp(cfg.compactBottomInset, 0, compactToExpanded)
  })

  const cornerRadius = computed(() => {
    const { compactToExpanded, expandedToFullscreen } = morphProgress.value
    const radiusAfterExpand = lerp(cfg.compactCornerRadius, cfg.expandedCornerRadius, compactToExpanded)
    return lerp(radiusAfterExpand, cfg.fullscreenCornerRadius, expandedToFullscreen)
  })

  const morphStyle = computed<CSSProperties>(() => {
    const hInset = horizontalInset.value
    const bInset = bottomInset.value
    const radius = cornerRadius.value

    return {
      left: `${hInset}px`,
      right: `${hInset}px`,
      bottom: `${bInset}px`,
      borderRadius: `${radius}px ${radius}px ${radius > 0 ? radius : 0}px ${radius > 0 ? radius : 0}px`,
    }
  })

  return {
    morphProgress,
    horizontalInset,
    bottomInset,
    cornerRadius,
    morphStyle,
  }
}
