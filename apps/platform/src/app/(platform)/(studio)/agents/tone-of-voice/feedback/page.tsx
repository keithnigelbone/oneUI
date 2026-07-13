/**
 * agents/voice/feedback/page.tsx
 *
 * Voice Feedback — uses FoundationCard for each item, proper spacing,
 * property rows matching overview page style, bigger components.
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import { Id } from '@oneui/convex/_generated/dataModel';
import { Button } from '@oneui/ui/components/Button';
import { Badge } from '@oneui/ui/components/Badge';
import { ToggleGroup } from '@oneui/ui/components/ToggleGroup';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import { usePlatformContext } from '@/contexts/PlatformContext';
import foundationStyles from '../../../foundations/foundation.module.css';
import styles from '../voice.module.css';

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'reviewed', label: 'Reviewed' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'dismissed', label: 'Dismissed' },
];

const SOURCE_LABELS: Record<string, string> = {
  playground: 'Playground',
  evaluation: 'Evaluation',
  sdk: 'SDK',
  'tone-guard': 'Tone guard',
};

export default function VoiceFeedbackPage() {
  const { currentBrand } = usePlatformContext();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;

  const allFeedback = useQuery(api.voiceFeedback.listByBrand, brandId ? { brandId } : 'skip');
  const stats = useQuery(api.voiceFeedback.getStats, brandId ? { brandId } : 'skip');
  const resolve = useMutation(api.voiceFeedback.resolve);

  const [statusFilter, setStatusFilter] = useState('all');

  const filteredFeedback = allFeedback?.filter(
    (f) => statusFilter === 'all' || f.status === statusFilter
  );

  if (!brandId) {
    return (
      <div className={foundationStyles.page}>
        <p className={foundationStyles.description}>Select a brand to review feedback.</p>
      </div>
    );
  }

  return (
    <div className={foundationStyles.page}>
      <div className={foundationStyles.header}>
        <h1 className={foundationStyles.title}>Feedback</h1>
        <p className={foundationStyles.description}>
          Review flagged AI responses and triage them to continuously improve voice rules.
        </p>
      </div>

      {/* Stats + filter row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--Spacing-4)' }}>
        {stats && (
          <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', alignItems: 'center' }}>
            <Badge attention="medium" appearance="negative" size="m">{stats.open} open</Badge>
            <Badge attention="medium" appearance="neutral" size="m">{stats.reviewed} reviewed</Badge>
            <Badge attention="medium" appearance="positive" size="m">{stats.resolved} resolved</Badge>
            <Badge attention="medium" appearance="neutral" size="m">{stats.dismissed} dismissed</Badge>
          </div>
        )}
        <ToggleGroup value={statusFilter} onValueChange={(val) => setStatusFilter(val as string)} variant="subtool" size="small">
          {STATUS_FILTERS.map((filter) => (
            <ToggleGroup.Item key={filter.id} value={filter.id}>{filter.label}</ToggleGroup.Item>
          ))}
        </ToggleGroup>
      </div>

      <div className={foundationStyles.content}>
        {(!filteredFeedback || filteredFeedback.length === 0) ? (
          <FoundationCard
            title="No feedback"
            description={`No feedback items${statusFilter !== 'all' ? ` with status "${statusFilter}"` : ''}.`}
          >
            <p className={styles.placeholder}>
              Feedback is collected from the playground, evaluation runs, SDK webhook, and tone guard auto-corrections.
            </p>
          </FoundationCard>
        ) : (
          filteredFeedback.map((item) => (
            <FoundationCard
              key={item._id}
              title={`${item.rating === 'negative' ? '👎' : '👍'} ${SOURCE_LABELS[item.source] || item.source}${item.channel ? ` — ${item.channel}` : ''}`}
              actions={
                <Badge
                  attention="medium"
                  appearance={item.status === 'open' ? 'negative' : item.status === 'resolved' ? 'positive' : 'neutral'}
                  size="m"
                >
                  {item.status}
                </Badge>
              }
            >
              {/* User message */}
              <div className={styles.propertyList}>
                <div className={styles.propertyRow}>
                  <span className={styles.propertyLabel}>User message</span>
                </div>
              </div>
              <div style={{ padding: 'var(--Spacing-4)', backgroundColor: 'var(--Primary-Subtle)', borderRadius: 'var(--Shape-4)', marginBottom: 'var(--Spacing-4)' }}>
                <p style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-High)', margin: 0 }}>
                  {item.userMessage}
                </p>
              </div>

              {/* AI response */}
              <div className={styles.propertyList}>
                <div className={styles.propertyRow}>
                  <span className={styles.propertyLabel}>AI response</span>
                </div>
              </div>
              <div style={{ padding: 'var(--Spacing-4)', backgroundColor: 'var(--Surface-Subtle)', borderRadius: 'var(--Shape-4)', marginBottom: 'var(--Spacing-4)' }}>
                <p style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-High)', margin: 0 }}>
                  {item.aiResponse}
                </p>
              </div>

              {/* Annotation */}
              {item.annotation && (
                <div className={styles.propertyList}>
                  <div className={styles.propertyRow}>
                    <span className={styles.propertyLabel}>Note</span>
                    <span className={styles.propertyValue}>{item.annotation}</span>
                  </div>
                </div>
              )}

              {/* Actions for open items */}
              {item.status === 'open' && (
                <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', marginTop: 'var(--Spacing-4-5)' }}>
                  <Button
                    attention="high"
                    size="m"
                    onClick={() => resolve({
                      id: item._id as Id<'voiceFeedback'>,
                      resolution: {
                        action: 'rule-updated',
                        details: 'Rule updated based on feedback',
                      },
                    })}
                  >
                    Update rule
                  </Button>
                  <Button
                    attention="medium"
                    size="m"
                    onClick={() => resolve({
                      id: item._id as Id<'voiceFeedback'>,
                      resolution: {
                        action: 'scenario-added',
                        details: 'Added as eval scenario',
                      },
                    })}
                  >
                    Add scenario
                  </Button>
                  <Button
                    attention="low"
                    size="m"
                    onClick={() => resolve({
                      id: item._id as Id<'voiceFeedback'>,
                      resolution: {
                        action: 'dismissed',
                      },
                    })}
                  >
                    Dismiss
                  </Button>
                </div>
              )}

              {/* Resolution */}
              {item.resolution && (
                <div style={{ marginTop: 'var(--Spacing-4)' }}>
                  <Badge attention="medium" appearance="positive" size="m">
                    Resolved: {item.resolution.action}{item.resolution.details ? ` — ${item.resolution.details}` : ''}
                  </Badge>
                </div>
              )}
            </FoundationCard>
          ))
        )}
      </div>
    </div>
  );
}
