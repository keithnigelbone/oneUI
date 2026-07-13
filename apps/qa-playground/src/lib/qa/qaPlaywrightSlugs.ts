/** Slugs with `public/qa-reports/<slug>-summary.json` from Playwright ingest. */
export const QA_PLAYWRIGHT_SLUGS = [
  'button',
  'checkbox',
  'counter-badge',
  'indicator-badge',
  'avatar',
  'badge',
  'divider',
  'radio',
  'radio-field',
  'switch',
  'stepper',
  'slider',
  'touch-slider',
  'icon',
  'icon-button',
  'icon-contained',
  'image',
  'selectable-button',
  'single-text-button',
  'chip',
  'chip-group',
  'circular-progress-indicator',
  'bottom-navigation',
  'pagination',
  'pagination-dots',
  'tabs',
  'web-header',
  'input',
  'input-dynamic-text',
  'input-feedback',
  'input-field',
  'selectable-icon-button',
  'selectable-single-text-button',
  'tooltip',
  'modal',
  'checkbox-field',
  'segmented-control',
  'text',
] as const;

export type QAPlaywrightSlug = (typeof QA_PLAYWRIGHT_SLUGS)[number];

export function isQaPlaywrightSlug(slug: string): slug is QAPlaywrightSlug {
  return (QA_PLAYWRIGHT_SLUGS as readonly string[]).includes(slug);
}

export function qaPlaywrightReportUrl(slug: string, cacheBust: number): string {
  const base = import.meta.env.BASE_URL;
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}qa-reports/${slug}-summary.json?t=${cacheBust}`;
}

export function qaPlaywrightReportHistoryUrl(slug: string, cacheBust: number): string {
  const base = import.meta.env.BASE_URL;
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}qa-reports/${slug}-summary-history.json?t=${cacheBust}`;
}
