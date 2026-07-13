/**
 * EditorPanel.tsx
 *
 * Token editing panel for advanced overrides.
 * Shows curated set of tokens grouped by category.
 * No scope toggle — always operates in global mode.
 */

'use client';

import React, { useMemo, useState } from 'react';
import { Palette, Move, Square, Type, Timer, Minus, Layers, MousePointer2, RotateCcw } from 'lucide-react';
import { Select } from '@oneui/ui-internal/components/Select/Select';
import { CollapsibleSection } from './CollapsibleSection';
import { TokenRow } from './TokenRow';
import { DecorationSection } from './DecorationSection';
import {
  CATEGORY_LABELS,
  VARIANT_LABELS,
  isTwoColumn,
  isTokenEditableForSelection,
  getScopeLockMessage,
} from './constants';
import {
  EDITOR_APPEARANCE_ROLES,
  getBorderTokensForRole,
  getOnBoldBorderTokensForRole,
  getStateLayerTokensForRole,
  getSurfaceTokensForRole,
  getTextTokensForRole,
  normalizeAppearanceRoleLabel,
  type AppearanceRoleLabel,
  type ComponentRecipeDefinition,
  type ComponentTokenManifest,
  type TokenCategory,
  type TokenOption,
  type TokenState,
} from '@oneui/shared';
import {
  VISIBLE_METALLIC_PRESETS,
  getMetallicVariantSegments,
  getMetallicVariantTokenPrefix,
  mergeMaterialConfigWithFoundationConfig,
  normalizeActiveMetallicMap,
  normalizeMetallicMaterials,
  type VisibleMetallicPresetName,
} from '@oneui/shared/engine';
import { useComponentTokenEditor } from '../ComponentTokenEditorContext';
import { useComponentDecoration } from '@oneui/ui-internal/hooks/useDecorationContext';
import { RecipePanel } from './RecipePanel';
import { PromoteSpacingToFamily } from './PromoteSpacingToFamily';
import styles from './EditorPanel.module.css';

/**
 * Title-case a camelCase / lowercase key for display, e.g. `hover` → `Hover`,
 * `track` → `Track`, `selectedBold` → `Selected Bold`.
 */
function humanizeKey(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[-_]+/g, ' ').trim();
  return spaced.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Display label for an interaction variant. Uses the canonical {@link VARIANT_LABELS}
 * map for the standard bold/subtle/ghost set and falls back to a humanized key
 * for any other variant (e.g. `selected-bold`).
 */
function variantLabel(variant: string): string {
  return VARIANT_LABELS[variant] ?? humanizeKey(variant);
}

/** Categories shown in Advanced Overrides (no accessibility, no elevation) */
const ADVANCED_CATEGORY_ORDER: TokenCategory[] = [
  'color',
  'spacing',
  'shape',
  'stroke',
  'typography',
  'motion',
  'decoration',
];

/** Category icons */
const CATEGORY_ICONS: Partial<Record<TokenCategory, React.ReactNode>> = {
  color: <Palette size={12} />,
  spacing: <Move size={12} />,
  shape: <Square size={12} />,
  typography: <Type size={12} />,
  stroke: <Minus size={12} />,
  motion: <Timer size={12} />,
  decoration: <Layers size={12} />,
};

/**
 * Tokens visible in Component Overrides.
 * Curated list — excludes accessibility tokens and elevation tokens.
 * Color tokens are intentionally hidden from the generic local editor; they are
 * owned by global component theme, appearance role, surface context, and the
 * dedicated Interaction states panel below.
 */
const ADVANCED_VISIBLE_TOKENS = new Set([
  // Spacing
  'paddingVertical',
  'paddingHorizontal',
  'paddingHorizontalStart',
  'paddingHorizontalEnd',
  'iconSize',
  'iconSizeStart',
  'iconSizeEnd',
  'iconGap',
  'iconGapStart',
  'iconGapEnd',
  'minHeight',
  // Shape
  'borderRadius',
  // Stroke
  'borderWidth',
  // Typography
  'fontSize',
  'fontWeight',
  'lineHeight',
  'textTransform',
  'letterSpacing',
  // Motion
  'transitionDuration',
  'transitionEasing',
  // Decoration — behavioral controls rendered by DecorationSection (not token rows)
]);

const INTERACTION_VARIANTS = [
  { variant: 'bold', label: 'High' },
  { variant: 'subtle', label: 'Medium' },
  { variant: 'ghost', label: 'Low' },
] as const;

const INTERACTION_STATES = [
  { state: undefined, label: 'Rest' },
  { state: 'hover', label: 'Hover' },
  { state: 'pressed', label: 'Pressed' },
] as const satisfies ReadonlyArray<{ state?: TokenState; label: string }>;

const DEFAULT_ACTIVE_METALS = new Set<VisibleMetallicPresetName>(['bronze', 'silver', 'gold']);

type SelectItem = {
  value: string;
  label: string;
  color?: string;
  swatch?: string;
};

/**
 * Surface-vocabulary labels for raw token VALUES that aren't role surface tokens.
 * We never say "transparent" in the UI — in our surface system the no-fill /
 * see-through surface is "Ghost". Applied wherever a value would otherwise be
 * shown verbatim, so the naming is consistent across every channel (fill/stroke/
 * text). Keeps the stored value untouched (still `transparent`); only the label
 * speaks our vocabulary.
 */
const VALUE_LABELS: Record<string, string> = {
  transparent: 'Ghost',
  none: 'None',
  currentColor: 'Current',
};

