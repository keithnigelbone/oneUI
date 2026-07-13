/**
 * buildComponentOverrideCSS.ts
 *
 * Shared utility that resolves recipe selections + manual overrides for every
 * registered component into @layer brand CSS. Most custom properties land on
 * the requested scope selector; context-sensitive Button role/color properties
 * land on the Button element so surface and appearance remapping can resolve.
 *
 * Used by both FoundationStyleProvider (platform) and BrandStyleDecorator (Storybook)
 * to ensure identical CSS output for component overrides.
 */

import type { ComponentOverrideData } from '@oneui/shared';
export type { ComponentOverrideData } from '@oneui/shared';
import { COMPONENT_REGISTRY, resolveComponentSlug } from '../registry/componentRegistry';
import {
  buildComponentPreviewStyles,
  COMPONENT_DECORATION_CAPABILITIES,
  COMPONENT_THEME_FAMILIES,
  expandManifestDefaults,
  filterNonColorTokens,
  getActiveFamilyOwnedRecipeDecisionIdsFromSelections,
  retailBrandUsesTiraCapsuleActions,
  resolveComponentThemeToOverrides,
  resolveRecipeToOverrides,
} from '@oneui/shared';

/** Which cascade layer last wrote a merged token key. */
export type ComponentTokenSource = 'manifest' | 'theme' | 'recipe' | 'manual';

export interface BuildAllComponentCSSOptions {
  /** CSS selector that receives component custom properties. Defaults to :root. */
  selector?: string;
  /**
   * When the active brand is Tira retail, Button/IconButton radii are coerced to `--Shape-Pill`
   * so Actions stay full capsules regardless of persisted Actions theme shape tokens.
   */
  brandSlug?: string | null;
  brandName?: string | null;
  /**
   * When provided, records which cascade layer last wrote each merged token
   * key, keyed by CSS component name -> token key (dot syntax). Used by the
   * editor's provenance badges via explainComponentTokenSources().
   */
  sourceCollector?: Map<string, Map<string, ComponentTokenSource>>;
  /**
   * When true, only the `sourceCollector` is populated — the per-component CSS
   * declaration assembly and the final string join are skipped and `''` is
   * returned. Used by `explainComponentTokenSources`, which needs only token
   * provenance and would otherwise build and discard the entire CSS string on
   * every editor toggle.
   */
  sourcesOnly?: boolean;
}

const VIRTUAL_ROLE_SLOT_COMPONENTS = new Set([
  'Button',
  'IconButton',
  'LinkButton',
  'FAB',
  'Chip',
  'SelectableButton',
  'SelectableIconButton',
  'SelectableSingleTextButton',
  'Input',
  'Checkbox',
  'Radio',
  'Switch',
  'Stepper',
]);

const VIRTUAL_ROLE_SLOT_TOKENS = new Set([
  'roleBold',
  'roleBoldHigh',
  'roleBoldHover',
  'roleBoldPressed',
  'roleSubtle',
  'roleSubtleHover',
  'roleSubtlePressed',
  'roleHigh',
  'roleMediumText',
  'roleLow',
  'roleTinted',
  'roleTintedA11y',
  'roleStrokeLow',
  'roleStrokeMedium',
  'roleHover',
  'rolePressed',
]);

const VIRTUAL_DECORATION_COMPONENTS = new Set(
  COMPONENT_DECORATION_CAPABILITIES.filter((capability) =>
    capability.supportedKinds.includes('css-decoration')
  ).map((capability) => capability.componentName)
);

const VIRTUAL_ORNAMENT_COMPONENTS = new Set(
  COMPONENT_DECORATION_CAPABILITIES.filter((capability) =>
    capability.supportedKinds.includes('svg-ornament')
  ).map((capability) => capability.componentName)
);

const VIRTUAL_DECORATION_TOKENS = new Set([
  'cssDecorationStrokeWidth',
  'cssDecorationStrokeStyle',
  'cssDecorationInsetStrokeWidth',
  'cssDecorationCornerSize',
  'cssDecorationShadow',
  'cssDecorationUnderlineWidth',
  'cssDecorationClipPath',
]);

