/**
 * agents/tone-of-voice/playground/page.tsx
 *
 * Voice Playground — consumes the unified `<ChatSurface>` from @oneui/ui
 * via `useAgentChat('voice')`. All streaming, tone-guard phases, and
 * auto-correction now live server-side in `/api/voice/generate`; this
 * page only owns the page-level setup (voice config + rule loading,
 * compiled prompt, empty-state suggestions, model picker).
 */

'use client';

import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import { Id } from '@oneui/convex/_generated/dataModel';
import { compileVoiceRules } from '@oneui/shared/engine';
import type { VoiceConfig, VoiceContext, VoiceRule } from '@oneui/shared/engine';
import { Button } from '@oneui/ui/components/Button';
import {
  ChatSurface,
  defaultRenderMessagePart,
  isToneGuardPart,
} from '@oneui/ui/components/ChatSurface';
import type { RenderMessagePart } from '@oneui/ui/components/ChatSurface';
import IcHellojio from '@/Jio_Icons/icons/IcHellojio';
import type { SuggestionChip } from '@oneui/ui/components/ChatComposer';
import { Icon } from '@oneui/ui/icons/Icon';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Select } from '@oneui/ui/components/Select';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { useVoicePlaygroundOptional } from '@/contexts/VoicePlaygroundContext';
import { useAgentChat } from '@/hooks/useAgentChat';
import foundationStyles from '../../../foundations/foundation.module.css';

// ─── Suggestions ────────────────────────────────────────────────────────────

const CHANNEL_SUGGESTIONS: Record<string, string[]> = {
  default: [
    'My recharge failed and I lost ₹299',
    'Why is my internet so slow today?',
    'I want to cancel my plan',
    'Compare the ₹599 and ₹999 plans',
  ],
  sms: [
    'Your ₹299 recharge failed. Retry?',
    'Data limit reached. Upgrade now?',
    'Your plan renews tomorrow. Need changes?',
  ],
  whatsapp: [
    'Hi, my internet has been slow all day',
    'Can you help me with a refund for ₹299?',
    'I want to switch to a better plan',
  ],
  app: [
    'Show me my current data usage',
    'I need help with JioFiber setup',
    'Why was I charged twice this month?',
  ],
  ivr: [
    'I want to speak to an agent',
    'Check my balance',
    'My call keeps dropping in my area',
  ],
  email: [
    'Draft a welcome email for new JioFiber customers',
    'Write a billing dispute response for a double charge',
    'Compose a service restoration notification email',
  ],
};

const CONTEXT_SUGGESTIONS: Record<VoiceContext, string[]> = {
  conversational: [],
  copy: [
    'Write a homepage hero body for JioFiber',
    'Rewrite: "Our amazing new plan is the BEST thing ever!!!"',
    'Short email body announcing a family plan upgrade',
  ],
  microcopy: [
    'Button label for submitting a recharge',
    'Empty state: no saved plans',
    'Error message for a declined card',
    'Toast notification: profile updated',
  ],
  editorial: [
    'Opening paragraph for an article about Jio\'s 2016 launch',
    'Case study intro: small business using JioFiber',
    'Guide introduction for first-time JioMart users',
  ],
};

const EMPTY_TITLE_BY_CONTEXT: Record<VoiceContext, string> = {
  conversational: 'Your Jio assistant',
  microcopy: 'Draft UI microcopy',
  editorial: 'Draft long-form editorial',
  copy: 'Draft marketing & brandbook copy',
};