/**
 * Token-based stroke weight options for the "Stroke width" control. Values are
 * the design-system Stroke-* tokens (rendered as var(--Stroke-*) by
 * buildComponentPreviewStyles); 'None' is the literal 0px (no stroke box). One
 * control governs the whole component's applied stroke weight — applying a
 * stroke material/colour no longer pins a fixed per-state width.
 */
const STROKE_WIDTH_OPTIONS: SelectItem[] = [
  { value: '0px', label: 'None' },
  { value: 'Stroke-S', label: 'S' },
  { value: 'Stroke-M', label: 'M' },
  { value: 'Stroke-L', label: 'L' },
  { value: 'Stroke-XL', label: 'XL' },
  { value: 'Stroke-2XL', label: '2XL' },
];

/** Width values treated as "no stroke yet" — applying a stroke bumps these to a visible default. */
const INVISIBLE_STROKE_WIDTHS = new Set(['0px', '0', 'none', 'Stroke-None']);

/**
 * The unified material config the BRAND ENGINE actually emits from: the
 * materialConfigs document (`foundationData.materialConfig`, which holds the
 * metallic VARIANTS) merged with the foundations(materials) override
 * (`foundationData.materials.config`, base-only stops + activeMetals). The
 * editor MUST read this same merged shape — exactly like brandCSSPrecompute —
 * otherwise the dropdowns only ever see the base preset (variants live solely in
 * materialConfig and are invisible from `materials.config`).
 */
function getMergedMaterialConfig(foundationData: unknown): unknown {
  const fd = foundationData as {
    materialConfig?: unknown;
    materials?: { config?: unknown };
  } | null;
  return mergeMaterialConfigWithFoundationConfig(
    fd?.materialConfig ?? null,
    fd?.materials?.config ?? null,
  );
}

function getActiveMaterialPresets(foundationData: unknown): VisibleMetallicPresetName[] {
  const config = getMergedMaterialConfig(foundationData);
  const active = normalizeActiveMetallicMap(config);

  if (!active) {
    return VISIBLE_METALLIC_PRESETS.filter((preset) => DEFAULT_ACTIVE_METALS.has(preset));
  }

  return VISIBLE_METALLIC_PRESETS.filter((preset) => active[preset] === true);
}

/**
 * A single selectable metal in the override dropdowns: ONE entry per VARIANT of
 * each active metallic preset — the base variant PLUS any named variants the
 * brand defined (e.g. a second "Radial Gold"). Without this the dropdowns only
 * ever showed the base preset, so newly-created variants were invisible.
 *
 * `prefix` is the token prefix the engine emits (`Material-Metallic-Gold` for the
 * base variant, `Material-Metallic-Gold-Radial` for a named one); append
 * `-Fill` / `-Stroke` / `-StrokeColor` / `-Text` / a gradient-stop prop to it.
 */
interface MetalVariantOption {
  preset: VisibleMetallicPresetName;
  /** Display name as authored by the brand (base = preset label, e.g. "Gold"). */
  name: string;
  /** Token prefix incl. variant segment. */
  prefix: string;
  /** Stable Select-value encoding for handlers that write multiple tokens. */
  value: string;
}

/** Enumerate every variant of every ACTIVE metallic preset (base + named). */
function getActiveMetalVariants(foundationData: unknown): MetalVariantOption[] {
  const config = getMergedMaterialConfig(foundationData);
  const materials = normalizeMetallicMaterials(config);
  const out: MetalVariantOption[] = [];
  for (const preset of getActiveMaterialPresets(foundationData)) {
    const material = materials[preset];
    const segments = getMetallicVariantSegments(material);
    material.variants.forEach((variant, index) => {
      const prefix = getMetallicVariantTokenPrefix(preset, segments[index]);
      out.push({ preset, name: variant.name, prefix, value: `material:${prefix}` });
    });
  }
  return out;
}

/** Build a channel token for a metal variant: `${prefix}-${channel}`. */
function metalChannelToken(prefix: string, channel: 'Fill' | 'Stroke' | 'StrokeColor' | 'Text'): string {
  return `${prefix}-${channel}`;
}

/** Resolve the metal-variant token prefix from a `material:<prefix>` Select value. */
function parseMetalValue(value: string): string | null {
  return value.startsWith('material:') ? value.slice('material:'.length) : null;
}

function getTokenValueKind(value: string): string {
  if (value === 'transparent') return 'transparent';
  if (value === 'none') return 'none';
  if (value.startsWith('Material-Metallic-')) return 'material';
  return 'token';
}

/** Strip a `var(--Token)` wrapper so equivalent option values compare equal. */
function normalizeOptionValue(value: string): string {
  return value.replace(/^var\(--(.+)\)$/, '$1').trim();
}

function ensureCurrentOption(options: SelectItem[], value: string): SelectItem[] {
  if (!value) return options;
  // Compare normalized so a `var(--Primary-Ghost)`-wrapped current value isn't
  // re-appended as a phantom duplicate of the plain `Primary-Ghost` option.
  const normalized = normalizeOptionValue(value);
  if (options.some((option) => normalizeOptionValue(option.value) === normalized)) return options;
  return [
    ...options,
    {
      value,
      label: VALUE_LABELS[value] ?? value,
      color: value === 'transparent' ? 'transparent' : undefined,
    },
  ];
}

function dedupeSelectItems(items: SelectItem[]): SelectItem[] {
  const seen = new Set<string>();
  const result: SelectItem[] = [];
  for (const item of items) {
    if (seen.has(item.value)) continue;
    seen.add(item.value);
    result.push(item);
  }
  return result;
}

