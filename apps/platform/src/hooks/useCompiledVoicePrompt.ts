/**
 * useCompiledVoicePrompt.ts
 *
 * Shared hook that queries the active brand's voice config + rules
 * from Convex and runs them through `compileVoiceRules()` to produce
 * the system-prompt string that the global agent injects as a
 * "## Brand Tone of Voice" section.
 *
 * Consumers pass the brand id; the hook returns `undefined` until the
 * Convex subscriptions settle (or permanently, if the brand has no
 * voice configured). Safe to use on any chat surface — both HomeChat
 * and the Tone of Voice playground can consume the same hook.
 *
 * Channel is pinned to `'default'` and context to `'conversational'`,
 * matching the playground's default state. Surfaces that need a
 * specific channel/context (e.g. the playground's own channel picker)
 * should build their own compile call — this hook is the free-form
 * default.
 */

'use client';

import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { compileVoiceRules } from '@oneui/shared/engine';
import type { VoiceConfig, VoiceRule } from '@oneui/shared/engine';

export function useCompiledVoicePrompt(
  brandId: Id<'brands'> | undefined,
): string | undefined {
  const voiceConfig = useQuery(
    api.voiceConfigs.get,
    brandId ? { brandId } : 'skip',
  );
  const brandRules = useQuery(
    api.voiceRules.getByBrand,
    brandId ? { brandId } : 'skip',
  );
  const baseRules = useQuery(api.voiceRules.getSystemBrandBaseRules);

  return useMemo(() => {
    if (!voiceConfig || !baseRules) return undefined;
    const config: VoiceConfig = {
      agentName: voiceConfig.agentName,
      personality: voiceConfig.personality ?? undefined,
      toneProfile: voiceConfig.toneProfile,
      language: voiceConfig.language,
      communicationStyle: voiceConfig.communicationStyle,
      emotionalIntelligence: voiceConfig.emotionalIntelligence,
      channelDefaults: voiceConfig.channelDefaults ?? undefined,
      verbosity: voiceConfig.verbosity ?? undefined,
      isActive: voiceConfig.isActive,
      version: voiceConfig.version,
    };
    const resolved: VoiceRule[] = baseRules.map((base) => {
      const override = brandRules?.find(
        (r) => r.sectionId === base.sectionId && r.scope === 'brand' && r.isActive,
      );
      return override || base;
    });
    try {
      return compileVoiceRules(resolved, config, 'default', undefined, 'conversational').prompt;
    } catch (err) {
      console.warn('[useCompiledVoicePrompt] compile failed', err);
      return undefined;
    }
  }, [voiceConfig, baseRules, brandRules]);
}
