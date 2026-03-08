export function isInteractable(element: Element): boolean {
  const htmlElement = element as HTMLElement

  // Has native click handler or interaction
  const isNaturallyClickable =
    element instanceof HTMLAnchorElement ||
    element instanceof HTMLButtonElement ||
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLLabelElement ||
    element instanceof HTMLVideoElement ||
    element instanceof HTMLAudioElement

  // Has click handler or role
  const hasClickHandler = element.hasAttribute('onclick') || element.hasAttribute('role') // button, link, tab, etc.

  // Is focusable
  const isFocusable = htmlElement.tabIndex >= 0 || element.hasAttribute('tabindex')

  // Is editable
  const isEditable =
    htmlElement.isContentEditable ||
    (element instanceof HTMLInputElement && !element.disabled) ||
    (element instanceof HTMLTextAreaElement && !element.disabled)

  return isNaturallyClickable || hasClickHandler || isFocusable || isEditable
}
