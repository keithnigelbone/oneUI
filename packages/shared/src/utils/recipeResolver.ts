/**
 * recipeResolver.ts
 *
 * Pure functions for resolving recipe selections to token overrides.
 * No React dependency — framework-agnostic.
 */

import type {
  ComponentThemeFamilyDefinition,
  ComponentThemeTarget,
  ComponentThemeTokenOverride,
  ComponentRecipeDefinition,
  RecipeDecision,
  RecipeTokenOverride,
} from '../types/componentRecipes';
import { parseRampOffset, shiftSpacingToken } from './spacingLadder';
import {
  COMPONENT_DECORATION_STROKE_STYLE_OPTIONS,
  COMPONENT_DECORATION_STROKE_WIDTH_OPTIONS,
  getComponentDecorationCapability,
  getCssDecorationComponents,
  type ComponentCssDecorationOption,
} from '../componentDecorationCapabilities';

const CSS_DECORATION_COMPONENTS = getCssDecorationComponents().map(
  (capability) => capability.componentName,
);
const CSS_DECORATION_COMPONENT_SET = new Set<string>(CSS_DECORATION_COMPONENTS);
const CSS_DECORATION_STROKE_WIDTH_SET = new Set<string>(
  COMPONENT_DECORATION_STROKE_WIDTH_OPTIONS.map((option) => option.value),
);
const CSS_DECORATION_STROKE_STYLE_SET = new Set<string>(
  COMPONENT_DECORATION_STROKE_STYLE_OPTIONS.map((option) => option.value),
);
const DEFAULT_CSS_DECORATION_STROKE_WIDTH = 'Stroke-L';
const DEFAULT_CSS_DECORATION_STROKE_STYLE = 'solid';
const LEGACY_CSS_DECORATION_WEIGHT = {
  subtle: 'Stroke-M',
  balanced: 'Stroke-L',
  strong: 'Stroke-XL',
} as const;
const CSS_DECORATION_CORNER_SIZE = {
  tight: 'Spacing-2',
  regular: 'Spacing-4',
  deep: 'Spacing-6',
} as const;

const CSS_DECORATION_DEFAULT_TARGETS = ['Button'];
const CSS_DECORATION_OPTION_SET = new Set<ComponentCssDecorationOption>([
  'none',
  'inset-stroke',
  'underline',
  'cut-corner',
]);

function parseCssDecorationTargets(raw?: string): string[] {
  const values = (raw ?? CSS_DECORATION_DEFAULT_TARGETS.join(','))
    .split(',')
    .map((value) => value.trim())
    .filter((value) => CSS_DECORATION_COMPONENT_SET.has(value));

  return values.length > 0 ? values : CSS_DECORATION_DEFAULT_TARGETS;
}

function resolveCssDecorationOption(raw?: string): ComponentCssDecorationOption {
  return CSS_DECORATION_OPTION_SET.has(raw as ComponentCssDecorationOption)
    ? (raw as ComponentCssDecorationOption)
    : 'none';
}

function supportsCssDecorationOption(
  componentName: string,
  decorationStyle: ComponentCssDecorationOption,
): boolean {
  const capability = getComponentDecorationCapability(componentName);
  return capability?.cssOptions?.includes(decorationStyle) ?? false;
}

function componentTokenReference(componentName: string, tokenName: string, fallback: string): string {
  return `var(--${componentName}-${tokenName}, var(--${fallback}))`;
}

function resolveCssDecorationStrokeWidth(selections: Record<string, string>): string {
  const selectedStrokeWidth = selections.cssDecorationStrokeWidth;
  if (CSS_DECORATION_STROKE_WIDTH_SET.has(selectedStrokeWidth)) {
    return selectedStrokeWidth;
  }

  return (
    LEGACY_CSS_DECORATION_WEIGHT[
      selections.cssDecorationWeight as keyof typeof LEGACY_CSS_DECORATION_WEIGHT
    ] ?? DEFAULT_CSS_DECORATION_STROKE_WIDTH
  );
}

