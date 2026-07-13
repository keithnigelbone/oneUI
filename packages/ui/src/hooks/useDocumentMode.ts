/**
 * useDocumentMode.ts
 *
 * Subscribe to `<html data-mode="...">` so React components re-render when
 * the active mode (light/dark) changes. Backed by `useSyncExternalStore`
 * for SSR-safety and tear-free reads.
 *
 * The Storybook addon-themes decorator and platform layout both write
 * `data-mode="light|dark"` on `document.documentElement`. Components that
 * derive behaviour from the active mode — e.g. the Surface step cascade,
 * which flips its contrast direction in dark mode — need to react to
 * those writes instead of reading the dataset once.
 */

import { useSyncExternalStore } from 'react';

export type DocumentMode = 'light' | 'dark';

function readMode(): DocumentMode {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.dataset.mode === 'dark' ? 'dark' : 'light';
}

function subscribe(notify: () => void): () => void {
  if (typeof document === 'undefined') return () => {};
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-mode'],
  });
  return () => observer.disconnect();
}

/**
 * Returns the current document-level mode and triggers a re-render when
 * `<html data-mode>` changes. Returns `'light'` on the server.
 */
export function useDocumentMode(): DocumentMode {
  return useSyncExternalStore(subscribe, readMode, () => 'light');
}
