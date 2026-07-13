/**
 * Builds `NativeThemeSnapshot` JSON for Flutter from offline `BrandData`
 * (`{ foundation, components? }`) — same pipeline as Convex
 * `nativeTheme:getNativeThemeSnapshot` and RN `OneUIBrandProvider`.
 *
 * Usage (repo root):
 *   pnpm exec tsx scripts/generate-flutter-brand-snapshot.ts
 *   pnpm exec tsx scripts/generate-flutter-brand-snapshot.ts --brand-data path/to.json --out path/to/out.json
 *   pnpm exec tsx scripts/generate-flutter-brand-snapshot.ts --cdn-cache node_modules/.oneui-cached
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  applySubBrandAccentsToFoundation,
  buildStructuredDimensionContexts,
  mapNativePlatformToV2DimensionPlatform,
  maybeApplyRetailTiraCapsuleButtons,
  pickStructuredDimensionContext,
  type ComponentOverrideData,
  type PlatformsFoundationConfig,
  type SubBrandAccentFields,
} from '@oneui/shared';
import { buildAllComponentCustomPropertiesFlat } from '../packages/ui/src/utils/componentTokenMapCore';
import { foundationToNativeTheme } from '../packages/ui-native/src/theme/foundationToNativeTheme';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const NATIVE_THEME_SNAPSHOT_SCHEMA_VERSION = 2;

type BrandData = {
  foundation: unknown;
  components?: ComponentOverrideData;
};

type ThemeData =
  | { themeData: SubBrandAccentFields; colorScales?: unknown[] }
  | (SubBrandAccentFields & { colorScales?: unknown[] });

type SnapshotOptions = {
  theme: 'light' | 'dark';
  density: 'compact' | 'default' | 'open';
  platform: 'mobile' | 'tablet' | 'desktop';
  brandId?: string;
  brandSlug?: string;
  brandName?: string;
};

function parseArgs(argv: string[]): {
  brandDataPath: string;
  outPath: string | null;
  cdnCacheDir: string | null;
  theme: SnapshotOptions['theme'];
  density: SnapshotOptions['density'];
  platform: SnapshotOptions['platform'];
} {
  let brandDataPath = join(
    REPO_ROOT,
    'packages/ui-native/src/brand-data/defaultJioBrandData.json',
  );
  let outPath: string | null = null;
  let cdnCacheDir: string | null = null;
  let theme: SnapshotOptions['theme'] = 'light';
  let density: SnapshotOptions['density'] = 'default';
  let platform: SnapshotOptions['platform'] = 'mobile';

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--brand-data' && argv[i + 1]) {
      brandDataPath = resolve(argv[++i]);
    } else if (arg === '--out' && argv[i + 1]) {
      outPath = resolve(argv[++i]);
    } else if (arg === '--cdn-cache' && argv[i + 1]) {
      cdnCacheDir = resolve(argv[++i]);
    } else if (arg === '--theme' && argv[i + 1]) {
      theme = argv[++i] as SnapshotOptions['theme'];
    } else if (arg === '--density' && argv[i + 1]) {
      density = argv[++i] as SnapshotOptions['density'];
    } else if (arg === '--platform' && argv[i + 1]) {
      platform = argv[++i] as SnapshotOptions['platform'];
    }
  }

  return { brandDataPath, outPath, cdnCacheDir, theme, density, platform };
}

function normalizeThemeDelta(raw: ThemeData | null | undefined): (SubBrandAccentFields & { colorScales?: unknown[] }) | null {
  if (!raw) return null;
  const d = raw as Record<string, unknown>;
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
    return flat as SubBrandAccentFields & { colorScales?: unknown[] };
  }
  return null;
}

function injectColorScales(
  foundation: Record<string, unknown> | null | undefined,
  colorScales: unknown[] | undefined,
): Record<string, unknown> | null | undefined {
  if (!foundation || !colorScales?.length) return foundation;
  const color = foundation.color as Record<string, unknown> | undefined;
  const config = color?.config as Record<string, unknown> | undefined;
  if (!config) return foundation;
  const existing = (config.savedCustomScales as unknown[]) ?? [];
  return {
    ...foundation,
    color: {
      ...color,
      config: {
        ...config,
        savedCustomScales: [...existing, ...colorScales],
      },
    },
  };
}

export function buildFlutterNativeThemeSnapshot(
  brandData: BrandData,
  options: SnapshotOptions,
  themeDelta?: ThemeData | null,
): Record<string, unknown> | null {
  const validatedDelta = normalizeThemeDelta(themeDelta);
  let foundation = brandData.foundation as Record<string, unknown> | null | undefined;
  foundation = injectColorScales(foundation, validatedDelta?.colorScales);
  foundation = applySubBrandAccentsToFoundation(foundation, validatedDelta) as Record<string, unknown> | null;

  const built = foundationToNativeTheme(
    foundation,
    options.theme,
    undefined,
    options.density,
  );
  if (!built) return null;

  const componentData = brandData.components ?? {};
  // Collect CSS component names carrying a genuine new shape decision so the
  // Tira capsule coercion defers to them — same as web (buildAllComponentCSS)
  // and the Convex native snapshot (nativeTheme.ts).
  const explicitRadiusCssComponents = new Set<string>();
  let componentCustomProperties = buildAllComponentCustomPropertiesFlat(
    {
      componentThemeSelections: componentData.componentThemeSelections ?? [],
      recipeSelections: componentData.recipeSelections ?? [],
      tokenOverrides: componentData.tokenOverrides ?? [],
    },
    undefined,
    explicitRadiusCssComponents,
  );

  componentCustomProperties = maybeApplyRetailTiraCapsuleButtons(
    componentCustomProperties,
    options.brandSlug,
    options.brandName,
    explicitRadiusCssComponents,
  );

  const platformsEnvelope = foundation?.platforms as { config?: PlatformsFoundationConfig } | undefined;
  const platformsConfig = platformsEnvelope?.config;
  const v2Platform = mapNativePlatformToV2DimensionPlatform(options.platform);
  const activeDimensionKey = `${v2Platform}:${options.density}`;
  const dimensionContexts = platformsConfig
    ? buildStructuredDimensionContexts(platformsConfig)
    : [];
  const activeDimensionContext =
    pickStructuredDimensionContext(dimensionContexts, v2Platform, options.density) ?? null;

  return {
    schemaVersion: NATIVE_THEME_SNAPSHOT_SCHEMA_VERSION,
    brandId: options.brandId ?? 'default-jio',
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
    decorations: [],
  };
}

function snapshotFileName(
  brandSlug: string,
  theme: string,
  platform: string,
  density: string,
  variant?: string,
): string {
  const parts = [brandSlug, theme, platform, density];
  if (variant && variant !== 'base') parts.push(variant);
  return `${parts.join('_')}.json`;
}

function writeSnapshot(outFile: string, payload: Record<string, unknown>): void {
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, `${JSON.stringify(payload)}\n`, 'utf8');
  const kb = (Buffer.byteLength(JSON.stringify(payload)) / 1024).toFixed(1);
  console.log(`  ✓ ${basename(outFile)} (${kb} KB)`);
}

function generateDefaultBundles(options: Omit<SnapshotOptions, 'brandId'>): void {
  const brandDataPath = join(REPO_ROOT, 'packages/ui-native/src/brand-data/defaultJioBrandData.json');
  const brandData = JSON.parse(readFileSync(brandDataPath, 'utf8')) as BrandData;
  const outDir = join(REPO_ROOT, 'packages/ui_flutter/assets/brand_data');

  for (const theme of ['light', 'dark'] as const) {
    const payload = buildFlutterNativeThemeSnapshot(brandData, {
      ...options,
      theme,
      brandId: 'default-jio',
      brandSlug: 'jio',
      brandName: 'Jio',
    });
    if (!payload) {
      console.error('Failed to build default Jio snapshot');
      process.exit(1);
    }
    const outFile = join(
      outDir,
      snapshotFileName('default_jio', theme, options.platform, options.density),
    );
    writeSnapshot(outFile, payload);
  }
}

function generateFromCdnCache(cacheDir: string, options: Omit<SnapshotOptions, 'brandId' | 'brandSlug' | 'brandName'>): void {
  const brandDataRoot = join(cacheDir, 'brand-data');
  if (!existsSync(brandDataRoot)) {
    console.error(`No brand-data under ${cacheDir} — run: npx oneui-native-cdn prefetch`);
    process.exit(1);
  }

  const outDir = join(REPO_ROOT, 'packages/ui_flutter/assets/brand_data/cdn');
  const manifest: Array<{
    brand: string;
    variant: string;
    theme: string;
    platform: string;
    density: string;
    assetPath: string;
  }> = [];

  if (!existsSync(join(cacheDir, 'index.js'))) {
    console.warn(`Warning: ${join(cacheDir, 'index.js')} missing — run prefetch first`);
  }

  for (const entry of readdirSync(brandDataRoot)) {
    const brandPath = join(brandDataRoot, entry);
    if (!statSync(brandPath).isDirectory()) continue;
    const brandSlug = entry.toLowerCase();
    const latestPath = join(brandPath, 'latest.json');
    if (!existsSync(latestPath)) continue;

    const brandData = JSON.parse(readFileSync(latestPath, 'utf8')) as BrandData;
    for (const theme of ['light', 'dark'] as const) {
      const payload = buildFlutterNativeThemeSnapshot(brandData, {
        ...options,
        theme,
        brandId: brandSlug,
        brandSlug,
        brandName: entry,
      });
      if (!payload) {
        console.warn(`  ✗ skipped ${brandSlug} (${theme}) — no color foundation`);
        continue;
      }
      const relName = snapshotFileName(brandSlug, theme, options.platform, options.density);
      const outFile = join(outDir, relName);
      writeSnapshot(outFile, payload);
      manifest.push({
        brand: brandSlug,
        variant: 'base',
        theme,
        platform: options.platform,
        density: options.density,
        assetPath: `assets/brand_data/cdn/${relName}`,
      });
    }

    const subDir = join(brandPath, 'sub-brands');
    if (existsSync(subDir)) {
      for (const subEntry of readdirSync(subDir)) {
        const subPath = join(subDir, subEntry);
        if (!statSync(subPath).isDirectory()) continue;
        const subLatest = join(subPath, 'latest.json');
        if (!existsSync(subLatest)) continue;
        const themeDelta = JSON.parse(readFileSync(subLatest, 'utf8')) as ThemeData;
        const variantSlug = subEntry.toLowerCase();
        for (const theme of ['light', 'dark'] as const) {
          const payload = buildFlutterNativeThemeSnapshot(
            brandData,
            {
              ...options,
              theme,
              brandId: brandSlug,
              brandSlug,
              brandName: entry,
            },
            themeDelta,
          );
          if (!payload) continue;
          const relName = snapshotFileName(brandSlug, theme, options.platform, options.density, variantSlug);
          const outFile = join(outDir, relName);
          writeSnapshot(outFile, payload);
          manifest.push({
            brand: brandSlug,
            variant: variantSlug,
            theme,
            platform: options.platform,
            density: options.density,
            assetPath: `assets/brand_data/cdn/${relName}`,
          });
        }
      }
    }
  }

  const manifestPath = join(outDir, 'manifest.json');
  writeFileSync(manifestPath, `${JSON.stringify({ entries: manifest }, null, 2)}\n`, 'utf8');
  console.log(`Wrote CDN manifest (${manifest.length} entries) → ${manifestPath}`);
}

function main(): void {
  const args = parseArgs(process.argv);

  if (args.cdnCacheDir) {
    console.log('\n▶  Flutter brand snapshots from CDN cache\n');
    generateFromCdnCache(args.cdnCacheDir, {
      theme: args.theme,
      density: args.density,
      platform: args.platform,
    });
    return;
  }

  if (args.outPath) {
    const brandData = JSON.parse(readFileSync(args.brandDataPath, 'utf8')) as BrandData;
    const payload = buildFlutterNativeThemeSnapshot(brandData, {
      theme: args.theme,
      density: args.density,
      platform: args.platform,
      brandSlug: basename(args.brandDataPath, '.json'),
    });
    if (!payload) {
      console.error('Snapshot build failed');
      process.exit(1);
    }
    writeSnapshot(args.outPath, payload);
    return;
  }

  console.log('\n▶  Default Jio Flutter brand snapshots\n');
  generateDefaultBundles({
    theme: args.theme,
    density: args.density,
    platform: args.platform,
  });
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
