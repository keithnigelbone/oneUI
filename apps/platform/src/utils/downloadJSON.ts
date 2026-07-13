/**
 * Trigger a browser download of `data` serialised as pretty-printed JSON.
 *
 * Uses the standard Blob + object URL + temporary anchor pattern. The object
 * URL is revoked on the next tick to free memory; this is safe because the
 * browser starts the download synchronously when `.click()` fires.
 */
export function downloadJSON(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
