/**
 * tokenExtract.ts
 *
 * Resolve a brand's foundation data into a structured JSON token payload
 * for export. Mirrors what `useBrandCSS` injects at runtime, but emits a
 * data structure instead of a CSS string.
 *
 * Output groups tokens by foundation (color / surface / typography / motion
 * / grid) and by theme (light / dark), so a per-foundation export is just a
 * slice of the same payload.
 *
 * Surface context (`[data-surface=…]`) blocks are intentionally NOT included.
 * They are a CSS-runtime mechanism (cascade-based remapping) and do not have
 * a portable representation in flat token formats. Consumers that need
 * surface-aware values should generate them per-context from the same input.
 */
import { precomputeBrandCSSNew, type PrecomputeInput } from './precompute';
import { generateMotionCSS } from './motionCSS';
import { generateGridCSS } from './gridCSS';
import { mergeMaterialConfigWithFoundationConfig } from './materialCSS';
import { parseCSSDeclarationsToVars } from './cssParser';
import { TOKEN_FAMILIES, type TokenFamily } from './tokenManifest';
import { DENSITY_IDS, GRID_VALUES, BREAKPOINT_IDS } from '../data/dimension-scales';
import { generateDimensionCSS } from '../utils/dimensionCSS';
import { migrateLegacyPlatformsConfig } from '../utils/platform-config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FoundationBucket = 'color' | 'surface' | 'typography' | 'motion' | 'elevation' | 'grid' | 'material' | 'gradient' | 'other';

export interface BrandTokenExport {
  $schema: 'oneui-tokens/v1';
  brand: { id?: string; name?: string };
  generatedAt: string;
  /** Note about omitted data so consumers know what they're not getting. */
  notes: string[];
  themes: {
    light: Record<FoundationBucket, Record<string, string>>;
    dark: Record<FoundationBucket, Record<string, string>>;
  };
}

/**
 * Minimal shape of foundation data consumed by the extractor. Matches the
 * fields that `useBrandCSS` reads from `getBrandOverviewData` output.
 */
export interface FoundationDataLike {
  color?: { config?: unknown } | null;
  presetSelection?: unknown;
  appearanceConfig?: unknown;
  typography?: { config?: unknown } | null;
  customFonts?: unknown[];
  motion?: { config?: unknown } | null;
  elevation?: { config?: unknown } | null;
  grid?: { config?: unknown } | null;
  platforms?: { config?: unknown } | null;
  materials?: { config?: unknown } | null;
  materialConfig?: unknown;
}

// ---------------------------------------------------------------------------
// Foundation bucketing
// ---------------------------------------------------------------------------

/**
 * Map TokenFamily category → foundation bucket. Lookup table is co-located so
 * adding a new family requires touching only this map and the manifest.
 */
const CATEGORY_TO_BUCKET: Record<TokenFamily['category'], FoundationBucket> = {
  surface: 'surface',
  'appearance-role': 'color',
  text: 'color',
  border: 'color',
  focus: 'color',
  logo: 'color',
  typography: 'typography',
  motion: 'motion',
  elevation: 'elevation',
  grid: 'grid',
  material: 'material',
  gradient: 'gradient',
};

function categoryToBucket(category: TokenFamily['category']): FoundationBucket {
  return CATEGORY_TO_BUCKET[category] ?? 'other';
}

/** Find the longest prefix in TOKEN_FAMILIES that matches `name` (e.g. `--Primary-Bold`). */
function bucketForToken(name: string): FoundationBucket {
  const tokenName = tokenNameFromExportKey(name);
  if (tokenName === '--Spacing-Margin' || tokenName === '--Spacing-Gutter') return 'grid';

  let bestPrefix = '';
  let bestBucket: FoundationBucket = 'other';
  for (const family of TOKEN_FAMILIES) {
    if (tokenName.startsWith(family.prefix) && family.prefix.length > bestPrefix.length) {
      bestPrefix = family.prefix;
      bestBucket = categoryToBucket(family.category);
    }
  }
  return bestBucket;
}

function tokenNameFromExportKey(name: string): string {
  return name.match(/--[A-Za-z0-9-]+/)?.[0] ?? name;
}

function emptyBucketSet(): Record<FoundationBucket, Record<string, string>> {
  return { color: {}, surface: {}, typography: {}, motion: {}, elevation: {}, grid: {}, material: {}, gradient: {}, other: {} };
}

function extractScopedDeclarations(css: string): Record<string, string> {
  const vars: Record<string, string> = {};
  if (!css) return vars;

  let selector = '';
  for (const line of css.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue;
    if (trimmed.endsWith('{')) {
      selector = trimmed.slice(0, -1).trim();
      continue;
    }
    if (trimmed === '}') {
      selector = '';
      continue;
    }
    if (!trimmed.startsWith('--')) continue;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;
    const prop = trimmed.slice(0, colonIdx).trim();
    const val = trimmed.slice(colonIdx + 1).replace(/;$/, '').trim();
    vars[selector && selector !== ':root' ? `${selector} ${prop}` : prop] = val;
  }

  return vars;
}

