/**
 * ContentBlock.shared.ts
 *
 * Types, banner size category, artboard→platform mapping, and typography token
 * resolution for Jio-style marketing content blocks on the canvas. All visual
 * values resolve to CSS vars; platform/density are scoped on the component root
 * so dimension tokens match the artboard, not the viewport.
 */

import {
  buildAliasOverridesFromFStepValues,
  getDimensionValue,
  resolveBreakpointRange,
  type FStep,
} from '@oneui/shared';

export type BannerSizeCategory = 'small' | 'medium' | 'large' | 'xl';

export type ContentPosition = 'top' | 'middle' | 'bottom';
export type ContentAlignment = 'left' | 'center';

/** Breakpoint ids — match `data-Breakpoint` in dimensions/scale.css */
export type V2PlatformId = 'S' | 'M' | 'L';

export type ContentBlockPlatformProp = 'auto' | V2PlatformId;

export type ContentBlockDensityProp = 'default' | 'compact' | 'open';

/** Explicit headline typography token (Display/Headline × S/M/L). */
export type ContentBlockHeadlineTokenExplicit =
  | 'Display-L'
  | 'Display-M'
  | 'Display-S'
  | 'Headline-L'
  | 'Headline-M'
  | 'Headline-S';

export type ContentBlockHeadlineToken = 'auto' | ContentBlockHeadlineTokenExplicit;

export const CONTENT_BLOCK_HEADLINE_TOKEN_OPTIONS: readonly ContentBlockHeadlineTokenExplicit[] = [
  'Display-L',
  'Display-M',
  'Display-S',
  'Headline-L',
  'Headline-M',
  'Headline-S',
] as const;

export const CONTENT_BLOCK_PLATFORM_OPTIONS: readonly ContentBlockPlatformProp[] = [
  'auto',
  'S',
  'M',
  'L',
] as const;

export const CONTENT_BLOCK_DENSITY_OPTIONS: readonly ContentBlockDensityProp[] = [
  'default',
  'compact',
  'open',
] as const;

/** Legacy — used only for migrating stored shapes */
export type HeadlineRole = 'Display' | 'Headline';
export type HeadlineSize = 'S' | 'M' | 'L';
export type HeadlineSizeMode = 'dynamic' | 'fixed';

/** Used as parameter type for labelTypographyVars / bodyTypographyVars */
export type ContextSize = 'XS' | 'S' | 'M' | 'L';
export type BodySize = 'XS' | 'S' | 'M' | 'L' | 'XL';

/** Explicit context typography token (Label role × size only). */
export type ContentBlockContextTokenExplicit =
  | 'Label-XS'
  | 'Label-S'
  | 'Label-M'
  | 'Label-L';

export type ContentBlockContextToken = 'auto' | ContentBlockContextTokenExplicit;

/** Explicit body typography token (Body role × size). */
export type ContentBlockBodyTokenExplicit =
  | 'Body-XS'
  | 'Body-S'
  | 'Body-M'
  | 'Body-L';

export type ContentBlockBodyToken = 'auto' | ContentBlockBodyTokenExplicit;

export const CONTENT_BLOCK_CONTEXT_TOKEN_OPTIONS: readonly ContentBlockContextTokenExplicit[] = [
  'Label-XS',
  'Label-S',
  'Label-M',
  'Label-L',
] as const;

export const CONTENT_BLOCK_BODY_TOKEN_OPTIONS: readonly ContentBlockBodyTokenExplicit[] = [
  'Body-XS',
  'Body-S',
  'Body-M',
  'Body-L',
] as const;

/** Dimension f-step suffix matching `packages/tokens` (--Dimension-f-8 … --Dimension-f16) */
export type DimensionFStep =
  | 'f-8'
  | 'f-7'
  | 'f-6'
  | 'f-5'
  | 'f-4'
  | 'f-3'
  | 'f-2'
  | 'f-1'
  | 'f0'
  | 'f1'
  | 'f2'
  | 'f3'
  | 'f4'
  | 'f5'
  | 'f6'
  | 'f7'
  | 'f8'
  | 'f9'
  | 'f10'
  | 'f11'
  | 'f12'
  | 'f13'
  | 'f14'
  | 'f15'
  | 'f16';

