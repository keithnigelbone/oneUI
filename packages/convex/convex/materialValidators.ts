import { v } from 'convex/values';

const metallicGradientTypeValidator = v.union(
  v.literal('linear'),
  v.literal('radial'),
  v.literal('conic'),
);

/** Single metallic preset (gradient stops + optional gradient direction). */
export const metallicPresetValidator = v.object({
  shadow: v.string(),
  baseDark: v.string(),
  base: v.string(),
  baseLight: v.string(),
  highlight: v.string(),
  gradientType: v.optional(metallicGradientTypeValidator),
  gradientAngle: v.optional(v.number()),
});

/** A single named variant of a metallic material (preset + stable id + display name). */
export const metallicVariantValidator = v.object({
  id: v.optional(v.string()),
  name: v.optional(v.string()),
  shadow: v.string(),
  baseDark: v.string(),
  base: v.string(),
  baseLight: v.string(),
  highlight: v.string(),
  gradientType: v.optional(metallicGradientTypeValidator),
  gradientAngle: v.optional(v.number()),
});

/** A metallic material type holding 1..3 named variants. */
export const metallicMaterialValidator = v.object({
  variants: v.array(metallicVariantValidator),
});

/**
 * Per-metal value: either the legacy single-preset shape (old documents) or the
 * new multi-variant `{ variants: [...] }` shape. The union lets stored configs
 * round-trip during the migration window; the engine normalizes both on read.
 */
const metallicMaterialEntryValidator = v.union(metallicPresetValidator, metallicMaterialValidator);

/** All metallic materials on a brand material config. */
export const metallicConfigValidator = v.object({
  gold: metallicMaterialEntryValidator,
  silver: metallicMaterialEntryValidator,
  bronze: metallicMaterialEntryValidator,
  custom: v.optional(metallicMaterialEntryValidator),
  platinum: metallicMaterialEntryValidator,
  roseGold: metallicMaterialEntryValidator,
});