function generateStaticGridSpacingCSS(): string {
  const blocks: string[] = [];
  for (const bp of BREAKPOINT_IDS) {
    for (const densityId of DENSITY_IDS) {
      const grid = GRID_VALUES[bp][densityId];
      blocks.push(
        `[data-Breakpoint="${bp}"][data-6-Density="${densityId}"] {\n` +
        `  --Grid-Margin: ${grid.margin}px;\n` +
        `  --Grid-Gutter: ${grid.gutter}px;\n` +
        `}`,
      );
    }
  }
  return blocks.join('\n');
}

function bucketize(
  declarations: Record<string, string>,
): Record<FoundationBucket, Record<string, string>> {
  const out = emptyBucketSet();
  for (const [name, value] of Object.entries(declarations)) {
    const bucket = bucketForToken(name);
    out[bucket][name] = value;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

function buildPrecomputeInput(data: FoundationDataLike): PrecomputeInput {
  return {
    colorConfig: (data.color?.config ?? null) as PrecomputeInput['colorConfig'],
    presetSelection: (data.presetSelection ?? null) as PrecomputeInput['presetSelection'],
    appearanceConfig: (data.appearanceConfig ?? null) as PrecomputeInput['appearanceConfig'],
    typographyConfig: (data.typography?.config ?? null) as PrecomputeInput['typographyConfig'],
    customFonts: data.customFonts as PrecomputeInput['customFonts'],
    motionConfig: data.motion?.config as PrecomputeInput['motionConfig'],
    gridConfig: data.grid?.config as PrecomputeInput['gridConfig'],
    platformsConfig: data.platforms?.config as PrecomputeInput['platformsConfig'],
    materialConfig: mergeMaterialConfigWithFoundationConfig(
      data.materialConfig ?? null,
      data.materials?.config ?? null,
    ) as PrecomputeInput['materialConfig'],
  };
}

function tokensForTheme(
  data: FoundationDataLike,
  theme: 'light' | 'dark',
): Record<FoundationBucket, Record<string, string>> {
  const input = buildPrecomputeInput(data);
  const result = precomputeBrandCSSNew(input, theme);

  // Root declarations from the surface + typography pipeline.
  // result.rawCSS is `<token>: <value>; <token>: <value>; ...` (no selector wrap).
  const surfaceTokens = parseCSSDeclarationsToVars(result.rawCSS);

  // Motion emits raw declarations. Grid and dimension spacing are selector-
  // scoped, so preserve the selector in the export key instead of overwriting
  // repeated `--Grid-*` declarations.
  const motionCSS = generateMotionCSS((data.motion?.config ?? null) as Parameters<typeof generateMotionCSS>[0]);
  const gridCSS = generateGridCSS((data.grid?.config ?? null) as Parameters<typeof generateGridCSS>[0]);
  const dimensionCSS = data.platforms?.config
    ? generateDimensionCSS(migrateLegacyPlatformsConfig(data.platforms.config as Parameters<typeof generateDimensionCSS>[0]))
    : '';
  const motionTokens = parseCSSDeclarationsToVars(motionCSS);
  const gridTokens = {
    ...extractScopedDeclarations(generateStaticGridSpacingCSS()),
    ...extractScopedDeclarations(dimensionCSS),
    ...extractScopedDeclarations(gridCSS),
    '--Spacing-Margin': 'var(--Grid-Margin)',
    '--Spacing-Gutter': 'var(--Grid-Gutter)',
  };

  return bucketize({ ...surfaceTokens, ...motionTokens, ...gridTokens });
}

/**
 * Build a structured JSON export of resolved brand tokens for both themes.
 *
 * The returned object is JSON-serialisable as-is. To export only one
 * foundation, call `sliceExportByFoundation(out, 'color')`.
 */
export function extractResolvedTokens(
  data: FoundationDataLike,
  meta?: { brandId?: string; brandName?: string },
): BrandTokenExport {
  return {
    $schema: 'oneui-tokens/v1',
    brand: { id: meta?.brandId, name: meta?.brandName },
    generatedAt: new Date().toISOString(),
    notes: [
      'Resolved tokens are flat var() expressions or computed colour values, mirroring the CSS injected at runtime.',
      'Surface-context remapping ([data-surface=…] blocks) is intentionally omitted; consumers should re-derive per-context values from the same brand inputs.',
    ],
    themes: {
      light: tokensForTheme(data, 'light'),
      dark: tokensForTheme(data, 'dark'),
    },
  };
}

/**
 * Return a copy of `payload` with each theme reduced to a single foundation
 * bucket. Used for per-foundation download buttons.
 */
export function sliceExportByFoundation(
  payload: BrandTokenExport,
  foundation: FoundationBucket,
): BrandTokenExport {
  const slice = (themeBuckets: Record<FoundationBucket, Record<string, string>>) => {
    const out = emptyBucketSet();
    out[foundation] = themeBuckets[foundation];
    return out;
  };
  return {
    ...payload,
    themes: {
      light: slice(payload.themes.light),
      dark: slice(payload.themes.dark),
    },
  };
}
