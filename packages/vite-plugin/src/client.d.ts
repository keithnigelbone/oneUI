/**
 * Ambient types for the virtual modules emitted by @oneui/vite-plugin.
 *
 * Consumers should include this in their TS project via a `vite-env.d.ts`:
 *   /// <reference types="@oneui/vite-plugin/client" />
 */
declare module 'virtual:oneui-brands' {
  export interface BrandModule {
    /** The full CDN-delivered brand CSS string (scoped under [data-brand][data-mode]). */
    default: string;
    /** Ornament payloads from `brands/<slug>/decorations.json` (empty array if absent). */
    decorations?: unknown[];
    /** Serialised `ThemeConfig` from `themeConfig.json` (null if absent). */
    themeConfig?: unknown | null;
    /** Serialised Material foundation defaults from `materials.json` (null if absent). */
    materialsFoundation?: unknown | null;
    /** `branding.json` — display name + optional inline SVG logo. */
    branding?: { brandName?: string; logoSvg?: string | null };
    /** Subset of foundation for `useBrandFonts` from `fonts.json` (null if absent). */
    fontsFoundation?: unknown | null;
  }
  /** Lazy loaders, keyed by slug. Each call returns a code-split chunk. */
  export const brands: Record<string, () => Promise<BrandModule>>;
  export const themes: Record<
    string,
    () => Promise<{ default: string; themeConfig?: unknown }>
  >;
  /** Cache manifest snapshot — version + bytes + hash per brand. */
  export const manifest: Record<string, { version: string; bytes: number; hash: string }>;
  /** Sorted list of brand slugs known to the plugin at build time. */
  export const availableBrands: string[];
}

declare module '@oneui/ui/brand-loader' {
  export * from 'virtual:oneui-brands';
}

declare module '@jds4/oneui-react/brand-loader' {
  export * from 'virtual:oneui-brands';
}

declare module 'virtual:oneui-brand/*' {
  /** The full CDN-delivered brand CSS string. */
  const css: string;
  export default css;
  /** Same array as cached `*.decorations.json` (may be empty). */
  export const decorations: unknown[];
  export const themeConfig: unknown | null;
  export const materialsFoundation: unknown | null;
  export const branding: { brandName: string; logoSvg?: string | null };
  export const fontsFoundation: unknown | null;
}
