/**
 * metallicPaint.ts
 *
 * Shared helpers for applying brand metallic gradient token-refs to a
 * component paint object. Used by Button, Badge, Avatar, Chip, Surface
 * and the Selectable* primitives to keep the detection/resolution logic
 * in one place.
 */

import type { NativeRoleTokens, ResolvedMaterials, ResolvedMetallicGradient } from '../theme';

// ─── Stroke widths ──────────────────────────────────────────────────────────

/** Maps CSS stroke token names to pixel widths. */
export const STROKE_TOKEN_WIDTHS: Record<string, number> = {
  'Stroke-XS': 0.5,
  'Stroke-S': 0.75,
  'Stroke-M': 1,
  'Stroke-L': 1.5,
  'Stroke-XL': 2,
};

// ─── Token-ref resolution ────────────────────────────────────────────────────

const ROLE_PREFIXES: Array<[string, string]> = [
  ['Brand-Bg', 'brand-bg'],
  ['Informative', 'informative'],
  ['Secondary', 'secondary'],
  ['Positive', 'positive'],
  ['Negative', 'negative'],
  ['Warning', 'warning'],
  ['Sparkle', 'sparkle'],
  ['Neutral', 'neutral'],
  ['Primary', 'primary'],
];

/**
 * Resolve a brand component token ref (e.g. 'Primary-Bold-Pressed') to a hex
 * color using the current surface context's resolved roles. Mirrors how web's
 * `var(--Primary-Bold-Pressed)` participates in the `[data-surface]` cascade.
 *
 * Returns `undefined` for unknown token names so callers fall through to the
 * surface-engine default. Literal values (transparent, #xxxxxx) pass through.
 */
export function resolveTokenRef(
  ref: string | undefined,
  resolvedRoles: Record<string, NativeRoleTokens>
): string | undefined {
  if (!ref) return undefined;
  if (ref === 'transparent') return 'transparent';
  if (!/^[A-Z]/.test(ref)) return ref;

  for (const [prefix, role] of ROLE_PREFIXES) {
    if (!ref.startsWith(prefix + '-') && ref !== prefix) continue;
    const suffix = ref.slice(prefix.length + 1);
    const tokens = resolvedRoles[role];
    if (!tokens) return undefined;
    switch (suffix) {
      case 'Bold': return tokens.surfaces.bold;
      case 'Subtle': return tokens.surfaces.subtle;
      case 'Minimal': return tokens.surfaces.minimal;
      case 'Moderate': return tokens.surfaces.moderate;
      case 'Elevated': return tokens.surfaces.elevated;
      case 'Bold-Pressed': return tokens.states.boldPressed;
      case 'Bold-Hover': return tokens.states.boldHover;
      case 'Subtle-Pressed': return tokens.states.subtlePressed;
      case 'Subtle-Hover': return tokens.states.subtleHover;
      case 'Hover': return tokens.states.hover;
      case 'Pressed': return tokens.states.pressed;
      case 'High': return tokens.content.high;
      case 'Medium-Text': return tokens.content.medium;
      case 'Low': return tokens.content.low;
      case 'Tinted': return tokens.content.tinted;
      case 'TintedA11y': return tokens.content.tintedA11y;
      case 'Stroke-Low': return tokens.content.strokeLow;
      case 'Stroke-Medium': return tokens.content.strokeMedium;
      case 'Bold-High': return tokens.onBoldContent.high;
      case 'Bold-TintedA11y': return tokens.onBoldContent.tintedA11y;
      default: return undefined;
    }
  }
  return undefined;
}

// ─── Metallic detection ──────────────────────────────────────────────────────

/**
 * Extract the camelCase preset name from a `Material-Metallic-*-Fill` or
 * `Material-Metallic-*-StrokeColor` token ref.
 * Returns undefined for non-matching refs.
 *
 * Examples:
 *   'Material-Metallic-Gold-Fill'      → 'gold'
 *   'Material-Metallic-RoseGold-Fill'  → 'roseGold'
 */
export function extractMetallicPreset(
  ref: string,
  suffix: 'Fill' | 'StrokeColor'
): string | undefined {
  const pattern =
    suffix === 'Fill'
      ? /^Material-Metallic-(.+)-Fill$/
      : /^Material-Metallic-(.+)-StrokeColor$/;
  const match = ref.match(pattern);
  if (!match) return undefined;
  const name = match[1]!;
  return name.charAt(0).toLowerCase() + name.slice(1);
}

