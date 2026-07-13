/**
 * buildPreviewStyles.ts
 *
 * Shared utility that converts draft token overrides into CSS custom properties
 * for live component preview. Used by both the docs page and the advanced editor.
 *
 * Handles variant-aware, size-aware, and base token mappings so that
 * all preview surfaces produce identical results.
 */

import type { ComponentTokenManifest } from '../types/componentTokens';

/** Single draft override entry (matches ComponentTokenEditorContext shape) */
export interface DraftOverrideEntry {
  selectedToken: string;
}

/**
 * Build CSS custom property overrides from draft token overrides.
 *
 * Converts a Map of `tokenKey → { selectedToken }` entries into a flat
 * `Record<string, string>` suitable for spreading onto a React `style` prop.
 *
 * The logic is variant/size-aware:
 * - If the key contains a dot modifier (e.g. "backgroundColor.ghost"), it
 *   produces `--ComponentName-tokenName-modifier`.
 * - If the token definition declares variants, it fans out to every variant
 *   AND sets the base variable.
 * - If the token definition declares sizes, it fans out to every size
 *   AND sets the base variable.
 * - Otherwise it sets the base variable only.
 *
 * Two-pass approach: base fan-outs first, then explicit modifiers.
 * This ensures specific overrides always win regardless of Map insertion order.
 */
/**
 * Whether a `borderWidth` CSS value paints no visible stroke. Accepts both raw
 * literals (`0px`) and token refs (`var(--Stroke-None)`).
 */
function isInvisibleStrokeWidth(value: string): boolean {
  const v = value.trim();
  return v === '0px' || v === '0' || v === 'none' || v === 'var(--Stroke-None)';
}

export function buildComponentPreviewStyles(
  componentName: string,
  draftOverrides: ReadonlyMap<string, DraftOverrideEntry>,
  manifestTokens: ComponentTokenManifest['tokens'],
): Record<string, string> {
  const styleObj: Record<string, string> = {};

  // Collect entries split by type: base (fan-out) vs explicit modifier
  const baseEntries: Array<[string, DraftOverrideEntry]> = [];
  const modifierEntries: Array<[string, DraftOverrideEntry]> = [];

  for (const [key, override] of draftOverrides) {
    if (key.includes('.')) {
      modifierEntries.push([key, override]);
    } else {
      baseEntries.push([key, override]);
    }
  }

  // Pass 1: Process base entries (fan-out to all variants/sizes)
  for (const [key, override] of baseEntries) {
    const tokenName = key;
    const tokenDef = manifestTokens[tokenName];
    const hasVariants = tokenDef?.variants && Object.keys(tokenDef.variants).length > 0;
    const hasSizes = tokenDef?.sizes && Object.keys(tokenDef.sizes).length > 0;

    const cssValue = toCSSValue(override.selectedToken);

    if (hasVariants) {
      const variants = Object.keys(tokenDef.variants!);
      for (const variant of variants) {
        styleObj[`--${componentName}-${tokenName}-${variant}`] = cssValue;
      }
      styleObj[`--${componentName}-${tokenName}`] = cssValue;
    } else if (hasSizes) {
      const sizes = Object.keys(tokenDef.sizes!);
      for (const size of sizes) {
        styleObj[`--${componentName}-${tokenName}-${size}`] = cssValue;
      }
      styleObj[`--${componentName}-${tokenName}`] = cssValue;
    } else {
      styleObj[`--${componentName}-${tokenName}`] = cssValue;
    }

    // A base override must also govern STATE-specific variables (hover/pressed),
    // otherwise the saved brand CSS's per-state default (e.g.
    // `--Button-borderWidth-bold-hover: 0px`) wins over the base on those states
    // and the override appears to "not apply" on hover/pressed. Fan out to every
    // state (and variant-state) the token declares. Explicit per-state modifier
    // overrides still win — they're applied in Pass 2 after this.
    if (tokenDef?.states) {
      for (const [state, stateValues] of Object.entries(tokenDef.states)) {
        if (typeof stateValues === 'string') {
          styleObj[`--${componentName}-${tokenName}-${state}`] = cssValue;
        } else if (stateValues && typeof stateValues === 'object') {
          for (const variant of Object.keys(stateValues)) {
            styleObj[`--${componentName}-${tokenName}-${variant}-${state}`] = cssValue;
          }
        }
      }
    }
  }

  // Pass 2: Process modifier entries (specific overrides always win)
  for (const [key, override] of modifierEntries) {
    const parts = key.split('.');
    const tokenName = parts[0];
    const modifier = parts[1];
    const cssValue = toCSSValue(override.selectedToken);
    // Single stroke-width model: an invisible per-variant/state `borderWidth`
    // (e.g. a theme's `borderWidth.bold: 0px` "no bold border" default, or a
    // stale 0px from old handlers) must NOT shadow a VISIBLE base width — that
    // hides the variant's stroke even when it has a paint (the classic "bold rest
    // stroke won't show" bug). Skip it so the base fan-out governs. Visible
    // per-variant widths (a legit ghost-border opt-in) still win.
    if (tokenName === 'borderWidth' && isInvisibleStrokeWidth(cssValue)) {
      const base = styleObj[`--${componentName}-borderWidth`];
      if (base && !isInvisibleStrokeWidth(base)) continue;
    }
    styleObj[`--${componentName}-${tokenName}-${modifier}`] = cssValue;
  }

  addButtonImageStrokeSuppressors(componentName, styleObj);

  return styleObj;
}

