/**
 * Resolve which sub-brand Convex id applies to a shape by walking up to its enclosing frame.
 */

export function getSubBrandIdForShape(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: { getShape: (id: string) => any },
  shapeId: string,
  frameSubBrandByFrameId: Record<string, string | null | undefined> | undefined,
): string | null {
  if (!frameSubBrandByFrameId || Object.keys(frameSubBrandByFrameId).length === 0) {
    return null;
  }

  let cur = editor.getShape(shapeId);
  const visited = new Set<string>();

  while (cur && !visited.has(cur.id)) {
    visited.add(cur.id);
    if (cur.type === 'frame') {
      const sel = frameSubBrandByFrameId[cur.id];
      return typeof sel === 'string' && sel.length > 0 ? sel : null;
    }
    cur = cur.parentId ? editor.getShape(cur.parentId) : null;
  }

  return null;
}
