/**
 * useDocumentTheme.ts
 *
 * Subscribe to `<html data-theme="...">` so React components re-render when
 * the active theme changes. Backed by `useSyncExternalStore` for SSR-safety
 * and tear-free reads.
 *
 * The Storybook addon-themes decorator and platform layout both write
 * `data-theme="light|dark"` on `document.documentElement`. Components that
 * derive behaviour from the active theme — e.g. the Surface step cascade,
 * which flips its contrast direction in dark mode — need to react to
 * those writes instead of reading the dataset once.
 */

import { useSyncExternalStore } from 'react';

export type DocumentTheme = 'light' | 'dark';

function readTheme(): DocumentTheme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function subscribe(notify: () => void): () => void {
  if (typeof document === 'undefined') return () => {};
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  return () => observer.disconnect();
}

/**
 * Returns the current document-level theme and triggers a re-render when
 * `<html data-theme>` changes. Returns `'light'` on the server.
 */
export function useDocumentTheme(): DocumentTheme {
  return useSyncExternalStore(subscribe, readTheme, () => 'light');
}
