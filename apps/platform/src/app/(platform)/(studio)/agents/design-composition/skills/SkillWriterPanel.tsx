/**
 * SkillWriterPanel.tsx
 *
 * Inline AI-assisted skill editor mounted inside each skill card. Live
 * deterministic validation runs on every keystroke; "Draft with AI" generates
 * a fresh template; "Review with Claude" sends the draft for AI feedback.
 * Save is blocked while any error-level issue is present.
 */

'use client';

import { useCallback, useMemo, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Doc } from '@oneui/convex/_generated/dataModel';
import { Button } from '@oneui/ui/components/Button';
import { validateSkill } from '@oneui/shared/engine';
import styles from '../composition.module.css';
import { IssuePanel, type IssuePanelEntry } from './IssuePanel';

interface SkillWriterPanelProps {
  skill: Doc<'compositionSkills'>;
  brandName?: string;
  onCancel: () => void;
  onSaved: () => void;
}

interface ReviewIssue {
  level: 'error' | 'warning' | 'info';
  message: string;
}

interface ReviewResponse {
  feedback: string;
  issues: ReviewIssue[];
  suggestions: string[];
}

interface DraftResponse {
  systemPromptTemplate: string;
  description: string;
  attentionPattern?: string;
  dosDonts: string[];
}

export function SkillWriterPanel({ skill, brandName, onCancel, onSaved }: SkillWriterPanelProps) {
  const [draft, setDraft] = useState(skill.systemPromptTemplate);
  const [drafting, setDrafting] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reviewResult, setReviewResult] = useState<ReviewResponse | null>(null);
  const [opError, setOpError] = useState<string | null>(null);

  const updateSkill = useMutation(api.compositionSkills.update);

  const validation = useMemo(() => validateSkill(draft), [draft]);

  // Empty `draft` does NOT block generation — Draft's whole point is to fill
  // an empty template. We require only the metadata (name + category +
  // applicable contexts) so the prompt has something to work with.
  const draftReady = useMemo(
    () =>
      skill.name.trim().length > 0 &&
      Boolean(skill.category) &&
      (skill.applicableContexts ?? []).length > 0,
    [skill.name, skill.category, skill.applicableContexts],
  );

  const issuePanelIssues = useMemo<IssuePanelEntry[]>(() => {
    const validatorIssues: IssuePanelEntry[] = validation.issues.map((i) => ({
      level: i.level,
      code: i.code,
      message: i.message,
      source: 'validator',
    }));
    const reviewIssues: IssuePanelEntry[] = (reviewResult?.issues ?? []).map((i) => ({
      level: i.level,
      message: i.message,
      source: 'review',
    }));
    return [...validatorIssues, ...reviewIssues];
  }, [validation, reviewResult]);

  const handleDraft = useCallback(async () => {
    if (!draftReady || drafting) return;
    setDrafting(true);
    setOpError(null);
    try {
      const res = await fetch('/api/skills/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: skill.brandId,
          brandName,
          skillName: skill.name,
          category: skill.category,
          applicableContexts: skill.applicableContexts,
          vertical: skill.vertical,
          archetype: skill.archetype,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setOpError(json?.error ?? `Draft failed (${res.status}).`);
        return;
      }
      const draftRes = json as DraftResponse;
      setDraft(draftRes.systemPromptTemplate);
      setReviewResult(null);
    } catch (err) {
      setOpError(err instanceof Error ? err.message : 'Draft failed.');
    } finally {
      setDrafting(false);
    }
  }, [draftReady, drafting, skill, brandName]);

  const handleReview = useCallback(async () => {
    if (reviewing || draft.trim().length === 0) return;
    setReviewing(true);
    setOpError(null);
    try {
      const res = await fetch('/api/skills/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: skill.brandId,
          brandName,
          skillName: skill.name,
          category: skill.category,
          draft,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setOpError(json?.error ?? `Review failed (${res.status}).`);
        return;
      }
      setReviewResult(json as ReviewResponse);
    } catch (err) {
      setOpError(err instanceof Error ? err.message : 'Review failed.');
    } finally {
      setReviewing(false);
    }
  }, [reviewing, draft, skill, brandName]);

  const handleSave = useCallback(async () => {
    if (!validation.valid || saving) return;
    setSaving(true);
    setOpError(null);
    try {
      await updateSkill({
        id: skill._id,
        systemPromptTemplate: draft,
      });
      onSaved();
    } catch (err) {
      setOpError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }, [validation.valid, saving, updateSkill, skill._id, draft, onSaved]);

  const draftButtonTitle = !draftReady
    ? 'Set a name, category, and at least one applicable context before drafting.'
    : drafting
      ? 'Drafting…'
      : 'Generate a fresh template using the brand\'s top-rated skills as guidance.';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}>
      <div style={{ display: 'flex', gap: 'var(--Spacing-3)', flexWrap: 'wrap' }}>
        <span title={draftButtonTitle}>
          <Button
            attention="medium"
            appearance="primary"
            size="xs"
            onPress={handleDraft}
            disabled={!draftReady || drafting || saving}
          >
            {drafting ? 'Drafting…' : 'Draft with AI'}
          </Button>
        </span>
        <Button
          attention="low"
          appearance="neutral"
          size="xs"
          onPress={handleReview}
          disabled={reviewing || saving || draft.trim().length === 0}
        >
          {reviewing ? 'Reviewing…' : 'Review with Claude'}
        </Button>
      </div>

      <textarea
        className={styles.ruleTextarea}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={10}
        disabled={drafting || saving}
      />

      <IssuePanel issues={issuePanelIssues} />

      {reviewResult?.feedback && (
        <div
          style={{
            padding: 'var(--Spacing-3-5)',
            borderRadius: 'var(--Shape-3)',
            background: 'var(--Surface-Fill-Minimal, var(--Surface-Main))',
            fontSize: 'var(--Body-S-FontSize)',
            lineHeight: 'var(--Body-S-LineHeight)',
            color: 'var(--Text-Medium)',
            fontFamily: 'var(--Body-FontFamily, var(--Typography-Font-Text))',
          }}
        >
          <strong style={{ color: 'var(--Text-High)' }}>AI feedback: </strong>
          {reviewResult.feedback}
          {reviewResult.suggestions.length > 0 && (
            <ul style={{ marginTop: 'var(--Spacing-3)', paddingLeft: 'var(--Spacing-4-5)' }}>
              {reviewResult.suggestions.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {opError && (
        <div
          style={{
            padding: 'var(--Spacing-3-5)',
            borderRadius: 'var(--Shape-3)',
            background: 'var(--Negative-Subtle)',
            color: 'var(--Negative-TintedA11y)',
            fontSize: 'var(--Body-S-FontSize)',
            fontFamily: 'var(--Body-FontFamily, var(--Typography-Font-Text))',
          }}
        >
          {opError}
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--Spacing-3)' }}>
        <span title={!validation.valid ? 'Resolve error-level issues to save.' : undefined}>
          <Button
            attention="high"
            size="xs"
            onPress={handleSave}
            disabled={!validation.valid || saving}
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </span>
        <Button
          attention="low"
          appearance="neutral"
          size="xs"
          onPress={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