const MODELS = [
  { value: 'claude-sonnet-4-6', label: 'Sonnet 4.6' },
  { value: 'claude-haiku-4-5', label: 'Haiku 4.5' },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function VoicePlaygroundPage() {
  const { currentBrand } = usePlatformContext();
  const voiceCtx = useVoicePlaygroundOptional();
  const voiceContext: VoiceContext = voiceCtx?.context ?? 'conversational';
  const channel = voiceCtx?.channel ?? 'default';
  const showToneGuard = voiceCtx?.showToneGuard ?? true;
  const brandId = currentBrand?.id as Id<'brands'> | undefined;

  const voiceConfig = useQuery(api.voiceConfigs.get, brandId ? { brandId } : 'skip');
  const brandRules = useQuery(api.voiceRules.getByBrand, brandId ? { brandId } : 'skip');
  const baseRules = useQuery(api.voiceRules.getSystemBrandBaseRules);
  const systemBrand = useQuery(api.brands.getBySlug, { slug: 'oneui-system' });
  const createDefaults = useMutation(api.voiceConfigs.createDefaults);
  const seedBaseRules = useMutation(api.voiceRules.seedBaseRules);

  const [model, setModel] = useState(MODELS[0].value);

  // Compile voice config → system prompt.
  const configObj = useMemo((): VoiceConfig | null => {
    if (!voiceConfig) return null;
    return {
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
  }, [voiceConfig]);

  const compiled = useMemo(() => {
    if (!configObj || !baseRules) return null;
    const resolved: VoiceRule[] = baseRules.map((base) => {
      const override = brandRules?.find(
        (r) => r.sectionId === base.sectionId && r.scope === 'brand' && r.isActive,
      );
      return override || base;
    });
    const effectiveChannel = voiceContext === 'conversational' ? channel : 'default';
    return compileVoiceRules(resolved, configObj, effectiveChannel, undefined, voiceContext);
  }, [configObj, baseRules, brandRules, channel, voiceContext]);

  // ── Transport body is computed per-request so brand/channel/model
  // updates land without re-instantiating useChat. Values are read
  // inline; React closes over the latest render's bindings.
  const bodyProvider = useCallback(
    () => ({
      voicePrompt: compiled?.prompt ?? '',
      channel,
      config: configObj,
      showToneGuard,
      model,
    }),
    [compiled?.prompt, channel, configObj, showToneGuard, model],
  );

  const { messages, sendMessage, status, error } = useAgentChat({
    mode: 'voice',
    body: bodyProvider,
  });

  const isStreaming = status === 'streaming' || status === 'submitted';
  const disabledByConfig = !compiled || !configObj;

  // Prefill suggestions by writing into the composer input — ChatSurface
  // exposes controlled value for this exact case.
  const [composerValue, setComposerValue] = useState('');

  const suggestionTexts =
    voiceContext === 'conversational'
      ? CHANNEL_SUGGESTIONS[channel] ?? CHANNEL_SUGGESTIONS.default
      : CONTEXT_SUGGESTIONS[voiceContext];

  const suggestions: SuggestionChip[] = useMemo(
    () =>
      suggestionTexts.map((text, i) => ({
        id: `sug-${i}`,
        label: text,
        onClick: () => setComposerValue(text),
      })),
    [suggestionTexts],
  );

  const handleSubmit = useCallback(
    (text: string) => {
      sendMessage({ text });
    },
    [sendMessage],
  );

  const trailing = (
    <>
      <Select
        value={model}
        onChange={setModel}
        options={MODELS}
        size="sm"
      />
      <IconButton
        icon={<Icon name="arrowUp" />}
        attention="high"
        size="s"
        onPress={() => handleSubmit(composerValue)}
        disabled={isStreaming || composerValue.trim().length === 0 || disabledByConfig}
        aria-label="Send"
      />
    </>
  );

  // Quick setup — voice config is per-brand, base rules are seeded on the system brand.
  const handleSetup = useCallback(async () => {
    if (!brandId) return;
    await createDefaults({
      brandId,
      agentName: currentBrand?.name ? `${currentBrand.name} Assistant` : undefined,
    });
    if (systemBrand?._id) {
      await seedBaseRules({ brandId: systemBrand._id });
    }
  }, [brandId, currentBrand, createDefaults, seedBaseRules, systemBrand]);

  // ─── Guard states ───────────────────────────────────────────────────────

  if (!brandId) {
    return (
      <div className={foundationStyles.page}>
        <p className={foundationStyles.description}>Select a brand to use the playground.</p>
      </div>
    );
  }

  if (voiceConfig === undefined || baseRules === undefined) {
    return (
      <div className={foundationStyles.page}>
        <div className={foundationStyles.header}>
          <h1 className={foundationStyles.title}>Playground</h1>
          <p className={foundationStyles.description}>Loading...</p>
        </div>
      </div>
    );
  }

  if (voiceConfig === null) {
    return (
      <div className={foundationStyles.page}>
        <div className={foundationStyles.header}>
          <h1 className={foundationStyles.title}>Playground</h1>
          <p className={foundationStyles.description}>
            Test your brand's AI voice in real time with Claude.
          </p>
        </div>
        <FoundationCard
          title="Setup required"
          description="Create a voice configuration and seed base rules to start chatting."
        >
          <Button attention="high" onClick={handleSetup}>
            Create voice config and seed rules
          </Button>
        </FoundationCard>
      </div>
    );
  }

  const greetingNode = (
    <div style={{ textAlign: 'center' }}>
      <h1 className={foundationStyles.title} style={{ marginBottom: 'var(--Spacing-2)' }}>
        {EMPTY_TITLE_BY_CONTEXT[voiceContext]}
      </h1>
      <p className={foundationStyles.description}>
        {voiceContext === 'conversational' ? (
          <>
            Ask anything. Every response is shaped
            <br />
            by our Conversational Engagement Rules.
          </>
        ) : voiceContext === 'microcopy'
            ? `Ask for button labels, error messages, empty states, or tooltips in the ${voiceConfig.agentName} voice.`
            : voiceContext === 'editorial'
              ? 'Ask for article openers, case study intros, or brand story paragraphs.'
              : 'Ask for website body copy, product descriptions, or paste existing copy to check compliance.'}
      </p>
    </div>
  );

  const renderMessagePart: RenderMessagePart = (part, ctx) => {
    // Honour the Tone Guard toggle retroactively: hide streamed
    // tone-guard cards from history whenever the switch is off so
    // toggling instantly reshapes the conversation, not just new turns.
    if (!showToneGuard && isToneGuardPart(part)) return null;
    return defaultRenderMessagePart(part, ctx);
  };

  return (
    <ChatSurface
      messages={messages}
      status={status}
      error={error ?? null}
      onSubmit={handleSubmit}
      value={composerValue}
      onValueChange={setComposerValue}
      greeting={greetingNode}
      suggestions={suggestions}
      agentIcon={<IcHellojio />}
      composerProps={{
        placeholder: 'How can I help you today?',
        trailing,
      }}
      renderMessagePart={renderMessagePart}
    />
  );
}
