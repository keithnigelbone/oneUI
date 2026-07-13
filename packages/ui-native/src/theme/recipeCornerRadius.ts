/**
 * Shared recipe → RN borderRadius mapping for components whose web peers use
 * `cornerRadius` decisions (Avatar, Badge, CounterBadge, IndicatorBadge, Button).
 *
 * Also exports `resolveShapeLanguageBorderRadius` for the `shapeLanguage` step
 * of the cascade, which mirrors what `buildAllComponentCSS` emits on web
 * (e.g. `--Button-borderRadius: var(--Shape-0)` when shapeLanguage = 'sharp').
 *
 * Slugs match component meta `slug` in `packages/ui/src/components` meta files.
 */

import type { NativeShape } from '@oneui/shared/engine';

/** Canonical numeric shape tokens → `NativeShape` keys. */
const SHAPE_TOKEN_TO_KEY: Record<string, keyof NativeShape> = {
  'Shape-0': '0',
  'Shape-0-5': '0-5',
  'Shape-1': '1',
  'Shape-1-5': '1-5',
  'Shape-2': '2',
  'Shape-2-5': '2-5',
  'Shape-3': '3',
  'Shape-3-5': '3-5',
  'Shape-4': '4',
  'Shape-4-5': '4-5',
  'Shape-5': '5',
  'Shape-5-5': '5-5',
  'Shape-6': '6',
  'Shape-7': '7',
  'Shape-8': '8',
  'Shape-9': '9',
  'Shape-10': '10',
  'Shape-Pill': 'Pill',
};

/**
 * @deprecated Legacy t-shirt tokens → canonical numeric key. Read-side only:
 * the editor has written numeric `token:` values since `503c5fde8` (2026-05-13),
 * so this exists to keep any older persisted Convex record rendering.
 * Delete once `pnpm check:shape-tokens` reports an empty allowlist.
 */
const LEGACY_SHAPE_TOKEN_TO_KEY: Record<string, keyof NativeShape> = {
  'Shape-None': '0',
  'Shape-6XS': '0-5',
  'Shape-5XS': '1',
  'Shape-4XS': '1-5',
  'Shape-3XS': '2',
  'Shape-2XS': '2-5',
  'Shape-XS': '3',
  'Shape-S': '3-5',
  'Shape-M': '4',
  'Shape-L': '4-5',
  'Shape-XL': '5',
  'Shape-2XL': '6',
  'Shape-3XL': '7',
  'Shape-4XL': '8',
  'Shape-5XL': '9',
  'Shape-6XL': '10',
};

/**
 * Resolve a component token-editor shape value to the native numeric radius.
 *
 * Accepts canonical numeric tokens (`Shape-3`) and, transitionally, legacy
 * t-shirt aliases (`Shape-XS`) in case an old Convex record still carries one.
 * Unknown tokens return `undefined`, and the caller keeps its StyleSheet default.
 */
export function resolveShapeBorderRadius(
  tokenRef: string | undefined,
  shape: NativeShape,
): number | undefined {
  if (!tokenRef) return undefined;
  const trimmed = tokenRef.trim();

  // `Object.hasOwn`, not a truthiness check: `tokenRef` is untrusted, and a bare
  // index would let `'constructor'` / `'toString'` resolve to Object.prototype
  // members and short-circuit the literal-px branch below.
  const key = Object.hasOwn(SHAPE_TOKEN_TO_KEY, trimmed) ? SHAPE_TOKEN_TO_KEY[trimmed] : undefined;
  if (key) return shape[key];

  const legacyKey = Object.hasOwn(LEGACY_SHAPE_TOKEN_TO_KEY, trimmed)
    ? LEGACY_SHAPE_TOKEN_TO_KEY[trimmed]
    : undefined;
  if (legacyKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[oneui] Deprecated shape token "${trimmed}" resolved via the legacy ` +
          `t-shirt alias. Use "Shape-${legacyKey}". This alias will be removed.`,
      );
    }
    return shape[legacyKey];
  }

  const literalPx = trimmed.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (literalPx) return Number(literalPx[1]);

  return undefined;
}

/**
 * When `cornerRadius` is `inherit` or unknown, returns `undefined` so callers
 * keep their size-default radius from `StyleSheet`.
 *
 * Mirrors the CSS recipe resolutionMap in Button.recipe.ts:
 *   none → Shape-0 (0), small → Shape-3 (f-2),
 *   medium → Shape-3-5 (f-1), large → Shape-4 (f0),
 *   pill → Shape-Pill
 */
export function resolveRecipeBorderRadius(
  decisions: Record<string, string>,
  shape: NativeShape,
): number | undefined {
  switch (decisions.cornerRadius) {
    case 'none':
      return shape['0'];
    case 'small':
      return shape['3'];
    case 'medium':
      return shape['3-5'];
    case 'large':
      return shape['4'];
    case 'pill':
      return shape.Pill;
    default:
      return undefined;
  }
}

/**
 * Which component family a component belongs to — determines the shape token
 * for `soft` and `rounded` (mirrors `componentThemes.ts` resolution maps).
 * `sharp` (→ 0) and `pill` (→ Pill) are the same for all families.
 */
export type ComponentShapeFamily = 'actions' | 'inputs' | 'display';

/**
 * Resolve `shapeLanguage` from `componentThemeSelections` to a native numeric
 * border radius. Returns `undefined` for `'inherit'` / unknown so callers fall
 * through to their component-specific default.
 *
 * Per-family shape token mapping (from `componentThemes.ts` resolutionMaps):
 *   actions — soft: Shape-3, rounded: Shape-4
 *   inputs  — soft: Shape-2, rounded: Shape-3
 *   display — soft: Shape-1, rounded: Shape-2
 */
export function resolveShapeLanguageBorderRadius(
  shapeLanguage: string | undefined,
  shape: NativeShape,
  family: ComponentShapeFamily = 'actions',
): number | undefined {
  switch (shapeLanguage) {
    case 'sharp':
      return shape['0']; // Shape-0 — universal across all families
    case 'soft':
      return family === 'actions' ? shape['3']
        : family === 'inputs' ? shape['2']
        : shape['1']; // display: Shape-1 / f-6
    case 'rounded':
      return family === 'actions' ? shape['4']
        : family === 'inputs' ? shape['3']
        : shape['2']; // display: Shape-2 / f-4
    case 'pill':
      return shape.Pill;
    default:
      return undefined;
  }
}
