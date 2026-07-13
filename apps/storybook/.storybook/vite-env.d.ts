/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL?: string;
  readonly CONVEX_URL?: string;
  readonly STORYBOOK_CONVEX_URL?: string;
  /** Storybook-only: enables `<Surface material="transparent">` (see featureFlags.ts). */
  readonly ONEUI_EXPERIMENTAL_MATERIAL_TRANSPARENT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
