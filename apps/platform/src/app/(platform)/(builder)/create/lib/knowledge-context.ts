/**
 * knowledge-context.ts
 *
 * Thin adapter over `buildAgentContext`. Exists because `prompt-system.ts`
 * (and related create/ code) already imports `buildKnowledgeContext`; this
 * file translates the create/ `BrandContext` shape into the agent module's
 * `BrandFoundationSummary` and delegates.
 */

import { buildAgentContext } from '@oneui/shared/agent';
import { getRegistryMetas } from '@/lib/registryMetas';
import type { BrandContext } from './types';

export function buildKnowledgeContext(opts: { brandContext: BrandContext }): string {
  const { brandContext } = opts;
  const result = buildAgentContext({
    componentMetas: getRegistryMetas(),
    brand: {
      brandName: brandContext.brandName,
      theme: brandContext.theme,
      primaryFont: brandContext.primaryFont,
      secondaryFont: brandContext.secondaryFont,
    },
    mode: 'create',
    voicePrompt: brandContext.voicePrompt,
    compositionPrompt: brandContext.compositionPrompt,
  });

  if (result.truncated) {
    console.warn('[knowledge-context] system prompt truncated', { chars: result.chars });
  }
  return result.system;
}