function toRoleItems(
  role: AppearanceRoleLabel,
  options: TokenOption[],
  labelSuffix?: string
): SelectItem[] {
  return options.map((option) => ({
    value: option.token,
    label: `${role} / ${option.label}${labelSuffix ? ` ${labelSuffix}` : ''}`,
  }));
}

/**
 * Fill/track colour options for an SVG stroke (CircularProgressIndicator arc).
 *
 * Offers EVERY appearance role across the FULL canonical surface vocabulary —
 * the exact same `getSurfaceTokensForRole` set that box fills use
 * (`buildFillOptions`), so the arc is "exactly like the surface" everywhere
 * else (incl. Moderate/Elevated, not a hand-rolled subset). Plus an "Auto"
 * context-aware default (no override → follows the appearance/surface context)
 * and the real foundation metals when `activePresets` are supplied.
 *
 * Each role surface is written as a `var(--{Role}-{Mode})` reference, so a solid
 * pick still remaps with surface context inside `[data-surface]` blocks. Metals
 * are intentionally fixed brand materials and do not remap.
 */
function buildArcFillOptions(metalVariants: MetalVariantOption[]): SelectItem[] {
  const roleOptions: SelectItem[] = EDITOR_APPEARANCE_ROLES.flatMap((role) =>
    toRoleItems(role, getSurfaceTokensForRole(role))
  );
  return [
    { value: 'auto', label: 'Auto (context-aware)' },
    ...roleOptions,
    ...metalVariants.map((metal) => ({
      value: metal.value,
      label: `${metal.name} metal`,
      swatch: `var(--${metal.prefix}-Fill)`,
    })),
  ];
}

/** FILL_STOPS properties used by the CircularProgressIndicator arc gradient. */
const CPI_ARC_STOP_PROPS = ['Shadow', 'Base', 'BaseLight', 'Highlight'] as const;
const CPI_ARC_STOP_TOKENS = CPI_ARC_STOP_PROPS.map((p) => `arcMaterial-${p}`);

/**
 * `Ghost` and `Default` are role-AGNOSTIC surfaces — `Ghost` is the see-through
 * fill, `Default` is the page surface — so they resolve the same regardless of
 * accent role. Presenting them as "Primary / Ghost surface" is misleading (there
 * is no primary vs secondary ghost), so they're shown once, un-prefixed.
 */
const ROLE_AGNOSTIC_SURFACE_LABELS: Record<string, string> = {
  Default: 'Page surface',
  Ghost: 'Transparent (ghost)',
};

function buildFillOptions(role: AppearanceRoleLabel, metalVariants: MetalVariantOption[]): SelectItem[] {
  const surfaceTokens = getSurfaceTokensForRole(role);
  // Role-agnostic surfaces (Ghost / Default): one un-prefixed entry each.
  const agnosticOptions: SelectItem[] = surfaceTokens
    .filter((option) => option.label in ROLE_AGNOSTIC_SURFACE_LABELS)
    .map((option) => ({
      value: option.token,
      label: ROLE_AGNOSTIC_SURFACE_LABELS[option.label],
      color: option.label === 'Ghost' ? 'transparent' : `var(--${option.token})`,
    }));
  // Role-specific surfaces keep the "Role / … surface" labelling.
  const surfaceOptions = toRoleItems(
    role,
    surfaceTokens.filter((option) => !(option.label in ROLE_AGNOSTIC_SURFACE_LABELS)),
    'surface'
  );
  const stateOptions = toRoleItems(role, getStateLayerTokensForRole(role), 'state');

  return [
    // No standalone "Transparent" — the Ghost surface (in agnosticOptions) is how a
    // see-through fill is expressed in our surface vocabulary.
    ...agnosticOptions,
    ...surfaceOptions,
    ...stateOptions,
    ...metalVariants.map((metal) => ({
      value: metalChannelToken(metal.prefix, 'Fill'),
      label: `${metal.name} material fill`,
      swatch: `var(--${metalChannelToken(metal.prefix, 'Fill')})`,
    })),
  ];
}

function buildTextOptions(role: AppearanceRoleLabel, metalVariants: MetalVariantOption[]): SelectItem[] {
  const roleOptions = toRoleItems(role, getTextTokensForRole(role), 'text');
  const neutralOptions = role === 'Neutral'
    ? []
    : toRoleItems('Neutral', getTextTokensForRole('Neutral'), 'text');

  return dedupeSelectItems([
    ...roleOptions,
    ...neutralOptions,
    ...metalVariants.map((metal) => ({
      value: metalChannelToken(metal.prefix, 'Text'),
      label: `${metal.name} material text`,
      swatch: `var(--${metalChannelToken(metal.prefix, 'Fill')})`,
    })),
  ]);
}

/**
 * Stroke colour options. `onBold` switches the role + Neutral colour sets to the
 * on-bold tokens so a stroke applied to a bold (dark) fill — e.g. the Button
 * `bold` variant — stays visible. On-default stroke colours render dark-on-dark
 * there and disappear, which reads as "the stroke isn't applying".
 */
function buildStrokeOptions(
  role: AppearanceRoleLabel,
  metalVariants: MetalVariantOption[],
  onBold = false
): SelectItem[] {
  const borderTokensFor = onBold ? getOnBoldBorderTokensForRole : getBorderTokensForRole;
  const roleOptions = borderTokensFor(role)
    .filter((option) => option.token !== 'transparent')
    .map((option) => ({
      value: `solid:${option.token}`,
      label: `${role} / ${option.label}`,
    }));
  const neutralOptions = role === 'Neutral'
    ? []
    : borderTokensFor('Neutral')
      .filter((option) => option.token !== 'transparent')
      .map((option) => ({
        value: `solid:${option.token}`,
        label: `Neutral / ${option.label}`,
      }));

  return dedupeSelectItems([
    { value: 'none', label: 'None' },
    ...roleOptions,
    ...neutralOptions,
    ...metalVariants.map((metal) => ({
      value: metal.value,
      label: `${metal.name} material stroke`,
      swatch: `var(--${metalChannelToken(metal.prefix, 'Fill')})`,
    })),
  ]);
}

