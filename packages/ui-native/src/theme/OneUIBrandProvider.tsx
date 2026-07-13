import React, { useMemo, type ReactNode } from 'react';
import {
  COMPONENT_THEME_FAMILIES,
  applySubBrandAccentsToFoundation,
  type SubBrandAccentFields,
  type DecorationConfig,
} from '@oneui/shared';
import { DecorationProvider } from './DecorationContext';
import type { TypographyScriptLineHeightMode } from '@oneui/shared';
import type { FontFamilyOverrides } from './foundationToNativeTheme';
import { OneUINativeThemeProvider } from './SurfaceContext';
import { foundationToNativeTheme } from './foundationToNativeTheme';
import type { RecipeSelections } from './RecipeContext';
import type { NativeComponentThemeSelections } from './ComponentThemeContext';
import { TypographyLanguageProvider } from './TypographyLanguageContext';
import {
  enabledScriptIdsFromTheme,
  resolveTypographyLanguage,
  type TypographyLocale,
} from './typography-locales';
import { DEFAULT_JIO_BRAND_DATA } from '../brand-data';
import { getCdnBrandData, getCdnThemeData } from './cdn/cachedManifest';
import { MaterialContextProvider } from './MaterialContext';

/**
 * Combined brand data payload passed to `OneUIBrandProvider`.
 * Wrap both Convex query results in a single object before passing.
 *
 * ```ts
 * const foundationData = useQuery(api.foundations.getBrandOverviewData, ...);
 * const componentData  = useQuery(api.componentTokenOverrides.getAllBrandComponentData, ...);
 *
 * const brandData = useMemo(
 *   () => foundationData !== undefined ? { foundation: foundationData, components: componentData } : undefined,
 *   [foundationData, componentData],
 * );
 * ```
 */
export interface BrandData {
  /** Raw return value of `api.foundations.getBrandOverviewData`. */
  foundation: unknown;
  /** Raw return value of `api.componentTokenOverrides.getAllBrandComponentData`. */
  components?: unknown;
  /**
   * Resolved SVG ornament decoration configs. Top-level key written by
   * `exportBrandData.ts` (extracted from `getBrandOverviewData` before trimming).
   * When omitted, OneUIBrandProvider falls back to `foundation.decorations` which
   * is present in the raw Convex response for live-query callers.
   */
  decorations?: DecorationConfig[];
}

/**
 * A single color scale entry stored in a sub-brand themeData file.
 *
 * Each entry describes a scale that is needed by the sub-brand but is NOT
 * present in the parent brand's presetSelection. The provider injects these
 * into the foundation before building the native theme so the engine can
 * resolve accent colors without the parent brand needing to carry all
 * possible sub-brand scales.
 *
 * - `steps` (preferred): full 25-step OkLCH array from Convex, giving exact
 *   designer-defined colors.
 * - `baseColor` (fallback): a single hex color; the engine generates all 25
 *   steps algorithmically. Colors will be close but may drift slightly.
 */
export interface ThemeColorScale {
  /** Scale name as referenced in the sub-brand's accent config (e.g. "red", "sky"). */
  name: string;
  /** The step this scale's base/brand color sits at (e.g. "1100"). */
  baseStep?: string;
  /** Pre-computed OkLCH step values from Convex (highest fidelity). */
  steps?: Array<{ step: string; oklch: string }>;
  /** Hex base color — used as fallback when `steps` is not available. */
  baseColor?: string;
}

/**
 * Sub-brand theme input accepted by `OneUIBrandProvider`.
 *
 * Two shapes are accepted — the provider normalises both internally:
 *
 * **File format** — the raw JSON produced by `exportBrandData.ts`. Pass the
 * JSON import directly; no transformation needed in the consuming app.
 * ```ts
 * import subBrandData from '../brand-data/jio/sub-brands/jiomart/latest.json';
 * <OneUIBrandProvider theme={subBrandData as ThemeData} ... />
 * ```
 *
 * **Flat format** — the `SubBrandConfig` record returned by Convex (already
 * has `primary / secondary / sparkle / brandBg` at the top level).
 * ```ts
 * <OneUIBrandProvider theme={activeSubBrand as ThemeData} ... />
 * ```
 *
 * Pass `null` or omit to render the base brand unchanged.
 */
