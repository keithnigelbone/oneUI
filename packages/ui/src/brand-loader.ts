/**
 * Default no-plugin brand manifest — Jio baked fallback only.
 * When `@jds4/oneui-*-plugin` is installed, bundlers alias this subpath to the
 * CDN-generated index (same shape as `virtual:oneui-brands`).
 */

export interface BrandModule {
  default: string;
  decorations?: unknown;
  themeConfig?: unknown | null;
  materialsFoundation?: unknown | null;
  branding?: unknown;
  fontsFoundation?: unknown | null;
}

export const brands: Record<string, () => Promise<BrandModule>> = {
  jio: () => import('../cdn-bootstrap/jio-loader'),
};

export const themes: Record<
  string,
  () => Promise<{ default: string; themeConfig?: unknown }>
> = {};

export const manifest: Record<string, { version: string; bytes: number; hash: string }> = {
  jio: { version: 'baked', bytes: 0, hash: '' },
};

export const themeManifest: Record<
  string,
  { parent: string; sub: string; bytes: number; hash: string }
> = {};

export const availableBrands = ['jio'];

export const availableThemes: string[] = [];