function getStrokeSelectValue(
  strokeImage: string,
  strokeColor: string,
  metalVariants: MetalVariantOption[]
): string {
  const metal = metalVariants.find(
    (m) => strokeImage === metalChannelToken(m.prefix, 'Stroke')
  );
  if (metal) return metal.value;
  if (strokeColor && strokeColor !== 'transparent') return `solid:${strokeColor}`;
  return 'none';
}

export interface EditorPanelProps {
  /** Component token manifest */
  manifest: ComponentTokenManifest;
  /** Callback when token changes */
  onTokenChange?: (tokenName: string, selectedToken: string, variant?: string, size?: string) => void;
  /** Callback when token is reset */
  onTokenReset?: (tokenName: string, variant?: string) => void;
  /** Platform dimension token overrides for pixel values */
  platformTokens?: Record<string, string>;
  /** Current density mode */
  previewDensity?: string;
  /** Currently selected variant from preview */
  selectedVariant?: string;
  /** Currently selected size from preview */
  selectedSize?: string;
  /** Callback when variant changes */
  onVariantChange?: (variant: string) => void;
  /** Selected accent role */
  selectedAccentRole?: string;
  /** Selected typography font */
  selectedTypographyFont?: string;
  /** Callback when typography font changes */
  onTypographyFontChange?: (font: string) => void;
  /** Available typography font options */
  typographyFontOptions?: Array<{ value: string; label: string }> | null;
  /** V4 role surface CSS vars for resolving color swatches */
  colorVars?: Record<string, string>;
  /** Callback when decoration placement or mirror changes */
  onDecorationUpdate?: (update: { placement?: 'edges' | 'left' | 'right'; mirror?: boolean }) => void;
  /** Whether ornament decoration is enabled in preview */
  ornamentEnabled?: boolean;
  /** Callback to toggle ornament decoration on/off */
  onOrnamentEnabledChange?: (enabled: boolean) => void;
  /** Recipe definition for components with curated global theming decisions */
  recipeDefinition?: ComponentRecipeDefinition;
}

