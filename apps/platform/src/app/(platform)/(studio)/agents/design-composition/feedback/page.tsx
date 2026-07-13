/**
 * agents/design-composition/feedback/page.tsx
 *
 * Composition Feedback Review — review designer submissions,
 * update status, view generated ASTs, resolve feedback.
 * Mirrors voice feedback page pattern.
 */

'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import { Id } from '@oneui/convex/_generated/dataModel';
import { Badge } from '@oneui/ui/components/Badge';
import { Button } from '@oneui/ui/components/Button';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import { usePlatformContext } from '@/contexts/PlatformContext';
import foundationStyles from '../../../foundations/foundation.module.css';
import styles from '../composition.module.css';

const STATUS_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'reviewed', label: 'Reviewed' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'dismissed', label: 'Dismissed' },
];

const STATUS_APPEARANCE: Record<string, string> = {
  open: 'informative',
  reviewed: 'warning',
  resolved: 'positive',
  dismissed: 'neutral',
};

export default function CompositionFeedbackPage() {
  const { currentBrand } = usePlatformContext();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;

  const feedback = useQuery(
    api.compositionFeedback.list,
    brandId ? { brandId } : 'skip'
  );
  const stats = useQuery(
    api.compositionFeedback.getStats,
    brandId ? { brandId } : 'skip'
  );
  const updateStatus = useMutation(api.compositionFeedback.updateStatus);
  const createScenario = useMutation(api.compositionEval.createScenario);

  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Track which feedback rows are mid-promotion so the button shows progress
  // and a quick double-tap can't insert duplicate scenario rows.
  const [promotingId, setPromotingId] = useState<string | null>(null);

  const handleStatusChange = useCallback(
    async (id: string, status: string) => {
      await updateStatus({
        id: id as Id<'compositionFeedback'>,
        status: status as 'open' | 'reviewed' | 'resolved' | 'dismissed',
      });
    },
    [updateStatus],
  );

  const handleResolve = useCallback(
    async (id: string, action: string) => {
      await updateStatus({
        id: id as Id<'compositionFeedback'>,
        status: 'resolved',
        resolution: {
          action: action as
            | 'rule-updated'
            | 'scenario-added'
            | 'skill-added'
            | 'reference-added'
            | 'dismissed',
        },
      });
    },
    [updateStatus],
  );

  /**
   * Promote a feedback row into a brand-scoped evaluation scenario, then
   * mark the feedback as resolved with action="scenario-added".
   *
   * Defaults are intentionally minimal — title from prompt, generic
   * category, no expected/forbidden behaviours yet — so designers can
   * promote in one click and refine on the Evaluation page later.
   */
  const handlePromoteToScenario = useCallback(
    async (item: {
      _id: string;
      prompt: string;
      context: string;
      generatedAST?: string;
    }) => {
      if (!brandId) {        return;
      }
      setPromotingId(item._id);      try {
        const title =
          item.prompt.length > 60 ? `${item.prompt.slice(0, 60)}…` : item.prompt;
        const insertedId = await createScenario({
          brandId,
          // Stable per-feedback id so re-promoting the same row is idempotent
          // at the application layer (createScenario itself doesn't dedupe).
          scenarioId: `feedback_${item._id}`,
          category: 'general',
          title: title || 'Untitled scenario',
          description: 'Promoted from playground feedback. Edit to add expected behaviours.',
          prompt: item.prompt,
          context: item.context,
          expectedBehaviors: [],
          forbiddenBehaviors: [],
          rubric: {},
          referenceAST: item.generatedAST,
        });
        await updateStatus({
          id: item._id as Id<'compositionFeedback'>,
          status: 'resolved',
          resolution: { action: 'scenario-added' },
        });      } catch (err) {
        console.error('[FeedbackPage] promote-to-scenario failed:', err);        alert(`Could not create scenario: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setPromotingId(null);
      }
    },
    [brandId, createScenario, updateStatus],
  );

  const filteredFeedback = (feedback ?? []).filter(
    (f: any) => statusFilter === 'all' || f.status === statusFilter
  );

  if (!brandId) {
    return (
      <div className={foundationStyles.page}>
        <p className={foundationStyles.description}>Select a brand to review feedback.</p>
      </div>
    );
  }

  return (
    <div className={foundationStyles.page} style={{ paddingBottom: 'var(--Spacing-7)' }}>
      <div className={foundationStyles.header}>
        <h1 className={foundationStyles.title}>Feedback</h1>
        <p className={foundationStyles.description}>
          Review designer feedback on generated compositions. Resolve feedback by updating
          rules, adding evaluation scenarios, or creating new skills.
          {currentBrand && (
            <span className={foundationStyles.brandIndicator}>
              {' '}Reviewing for <strong>{currentBrand.name}</strong>
            </span>
          )}
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', alignItems: 'center' }}>
          <Badge attention="medium" appearance="neutral" size="m">{stats.total} total</Badge>
          <Badge attention="medium" appearance="positive" size="m">{stats.positive} positive</Badge>
          <Badge attention="medium" appearance="negative" size="m">{stats.negative} negative</Badge>
          <Badge attention="medium" appearance="informative" size="m">{stats.open} open</Badge>
        </div>
      )}

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 'var(--Spacing-2)', flexWrap: 'wrap' }}>
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={styles.contextChip}
            data-active={statusFilter === opt.id ? 'true' : undefined}
            onClick={() => setStatusFilter(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className={foundationStyles.content}>
        {filteredFeedback.length === 0 && (
          <FoundationCard
            title="No feedback yet"
            description="Feedback is submitted from the Playground when designers rate generated compositions. Positive and negative ratings appear here for review."
          >
            <Button attention="medium" appearance="primary" size="s" onPress={() => {}}>
              Go to Playground
            </Button>
          </FoundationCard>
        )}

        {filteredFeedback.map((item: any) => {
          const isExpanded = expandedId === item._id;
          const date = new Date(item.createdAt).toLocaleDateString();

          return (
            <FoundationCard
              key={item._id}
              title={item.prompt.length > 60 ? `${item.prompt.slice(0, 60)}...` : item.prompt}
              collapsible
              defaultCollapsed
              actions={
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-3-5)' }}>
                  <Badge
                    attention="medium"
                    appearance={item.rating === 'positive' ? 'positive' : 'negative'}
                    size="m"
                  >
                    {item.rating === 'positive' ? 'Good' : 'Bad'}
                  </Badge>
                  <Badge
                    attention="medium"
                    appearance={(STATUS_APPEARANCE[item.status] ?? 'neutral') as any}
                    size="m"
                  >
                    {item.status}
                  </Badge>
                  <span style={{ fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Low)', fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))' }}>
                    {date}
                  </span>
                </div>
              }
            >
              <div className={styles.propertyList}>
                <div className={styles.propertyRow}>
                  <span className={styles.propertyLabel}>Source</span>
                  <span className={styles.propertyValue}>{item.source}</span>
                </div>
                <div className={styles.propertyRow}>
                  <span className={styles.propertyLabel}>Context</span>
                  <span className={styles.propertyValue}>{item.context}</span>
                </div>
                <div className={styles.propertyRow}>
                  <span className={styles.propertyLabel}>Rating</span>
                  <Badge
                    attention="medium"
                    appearance={item.rating === 'positive' ? 'positive' : 'negative'}
                    size="m"
                  >
                    {item.rating}
                  </Badge>
                </div>
                {item.annotation && (
                  <div className={styles.propertyRow} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--Spacing-2)' }}>
                    <span className={styles.propertyLabel}>Annotation</span>
                    <span style={{ fontSize: 'var(--Body-S-FontSize)', lineHeight: 'var(--Body-S-LineHeight)', color: 'var(--Text-High)', fontFamily: 'var(--Body-FontFamily, var(--Typography-Font-Text))' }}>
                      {item.annotation}
                    </span>
                  </div>
                )}
                {item.validationResult && (
                  <div className={styles.propertyRow}>
                    <span className={styles.propertyLabel}>Validation score</span>
                    <Badge
                      attention="medium"
                      appearance={item.validationResult.valid ? 'positive' : 'negative'}
                      size="m"
                    >
                      {item.validationResult.score}/100
                    </Badge>
                  </div>
                )}
              </div>

              {/* Generated AST (collapsible) */}
              {item.generatedAST && (
                <div style={{ marginTop: 'var(--Spacing-4-5)', paddingTop: 'var(--Spacing-4-5)', borderTop: 'var(--Stroke-M) solid var(--Border-Subtle)' }}>
                  <div style={{ fontSize: 'var(--Label-S-FontSize)', fontWeight: 'var(--Label-FontWeight-Medium)', color: 'var(--Text-Medium)', marginBottom: 'var(--Spacing-3-5)', fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))' }}>
                    Generated AST
                  </div>
                  <pre style={{
                    fontFamily: 'var(--Typography-Font-Code, monospace)',
                    fontSize: 'var(--Code-S-FontSize, var(--Body-S-FontSize))',
                    lineHeight: 'var(--Code-S-LineHeight, var(--Body-S-LineHeight))',
                    color: 'var(--Text-High)',
                    background: 'var(--Neutral-Minimal, var(--Surface-Subtle))',
                    borderRadius: 'var(--Shape-4)',
                    padding: 'var(--Spacing-3-5) var(--Spacing-4)',
                    overflow: 'auto',
                    maxHeight: '300px',
                    whiteSpace: 'pre',
                    margin: 0,
                  }}>
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(item.generatedAST), null, 2);
                      } catch {
                        return item.generatedAST;
                      }
                    })()}
                  </pre>
                </div>
              )}

              {/* Resolution actions */}
              {item.status === 'open' && (
                <div style={{ display: 'flex', gap: 'var(--Spacing-3)', marginTop: 'var(--Spacing-4)', paddingTop: 'var(--Spacing-4)', borderTop: 'var(--Stroke-M) solid var(--Border-Subtle)' }}>
                  <Button attention="medium" appearance="primary" size="xs" onPress={() => handleResolve(item._id, 'rule-updated')}>
                    Rule Updated
                  </Button>
                  <Button
                    attention="medium"
                    appearance="primary"
                    size="xs"
                    disabled={promotingId === item._id}
                    onPress={() => handlePromoteToScenario(item)}
                  >
                    {promotingId === item._id ? 'Promoting…' : 'Promote to Scenario'}
                  </Button>
                  <Button attention="medium" appearance="primary" size="xs" onPress={() => handleResolve(item._id, 'skill-added')}>
                    Skill Added
                  </Button>
                  <Button attention="low" appearance="neutral" size="xs" onPress={() => handleStatusChange(item._id, 'dismissed')}>
                    Dismiss
                  </Button>
                </div>
              )}

              {item.resolution && (
                <div style={{ marginTop: 'var(--Spacing-4)', fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Low)', fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))' }}>
                  Resolved: {item.resolution.action}
                  {item.resolution.details && ` — ${item.resolution.details}`}
                </div>
              )}
            </FoundationCard>
          );
        })}
      </div>
    </div>
  );
}
