/**
 * Cache path helpers — the on-disk layout under `.oneui-cache/`.
 *
 * Intentionally matches the legacy v1 shape so BrandProvider / virtual-module
 * codegen / engine don't need to change. The combined `brand.json` CDN payload
 * is split back into the file-per-sidecar shape below by `sync.ts`.
 */

import { join } from 'node:path';

export function brandsRoot(cacheDir: string): string {
  return join(cacheDir, 'brands');
}

export function brandDir(cacheDir: string, slug: string): string {
  return join(brandsRoot(cacheDir), slug);
}

export function cssPath(cacheDir: string, slug: string): string {
  return join(brandDir(cacheDir, slug), 'brand.css');
}

export function brandingPath(cacheDir: string, slug: string): string {
  return join(brandDir(cacheDir, slug), 'branding.json');
}

export function decorationsPath(cacheDir: string, slug: string): string {
  return join(brandDir(cacheDir, slug), 'decorations.json');
}

export function themeConfigPath(cacheDir: string, slug: string): string {
  return join(brandDir(cacheDir, slug), 'themeConfig.json');
}

export function materialsPath(cacheDir: string, slug: string): string {
  return join(brandDir(cacheDir, slug), 'materials.json');
}

export function fontsPath(cacheDir: string, slug: string): string {
  return join(brandDir(cacheDir, slug), 'fonts.json');
}

export function themeDir(cacheDir: string, parent: string, sub: string): string {
  return join(brandDir(cacheDir, parent), 'sub', sub);
}

export function themeCssPath(cacheDir: string, parent: string, sub: string): string {
  return join(themeDir(cacheDir, parent, sub), 'brand.css');
}

export function themeThemeConfigPath(cacheDir: string, parent: string, sub: string): string {
  return join(themeDir(cacheDir, parent, sub), 'themeConfig.json');
}

export function manifestPath(cacheDir: string): string {
  return join(cacheDir, 'manifest.json');
}
