/**
 * tldraw v4 snapshot helpers.
 *
 * In v4.5.3, getSnapshot() and loadSnapshot() live on the Editor instance,
 * but TypeScript definitions from the re-exported Editor type may not expose them.
 * This thin wrapper casts to `any` once so callers stay clean.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export function editorGetSnapshot(editor: unknown): unknown {
  return (editor as any).getSnapshot();
}

export function editorLoadSnapshot(editor: unknown, snapshot: unknown): void {
  (editor as any).loadSnapshot(snapshot);
}