export const CONTENT_BLOCK_F_STEP_OPTIONS: readonly DimensionFStep[] = [
  'f-8',
  'f-7',
  'f-6',
  'f-5',
  'f-4',
  'f-3',
  'f-2',
  'f-1',
  'f0',
  'f1',
  'f2',
  'f3',
  'f4',
  'f5',
  'f6',
  'f7',
  'f8',
  'f9',
  'f10',
  'f11',
  'f12',
  'f13',
  'f14',
  'f15',
  'f16',
] as const;

export function dimensionVar(step: DimensionFStep | string): string {
  return `var(--Dimension-${step})`;
}

/** Map artboard width to the S/M/L breakpoint (same 619/990 ladder as PlatformContext). */
export function getPlatformFromArtboardWidth(width: number): V2PlatformId {
  if (width <= 619) return 'S';
  if (width <= 990) return 'M';
  return 'L';
}

export function resolveContentBlockPlatform(
  platform: ContentBlockPlatformProp | undefined,
  canvasWidth: number,
): V2PlatformId {
  if (platform && platform !== 'auto') return platform;
  return getPlatformFromArtboardWidth(canvasWidth);
}

export function getBannerSizeCategory(width: number, height: number): BannerSizeCategory {
  const area = width * height;
  if (area < 150_000) return 'small';
  if (area < 350_000) return 'medium';
  if (area < 600_000) return 'large';
  return 'xl';
}

/** Default padding f-step per canvas size category (mirrors Banner Builder spacing intent, OneUI f-scale). */
export function defaultPaddingFSteps(category: BannerSizeCategory): {
  top: DimensionFStep;
  right: DimensionFStep;
  bottom: DimensionFStep;
  left: DimensionFStep;
} {
  switch (category) {
    case 'small':
      return { top: 'f2', right: 'f2', bottom: 'f2', left: 'f2' };
    case 'medium':
      return { top: 'f3', right: 'f3', bottom: 'f3', left: 'f3' };
    case 'large':
      return { top: 'f4', right: 'f4', bottom: 'f4', left: 'f4' };
    case 'xl':
      return { top: 'f5', right: 'f5', bottom: 'f5', left: 'f5' };
    default:
      return { top: 'f3', right: 'f3', bottom: 'f3', left: 'f3' };
  }
}

export function defaultTextGapFStep(category: BannerSizeCategory): DimensionFStep {
  switch (category) {
    case 'small':
      return 'f-4';
    case 'medium':
      return 'f-3';
    case 'large':
      return 'f-2';
    case 'xl':
      return 'f-1';
    default:
      return 'f-3';
  }
}

export function defaultButtonGapFStep(category: BannerSizeCategory): DimensionFStep {
  switch (category) {
    case 'small':
      return 'f0';
    case 'medium':
      return 'f1';
    case 'large':
      return 'f2';
    case 'xl':
      return 'f3';
    default:
      return 'f1';
  }
}

export function defaultButtonRowGapFStep(category: BannerSizeCategory): DimensionFStep {
  switch (category) {
    case 'small':
      return 'f-4';
    case 'medium':
      return 'f-4';
    case 'large':
      return 'f-3';
    case 'xl':
      return 'f-2';
    default:
      return 'f-3';
  }
}

type HeadlinePick = { role: HeadlineRole; size: HeadlineSize };

/** Auto headline token per canvas category (platform/density cascade resolves px). */
const AUTO_HEADLINE_BY_CATEGORY: Record<BannerSizeCategory, ContentBlockHeadlineTokenExplicit> = {
  small: 'Headline-M',
  medium: 'Headline-L',
  large: 'Display-S',
  xl: 'Display-M',
};

function isHeadlineTokenExplicit(
  value: string | undefined,
): value is ContentBlockHeadlineTokenExplicit {
  return (
    value !== undefined &&
    (CONTENT_BLOCK_HEADLINE_TOKEN_OPTIONS as readonly string[]).includes(value)
  );
}

export function parseHeadlineTokenToPick(token: ContentBlockHeadlineTokenExplicit): HeadlinePick {
  if (token.startsWith('Display-')) {
    return { role: 'Display', size: token.slice('Display-'.length) as HeadlineSize };
  }
  return { role: 'Headline', size: token.slice('Headline-'.length) as HeadlineSize };
}

/**
 * Resolve headline role+size from `headlineToken` and canvas category.
 * `auto` uses canvas-size-category defaults only (no copy-length heuristic).
 */
