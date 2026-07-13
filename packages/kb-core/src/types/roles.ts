/**
 * Multi-accent role + surface mode vocabulary. Identical across every SDK —
 * the whole point of the shared core is that every kb-<sdk> references THESE
 * constants, not re-declared local copies.
 *
 * Source-of-truth alignment:
 *   - 11 color roles match `/Users/.../packages/shared/src/types/appearance.ts`
 *     and `CLAUDE.md` § Multi-Accent.
 *   - 7 surface modes match `/Users/.../packages/shared/src/types/tokens.ts`
 *     SurfaceToken union and `CLAUDE.md` § Surfaces.
 *   - 3 attention levels mirror `Button.shared.ts` `attention` prop.
 */

export const COLOR_ROLES = [
  'primary',
  'secondary',
  'tertiary',
  'quaternary',
  'neutral',
  'sparkle',
  'brand-bg',
  'positive',
  'negative',
  'warning',
  'informative',
] as const;
export type ColorRole = (typeof COLOR_ROLES)[number];

export const SURFACE_MODES = [
  'default',
  'ghost',
  'minimal',
  'subtle',
  'moderate',
  'bold',
  'elevated',
] as const;
export type SurfaceMode = (typeof SURFACE_MODES)[number];

export const ATTENTION_LEVELS = ['high', 'medium', 'low'] as const;
export type AttentionLevel = (typeof ATTENTION_LEVELS)[number];

/** Canonical mapping: Figma attention → surface mode → variant. */
export const ATTENTION_TO_SURFACE: Readonly<Record<AttentionLevel, SurfaceMode>> = {
  high: 'bold',
  medium: 'subtle',
  low: 'ghost',
};
