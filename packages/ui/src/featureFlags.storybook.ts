/**
 * Storybook-only feature flags shim.
 *
 * Vite `define` / `import.meta.env` injection is unreliable for workspace
 * packages in Storybook 10 (prebundle cache, envPrefix, HMR). Alias this
 * module over `featureFlags.ts` in `apps/storybook/.storybook/main.ts` so
 * internal stories always exercise WIP transparent material.
 */

/** @see featureFlags.ts — always ON in Storybook. */
export const MATERIAL_TRANSPARENT_ENABLED = true;
