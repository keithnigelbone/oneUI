/**
 * Shape System Constants
 *
 * CRITICAL RULE: Interactive elements MUST use Pill (9999px)
 * This is the visual language that signals interactivity
 *
 * ── Vocabulary ──────────────────────────────────────────────────────────────
 * Shape tokens use the **numeric dimension-scale naming** (`Shape-0` … `Shape-10`,
 * plus the half-steps `Shape-0-5` … `Shape-5-5`), matching the Figma Shapes page
 * and `packages/tokens/src/css/primitives.css`. `Shape-Pill` (9999px) is a
 * standalone constant, NOT part of the numeric scale.
 *
 * The legacy t-shirt vocabulary (`Shape-M`, `Shape-3XS`, …) is DEPRECATED and
 * retained only as a read-side compatibility layer during the migration. See
 * `LEGACY_SHAPE_ALIASES` below and `scripts/check-shape-tokens.ts`.
 */

export const INTERACTIVE_RADIUS = '9999px';
export const INTERACTIVE_RADIUS_PX = 9999;

export const INTERACTIVE_ELEMENTS = [
  'button',
  'input',
  'chip',
  'link',
  'toggle',
  'select',
  'checkbox',
  'radio',
] as const;

/**
 * The canonical numeric shape scale **in scale order** (f-8 → f7).
 *
 * ALWAYS iterate this array rather than `Object.keys(SHAPE_FSTEP_MAP)`.
 * The map's keys are integer-like strings, so JS enumerates `'1'`, `'2'`, … `'10'`
 * before `'0-5'`, `'1-5'`, … — insertion order is NOT preserved and the result
 * is not scale order.
 */
export const SHAPE_SCALE_ORDER = [
  '0',
  '0-5',
  '1',
  '1-5',
  '2',
  '2-5',
  '3',
  '3-5',
  '4',
  '4-5',
  '5',
  '5-5',
  '6',
  '7',
  '8',
  '9',
  '10',
] as const;

export type ShapeScaleStep = (typeof SHAPE_SCALE_ORDER)[number];

export const NON_INTERACTIVE_TOKENS = SHAPE_SCALE_ORDER;

/**
 * Canonical mapping from numeric shape scale steps to dimension f-steps.
 * Shape tokens derive from the dimension scale, making them responsive
 * to platform and density changes via the dimension cascade.
 *
 * Mirrors `--Shape-*` in `packages/tokens/src/css/primitives.css` exactly.
 */
export const SHAPE_FSTEP_MAP: Record<ShapeScaleStep, string> = {
  '0': 'f-8',
  '0-5': 'f-7',
  '1': 'f-6',
  '1-5': 'f-5',
  '2': 'f-4',
  '2-5': 'f-3',
  '3': 'f-2',
  '3-5': 'f-1',
  '4': 'f0',
  '4-5': 'f1',
  '5': 'f2',
  '5-5': 'f2-5',
  '6': 'f3',
  '7': 'f4',
  '8': 'f5',
  '9': 'f6',
  '10': 'f7',
};

/**
 * DEPRECATED t-shirt shape names → canonical numeric step.
 *
 * This mapping is **name-preserving**: `Shape-M` always meant `f0` (16px) both in
 * the CSS emitter and in the dynamic `NativeShape` map, so `M → '4'` is exact.
 *
 * ⚠️ It is NOT the mapping for the static `tokens.shape` object in
 * `@oneui/tokens`. That table was hand-written and had drifted: its lowercase
 * `m` was 8px (f-4), not 16px. Those keys migrate **by value** (`m → '2'`).
 * `M` is 16px; `m` is 8px. Never case-fold when migrating shape tokens.
 *
 * Remove once `scripts/check-shape-tokens.ts` reports an empty allowlist.
 */
export const LEGACY_SHAPE_ALIASES: Record<string, ShapeScaleStep> = {
  None: '0',
  '6XS': '0-5',
  '5XS': '1',
  '4XS': '1-5',
  '3XS': '2',
  '2XS': '2-5',
  XS: '3',
  S: '3-5',
  M: '4',
  L: '4-5',
  XL: '5',
  '2XL': '6',
  '3XL': '7',
  '4XL': '8',
  '5XL': '9',
  '6XL': '10',
};

export const SHAPE_RULES = {
  INTERACTIVE_RADIUS,
  INTERACTIVE_RADIUS_PX,
  INTERACTIVE_ELEMENTS,
  NON_INTERACTIVE_TOKENS,
} as const;

/**
 * Validation helper
 */
export function isInteractiveElement(element: string): boolean {
  return INTERACTIVE_ELEMENTS.includes(element as typeof INTERACTIVE_ELEMENTS[number]);
}

/**
 * Accepts canonical numeric steps and, during migration, legacy t-shirt names.
 *
 * Both helpers below take untrusted strings (brand config, Figma variable
 * imports, the MCP `validate_oneui_code` path), so they must use `Object.hasOwn`
 * rather than `in` / bare indexing — otherwise `'constructor'` validates and
 * `'toString'` resolves to a function typed as `ShapeScaleStep`.
 */
export function isValidNonInteractiveShape(shape: string): boolean {
  return (
    (NON_INTERACTIVE_TOKENS as readonly string[]).includes(shape) ||
    Object.hasOwn(LEGACY_SHAPE_ALIASES, shape)
  );
}

/** Normalise any shape step name (numeric or legacy t-shirt) to its numeric step. */
export function toCanonicalShapeStep(shape: string): ShapeScaleStep | undefined {
  if ((NON_INTERACTIVE_TOKENS as readonly string[]).includes(shape)) {
    return shape as ShapeScaleStep;
  }
  return Object.hasOwn(LEGACY_SHAPE_ALIASES, shape) ? LEGACY_SHAPE_ALIASES[shape] : undefined;
}
