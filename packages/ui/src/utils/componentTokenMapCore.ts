/**
 * Builds a flat map of CSS custom property names → values for all components,
 * using the **same** merge pipeline as `buildAllComponentCSS` (manifest,
 * theme family, recipe, manual overrides).
 *
 * Intended for native clients (Flutter, Kotlin, Swift) and Convex — not for
 * changing web behaviour.
 */

import type { ComponentOverrideData } from '@oneui/shared';
import {
  buildComponentPreviewStyles,
  COMPONENT_THEME_FAMILIES,
  expandManifestDefaults,
  filterNonColorTokens,
  resolveComponentThemeToOverrides,
  resolveRecipeToOverrides,
} from '@oneui/shared';

import type { ComponentDesignRegistryEntry } from '../registry/componentDesignRegistry';
import { COMPONENT_DESIGN_REGISTRY } from '../registry/componentDesignRegistry';
import { normalizeComponentRegistryKey } from '../registry/componentRegistrySlugMap';

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

function isAllowedVirtualRoleSlot(componentName: string, tokenName: string): boolean {
  if (tokenName.includes('.')) return false;
  return VIRTUAL_ROLE_SLOT_COMPONENTS.has(componentName) && VIRTUAL_ROLE_SLOT_TOKENS.has(tokenName);
}

/**
 * Flat `--Component-token` → CSS value map (may contain `var(--Foo)` refs).
 * Same semantics as the declarations inside `buildAllComponentCSS`.
 */
export function buildAllComponentCustomPropertiesFlat(
  data: ComponentOverrideData,
  registry: Record<string, ComponentDesignRegistryEntry> = COMPONENT_DESIGN_REGISTRY,
  /**
   * Optional out-collector: CSS component names whose `borderRadius` received
   * a genuine new shape decision (Global Component Theme / recipe). Callers
   * (e.g. the native theme snapshot) use this to gate the Tira retail capsule
   * coercion so a real shape decision wins. Manual overrides are excluded —
   * the legacy stale radii the coercion defeats are persisted as manual
   * overrides. Mirrors `buildAllComponentCSS` on the web path.
   */
  explicitRadiusCssComponents?: Set<string>
): Record<string, string> {
  const normalizeComponentName = (name: string): string => normalizeComponentRegistryKey(name);

  const themeOverrideMap = new Map<string, Array<{ tokenName: string; value: string }>>();
  for (const selection of data.componentThemeSelections ?? []) {
    const family = COMPONENT_THEME_FAMILIES.find((definition) => definition.id === selection.familyId);
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
  const overridesMap = new Map<string, Array<{ componentName?: string; tokenName: string; value: string }>>();
  for (const o of data.tokenOverrides) {
    const key = o.componentName ? normalizeComponentName(o.componentName) : '';
    const arr = overridesMap.get(key);
    if (arr) arr.push(o);
    else overridesMap.set(key, [o]);
  }

  const flat: Record<string, string> = {};
  const emittedCssComponentNames = new Set<string>();

  for (const [componentName, entry] of Object.entries(registry)) {
    const { recipe, manifest } = entry;
    const cssComponentName = manifest.componentName || componentName;

    const recipeSelection = recipeMap.get(componentName);

    let recipeOverrides: Array<{ tokenName: string; value: string }> = [];
    if (recipe && recipeSelection?.selections) {
      recipeOverrides = resolveRecipeToOverrides(recipe, recipeSelection.selections);
    }

    const themeOverrides = themeOverrideMap.get(componentName) ?? [];
    const manualOverrides = overridesMap.get(componentName) ?? [];
    const hasComponentOverrides =
      themeOverrides.length > 0 || recipeOverrides.length > 0 || manualOverrides.length > 0;
    const hasEmittedCssComponent = emittedCssComponentNames.has(cssComponentName);

    if (hasEmittedCssComponent && !hasComponentOverrides) {
      continue;
    }

    const colorTokenNames = new Set<string>();
    for (const [tokenName, tokenDef] of Object.entries(manifest.tokens)) {
      if (tokenDef.category === 'color') {
        colorTokenNames.add(tokenName);
      }
    }

    const manifestDefaults = hasEmittedCssComponent
      ? new Map()
      : expandManifestDefaults(filterNonColorTokens(manifest.tokens));
    const mergedMap = new Map([...manifestDefaults]);

    const clearModifiersForBase = (tokenName: string) => {
      if (tokenName.includes('.')) return;
      const tokenDef = manifest.tokens[tokenName];
      if (!tokenDef) return;
      const modifierKeys: string[] = [];
      if (tokenDef.sizes) modifierKeys.push(...Object.keys(tokenDef.sizes).map((k) => `${tokenName}.${k}`));
      if (tokenDef.variants)
        modifierKeys.push(...Object.keys(tokenDef.variants).map((k) => `${tokenName}.${k}`));
      for (const k of modifierKeys) mergedMap.delete(k);
    };

    const applyOverride = (
      override: { tokenName: string; value: string },
      options: {
        skipColor: boolean;
        allowVirtualRoleSlot?: boolean;
        source?: 'theme' | 'recipe' | 'manual';
      }
    ) => {
      const baseName = override.tokenName.split('.')[0];
      if (
        !manifest.tokens[baseName] &&
        !(options.allowVirtualRoleSlot && isAllowedVirtualRoleSlot(cssComponentName, override.tokenName))
      ) {
        return;
      }
      if (options.skipColor && colorTokenNames.has(baseName)) return;
      clearModifiersForBase(override.tokenName);
      mergedMap.set(override.tokenName, { selectedToken: override.value });
      // Only a genuine new shape decision (theme/recipe) gates the Tira capsule
      // coercion — manual radii are the legacy stale data it exists to defeat.
      // Mirrors the web path in buildComponentOverrideCSS.ts.
      if ((options.source === 'theme' || options.source === 'recipe') && baseName === 'borderRadius') {
        explicitRadiusCssComponents?.add(cssComponentName);
      }
    };

    for (const themeOverride of themeOverrides) {
      applyOverride(themeOverride, { skipColor: false, allowVirtualRoleSlot: true, source: 'theme' });
    }

    for (const ro of recipeOverrides) {
      applyOverride(ro, { skipColor: true, source: 'recipe' });
    }
    for (const mo of manualOverrides) {
      applyOverride(mo, { skipColor: false, source: 'manual' });
    }

    const styles = buildComponentPreviewStyles(cssComponentName, mergedMap, manifest.tokens);

    for (const [prop, value] of Object.entries(styles)) {
      flat[prop] = value;
    }

    emittedCssComponentNames.add(cssComponentName);
  }

  return flat;
}
