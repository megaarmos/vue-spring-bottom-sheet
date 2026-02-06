import { clamp } from 'remeda'
import { heightPercentToPixels } from './heightPercentToPixels'

/**
 * Resolve a snap point value (number or percentage string) to pixels
 */
export function resolveSnapPoint(snapValue: number | `${number}%`, windowHeight: number): number {
  if (typeof snapValue === 'number') {
    return clamp(snapValue, { max: windowHeight })
  }
  return heightPercentToPixels(snapValue, windowHeight)
}
