/**
 * Shared types for the @oneui/shared/cdn module — used by all bundler plugins
 * (vite/webpack/esbuild) and by the CDN producer (cdn-release-full-pipeline).
 *
 * On-disk cache layout (under `node_modules/.oneui-cache/`) intentionally
 * matches the legacy shape so BrandProvider / engine / virtual-module codegen
 * stay untouched:
 *
 *   manifest.json
 *   brands/<slug>/
 *     brand.css
 *     branding.json
 *     decorations.json
 *     themeConfig.json
 *     materials.json
 *     fonts.json                (optional)
 *     sub/<themeSlug>/
 *       brand.css
 *       themeConfig.json
 *
 * CDN layout (v2 / schemaVersion 2) — fetched and split into the on-disk shape
 * above by `sync.ts`:
 *
 *   brands/index.json                        ← list of brand slugs
 *   brands/<slug>/index.json                 ← versions + themes + latest
 *   brands/<slug>/latest.{json,css}          ← byte copies of <latest>/brand.*
 *   brands/<slug>/<version>/brand.json       ← combined payload (BrandJsonV2)
 *   brands/<slug>/<version>/brand.css
 *   brands/<slug>/themes/<themeSlug>/index.json
 *   brands/<slug>/themes/<themeSlug>/latest.{json,css}
 *   brands/<slug>/themes/<themeSlug>/<version>/brand.json
 *   brands/<slug>/themes/<themeSlug>/<version>/brand.css
 */

/**
 * Per-brand entry shape in `oneui.brands.json` / plugin options.
 * String form is the legacy parent-only shape; object form opts the parent
 * into one or more sub-brands.
 */
export type BrandConfigEntry = string | { version: string; themes?: string[] };

/** User-facing plugin options — shape is identical across vite/webpack/esbuild. */
export interface OneuiPluginOptions {
  /** Base CDN URL. Trailing slash optional. Falls back to env / config file. */
  cdnUrl?: string;
  /** Map of brand slug → version OR { version, themes }. Falls back to config file. */
  brands?: Record<string, BrandConfigEntry>;
  /** Path (relative to project root) to the brand config file. Default: `./oneui.brands.json`. */
  configFile?: string;
  /** Cache dir relative to project root. Default: `node_modules/.oneui-cache`. */
  cacheDir?: string;
  /** If true, never hit the network — only use cached CSS. */
  offline?: boolean;
}

/** Resolved (normalized) brand entry — always object form internally. */
export interface ResolvedBrandEntry {
  version: string;
  themes: string[];
}

/** Resolved options — paths are absolute, cdnUrl has trailing slash stripped. */
export interface ResolvedOptions {
  cdnUrl: string;
  brands: Record<string, ResolvedBrandEntry>;
  cacheDir: string;
  offline: boolean;
}

/** Branding sidecar — the only sidecar with a typed shape today. */
export interface Branding {
  brandName: string;
  logoSvg?: string | null;
}

/**
 * On-disk cache manifest (one file at the cacheDir root). Tracks the version
 * pinned for each brand so we can wipe stale CSS when a user bumps versions.
 */
export interface CacheManifest {
  version: 2;
  brands: Record<string, {
    version: string;
    hash: string;
    bytes: number;
    fetchedAt: string;
    themes?: Record<string, { hash: string; bytes: number; fetchedAt: string }>;
  }>;
}

/**
 * Combined CDN payload — replaces the 5 separate sidecar JSONs with one fetch.
 * The plugin splits this back into the legacy on-disk file shape so nothing
 * downstream needs to change.
 */
export interface BrandJsonV2 {
  schemaVersion: 2;
  version: string;
  branding: Branding;
  decorations: unknown[];
  themeConfig: unknown | null;
  materials: unknown | null;
  fonts: unknown | null;
}

/** Sub-brand payload — only themeConfig is sub-brand-specific. */
export interface ThemeJsonV2 {
  schemaVersion: 2;
  version: string;
  themeConfig: unknown | null;
}

/** Per-brand index — emitted at `brands/<slug>/index.json`. */
export interface BrandIndexV2 {
  schemaVersion: 2;
  versions: string[];
  latest: string;
  themes: string[];
}

/** Per-sub-brand index — emitted at `brands/<slug>/themes/<themeSlug>/index.json`. */
export interface ThemeIndexV2 {
  schemaVersion: 2;
  versions: string[];
  latest: string;
}

/** Top-level brands index — emitted at `brands/index.json`. */
export interface BrandsRootIndexV2 {
  schemaVersion: 2;
  brands: string[];
}

/**
 * Minimal logger interface — vite gives us `config.logger`, webpack gives us
 * a `Compiler.getLogger(...)`, esbuild has nothing. All three satisfy this.
 */
export interface CdnLogger {
  info(msg: string): void;
  warn(msg: string): void;
}
