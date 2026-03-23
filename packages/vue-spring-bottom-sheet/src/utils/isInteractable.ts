export function isInteractable(element: Element): boolean {
  const interactableElement = element.closest(
    'input, textarea, [contenteditable="true"], [contenteditable=""], [data-vsbs-no-drag]',
  )

  if (!interactableElement) {
    return false
  }

  return true
}
