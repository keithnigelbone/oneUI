/**
 * DirectionPicker.tsx
 *
 * Three-up gallery rendered when the user fans the brief out via the
 * "Explore directions" button. Each tile shows a small live ASTRenderer
 * preview, the direction's label + description, and a "Use this" button
 * that promotes the picked AST into the composition version stack.
 *
 * Visual quality bar — every tile is a FoundationCard, dimension badges
 * mirror the canvas validation badge, and the gallery sits inside the same
 * surface mode the canvas uses so the live previews resolve their tokens
 * correctly.
 */

'use client';

import { memo } from 'react';
import { ASTRenderer } from '@oneui/ui/runtime';
import { Badge } from '@oneui/ui/components/Badge';
import { Button } from '@oneui/ui/components/Button';
import { Spinner } from '@oneui/ui/components/Spinner';
import { Icon } from '@oneui/ui/icons/Icon';
import { IconButton } from '@oneui/ui/components/IconButton';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import type { ASTRoot, CompositionValidationResult } from '@oneui/shared';
import type { DirectionId } from '@oneui/shared/engine';
export type { DirectionId };
import s from './DirectionPicker.module.css';

export interface DirectionResult {
  id: DirectionId;
  label: string;
  description: string;
  ast: ASTRoot;
  validation: CompositionValidationResult;
  astHash: string;
  layoutPersonality: { density: number; expressiveness: number };
}

export interface DirectionFailure {
  id: DirectionId;
  label: string;
  description: string;
  error: string;
}

export type DirectionEntry = DirectionResult | DirectionFailure;

export interface DirectionPickerProps {
  directions: DirectionEntry[];
  loading: boolean;
  error: string | null;
  prompt?: string;
  onPick: (direction: DirectionResult) => void;
  onDismiss: () => void;
  onRetry?: () => void;
}

function isResult(d: DirectionEntry): d is DirectionResult {
  return 'ast' in d;
}

function scoreAppearance(score: number): 'positive' | 'warning' | 'negative' {
  if (score >= 80) return 'positive';
  if (score >= 50) return 'warning';
  return 'negative';
}

function DirectionPickerInner({
  directions,
  loading,
  error,
  prompt,
  onPick,
  onDismiss,
  onRetry,
}: DirectionPickerProps) {
  return (
    <FoundationCard
      title="Explore directions"
      description={
        prompt
          ? `Three differentiated takes on: "${prompt}". Pick one to continue iterating from it.`
          : 'Three differentiated takes on the same brief. Pick one to continue iterating from it.'
      }
      actions={
        <div className={s.headerActions}>
          {onRetry && !loading && (
            <IconButton
              icon={<Icon name="refresh" />}
              appearance="neutral"
              attention="low"
              size="s"
              aria-label="Re-run exploration"
              onPress={onRetry}
            />
          )}
          <IconButton
            icon={<Icon name="close" />}
            appearance="neutral"
            attention="low"
            size="s"
            aria-label="Close direction picker"
            onPress={onDismiss}
          />
        </div>
      }
    >
      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={onRetry} />}
      {!loading && !error && directions.length === 0 && <EmptyState />}
      {!loading && !error && directions.length > 0 && (
        <div className={s.grid}>
          {directions.map((d) => (
            <DirectionTile key={d.id} direction={d} onPick={onPick} />
          ))}
        </div>
      )}
    </FoundationCard>
  );
}

function LoadingState() {
  return (
    <div className={s.statusRow} role="status" aria-live="polite">
      <Spinner size="S" label="Generating directions" />
      <span>
        Generating three directions in parallel… this typically takes 15–25 seconds.
      </span>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className={s.errorRow} role="alert">
      <div className={s.errorBody}>
        <Icon name="warning" size="sm" />
        <div>
          <strong className={s.errorTitle}>Exploration failed</strong>
          <p className={s.errorMessage}>{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button attention="medium" appearance="neutral" size="s" onPress={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className={s.statusRow}>
      <span className={s.muted}>No directions yet.</span>
    </div>
  );
}

function DirectionTile({
  direction,
  onPick,
}: {
  direction: DirectionEntry;
  onPick: (d: DirectionResult) => void;
}) {
  if (!isResult(direction)) {
    return (
      <div className={s.tile} data-state="failed" aria-label={`${direction.label} (failed)`}>
        <header className={s.tileHeader}>
          <h4 className={s.tileLabel}>{direction.label}</h4>
          <Badge attention="medium" size="s" appearance="negative">
            Failed
          </Badge>
        </header>
        <p className={s.tileDescription}>{direction.description}</p>
        <p className={s.tileError}>{direction.error}</p>
      </div>
    );
  }

  return (
    <div className={s.tile}>
      <header className={s.tileHeader}>
        <h4 className={s.tileLabel}>{direction.label}</h4>
        <Badge
          attention="medium"
          size="s"
          appearance={scoreAppearance(direction.validation.score)}
        >
          {direction.validation.score}/100
        </Badge>
      </header>

      <p className={s.tileDescription}>{direction.description}</p>

      <div className={s.tilePreview} data-oneui-canvas="true">
        <div className={s.tilePreviewScale}>
          <ASTRenderer
            tree={direction.ast}
            mode="render"
            surfaceMode={(direction.ast.surfaceMode as string | undefined) ?? 'default'}
          />
        </div>
      </div>

      <footer className={s.tileFooter}>
        <span className={s.tileMeta}>
          density {direction.layoutPersonality.density} · expressiveness{' '}
          {direction.layoutPersonality.expressiveness}
        </span>
        <Button
          attention="medium"
          appearance="primary"
          size="s"
          onPress={() => onPick(direction)}
        >
          Use this
        </Button>
      </footer>
    </div>
  );
}

export const DirectionPicker = memo(DirectionPickerInner);
DirectionPicker.displayName = 'DirectionPicker';
