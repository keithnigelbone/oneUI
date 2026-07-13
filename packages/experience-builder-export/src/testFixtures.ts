/**
 * testFixtures.ts — test-only constants for the export package.
 *
 * The export package cannot import from `apps/platform` (cross-boundary), so the
 * eval default viewport is mirrored here purely so the Pitfall-5 regression test
 * ("export never uses the eval mobile default") is self-contained. Kept in sync
 * with `apps/platform/src/lib/playwrightRenderer.ts` DEFAULT_VIEWPORTS.mobile.
 */
export const DEFAULT_VIEWPORTS = {
  mobile: { width: 390, height: 844, label: 'mobile' },
} as const;
