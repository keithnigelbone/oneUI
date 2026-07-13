/**
 * tokenManifest.ts
 *
 * Canonical token schema — single source of truth for which CSS custom properties
 * brand CSS is allowed to inject. The allowlist in tokenBoundary.ts is derived
 * from this manifest rather than being a static list.
 *
 * When new token families are added to the design system, update this manifest
 * and the allowlist auto-updates everywhere (runtime filtering, CI validation, docs).
 *
 * Framework-agnostic — usable from server-side, CLI, or browser.
 */

// ============================================================================
// Token Family Definitions
// ============================================================================

export interface TokenFamily {
  /** CSS custom property prefix (e.g., '--Surface-') */
  prefix: string;
  /** Human-readable category name */
  category: 'surface' | 'text' | 'appearance-role' | 'typography' | 'border' | 'motion' | 'grid' | 'logo' | 'focus' | 'material' | 'elevation' | 'gradient';
  /** Description for documentation */
  description: string;
  /** Whether this family is generated per appearance role */
  perRole?: boolean;
}

/**
 * All token families that brand CSS is allowed to inject.
 * This is the single source of truth — tokenBoundary.ts derives its allowlist from here.
 */
export const TOKEN_FAMILIES: readonly TokenFamily[] = [
  // Surface tokens (legacy backward-compat aliases + transparent-material tokens —
  // both match `--Surface-*`, so one allowlist prefix covers both)
  { prefix: '--Surface-', category: 'surface', description: 'Surface emphasis aliases + transparent-material tokens' },

  // Text tokens (legacy backward-compat aliases)
  { prefix: '--Text-', category: 'text', description: 'Text emphasis levels (backward compat aliases)' },

  // V4 appearance role tokens — one family per role
  { prefix: '--Primary-', category: 'appearance-role', perRole: true, description: 'Primary accent role surfaces and on-colours' },
  { prefix: '--Secondary-', category: 'appearance-role', perRole: true, description: 'Secondary accent role surfaces and on-colours' },
  { prefix: '--Neutral-', category: 'appearance-role', perRole: true, description: 'Neutral role surfaces and on-colours' },
  { prefix: '--Sparkle-', category: 'appearance-role', perRole: true, description: 'Sparkle/highlight role surfaces and on-colours' },
  { prefix: '--Brand-Bg-', category: 'appearance-role', perRole: true, description: 'Brand background role surfaces' },
  { prefix: '--Positive-', category: 'appearance-role', perRole: true, description: 'Positive/success semantic role' },
  { prefix: '--Negative-', category: 'appearance-role', perRole: true, description: 'Negative/error semantic role' },
  { prefix: '--Warning-', category: 'appearance-role', perRole: true, description: 'Warning semantic role' },
  { prefix: '--Informative-', category: 'appearance-role', perRole: true, description: 'Informative semantic role' },

  // Typography tokens (legacy)
  { prefix: '--Typography-Font-', category: 'typography', description: 'Font family declarations' },
  { prefix: '--Typography-Weight-', category: 'typography', description: 'Font weight declarations (legacy)' },
  { prefix: '--Typography-Size-', category: 'typography', description: 'Font size declarations (legacy backward compat)' },
  { prefix: '--Typography-Features-', category: 'typography', description: 'Per-font-slot OpenType feature settings (ligatures, contextual alternates)' },

  // V2 typography role tokens (cover font size, line height, weight, font family)
  { prefix: '--Display-', category: 'typography', description: 'Display role font size, line height, weight, font family' },
  { prefix: '--Headline-', category: 'typography', description: 'Headline role font size, line height, weight, font family' },
  { prefix: '--Title-', category: 'typography', description: 'Title role font size, line height, weight, font family' },
  { prefix: '--Body-', category: 'typography', description: 'Body role font size, line height, weight, font family' },
  { prefix: '--Label-', category: 'typography', description: 'Label role font size, line height, weight, font family' },
  { prefix: '--Code-', category: 'typography', description: 'Code role font size, line height, weight' },

  // Border tokens
  { prefix: '--Border-', category: 'border', description: 'Border color declarations' },

  // Focus outline (derived from informative scale per surface context)
  { prefix: '--Focus-', category: 'focus', description: 'Focus ring colour and width — colour derived from informative scale per surface context' },

  // Component ornament tokens (injected per-component by decoration system)
  { prefix: '--Button-ornament-', category: 'border', description: 'Button ornament decoration CSS properties' },

  // Environment tokens (Phase 3: surface-agnostic component consumption)
  { prefix: '--env-', category: 'surface', description: 'Environment tokens set by <Surface>, consumed by components' },

  // Grid tokens (per-brand column count + max-width overrides)
  { prefix: '--Grid-', category: 'grid', description: 'Grid layout tokens: columns, margin, gutter, max-width' },

  // Motion tokens (brand-customisable durations, offsets, and easing curves)
  { prefix: '--Motion-Duration-', category: 'motion', description: 'Duration tokens (Moderate and Subtle t-shirt sizes)' },
  { prefix: '--Motion-Offset-', category: 'motion', description: 'Stagger/offset delay tokens (Moderate and Subtle)' },
  { prefix: '--Motion-Easing-', category: 'motion', description: 'Easing curve tokens (Entrance, Exit, Transition, Bounce, Linear)' },

  // Logo tokens (brand-customisable logo color override)
  { prefix: '--Logo-', category: 'logo', description: 'Brand logo color override (resolved from appearanceConfig.logo scale + baseStep)' },

  // Material tokens (brand-configurable material effects such as metals)
  { prefix: '--Material-', category: 'material', description: 'Material effects: metallic fills, strokes, stops, and readable content tokens' },

  // Elevation tokens (brand-configurable shadow opacity + dark-mode multiplier)
  { prefix: '--Elevation-', category: 'elevation', description: 'Two-shadow elevation levels 0-5 derived from baseOpacity and darkModeMultiplier' },

  // Gradient tokens (per-brand gradient fills + on-colors, flat brand-level values)
  { prefix: '--Gradient-', category: 'gradient', description: 'Brand gradient fills (--Gradient-{n}) and their on-colors (--Gradient-{n}-On)' },
] as const;

// ============================================================================
// Derived utilities
// ============================================================================

/**
 * Get all allowed prefixes from the manifest.
 * Used by tokenBoundary.ts to build its runtime filter.
 */
export function getAllowedPrefixes(): string[] {
  return TOKEN_FAMILIES.map(f => f.prefix);
}

/**
 * Get token families by category.
 */
export function getFamiliesByCategory(category: TokenFamily['category']): TokenFamily[] {
  return TOKEN_FAMILIES.filter(f => f.category === category);
}

/**
 * Get all appearance role prefixes (for V4 multi-role validation).
 */
export function getAppearanceRolePrefixes(): string[] {
  return TOKEN_FAMILIES.filter(f => f.perRole).map(f => f.prefix);
}
