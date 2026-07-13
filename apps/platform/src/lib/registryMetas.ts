/**
 * registryMetas.ts
 *
 * Single cached accessor for the flattened `ComponentMeta[]` derived
 * from `COMPONENT_REGISTRY`. Hoisted out of per-module caches so the
 * `buildAgentContext` WeakMap hits consistently — every caller
 * receives the same array reference, so `renderComponentContext`
 * caches the expensive `generateAIContext` render exactly once per
 * process lifetime (not once per endpoint).
 */

import type { ComponentMeta } from '@oneui/shared';
import { COMPONENT_REGISTRY } from '@oneui/ui/registry/componentRegistry';

let cached: ComponentMeta[] | null = null;

/** Returns the stable `ComponentMeta[]` snapshot from the registry. */
export function getRegistryMetas(): ComponentMeta[] {
  if (cached !== null) return cached;
  cached = Object.values(COMPONENT_REGISTRY)
    .map((entry) => entry.meta)
    .filter((m): m is ComponentMeta => Boolean(m));
  return cached;
}
