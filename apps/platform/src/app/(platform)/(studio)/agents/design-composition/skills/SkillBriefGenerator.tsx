/**
 * SkillBriefGenerator.tsx
 *
 * Brief-driven, AI-assisted skill author. The designer types a single
 * natural-language brief, the model returns a complete CompositionSkill
 * draft, and every field renders as its own card with a per-field
 * Regenerate button + free-text editor. Save commits via the standard
 * `compositionSkills.create` Convex mutation.
 *
 * Wired against:
 *   POST /api/composition/skills/generate-from-brief
 *   POST /api/composition/skills/regenerate-field
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { Button } from '@oneui/ui/components/Button';
import { Badge } from '@oneui/ui/components/Badge';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import type { SkillDraftFields } from '@/app/api/composition/skills/generate-from-brief/route';
import s from './SkillBriefGenerator.module.css';

type SkillDraft = SkillDraftFields;

type RegenerableField =
  | 'name'
  | 'description'
  | 'category'
  | 'applicableContexts'
  | 'archetype'
  | 'attentionPattern'
  | 'dosDonts'
  | 'systemPromptTemplate'
  | 'examplePrompt';

interface SkillBriefGeneratorProps {
  brandId: Id<'brands'>;
  brandName?: string;
  vertical?: string;
  onSaved: (skillId: string) => void;
  onCancel: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────

const CONTEXT_OPTIONS = [
  { value: 'mobile-app', label: 'Mobile' },
  { value: 'web-app', label: 'Web' },
  { value: 'marketing-page', label: 'Marketing' },
  { value: 'social-post', label: 'Social' },
  { value: 'print', label: 'Print' },
  { value: 'outdoor', label: 'Outdoor' },
] as const;

const CATEGORY_OPTIONS = [
  { value: 'screen', label: 'Screen archetype' },
  { value: 'pattern', label: 'Composition pattern' },
  { value: 'flow', label: 'Multi-screen flow' },
] as const;

const FIELD_HINTS: Record<RegenerableField, string> = {
  name: '2–6 words, Title Case.',
  description: '1–2 sentences summarising what this skill produces.',
  category: 'Screen = full layout. Pattern = micro-block. Flow = multi-step.',
  applicableContexts: 'Where this skill is allowed to fire.',
  archetype: 'Short slug (e.g. "product-detail"). Optional but improves retrieval.',
  attentionPattern: 'One sentence describing the visual hierarchy.',
  dosDonts: '4–6 short bullets covering surface, typography, attention.',
  systemPromptTemplate:
    'The full instruction the agent receives. Uses {brand} placeholder, references Surface modes, var(--Token) syntax.',
  examplePrompt: 'A sample user prompt this skill would handle.',
};

const EXAMPLE_BRIEFS = [
  'Product detail screen for an e-commerce mobile app with image gallery, price, reviews, and a sticky add-to-cart bar.',
  'Multi-step KYC onboarding flow with progress indicator, ID upload, and a confirmation step.',
  'Settings list with grouped sections, switches, and a destructive sign-out action at the bottom.',
];

// ─── Component ────────────────────────────────────────────────────────────

export function SkillBriefGenerator({
  brandId,
  brandName,
  vertical,
  onSaved,
  onCancel,
}: SkillBriefGeneratorProps) {
  const createSkill = useMutation(api.compositionSkills.create);

  const [brief, setBrief] = useState('');
  const [draft, setDraft] = useState<SkillDraft | null>(null);

  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [regeneratingField, setRegeneratingField] = useState<RegenerableField | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Aborts in-flight generation/regeneration if the component unmounts
  // (the user clicks Cancel/Discard before the LLM call resolves).
  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // ─── Generate from brief ───────────────────────────────────────────────

  const handleGenerate = useCallback(async () => {
    if (brief.trim().length < 10) {
      setError('Please write a brief of at least 10 characters.');
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setGenerating(true);
    setError(null);
    setSaveError(null);
    try {
      const res = await fetch('/api/composition/skills/generate-from-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId, brandName, vertical, brief: brief.trim() }),
        signal: controller.signal,
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? `Generation failed (${res.status}).`);
        return;
      }
      setDraft(json.draft as SkillDraft);
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Generation failed.');
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setGenerating(false);
    }
  }, [brief, brandId, brandName, vertical]);

  // ─── Regenerate one field ──────────────────────────────────────────────

  const handleRegenerateField = useCallback(
    async (field: RegenerableField) => {
      if (!draft) return;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setRegeneratingField(field);
      setError(null);
      try {
        const res = await fetch('/api/composition/skills/regenerate-field', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brief: brief.trim(),
            field,
            draft,
            brandName,
            vertical,
          }),
          signal: controller.signal,
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json?.error ?? `Regenerate failed (${res.status}).`);
          return;
        }
        setDraft((prev) =>
          prev ? ({ ...prev, [field]: json.value } as SkillDraft) : prev,
        );
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Regenerate failed.');
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setRegeneratingField(null);
      }
    },
    [brief, draft, brandName, vertical],
  );

  // ─── Save to Convex ────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!draft) return;
    setSaving(true);
    setSaveError(null);
    try {
      const examples = draft.examplePrompt
        ? [{ prompt: draft.examplePrompt, expectedAST: '' }]
        : [];
      await createSkill({
        brandId,
        skillId: draft.skillId,
        name: draft.name,
        description: draft.description,
        category: draft.category,
        systemPromptTemplate: draft.systemPromptTemplate,
        applicableContexts: draft.applicableContexts,
        archetype: draft.archetype,
        vertical: draft.vertical,
        attentionPattern: draft.attentionPattern,
        dosDonts: draft.dosDonts,
        examples,
      });
      onSaved(draft.skillId);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }, [createSkill, draft, brandId, onSaved]);

  // ─── Field updaters ────────────────────────────────────────────────────

  const updateField = useCallback(
    <K extends keyof SkillDraft>(field: K, value: SkillDraft[K]) => {
      setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
    },
    [],
  );

  const toggleContext = useCallback((value: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const has = prev.applicableContexts.includes(value);
      const next = has
        ? prev.applicableContexts.filter((c) => c !== value)
        : [...prev.applicableContexts, value];
      return { ...prev, applicableContexts: next };
    });
  }, []);

  const updateBullet = useCallback((idx: number, value: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = [...prev.dosDonts];
      next[idx] = value;
      return { ...prev, dosDonts: next };
    });
  }, []);

  const removeBullet = useCallback((idx: number) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, dosDonts: prev.dosDonts.filter((_, i) => i !== idx) };
    });
  }, []);

  const addBullet = useCallback(() => {
    setDraft((prev) => (prev ? { ...prev, dosDonts: [...prev.dosDonts, ''] } : prev));
  }, []);

  // ─── Render: brief input phase ────────────────────────────────────────

  if (!draft) {
    return (
      <FoundationCard
        title="Generate skill with AI"
        description="Describe the screen, pattern, or flow you want to add. Claude drafts a complete skill — you review and edit each field before saving."
      >
        <div className={s.container}>
          <div className={s.briefBlock}>
            <label htmlFor="skill-brief" className={s.briefLabel}>
              Brief
            </label>
            <textarea
              id="skill-brief"
              className={s.briefTextarea}
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder={EXAMPLE_BRIEFS[0]}
              rows={4}
              disabled={generating}
            />
            <p className={s.briefHint}>
              Tip: include the screen type, key components, and any vertical hint
              (e.g. e-commerce, finance).
            </p>
            <div className={s.pillRow}>
              {EXAMPLE_BRIEFS.map((example) => (
                <button
                  key={example}
                  type="button"
                  className={s.pill}
                  onClick={() => setBrief(example)}
                  disabled={generating}
                >
                  Try: {example.split(' ').slice(0, 4).join(' ')}…
                </button>
              ))}
            </div>
          </div>

          {error && <div className={s.errorBanner}>{error}</div>}

          <div className={s.briefActions}>
            <Button
              attention="high"
              appearance="primary"
              size="s"
              onPress={handleGenerate}
              disabled={generating || brief.trim().length < 10}
            >
              {generating ? 'Generating…' : 'Generate skill'}
            </Button>
            <Button
              attention="low"
              appearance="neutral"
              size="s"
              onPress={onCancel}
              disabled={generating}
            >
              Cancel
            </Button>
          </div>
        </div>
      </FoundationCard>
    );
  }

  // ─── Render: field-by-field draft ─────────────────────────────────────

  const isBusy = generating || saving || regeneratingField !== null;

  return (
    <FoundationCard
      title={`Draft: ${draft.name || 'New skill'}`}
      description="Each field below was generated from your brief. Edit anything inline, or click Regenerate on a field to ask Claude for a new version."
    >
      <div className={s.container}>
        <div className={s.metaRow}>
          <Badge attention="medium" appearance="informative" size="s">
            ID: {draft.skillId}
          </Badge>
          <Badge attention="medium" appearance="neutral" size="s">
            Generated by AI
          </Badge>
          <span>Brief: {brief.slice(0, 80)}{brief.length > 80 ? '…' : ''}</span>
        </div>

        <div className={s.fieldStack}>
          {/* Name */}
          <FieldCard
            label="Name"
            hint={FIELD_HINTS.name}
            field="name"
            regenerating={regeneratingField === 'name'}
            onRegenerate={handleRegenerateField}
            disabled={isBusy}
          >
            <input
              type="text"
              className={s.input}
              value={draft.name}
              onChange={(e) => updateField('name', e.target.value)}
              disabled={isBusy}
            />
          </FieldCard>

          {/* Description */}
          <FieldCard
            label="Description"
            hint={FIELD_HINTS.description}
            field="description"
            regenerating={regeneratingField === 'description'}
            onRegenerate={handleRegenerateField}
            disabled={isBusy}
          >
            <textarea
              className={`${s.textarea} ${s.textareaProse}`}
              value={draft.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={2}
              disabled={isBusy}
            />
          </FieldCard>

          {/* Category */}
          <FieldCard
            label="Category"
            hint={FIELD_HINTS.category}
            field="category"
            regenerating={regeneratingField === 'category'}
            onRegenerate={handleRegenerateField}
            disabled={isBusy}
          >
            <select
              className={s.select}
              value={draft.category}
              onChange={(e) => updateField('category', e.target.value as SkillDraft['category'])}
              disabled={isBusy}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </FieldCard>

          {/* Applicable contexts */}
          <FieldCard
            label="Applicable contexts"
            hint={FIELD_HINTS.applicableContexts}
            field="applicableContexts"
            regenerating={regeneratingField === 'applicableContexts'}
            onRegenerate={handleRegenerateField}
            disabled={isBusy}
          >
            <div className={s.pillRow}>
              {CONTEXT_OPTIONS.map((opt) => {
                const active = draft.applicableContexts.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={s.pill}
                    data-active={active ? 'true' : undefined}
                    onClick={() => toggleContext(opt.value)}
                    disabled={isBusy}
                    aria-pressed={active}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </FieldCard>

          {/* Archetype */}
          <FieldCard
            label="Archetype"
            hint={FIELD_HINTS.archetype}
            field="archetype"
            regenerating={regeneratingField === 'archetype'}
            onRegenerate={handleRegenerateField}
            disabled={isBusy}
          >
            <input
              type="text"
              className={s.input}
              value={draft.archetype ?? ''}
              onChange={(e) => updateField('archetype', e.target.value || undefined)}
              placeholder="e.g. product-detail"
              disabled={isBusy}
            />
          </FieldCard>

          {/* Attention pattern */}
          <FieldCard
            label="Attention pattern"
            hint={FIELD_HINTS.attentionPattern}
            field="attentionPattern"
            regenerating={regeneratingField === 'attentionPattern'}
            onRegenerate={handleRegenerateField}
            disabled={isBusy}
          >
            <textarea
              className={`${s.textarea} ${s.textareaProse}`}
              value={draft.attentionPattern ?? ''}
              onChange={(e) => updateField('attentionPattern', e.target.value || undefined)}
              rows={2}
              disabled={isBusy}
            />
          </FieldCard>

          {/* Dos & Don'ts */}
          <FieldCard
            label="Do's & Don'ts"
            hint={FIELD_HINTS.dosDonts}
            field="dosDonts"
            regenerating={regeneratingField === 'dosDonts'}
            onRegenerate={handleRegenerateField}
            disabled={isBusy}
          >
            <div className={s.bulletList}>
              {draft.dosDonts.map((bullet, idx) => (
                <div key={idx} className={s.bulletRow}>
                  <input
                    type="text"
                    className={`${s.input} ${s.bulletInput}`}
                    value={bullet}
                    onChange={(e) => updateBullet(idx, e.target.value)}
                    placeholder='Do: ... | Don&apos;t: ...'
                    disabled={isBusy}
                  />
                  <Button
                    attention="low"
                    appearance="neutral"
                    size="xs"
                    onPress={() => removeBullet(idx)}
                    disabled={isBusy}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                attention="low"
                appearance="neutral"
                size="xs"
                onPress={addBullet}
                disabled={isBusy}
              >
                + Add bullet
              </Button>
            </div>
          </FieldCard>

          {/* System prompt template */}
          <FieldCard
            label="System prompt template"
            hint={FIELD_HINTS.systemPromptTemplate}
            field="systemPromptTemplate"
            regenerating={regeneratingField === 'systemPromptTemplate'}
            onRegenerate={handleRegenerateField}
            disabled={isBusy}
          >
            <textarea
              className={s.textarea}
              value={draft.systemPromptTemplate}
              onChange={(e) => updateField('systemPromptTemplate', e.target.value)}
              rows={10}
              disabled={isBusy}
            />
          </FieldCard>

          {/* Example prompt */}
          <FieldCard
            label="Example prompt"
            hint={FIELD_HINTS.examplePrompt}
            field="examplePrompt"
            regenerating={regeneratingField === 'examplePrompt'}
            onRegenerate={handleRegenerateField}
            disabled={isBusy}
          >
            <input
              type="text"
              className={s.input}
              value={draft.examplePrompt ?? ''}
              onChange={(e) => updateField('examplePrompt', e.target.value || undefined)}
              placeholder="e.g. show me a product detail page with reviews"
              disabled={isBusy}
            />
          </FieldCard>
        </div>

        {error && <div className={s.errorBanner}>{error}</div>}
        {saveError && <div className={s.errorBanner}>Save failed: {saveError}</div>}

        <div className={s.footerActions}>
          <Button
            attention="high"
            appearance="primary"
            size="s"
            onPress={handleSave}
            disabled={
              isBusy ||
              draft.name.trim().length === 0 ||
              draft.systemPromptTemplate.trim().length === 0 ||
              draft.applicableContexts.length === 0
            }
          >
            {saving ? 'Saving…' : 'Save skill'}
          </Button>
          <Button
            attention="low"
            appearance="neutral"
            size="s"
            onPress={() => {
              setDraft(null);
              setError(null);
            }}
            disabled={isBusy}
          >
            Re-edit brief
          </Button>
          <div className={s.footerSpacer} />
          <Button
            attention="low"
            appearance="neutral"
            size="s"
            onPress={onCancel}
            disabled={isBusy}
          >
            Discard
          </Button>
        </div>
      </div>
    </FoundationCard>
  );
}

// ─── FieldCard helper ─────────────────────────────────────────────────────

interface FieldCardProps {
  label: string;
  hint: string;
  field: RegenerableField;
  regenerating: boolean;
  disabled: boolean;
  onRegenerate: (field: RegenerableField) => void;
  children: React.ReactNode;
}

function FieldCard({
  label,
  hint,
  field,
  regenerating,
  disabled,
  onRegenerate,
  children,
}: FieldCardProps) {
  return (
    <div className={s.fieldCard}>
      <div className={s.fieldHeader}>
        <div className={s.fieldLabelGroup}>
          <span className={s.fieldLabel}>{label}</span>
          <span className={s.fieldHint}>{hint}</span>
        </div>
        <div className={s.fieldActions}>
          {regenerating && <span className={s.regenSpinner} aria-hidden="true" />}
          <Button
            attention="low"
            appearance="neutral"
            size="xs"
            onPress={() => onRegenerate(field)}
            disabled={disabled}
            aria-label={`Regenerate ${label} with AI`}
          >
            {regenerating ? '…' : 'Regenerate'}
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}
