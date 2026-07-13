/**
 * buttonPaint.ts
 *
 * Pure paint utilities for Button — no hooks, no React.
 * Extracted from Button.native.tsx so they can be imported by both
 * the component render and the testable `resolveButtonStyle` pure function.
 */

import {
  type NativeRoleTokens,
  type NativeShape,
  type NativeSpacing,
  type ResolvedMaterials,
  type ResolvedMetallicGradient,
} from '../../theme';
import type { ButtonVariant } from './interface';

// ─── Paint types ─────────────────────────────────────────────────────────────

export interface Paint {
  bg: string;
  text: string;
  pressedBg: string;
  hoverBg: string;
  /** Metallic gradient fill — set when a brand tokenRef maps backgroundColor to a material. */
  bgGradient?: ResolvedMetallicGradient;
  /** Present only when the brand's emphasisStyle renders a visible stroke (outline). */
  borderColor?: string;
  borderWidth?: number;
  /**
   * Gradient border width — drives the two-layer SVG gradient border in
   * MetallicGradientFill. Suppresses solid borderColor/borderWidth when set.
   */
  strokeWidth?: number;
}

export interface RecipeOverrides {
  borderRadius?: number;
  textTransform?: 'uppercase' | 'none';
  letterSpacing?: number;
  paddingHorizontal?: Partial<Record<6 | 8 | 10 | 12, number>>;
}

// ─── Static lookup tables ────────────────────────────────────────────────────

/** Maps CSS stroke token names to pixel widths. */
export const STROKE_TOKEN_WIDTHS: Record<string, number> = {
  'Stroke-XS': 0.5,
  'Stroke-S': 0.75,
  'Stroke-M': 1,
  'Stroke-L': 1.5,
  'Stroke-XL': 2,
};

/** Surface mode for inner ButtonSlot per variant. */
export const VARIANT_TO_MODE: Record<ButtonVariant, 'bold' | 'subtle' | 'default'> = {
  bold: 'bold',
  subtle: 'subtle',
  ghost: 'default',
};

// ─── Base paint per variant ───────────────────────────────────────────────────

export const VARIANT_PAINT: Record<ButtonVariant, (role: NativeRoleTokens) => Paint> = {
  bold: (role) => ({
    bg: role.surfaces.bold,
    text: role.onBoldContent.tintedA11y,
    pressedBg: role.states.boldPressed,
    hoverBg: role.states.boldHover,
  }),
  subtle: (role) => ({
    bg: role.surfaces.subtle,
    text: role.onSubtleContent.tintedA11y,
    pressedBg: role.states.subtlePressed,
    hoverBg: role.states.subtleHover,
  }),
  ghost: (role) => ({
    bg: 'transparent',
    text: role.content.tintedA11y,
    pressedBg: role.states.subtleHover,
    hoverBg: role.states.subtleHover,
  }),
};

// ─── Paint cascade ───────────────────────────────────────────────────────────

/** Attention levels map onto variants; each has a factory style that is a no-op. */
export const VARIANT_FACTORY_ATTENTION_STYLE: Record<ButtonVariant, string> = {
  bold: 'solid',
  subtle: 'tonal',
  ghost: 'quiet',
};

/**
 * Apply a family-theme attention style to a variant's paint. Mirrors the web
 * `attentionStyleOverrides` generator: the style describes HOW emphasis is
 * expressed (solid/tonal/outline/quiet) independent of which variant carries
 * it. The variant's factory style is inert.
 */
