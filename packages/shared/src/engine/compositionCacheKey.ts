/**
 * Composition Cache Key — Deterministic hashing for composition prompt memoization.
 *
 * Follows the same pattern as voiceCacheKey.ts (computeVoiceHash).
 * Creates a hash from composition rules + config to detect when recompilation is needed.
 */

import type { CompositionConfig, CompositionRule } from './compositionTypes';

/**
 * Compute a deterministic hash string from composition rules and config.
 * Used for composition prompt memoization and cache invalidation.
 */
export function computeCompositionHash(
  rules: CompositionRule[],
  config: CompositionConfig,
  context: string = 'mobile-app'
): string {
  const parts: string[] = [];

  // Config identity
  parts.push(`v:${config.vertical}`);
  parts.push(`ver:${config.version}`);
  parts.push(`ctx:${context}`);

  // Layout personality
  const lp = config.layoutPersonality;
  parts.push(`lp:${lp.density},${lp.expressiveness}`);

  // Optional config flags
  if (config.maxComponentsPerScreen != null) {
    parts.push(`mc:${config.maxComponentsPerScreen}`);
  }
  if (config.preferBoldHeros != null) {
    parts.push(`bh:${config.preferBoldHeros ? 1 : 0}`);
  }
  if (config.preferMinimalContainers != null) {
    parts.push(`mc:${config.preferMinimalContainers ? 1 : 0}`);
  }

  // Rules (sorted by priority, include version + active state + content hash)
  const ruleParts = rules
    .sort((a, b) => a.priority - b.priority)
    .map((r) => `${r.sectionId}:${r.version}:${r.isActive ? 1 : 0}:${simpleHash(r.content)}`)
    .join(';');
  parts.push(`r:${simpleHash(ruleParts)}`);

  return simpleHash(parts.join('|'));
}

/**
 * Simple string hash (djb2 algorithm).
 * Not cryptographic — used for cache key comparison only.
 */
function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return (hash >>> 0).toString(36);
}