function addButtonImageStrokeSuppressors(
  componentName: string,
  styleObj: Record<string, string>
): void {
  if (componentName !== 'Button') return;

  for (const [prop, value] of Object.entries(styleObj)) {
    if (!prop.startsWith('--Button-strokeImage')) continue;
    if (value === 'none' || value === 'transparent') continue;

    const suffix = prop.slice('--Button-strokeImage'.length);
    styleObj[`--Button-solidStrokeColor${suffix}`] = 'transparent';
    styleObj[`--Button-cssDecorationInsetStrokeWidth${suffix}`] = 'var(--Spacing-0)';
    styleObj[`--Button-cssDecorationUnderlineWidth${suffix}`] = 'var(--Spacing-0)';
    styleObj[`--Button-cssDecorationColor${suffix}`] = 'transparent';
  }
}

/**
 * Merge manifest defaults with draft/theme overrides for preview CSS.
 *
 * A base override for a size- or variant-aware token is an intentional fan-out:
 * `borderRadius -> Shape-None` should also affect `borderRadius.10` unless a
 * draft explicitly sets that modifier. This mirrors the saved brand CSS cascade.
 */
export function mergeComponentPreviewOverrides(
  manifestTokens: ComponentTokenManifest['tokens'],
  draftOverrides: ReadonlyMap<string, DraftOverrideEntry>,
): Map<string, DraftOverrideEntry> {
  const merged = expandManifestDefaults(filterNonColorTokens(manifestTokens));

  for (const [key] of draftOverrides) {
    if (key.includes('.')) continue;

    for (const modifierKey of getModifierKeysForBase(key, manifestTokens)) {
      merged.delete(modifierKey);
    }
  }

  for (const [key, override] of draftOverrides) {
    merged.set(key, override);
  }

  return merged;
}

/**
 * Expand a component token manifest into a Map of default overrides.
 *
 * This produces the "factory default" association between component CSS vars
 * and foundation tokens. The tool (Convex) is the source of truth — Convex
 * overrides win when merged on top of these defaults.
 *
 * Produces entries for:
 * - Base token: `tokenName` → `defaultToken`
 * - Variant-specific: `tokenName.variant` → variant default
 * - Size-specific: `tokenName.size` → size default
 * - State-specific: `tokenName.variant-state` → state default
 */
export function expandManifestDefaults(
  manifestTokens: ComponentTokenManifest['tokens'],
): Map<string, DraftOverrideEntry> {
  const defaults = new Map<string, DraftOverrideEntry>();

  for (const [tokenName, tokenDef] of Object.entries(manifestTokens)) {
    // Skip locked tokens (accessibility constraints, not configurable)
    if (tokenDef.locked) continue;

    // Base default
    defaults.set(tokenName, { selectedToken: tokenDef.defaultToken });

    // Variant-specific defaults
    if (tokenDef.variants) {
      for (const [variant, value] of Object.entries(tokenDef.variants)) {
        defaults.set(`${tokenName}.${variant}`, { selectedToken: value });
      }
    }

    // Size-specific defaults
    if (tokenDef.sizes) {
      for (const [size, value] of Object.entries(tokenDef.sizes)) {
        defaults.set(`${tokenName}.${size}`, { selectedToken: value });
      }
    }

    // State-specific defaults (e.g., hover/pressed per variant)
    if (tokenDef.states) {
      for (const [state, stateValues] of Object.entries(tokenDef.states)) {
        if (typeof stateValues === 'string') {
          defaults.set(`${tokenName}.${state}`, { selectedToken: stateValues });
        } else {
          for (const [variant, value] of Object.entries(stateValues)) {
            defaults.set(`${tokenName}.${variant}-${state}`, { selectedToken: value });
          }
        }
      }
    }
  }

  return defaults;
}

function getModifierKeysForBase(
  tokenName: string,
  manifestTokens: ComponentTokenManifest['tokens'],
): string[] {
  const tokenDef = manifestTokens[tokenName];
  if (!tokenDef) return [];

  const modifierKeys: string[] = [];

  if (tokenDef.sizes) {
    modifierKeys.push(...Object.keys(tokenDef.sizes).map((size) => `${tokenName}.${size}`));
  }

  if (tokenDef.variants) {
    modifierKeys.push(...Object.keys(tokenDef.variants).map((variant) => `${tokenName}.${variant}`));
  }

  if (tokenDef.states) {
    for (const [state, stateValues] of Object.entries(tokenDef.states)) {
      if (typeof stateValues === 'string') {
        modifierKeys.push(`${tokenName}.${state}`);
      } else {
        modifierKeys.push(...Object.keys(stateValues).map((variant) => `${tokenName}.${variant}-${state}`));
      }
    }
  }

  return modifierKeys;
}

/**
 * Filter out color-category tokens from a manifest.
 *
 * Color-category tokens (backgroundColor, textColor, iconColor) rely on CSS
 * intermediate variable architecture (e.g., --_btn-fg-bold) that remaps per
 * appearance role. Setting them globally would force ALL roles to use Primary,
 * breaking the multi-accent system. Both platform and Storybook must exclude
 * these from manifest defaults.
 */
export function filterNonColorTokens(
  tokens: ComponentTokenManifest['tokens'],
): ComponentTokenManifest['tokens'] {
  return Object.fromEntries(
    Object.entries(tokens).filter(([, def]) => def.category !== 'color')
  );
}

/**
 * Convert a token reference or CSS literal to a CSS value string.
 * Design tokens start with uppercase (e.g., "Shape-Pill") → var(--Shape-Pill).
 * CSS literals start with lowercase or digits (e.g., "uppercase", "0.05em") → as-is.
 */
function toCSSValue(selectedToken: string): string {
  const isTokenReference = /^[A-Z]/.test(selectedToken);
  return isTokenReference ? `var(--${selectedToken})` : selectedToken;
}