export type ThemeData =
  /** File-wrapper format written by exportBrandData.ts */
  | { themeData: SubBrandAccentFields; colorScales?: ThemeColorScale[] }
  /** Flat / Convex format (accent fields at the root) */
  | (SubBrandAccentFields & { colorScales?: ThemeColorScale[] });

export interface OneUIBrandProviderProps {
  /**
   * Brand data.  Three forms accepted:
   * - **Object** `{ foundation, components }` — pre-resolved data (Convex or offline JSON).
   * - **String slug** `"jio"` — resolved synchronously from `node_modules/.oneui-cached`
   *   (run `npx oneui-native-cdn prefetch` to populate). Falls back to the bundled
   *   Jio default snapshot when the slug is not found in the cache.
   * - **Omitted / undefined** — uses the bundled Jio default snapshot.
   */
  brand?: BrandData | string | undefined;
  /**
   * Sub-brand theme delta — the 4 accent fields (primary, secondary, sparkle,
   * brandBg) that override the base brand's appearance config.
   *
   * Accepts:
   * - **Object** (offline JSON import or Convex `SubBrandConfig`)
   * - **String slug** `"jiomart"` — resolved from `node_modules/.oneui-cached`
   *   (requires `brand` to also be a string). Silently ignored when not cached.
   *
   * Omit or pass `null` to render the base brand without sub-brand overrides.
   */
  theme?: ThemeData | string | null;
  /** `'dim'` maps to `'dark'` internally. @default 'light' */
  mode?: 'light' | 'dark' | 'dim';
  /**
   * Spacing density. Defaults to `'default'`.
   * - `'compact'` — tighter spacing (shifts dimension f-steps down)
   * - `'default'` — standard spacing
   * - `'open'`    — looser spacing (shifts dimension f-steps up)
   */
  density?: 'compact' | 'default' | 'open';
  /**
   * Override the default JioType static weight → Expo family name mapping.
   *
   * The package ships `DEFAULT_JIO_TYPE_WEIGHT_FAMILIES` as the baseline so apps that
   * load JioType under the canonical names need not pass anything here. Only provide this
   * when your app registers fonts under different family names (e.g. a white-label build).
   */
  fontFamilyOverrides?: FontFamilyOverrides;
  /** Rendered while brand data is loading. */
  loadingFallback?: ReactNode;
  /**
   * App UI language (Layers `TokenProvider` `values.language` parity).
   * Drives default script typography for `Text` and `useTypographyTokens`.
   * @default 'en'
   */
  language?: TypographyLocale | string;
  /** Global script line-height mode; per-component `scriptMode` still wins. @default 'ui' */
  scriptMode?: Extract<TypographyScriptLineHeightMode, 'ui' | 'reading'>;
  children: ReactNode;
}

// Token names that may appear in Convex `tokenOverrides` and are surfaced to
// native components via `componentTheme.tokenRefs`.
const ALLOWED_TOKEN_NAMES = new Set([
  // ── Paint ──────────────────────────────────────────────────────────────
  'backgroundColor',
  'backgroundColor.bold',
  'backgroundColor.bold-pressed',
  'backgroundColor.bold-hover',
  'backgroundColor.subtle',
  'backgroundColor.subtle-pressed',
  'backgroundColor.ghost',
  'backgroundColor.ghost-pressed',
  'textColor',
  'textColor.bold',
  'textColor.subtle',
  'textColor.ghost',
  // ── Material stroke image (gradient or 'none') ─────────────────────────
  'strokeImage',
  'strokeImage.bold',
  'strokeImage.bold-hover',
  'strokeImage.bold-pressed',
  // ── Border ─────────────────────────────────────────────────────────────
  'borderColor',
  'borderColor.bold',
  'borderColor.bold-hover',
  'borderColor.bold-pressed',
  'borderWidth',
  'borderWidth.bold',
  'borderWidth.bold-hover',
  'borderWidth.bold-pressed',
  // ── Shape ──────────────────────────────────────────────────────────────
  'borderRadius',
  // ── Ornament sizing ─────────────────────────────────────────────────────
  // Float scalar: subtle=0.5, balanced=0.75, full=1.0. Button.native.tsx
  // multiplies ornamentMinHeight by this value before computing ornament width.
  'ornamentHeightScale',
  // ── Typography ─────────────────────────────────────────────────────────
  'fontWeight',
  'fontSize',
  'lineHeight',
  'textTransform',
  // letterSpacing accepts a typography dimension ref (e.g. "Display-L-FontSize")
  // which resolveComponentScalarTokens resolves to a px value. Falls back to
  // the uppercase-coupling derivation (fontSize × 0.05) when not set directly.
  'letterSpacing',
]);

