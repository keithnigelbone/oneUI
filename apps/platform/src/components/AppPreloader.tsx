'use client';

import { useEffect } from 'react';

/**
 * AppPreloader
 *
 * Removes the server-rendered #app-preloader overlay when the platform
 * dispatches 'oneui:app-ready' (after Convex data resolves).
 *
 * Enforces a minimum display time (MIN_SHOW_MS) so the logo cycling
 * animation has time to run and the content behind the preloader has
 * time to fully load — preventing the "double load" effect where
 * the user sees content → skeleton → content.
 *
 * Falls back to 12s so it never sticks permanently on error.
 */

/** Minimum time (ms) the preloader stays visible after mount */
const MIN_SHOW_MS = process.env.NODE_ENV === 'development' ? 200 : 2000;


export function AppPreloader() {
  useEffect(() => {
    const mountedAt = Date.now();
    let dismissed = false;

    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;

      const el = document.getElementById('app-preloader');
      if (!el) return;
      el.setAttribute('data-ready', 'true');
      // Hide with CSS instead of removing — React owns this DOM node
      // and removing it causes insertBefore/removeChild errors during reconciliation
      setTimeout(() => { el.style.display = 'none'; }, 500);
    };

    const scheduleDismiss = () => {
      const elapsed = Date.now() - mountedAt;
      const remaining = Math.max(0, MIN_SHOW_MS - elapsed);
      if (remaining === 0) {
        dismiss();
      } else {
        setTimeout(dismiss, remaining);
      }
    };

    window.addEventListener('oneui:app-ready', scheduleDismiss, { once: true });
    const fallback = setTimeout(dismiss, 12_000);

    return () => {
      window.removeEventListener('oneui:app-ready', scheduleDismiss);
      clearTimeout(fallback);
    };
  }, []);

  return null;
}