export function resolveHeadlineToken(
  category: BannerSizeCategory,
  headlineToken: ContentBlockHeadlineToken | string | undefined,
): HeadlinePick {
  const raw = headlineToken ?? 'auto';
  const explicit: ContentBlockHeadlineTokenExplicit =
    raw === 'auto' ? AUTO_HEADLINE_BY_CATEGORY[category] : isHeadlineTokenExplicit(raw)
      ? raw
      : AUTO_HEADLINE_BY_CATEGORY[category];
  return parseHeadlineTokenToPick(explicit);
}

export interface TypographyVars {
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
}

/**
 * Typography role → f-step mapping (mirrors typography.css).
 * Used to resolve directly to var(--Dimension-fN) so the scoped
 * data-Breakpoint / data-6-Density on the ContentBlock root element
 * drives the final pixel value.
 */
const HEADLINE_F_STEPS: Record<string, { fontSize: string; lineHeight: string; fontWeight: string }> = {
  'Display-L':  { fontSize: 'f7', lineHeight: 'f7', fontWeight: '900' },
  'Display-M':  { fontSize: 'f6', lineHeight: 'f6', fontWeight: '900' },
  'Display-S':  { fontSize: 'f5', lineHeight: 'f5', fontWeight: '900' },
  'Headline-L': { fontSize: 'f4', lineHeight: 'f4', fontWeight: '900' },
  'Headline-M': { fontSize: 'f2', lineHeight: 'f2', fontWeight: '900' },
  'Headline-S': { fontSize: 'f0', lineHeight: 'f0', fontWeight: '850' },
};

const BODY_F_STEPS: Record<string, { fontSize: string; lineHeight: string }> = {
  '2XL': { fontSize: 'f3', lineHeight: 'f6' },
  'XL':  { fontSize: 'f2', lineHeight: 'f5' },
  'L':   { fontSize: 'f1', lineHeight: 'f4' },
  'M':   { fontSize: 'f0', lineHeight: 'f3' },
  'S':   { fontSize: 'f-1', lineHeight: 'f2' },
  'XS':  { fontSize: 'f-2', lineHeight: 'f1' },
  '2XS': { fontSize: 'f-3', lineHeight: 'f0' },
};

const LABEL_F_STEPS: Record<string, { fontSize: string; lineHeight: string }> = {
  '2XL': { fontSize: 'f3', lineHeight: 'f3' },
  'XL':  { fontSize: 'f2', lineHeight: 'f2' },
  'L':   { fontSize: 'f1', lineHeight: 'f1' },
  'M':   { fontSize: 'f0', lineHeight: 'f0' },
  'S':   { fontSize: 'f-1', lineHeight: 'f-1' },
  'XS':  { fontSize: 'f-2', lineHeight: 'f-2' },
  '2XS': { fontSize: 'f-3', lineHeight: 'f-3' },
  '3XS': { fontSize: 'f-4', lineHeight: 'f-4' },
};

export function headlineTypographyVars(role: HeadlineRole, size: HeadlineSize): TypographyVars {
  const key = `${role}-${size}`;
  const steps = HEADLINE_F_STEPS[key] ?? HEADLINE_F_STEPS['Headline-M'];
  return {
    fontSize: dimensionVar(steps.fontSize),
    lineHeight: dimensionVar(steps.lineHeight),
    fontWeight: steps.fontWeight,
  };
}

export function labelTypographyVars(size: ContextSize): TypographyVars {
  const steps = LABEL_F_STEPS[size] ?? LABEL_F_STEPS['M'];
  return {
    fontSize: dimensionVar(steps.fontSize),
    lineHeight: dimensionVar(steps.lineHeight),
    fontWeight: 'var(--Label-FontWeight-High)',
  };
}

export function bodyTypographyVars(size: BodySize): TypographyVars {
  const steps = BODY_F_STEPS[size] ?? BODY_F_STEPS['M'];
  return {
    fontSize: dimensionVar(steps.fontSize),
    lineHeight: dimensionVar(steps.lineHeight),
    // Marketing body: Medium — Body role emphasis for readable supporting copy;
    // Typography-Weight fallback keeps weight resolving when --Body-* is out of scope.
    fontWeight: 'var(--Body-FontWeight-Medium, var(--Typography-Weight-Medium))',
  };
}

/**
 * Resolve context typography vars from a Label-* token string.
 * `auto` defaults to Label-M.
 */
export function resolveContextTypographyVars(
  contextToken: ContentBlockContextToken | undefined,
): TypographyVars {
  if (contextToken && contextToken !== 'auto' && contextToken.startsWith('Label-')) {
    return labelTypographyVars(contextToken.slice('Label-'.length) as ContextSize);
  }
  return labelTypographyVars('M');
}

