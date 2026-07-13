/**
 * ComponentTokenEditorContext.tsx
 *
 * React context for managing Component Token Editor state.
 * Provides state management for the property panel, draft overrides,
 * and persistence to Convex.
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import type {
  ComponentTokenManifest,
  TokenCategory,
  TokenOverrideValue,
  TokenState,
  TokenOption,
  TokenDefinition,
  EditorTabMode,
  GranularTarget,
  TokenOverrideScope,
  ComponentRecipeDefinition,
  ComponentThemeFamilyId,
  ComponentThemeSelections,
  RecipeSelections,
  RecipeTokenOverride,
} from '@oneui/shared';
import {
  AVAILABLE_TOKENS,
  COMPONENT_THEME_FAMILIES,
  getActiveFamilyOwnedRecipeDecisionIds,
  getSurfaceTokensForRole,
  getStateLayerTokensForRole,
  getTextTokensForRole,
  getBorderTokensForRole,
  normalizeAppearanceRoleLabel,
  resolveRecipeToOverrides,
  STROKE_TOKEN_OPTIONS,
} from '@oneui/shared';
import {
  TYPOGRAPHY_ROLES,
  TYPOGRAPHY_SIZES,
  EMPHASIS_LEVELS,
  FIXED_WEIGHT_ROLES,
  FONT_WEIGHTS,
  type TypographyRole,
} from '@oneui/shared';

/**
 * Foundation data structure from Convex
 */
export interface FoundationData {
  typography?: { config: Record<string, unknown> } | null;
  surfaces?: { config: Record<string, unknown> } | null;
  color?: { config: Record<string, unknown> } | null;
  materials?: { config: Record<string, unknown> } | null;
  spacing?: { config: Record<string, unknown> } | null;
  shape?: { config: Record<string, unknown> } | null;
  elevation?: { config: Record<string, unknown> } | null;
  motion?: { config: Record<string, unknown> } | null;
  icons?: { config: Record<string, unknown> } | null;
  stats?: Record<string, unknown>;
}

/**
 * Known component sizes for scope detection when parsing override keys.
 * Used to distinguish `tokenName.size` from `tokenName.variant`.
 */
const KNOWN_SIZES = new Set([
  'small', 'medium', 'large', 'xSmall', 'xLarge',
  'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl',
  // F-step numeric sizes (used by Button and other f-step-based components)
  '6', '7', '8', '10', '12', '14', '16',
]);

const KNOWN_STATES = new Set<TokenState>([
  'default',
  'hover',
  'pressed',
  'focus',
  'disabled',
  'loading',
]);

function parseStateSuffix(value: string): { variant?: string; state?: TokenState } | null {
  for (const state of KNOWN_STATES) {
    if (value === state) return { state };
    const suffix = `-${state}`;
    if (value.endsWith(suffix)) {
      const variant = value.slice(0, -suffix.length);
      if (variant) return { variant, state };
    }
  }
  return null;
}

function parseOverrideKey(key: string): {
  baseTokenName: string;
  scope: TokenOverrideScope;
  target: GranularTarget;
} {
  const parts = key.split('.');
  const baseTokenName = parts[0];
  const target: GranularTarget = {};

  if (parts.length === 3) {
    const stateTarget = parseStateSuffix(parts[1]);
    if (stateTarget?.variant && stateTarget.state) {
      target.variant = stateTarget.variant;
      target.state = stateTarget.state;
      target.size = parts[2];
      return { baseTokenName, scope: 'variant-state-size', target };
    }

    target.variant = parts[1];
    target.size = parts[2];
    return { baseTokenName, scope: 'variant-size', target };
  }

  if (parts.length === 2) {
    const modifier = parts[1];
    const stateTarget = parseStateSuffix(modifier);

    if (stateTarget?.variant && stateTarget.state) {
      target.variant = stateTarget.variant;
      target.state = stateTarget.state;
      return { baseTokenName, scope: 'variant-state', target };
    }

    if (stateTarget?.state) {
      target.state = stateTarget.state;
      return { baseTokenName, scope: 'state', target };
    }

    if (KNOWN_SIZES.has(modifier)) {
      target.size = modifier;
      return { baseTokenName, scope: 'size', target };
    }

    target.variant = modifier;
    return { baseTokenName, scope: 'variant', target };
  }

  return { baseTokenName, scope: 'global', target };
}

/** Width values that render no visible stroke (used by the migration below). */
const INVISIBLE_STROKE_WIDTH_VALUES = new Set(['0px', '0', 'none', 'Stroke-None']);

/**
 * Drop stale per-variant / per-state `borderWidth` modifiers pinned to an
 * invisible width (0px).
 *
 * Older stroke handlers wrote `borderWidth.{variant}` / `borderWidth.{variant}-{state}`
 * = `0px` whenever a stroke was cleared. In the current model the global "Stroke
 * width" control owns the weight and per-variant *paint* owns whether a stroke
 * shows, so an explicit 0px width modifier is redundant — and worse, it shadows
 * the base width in `buildComponentPreviewStyles`, hiding a variant's stroke even
 * when that variant has a paint (e.g. bold rest gets a colour but renders a 0px
 * ring while subtle/ghost show). Visible per-variant widths (e.g. a legitimate
 * ghost-border opt-in) are deliberately left untouched. Mutates `overrides`.
 */
function migrateStrokeWidthOverrides(overrides: Map<string, TokenOverrideValue>): boolean {
  let changed = false;
  for (const [key, value] of overrides) {
    if (!key.startsWith('borderWidth.')) continue;
    if (INVISIBLE_STROKE_WIDTH_VALUES.has(value.selectedToken)) {
      overrides.delete(key);
      changed = true;
    }
  }
  return changed;
}

function buildOverrideKey(
  tokenName: string,
  options?: { variant?: string; state?: TokenState; size?: string }
): string {
  const state = options?.state === 'default' ? undefined : options?.state;
  if (options?.variant && state && options?.size) {
    return `${tokenName}.${options.variant}-${state}.${options.size}`;
  }
  if (options?.variant && state) {
    return `${tokenName}.${options.variant}-${state}`;
  }
  if (options?.variant && options?.size) {
    return `${tokenName}.${options.variant}.${options.size}`;
  }
  if (options?.variant) {
    return `${tokenName}.${options.variant}`;
  }
  if (state) {
    return `${tokenName}.${state}`;
  }
  if (options?.size) {
    return `${tokenName}.${options.size}`;
  }
  return tokenName;
}

