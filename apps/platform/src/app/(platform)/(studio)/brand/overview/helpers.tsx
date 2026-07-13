/**
 * brand/overview/helpers.tsx
 *
 * Module-scope utilities for the Brand Overview page. Pulled out of
 * OverviewContent.tsx so they can be tree-shaken away from any consumer
 * that re-renders the page (the orchestrator) without dragging hundreds
 * of LOC of regex / JSX along.
 */

import React from 'react';
import { X } from 'lucide-react';
import styles from './page.module.css';

export function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

export function NotConfigured({ message }: { message: string }) {
  return (
    <div className={styles.notConfiguredBox}>
      <X size={16} />
      <span>{message}</span>
    </div>
  );
}

/**
 * Normalize an uploaded SVG so its fills/strokes inherit from CSS `color`.
 *
 * When a brand has an explicit logo-color override configured in the
 * Appearance editor, we want the SVG to adopt `--Logo-color` (which is set
 * on the logo container via CSS). SVG paths only pick up the parent's
 * `color` if they reference `currentColor`, so any hardcoded `fill="#hex"`
 * / `style="fill: …"` / embedded `<style>` rules need to be rewritten.
 *
 * Preserves `none`, `transparent`, and existing `currentColor` so negative
 * space and transparent layers stay intact. Stroke is normalized too so
 * outline-style logos recolor correctly.
 */
export function recolorSvgToCurrentColor(svg: string): string {
  const preserved = /^(none|transparent|currentColor|inherit)$/i;
  const replaceCssDecls = (css: string) =>
    css.replace(
      /\b(fill|stroke)\s*:\s*([^;}!]+)(\s*!important)?/gi,
      (mm: string, prop: string, value: string, bang?: string) =>
        preserved.test(value.trim()) ? mm : `${prop}: currentColor${bang ?? ''}`
    );

  let result = svg.replace(
    /<style\b([^>]*)>([\s\S]*?)<\/style>/gi,
    (_m, attrs: string, css: string) => `<style${attrs}>${replaceCssDecls(css)}</style>`
  );

  result = result.replace(
    /\b(fill|stroke)=(["'])([^"']+)\2/gi,
    (match, attr: string, quote: string, value: string) =>
      preserved.test(value.trim()) ? match : `${attr}=${quote}currentColor${quote}`
  );

  result = result.replace(
    /style=(["'])([^"']*)\1/gi,
    (_m, quote: string, styles: string) => `style=${quote}${replaceCssDecls(styles)}${quote}`
  );

  return result;
}
