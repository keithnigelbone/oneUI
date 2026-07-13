/**
 * useStyleInjection
 *
 * Shared hook for injecting brand CSS into a singleton <style> element.
 * Used by both FoundationStyleProvider (platform) and BrandStyleInjector (Storybook).
 *
 * Features:
 *   - useInsertionEffect: CSS is ready before React touches the DOM
 *   - data-brand-switching: blocks transitions for one frame during swap
 *   - data-brand-ready: signals that brand CSS has been injected (loading guard)
 *   - Element + last-written caching: avoids redundant DOM reads
 */

'use client';

import { useInsertionEffect, useRef } from 'react';

/**
 * Injects `css` into a singleton <style> element identified by `styleId`.
 * Creates the element on first call; subsequent calls update in-place.
 *
 * Pass the "effective" CSS (after bridge resolution) — this hook handles
 * the DOM write, transition blocking, and brand-ready signalling.
 */
export function useStyleInjection(styleId: string, css: string): void {
  const elRef = useRef<HTMLStyleElement | null>(null);
  const lastWrittenRef = useRef('');

  useInsertionEffect(() => {
    const next = css || '';

    const liveEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!elRef.current || !elRef.current.isConnected || (liveEl && liveEl !== elRef.current)) {
      elRef.current = liveEl;
      lastWrittenRef.current = liveEl?.textContent ?? '';
    }

    if (!elRef.current) {
      elRef.current = document.createElement('style');
      elRef.current.id = styleId;
      document.head.appendChild(elRef.current);
    }

    if (lastWrittenRef.current === next && elRef.current.textContent === next) return;

    document.documentElement.setAttribute('data-brand-switching', 'true');
    elRef.current.textContent = next;
    lastWrittenRef.current = next;

    if (next) {
      document.documentElement.setAttribute('data-brand-ready', 'true');
    } else {
      document.documentElement.removeAttribute('data-brand-ready');
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() =>
        document.documentElement.removeAttribute('data-brand-switching')
      );
    });
  });
}
