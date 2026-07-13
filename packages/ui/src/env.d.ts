/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly ONEUI_EXPERIMENTAL_MATERIAL_TRANSPARENT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
