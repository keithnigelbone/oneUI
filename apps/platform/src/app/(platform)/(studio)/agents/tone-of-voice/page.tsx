/**
 * agents/voice/page.tsx
 *
 * Voice & Tone Overview — uses FoundationCard and SliderControl
 * to match the quality of other foundation pages (Color, Surfaces, Materials).
 */

'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import { Id } from '@oneui/convex/_generated/dataModel';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { Button } from '@oneui/ui/components/Button';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Input } from '@oneui/ui/components/Input';
import { X } from 'lucide-react';
import { Switch } from '@oneui/ui/components/Switch';
import { Badge } from '@oneui/ui/components/Badge';
import { Dialog, DialogPortal } from '@oneui/ui/components/Dialog';
import { DecorationProvider } from '@oneui/ui/hooks/useDecorationContext';
import { FoundationCard, SliderControl } from '@/design-tools/Foundations/shared';
import { useFoundationData } from '@/components/FoundationStyleProvider';
import foundationStyles from '../../foundations/foundation.module.css';
import styles from './voice.module.css';

type ToneKey = 'warmth' | 'directness';
type ToneProfile = Record<ToneKey, number>;

const TONE_DESCRIPTIONS: Record<ToneKey, string> = {
  warmth: 'Crisp, professional (0) to Warm, friendly (100)',
  directness: 'Exploratory, detailed (0) to Concise, action-oriented (100)',
};

// Suggest the next patch version after a publication (e.g. 1.0.0 → 1.0.1).
// Falls back to 1.0.0 for invalid inputs or when no prior publication exists.
function bumpPatchVersion(version: string | null | undefined): string {
  if (!version) return '1.0.0';
  const parts = version.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some(Number.isNaN)) return '1.0.0';
  return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
}