export function normalizeSpacingTokenSelection(selectedToken: string): string {
  return selectedToken;
}

/**
 * Generate dynamic token options from foundation data
 * Falls back to default static tokens if foundation data is not available
 * @param tokenName - Optional token name to help determine subcategory (e.g., fontSize vs fontWeight)
 * @param appearanceRole - Optional V4 appearance role for color token generation
 */
export function generateTokenOptionsFromFoundation(
  foundationData: FoundationData | null,
  category: TokenCategory,
  tokenName?: string,
  appearanceRole?: string
): TokenOption[] {
  if (!foundationData) {
    // Return empty - will fall back to static AVAILABLE_TOKENS
    return [];
  }

  switch (category) {
    case 'color':
      return generateColorTokens(foundationData, tokenName, appearanceRole);
    case 'typography':
      return generateTypographyTokens(foundationData, tokenName);
    case 'spacing':
      return generateSpacingTokens(foundationData);
    case 'shape':
      return generateShapeTokens(foundationData);
    case 'stroke':
      return generateStrokeTokens();
    case 'elevation':
      return generateElevationTokens(foundationData);
    case 'motion':
      return generateMotionTokens(foundationData);
    default:
      return [];
  }
}

/**
 * Generate V4 color tokens for a specific appearance role and token context.
 *
 * Uses tokenName to determine whether to return surface/background tokens,
 * on-colour/text tokens, or border tokens. Uses role to select the V4 prefix.
 */
function generateColorTokens(
  _foundationData: FoundationData,
  tokenName?: string,
  appearanceRole?: string
): TokenOption[] {
  // Resolve the V4 role prefix (default: Primary)
  const role = normalizeAppearanceRoleLabel(appearanceRole);

  // Determine token context from tokenName
  const nameLower = (tokenName || '').toLowerCase();
  const isBorderToken = nameLower.includes('border');
  const isTextToken = nameLower.includes('text') || nameLower.includes('color');
  const isSurfaceToken = nameLower.includes('background') || (!isTextToken && !isBorderToken);

  if (isBorderToken) {
    return getBorderTokensForRole(role);
  }

  if (isTextToken && !isSurfaceToken) {
    return getTextTokensForRole(role);
  }

  // Surface / background tokens (default). "Ghost" is our surface-vocabulary name
  // for a see-through fill — never surface the raw word "transparent" in the UI.
  const tokens: TokenOption[] = [
    ...getSurfaceTokensForRole(role),
    ...getStateLayerTokensForRole(role),
    { token: 'transparent', label: 'Ghost' },
  ];

  return tokens;
}

/**
 * Generate V2 typography tokens from the relational typography system.
 *
 * V2 tokens use role-based naming:
 *   Font size:    {Role}-{Size}-FontSize    (e.g., Label-M-FontSize, Display-L-FontSize)
 *   Line height:  {Role}-{Size}-LineHeight  (e.g., Label-M-LineHeight)
 *   Font weight:  {Role}-FontWeight-{Level} (e.g., Label-FontWeight-High) for emphasis roles
 *                 {Role}-{Size}-FontWeight  (e.g., Display-L-FontWeight) for fixed-weight roles
 *
 * @param tokenName - Token name to determine subcategory (fontSize, fontWeight, lineHeight)
 */
function generateTypographyTokens(_foundationData: FoundationData, tokenName?: string): TokenOption[] {
  const tokens: TokenOption[] = [];
  const nameLower = (tokenName || '').toLowerCase();

  // Determine subcategory from tokenName
  const isWeightToken = nameLower.includes('weight') || nameLower.includes('fontweight');
  const isLineHeightToken = nameLower.includes('lineheight') || nameLower.includes('line-height');

  // Capitalize role name for token prefix (e.g., 'label' → 'Label')
  const capitalize = (role: TypographyRole): string =>
    role.charAt(0).toUpperCase() + role.slice(1);

  if (isWeightToken) {
    // Emphasis-based roles: {Role}-FontWeight-High/Medium/Low
    for (const role of TYPOGRAPHY_ROLES) {
      const roleName = capitalize(role);
      if ((FIXED_WEIGHT_ROLES as readonly string[]).includes(role)) {
        // Fixed-weight roles: {Role}-{Size}-FontWeight (numeric values per size)
        const sizes = TYPOGRAPHY_SIZES[role];
        const weights = FONT_WEIGHTS[role] as Record<string, number>;
        for (const size of sizes) {
          tokens.push({
            token: `${roleName}-${size}-FontWeight`,
            label: `${roleName} ${size} (${weights[size]})`,
          });
        }
      } else {
        // Emphasis roles: {Role}-FontWeight-High/Medium/Low
        for (const emphasis of EMPHASIS_LEVELS) {
          const emphasisLabel = emphasis.charAt(0).toUpperCase() + emphasis.slice(1);
          tokens.push({
            token: `${roleName}-FontWeight-${emphasisLabel}`,
            label: `${roleName} ${emphasisLabel}`,
          });
        }
      }
    }
    return tokens;
  }

  if (isLineHeightToken) {
    // V2 line heights: {Role}-{Size}-LineHeight
    for (const role of TYPOGRAPHY_ROLES) {
      const roleName = capitalize(role);
      const sizes = TYPOGRAPHY_SIZES[role];
      for (const size of sizes) {
        tokens.push({
          token: `${roleName}-${size}-LineHeight`,
          label: `${roleName} ${size}`,
        });
      }
    }
    return tokens;
  }

  // Font size (default): {Role}-{Size}-FontSize
  for (const role of TYPOGRAPHY_ROLES) {
    const roleName = capitalize(role);
    const sizes = TYPOGRAPHY_SIZES[role];
    for (const size of sizes) {
      tokens.push({
        token: `${roleName}-${size}-FontSize`,
        label: `${roleName} ${size}`,
      });
    }
  }
  return tokens;
}

/**
 * Generate spacing tokens from the shared canonical numeric token list.
 */
function generateSpacingTokens(_foundationData: FoundationData): TokenOption[] {
  return AVAILABLE_TOKENS.spacing.map((tokenOption) => ({ ...tokenOption }));
}

/**
 * Generate shape tokens.
 * Shape scale is system-derived from dimension f-steps (not brand-configurable).
 * Always returns the full 15-step scale + None + Pill.
 */
