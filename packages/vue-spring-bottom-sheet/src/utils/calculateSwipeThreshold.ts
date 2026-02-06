/**
 * Calculate the swipe close threshold based on prop value and current height.
 * Supports absolute pixel values, percentage strings, or defaults to half height.
 */
export function calculateSwipeThreshold(
  threshold: string | number | undefined,
  height: number,
): number {
  if (threshold === undefined) {
    return height / 2
  }

  if (typeof threshold === 'number') {
    return threshold
  }

  if (typeof threshold === 'string' && threshold.includes('%')) {
    const percentage = Number(threshold.replace('%', ''))
    return height * (percentage / 100)
  }

  return height / 2
}