/**
 * Resolve body typography vars from a Body-* token string.
 * `auto` defaults to Body-M.
 */
export function resolveBodyTypographyVars(
  bodyToken: ContentBlockBodyToken | undefined,
): TypographyVars {
  if (bodyToken && bodyToken !== 'auto' && bodyToken.startsWith('Body-')) {
    return bodyTypographyVars(bodyToken.slice('Body-'.length) as BodySize);
  }
  return bodyTypographyVars('M');
}

// ---------------------------------------------------------------------------
// Dimension f-step inline vars
//
// Mirrors the shared ColourTool/platform parity tables exactly.
//
// Used to directly set CSS custom properties on the ContentBlock root element
// so that var(--Dimension-fN) references in inline styles always resolve to
// the artboard's platform × density — independent of the CSS cascade.
// ---------------------------------------------------------------------------

/**
 * Compute all 25 dimension f-step CSS custom property values for a given
 * platform × density combination, matching scale.css exactly.
 * Also emits resolved spacing, shape, and typography alias tokens so child
 * components (e.g. Button) that read `--Spacing-*`, `--Label-*-FontSize`, etc.
 * correctly react to the scoped dimension scale.
 * Returns an object suitable for spreading into a React element's `style` prop.
 */
export function dimensionFStepInlineVars(
  platform: V2PlatformId,
  density: ContentBlockDensityProp,
): Record<string, string> {
  const vars: Record<string, string> = {};
  const fStepValues: number[] = [];
  for (const step of CONTENT_BLOCK_F_STEP_OPTIONS) {
    const px = getDimensionValue(platform, density, step as FStep);
    vars[`--Dimension-${step}`] = `${px}px`;
    fStepValues.push(px);
  }
  const aliases = buildAliasOverridesFromFStepValues(fStepValues);
  return { ...vars, ...aliases };
}

export type ButtonSizeProp = 's' | 'm' | 'l';

export type ButtonAppearanceProp =
  | 'auto'
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'sparkle'
  | 'brand-bg'
  | 'positive'
  | 'negative'
  | 'warning'
  | 'informative';

/** Serializable props stored in tldraw `componentProps` */
export interface ContentBlockSerializableProps {
  position: ContentPosition;
  alignment: ContentAlignment;
  canvasWidth: number;
  canvasHeight: number;
  maxWidth: number;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  contextText: string;
  headlineText: string;
  bodyText: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  showContext: boolean;
  showBody: boolean;
  showButtons: boolean;
  showSecondaryButton: boolean;
  /** `auto` = canvas category picks Display/Headline token; explicit = manual override */
  headlineToken: ContentBlockHeadlineToken;
  /** `auto` = fall back to contextRole + contextSize; explicit = Label-* or Body-* token */
  contextToken: ContentBlockContextToken;
  /** `auto` = fall back to bodySize; explicit = Body-* token */
  bodyToken: ContentBlockBodyToken;
  /** `auto` = derive from artboard width; else pin platform for dimension scale */
  platform: ContentBlockPlatformProp;
  /** Density for dimension scale (pairs with platform on scoped root) */
  density: ContentBlockDensityProp;
  /**
   * Brand Density & Platforms foundation entry id (e.g. `outdoor`, `web`).
   * When set with matching `foundationDimensionOverrides` (or canvas context entries), dimension tokens follow that platform's density configs.
   */
  foundationPlatformId?: string;
  /**
   * Breakpoint id within the selected foundation platform.
   * When set, dimension tokens use that breakpoint's viewport width instead of the artboard width.
   */
  foundationBreakpointId?: string;
  /**
   * Pre-computed CSS custom properties from `computeDimensionOverrides()` (dimensions + spacing/shape/typography aliases).
   * When non-empty, used instead of `dimensionFStepInlineVars` for the block root.
   */
  foundationDimensionOverrides?: Record<string, string>;
  textGap?: string;
  buttonGap?: string;
  buttonRowGap?: string;
  buttonSize: ButtonSizeProp;
  buttonAppearance: ButtonAppearanceProp;
  /** Optional CSS color value, e.g. var(--Text-OnBold-High) */
  textColor?: string;
}