function resolveCssDecorationStrokeStyle(selections: Record<string, string>): string {
  const selectedStrokeStyle = selections.cssDecorationStrokeStyle;
  return CSS_DECORATION_STROKE_STYLE_SET.has(selectedStrokeStyle)
    ? selectedStrokeStyle
    : DEFAULT_CSS_DECORATION_STROKE_STYLE;
}

function resolveCssDecorationOverrides(
  definition: ComponentThemeFamilyDefinition,
  selections: Record<string, string>,
): ComponentThemeTokenOverride[] {
  if (definition.id !== 'actions') return [];

  const decorationStyle = resolveCssDecorationOption(selections.cssDecoration);
  if (decorationStyle === 'none') return [];

  const strokeWidth = resolveCssDecorationStrokeWidth(selections);
  const strokeStyle = resolveCssDecorationStrokeStyle(selections);
  const cornerSize =
    CSS_DECORATION_CORNER_SIZE[
      selections.cssDecorationCornerSize as keyof typeof CSS_DECORATION_CORNER_SIZE
    ] ?? CSS_DECORATION_CORNER_SIZE.regular;
  const targets = parseCssDecorationTargets(selections.cssDecorationTargets).filter((componentName) =>
    supportsCssDecorationOption(componentName, decorationStyle)
  );
  const overrides: ComponentThemeTokenOverride[] = [];

  for (const componentName of targets.length > 0 ? targets : CSS_DECORATION_DEFAULT_TARGETS) {
    const strokeReference = componentTokenReference(
      componentName,
      'cssDecorationStrokeWidth',
      'Stroke-L',
    );
    const cornerReference = componentTokenReference(
      componentName,
      'cssDecorationCornerSize',
      'Spacing-2',
    );

    overrides.push(
      {
        componentName,
        familyId: definition.id,
        decisionId: 'cssDecoration',
        tokenName: 'cssDecorationStrokeWidth',
        value: strokeWidth,
      },
      {
        componentName,
        familyId: definition.id,
        decisionId: 'cssDecoration',
        tokenName: 'cssDecorationStrokeStyle',
        value: strokeStyle,
      },
      {
        componentName,
        familyId: definition.id,
        decisionId: 'cssDecoration',
        tokenName: 'cssDecorationCornerSize',
        value: cornerSize,
      },
    );

    if (decorationStyle === 'inset-stroke' || decorationStyle === 'cut-corner') {
      overrides.push({
        componentName,
        familyId: definition.id,
        decisionId: 'cssDecoration',
        tokenName: 'cssDecorationInsetStrokeWidth',
        value: strokeReference,
      });
    }

    if (decorationStyle === 'underline') {
      overrides.push({
        componentName,
        familyId: definition.id,
        decisionId: 'cssDecoration',
        tokenName: 'cssDecorationUnderlineWidth',
        value: strokeReference,
      });
    }

    if (decorationStyle === 'cut-corner') {
      overrides.push({
        componentName,
        familyId: definition.id,
        decisionId: 'cssDecoration',
        tokenName: 'cssDecorationClipPath',
        value:
          `polygon(${cornerReference} 0, 100% 0, 100% calc(100% - ${cornerReference}), ` +
          `calc(100% - ${cornerReference}) 100%, 0 100%, 0 ${cornerReference})`,
      });
    }
  }

  return overrides;
}

/**
 * Resolve recipe selections to a flat array of token overrides.
 *
 * For each decision, looks up the selected option (or falls back to default)
 * and collects all token overrides from the resolution map.
 */
