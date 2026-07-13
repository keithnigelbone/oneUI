/// <reference types="vite/client" />

declare module 'virtual:oneui-brands' {
  export const brands: Record<
    string,
    () => Promise<{
      default: string;
      decorations?: unknown;
      themeConfig?: unknown;
      materialsFoundation?: unknown;
      branding?: unknown;
      fontsFoundation?: unknown;
    }>
  >;
  export const manifest: Record<string, { version: string; bytes: number; hash: string }>;
  export const availableBrands: string[];
}