export const DEFAULT_CONTENT_BLOCK_PROPS: ContentBlockSerializableProps = {
  position: 'middle',
  alignment: 'left',
  canvasWidth: 1080,
  canvasHeight: 1080,
  maxWidth: 100,
  contextText: 'New launch',
  headlineText: 'Your headline goes here',
  bodyText: 'Supporting copy for your banner. Edit in the properties panel.',
  primaryCtaText: 'Primary action',
  secondaryCtaText: 'Learn more',
  showContext: true,
  showBody: true,
  showButtons: true,
  showSecondaryButton: true,
  headlineToken: 'auto',
  contextToken: 'auto',
  bodyToken: 'auto',
  platform: 'auto',
  density: 'default',
  buttonSize: 'm',
  buttonAppearance: 'primary',
};

/** Legacy shape props — migrate to headlineToken / platform / density */
export interface LegacyContentBlockProps {
  headlineSizeMode?: HeadlineSizeMode;
  headlineRole?: HeadlineRole;
  headlineSize?: HeadlineSize;
}

/**
 * Merge defaults with raw props and migrate pre-plan headline fields.
 * Strips legacy `headlineSizeMode` / `headlineRole` / `headlineSize` from the merged result.
 */
export function mergeContentBlockProps(
  raw: Partial<ContentBlockSerializableProps> & LegacyContentBlockProps & Record<string, unknown>,
): ContentBlockSerializableProps {
  const {
    headlineSizeMode: legacyMode,
    headlineRole: legacyRole,
    headlineSize: legacySize,
    ...rest
  } = raw;

  const migrated: Partial<ContentBlockSerializableProps> = {
    ...(rest as Partial<ContentBlockSerializableProps>),
  };

  if (migrated.headlineToken === undefined) {
    if (legacyMode === 'fixed' && legacyRole && legacySize) {
      migrated.headlineToken = `${legacyRole}-${legacySize}` as ContentBlockHeadlineTokenExplicit;
    } else {
      migrated.headlineToken = 'auto';
    }
  }

  if (migrated.platform === undefined) {
    migrated.platform = 'auto';
  } else if (
    migrated.platform !== 'auto' &&
    !['S', 'M', 'L'].includes(migrated.platform as string)
  ) {
    // Coerce a legacy 5-breakpoint platform id stored on an older block to the
    // unified S/M/L model. Parse the trailing width suffix (a tablet id → its px) and
    // resolve it on the canonical ladder — lossy by width, no hardcoded ids.
    const width = parseInt(String(migrated.platform).split('-')[1] ?? '', 10);
    migrated.platform = Number.isFinite(width) ? resolveBreakpointRange(width) : 'auto';
  }

  if (migrated.density === undefined) {
    migrated.density = 'default';
  }

  const rawFpId = (rest as Record<string, unknown>).foundationPlatformId;
  if (migrated.foundationPlatformId === undefined && typeof rawFpId === 'string') {
    migrated.foundationPlatformId = rawFpId;
  }

  const rawBpId = (rest as Record<string, unknown>).foundationBreakpointId;
  if (migrated.foundationBreakpointId === undefined && typeof rawBpId === 'string') {
    migrated.foundationBreakpointId = rawBpId;
  }

  const rawOverrides = (rest as Record<string, unknown>).foundationDimensionOverrides;
  if (
    migrated.foundationDimensionOverrides === undefined &&
    rawOverrides &&
    typeof rawOverrides === 'object' &&
    !Array.isArray(rawOverrides)
  ) {
    const o: Record<string, string> = {};
    for (const [k, v] of Object.entries(rawOverrides)) {
      if (typeof v === 'string') o[k] = v;
    }
    if (Object.keys(o).length > 0) migrated.foundationDimensionOverrides = o;
  }

  // Migrate legacy contextRole + contextSize → contextToken (Label only)
  if (migrated.contextToken === undefined) {
    const legacyRole = (raw as any).contextRole as string | undefined;
    const legacySize = (raw as any).contextSize as string | undefined;
    if (legacyRole === 'Label' && legacySize) {
      migrated.contextToken = `Label-${legacySize}` as ContentBlockContextToken;
    } else {
      migrated.contextToken = 'auto';
    }
  }

  // Migrate legacy bodySize → bodyToken
  if (migrated.bodyToken === undefined) {
    const legacyBodySize = (raw as any).bodySize as string | undefined;
    if (legacyBodySize) {
      migrated.bodyToken = `Body-${legacyBodySize}` as ContentBlockBodyToken;
    } else {
      migrated.bodyToken = 'auto';
    }
  }

  return { ...DEFAULT_CONTENT_BLOCK_PROPS, ...migrated };
}