export default function VoiceOverviewPage() {
  const { currentBrand } = usePlatformContext();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;

  const voiceConfig = useQuery(
    api.voiceConfigs.get,
    brandId ? { brandId } : 'skip'
  );

  const createDefaults = useMutation(api.voiceConfigs.createDefaults);
  const updateConfig = useMutation(api.voiceConfigs.update);
  const updateToneProfile = useMutation(api.voiceConfigs.updateToneProfile);
  const updateForbiddenWords = useMutation(api.voiceConfigs.updateForbiddenWords);
  const updateVerbosity = useMutation(api.voiceConfigs.updateVerbosity);
  const updateEmojiSettings = useMutation(api.voiceConfigs.updateEmojiSettings);

  // ── Publication pipeline ────────────────────────────────────────────────
  // The system brand holds base voice rules; resolved rules merge base + brand.
  const systemBrand = useQuery(api.brands.getBySlug, { slug: 'oneui-system' });
  const systemBrandId = systemBrand?._id;

  const resolvedRules = useQuery(
    api.voiceRules.getResolved,
    brandId && systemBrandId ? { brandId, systemBrandId } : 'skip'
  );
  const voiceSkillsList = useQuery(
    api.voiceSkills.list,
    brandId ? { brandId } : 'skip'
  );
  const latestPublication = useQuery(
    api.voicePublish.getLatest,
    brandId ? { brandId } : 'skip'
  );
  const publishVoice = useMutation(api.voicePublish.publish);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newForbiddenWord, setNewForbiddenWord] = useState('');

  // Build decoration map for Dialog portal so buttons render with brand ornaments
  const foundationData = useFoundationData();
  const decorationMap = useMemo(() => {
    const map = new Map<string, any>();
    const decorations = (foundationData as any)?.decorations;
    if (decorations) {
      for (const d of decorations) {
        map.set(d.componentName, d);
      }
    }
    return map;
  }, [foundationData]);

  // Local tone state for smooth dragging — only commits to Convex on release
  const [localTone, setLocalTone] = useState<ToneProfile | null>(null);
  const commitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Local verbosity state for smooth dragging
  const [localVerbosity, setLocalVerbosity] = useState<number | null>(null);
  const verbosityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Local emoji frequency state for smooth dragging
  const [localEmojiFreq, setLocalEmojiFreq] = useState<number | null>(null);
  const emojiFreqTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Local max emojis state for smooth dragging
  const [localMaxEmojis, setLocalMaxEmojis] = useState<number | null>(null);
  const maxEmojisTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Publication state
  const [publishVersion, setPublishVersion] = useState('1.0.0');
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishedVersion, setPublishedVersion] = useState<string | null>(null);

  // Sync local tone from server when config loads or changes (and not actively dragging)
  useEffect(() => {
    if (voiceConfig && !localTone) {
      setLocalTone(voiceConfig.toneProfile as ToneProfile);
    }
  }, [voiceConfig, localTone]);

  // Sync local verbosity from server
  useEffect(() => {
    if (voiceConfig && localVerbosity === null) {
      setLocalVerbosity(voiceConfig.verbosity ?? 50);
    }
  }, [voiceConfig, localVerbosity]);

  // Sync local emoji settings from server
  useEffect(() => {
    if (voiceConfig && localEmojiFreq === null) {
      setLocalEmojiFreq(voiceConfig.communicationStyle.emojiFrequency ?? 50);
    }
  }, [voiceConfig, localEmojiFreq]);

  useEffect(() => {
    if (voiceConfig && localMaxEmojis === null) {
      setLocalMaxEmojis(voiceConfig.communicationStyle.maxEmojisPerResponse ?? 1);
    }
  }, [voiceConfig, localMaxEmojis]);

  // Suggest the next version when the latest publication loads or changes.
  useEffect(() => {
    if (latestPublication?.version) {
      setPublishVersion(bumpPatchVersion(latestPublication.version));
    }
  }, [latestPublication]);

  const handleCreateDefaults = useCallback(async () => {
    if (!brandId) return;
    await createDefaults({
      brandId,
      agentName: currentBrand?.name ? `${currentBrand.name} Assistant` : undefined,
    });
  }, [brandId, currentBrand, createDefaults]);

  const handleToneChange = useCallback((key: ToneKey, value: number) => {
    setLocalTone((prev) => prev ? { ...prev, [key]: value } : null);

    // Debounce commit — save 300ms after last drag movement
    if (commitTimeoutRef.current) clearTimeout(commitTimeoutRef.current);
    commitTimeoutRef.current = setTimeout(() => {
      setLocalTone((current) => {
        if (current && brandId) {
          updateToneProfile({ brandId, toneProfile: current });
        }
        return current;
      });
    }, 300);
  }, [brandId, updateToneProfile]);

  const handleVerbosityChange = useCallback((value: number) => {
    setLocalVerbosity(value);
    if (verbosityTimeoutRef.current) clearTimeout(verbosityTimeoutRef.current);
    verbosityTimeoutRef.current = setTimeout(() => {
      if (brandId) {
        updateVerbosity({ brandId, verbosity: value });
      }
    }, 300);
  }, [brandId, updateVerbosity]);

  const handleEmojiFreqChange = useCallback((value: number) => {
    setLocalEmojiFreq(value);
    if (emojiFreqTimeoutRef.current) clearTimeout(emojiFreqTimeoutRef.current);
    emojiFreqTimeoutRef.current = setTimeout(() => {
      if (brandId) {
        updateEmojiSettings({ brandId, emojiFrequency: value });
      }
    }, 300);
  }, [brandId, updateEmojiSettings]);

  const handleMaxEmojisChange = useCallback((value: number) => {
    setLocalMaxEmojis(value);
    if (maxEmojisTimeoutRef.current) clearTimeout(maxEmojisTimeoutRef.current);
    maxEmojisTimeoutRef.current = setTimeout(() => {
      if (brandId) {
        updateEmojiSettings({ brandId, maxEmojisPerResponse: value });
      }
    }, 300);
  }, [brandId, updateEmojiSettings]);

  const handleSaveField = useCallback(async (field: string) => {
    if (!voiceConfig) return;
    const updates: Record<string, unknown> = {};
    if (field === 'agentName') updates.agentName = editValue;
    if (field === 'personality') updates.personality = editValue;
    await updateConfig({ id: voiceConfig._id, ...updates } as any);
    setEditingField(null);
  }, [voiceConfig, editValue, updateConfig]);

  const handleAddForbiddenWord = useCallback(async () => {
    if (!brandId || !voiceConfig || !newForbiddenWord.trim()) return;
    const words = [...voiceConfig.communicationStyle.forbiddenWords, newForbiddenWord.trim().toLowerCase()];
    await updateForbiddenWords({ brandId, forbiddenWords: words });
    setNewForbiddenWord('');
  }, [brandId, voiceConfig, newForbiddenWord, updateForbiddenWords]);

  const handleRemoveForbiddenWord = useCallback(async (word: string) => {
    if (!brandId || !voiceConfig) return;
    const words = voiceConfig.communicationStyle.forbiddenWords.filter((w) => w !== word);
    await updateForbiddenWords({ brandId, forbiddenWords: words });
  }, [brandId, voiceConfig, updateForbiddenWords]);

  const handleToggleLanguage = useCallback(async (field: 'hindiSupport' | 'hinglishSupport', value: boolean) => {
    if (!voiceConfig) return;
    await updateConfig({
      id: voiceConfig._id,
      language: { ...voiceConfig.language, [field]: value },
    } as any);
  }, [voiceConfig, updateConfig]);

  const handlePublish = useCallback(async () => {
    if (!brandId || !voiceConfig || !resolvedRules || !voiceSkillsList) return;
    setPublishing(true);
    setPublishError(null);
    setPublishedVersion(null);
    try {
      // Compile one prompt per voice context so the SDK can serve surface-aware
      // instructions. The compiler filters rules by context using each rule's
      // explicit `contexts` field (falling back to DEFAULT_SECTION_CONTEXTS).
      const activeRules = resolvedRules.filter((r) => r.isActive && r.content);
      const contexts = ['conversational', 'copy', 'microcopy', 'editorial'] as const;

      const compileResults = await Promise.all(
        contexts.map(async (context) => {
          const res = await fetch('/api/voice/compile', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              rules: activeRules,
              config: voiceConfig,
              channel: 'default',
              context,
            }),
          });
          if (!res.ok) {
            const { error } = await res.json().catch(() => ({ error: 'Compile failed' }));
            throw new Error(`${context}: ${error || 'compile failed'}`);
          }
          return (await res.json()) as { prompt: string; hash: string };
        }),
      );

      const [conversational, copyPrompt, microcopy, editorial] = compileResults;

      await publishVoice({
        brandId,
        version: publishVersion,
        compiledPrompts: {
          conversational: conversational.prompt,
          copy: copyPrompt.prompt,
          microcopy: microcopy.prompt,
          editorial: editorial.prompt,
          // Legacy default key — mirror conversational so consumers that
          // still read `prompts.default` keep working during the rollout.
          default: conversational.prompt,
        },
        skills: voiceSkillsList
          .filter((s) => s.isActive)
          .map((s) => ({
            skillId: s.skillId,
            name: s.name,
            systemPromptTemplate: s.systemPromptTemplate,
            inputSchema: s.inputSchema,
            outputSchema: s.outputSchema,
          })),
        voiceConfigSnapshot: {
          agentName: voiceConfig.agentName,
          personality: voiceConfig.personality,
          toneProfile: voiceConfig.toneProfile,
          language: voiceConfig.language,
          communicationStyle: voiceConfig.communicationStyle,
          emotionalIntelligence: voiceConfig.emotionalIntelligence,
          channelDefaults: voiceConfig.channelDefaults,
          verbosity: voiceConfig.verbosity,
        },
        toneGuardRules: {
          forbiddenWords: voiceConfig.communicationStyle.forbiddenWords,
          spellingConvention: voiceConfig.language.spellingConvention,
          useEmojis: voiceConfig.communicationStyle.useEmojis,
          allowedEmojis: voiceConfig.communicationStyle.allowedEmojis,
        },
        // Concat all four hashes — changes to any context invalidate the cache.
        rulesHash: compileResults.map((r) => r.hash).join(':'),
      });
      setPublishedVersion(publishVersion);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : 'Publish failed');
    } finally {
      setPublishing(false);
    }
  }, [brandId, voiceConfig, resolvedRules, voiceSkillsList, publishVersion, publishVoice]);

  if (!brandId) {
    return (
      <div className={foundationStyles.page}>
        <p className={foundationStyles.description}>Select a brand to configure voice and tone.</p>
      </div>
    );
  }

  if (voiceConfig === undefined) {
    return (
      <div className={foundationStyles.page}>
        <div className={foundationStyles.header}>
          <h1 className={foundationStyles.title}>Voice & Tone</h1>
          <p className={foundationStyles.description}>Loading voice configuration...</p>
        </div>
      </div>
    );
  }

  if (voiceConfig === null) {
    return (
      <div className={foundationStyles.page}>
        <div className={foundationStyles.header}>
          <h1 className={foundationStyles.title}>Voice & Tone</h1>
          <p className={foundationStyles.description}>
            Configure how your brand's AI assistant sounds — identity, tone, language, and channel behaviour.
            {currentBrand && (
              <span className={foundationStyles.brandIndicator}>
                {' '}Configuring for <strong>{currentBrand.name}</strong>
              </span>
            )}
          </p>
        </div>
        <FoundationCard
          title="Get started"
          description="No voice configuration exists for this brand yet. Create one with recommended defaults based on Core Rules v5."
        >
          <Button attention="high" onClick={handleCreateDefaults}>
            Create voice configuration
          </Button>
        </FoundationCard>
      </div>
    );
  }

  const toneValues = localTone || (voiceConfig.toneProfile as ToneProfile);

  return (
    <div className={foundationStyles.page} style={{ paddingBottom: 'var(--Spacing-7)' }}>
      <div className={foundationStyles.header}>
        <h1 className={foundationStyles.title}>Voice & Tone</h1>
        <p className={foundationStyles.description}>
          Configure how your brand's AI assistant sounds — identity, tone, language, and channel behaviour.
          {currentBrand && (
            <span className={foundationStyles.brandIndicator}>
              {' '}Configuring for <strong>{currentBrand.name}</strong>
            </span>
          )}
        </p>
      </div>

      <div className={foundationStyles.content}>
        {/* Identity */}
        <FoundationCard title="Identity" description="Agent name and personality that define who the AI presents as.">
          <div className={styles.propertyList}>
            <div className={styles.propertyRow}>
              <span className={styles.propertyLabel}>Agent name</span>
              <Button
                attention="low"
                size="m"
                appearance="neutral"
                rightIcon="edit"
                onClick={() => { setEditingField('agentName'); setEditValue(voiceConfig.agentName); }}
              >
                {voiceConfig.agentName}
              </Button>
            </div>
            <div className={styles.propertyRow}>
              <span className={styles.propertyLabel}>Personality</span>
              <Button
                attention="low"
                size="m"
                appearance="neutral"
                rightIcon="edit"
                onClick={() => { setEditingField('personality'); setEditValue(voiceConfig.personality || ''); }}
              >
                {voiceConfig.personality || 'Not set'}
              </Button>
            </div>
          </div>
        </FoundationCard>

        {/* Edit identity dialog — DecorationProvider bridges ornament context into portal */}
        <Dialog
          open={editingField === 'agentName' || editingField === 'personality'}
          onOpenChange={(open) => { if (!open) setEditingField(null); }}
          size="large"
        >
          <DialogPortal
            size="large"
            title={editingField === 'agentName' ? 'Edit agent name' : 'Edit personality'}
            description={editingField === 'agentName'
              ? 'The name your AI assistant introduces itself as.'
              : 'A short description of how the assistant behaves and sounds.'}
          >
            <DecorationProvider decorations={decorationMap}>
              <div className={styles.dialogBody}>
                <Input
                  value={editValue}
                  onChange={(value) => setEditValue(value)}
                  size="large"
                  className={styles.neutralInput}
                  placeholder={editingField === 'agentName' ? 'e.g. Jio Assistant' : 'e.g. A warm, helpful digital assistant...'}
                />
              </div>
              <div className={styles.dialogActions}>
                <Button attention="low" size="m" onClick={() => setEditingField(null)}>Cancel</Button>
                <Button
                  attention="high"
                  size="m"
                  onClick={() => { if (editingField) handleSaveField(editingField); }}
                >
                  Save
                </Button>
              </div>
            </DecorationProvider>
          </DialogPortal>
        </Dialog>

        {/* Tone Profile */}
        <FoundationCard title="Tone profile" description="Defines the default emotional register for all AI responses. Each dimension independently controls an aspect of the voice.">
          <div className={styles.sliderGrid}>
            {(Object.entries(toneValues) as [ToneKey, number][]).map(([key, value]) => (
              <SliderControl
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                value={value}
                min={0}
                max={100}
                step={1}
                description={TONE_DESCRIPTIONS[key]}
                onChange={(val) => handleToneChange(key, val)}
                showValue
              />
            ))}
          </div>
        </FoundationCard>

        {/* Verbosity */}
        <FoundationCard title="Response length" description="Controls how concise or detailed conversational responses should be. Does not affect templated content.">
          <SliderControl
            label="Verbosity"
            value={localVerbosity ?? 50}
            min={0}
            max={100}
            step={1}
            description="Ultra-concise (0) to Thorough (100)"
            onChange={handleVerbosityChange}
            showValue
          />
        </FoundationCard>

        {/* Emoji */}
        <FoundationCard title="Emoji" description="Controls emoji usage frequency and limits in AI responses.">
          <div className={styles.sliderGrid}>
            <div className={styles.propertyRow}>
              <span className={styles.propertyLabel}>Emojis enabled</span>
              <Switch
                checked={voiceConfig.communicationStyle.useEmojis}
                onCheckedChange={(checked) => {
                  if (brandId) updateEmojiSettings({ brandId, useEmojis: checked });
                }}
                size="m"
              />
            </div>
            {voiceConfig.communicationStyle.useEmojis && (
              <>
                <SliderControl
                  label="Frequency"
                  value={localEmojiFreq ?? 50}
                  min={0}
                  max={100}
                  step={1}
                  description="Rare (0) to Frequent (100)"
                  onChange={handleEmojiFreqChange}
                  showValue
                />
                <SliderControl
                  label="Max per response"
                  value={localMaxEmojis ?? 1}
                  min={1}
                  max={3}
                  step={1}
                  description="Maximum emoji count in a single response"
                  onChange={handleMaxEmojisChange}
                  showValue
                />
              </>
            )}
          </div>
        </FoundationCard>

        {/* Language */}
        <FoundationCard title="Language" description="Language conventions, regional support, and formatting rules.">
          <div className={styles.propertyList}>
            <div className={styles.propertyRow}>
              <span className={styles.propertyLabel}>Primary language</span>
              <span className={styles.propertyValue}>{voiceConfig.language.primary}</span>
            </div>
            <div className={styles.propertyRow}>
              <span className={styles.propertyLabel}>Spelling convention</span>
              <span className={styles.propertyValue}>{voiceConfig.language.spellingConvention}</span>
            </div>
            <div className={styles.propertyRow}>
              <span className={styles.propertyLabel}>Number format</span>
              <span className={styles.propertyValue}>{voiceConfig.language.numberFormat}</span>
            </div>
            <div className={styles.propertyRow}>
              <span className={styles.propertyLabel}>Hindi support</span>
              <Switch
                checked={voiceConfig.language.hindiSupport}
                onCheckedChange={(checked) => handleToggleLanguage('hindiSupport', checked)}
                size="m"
              />
            </div>
            <div className={styles.propertyRow}>
              <span className={styles.propertyLabel}>Hinglish support</span>
              <Switch
                checked={voiceConfig.language.hinglishSupport}
                onCheckedChange={(checked) => handleToggleLanguage('hinglishSupport', checked)}
                size="m"
              />
            </div>
          </div>
        </FoundationCard>

        {/* Forbidden Words */}
        <FoundationCard
          title="Forbidden words"
          description="Words and phrases that must never appear in AI responses. The tone guard checks every response against this list."
          actions={
            <Badge attention="medium" appearance="neutral" size="s">
              {voiceConfig.communicationStyle.forbiddenWords.length} terms
            </Badge>
          }
        >
          <div className={styles.chipGrid}>
            {voiceConfig.communicationStyle.forbiddenWords.map((word) => (
              <span key={word} className={styles.chip}>
                {word}
                <IconButton
                  icon={<X size={12} />}
                  attention="low"
                  size="s"
                  onPress={() => handleRemoveForbiddenWord(word)}
                  aria-label={`Remove ${word}`}
                  className={styles.chipRemove}
                />
              </span>
            ))}
          </div>
          <div className={styles.addRow}>
            <Input
              value={newForbiddenWord}
              onChange={(value) => setNewForbiddenWord(value)}
              placeholder="Add a word or phrase..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddForbiddenWord()}
              size="medium"
              className={styles.neutralInput}
            />
            <Button attention="medium" size="s" onClick={handleAddForbiddenWord} disabled={!newForbiddenWord.trim()}>
              Add
            </Button>
          </div>
        </FoundationCard>

        {/* Emotional Intelligence */}
        <FoundationCard
          title="Emotional intelligence"
          description="Emotion detection framework and sensitive topic handling."
          collapsible
          defaultCollapsed
        >
          <div className={styles.propertyList}>
            <div className={styles.propertyRow}>
              <span className={styles.propertyLabel}>Navarasa (9-state framework)</span>
              <Badge attention="medium" appearance={voiceConfig.emotionalIntelligence.navarasa ? 'positive' : 'informative'} size="m">
                {voiceConfig.emotionalIntelligence.navarasa ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className={styles.propertyRow}>
              <span className={styles.propertyLabel}>Sensitive topic handling</span>
              <span className={styles.propertyValue}>{voiceConfig.emotionalIntelligence.sensitiveTopicHandling}</span>
            </div>
          </div>
        </FoundationCard>

        {/* Publication */}
        <FoundationCard
          title="Publication"
          description="Publish this voice configuration as an immutable snapshot. Four surface-aware prompts are compiled in one publication — conversational (chat/voice), copy (marketing body), microcopy (buttons/labels), and editorial (long-form). External products consume them via the public SDK at /api/voice/sdk/{brand-slug}."
          actions={
            latestPublication ? (
              <Badge attention="medium" appearance="positive" size="s">
                Latest v{latestPublication.version}
              </Badge>
            ) : (
              <Badge attention="medium" appearance="neutral" size="s">
                Never published
              </Badge>
            )
          }
        >
          <div className={styles.propertyList}>
            {latestPublication && (
              <div className={styles.propertyRow}>
                <span className={styles.propertyLabel}>Last published</span>
                <span className={styles.propertyValue}>
                  v{latestPublication.version} · {new Date(latestPublication.publishedAt).toLocaleString()}
                </span>
              </div>
            )}
            <div className={styles.propertyRow}>
              <span className={styles.propertyLabel}>New version</span>
              <Input
                value={publishVersion}
                onChange={(value) => setPublishVersion(value)}
                placeholder="1.0.0"
                size="medium"
                className={styles.neutralInput}
              />
            </div>
            {publishError && (
              <div className={styles.propertyRow}>
                <span className={styles.propertyLabel}>Error</span>
                <Badge attention="medium" appearance="negative" size="s">
                  {publishError}
                </Badge>
              </div>
            )}
            {publishedVersion && !publishError && (
              <div className={styles.propertyRow}>
                <span className={styles.propertyLabel}>Status</span>
                <Badge attention="medium" appearance="positive" size="s">
                  Published v{publishedVersion}
                </Badge>
              </div>
            )}
          </div>
          <div className={styles.dialogActions}>
            <Button
              attention="high"
              size="m"
              onClick={handlePublish}
              disabled={
                publishing ||
                !voiceConfig ||
                !resolvedRules ||
                !voiceSkillsList ||
                !publishVersion.trim()
              }
            >
              {publishing ? 'Publishing…' : `Publish v${publishVersion}`}
            </Button>
          </div>
        </FoundationCard>

        {/* Status */}
        <FoundationCard title="Status" collapsible defaultCollapsed>
          <div className={styles.propertyList}>
            <div className={styles.propertyRow}>
              <span className={styles.propertyLabel}>Active</span>
              <Badge attention="medium" appearance={voiceConfig.isActive ? 'positive' : 'negative'} size="m">
                {voiceConfig.isActive ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className={styles.propertyRow}>
              <span className={styles.propertyLabel}>Version</span>
              <span className={styles.propertyValue}>{voiceConfig.version}</span>
            </div>
          </div>
        </FoundationCard>
      </div>
    </div>
  );
}
