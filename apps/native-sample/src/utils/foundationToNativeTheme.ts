import {
  buildNativeTheme,
  type OneUINativeTheme,
  type NativeAppearanceConfig,
  type NativeTypographyConfig,
  type NativeCustomFontDescriptor,
} from '@oneui/ui-native';
import type {
  NativeMotionConfigInput,
  NativeElevationConfigInput,
} from '@oneui/shared/engine';

type Theme = 'light' | 'dark';

/**
 * Adapts the Convex `getBrandOverviewData` payload to `BuildNativeThemeInput`.
 *
 * Shape mapping:
 * - `color` is wrapped in a `foundations` envelope: `{ type: 'color', config, version, ... }` →
 *   `colorConfig` is `fd.color.config`.
 * - `appearanceConfig` is the raw document from `appearanceConfigs` (no `.config`
 *   wrapper) — `accentCount`, `background`, `accents` live at the top level.
 * - `typography` is also a foundations envelope: `{ type: 'typography', config, ... }` —
 *   the V2 config (fontSelection, fStep overrides, weights, line-height offsets)
 *   sits at `fd.typography.config`.
 * - `customFonts` is a flat array shaped like `NativeCustomFontDescriptor`.
 * - `motionConfig` / `elevationConfig` are slim rows from `motionConfigs` /
 *   `elevationConfigs` (see `packages/convex/convex/foundations.ts` overview query).
 */
// fallow-ignore-next-line complexity
export function foundationToNativeTheme(
  foundationData: unknown,
  theme: Theme,
): OneUINativeTheme | null {
  if (!foundationData || typeof foundationData !== 'object') return null;
  const fd = foundationData as {
    color?: { config?: unknown } | null;
    appearanceConfig?: unknown;
    presetSelection?: unknown;
    typography?: { config?: unknown } | null;
    customFonts?: NativeCustomFontDescriptor[];
    motionConfig?: NativeMotionConfigInput | null;
    elevationConfig?: NativeElevationConfigInput | null;
  };
  const colorConfig = fd.color?.config;
  if (!colorConfig) return null;
  return buildNativeTheme(
    {
      colorConfig,
      appearanceConfig: (fd.appearanceConfig ?? null) as NativeAppearanceConfig | null,
      presetSelection: fd.presetSelection,
      typographyConfig: (fd.typography?.config ?? null) as NativeTypographyConfig | null,
      customFonts: fd.customFonts ?? [],
      motionConfig: fd.motionConfig ?? undefined,
      elevationConfig: fd.elevationConfig ?? undefined,
    },
    { theme },
  );
}
