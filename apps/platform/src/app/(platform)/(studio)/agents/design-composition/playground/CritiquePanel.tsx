/**
 * CritiquePanel.tsx
 *
 * Renders the on-demand 5-dimension review for the current composition.
 * Mirrors the voice eval result layout: dimension badges row + structured
 * Keep / Fix / Quick Wins sections. Hidden until the user clicks Review on
 * the canvas header; then sits beneath the canvas stage in the same column
 * as the retrieval trace.
 *
 * Visual quality bar — dimension badges use appearance coding (positive ≥ 8,
 * warning 5–7, negative < 5), Fix items are tagged by severity, every
 * section uses FoundationCard so it reads as part of the agent surface.
 */

'use client';

import { memo } from 'react';
import { Badge } from '@oneui/ui/components/Badge';
import { Button } from '@oneui/ui/components/Button';
import { Icon } from '@oneui/ui/icons/Icon';
import { IconButton } from '@oneui/ui/components/IconButton';
import type { SemanticIconName } from '@oneui/shared';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import {
  CRITIQUE_DIMENSION_LABELS,
  type CritiqueDimensionId,
  type CritiqueDimensionScore,
  type CritiqueFixItem,
  type CritiqueFixSeverity,
  type CritiqueKeepItem,
  type CritiqueQuickWin,
  type CritiqueResponse,
} from '@oneui/shared';
import s from './CritiquePanel.module.css';

export interface CritiquePanelProps {
  /** The critique result to render. `null` when no review has run yet. */
  critique: CritiqueResponse | null;
  loading: boolean;
  error: string | null;
  onDismiss: () => void;
  /** Re-run with the same composition. */
  onRetry?: () => void;
}

const SEVERITY_LABEL: Record<CritiqueFixSeverity, { label: string; appearance: 'negative' | 'warning' | 'informative'; icon: SemanticIconName }> = {
  critical: { label: 'Critical', appearance: 'negative', icon: 'warning' },
  important: { label: 'Important', appearance: 'warning', icon: 'info' },
  nice: { label: 'Nice to fix', appearance: 'informative', icon: 'edit' },
};

function dimensionAppearance(score: number): 'positive' | 'warning' | 'negative' {
  if (score >= 8) return 'positive';
  if (score >= 5) return 'warning';
  return 'negative';
}

function CritiquePanelInner({ critique, loading, error, onDismiss, onRetry }: CritiquePanelProps) {
  return (
    <FoundationCard
      title="Composition critique"
      description="Five-dimension review of the current composition."
      actions={
        <div className={s.headerActions}>
          {onRetry && !loading && (
            <IconButton
              icon={<Icon name="refresh" />}
              appearance="neutral"
              attention="low"
              size="s"
              aria-label="Re-run review"
              onPress={onRetry}
            />
          )}
          <IconButton
            icon={<Icon name="close" />}
            appearance="neutral"
            attention="low"
            size="s"
            aria-label="Dismiss critique"
            onPress={onDismiss}
          />
        </div>
      }
    >
      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={onRetry} />}
      {!loading && !error && !critique && <EmptyState />}
      {!loading && !error && critique && <ResultBody critique={critique} />}
    </FoundationCard>
  );
}

function LoadingState() {
  return (
    <div className={s.statusRow} role="status" aria-live="polite">
      <Icon name="loading" size="sm" />
      <span>Reviewing composition…</span>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className={s.errorRow} role="alert">
      <div className={s.errorBody}>
        <Icon name="warning" size="sm" />
        <div>
          <strong className={s.errorTitle}>Review failed</strong>
          <p className={s.errorMessage}>{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button
          className={s.retryButton}
          appearance="negative"
          attention="low"
          size="s"
          onPress={onRetry}
        >
          Try again
        </Button>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className={s.statusRow}>
      <span className={s.muted}>No critique yet — click Review on the canvas to score this composition.</span>
    </div>
  );
}

function ResultBody({ critique }: { critique: CritiqueResponse }) {
  return (
    <div className={s.body}>
      {critique.summary && <p className={s.summary}>{critique.summary}</p>}

      <DimensionRow dimensions={critique.dimensions} />

      {critique.keep.length > 0 && (
        <Section title="Keep" icon="check" tone="positive">
          <ul className={s.list}>
            {critique.keep.map((item, i) => (
              <KeepRow key={i} item={item} />
            ))}
          </ul>
        </Section>
      )}

      {critique.fix.length > 0 && (
        <Section title="Fix" icon="edit" tone="warning">
          <ul className={s.list}>
            {critique.fix.map((item, i) => (
              <FixRow key={i} item={item} />
            ))}
          </ul>
        </Section>
      )}

      {critique.quickWins.length > 0 && (
        <Section title="Quick wins" icon="sparkles" tone="informative">
          <ul className={s.list}>
            {critique.quickWins.map((item, i) => (
              <QuickWinRow key={i} item={item} />
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function DimensionRow({ dimensions }: { dimensions: CritiqueDimensionScore[] }) {
  if (dimensions.length === 0) return null;
  return (
    <div className={s.dimensionRow} aria-label="Dimension scores">
      {dimensions.map((d) => (
        <div key={d.dimension} className={s.dimensionCell}>
          <span className={s.dimensionLabel}>
            {CRITIQUE_DIMENSION_LABELS[d.dimension as CritiqueDimensionId] ?? d.dimension}
          </span>
          <Badge attention="medium" size="s" appearance={dimensionAppearance(d.score)}>
            {d.score}/10
          </Badge>
          {d.evidence && <span className={s.dimensionEvidence}>{d.evidence}</span>}
        </div>
      ))}
    </div>
  );
}

function Section({
  title,
  icon,
  tone,
  children,
}: {
  title: string;
  icon: SemanticIconName;
  tone: 'positive' | 'warning' | 'informative';
  children: React.ReactNode;
}) {
  return (
    <div className={s.section} data-tone={tone}>
      <header className={s.sectionHeader}>
        <Icon name={icon} size="sm" />
        <span className={s.sectionTitle}>{title}</span>
      </header>
      {children}
    </div>
  );
}

function KeepRow({ item }: { item: CritiqueKeepItem }) {
  return (
    <li className={s.row}>
      <strong className={s.rowTitle}>{item.title}</strong>
      {item.evidence && <span className={s.rowEvidence}>{item.evidence}</span>}
    </li>
  );
}

function FixRow({ item }: { item: CritiqueFixItem }) {
  const meta = SEVERITY_LABEL[item.severity];
  return (
    <li className={s.row}>
      <div className={s.rowHead}>
        <Badge attention="medium" size="s" appearance={meta.appearance}>
          {meta.label}
        </Badge>
        <strong className={s.rowTitle}>{item.issue}</strong>
      </div>
      {item.suggestion && <span className={s.rowEvidence}>{item.suggestion}</span>}
      {item.location && <code className={s.rowLocation}>{item.location}</code>}
    </li>
  );
}

function QuickWinRow({ item }: { item: CritiqueQuickWin }) {
  return (
    <li className={s.row}>
      <div className={s.rowHead}>
        <Badge attention="medium" size="s" appearance="informative">
          ~{item.estMinutes} min
        </Badge>
        <strong className={s.rowTitle}>{item.change}</strong>
      </div>
      {item.where && <code className={s.rowLocation}>{item.where}</code>}
    </li>
  );
}

export const CritiquePanel = memo(CritiquePanelInner);
CritiquePanel.displayName = 'CritiquePanel';