export function EditorPanel({
  manifest,
  onTokenChange,
  onTokenReset,
  platformTokens,
  previewDensity,
  selectedVariant,
  selectedSize,
  onVariantChange,
  selectedAccentRole,
  selectedTypographyFont,
  onTypographyFontChange,
  typographyFontOptions,
  colorVars,
  onDecorationUpdate,
  ornamentEnabled,
  onOrnamentEnabledChange,
  recipeDefinition,
}: EditorPanelProps) {
  const {
    getResolvedToken,
    setTokenOverride,
    foundationData,
    recipeSelections,
  } = useComponentTokenEditor();

  const rolePrefix = useMemo(
    () => normalizeAppearanceRoleLabel(selectedAccentRole),
    [selectedAccentRole]
  );
  const activeMetalVariants = useMemo(
    () => getActiveMetalVariants(foundationData),
    [foundationData]
  );
  const fillOptions = useMemo(
    () => buildFillOptions(rolePrefix, activeMetalVariants),
    [rolePrefix, activeMetalVariants]
  );
  const textOptions = useMemo(
    () => buildTextOptions(rolePrefix, activeMetalVariants),
    [rolePrefix, activeMetalVariants]
  );
  const strokeOptions = useMemo(
    () => buildStrokeOptions(rolePrefix, activeMetalVariants),
    [rolePrefix, activeMetalVariants]
  );
  // On-bold stroke colours for the bold variant — its dark fill needs the
  // contrasting (light) on-bold tokens, otherwise on-default strokes vanish.
  const boldStrokeOptions = useMemo(
    () => buildStrokeOptions(rolePrefix, activeMetalVariants, true),
    [rolePrefix, activeMetalVariants]
  );
  const strokeOptionsForVariant = (variant: string | undefined): SelectItem[] =>
    variant === 'bold' ? boldStrokeOptions : strokeOptions;

  // Decoration is contextual — only show when an ornament is active for this component
  const decoration = useComponentDecoration(manifest.componentName);
  const hasDecoration = decoration !== null;

  // Group visible tokens by category
  const groupedTokens = useMemo(() => {
    const groups: Partial<Record<TokenCategory, Array<[string, typeof manifest.tokens[string]]>>> = {};

    for (const cat of ADVANCED_CATEGORY_ORDER) {
      groups[cat] = [];
    }

    for (const [name, def] of Object.entries(manifest.tokens)) {
      if (!ADVANCED_VISIBLE_TOKENS.has(name)) continue;
      // Skip decoration tokens when no ornament is active
      if (def.category === 'decoration' && !hasDecoration) continue;
      const category = def.category as TokenCategory;
      if (groups[category]) {
        groups[category]!.push([name, def]);
      }
    }

    return groups;
  }, [manifest.tokens, hasDecoration]);

  const handleTokenChange = (tokenName: string, selectedToken: string, variant?: string, size?: string) => {
    if (!onTokenChange) return;
    onTokenChange(tokenName, selectedToken, variant, size);
  };

  // Resolve current height scale from token overrides
  const heightScale = useMemo(() => {
    if (!hasDecoration) return '1';
    const resolved = getResolvedToken('ornamentHeightScale', manifest);
    return resolved.value || '1';
  }, [hasDecoration, getResolvedToken, manifest]);

  // Count decoration as 3 properties for the section badge
  const decorationCount = hasDecoration ? 3 : 0;

  // Order of sections that will actually render (non-empty).
  // Used both for accordion defaulting and for drawing dividers.
  const renderedCategories = useMemo(() => {
    const result: TokenCategory[] = [];
    for (const category of ADVANCED_CATEGORY_ORDER) {
      if (category === 'decoration') {
        if (hasDecoration) result.push(category);
        continue;
      }
      const tokens = groupedTokens[category];
      if (tokens && tokens.length > 0) result.push(category);
    }
    return result;
  }, [groupedTokens, hasDecoration]);

  // Accordion: only one section open at a time. Default to the first
  // non-empty section so users land on something actionable instead of
  // an empty panel. `null` = all collapsed (reachable by closing the
  // currently-open section).
  const [openCategory, setOpenCategory] = useState<TokenCategory | null>(() => {
    return renderedCategories[0] ?? null;
  });
  const [interactionOpen, setInteractionOpen] = useState(
    manifest.componentName === 'Button' || manifest.componentName === 'LinkButton'
  );

  const handleSectionToggle = (category: TokenCategory) => (open: boolean) => {
    setOpenCategory(open ? category : null);
  };

  /**
   * Ensure the (base) stroke weight is visible when a stroke is first applied,
   * without clobbering a width the user already chose. The single "Stroke width"
   * control owns the weight from here on (base borderWidth fans out to every
   * variant; states fall back to it), so handlers no longer pin a per-state width.
   */
  const ensureStrokeWidthVisible = () => {
    const current = getResolvedToken('borderWidth', manifest).value;
    const nextWidth = INVISIBLE_STROKE_WIDTHS.has(current) ? 'Stroke-M' : current;
    // Re-assert the BASE width (no variant/state). setTokenOverride with no target
    // clears any stale per-variant / per-state borderWidth overrides — including
    // ones written by older stroke handlers that pinned a per-state width — so the
    // single "Stroke width" control stays authoritative and the base reliably
    // governs hover/pressed. (No-op for components whose base is already correct.)
    setTokenOverride('borderWidth', nextWidth);
  };

  const handleButtonStrokeChange = (
    variant: string,
    state: TokenState | undefined,
    value: string
  ) => {
    const target = { variant, state, channel: 'stroke' };
    const suppressDecorationStroke = () => {
      setTokenOverride('cssDecorationInsetStrokeWidth', 'Spacing-0', {
        ...target,
        valueKind: 'none',
      });
      setTokenOverride('cssDecorationUnderlineWidth', 'Spacing-0', {
        ...target,
        valueKind: 'none',
      });
      setTokenOverride('cssDecorationColor', 'transparent', {
        ...target,
        valueKind: 'none',
      });
    };

    if (value === 'none') {
      // Clear this state's stroke paint; leave the shared width alone (no paint
      // means no visible ring regardless of width).
      suppressDecorationStroke();
      setTokenOverride('strokeImage', 'none', { ...target, valueKind: 'none' });
      setTokenOverride('borderColor', 'transparent', { ...target, valueKind: 'none' });
      return;
    }

    const buttonMetalPrefix = parseMetalValue(value);
    if (buttonMetalPrefix) {
      suppressDecorationStroke();
      setTokenOverride('strokeImage', metalChannelToken(buttonMetalPrefix, 'Stroke'), {
        ...target,
        valueKind: 'material',
      });
      setTokenOverride('borderColor', metalChannelToken(buttonMetalPrefix, 'StrokeColor'), {
        ...target,
        valueKind: 'material',
      });
      ensureStrokeWidthVisible();
      return;
    }

    const solidToken = value.startsWith('solid:') ? value.slice('solid:'.length) : value;
    suppressDecorationStroke();
    setTokenOverride('strokeImage', 'none', { ...target, valueKind: 'none' });
    setTokenOverride('borderColor', solidToken, { ...target, valueKind: getTokenValueKind(solidToken) });
    ensureStrokeWidthVisible();
  };

  const handleLinkUnderlineChange = (
    variant: string,
    state: TokenState | undefined,
    value: string
  ) => {
    const target = { variant, state, channel: 'underline' };
    if (value === 'none') {
      setTokenOverride('underlineImage', 'none', { ...target, valueKind: 'none' });
      setTokenOverride('underlineColor', 'transparent', { ...target, valueKind: 'none' });
      return;
    }

    const underlineMetalPrefix = parseMetalValue(value);
    if (underlineMetalPrefix) {
      setTokenOverride('underlineImage', metalChannelToken(underlineMetalPrefix, 'Stroke'), {
        ...target,
        valueKind: 'material',
      });
      setTokenOverride('underlineColor', metalChannelToken(underlineMetalPrefix, 'StrokeColor'), {
        ...target,
        valueKind: 'material',
      });
      return;
    }

    const solidToken = value.startsWith('solid:') ? value.slice('solid:'.length) : value;
    setTokenOverride('underlineImage', 'none', { ...target, valueKind: 'none' });
    setTokenOverride('underlineColor', solidToken, {
      ...target,
      valueKind: getTokenValueKind(solidToken),
    });
  };

  // Plain border stroke (components with `borderColor` but no material image
  // channel, e.g. IconButton). Material maps to the metallic solid stroke colour.
  const handleSolidStrokeChange = (
    variant: string | undefined,
    state: TokenState | undefined,
    value: string
  ) => {
    const target = { variant, state, channel: 'stroke' };
    if (value === 'none') {
      // Clear this state's stroke colour; the shared width control owns weight.
      setTokenOverride('borderColor', 'transparent', { ...target, valueKind: 'none' });
      return;
    }
    const solidMetalPrefix = parseMetalValue(value);
    if (solidMetalPrefix) {
      setTokenOverride('borderColor', metalChannelToken(solidMetalPrefix, 'StrokeColor'), { ...target, valueKind: 'material' });
      ensureStrokeWidthVisible();
      return;
    }
    const solidToken = value.startsWith('solid:') ? value.slice('solid:'.length) : value;
    setTokenOverride('borderColor', solidToken, { ...target, valueKind: getTokenValueKind(solidToken) });
    ensureStrokeWidthVisible();
  };

  /**
   * Manifest-driven colour & material override panel. Renders for ANY component
   * whose manifest declares colour tokens — not just Button/LinkButton. This is
   * what lets every brand override per-component colour/appearance/material
   * decisions in advanced mode, consistent with the Global Component Theme.
   *
   * Channels are resolved by convention from the manifest:
   *  - fill   : backgroundColor (box fill) | indicatorColor (CPI arc)
   *  - text   : textColor | iconColor | labelColor
   *  - stroke : strokeImage (Button material) | underlineImage (Link) | borderColor (solid)
   * Variants + states come from the fill token, so the panel adapts to
   * bold/subtle/ghost, selected-*, high/medium/low, or variant-less components.
   */
  const renderInteractionSection = () => {
    const tokens = manifest.tokens;
    const isColor = (name: string) => tokens[name]?.category === 'color';
    const fillToken = ['backgroundColor', 'indicatorColor'].find(isColor) ?? null;
    let textToken = ['textColor', 'iconColor', 'labelColor'].find(isColor) ?? null;

    // The CircularProgressIndicator's `textColor` only paints the OPTIONAL centre
    // content (percentage label / icon). When centre content is "none" there is
    // nothing to recolour, so hide the text channel entirely rather than offer a
    // dead override. Driven by the live `centerContent` recipe selection.
    const centerContent = recipeSelections?.['centerContent'];
    if (
      manifest.componentName === 'CircularProgressIndicator' &&
      (centerContent ?? 'none') === 'none'
    ) {
      textToken = null;
    }
    if (!fillToken && !textToken) return null;

    // Label the text channel for what it actually recolours: a dedicated icon
    // token → "Icon"; a label token / the CPI centre label → "Label"; components
    // whose icons inherit the text colour via currentColor (e.g. Button) →
    // "Text & icon"; otherwise plain "Text".
    const componentHasIconSlots = ['iconSize', 'iconSizeStart', 'iconSizeEnd'].some(
      (n) => Boolean(tokens[n])
    );
    const textChannelLabel =
      textToken === 'iconColor'
        ? 'Icon'
        : textToken === 'labelColor' || manifest.componentName === 'CircularProgressIndicator'
          ? 'Label'
          : textToken === 'textColor' && componentHasIconSlots
            ? 'Text & icon'
            : 'Text';

    const strokeMode: 'button' | 'link' | 'solid' | null =
      tokens.strokeImage ? 'button'
      : tokens.underlineImage ? 'link'
      : tokens.borderColor ? 'solid'
      : null;
    const strokeLabel = strokeMode === 'link' ? 'Underline' : 'Stroke';

    // Additional fill-like colour tokens shown as their own rows (e.g. CPI track).
    const extraFills = ['trackColor'].filter((n) => isColor(n) && n !== fillToken);

    // The CircularProgressIndicator arc is an SVG stroke — it has no hover/pressed
    // interaction and a gradient cannot paint a stroke from a CSS variable, so we
    // offer solid role colours + solid metal tones (no interaction-state layers,
    // no gradient material). The metal swatches still preview the colour.
    const isSvgFill = fillToken === 'indicatorColor';
    const fillOpts = isSvgFill ? buildArcFillOptions(activeMetalVariants) : fillOptions;
    const textOpts = isSvgFill ? buildTextOptions(rolePrefix, []) : textOptions;
    // The track stays solid (no gradient), so it gets surfaces only.
    const trackFillOpts = isSvgFill ? buildArcFillOptions([]) : fillOptions;

    // CPI arc: a metal pick writes the foundation gradient-stop tokens (rendered
    // as a real SVG gradient); a solid pick sets indicatorColor and clears them.
    const handleSvgFillChange = (value: string) => {
      // Auto = no override → the arc follows the appearance/surface context.
      if (value === 'auto') {
        if (fillToken) onTokenReset?.(fillToken);
        for (const token of CPI_ARC_STOP_TOKENS) onTokenReset?.(token);
        return;
      }
      const metalPrefix = parseMetalValue(value);
      if (metalPrefix) {
        for (const prop of CPI_ARC_STOP_PROPS) {
          setTokenOverride(`arcMaterial-${prop}`, `${metalPrefix}-${prop}`, {
            channel: 'fill',
            valueKind: 'material',
          });
        }
        return;
      }
      if (fillToken) setTokenOverride(fillToken, value, { channel: 'fill', valueKind: getTokenValueKind(value) });
      for (const token of CPI_ARC_STOP_TOKENS) onTokenReset?.(token);
    };
    const getSvgFillValue = (): string => {
      const shadow = getResolvedToken('arcMaterial-Shadow', manifest);
      if (shadow.source === 'override') {
        const metal = activeMetalVariants.find((m) => shadow.value === `${m.prefix}-Shadow`);
        if (metal) return metal.value;
      }
      if (fillToken) {
        const fill = getResolvedToken(fillToken, manifest);
        if (fill.source === 'override') return fill.value;
      }
      return 'auto';
    };

    const variantSourceDef = tokens[fillToken ?? textToken!];
    const variants = variantSourceDef?.variants ? Object.keys(variantSourceDef.variants) : [];
    const fillDef = fillToken ? tokens[fillToken] : undefined;
    const stateKeys = (fillDef?.states ? Object.keys(fillDef.states) : []) as TokenState[];
    const states: Array<{ state: TokenState | undefined; label: string }> = [
      { state: undefined, label: 'Rest' },
      ...stateKeys.map((s) => ({ state: s, label: humanizeKey(s) })),
    ];

    const resolveOpts = (variant: string | undefined, state: TokenState | undefined) => {
      const opts: { variant?: string; state?: TokenState } = {};
      if (variant !== undefined) opts.variant = variant;
      if (state !== undefined) opts.state = state;
      return Object.keys(opts).length > 0 ? opts : undefined;
    };

    const strokeValueFor = (variant: string | undefined, state: TokenState | undefined): string => {
      if (!strokeMode) return 'none';
      const opts = resolveOpts(variant, state);
      if (strokeMode === 'button') {
        return getStrokeSelectValue(
          getResolvedToken('strokeImage', manifest, opts).value,
          getResolvedToken('borderColor', manifest, opts).value,
          activeMetalVariants
        );
      }
      if (strokeMode === 'link') {
        return getStrokeSelectValue(
          getResolvedToken('underlineImage', manifest, opts).value,
          getResolvedToken('underlineColor', manifest, opts).value,
          activeMetalVariants
        );
      }
      return getStrokeSelectValue('', getResolvedToken('borderColor', manifest, opts).value, activeMetalVariants);
    };

    const renderChannels = (
      variant: string | undefined,
      state: TokenState | undefined,
      labelBase: string
    ) => {
      const opts = resolveOpts(variant, state);
      const strokeValue = strokeValueFor(variant, state);
      return (
        <React.Fragment>
          {fillToken && (
            <label className={styles.interactionField}>
              <span>Fill</span>
              <Select
                value={isSvgFill ? getSvgFillValue() : getResolvedToken(fillToken, manifest, opts).value}
                onChange={(value) => {
                  if (isSvgFill) {
                    handleSvgFillChange(value);
                  } else {
                    setTokenOverride(fillToken, value, {
                      variant,
                      state,
                      channel: 'fill',
                      valueKind: getTokenValueKind(value),
                    });
                  }
                }}
                options={ensureCurrentOption(
                  fillOpts,
                  isSvgFill ? getSvgFillValue() : getResolvedToken(fillToken, manifest, opts).value
                )}
                size="sm"
                aria-label={`${labelBase} fill`}
              />
            </label>
          )}
          {strokeMode && (
            <label className={styles.interactionField}>
              <span>{strokeLabel}</span>
              <Select
                value={strokeValue}
                onChange={(value) => {
                  if (strokeMode === 'button') handleButtonStrokeChange(variant ?? '', state, value);
                  else if (strokeMode === 'link') handleLinkUnderlineChange(variant ?? '', state, value);
                  else handleSolidStrokeChange(variant, state, value);
                }}
                options={ensureCurrentOption(strokeOptionsForVariant(variant), strokeValue)}
                size="sm"
                aria-label={`${labelBase} ${strokeLabel.toLowerCase()}`}
              />
            </label>
          )}
          {textToken && (
            <label className={styles.interactionField}>
              <span>{textChannelLabel}</span>
              <Select
                value={getResolvedToken(textToken, manifest, opts).value}
                onChange={(value) => setTokenOverride(textToken, value, {
                  variant,
                  state,
                  channel: 'text',
                  valueKind: getTokenValueKind(value),
                })}
                options={ensureCurrentOption(textOpts, getResolvedToken(textToken, manifest, opts).value)}
                size="sm"
                aria-label={`${labelBase} ${textChannelLabel.toLowerCase()}`}
              />
            </label>
          )}
        </React.Fragment>
      );
    };

    const hasVariants = variants.length > 0;
    const count = hasVariants ? variants.length * states.length : 1 + extraFills.length;

    // Tokens this panel writes — resetting them clears every colour/material
    // override (across all variants + states) back to the global theme default.
    const resettableTokens = [
      fillToken,
      textToken,
      ...(strokeMode === 'link' ? ['underlineImage', 'underlineColor'] : []),
      ...(strokeMode === 'button' ? ['strokeImage', 'borderColor', 'borderWidth'] : []),
      ...(strokeMode === 'solid' ? ['borderColor', 'borderWidth'] : []),
      ...(isSvgFill ? CPI_ARC_STOP_TOKENS : []),
      ...extraFills,
    ].filter((t): t is string => Boolean(t));
    const handleResetColors = () => {
      for (const token of resettableTokens) onTokenReset?.(token);
    };

    return (
      <React.Fragment>
        <div className={styles.sectionDivider} aria-hidden="true" />
        <CollapsibleSection
          title="Interaction states"
          count={count}
          icon={<MousePointer2 size={12} />}
          isOpen={interactionOpen}
          onToggle={setInteractionOpen}
        >
          <div className={styles.interactionPanel}>
            <div className={styles.interactionResetRow}>
              <button
                type="button"
                className={styles.interactionResetButton}
                onClick={handleResetColors}
              >
                <RotateCcw size={11} aria-hidden="true" />
                Reset colours
              </button>
            </div>
            {(strokeMode === 'button' || strokeMode === 'solid') && (
              <div className={styles.interactionTarget}>
                <label className={styles.interactionField}>
                  <span>Stroke width</span>
                  <Select
                    value={getResolvedToken('borderWidth', manifest).value || '0px'}
                    onChange={(value) => setTokenOverride('borderWidth', value, { valueKind: getTokenValueKind(value) })}
                    options={ensureCurrentOption(
                      STROKE_WIDTH_OPTIONS,
                      getResolvedToken('borderWidth', manifest).value || '0px',
                    )}
                    size="sm"
                    aria-label="Stroke width"
                  />
                </label>
              </div>
            )}
            {hasVariants ? (
              variants.map((variant) => (
                <div className={styles.interactionTarget} key={variant}>
                  <div className={styles.interactionTargetHeader}>
                    <span className={styles.interactionTargetName}>{variantLabel(variant)}</span>
                    <span className={styles.interactionTargetMeta}>{variant}</span>
                  </div>
                  <div className={styles.interactionRows}>
                    {states.map(({ state, label: stateLabel }) => (
                      <div className={styles.interactionRow} key={`${variant}-${state ?? 'rest'}`}>
                        <div className={styles.interactionStateName}>{stateLabel}</div>
                        {renderChannels(variant, state, `${variantLabel(variant)} ${stateLabel}`)}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.interactionTarget}>
                <div className={styles.interactionRows}>
                  <div className={styles.interactionRow}>
                    <div className={styles.interactionStateName}>Active</div>
                    {renderChannels(undefined, undefined, 'Active')}
                  </div>
                  {extraFills.map((token) => {
                    const resolved = getResolvedToken(token, manifest);
                    const value = isSvgFill && resolved.source !== 'override' ? 'auto' : resolved.value;
                    return (
                      <div className={styles.interactionRow} key={token}>
                        <div className={styles.interactionStateName}>{humanizeKey(token.replace(/Color$/, ''))}</div>
                        <label className={styles.interactionField}>
                          <span>Fill</span>
                          <Select
                            value={value}
                            onChange={(v) => {
                              if (isSvgFill && v === 'auto') onTokenReset?.(token);
                              else setTokenOverride(token, v, { channel: 'fill', valueKind: getTokenValueKind(v) });
                            }}
                            options={ensureCurrentOption(trackFillOpts, value)}
                            size="sm"
                            aria-label={`${token} fill`}
                          />
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>
      </React.Fragment>
    );
  };

  return (
    <div className={styles.panel}>
      {recipeDefinition && (
        <React.Fragment>
          <RecipePanel definition={recipeDefinition} />
        </React.Fragment>
      )}
      {renderInteractionSection()}
      {renderedCategories.map((category) => {
        // Decoration category: render behavioral controls instead of token rows
        if (category === 'decoration') {
          if (!decoration) return null;

          return (
            <React.Fragment key={category}>
              <div className={styles.sectionDivider} aria-hidden="true" />
              <CollapsibleSection
                title={CATEGORY_LABELS[category]}
                count={decorationCount}
                icon={CATEGORY_ICONS[category]}
                isOpen={openCategory === category}
                onToggle={handleSectionToggle(category)}
              >
                <DecorationSection
                  decoration={decoration}
                  heightScale={heightScale}
                  onDecorationUpdate={onDecorationUpdate}
                  onHeightScaleChange={(value) => handleTokenChange('ornamentHeightScale', value)}
                  enabled={ornamentEnabled ?? true}
                  onEnabledChange={onOrnamentEnabledChange}
                />
              </CollapsibleSection>
            </React.Fragment>
          );
        }

        const tokens = groupedTokens[category]!;
        const useTwoColumn = isTwoColumn(category);

        return (
          <React.Fragment key={category}>
            <div className={styles.sectionDivider} aria-hidden="true" />
            <CollapsibleSection
              title={CATEGORY_LABELS[category]}
              count={tokens.length}
              icon={CATEGORY_ICONS[category]}
              isOpen={openCategory === category}
              onToggle={handleSectionToggle(category)}
            >
              {/* Typography font selector within Typography section */}
              {category === 'typography' && typographyFontOptions && typographyFontOptions.length > 1 && onTypographyFontChange && (
                <div className={styles.typographyFontInSection}>
                  <Select
                    value={selectedTypographyFont || typographyFontOptions[0]?.value || ''}
                    onChange={onTypographyFontChange}
                    options={typographyFontOptions}
                    size="sm"
                  />
                </div>
              )}
              {category === 'spacing' && <PromoteSpacingToFamily manifest={manifest} />}
              <div className={useTwoColumn ? styles.tokenListTwoColumn : styles.tokenList}>
                {tokens.map(([tokenName, definition]) => {
                  const scopeLocked = !isTokenEditableForSelection(definition, selectedVariant, selectedSize);
                  const scopeLockMsg = getScopeLockMessage(definition, selectedVariant, selectedSize);
                  return (
                    <TokenRow
                      key={tokenName}
                      tokenName={tokenName}
                      definition={definition}
                      manifest={manifest}
                      getResolvedToken={getResolvedToken}
                      onTokenChange={handleTokenChange}
                      onTokenReset={onTokenReset || (() => {})}
                      selectedVariant={selectedVariant}
                      selectedSize={selectedSize}
                      onVariantChange={onVariantChange}
                      platformTokens={platformTokens}
                      previewDensity={previewDensity}
                      selectedAppearanceRole={selectedAccentRole}
                      scopeLocked={scopeLocked}
                      scopeLockMessage={scopeLockMsg || undefined}
                      colorVars={colorVars}
                    />
                  );
                })}
              </div>
            </CollapsibleSection>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default EditorPanel;