export function applyAttentionStyleToPaint(
  basePaint: Paint,
  style: string | undefined,
  role: NativeRoleTokens,
  variant: ButtonVariant,
): Paint {
  if (!style || style === VARIANT_FACTORY_ATTENTION_STYLE[variant]) return basePaint;
  switch (style) {
    case 'solid':
      return {
        bg: role.surfaces.bold,
        text: role.onBoldContent.tintedA11y,
        pressedBg: role.states.boldPressed,
        hoverBg: role.states.boldHover,
      };
    case 'tonal':
      return {
        bg: role.surfaces.subtle,
        text: role.onSubtleContent.tintedA11y,
        pressedBg: role.states.subtlePressed,
        hoverBg: role.states.subtleHover,
      };
    case 'outline':
      return {
        bg: 'transparent',
        text: role.content.tintedA11y,
        pressedBg: 'transparent',
        hoverBg: 'transparent',
        borderColor: role.content.tintedA11y,
        borderWidth: 1,
      };
    case 'quiet':
      return {
        bg: 'transparent',
        text: role.content.tintedA11y,
        pressedBg: role.states.subtlePressed,
        hoverBg: role.states.subtleHover,
      };
    default:
      return basePaint;
  }
}

/**
 * Apply family-theme emphasisStyle to the bold variant paint.
 * @deprecated Use applyAttentionStyleToPaint — emphasisStyle aliases the High level.
 */
export function applyEmphasisStyleToPaint(
  basePaint: Paint,
  emphasisStyle: string | undefined,
  role: NativeRoleTokens,
): Paint {
  return applyAttentionStyleToPaint(basePaint, emphasisStyle, role, 'bold');
}

function extractMetallicPreset(ref: string, suffix: 'Fill' | 'StrokeColor'): string | undefined {
  const pattern =
    suffix === 'Fill'
      ? /^Material-Metallic-(.+)-Fill$/
      : /^Material-Metallic-(.+)-StrokeColor$/;
  const match = ref.match(pattern);
  if (!match) return undefined;
  const name = match[1]!;
  return name.charAt(0).toLowerCase() + name.slice(1);
}

function resolveTokenRef(
  ref: string | undefined,
  resolvedRoles: Record<string, NativeRoleTokens>,
): string | undefined {
  if (!ref) return undefined;
  if (ref === 'transparent') return 'transparent';
  if (!/^[A-Z]/.test(ref)) return ref;

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
  for (const [prefix, role] of ROLE_PREFIXES) {
    if (!ref.startsWith(prefix + '-') && ref !== prefix) continue;
    const suffix = ref.slice(prefix.length + 1);
    const tokens = resolvedRoles[role];
    if (!tokens) return undefined;
    switch (suffix) {
      // ── Surfaces (all 7 + blend) ──
      case 'Default': return tokens.surfaces.default;
      case 'Ghost': return tokens.surfaces.ghost;
      case 'Minimal': return tokens.surfaces.minimal;
      case 'Subtle': return tokens.surfaces.subtle;
      case 'Moderate': return tokens.surfaces.moderate;
      case 'Bold': return tokens.surfaces.bold;
      case 'Elevated': return tokens.surfaces.elevated;
      case 'Blend': return tokens.surfaces.blend;
      // ── States ──
      case 'Hover': return tokens.states.hover;
      case 'Pressed': return tokens.states.pressed;
      case 'Bold-Hover': return tokens.states.boldHover;
      case 'Bold-Pressed': return tokens.states.boldPressed;
      case 'Subtle-Hover': return tokens.states.subtleHover;
      case 'Subtle-Pressed': return tokens.states.subtlePressed;
      // ── Content (on-default) ──
      case 'High': return tokens.content.high;
      case 'Medium-Text': return tokens.content.medium;
      case 'Low': return tokens.content.low;
      case 'Tinted': return tokens.content.tinted;
      case 'TintedA11y': return tokens.content.tintedA11y;
      case 'Stroke-Low': return tokens.content.strokeLow;
      case 'Stroke-Medium': return tokens.content.strokeMedium;
      // ── On-bold content ──
      case 'Bold-High': return tokens.onBoldContent.high;
      case 'Bold-Medium': return tokens.onBoldContent.medium;
      case 'Bold-TintedA11y': return tokens.onBoldContent.tintedA11y;
      default: return undefined;
    }
  }
  return undefined;
}

