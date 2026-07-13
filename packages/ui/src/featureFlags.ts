/**
 * Build-time experimental feature flags.
 *
 * These are intentionally read off `process.env.*` (and `import.meta.env` as a
 * Storybook/Vite fallback) so each bundler statically replaces them and the
 * disabled branch **dead-code-eliminates**:
 *
 * - Public tarball (`packages/ui/vite.config.ts` `define`) → the env var is
 *   unset at release-build time, baked to `''` → flag is `false`, the gated
 *   code path is removed from `dist/`.
 * - Storybook (`apps/storybook/.storybook/main.ts` `define` + `env`) and vitest
 *   (`test.env`) force the var to `'true'` so internal stories/tests still
 *   exercise the real experimental behaviour.
 *
 * Bare `process.env.X` access (no `typeof process` guard on the fallback) is
 * deliberate for release builds — Vite `define` replaces the whole
 * `process.env.*` subexpression to `''`, so the guard is only needed when
 * the fallback runs at runtime (Storybook dev without a successful `define`).
 */

/** Vite/Storybook expose build-time vars on `import.meta.env`, but the ambient
 *  `ImportMeta` type in a Next/tsc build doesn't declare it — widen locally. */
type ImportMetaWithEnv = ImportMeta & { env?: Record<string, string | undefined> };

/**
 * Gate for the WIP `<Surface material="transparent">` glass/material system.
 * OFF in the published library: every `transparent` request (explicit prop,
 * `MaterialFoundationProvider` default, or CDN-loaded brand config) coerces to
 * `solid` at the single chokepoint in `Surface.tsx`, so `data-material` /
 * `data-media` attributes are never emitted and the experimental CSS stays
 * inert. Set `ONEUI_EXPERIMENTAL_MATERIAL_TRANSPARENT=true` to opt in.
 */
export const MATERIAL_TRANSPARENT_ENABLED =
  (typeof import.meta !== 'undefined'
    && (import.meta as ImportMetaWithEnv).env?.ONEUI_EXPERIMENTAL_MATERIAL_TRANSPARENT === 'true')
  || (typeof process !== 'undefined'
    && process.env.ONEUI_EXPERIMENTAL_MATERIAL_TRANSPARENT === 'true');