const VIRTUAL_DECORATION_MODIFIERS = new Set(['bold', 'subtle', 'ghost']);
/** Attention levels map onto these variants; dotted role slots are per-variant. */
const VIRTUAL_ROLE_SLOT_VARIANTS = new Set(['bold', 'subtle', 'ghost']);
const CONTEXT_SCOPED_COMPONENTS = new Set(['Button', 'LinkButton', 'IconButton']);
const BUTTON_CONTEXT_SCOPED_PREFIXES = [
  '--Button-role',
  '--Button-backgroundColor',
  '--Button-textColor',
  '--Button-borderColor',
  '--Button-strokeImage',
  '--Button-solidStrokeColor',
  '--Button-cssDecoration',
];
/* LinkButton paint must resolve on the element (like Button) so role tokens
   remap inside [data-surface] contexts instead of pinning the :root value. */
const LINKBUTTON_CONTEXT_SCOPED_PREFIXES = [
  '--LinkButton-role',
  '--LinkButton-textColor',
  '--LinkButton-underlineColor',
  '--LinkButton-underlineImage',
];
/* IconButton paint mirrors Button: role slots + paint hooks resolve on the
   element so [data-surface] and attention-role remapping stay context-aware. */
const ICONBUTTON_CONTEXT_SCOPED_PREFIXES = [
  '--IconButton-role',
  '--IconButton-backgroundColor',
  '--IconButton-iconColor',
  '--IconButton-borderColor',
  '--IconButton-strokeImage',
  '--IconButton-solidStrokeColor',
  '--IconButton-cssDecoration',
];

const INTERACTION_PAINT_CHANNELS = new Set(['fill', 'stroke', 'text', 'underline']);
const INTERACTION_PAINT_TOKENS = new Set([
  'backgroundColor',
  'borderColor',
  'textColor',
  'underlineColor',
]);
const INTERACTION_PAINT_COMPONENTS = new Set(['Button', 'LinkButton']);
const INTERACTION_PAINT_VARIANTS = new Set(['bold', 'subtle', 'ghost']);
const INTERACTION_PAINT_STATES = new Set(['hover', 'pressed']);
const INTERACTION_PAINT_SCOPES = new Set(['variant', 'variant-state']);
const APPEARANCE_ROLE_VALUE_PATTERN =
  /^(Primary|Secondary|Neutral|Sparkle|Brand-Bg|Positive|Negative|Warning|Informative)-/;

type ComponentTokenOverride = ComponentOverrideData['tokenOverrides'][number];

/**
 * Suffix-based mapping from a chosen `{Role}-…` token to Button's
 * appearance-relative intermediate variable.
 *
 * The rewrite must follow the SEMANTIC of the token the user picked, not the
 * slot it was picked for. The previous slot-keyed map rewrote e.g.
 * `textColor.bold-hover = Primary-TintedA11y` to `var(--_btn-bold-high)` —
 * an on-bold (light) colour — even when the user had also changed the hover
 * fill to a light surface, rendering button text invisible in Storybook/docs
 * while the draft editor (which uses raw values) looked correct.
 *
 * Tokens without an intermediate (Minimal, Moderate, Stroke-Medium, …) return
 * null and are emitted raw — still context-aware because Button paint vars are
 * scoped on the component element.
 */
const BUTTON_ROLE_SUFFIX_TO_INTERMEDIATE: Record<string, string> = {
  'Bold': 'var(--_btn-bold)',
  'Bold-Hover': 'var(--_btn-bold-hover)',
  'Bold-Pressed': 'var(--_btn-bold-pressed)',
  'Subtle': 'var(--_btn-subtle)',
  'Subtle-Hover': 'var(--_btn-subtle-hover)',
  'Subtle-Pressed': 'var(--_btn-subtle-pressed)',
  'Bold-High': 'var(--_btn-bold-high)',
  'Bold-TintedA11y': 'var(--_btn-bold-high)',
  'High': 'var(--_btn-default-high)',
  'Tinted': 'var(--_btn-default-accent)',
  'TintedA11y': 'var(--_btn-default-accent-a11y)',
  'Stroke-Low': 'var(--_btn-default-low-stroke)',
  'Hover': 'var(--_btn-default-hover)',
  'Pressed': 'var(--_btn-default-pressed)',
};