/**
 * Shape tokens don't vary by foundation, so this reuses the single canonical
 * scale defined in `@oneui/shared` (`AVAILABLE_TOKENS.shape`) rather than
 * re-declaring it here — keeping token names, ordering, and size labels in one
 * place. The scale itself lives with the CSS vars in
 * `packages/tokens/src/css/primitives.css`.
 */
function generateShapeTokens(_foundationData: FoundationData): TokenOption[] {
  return AVAILABLE_TOKENS.shape.map((option) => ({ ...option }));
}

/**
 * Generate stroke tokens.
 * Stroke tokens are CSS-only (not configurable per brand) so no foundation data needed.
 * Static strokes are fixed; dynamic strokes alias the f-scale.
 */
function generateStrokeTokens(): TokenOption[] {
  return STROKE_TOKEN_OPTIONS.map((tokenOption) => ({ ...tokenOption }));
}

/**
 * Generate elevation tokens
 */
function generateElevationTokens(foundationData: FoundationData): TokenOption[] {
  const tokens: TokenOption[] = [];
  const elevationConfig = foundationData.elevation?.config as {
    levels?: Record<string, unknown>;
  } | undefined;

  // Default 6 levels (0-5)
  const levels = elevationConfig?.levels
    ? Object.keys(elevationConfig.levels)
    : ['0', '1', '2', '3', '4', '5'];

  for (const level of levels) {
    tokens.push({
      token: `Elevation-${level}`,
      label: level === '0' ? 'Level 0 (None)' : `Level ${level}`,
    });
  }

  return tokens;
}

/**
 * Generate motion tokens from motion foundation
 */
function generateMotionTokens(foundationData: FoundationData): TokenOption[] {
  const tokens: TokenOption[] = [];
  const motionConfig = foundationData.motion?.config as {
    durations?: Record<string, number>;
    easings?: Record<string, string>;
  } | undefined;

  // Duration tokens
  const defaultDurations = [
    { token: 'Motion-Duration-Discreet-Micro', label: 'Discreet Micro' },
    { token: 'Motion-Duration-Discreet-Short', label: 'Discreet Short' },
    { token: 'Motion-Duration-Discreet-Medium', label: 'Discreet Medium' },
    { token: 'Motion-Duration-Expressive-Short', label: 'Expressive Short' },
    { token: 'Motion-Duration-Expressive-Medium', label: 'Expressive Medium' },
    { token: 'Motion-Duration-Expressive-Long', label: 'Expressive Long' },
  ];

  // Easing tokens
  const defaultEasings = [
    { token: 'Motion-Easing-Standard', label: 'Standard' },
    { token: 'Motion-Easing-Enter', label: 'Enter' },
    { token: 'Motion-Easing-Exit', label: 'Exit' },
  ];

  tokens.push(...defaultDurations, ...defaultEasings);

  return tokens;
}

/**
 * Format token name to human-readable label
 */
