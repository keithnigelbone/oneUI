/**
 * Voice Cache Key — Deterministic hashing for voice prompt memoization.
 *
 * Follows the same pattern as cacheKey.ts (computeInputHash).
 * Creates a hash from voice rules + config to detect when recompilation is needed.
 */

import type { VoiceConfig, VoiceRule } from './voiceTypes';

/**
 * Compute a deterministic hash string from voice rules and config.
 * Used for voice prompt memoization and cache invalidation.
 */
export function computeVoiceHash(
  rules: VoiceRule[],
  config: VoiceConfig,
  channel: string = 'default',
  context: string = 'conversational'
): string {
  const parts: string[] = [];

  // Config identity
  parts.push(`name:${config.agentName}`);
  parts.push(`v:${config.version}`);
  parts.push(`ch:${channel}`);
  parts.push(`ctx:${context}`);

  // Tone profile (sorted keys for determinism)
  const tone = config.toneProfile;
  parts.push(`t:${tone.warmth},${tone.directness}`);

  // Language
  parts.push(`l:${config.language.primary},${config.language.spellingConvention},${config.language.numberFormat}`);

  // Forbidden words (sorted, hashed)
  const fw = [...config.communicationStyle.forbiddenWords].sort().join('|');
  parts.push(`fw:${simpleHash(fw)}`);

  // Rules (sorted by priority, include version + active state)
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
