/**
 * Display-only formatting helpers for CodePreview.
 * Generation logic lives in storybookJsxPreview / storybookPlaygroundState.
 */

/** Ensures code renders with a trailing newline inside the scroll container. */
export function normalizeCodeForDisplay(code: string): string {
  if (!code) return '';
  return code.endsWith('\n') ? code : `${code}\n`;
}
