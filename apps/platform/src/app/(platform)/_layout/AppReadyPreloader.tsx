'use client';

/**
 * Effects-only component that owns the platform preloader handshake:
 *
 *   1. Once shell-critical data is ready (brands, current brand, foundations)
 *      AND brand CSS has been injected (`data-brand-ready` on <html>, set by
 *      useStyleInjection), dispatch `oneui:app-ready` so the preloader fades.
 *      The active brand font is warmed in parallel but never blocks reveal —
 *      `font-display: swap` covers the rare cold-CDN case.
 *
 *   2. Push status text to `window.__preloaderPushStatus` while we wait so
 *      the preloader rotator alternates between status + a friendly message.
 *
 *   3. Stop the preloader logo cycling animation once `currentBrand`
 *      resolves, landing on the active brand's logo SVG.
 *
 * Renders `null` — this is purely effect glue. Lives next to the rest of
 * the FOUC-prevention surface in `_layout/`.
 */

import { useEffect, useRef } from 'react';
import { waitForActiveBrandFont } from './lib/brandFontWait';
import { perfMark, reportAppReady } from '@/lib/perfMarks';

interface AppReadyPreloaderProps {
  brands: ReadonlyArray<unknown> | undefined;
  currentBrand: { logoSvg?: string } | null;
  foundationData: unknown;
}

/** Safety valve: never hold the preloader longer than this past data-ready. */
const BRAND_CSS_WAIT_TIMEOUT_MS = 1000;

function isBrandCSSInjected(): boolean {
  return document.documentElement.getAttribute('data-brand-ready') === 'true';
}

export function AppReadyPreloader({
  brands,
  currentBrand,
  foundationData,
}: AppReadyPreloaderProps): null {
  const appReadyFired = useRef(false);
  const preloaderStopped = useRef(false);

  useEffect(() => {
    if (appReadyFired.current) return;
    if (brands === undefined || !currentBrand || foundationData === undefined) return;

    perfMark('shell-data-ready');

    const fire = () => {
      if (appReadyFired.current) return;
      appReadyFired.current = true;
      perfMark('brand-css-injected');
      window.dispatchEvent(new CustomEvent('oneui:app-ready'));
      reportAppReady();
    };

    // Warm the brand font in parallel — intentionally not awaited.
    void waitForActiveBrandFont();

    if (isBrandCSSInjected()) {
      fire();
      return;
    }

    // Brand CSS not injected yet — observe the data-brand-ready attribute
    // (set by useStyleInjection) with a timeout safety valve.
    const observer = new MutationObserver(() => {
      if (isBrandCSSInjected()) fire();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-brand-ready'],
    });
    const fallback = setTimeout(fire, BRAND_CSS_WAIT_TIMEOUT_MS);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, [brands, currentBrand, foundationData]);

  // Preloader status text — alternates with the rotator in root layout.
  useEffect(() => {
    if (appReadyFired.current) return;
    const push = (window as Window & { __preloaderPushStatus?: (msg: string) => void })
      .__preloaderPushStatus;
    if (brands === undefined) {
      perfMark('waiting-brands');
      push?.('connecting…');
    } else if (!currentBrand) {
      perfMark('brands-resolved');
      push?.('loading brands…');
    } else if (foundationData === undefined) {
      perfMark('brand-resolved');
      push?.('loading foundations…');
    } else {
      perfMark('foundations-resolved');
    }
  }, [brands, currentBrand, foundationData]);

  // Stop the logo cycling animation and land on the active brand's logo.
  useEffect(() => {
    if (preloaderStopped.current) return;
    const preloader = document.getElementById('app-preloader');
    if (!preloader || preloader.getAttribute('data-ready') === 'true') return;
    if (!currentBrand) return;

    preloaderStopped.current = true;
    const targetSvg = currentBrand.logoSvg ?? '';
    const stopFn = (window as Window & { __preloaderSetLogo?: (svg: string) => void })
      .__preloaderSetLogo;

    if (stopFn) {
      stopFn(targetSvg);
    }
  }, [currentBrand]);

  return null;
}