function isAllowedVirtualRoleSlot(componentName: string, tokenName: string): boolean {
  const [baseName, modifier, extra] = tokenName.split('.');
  if (extra) return false;
  if (!VIRTUAL_ROLE_SLOT_COMPONENTS.has(componentName) || !VIRTUAL_ROLE_SLOT_TOKENS.has(baseName)) {
    return false;
  }
  // Per-variant role slots (attention-level roles): `roleBold.subtle` emits
  // `--{Comp}-roleBold-subtle`, consumed by the variant classes.
  return modifier === undefined || VIRTUAL_ROLE_SLOT_VARIANTS.has(modifier);
}

function isAllowedVirtualDecorationSlot(componentName: string, tokenName: string): boolean {
  if (!VIRTUAL_DECORATION_COMPONENTS.has(componentName)) return false;
  const [baseName, modifier, extra] = tokenName.split('.');
  if (extra) return false;
  if (!modifier) return VIRTUAL_DECORATION_TOKENS.has(baseName);
  return VIRTUAL_DECORATION_TOKENS.has(baseName) && VIRTUAL_DECORATION_MODIFIERS.has(modifier);
}

function isAllowedVirtualOrnamentSlot(componentName: string, tokenName: string): boolean {
  if (tokenName.includes('.')) return false;
  return VIRTUAL_ORNAMENT_COMPONENTS.has(componentName) && tokenName === 'ornamentHeightScale';
}

function shouldScopeOnComponentElement(componentName: string, prop: string): boolean {
  if (!CONTEXT_SCOPED_COMPONENTS.has(componentName)) return false;
  if (componentName === 'Button') {
    return BUTTON_CONTEXT_SCOPED_PREFIXES.some((prefix) => prop.startsWith(prefix));
  }
  if (componentName === 'LinkButton') {
    return LINKBUTTON_CONTEXT_SCOPED_PREFIXES.some((prefix) => prop.startsWith(prefix));
  }
  if (componentName === 'IconButton') {
    return ICONBUTTON_CONTEXT_SCOPED_PREFIXES.some((prefix) => prop.startsWith(prefix));
  }
  return false;
}

function getComponentScopedSelector(scopeSelector: string, componentName: string): string {
  const componentSelector = `[data-oneui-component="${componentName}"]`;
  return scopeSelector === ':root' ? componentSelector : `${scopeSelector} ${componentSelector}`;
}

function isStructuredInteractionPaintOverride(
  componentName: string,
  override: ComponentTokenOverride
): boolean {
  const baseName = override.tokenName.split('.')[0];
  if (
    override.target?.variant &&
    override.channel &&
    INTERACTION_PAINT_CHANNELS.has(override.channel) &&
    INTERACTION_PAINT_TOKENS.has(baseName) &&
    override.valueKind
  ) {
    return true;
  }

  if (!INTERACTION_PAINT_COMPONENTS.has(componentName)) return false;
  if (!INTERACTION_PAINT_TOKENS.has(baseName)) return false;
  if (!override.scope || !INTERACTION_PAINT_SCOPES.has(override.scope)) return false;

  const modifier = override.tokenName.split('.')[1];
  if (!modifier) return false;

  const [variant, state] = modifier.split('-');
  if (!INTERACTION_PAINT_VARIANTS.has(variant)) return false;
  return state === undefined || INTERACTION_PAINT_STATES.has(state);
}

function unwrapTokenValue(value: string): string {
  const trimmed = value.trim();
  const cssVarMatch = /^var\(--([A-Za-z0-9-]+)\)$/.exec(trimmed);
  return cssVarMatch?.[1] ?? trimmed;
}

function getButtonAppearanceRelativePaintValue(
  componentName: string,
  override: ComponentTokenOverride
): string | null {
  if (componentName !== 'Button') return null;
  if (!isStructuredInteractionPaintOverride(componentName, override)) return null;
  const unwrapped = unwrapTokenValue(override.value);
  const roleMatch = APPEARANCE_ROLE_VALUE_PATTERN.exec(unwrapped);
  if (!roleMatch) return null;
  const suffix = unwrapped.slice(roleMatch[1].length + 1);
  return BUTTON_ROLE_SUFFIX_TO_INTERMEDIATE[suffix] ?? null;
}

function upsertRootDeclaration(rootDeclarations: string[], prop: string, value: string) {
  const declaration = `    ${prop}: ${value};`;
  const idx = rootDeclarations.findIndex((line) => line.trim().startsWith(`${prop}:`));
  if (idx >= 0) rootDeclarations[idx] = declaration;
  else rootDeclarations.push(declaration);
}