export function resolveRecipeToOverrides(
  definition: ComponentRecipeDefinition,
  selections: Record<string, string>,
  options: { ignoredDecisionIds?: ReadonlySet<string> } = {}
): RecipeTokenOverride[] {
  const overrides: RecipeTokenOverride[] = [];
  const ignoredDecisionIds = options.ignoredDecisionIds ?? new Set<string>();

  for (const decision of definition.decisions) {
    if (ignoredDecisionIds.has(decision.id)) continue;
    const selectedValue = selections[decision.id] || decision.defaultOption;
    const optionOverrides = definition.resolutionMap[decision.id]?.[selectedValue];

    if (optionOverrides) {
      overrides.push(...optionOverrides);
    }
  }

  return overrides;
}

/**
 * Resolve non-token metadata from recipe selections.
 *
 * Some decisions (like iconPlacement) don't map to CSS tokens but instead
 * influence component behavior/layout. This extracts those as key-value pairs.
 */
export function resolveRecipeMetadata(
  definition: ComponentRecipeDefinition,
  selections: Record<string, string>
): Record<string, string> {
  const metadata: Record<string, string> = {};

  for (const decision of definition.decisions) {
    const selectedValue = selections[decision.id] || decision.defaultOption;

    // Decisions in the 'behavior' category are metadata, not token overrides
    if (decision.category === 'behavior') {
      metadata[decision.id] = selectedValue;
    }
  }

  return metadata;
}

/**
 * Deprecated selection keys that alias a newer decision. Legacy rows may only
 * carry the old key; the new decision resolves through it before falling back
 * to its default.
 */
const THEME_DECISION_ALIASES: Record<string, string> = {
  highAttentionStyle: 'emphasisStyle',
};

/** Decisions whose `custom` option is parameterized by an exact Shape token. */
const SHAPE_DECISION_IDS = new Set(['shapeLanguage']);
/** Decisions whose `custom` option is parameterized by ramp offsets + pinned cells. */
const SCALE_DECISION_IDS = new Set(['controlScale', 'density']);

/** Separator for precision parameter keys inside theme selections. */
export const THEME_PARAM_SEPARATOR = ':';

export function themeParamKey(decisionId: string, param: string): string {
  return `${decisionId}${THEME_PARAM_SEPARATOR}${param}`;
}

/** True for `:`-namespaced precision keys (`shapeLanguage:token`, `controlScale:cell:*`). */
export function isThemeParamKey(key: string): boolean {
  return key.includes(THEME_PARAM_SEPARATOR);
}

/** All selection keys owned by a decision: the decision id plus its params/cells. */
export function themeDecisionKeyPrefixMatches(decisionId: string, key: string): boolean {
  return key === decisionId || key.startsWith(`${decisionId}${THEME_PARAM_SEPARATOR}`);
}

export function readThemeSelection(
  selections: Record<string, string>,
  decision: RecipeDecision,
): string {
  const aliasKey = THEME_DECISION_ALIASES[decision.id];
  return (
    selections[decision.id] ||
    (aliasKey ? selections[aliasKey] : undefined) ||
    decision.defaultOption
  );
}

function resolveCustomShapeOverrides(
  definition: ComponentThemeFamilyDefinition,
  decision: RecipeDecision,
  selections: Record<string, string>,
): ComponentThemeTokenOverride[] {
  const shapeToken = selections[themeParamKey(decision.id, 'token')];
  if (!shapeToken) return [];

  const overrides: ComponentThemeTokenOverride[] = [];
  for (const target of definition.targets) {
    if (!target.shapeTokens?.length) continue;
    for (const tokenName of target.shapeTokens) {
      overrides.push({
        componentName: target.componentName,
        familyId: definition.id,
        decisionId: decision.id,
        tokenName,
        value: shapeToken,
      });
    }
    for (const derived of target.derivedShapeOverrides ?? []) {
      overrides.push({
        ...derived,
        componentName: target.componentName,
        familyId: definition.id,
        decisionId: decision.id,
      });
    }
  }
  return overrides;
}

