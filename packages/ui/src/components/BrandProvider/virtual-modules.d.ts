/**
 * Ambient declarations for the virtual modules exposed by @oneui/vite-plugin.
 * Lets BrandProvider type-check without a hard dep on the plugin package.
 */
declare module 'virtual:oneui-brands' {
  export interface BrandModule {
    default: string;
    decorations?: unknown[];
    themeConfig?: unknown | null;
    materialsFoundation?: unknown | null;
    branding?: { brandName?: string; logoSvg?: string | null };
    fontsFoundation?: unknown | null;
  }
  export const brands: Record<string, () => Promise<BrandModule>>;
  export const themes: Record<
    string,
    () => Promise<{ default: string; themeConfig?: unknown }>
  >;
  export const manifest: Record<string, { version: string; bytes: number; hash: string }>;
  export const availableBrands: string[];
}

declare module '@oneui/ui/brand-loader' {
  export * from 'virtual:oneui-brands';
}

declare module '@jds4/oneui-react/brand-loader' {
  export * from 'virtual:oneui-brands';
}

declare module 'virtual:oneui-brand/*' {
  const css: string;
  export default css;
  export const decorations: unknown[];
  export const themeConfig: unknown | null;
  export const materialsFoundation: unknown | null;
  export const branding: { brandName: string; logoSvg?: string | null };
  export const fontsFoundation: unknown | null;
}