/**
 * Apply brand component token overrides (from the manual token editor) to the
 * resolved paint. Only touches keys present in tokenRefs; falls through to the
 * surface-engine value for everything else.
 */
export function applyTokenRefsToPaint(
  paint: Paint,
  variant: string,
  tokenRefs: Record<string, string> | undefined,
  resolvedRoles: Record<string, NativeRoleTokens>,
  materials: ResolvedMaterials | null,
): Paint {
  if (!tokenRefs) return paint;

  const result: Paint = { ...paint };

  const bgRawRef = tokenRefs[`backgroundColor.${variant}`] ?? tokenRefs['backgroundColor'];
  if (bgRawRef) {
    const fillPreset = extractMetallicPreset(bgRawRef, 'Fill');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gradient = fillPreset ? (materials?.metallic as any)?.[fillPreset] as ResolvedMetallicGradient | undefined : undefined;
    if (gradient) {
      result.bgGradient = gradient;
      // Provide solid fallback so ornament fill and pressed-state bg are never
      // left transparent (e.g. when emphasisStyle:outline precedes this tokenRef).
      const mid = Math.floor(gradient.colors.length / 2);
      const dark = Math.max(0, mid - 1);
      result.bg = gradient.colors[mid] ?? result.bg;
      if (result.pressedBg === 'transparent') {
        result.pressedBg = gradient.colors[dark] ?? result.bg;
      }
    } else {
      const bgRef = resolveTokenRef(bgRawRef, resolvedRoles);
      if (bgRef) result.bg = bgRef;
    }
  }

  const pressedRawRef = tokenRefs[`backgroundColor.${variant}-pressed`];
  if (pressedRawRef) {
    const pressedRef = resolveTokenRef(pressedRawRef, resolvedRoles);
    if (pressedRef) result.pressedBg = pressedRef;
  }

  const textRawRef = tokenRefs[`textColor.${variant}`] ?? tokenRefs['textColor'];
  if (textRawRef) {
    const textRef = resolveTokenRef(textRawRef, resolvedRoles);
    if (textRef) result.text = textRef;
  } else if (result.bgGradient?.text) {
    result.text = result.bgGradient.text;
  }

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

  const borderWidthRawRef = tokenRefs[`borderWidth.${variant}`] ?? tokenRefs['borderWidth'];
  if (borderWidthRawRef) {
    const w = STROKE_TOKEN_WIDTHS[borderWidthRawRef];
    if (w != null) result.borderWidth = w;
  }

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

// ─── Recipe ──────────────────────────────────────────────────────────────────

/**
 * Resolve recipe decisions (cornerRadius / textTransform / horizontalDensity)
 * to concrete px values. Mirrors Button.recipe.ts resolutionMap on web.
 */
export function applyButtonRecipe(
  decisions: Record<string, string>,
  fontSize: number,
  shape: NativeShape,
  spacing: NativeSpacing,
): RecipeOverrides {
  const out: RecipeOverrides = {};
  switch (decisions.cornerRadius) {
    case 'none':
      out.borderRadius = 0;
      break;
    case 'small':
      out.borderRadius = shape['3'];
      break;
    case 'medium':
      out.borderRadius = shape['3-5'];
      break;
    case 'large':
      out.borderRadius = shape['4'];
      break;
    case 'pill':
      out.borderRadius = shape.Pill;
      break;
    default:
      break;
  }
  if (decisions.textTransform === 'uppercase') {
    out.textTransform = 'uppercase';
    out.letterSpacing = fontSize * 0.05;
  }
  switch (decisions.horizontalDensity) {
    case 'tight':
      out.paddingHorizontal = { 8: spacing['3'], 10: spacing['3-5'], 12: spacing['4'] };
      break;
    case 'roomy':
      out.paddingHorizontal = { 8: spacing['4'], 10: spacing['4-5'], 12: spacing['5'] };
      break;
    default:
      break;
  }
  return out;
}