// ─── Paint interface ─────────────────────────────────────────────────────────

/**
 * Minimal paint bag shared across components that support metallic gradients.
 * Each component can extend this with its own additional fields.
 */
export interface MetallicPaint {
  bg: string;
  text: string;
  bgGradient?: ResolvedMetallicGradient | null;
  /** Solid stroke color (used when gradient stroke is NOT needed). */
  borderColor?: string;
  borderWidth?: number;
  /** When set, MetallicGradientFill renders a two-layer border instead of a solid one. */
  strokeWidth?: number;
}

// ─── Core metallic-gradient resolver ─────────────────────────────────────────

/**
 * Resolve a background tokenRef + optional borderColor/strokeImage tokenRefs
 * against the current surface roles + available materials.
 *
 * Returns a partial paint update: only sets fields it understands;
 * callers merge into their own paint.
 *
 * Mirrors `applyTokenRefsToPaint` in Button.native.tsx but extracted for
 * reuse across Badge, Avatar, Chip, Surface, Selectable* components.
 */
export function resolveMetallicPaintFromTokenRefs(
  params: {
    variant: string;
    tokenRefs: Record<string, string> | undefined;
    resolvedRoles: Record<string, NativeRoleTokens>;
    materials: ResolvedMaterials | null;
  }
): {
  bgGradient?: ResolvedMetallicGradient;
  bg?: string;
  text?: string;
  borderColor?: string;
  borderWidth?: number;
  strokeWidth?: number;
} {
  const { variant, tokenRefs, resolvedRoles, materials } = params;
  if (!tokenRefs) return {};

  const result: ReturnType<typeof resolveMetallicPaintFromTokenRefs> = {};

  // Background — check for material gradient ref first
  const bgRawRef = tokenRefs[`backgroundColor.${variant}`] ?? tokenRefs['backgroundColor'];
  if (bgRawRef) {
    const fillPreset = extractMetallicPreset(bgRawRef, 'Fill');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gradient = fillPreset ? (materials?.metallic as any)?.[fillPreset] as ResolvedMetallicGradient | undefined : undefined;
    if (gradient) {
      result.bgGradient = gradient;
    } else {
      const resolved = resolveTokenRef(bgRawRef, resolvedRoles);
      if (resolved) result.bg = resolved;
    }
  }

  // Text color — explicit tokenRef wins; gradient.text is the on-bold fallback
  const textRawRef = tokenRefs[`textColor.${variant}`] ?? tokenRefs['textColor'];
  if (textRawRef) {
    const resolved = resolveTokenRef(textRawRef, resolvedRoles);
    if (resolved) result.text = resolved;
  } else if (result.bgGradient?.text) {
    result.text = result.bgGradient.text;
  }

  // Border color — handles Material-Metallic-*-StrokeColor
  const borderColorRawRef = tokenRefs[`borderColor.${variant}`] ?? tokenRefs['borderColor'];
  if (borderColorRawRef) {
    const strokePreset = extractMetallicPreset(borderColorRawRef, 'StrokeColor');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const strokeGradient = strokePreset ? (materials?.metallic as any)?.[strokePreset] as ResolvedMetallicGradient | undefined : undefined;
    if (strokeGradient) {
      result.borderColor = strokeGradient.strokeColor;
    } else {
      const resolved = resolveTokenRef(borderColorRawRef, resolvedRoles);
      if (resolved) result.borderColor = resolved;
    }
  }

  // Border width
  const borderWidthRawRef = tokenRefs[`borderWidth.${variant}`] ?? tokenRefs['borderWidth'];
  if (borderWidthRawRef) {
    const w = STROKE_TOKEN_WIDTHS[borderWidthRawRef];
    if (w != null) result.borderWidth = w;
  }

  // strokeImage: metallic gradient stroke → promote borderWidth → strokeWidth,
  // suppress solid border. Mirrors web's addButtonImageStrokeSuppressors.
  const strokeImageRawRef = tokenRefs[`strokeImage.${variant}`] ?? tokenRefs['strokeImage'];
  const hasMetallicStrokeImage =
    strokeImageRawRef != null &&
    strokeImageRawRef !== 'none' &&
    strokeImageRawRef.startsWith('Material-Metallic-') &&
    !strokeImageRawRef.endsWith('StrokeColor');
  if (hasMetallicStrokeImage) {
    result.strokeWidth = result.borderWidth;
    result.borderColor = undefined;
    result.borderWidth = undefined;
  }

  return result;
}