function formatTokenLabel(tokenName: string): string {
  // Remove prefix and format
  return tokenName
    .replace(/^(Surface|Text|Primary|Secondary|Sparkle)-/, '')
    .replace(/-/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2');
}

/**
 * Editor state interface
 */
interface ComponentTokenEditorState {
  /** Whether the editor panel is open */
  isOpen: boolean;
  /** Currently selected brand ID */
  selectedBrandId: string | null;
  /** Currently selected token category filter */
  selectedCategory: TokenCategory | 'all';
  /** Currently selected theme mode */
  selectedMode: 'light' | 'dark';
  /** Current preview state for the component */
  previewState: TokenState;
  /** Draft overrides not yet saved */
  draftOverrides: Map<string, TokenOverrideValue>;
  /** Whether there are unsaved changes */
  isDirty: boolean;
  /** Whether a save is in progress */
  isSaving: boolean;
  /** Last save error if any */
  lastSaveError: string | null;
  /** Foundation data from Convex for the current brand */
  foundationData: FoundationData | null;
  /** Active editor tab mode */
  activeTabMode: EditorTabMode;
  /** Whether editing globally or targeting a specific variant/size */
  editingScope: 'global' | 'granular';
  /** Target variant/size when in granular editing mode */
  granularTarget: GranularTarget;
  /** Current recipe selections (decision ID -> selected option) */
  recipeSelections: Record<string, string>;
  /** Override keys currently owned by recipe (vs manual Tier 3) */
  recipeOwnedKeys: Set<string>;
  /** Brand-level component theme selections, grouped by family ID */
  componentThemeSelections: Record<string, Record<string, string>>;
}

/**
 * Editor actions interface
 */
interface ComponentTokenEditorActions {
  /** Open the panel */
  openPanel: () => void;
  /** Close the panel */
  closePanel: () => void;
  /** Toggle panel open/close */
  togglePanel: () => void;
  /** Select a brand */
  selectBrand: (brandId: string) => void;
  /** Select a category filter */
  selectCategory: (category: TokenCategory | 'all') => void;
  /** Select theme mode */
  selectMode: (mode: 'light' | 'dark') => void;
  /** Set preview state */
  setPreviewState: (state: TokenState) => void;
  /** Set a token override */
  setTokenOverride: (
    tokenName: string,
    selectedToken: string,
    options?: {
      variant?: string;
      state?: TokenState;
      size?: string;
      mediaContext?: string;
      channel?: string;
      valueKind?: string;
    }
  ) => void;
  /** Reset a single token to default */
  resetTokenOverride: (tokenName: string) => void;
  /** Reset all overrides (also clears from database) */
  resetAllOverrides: () => Promise<void>;
  /** Mark save as in progress */
  setSaving: (isSaving: boolean) => void;
  /** Set save error */
  setSaveError: (error: string | null) => void;
  /** Mark as clean (after save) */
  markClean: () => void;
  /** Save overrides to Convex */
  saveOverrides: () => Promise<void>;
  /** Get resolved token value */
  getResolvedToken: (
    tokenName: string,
    manifest: ComponentTokenManifest,
    options?: { variant?: string; state?: TokenState; size?: string }
  ) => { value: string; source: 'override' | 'default' };
  /** Set active editor tab mode */
  setActiveTabMode: (mode: EditorTabMode) => void;
  /** Set editing scope (global or granular) */
  setEditingScope: (scope: 'global' | 'granular') => void;
  /** Set granular target (variant/size combo) */
  setGranularTarget: (target: GranularTarget) => void;
  /** Get override indicators for a token (which variant/size combos have overrides) */
  getOverrideIndicators: (tokenName: string) => GranularTarget[];
  /** Set a recipe decision and re-resolve overrides */
  setRecipeDecision: (decisionId: string, optionValue: string) => void;
  /** Reset all recipe decisions to defaults */
  resetRecipeDecisions: () => void;
  /** Set a brand-level component theme decision */
  setComponentThemeDecision: (
    familyId: ComponentThemeFamilyId,
    decisionId: string,
    optionValue: string
  ) => void;
  /**
   * Set (value) or remove (null) a precision parameter key on a family
   * (`shapeLanguage:token`, `controlScale:ramp:paddingHorizontal`,
   * `controlScale:cell:paddingHorizontal.10`).
   */
  setComponentThemeDecisionParam: (
    familyId: ComponentThemeFamilyId,
    paramKey: string,
    value: string | null
  ) => void;
  /** Clear one decision (and all its precision params) back to inert */
  clearComponentThemeDecision: (
    familyId: ComponentThemeFamilyId,
    decisionId: string
  ) => void;
  /** Reset one brand-level component theme family to the inert factory state */
  resetComponentThemeFamily: (familyId: ComponentThemeFamilyId) => void;
  /** Reset every brand-level component theme family to the inert factory state */
  resetAllComponentThemes: () => void;
}

/**
 * Combined context value
 */
interface ComponentTokenEditorContextValue
  extends ComponentTokenEditorState,
    ComponentTokenEditorActions {}

/**
 * Context
 */
const ComponentTokenEditorContext = createContext<ComponentTokenEditorContextValue | null>(null);

function recipeOverrideToTokenValue(override: RecipeTokenOverride): TokenOverrideValue {
  const parsed = parseOverrideKey(override.tokenName);
  return {
    tokenName: parsed.baseTokenName,
    selectedToken: normalizeSpacingTokenSelection(override.value),
    variant: parsed.target.variant,
    state: parsed.target.state,
    size: parsed.target.size,
  };
}

/**
 * Saved override structure (from Convex)
 */
export interface SavedTokenOverride {
  tokenName: string;
  /** @deprecated Mode is no longer used - overrides are mode-agnostic */
  mode?: string;
  value: string;
  /** Scope of this override (global, variant, state, size, or combined scopes) */
  scope?: TokenOverrideScope;
  /** Structured target metadata; tokenName remains the backward-compatible key. */
  target?: GranularTarget;
  /** Paint channel metadata for state theming. */
  channel?: string;
  /** Structured value kind metadata (token, material, transparent, none). */
  valueKind?: string;
}

function hasGranularTarget(target: GranularTarget): boolean {
  return Object.values(target).some((value) => value !== undefined && value !== '');
}

function toSavedTokenOverride(key: string, override: TokenOverrideValue): SavedTokenOverride {
  const parsed = parseOverrideKey(key);
  const target: GranularTarget = {
    ...parsed.target,
    ...(override.mediaContext ? { mediaContext: override.mediaContext } : {}),
  };

  return {
    tokenName: key,
    value: normalizeSpacingTokenSelection(override.selectedToken),
    scope: parsed.scope,
    ...(hasGranularTarget(target) ? { target } : {}),
    ...(override.channel ? { channel: override.channel } : {}),
    ...(override.valueKind ? { valueKind: override.valueKind } : {}),
  };
}

/**
 * Provider props
 */
interface ComponentTokenEditorProviderProps {
  children: ReactNode;
  /** Initial brand ID */
  initialBrandId?: string | null;
  /** Controlled mode from global theme */
  mode?: 'light' | 'dark';
  /** Current brand ID from platform context */
  brandId?: string | null;
  /** Foundation data from Convex for token resolution */
  foundationData?: FoundationData | null;
  /** Component name for scoped overrides */
  componentName?: string;
  /** Saved overrides from Convex (loaded on mount) */
  savedOverrides?: SavedTokenOverride[] | null;
  /** Callback to persist overrides to Convex */
  onSaveOverrides?: (overrides: SavedTokenOverride[]) => Promise<void>;
  /** Callback to clear all overrides from Convex */
  onClearOverrides?: () => Promise<void>;
  /** Initial tab mode for the editor */
  initialTabMode?: EditorTabMode;
  /** Recipe definition for the component (if recipes are supported) */
  recipeDefinition?: ComponentRecipeDefinition;
  /** Saved recipe selections from Convex */
  savedRecipeSelections?: RecipeSelections | null;
  /** Callback to persist recipe selections */
  onSaveRecipeSelections?: (selections: RecipeSelections) => Promise<void>;
  /** Saved brand-level component theme selections from Convex */
  savedComponentThemeSelections?: ComponentThemeSelections[] | null;
  /** Callback to persist brand-level component theme selections */
  onSaveComponentThemeSelections?: (
    familyId: ComponentThemeFamilyId,
    selections: ComponentThemeSelections
  ) => Promise<void>;
  /**
   * Callback to delete a brand-level component theme family row (reset to
   * inert). Falls back to persisting an empty selections blob when absent.
   */
  onDeleteComponentThemeSelections?: (familyId: ComponentThemeFamilyId) => Promise<void>;
}

/**
 * Provider component
 */
export function ComponentTokenEditorProvider({
  children,
  initialBrandId = null,
  mode = 'light',
  brandId: externalBrandId = null,
  foundationData: externalFoundationData = null,
  componentName,
  savedOverrides,
  onSaveOverrides,
  onClearOverrides,
  initialTabMode = 'design',
  recipeDefinition,
  savedRecipeSelections,
  onSaveRecipeSelections,
  savedComponentThemeSelections,
  onSaveComponentThemeSelections,
  onDeleteComponentThemeSelections,
}: ComponentTokenEditorProviderProps) {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [activeTabMode, setActiveTabMode] = useState<EditorTabMode>(initialTabMode);
  const [editingScope, setEditingScope] = useState<'global' | 'granular'>('global');
  const [granularTarget, setGranularTarget] = useState<GranularTarget>({});
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(initialBrandId);
  const [selectedCategory, setSelectedCategory] = useState<TokenCategory | 'all'>('all');
  // Use the controlled mode from props - syncs with global theme
  const selectedMode = mode;
  const [previewState, setPreviewState] = useState<TokenState>('default');
  const [draftOverrides, setDraftOverrides] = useState<Map<string, TokenOverrideValue>>(
    new Map()
  );
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveError, setLastSaveError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [recipeSelections, setRecipeSelections] = useState<Record<string, string>>({});
  const [recipeOwnedKeys, setRecipeOwnedKeys] = useState<Set<string>>(new Set());
  const recipeOwnedKeysRef = React.useRef<Set<string>>(new Set());
  const [componentThemeSelections, setComponentThemeSelections] = useState<
    Record<string, Record<string, string>>
  >({});
  // Synchronous mirror of `componentThemeSelections`. Reads in the mutation
  // helpers below go through this ref so a burst of edits to one family before
  // the next render (rapid ramp/cell/param clicks) each see the prior edit
  // instead of the same stale closure snapshot, which would clobber earlier
  // edits (last-write-wins). Kept in sync with external/async updates (Convex
  // load, resets) via the effect below.
  const componentThemeSelectionsRef = useRef(componentThemeSelections);
  useEffect(() => {
    componentThemeSelectionsRef.current = componentThemeSelections;
  }, [componentThemeSelections]);

  const updateRecipeOwnedKeys = useCallback((keys: Set<string>) => {
    recipeOwnedKeysRef.current = keys;
    setRecipeOwnedKeys(keys);
  }, []);

  const ignoredRecipeDecisionIds = useMemo(
    () => recipeDefinition
      ? getActiveFamilyOwnedRecipeDecisionIds(
          recipeDefinition.componentName,
          componentThemeSelections
        )
      : new Set<string>(),
    [recipeDefinition, componentThemeSelections]
  );

  // Use external brand ID if provided, otherwise use internal state
  const effectiveBrandId = externalBrandId || selectedBrandId;

  // Foundation data from props (from Convex query)
  const foundationData = externalFoundationData;

  // Track which (brand:component) was last loaded to detect changes
  const lastLoadedKeyRef = React.useRef<string>('');

  // Unified initialization: loads overrides when brand, component, or data changes.
  // Overrides are mode-agnostic — a single set applies to all themes (light/dark).
  // CSS variables referenced as override values automatically adapt to the active theme
  // via the CSS cascade (e.g. var(--Primary-Bold) resolves differently in light/dark).
  React.useEffect(() => {
    const currentKey = `${effectiveBrandId}:${componentName}`;
    const keyChanged = currentKey !== lastLoadedKeyRef.current;

    // If savedOverrides is null/undefined, the Convex query is loading (brand just changed).
    // Clear stale drafts immediately so the UI shows the default state while loading.
    if (savedOverrides == null) {
      if (keyChanged) {
        setDraftOverrides(new Map());
        setIsDirty(false);
        setIsInitialized(false);
      }
      return;
    }

    // Skip if already loaded for this exact (brand, component)
    if (!keyChanged && isInitialized) return;

    // Load ALL overrides from Convex for the current brand — no mode filter
    const initialOverrides = new Map<string, TokenOverrideValue>();
    if (savedOverrides.length > 0) {
      for (const saved of savedOverrides) {
        const parsed = parseOverrideKey(saved.tokenName);
        const target = saved.target ?? parsed.target;

        initialOverrides.set(saved.tokenName, {
          tokenName: parsed.baseTokenName,
          selectedToken: normalizeSpacingTokenSelection(saved.value),
          variant: target.variant,
          state: target.state,
          size: target.size,
          scope: saved.scope ?? parsed.scope,
          mediaContext: target.mediaContext,
          channel: saved.channel,
          valueKind: saved.valueKind,
        });
      }
    }

    // Heal stale per-variant/state 0px stroke-width overrides (old handlers).
    // If anything was removed, leave the draft dirty so the debounced auto-save
    // persists the cleanup — otherwise the saved CSS (real app) stays broken.
    const healed = migrateStrokeWidthOverrides(initialOverrides);

    setDraftOverrides(initialOverrides);
    setIsDirty(healed);
    setIsInitialized(true);
    lastLoadedKeyRef.current = currentKey;
  }, [savedOverrides, effectiveBrandId, componentName, isInitialized]);

  // Initialize recipe selections from saved data
  React.useEffect(() => {
    if (!recipeDefinition) return;

    if (savedRecipeSelections?.selections) {
      setRecipeSelections(savedRecipeSelections.selections);

      // Re-resolve overrides and apply recipe-owned keys, excluding decisions
      // currently owned by the Global Component Theme.
      const overrides = resolveRecipeToOverrides(recipeDefinition, savedRecipeSelections.selections, {
        ignoredDecisionIds: ignoredRecipeDecisionIds,
      });
      const ownedKeys = new Set(overrides.map((o) => o.tokenName));
      const previousRecipeOwnedKeys = recipeOwnedKeysRef.current;
      updateRecipeOwnedKeys(ownedKeys);

      // Apply recipe overrides to draft overrides while removing any old
      // recipe-owned keys that are now controlled globally.
      if (isInitialized) {
        setDraftOverrides((prev) => {
          const next = new Map(prev);
          for (const key of previousRecipeOwnedKeys) {
            next.delete(key);
          }
          for (const override of overrides) {
            // Only set if not already manually overridden (manual Tier 3 wins)
            if (!next.has(override.tokenName)) {
              next.set(override.tokenName, recipeOverrideToTokenValue(override));
            }
          }
          return next;
        });
      }
    } else {
      // No saved selections — use defaults (which produce no overrides)
      const defaults: Record<string, string> = {};
      for (const decision of recipeDefinition.decisions) {
        defaults[decision.id] = decision.defaultOption;
      }
      setRecipeSelections(defaults);
      updateRecipeOwnedKeys(new Set());
    }
  }, [
    recipeDefinition,
    savedRecipeSelections,
    isInitialized,
    ignoredRecipeDecisionIds,
    updateRecipeOwnedKeys,
  ]);

  // Initialize brand-level component theme selections.
  React.useEffect(() => {
    if (savedComponentThemeSelections == null) return;

    const next: Record<string, Record<string, string>> = {};
    for (const item of savedComponentThemeSelections) {
      next[item.familyId] = item.selections;
    }
    setComponentThemeSelections(next);
  }, [savedComponentThemeSelections]);

  // Auto-save: debounced save when overrides change
  React.useEffect(() => {
    // Don't auto-save if not initialized, no save callback, or no changes
    if (!isInitialized || !onSaveOverrides || !isDirty) {
      return;
    }

    // Debounce auto-save by 500ms
    const timeoutId = setTimeout(async () => {
      setIsSaving(true);
      setLastSaveError(null);

      try {
        // Convert Map to array of SavedTokenOverride with scope metadata.
        // IMPORTANT: Use the Map key (which includes variant/size suffix) as tokenName
        // so loading restores the correct key structure.
        const overridesArray: SavedTokenOverride[] = [];
        for (const [key, override] of draftOverrides) {
          overridesArray.push(toSavedTokenOverride(key, override));
        }

        await onSaveOverrides(overridesArray);
        setIsDirty(false);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to save overrides';
        setLastSaveError(message);
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [isInitialized, onSaveOverrides, isDirty, draftOverrides]);

  // Actions
  const openPanel = useCallback(() => setIsOpen(true), []);
  const closePanel = useCallback(() => setIsOpen(false), []);
  const togglePanel = useCallback(() => setIsOpen((prev) => !prev), []);

  const selectBrand = useCallback((brandId: string) => {
    setSelectedBrandId(brandId);
    // Reset draft overrides when switching brands
    setDraftOverrides(new Map());
    setIsDirty(false);
  }, []);

  const selectCategory = useCallback((category: TokenCategory | 'all') => {
    setSelectedCategory(category);
  }, []);

  // Mode is controlled externally via props, no-op function for API compatibility
  const selectMode = useCallback((_mode: 'light' | 'dark') => {
    // Mode is now controlled via props from the global theme
  }, []);

  const setTokenOverride = useCallback(
    (
      tokenName: string,
      selectedToken: string,
      options?: {
        variant?: string;
        state?: TokenState;
        size?: string;
        mediaContext?: string;
        channel?: string;
        valueKind?: string;
      }
    ) => {
      setDraftOverrides((prev) => {
        const next = new Map(prev);
        // Build key: tokenName, tokenName.variant-state, tokenName.size,
        // tokenName.variant.size, or tokenName.variant-state.size.
        const overrideKey = buildOverrideKey(tokenName, options);

        // When setting a global override (no size/variant), clear any stale
        // size-specific or variant-specific overrides for this token so the
        // fan-out in buildPreviewStyles isn't overwritten by old specifics.
        if (!options?.variant && !options?.size && !options?.state) {
          const prefix = `${tokenName}.`;
          for (const key of next.keys()) {
            if (key.startsWith(prefix) && !recipeOwnedKeys.has(key)) {
              next.delete(key);
            }
          }
        }

        next.set(overrideKey, {
          tokenName,
          selectedToken: normalizeSpacingTokenSelection(selectedToken),
          variant: options?.variant,
          state: options?.state === 'default' ? undefined : options?.state,
          size: options?.size,
          scope: parseOverrideKey(overrideKey).scope,
          mediaContext: options?.mediaContext,
          channel: options?.channel,
          valueKind: options?.valueKind,
        });
        return next;
      });
      setIsDirty(true);
      setLastSaveError(null);
    },
    [recipeOwnedKeys]
  );

  const resetTokenOverride = useCallback((tokenName: string) => {
    setDraftOverrides((prev) => {
      const next = new Map(prev);
      // Remove all overrides for this token (including variant/state/size specific ones)
      for (const key of next.keys()) {
        if (key === tokenName || key.startsWith(`${tokenName}.`)) {
          next.delete(key);
        }
      }
      return next;
    });
    setIsDirty(true);
  }, []);

  const resetAllOverrides = useCallback(async () => {
    setDraftOverrides(new Map());
    setIsDirty(false); // Mark as clean since we're clearing

    // Also reset recipe selections to defaults so they don't re-apply stale overrides
    if (recipeDefinition) {
      const defaults: Record<string, string> = {};
      for (const decision of recipeDefinition.decisions) {
        defaults[decision.id] = decision.defaultOption;
      }
      setRecipeSelections(defaults);
      updateRecipeOwnedKeys(new Set());

      if (onSaveRecipeSelections) {
        onSaveRecipeSelections({ selections: defaults }).catch((err) => {
          console.error('Failed to reset recipe selections:', err);
        });
      }
    }

    // Also clear from Convex if callback is provided
    if (onClearOverrides) {
      try {
        setIsSaving(true);
        await onClearOverrides();
      } catch (error) {
        console.error('Failed to clear overrides from database:', error);
      } finally {
        setIsSaving(false);
      }
    }
  }, [onClearOverrides, recipeDefinition, onSaveRecipeSelections, updateRecipeOwnedKeys]);

  // Recipe actions
  const setRecipeDecision = useCallback(
    (decisionId: string, optionValue: string) => {
      if (!recipeDefinition) return;

      const newSelections = { ...recipeSelections, [decisionId]: optionValue };
      setRecipeSelections(newSelections);

      // Re-resolve all recipe overrides
      const newOverrides = resolveRecipeToOverrides(recipeDefinition, newSelections, {
        ignoredDecisionIds: ignoredRecipeDecisionIds,
      });
      const newOwnedKeys = new Set(newOverrides.map((o) => o.tokenName));

      // Remove old recipe-owned keys from draft overrides
      setDraftOverrides((prev) => {
        const next = new Map(prev);
        // Remove all old recipe-owned keys
        for (const key of recipeOwnedKeys) {
          // Only remove if this key isn't also manually overridden
          const existing = next.get(key);
          if (existing) {
            next.delete(key);
          }
        }
        // Insert new recipe-generated overrides
        for (const override of newOverrides) {
          next.set(override.tokenName, recipeOverrideToTokenValue(override));
        }
        return next;
      });

      updateRecipeOwnedKeys(newOwnedKeys);
      setIsDirty(true);

      // Also persist recipe selections
      if (onSaveRecipeSelections) {
        onSaveRecipeSelections({ selections: newSelections }).catch((err) => {
          console.error('Failed to save recipe selections:', err);
        });
      }
    },
    [
      recipeDefinition,
      recipeSelections,
      recipeOwnedKeys,
      ignoredRecipeDecisionIds,
      onSaveRecipeSelections,
      updateRecipeOwnedKeys,
    ]
  );

  const resetRecipeDecisions = useCallback(() => {
    if (!recipeDefinition) return;

    // Reset to defaults
    const defaults: Record<string, string> = {};
    for (const decision of recipeDefinition.decisions) {
      defaults[decision.id] = decision.defaultOption;
    }
    setRecipeSelections(defaults);

    // Remove all recipe-owned keys from draft overrides
    setDraftOverrides((prev) => {
      const next = new Map(prev);
      for (const key of recipeOwnedKeys) {
        next.delete(key);
      }
      return next;
    });

    updateRecipeOwnedKeys(new Set());
    setIsDirty(true);

    // Persist reset
    if (onSaveRecipeSelections) {
      onSaveRecipeSelections({ selections: defaults }).catch((err) => {
        console.error('Failed to save recipe selections:', err);
      });
    }
  }, [recipeDefinition, recipeOwnedKeys, onSaveRecipeSelections, updateRecipeOwnedKeys]);

  const persistFamilySelections = useCallback(
    (familyId: ComponentThemeFamilyId, selections: Record<string, string>) => {
      if (!onSaveComponentThemeSelections) return;
      onSaveComponentThemeSelections(familyId, { familyId, selections }).catch((err) => {
        console.error('Failed to save component theme selections:', err);
      });
    },
    [onSaveComponentThemeSelections]
  );

  // Commit a computed family blob through the ref → state → persist in one
  // place, so state, the synchronous ref mirror, and the Convex write never
  // diverge and back-to-back edits compose instead of clobbering each other.
  const commitFamilySelections = useCallback(
    (familyId: ComponentThemeFamilyId, nextFamilySelections: Record<string, string>) => {
      const nextAll = {
        ...componentThemeSelectionsRef.current,
        [familyId]: nextFamilySelections,
      };
      componentThemeSelectionsRef.current = nextAll;
      setComponentThemeSelections(nextAll);
      persistFamilySelections(familyId, nextFamilySelections);
    },
    [persistFamilySelections]
  );

  const setComponentThemeDecision = useCallback(
    (
      familyId: ComponentThemeFamilyId,
      decisionId: string,
      optionValue: string
    ) => {
      const familySelections = componentThemeSelectionsRef.current[familyId] ?? {};
      const nextFamilySelections: Record<string, string> = {
        ...familySelections,
        [decisionId]: optionValue,
      };
      // Leaving `custom` behind orphans its precision params — strip them so
      // a later re-selection of custom starts clean.
      if (optionValue !== 'custom') {
        for (const key of Object.keys(nextFamilySelections)) {
          if (key.startsWith(`${decisionId}:`)) delete nextFamilySelections[key];
        }
      }
      commitFamilySelections(familyId, nextFamilySelections);
    },
    [commitFamilySelections]
  );

  const setComponentThemeDecisionParam = useCallback(
    (familyId: ComponentThemeFamilyId, paramKey: string, value: string | null) => {
      const familySelections = componentThemeSelectionsRef.current[familyId] ?? {};
      const nextFamilySelections = { ...familySelections };
      if (value === null || value === '') {
        delete nextFamilySelections[paramKey];
      } else {
        nextFamilySelections[paramKey] = value;
      }
      commitFamilySelections(familyId, nextFamilySelections);
    },
    [commitFamilySelections]
  );

  const deleteFamilyRow = useCallback(
    (familyId: ComponentThemeFamilyId) => {
      if (onDeleteComponentThemeSelections) {
        onDeleteComponentThemeSelections(familyId).catch((err) => {
          console.error('Failed to delete component theme selections:', err);
        });
      } else {
        // Fallback: an empty selections blob is equally inert.
        persistFamilySelections(familyId, {});
      }
    },
    [onDeleteComponentThemeSelections, persistFamilySelections]
  );

  // Drop a family's row entirely (ref → state → delete), mirroring
  // commitFamilySelections so the ref never goes stale on removals.
  const removeFamilySelections = useCallback(
    (familyId: ComponentThemeFamilyId) => {
      const nextAll = { ...componentThemeSelectionsRef.current };
      delete nextAll[familyId];
      componentThemeSelectionsRef.current = nextAll;
      setComponentThemeSelections(nextAll);
      deleteFamilyRow(familyId);
    },
    [deleteFamilyRow]
  );

  const clearComponentThemeDecision = useCallback(
    (familyId: ComponentThemeFamilyId, decisionId: string) => {
      const familySelections = componentThemeSelectionsRef.current[familyId] ?? {};
      const nextFamilySelections: Record<string, string> = {};
      for (const [key, value] of Object.entries(familySelections)) {
        if (key === decisionId || key.startsWith(`${decisionId}:`)) continue;
        nextFamilySelections[key] = value;
      }

      if (Object.keys(nextFamilySelections).length === 0) {
        removeFamilySelections(familyId);
      } else {
        commitFamilySelections(familyId, nextFamilySelections);
      }
    },
    [commitFamilySelections, removeFamilySelections]
  );

  const resetComponentThemeFamily = useCallback(
    (familyId: ComponentThemeFamilyId) => {
      // Inert = no row at all; every decision falls back to its default.
      removeFamilySelections(familyId);
    },
    [removeFamilySelections]
  );

  const resetAllComponentThemes = useCallback(() => {
    componentThemeSelectionsRef.current = {};
    setComponentThemeSelections({});
    for (const family of COMPONENT_THEME_FAMILIES) {
      deleteFamilyRow(family.id);
    }
  }, [deleteFamilyRow]);

  const setSaving = useCallback((saving: boolean) => {
    setIsSaving(saving);
  }, []);

  const setSaveError = useCallback((error: string | null) => {
    setLastSaveError(error);
  }, []);

  const markClean = useCallback(() => {
    setIsDirty(false);
    setLastSaveError(null);
  }, []);

  // Save overrides to Convex
  const saveOverrides = useCallback(async () => {
    if (!onSaveOverrides || draftOverrides.size === 0) {
      return;
    }

    setIsSaving(true);
    setLastSaveError(null);

    try {
      // Convert Map to array of SavedTokenOverride (mode-agnostic)
      const overridesArray: SavedTokenOverride[] = [];
      for (const [key, override] of draftOverrides) {
        overridesArray.push(toSavedTokenOverride(key, override));
      }

      await onSaveOverrides(overridesArray);
      setIsDirty(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save overrides';
      setLastSaveError(message);
      console.error('Failed to save token overrides:', error);
    } finally {
      setIsSaving(false);
    }
  }, [onSaveOverrides, draftOverrides]);

  const getResolvedToken = useCallback(
    (
      tokenName: string,
      manifest: ComponentTokenManifest,
      options?: { variant?: string; state?: TokenState; size?: string }
    ): { value: string; source: 'override' | 'default' } => {
      const state = options?.state === 'default' ? undefined : options?.state;
      // Resolution cascade (highest priority first):
      // 1. tokenName.variant-state.size (most specific)
      if (options?.variant && state && options?.size) {
        const variantStateSizeOverride = draftOverrides.get(
          `${tokenName}.${options.variant}-${state}.${options.size}`
        );
        if (variantStateSizeOverride) {
          return { value: variantStateSizeOverride.selectedToken, source: 'override' };
        }
      }

      // 2. tokenName.variant-state
      if (options?.variant && state) {
        const variantStateOverride = draftOverrides.get(`${tokenName}.${options.variant}-${state}`);
        if (variantStateOverride) {
          return { value: variantStateOverride.selectedToken, source: 'override' };
        }
      }

      // 3. tokenName.variant.size
      if (options?.variant && options?.size) {
        const variantSizeOverride = draftOverrides.get(`${tokenName}.${options.variant}.${options.size}`);
        if (variantSizeOverride) {
          return { value: variantSizeOverride.selectedToken, source: 'override' };
        }
      }

      // 4. tokenName.variant
      if (options?.variant) {
        const variantOverride = draftOverrides.get(`${tokenName}.${options.variant}`);
        if (variantOverride) {
          return { value: variantOverride.selectedToken, source: 'override' };
        }
      }

      // 5. tokenName.state
      if (state) {
        const stateOverride = draftOverrides.get(`${tokenName}.${state}`);
        if (stateOverride) {
          return { value: stateOverride.selectedToken, source: 'override' };
        }
      }

      // 6. tokenName.size
      if (options?.size) {
        const sizeOverride = draftOverrides.get(`${tokenName}.${options.size}`);
        if (sizeOverride) {
          return { value: sizeOverride.selectedToken, source: 'override' };
        }
      }

      // 7. tokenName (global override)
      const baseOverride = draftOverrides.get(tokenName);
      if (baseOverride) {
        return { value: baseOverride.selectedToken, source: 'override' };
      }

      // 8. Manifest defaults
      const definition = manifest.tokens[tokenName];
      if (!definition) {
        return { value: '', source: 'default' };
      }

      // Check state-specific default
      if (state && definition.states?.[state]) {
        const stateValue = definition.states[state];
        if (typeof stateValue === 'string') {
          return { value: stateValue, source: 'default' };
        }
        if (options?.variant && stateValue[options.variant]) {
          return { value: stateValue[options.variant], source: 'default' };
        }
      }

      // Check variant-specific default
      if (options?.variant && definition.variants?.[options.variant]) {
        return { value: definition.variants[options.variant], source: 'default' };
      }

      // Check size-specific default
      if (options?.size && definition.sizes?.[options.size]) {
        return { value: definition.sizes[options.size], source: 'default' };
      }

      return { value: definition.defaultToken, source: 'default' };
    },
    [draftOverrides]
  );

  // (KNOWN_SIZES is defined at module level)

  /**
   * Get override indicators for a token — returns which variant/size combos have overrides.
   * Scans draftOverrides keys that start with `tokenName.` and parses the suffix.
   */
  const getOverrideIndicators = useCallback(
    (tokenName: string): GranularTarget[] => {
      const indicators: GranularTarget[] = [];
      const prefix = `${tokenName}.`;

      for (const key of draftOverrides.keys()) {
        if (!key.startsWith(prefix)) continue;
        indicators.push(parseOverrideKey(key).target);
      }

      return indicators;
    },
    [draftOverrides]
  );

  // Memoized context value
  const value = useMemo<ComponentTokenEditorContextValue>(
    () => ({
      // State
      isOpen,
      selectedBrandId: effectiveBrandId,
      selectedCategory,
      selectedMode,
      previewState,
      draftOverrides,
      isDirty,
      isSaving,
      lastSaveError,
      foundationData,
      activeTabMode,
      editingScope,
      granularTarget,
      recipeSelections,
      recipeOwnedKeys,
      componentThemeSelections,
      // Actions
      openPanel,
      closePanel,
      togglePanel,
      selectBrand,
      selectCategory,
      selectMode,
      setPreviewState,
      setTokenOverride,
      resetTokenOverride,
      resetAllOverrides,
      setSaving,
      setSaveError,
      markClean,
      saveOverrides,
      getResolvedToken,
      setActiveTabMode,
      setEditingScope,
      setGranularTarget,
      getOverrideIndicators,
      setRecipeDecision,
      resetRecipeDecisions,
      setComponentThemeDecision,
      setComponentThemeDecisionParam,
      clearComponentThemeDecision,
      resetComponentThemeFamily,
      resetAllComponentThemes,
    }),
    [
      isOpen,
      effectiveBrandId,
      selectedCategory,
      selectedMode,
      previewState,
      draftOverrides,
      isDirty,
      isSaving,
      lastSaveError,
      foundationData,
      activeTabMode,
      editingScope,
      granularTarget,
      recipeSelections,
      recipeOwnedKeys,
      componentThemeSelections,
      openPanel,
      closePanel,
      togglePanel,
      selectBrand,
      selectCategory,
      selectMode,
      setPreviewState,
      setTokenOverride,
      resetTokenOverride,
      resetAllOverrides,
      setSaving,
      setSaveError,
      markClean,
      saveOverrides,
      getResolvedToken,
      setActiveTabMode,
      setEditingScope,
      setGranularTarget,
      getOverrideIndicators,
      setRecipeDecision,
      resetRecipeDecisions,
      setComponentThemeDecision,
      setComponentThemeDecisionParam,
      clearComponentThemeDecision,
      resetComponentThemeFamily,
      resetAllComponentThemes,
    ]
  );

  return (
    <ComponentTokenEditorContext.Provider value={value}>
      {children}
    </ComponentTokenEditorContext.Provider>
  );
}

/**
 * Hook to access the editor context
 */
export function useComponentTokenEditor(): ComponentTokenEditorContextValue {
  const context = useContext(ComponentTokenEditorContext);
  if (!context) {
    throw new Error(
      'useComponentTokenEditor must be used within a ComponentTokenEditorProvider'
    );
  }
  return context;
}
