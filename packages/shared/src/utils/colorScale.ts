/**
 * colorScale.ts — re-export shim.
 *
 * The original 1738-line monolith was split into focused submodules under
 * `./colorScale/`. This file preserves the public API for every existing
 * import path (`@oneui/shared/utils/colorScale`, internal package paths, etc.)
 * while letting new code import directly from the smaller submodules:
 *
 *   import { hexToOklch } from '@oneui/shared/utils/colorScale/oklch';
 *
 * See `./colorScale/index.ts` for the breakdown.
 */

export * from './colorScale/index';
