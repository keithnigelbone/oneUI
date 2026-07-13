/**
 * defineComponent — the only entry every component file in @jds/kb-rn calls.
 * Adds typing convenience and a single chokepoint where we can later wire:
 *   - runtime ajv compilation (deferred to scripts/generate-json.ts)
 *   - token-claim verification (B6 — deferred to OneUI CI)
 *   - composition-to-jsonschema compilation (deferred)
 */

import type {
  A11yRN,
  ComponentMetaUniform,
  RenderHintsRN,
} from '@jds/kb-core';

export type RNComponentMeta = ComponentMetaUniform<RenderHintsRN, A11yRN>;

/**
 * Identity function with type narrowing. Authors write
 * `export const JDSButton = defineComponent({...} as const);`
 * to get full literal-type inference.
 */
export function defineComponent<T extends RNComponentMeta>(meta: T): T {
  return meta;
}
