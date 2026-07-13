/** Registry of inspectable OneUI components keyed by inspector id. */
const entries = new Map<string, { name: string; props: Record<string, unknown> }>()

export function registerInspector(
  id: string,
  name: string,
  props: Record<string, unknown>,
): () => void {
  entries.set(id, { name, props })
  return () => entries.delete(id)
}

export function updateInspectorProps(id: string, props: Record<string, unknown>) {
  const existing = entries.get(id)
  if (existing) entries.set(id, { ...existing, props })
}

export function getInspectorEntry(id: string | undefined) {
  if (!id) return undefined
  return entries.get(id)
}

/** Find the innermost inspectable wrapper under the pointer. */
export function findInspectableElement(x: number, y: number): HTMLElement | null {
  const stack = document.elementsFromPoint(x, y)
  for (const node of stack) {
    if (!(node instanceof HTMLElement)) continue
    const match = node.closest('[data-qa-inspect]')
    if (match instanceof HTMLElement) return match
  }
  return null
}

/** Layout primitives — skip inspection; QA cares about leaf/interactive components. */
const SKIP_COMPONENTS = new Set([
  'Container',
  'TabPanel',
  'Divider',
])

export function shouldInspectComponent(name: string): boolean {
  return !SKIP_COMPONENTS.has(name)
}