// ─── injectColorScales ───────────────────────────────────────────────────────

function injectColorScales(
  foundation: Record<string, unknown> | null | undefined,
  colorScales: ThemeColorScale[] | undefined,
): Record<string, unknown> | null | undefined {
  if (!foundation || !colorScales?.length) return foundation;

  let result = { ...foundation };

  for (const scale of colorScales) {
    const scaleName = scale.name;
    if (!scaleName) continue;
    const nameLower = scaleName.toLowerCase();

    const colorEnv = result.color as { config?: { brandScales?: Array<Record<string, unknown>> } } | null | undefined;
    const config = (colorEnv?.config ?? {}) as Record<string, unknown>;
    const existingBrandScales = (config.brandScales as Array<Record<string, unknown>> | undefined) ?? [];

    if (existingBrandScales.some((s) => (s.name as string | undefined)?.toLowerCase() === nameLower)) {
      continue;
    }

    if (scale.steps?.length) {
      const newBrandScaleEntry: Record<string, unknown> = { name: scaleName, source: 'preset' };
      result = {
        ...result,
        color: {
          ...((result.color as Record<string, unknown>) ?? {}),
          config: {
            ...config,
            brandScales: [...existingBrandScales, newBrandScaleEntry],
          },
        },
      };

      const ps = result.presetSelection as { selectedScales?: Array<Record<string, unknown>> } | null | undefined;
      const existingSelected = ps?.selectedScales ?? [];
      if (!existingSelected.some((s) => (s.name as string | undefined)?.toLowerCase() === nameLower)) {
        result = {
          ...result,
          presetSelection: {
            ...((result.presetSelection as Record<string, unknown>) ?? {}),
            selectedScales: [
              ...existingSelected,
              {
                name: scaleName,
                steps: scale.steps,
                ...(scale.baseStep ? { baseStep: scale.baseStep } : {}),
              },
            ],
          },
        };
      }
    } else if (scale.baseColor) {
      result = {
        ...result,
        color: {
          ...((result.color as Record<string, unknown>) ?? {}),
          config: {
            ...config,
            brandScales: [
              ...existingBrandScales,
              {
                name: scaleName,
                source: 'custom',
                baseColor: scale.baseColor,
                ...(scale.baseStep ? { baseStep: scale.baseStep } : {}),
              },
            ],
          },
        },
      };
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Drop-in provider for apps that source brand data from Convex, offline JSON,
 * or a prefetched CDN cache.
 *
 * **Object props (Convex / offline)**
 * ```tsx
 * <OneUIBrandProvider
 *   brand={{ foundation: foundationData, components: componentData }}
 *   mode="light"
 * >
 *   {children}
 * </OneUIBrandProvider>
 * ```
 *
 * **String slug shorthand (requires `oneui-native-cdn prefetch`)**
 * ```tsx
 * <OneUIBrandProvider brand="jio" theme="jiomart" mode="light">
 *   {children}
 * </OneUIBrandProvider>
 * ```
 *
 * When `brand` is a string the provider looks it up synchronously in
 * `node_modules/.oneui-cached` (populated by `npx oneui-native-cdn prefetch`).
 * If the slug is not found in the cache, the bundled Jio default snapshot is
 * used instead — no network request is made.
 */
export function OneUIBrandProvider({
  brand,
  theme,
  mode = 'light',
  density,
  fontFamilyOverrides,
  loadingFallback = null,
  language = 'en',
  scriptMode = 'ui',
  children,
}: OneUIBrandProviderProps): React.ReactElement {
  const effectiveTheme = mode === 'dim' ? 'dark' : mode;

  // Resolve brand: string slug → .oneui-cached → fallback to DEFAULT_JIO_BRAND_DATA
  const resolvedBrandData: BrandData = useMemo(() => {
    if (typeof brand === 'string') {
      return getCdnBrandData(brand) ?? DEFAULT_JIO_BRAND_DATA;
    }
    return brand ?? DEFAULT_JIO_BRAND_DATA;
  }, [brand]);

  // Resolve theme: string slug → .oneui-cached (requires brand to also be a string)
  const resolvedThemeDelta: ThemeData | null = useMemo(() => {
    if (typeof theme === 'string') {
      if (typeof brand !== 'string') return null;
      return (getCdnThemeData(brand, theme) as ThemeData | undefined) ?? null;
    }
    return theme ?? null;
  }, [brand, theme]);

  const componentData = resolvedBrandData.components;

  // Normalise and validate the theme delta.
  //
  // Accepts two input shapes:
  //   • File-wrapper (JSON export): { themeData: { primary, ... }, colorScales?: [...] }
  //   • Flat (Convex SubBrandConfig): { primary, secondary, sparkle, brandBg, colorScales? }
  //
  // After normalisation the result is always the flat SubBrandAccentFields shape
  // (+ optional colorScales). Returns null when the input is missing or invalid.
  const validatedDelta = useMemo<(SubBrandAccentFields & { colorScales?: ThemeColorScale[] }) | null>(() => {
    const d = resolvedThemeDelta as Record<string, unknown> | null | undefined;
    if (!d) return null;

    let flat: Record<string, unknown> = d;
    if (d.themeData && typeof d.themeData === 'object' && !d.primary) {
      flat = {
        ...(d.themeData as Record<string, unknown>),
        ...(Array.isArray(d.colorScales) && d.colorScales.length ? { colorScales: d.colorScales } : {}),
      };
    }

    const p = flat.primary as { scaleName?: string } | undefined;
    const s = flat.secondary as { scaleName?: string } | undefined;
    const sp = flat.sparkle as { scaleName?: string } | undefined;
    const bg = flat.brandBg as { scaleName?: string; backgroundStep?: unknown } | undefined;

    if (p?.scaleName && s?.scaleName && sp?.scaleName && bg?.scaleName && bg?.backgroundStep) {
      return flat as SubBrandAccentFields & { colorScales?: ThemeColorScale[] };
    }

    if (__DEV__) {
      console.warn(
        '[OneUIBrandProvider] `theme` prop could not be normalised to a valid sub-brand delta. ' +
        'Pass either a sub-brand JSON file import or a SubBrandAccentFields object ' +
        '(primary / secondary / sparkle / brandBg).',
        d,
      );
    }
    return null;
  }, [resolvedThemeDelta]);

  const foundationData = useMemo(() => {
    const base = resolvedBrandData.foundation as Record<string, unknown> | null | undefined;
    const withScales = injectColorScales(base, validatedDelta?.colorScales);
    return applySubBrandAccentsToFoundation(withScales, validatedDelta);
  }, [resolvedBrandData.foundation, validatedDelta]);

  const nativeTheme = useMemo(
    () => foundationToNativeTheme(foundationData, effectiveTheme, fontFamilyOverrides, density),
    [foundationData, effectiveTheme, fontFamilyOverrides, density],
  );

  const recipeOverrides = useMemo<RecipeSelections>(() => {
    const data = componentData as { recipeSelections?: Array<{ componentName?: string; selections?: Record<string, string> }> } | null | undefined;
    if (!data?.recipeSelections) return {};
    const out: RecipeSelections = {};
    for (const item of data.recipeSelections) {
      if (item.componentName && item.selections) {
        out[item.componentName.toLowerCase()] = item.selections;
      }
    }
    return out;
  }, [componentData]);

  const componentThemeOverrides = useMemo<NativeComponentThemeSelections>(() => {
    const data = componentData as {
      componentThemeSelections?: Array<{ familyId: string; selections: Record<string, string> }>;
      tokenOverrides?: Array<{ componentName?: string; tokenName: string; value: string }>;
    } | null | undefined;
    const out: NativeComponentThemeSelections = {};

    for (const item of (data?.componentThemeSelections ?? [])) {
      const { familyId, selections } = item;
      if (!selections) continue;
      const family = COMPONENT_THEME_FAMILIES.find((f) => f.id === familyId);
      if (!family) continue;
      for (const target of family.targets) {
        const slug = target.componentName.toLowerCase();
        if (!out[slug]) out[slug] = {};
        if (target.resolutionMap.shapeLanguage && selections.shapeLanguage) {
          out[slug].shapeLanguage = selections.shapeLanguage;
        }
        if (target.resolutionMap.emphasisStyle && selections.emphasisStyle) {
          out[slug].emphasisStyle = selections.emphasisStyle;
        }
        // Per-level attention styles/roles — carried by the attention-capable
        // action targets (those with the legacy emphasisStyle map).
        if (target.resolutionMap.emphasisStyle) {
          for (const key of [
            'highAttentionStyle',
            'mediumAttentionStyle',
            'lowAttentionStyle',
            'highAttentionRole',
            'mediumAttentionRole',
            'lowAttentionRole',
          ] as const) {
            if (selections[key]) out[slug][key] = selections[key];
          }
        }
      }
    }

    for (const override of (data?.tokenOverrides ?? [])) {
      if (!override.componentName || !ALLOWED_TOKEN_NAMES.has(override.tokenName)) continue;
      const slug = override.componentName.toLowerCase();
      if (!out[slug]) out[slug] = {};
      if (!out[slug].tokenRefs) out[slug].tokenRefs = {};
      out[slug].tokenRefs![override.tokenName] = override.value;
    }

    return out;
  }, [componentData]);

  const languageValue = useMemo(
    () =>
      resolveTypographyLanguage(language, {
        scriptMode,
        enabledScriptIds: enabledScriptIdsFromTheme(nativeTheme?.typography.scriptVariants),
      }),
    [language, scriptMode, nativeTheme],
  );

  // Parse decoration configs into a lookup Map consumed by useComponentDecoration().
  // Dual-source: top-level BrandData.decorations (offline JSON path, written by
  // exportBrandData.ts) OR foundation.decorations (Convex live-query path where
  // getBrandOverviewData embeds decorations before trimFoundation strips them).
  const decorationsMap = useMemo<Map<string, DecorationConfig>>(() => {
    const fromTop = resolvedBrandData.decorations;
    const fromFoundation = (
      resolvedBrandData.foundation as Record<string, unknown> | null | undefined
    )?.decorations as DecorationConfig[] | undefined;
    const src = fromTop ?? fromFoundation ?? [];
    const map = new Map<string, DecorationConfig>();
    for (const d of src) {
      if (d?.componentName) map.set(d.componentName, d);
    }
    return map;
  }, [resolvedBrandData]);

  if (!nativeTheme) return <>{loadingFallback}</>;

  return (
    <MaterialContextProvider value={nativeTheme.materials ?? null}>
      <OneUINativeThemeProvider
        theme={nativeTheme}
        recipeOverrides={recipeOverrides}
        componentThemeOverrides={componentThemeOverrides}
      >
        <TypographyLanguageProvider value={languageValue}>
          <DecorationProvider decorations={decorationsMap}>
            {children}
          </DecorationProvider>
        </TypographyLanguageProvider>
      </OneUINativeThemeProvider>
    </MaterialContextProvider>
  );
}
