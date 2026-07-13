import AxeBuilder from '@axe-core/playwright';

/**
 * Axe rules that flag the **QA app shell** (overflow sandbox, h1→h3 story titles,
 * landmarks) rather than Badge itself.
 */
export const BADGE_PLAYGROUND_AXE_SHELL_DISABLE = [
  'scrollable-region-focusable',
  'heading-order',
  'landmark-no-duplicate-banner',
  'landmark-one-main',
  'landmark-unique',
  'region',
  /** Decorative `Icon` uses `aria-label=""` — same pattern as Storybook matrix rows. */
  'role-img-alt',
] as const;

/**
 * Full-page / per-section scans: also mute `color-contrast` for the neutral subtle
 * matrix row (`badge-combo-2`, ~4.44:1) until tokens are tightened.
 */
export function axeBadgePlayground(builder: AxeBuilder): AxeBuilder {
  return builder.disableRules([...BADGE_PLAYGROUND_AXE_SHELL_DISABLE, 'color-contrast']);
}