function resolveCustomScaleOverridesForTarget(
  target: ComponentThemeTarget,
  decision: RecipeDecision,
  selections: Record<string, string>,
): Map<string, string> {
  const baselines = target.metricBaselines;
  const emitted = new Map<string, string>();
  if (!baselines) return emitted;

  // Ramp pass: shift every per-size baseline the same number of ladder steps,
  // so size ordering is preserved by construction.
  for (const [metric, sizes] of Object.entries(baselines)) {
    const offset = parseRampOffset(selections[themeParamKey(decision.id, `ramp${THEME_PARAM_SEPARATOR}${metric}`)]);
    if (offset === 0) continue;
    for (const [size, baseline] of Object.entries(sizes)) {
      const key = size === '' ? metric : `${metric}.${size}`;
      emitted.set(key, shiftSpacingToken(baseline, offset));
    }
  }

  // Pinned cells win over ramp output. Cells are stored per family and apply
  // to every target that exposes the metric.
  const cellPrefix = themeParamKey(decision.id, `cell${THEME_PARAM_SEPARATOR}`);
  for (const [selectionKey, value] of Object.entries(selections)) {
    if (!selectionKey.startsWith(cellPrefix) || !value) continue;
    const tokenKey = selectionKey.slice(cellPrefix.length);
    const metric = tokenKey.split('.')[0];
    if (!baselines[metric]) continue;
    emitted.set(tokenKey, value);
  }

  // Mirror metrics (e.g. Button paddingHorizontal -> Start/End) with the same
  // size suffix, matching the preset scale maps.
  if (target.metricMirrors) {
    for (const [key, value] of Array.from(emitted.entries())) {
      const [metric, size] = key.split('.');
      const mirrors = target.metricMirrors[metric];
      if (!mirrors) continue;
      for (const mirror of mirrors) {
        emitted.set(size === undefined ? mirror : `${mirror}.${size}`, value);
      }
    }
  }

  return emitted;
}

/**
 * Precision pass: expands `custom` shape/scale decisions parameterized by
 * `:`-namespaced selection keys (exact shape token, per-metric ramp offsets,
 * pinned per-size cells) into ordinary per-size token overrides.
 */
function resolvePrecisionOverrides(
  definition: ComponentThemeFamilyDefinition,
  selections: Record<string, string>,
): ComponentThemeTokenOverride[] {
  const overrides: ComponentThemeTokenOverride[] = [];

  for (const decision of definition.decisions) {
    if (readThemeSelection(selections, decision) !== 'custom') continue;

    if (SHAPE_DECISION_IDS.has(decision.id)) {
      overrides.push(...resolveCustomShapeOverrides(definition, decision, selections));
    } else if (SCALE_DECISION_IDS.has(decision.id)) {
      for (const target of definition.targets) {
        const emitted = resolveCustomScaleOverridesForTarget(target, decision, selections);
        for (const [tokenName, value] of emitted) {
          overrides.push({
            componentName: target.componentName,
            familyId: definition.id,
            decisionId: decision.id,
            tokenName,
            value,
          });
        }
      }
    }
  }

  return overrides;
}

/**
 * Resolve a brand-level component theme family into component-scoped token
 * overrides. Per-component recipes and manual overrides are applied later in
 * the cascade, so this function only expands the family intent.
 */
export function resolveComponentThemeToOverrides(
  definition: ComponentThemeFamilyDefinition,
  selections: Record<string, string>
): ComponentThemeTokenOverride[] {
  const overrides: ComponentThemeTokenOverride[] = [];

  for (const decision of definition.decisions) {
    const selectedValue = readThemeSelection(selections, decision);

    for (const target of definition.targets) {
      const targetOverrides = target.resolutionMap[decision.id]?.[selectedValue];
      if (!targetOverrides) continue;

      for (const override of targetOverrides) {
        overrides.push({
          ...override,
          componentName: target.componentName,
          familyId: definition.id,
          decisionId: decision.id,
        });
      }
    }
  }

  overrides.push(...resolvePrecisionOverrides(definition, selections));
  overrides.push(...resolveCssDecorationOverrides(definition, selections));

  return overrides;
}