/**
 * Resolves recipe selections + manual overrides for every registered
 * component into brand-layer custom property blocks.
 *
 * Merge priority (lowest → highest):
 * 1. Manifest defaults (factory Figma-aligned associations, excluding color-category)
 * 2. Component theme overrides (brand-level family selections)
 * 3. Recipe overrides (brand recipe selections, excluding color-category)
 * 4. Manual Convex overrides (user customizations in Component Token Editor)
 *
 * Color-category tokens are excluded from manifest defaults + recipe overrides
 * because those are the *factory* layer — emitting them globally would pin every
 * appearance class to the Primary role's default and break multi-accent.
 *
 * Manual overrides do not emit generic color-category tokens. Local component
 * pages are not a color editing surface; global family/theme mappings own that
 * intent. The one exception is the structured interaction-state paint editor,
 * which stores explicit channel/value metadata for component state theming.
 */
export function buildAllComponentCSS(
  data: ComponentOverrideData,
  options: BuildAllComponentCSSOptions = {}
): string {
  // Pre-build lookup maps for O(1) access per component (avoids O(C * (R+T)) scanning)
  const normalizeComponentName = (name: string): string => resolveComponentSlug(name) ?? name;

  const themeOverrideMap = new Map<string, Array<{ tokenName: string; value: string }>>();
  for (const selection of data.componentThemeSelections ?? []) {
    const family = COMPONENT_THEME_FAMILIES.find(
      (definition) => definition.id === selection.familyId
    );
    if (!family) continue;

    const resolved = resolveComponentThemeToOverrides(family, selection.selections);
    for (const override of resolved) {
      const key = normalizeComponentName(override.componentName);
      const arr = themeOverrideMap.get(key);
      const entry = { tokenName: override.tokenName, value: override.value };
      if (arr) arr.push(entry);
      else themeOverrideMap.set(key, [entry]);
    }
  }

  const recipeMap = new Map(
    data.recipeSelections.map((rs) => [normalizeComponentName(rs.componentName), rs])
  );
  const overridesMap = new Map<string, ComponentOverrideData['tokenOverrides']>();
  for (const o of data.tokenOverrides) {
    const key = o.componentName ? normalizeComponentName(o.componentName) : '';
    const arr = overridesMap.get(key);
    if (arr) arr.push(o);
    else overridesMap.set(key, [o]);
  }

  const rootDeclarations: string[] = [];
  const scopedDeclarationBlocks = new Map<string, string[]>();
  const emittedCssComponentNames = new Set<string>();
  // CSS component names whose `borderRadius` received a genuine new shape
  // decision — i.e. a Global Component Theme (`theme`) or recipe selection.
  // Used to gate the Tira retail capsule coercion so a real shape decision
  // wins over the historical "always pill" quirk (see the coercion block
  // below the loop). Manual overrides are DELIBERATELY excluded: the stale
  // non-pill radii the coercion exists to defeat are persisted as manual
  // `tokenOverrides`, so counting them here would let legacy data silently
  // suppress the required capsule.
  const explicitRadiusCssComponents = new Set<string>();

  for (const [componentName, entry] of Object.entries(COMPONENT_REGISTRY)) {
    const { recipe, manifest } = entry;
    const cssComponentName = manifest.componentName || componentName;

    // Resolve recipe selections → token overrides
    const recipeSelection = recipeMap.get(componentName);

    let recipeOverrides: Array<{ tokenName: string; value: string }> = [];
    if (recipe && recipeSelection?.selections) {
      const ignoredDecisionIds = getActiveFamilyOwnedRecipeDecisionIdsFromSelections(
        cssComponentName,
        data.componentThemeSelections
      );
      recipeOverrides = resolveRecipeToOverrides(recipe, recipeSelection.selections, {
        ignoredDecisionIds,
      });
    }

    // Collect brand-level family theme overrides for this component
    const themeOverrides = themeOverrideMap.get(componentName) ?? [];

    // Collect manual token overrides for this component
    const manualOverrides = overridesMap.get(componentName) ?? [];
    const hasComponentOverrides =
      themeOverrides.length > 0 || recipeOverrides.length > 0 || manualOverrides.length > 0;
    const hasEmittedCssComponent = emittedCssComponentNames.has(cssComponentName);

    if (hasEmittedCssComponent && !hasComponentOverrides) {
      continue;
    }

    // Build set of color-category token base names for filtering.
    // Any override whose tokenName starts with a color token (e.g. "backgroundColor",
    // "backgroundColor.bold", "textColor.ghost") must be excluded from global injection.
    const colorTokenNames = new Set<string>();
    for (const [tokenName, tokenDef] of Object.entries(manifest.tokens)) {
      if (tokenDef.category === 'color') {
        colorTokenNames.add(tokenName);
      }
    }

    // Exclude color-category tokens from manifest defaults
    const manifestDefaults = hasEmittedCssComponent
      ? new Map()
      : expandManifestDefaults(filterNonColorTokens(manifest.tokens));
    const mergedMap = new Map([...manifestDefaults]);

    const sources: Map<string, ComponentTokenSource> | undefined = options.sourceCollector
      ? new Map(Array.from(manifestDefaults.keys(), (key) => [key, 'manifest' as const]))
      : undefined;

    // Helper: when a higher-priority source sets a base token that is also
    // size-aware (or variant-aware) in the manifest, wipe the per-size /
    // per-variant modifier entries inherited from manifest defaults so the
    // new base value fans out uniformly. Without this, a recipe override
    // like "pill" would be masked by manifest per-size defaults in Pass 2.
    const clearModifiersForBase = (tokenName: string) => {
      if (tokenName.includes('.')) return;
      const tokenDef = manifest.tokens[tokenName];
      if (!tokenDef) return;
      const modifierKeys: string[] = [];
      if (tokenDef.sizes)
        modifierKeys.push(...Object.keys(tokenDef.sizes).map((k) => `${tokenName}.${k}`));
      if (tokenDef.variants)
        modifierKeys.push(...Object.keys(tokenDef.variants).map((k) => `${tokenName}.${k}`));
      if (tokenDef.states) {
        for (const [state, stateValues] of Object.entries(tokenDef.states)) {
          if (typeof stateValues === 'string') {
            modifierKeys.push(`${tokenName}.${state}`);
          } else {
            modifierKeys.push(
              ...Object.keys(stateValues).map((variant) => `${tokenName}.${variant}-${state}`)
            );
          }
        }
      }
      for (const k of modifierKeys) {
        mergedMap.delete(k);
        sources?.delete(k);
      }
    };

    const applyOverride = (
      override: ComponentTokenOverride,
      options: {
        skipColor: boolean;
        allowVirtualRoleSlot?: boolean;
        allowVirtualDecoration?: boolean;
        allowVirtualOrnament?: boolean;
        source?: ComponentTokenSource;
      }
    ) => {
      const baseName = override.tokenName.split('.')[0];
      if (
        !manifest.tokens[baseName] &&
        !(
          options.allowVirtualRoleSlot &&
          isAllowedVirtualRoleSlot(cssComponentName, override.tokenName)
        ) &&
        !(
          options.allowVirtualDecoration &&
          isAllowedVirtualDecorationSlot(cssComponentName, override.tokenName)
        ) &&
        !(
          options.allowVirtualOrnament &&
          isAllowedVirtualOrnamentSlot(cssComponentName, override.tokenName)
        )
      ) {
        return;
      }
      if (options.skipColor && colorTokenNames.has(baseName)) return;
      clearModifiersForBase(override.tokenName);
      mergedMap.set(override.tokenName, {
        selectedToken:
          getButtonAppearanceRelativePaintValue(cssComponentName, override) ?? override.value,
      });
      if (options.source) sources?.set(override.tokenName, options.source);
      // Record a genuine new shape decision so the Tira capsule coercion below
      // can defer to it. Only `theme` (Global Component Theme) and `recipe`
      // selections count — `manual` is excluded because the legacy stale
      // non-pill radii the coercion exists to defeat are persisted as manual
      // overrides. `borderRadius` is base-only on Actions components, so the
      // base name is sufficient.
      if (
        (options.source === 'theme' || options.source === 'recipe') &&
        baseName === 'borderRadius'
      ) {
        explicitRadiusCssComponents.add(cssComponentName);
      }
    };

    for (const themeOverride of themeOverrides) {
      // Family themes are authored as component-capability mappings. Some
      // decisions intentionally use component-local variables, e.g.
      // `var(--_btn-subtle)`, to preserve appearance and surface remapping.
      applyOverride(themeOverride, {
        skipColor: false,
        allowVirtualRoleSlot: true,
        allowVirtualDecoration: true,
        allowVirtualOrnament: true,
        source: 'theme',
      });
    }

    for (const ro of recipeOverrides) {
      // Recipes describe factory-level decisions — keep them color-safe.
      applyOverride(ro, { skipColor: true, source: 'recipe' });
    }
    for (const mo of manualOverrides) {
      // Keep stale/generic local color overrides from pinning component color.
      // Structured interaction paint overrides are authored by the state panel
      // and remain the explicit path for material/color state theming.
      applyOverride(mo, {
        skipColor: !isStructuredInteractionPaintOverride(cssComponentName, mo),
        allowVirtualDecoration: true,
        source: 'manual',
      });
    }

    if (sources && options.sourceCollector) {
      const existing = options.sourceCollector.get(cssComponentName);
      if (existing) {
        for (const [key, source] of sources) existing.set(key, source);
      } else {
        options.sourceCollector.set(cssComponentName, sources);
      }
    }

    // Build CSS custom properties using the same utility as the platform editor.
    // Skipped entirely in sourcesOnly mode — the sourceCollector is already
    // populated above, so the string work would be pure waste.
    if (!options.sourcesOnly) {
      const styles = buildComponentPreviewStyles(cssComponentName, mergedMap, manifest.tokens);

      for (const [prop, value] of Object.entries(styles)) {
        const declaration = `    ${prop}: ${value};`;
        if (shouldScopeOnComponentElement(cssComponentName, prop)) {
          const scopedSelector = getComponentScopedSelector(
            options.selector ?? ':root',
            cssComponentName
          );
          const declarations = scopedDeclarationBlocks.get(scopedSelector);
          if (declarations) declarations.push(declaration);
          else scopedDeclarationBlocks.set(scopedSelector, [declaration]);
        } else {
          rootDeclarations.push(declaration);
        }
      }
    }

    emittedCssComponentNames.add(cssComponentName);
  }

  // Provenance-only callers stop here — no CSS string is produced.
  if (options.sourcesOnly) return '';

  if (retailBrandUsesTiraCapsuleActions(options.brandSlug, options.brandName)) {
    // Historically Tira persisted stale non-pill radii and this forced capsules
    // unconditionally. It is now a DEFAULT, not an override: a genuine new
    // shape decision (Global Component Theme / recipe) on Button/IconButton
    // wins. Legacy manual radii do not, so the stale data stays overridden.
    if (!explicitRadiusCssComponents.has('Button')) {
      upsertRootDeclaration(rootDeclarations, '--Button-borderRadius', 'var(--Shape-Pill)');
    }
    if (!explicitRadiusCssComponents.has('IconButton')) {
      upsertRootDeclaration(rootDeclarations, '--IconButton-borderRadius', 'var(--Shape-Pill)');
    }
  }

  if (rootDeclarations.length === 0 && scopedDeclarationBlocks.size === 0) return '';

  const selector = options.selector ?? ':root';
  const blocks: string[] = [];
  if (rootDeclarations.length > 0) {
    blocks.push(`  ${selector} {\n${rootDeclarations.join('\n')}\n  }`);
  }
  for (const [scopedSelector, declarations] of scopedDeclarationBlocks) {
    blocks.push(`  ${scopedSelector} {\n${declarations.join('\n')}\n  }`);
  }

  return `@layer brand {\n${blocks.join('\n')}\n}`;
}

/**
 * Which cascade layer (manifest default, global family theme, component
 * recipe, or manual override) determines each merged token key, per CSS
 * component name. Runs the exact merge used by buildAllComponentCSS, so the
 * answer can never drift from the emitted CSS.
 */
export function explainComponentTokenSources(
  data: ComponentOverrideData,
  options: Omit<BuildAllComponentCSSOptions, 'sourceCollector'> = {}
): Map<string, Map<string, ComponentTokenSource>> {
  const sourceCollector = new Map<string, Map<string, ComponentTokenSource>>();
  buildAllComponentCSS(data, { ...options, sourceCollector, sourcesOnly: true });
  return sourceCollector;
}
