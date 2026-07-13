/**
 * Native theme snapshot — full `buildNativeTheme` / `OneUINativeTheme` as JSON
 * for Android, iOS, Flutter, and other non-TS clients.
 *
 * `getBrandOverviewData` returns raw foundations only. This query runs the
 * same engine as React Native `foundationToNativeTheme` → `buildNativeTheme`.
 *
 * Schema v2 adds `designSystem`: component custom properties (same merge as
 * web `buildAllComponentCSS`) + structured dimension contexts for native layouts.
 */

import { query } from './_generated/server';
import { v } from 'convex/values';
import { buildNativeTheme } from '@oneui/shared/engine';
import {
  buildStructuredDimensionContexts,
  generateOrnamentCSSProperties,
  mapNativePlatformToV2DimensionPlatform,
  maybeApplyRetailTiraCapsuleButtons,
  pickStructuredDimensionContext,
  type ComponentOverrideData,
  type PlatformsFoundationConfig,
} from '@oneui/shared';
// Bundled via relative path — Convex/esbuild does not resolve `@oneui/ui/*`
// workspace subpaths the same as local packages during query bundling.
import { buildAllComponentCustomPropertiesFlat } from '../../ui/src/utils/componentTokenMapCore';
import { loadBrandOverviewPayload } from './foundations';
import { canReadBrand } from './lib/auth';

/** Bump when adding/removing/renaming snapshot fields or changing meaning. */
// v3: activeDimensionKey format changed from `<5-platform-id>:<density>`
// (e.g. the old tablet key) to `<S|M|L>:<density>` (e.g. `M:default`) when the
// runtime collapsed to 3 S/M/L breakpoints. Bumping invalidates stale snapshots.
const NATIVE_THEME_SNAPSHOT_SCHEMA_VERSION = 3;

const densityArg = v.union(v.literal('compact'), v.literal('default'), v.literal('open'));

const platformArg = v.union(v.literal('mobile'), v.literal('tablet'), v.literal('desktop'));

export const getNativeThemeSnapshot = query({
  args: {
    brandId: v.id('brands'),
    theme: v.union(v.literal('light'), v.literal('dark')),
    /** Matches `NativeThemeContext.density`; defaults to `default` if omitted. */
    density: v.optional(densityArg),
    /** Matches `NativeThemeContext.platform`; defaults to `mobile` if omitted. */
    platform: v.optional(platformArg),
  },
  handler: async (ctx, args) => {
    // Read-scoped: authenticated non-members get null (anonymous tooling passes).
    if (!(await canReadBrand(ctx, args.brandId))) return null;
    const fd = await loadBrandOverviewPayload(ctx, args.brandId);
    const colorConfig = fd.color?.config ?? null;
    if (!colorConfig) {
      return null;
    }

    const density = args.density ?? 'default';
    const platform = args.platform ?? 'mobile';

    const built = buildNativeTheme(
      {
        colorConfig,
        presetSelection: fd.presetSelection ?? null,
        appearanceConfig: (fd.appearanceConfig ?? null) as any,
        typographyConfig: ((fd.typography as { config?: unknown } | null)?.config ?? null) as any,
        customFonts: (fd.customFonts ?? []) as any,
      },
      { theme: args.theme, density, platform }
    );

    if (!built) {
      return null;
    }

    const v2Platform = mapNativePlatformToV2DimensionPlatform(platform);
    const activeDimensionKey = `${v2Platform}:${density}`;

    /** Surfaces + typography must always round-trip even if component-token assembly fails. */
    const coreSnapshot = (): Record<string, unknown> => ({
      schemaVersion: NATIVE_THEME_SNAPSHOT_SCHEMA_VERSION,
      brandId: args.brandId,
      meta: built.meta,
      themeConfig: built.themeConfig,
      rootParentStep: built.rootParentStep,
      darkMode: built.darkMode,
      rootRoles: built.rootRoles,
      typography: built.typography,
      brandHash: built.meta.brandHash,
      configuredRoles: built.meta.configuredRoles,
      designSystem: {
        componentCustomProperties: {},
        dimensionContexts: [],
        activeDimensionContext: null,
        activeDimensionKey,
      },
      decorations: [],
    });

    try {
      const [componentThemeSelections, recipeSelections, tokenOverrideRows] = await Promise.all([
        ctx.db
          .query('componentThemeSelections')
          .withIndex('by_brand_family', (q) => q.eq('brandId', args.brandId))
          .collect(),
        ctx.db
          .query('componentRecipeSelections')
          .withIndex('by_brand_component', (q) => q.eq('brandId', args.brandId))
          .collect(),
        ctx.db
          .query('tokenOverrides')
          .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
          .collect(),
      ]);

      const componentOverridePayload: ComponentOverrideData = {
        componentThemeSelections,
        recipeSelections,
        tokenOverrides: tokenOverrideRows.filter((o) => o.componentName != null),
      };

      const explicitRadiusCssComponents = new Set<string>();
      let componentCustomProperties = buildAllComponentCustomPropertiesFlat(
        componentOverridePayload,
        undefined,
        explicitRadiusCssComponents
      );

      // Ornament layout vars (web injects via DecorationContext + brand CSS).
      const decorationsRaw =
        (fd as { decorations?: Array<Record<string, unknown>> }).decorations ?? [];
      for (const deco of decorationsRaw) {
        if (deco.componentName !== 'Button') continue;
        const svgContent = deco.svgContent as string | undefined;
        const aspectRatio = (deco.aspectRatio as number | undefined) ?? 1;
        if (!svgContent) continue;
        const props = generateOrnamentCSSProperties(
          'Button',
          svgContent,
          aspectRatio,
          Boolean(deco.mirror),
          (deco.placement as 'edges' | 'left' | 'right' | undefined) ?? 'edges'
        );
        Object.assign(componentCustomProperties, props);
      }

      const brandDoc = await ctx.db.get(args.brandId);
      componentCustomProperties = maybeApplyRetailTiraCapsuleButtons(
        componentCustomProperties,
        brandDoc?.slug,
        brandDoc?.name,
        explicitRadiusCssComponents
      );

      const platformsConfig = fd.platforms?.config as PlatformsFoundationConfig | undefined;
      const dimensionContexts = platformsConfig
        ? buildStructuredDimensionContexts(platformsConfig)
        : [];

      const activeDimensionContext =
        pickStructuredDimensionContext(dimensionContexts, v2Platform, density) ?? null;

      const payload = {
        schemaVersion: NATIVE_THEME_SNAPSHOT_SCHEMA_VERSION,
        brandId: args.brandId,
        meta: built.meta,
        themeConfig: built.themeConfig,
        rootParentStep: built.rootParentStep,
        darkMode: built.darkMode,
        rootRoles: built.rootRoles,
        typography: built.typography,
        brandHash: built.meta.brandHash,
        configuredRoles: built.meta.configuredRoles,
        designSystem: {
          componentCustomProperties,
          dimensionContexts,
          activeDimensionContext,
          activeDimensionKey,
        },
        decorations: decorationsRaw.filter((d) => d.componentName === 'Button'),
      };

      return JSON.parse(JSON.stringify(payload)) as Record<string, unknown>;
    } catch (err) {
      console.error(
        '[getNativeThemeSnapshot] designSystem path failed — returning core colors/typography only',
        err
      );
      return JSON.parse(JSON.stringify(coreSnapshot())) as Record<string, unknown>;
    }
  },
});
