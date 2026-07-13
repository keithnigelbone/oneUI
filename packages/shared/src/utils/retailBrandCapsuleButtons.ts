/**
 * Retail brand quirks: persisted Actions/component themes vs product geometry.
 *
 * Tira (and prefixed slugs) historically stored non-pill `borderRadius` tokens for Buttons,
 * which resolve to modest px radii on both web (`border-radius`) and Flutter
 * (`BorderRadius.circular`). Design requires **full capsules** aligned with primary Actions.
 */

/** True when slug/name identifies the Tira retail line (capsule Buttons). */
export function retailBrandUsesTiraCapsuleActions(slug?: string | null, name?: string | null): boolean {
  const s = (slug ?? '').trim().toLowerCase();
  const n = (name ?? '').trim().toLowerCase();
  if (s === 'tira' || n === 'tira') return true;
  if (s.startsWith('tira-')) return true;
  return false;
}

const BUTTON_PILL = 'var(--Shape-Pill)';

/**
 * Flat map overlays — must match `toCSSValue('Shape-Pill')` (`componentPreviewStyles.ts`).
 *
 * `skipCssComponents` lists CSS component names that carry an explicit
 * theme/recipe/manual shape decision; those are left untouched so the persisted
 * decision wins over the historical capsule default.
 */
export function withRetailTiraCapsuleButtonRadii(
  flat: Record<string, string>,
  skipCssComponents?: ReadonlySet<string>,
): Record<string, string> {
  const next = { ...flat };
  if (!skipCssComponents?.has('Button')) next['--Button-borderRadius'] = BUTTON_PILL;
  if (!skipCssComponents?.has('IconButton')) next['--IconButton-borderRadius'] = BUTTON_PILL;
  return next;
}

/**
 * Apply capsule radii only for Tira; otherwise returns `flat` unchanged.
 *
 * The capsule is a DEFAULT, not an override: pass the CSS component names that
 * have an explicit shape decision via `skipCssComponents` so those keep their
 * persisted radius instead of being forced to a pill.
 */
export function maybeApplyRetailTiraCapsuleButtons(
  flat: Record<string, string>,
  slug?: string | null,
  name?: string | null,
  skipCssComponents?: ReadonlySet<string>,
): Record<string, string> {
  if (!retailBrandUsesTiraCapsuleActions(slug, name)) return flat;
  return withRetailTiraCapsuleButtonRadii(flat, skipCssComponents);
}
