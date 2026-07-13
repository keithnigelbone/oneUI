/**
 * ExportCardActions.tsx — the export card-action menu + export card (D-13).
 *
 * A card `⋮` `IconButton` opens a `Menu` offering "Export ▸ Code (React + Jio
 * CSS) / PNG / JPG / PDF" (exact UI-SPEC copy). On select it POSTs to the export
 * route (`/api/experience-lab/export`, Task 5a); the result surfaces as the
 * existing `export` card kind — an `informative` "Preparing {format} export…"
 * pill while the request is in flight, then a `positive` "Export ready" pill with
 * a "Download" affordance. A code export additionally shows the TSX in a `Code`-
 * role `<Surface mode="subtle">` block.
 *
 * Jio DS + tokens ONLY: deep-path `@oneui/ui-internal` imports (NEVER the
 * `@oneui/ui` barrel), token-only CSS module (no raw `<div style={{ background }}>`),
 * status by TEXT + role not colour alone (WCAG AA), the `⋮` IconButton carries a
 * required `aria-label`. The `Menu` is the intentional unstyled Base UI passthrough
 * — items are wrapped with Jio-token chrome. No legacy `(builder)` import (LAB-03).
 */

'use client';

import { useState, useCallback } from 'react';
import { IconButton } from '@oneui/ui-internal/components/IconButton/IconButton';
import { Menu } from '@oneui/ui-internal/components/Menu/Menu';
import { Button } from '@oneui/ui-internal/components/Button/Button';
import { Badge } from '@oneui/ui-internal/components/Badge/Badge';
import { Surface } from '@oneui/ui-internal/components/Surface/Surface';
import styles from './ExportCardActions.module.css';

/** The four export kinds (D-13) + their menu labels (exact UI-SPEC copy). */
const EXPORT_ITEMS: ReadonlyArray<{ kind: ExportKind; label: string }> = [
  { kind: 'code', label: 'Code (React + Jio CSS)' },
  { kind: 'png', label: 'PNG' },
  { kind: 'jpg', label: 'JPG' },
  { kind: 'pdf', label: 'PDF' },
];

export type ExportKind = 'code' | 'png' | 'jpg' | 'pdf';

/** Human label for the in-progress pill ("Preparing {format} export…"). */
const FORMAT_LABEL: Record<ExportKind, string> = {
  code: 'code',
  png: 'PNG',
  jpg: 'JPG',
  pdf: 'PDF',
};

type ExportPhase =
  | { state: 'idle' }
  | { state: 'preparing'; kind: ExportKind }
  | {
      state: 'ready';
      kind: ExportKind;
      downloadUrl?: string;
      code?: string;
      css?: string;
    }
  | { state: 'error'; kind: ExportKind; message: string };

export interface ExportCardActionsProps {
  /** The artifact version to export (its persisted compiledBundle.code, D-12). */
  versionId: string;
  /** The owning brand (brand-scoped on the route, ASVS V4). */
  brandId: string;
  /** The artifact type (so the route re-resolves the foundation canvas). */
  artifactType: string;
  /** The output profile (the canvas the raster/PDF re-renders at). */
  outputProfile: string;
  /** Optional resolved Jio CSS to bundle with a code export (D-12). */
  css?: string;
  /** Optional sub-brand selection forwarded to the resolver. */
  subBrandConfigId?: string;
}

/**
 * The `⋮` export menu + the export card. Self-contained: it owns the in-flight /
 * ready / error phase and renders the export card body below the menu trigger.
 */
export function ExportCardActions({
  versionId,
  brandId,
  artifactType,
  outputProfile,
  css,
  subBrandConfigId,
}: ExportCardActionsProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<ExportPhase>({ state: 'idle' });

  const runExport = useCallback(
    async (kind: ExportKind) => {
      setOpen(false);
      setPhase({ state: 'preparing', kind });
      try {
        const res = await fetch('/api/experience-lab/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            versionId,
            brandId,
            kind,
            artifactType,
            outputProfile,
            ...(css != null ? { css } : {}),
            ...(subBrandConfigId ? { subBrandConfigId } : {}),
          }),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          setPhase({
            state: 'error',
            kind,
            message: body.error ?? 'Export failed.',
          });
          return;
        }
        const body = (await res.json()) as {
          downloadUrl?: string;
          code?: string;
          css?: string;
        };
        setPhase({
          state: 'ready',
          kind,
          ...(body.downloadUrl ? { downloadUrl: body.downloadUrl } : {}),
          ...(body.code != null ? { code: body.code } : {}),
          ...(body.css != null ? { css: body.css } : {}),
        });
      } catch {
        setPhase({ state: 'error', kind, message: 'Export failed.' });
      }
    },
    [versionId, brandId, artifactType, outputProfile, css, subBrandConfigId],
  );

  return (
    <div className={styles.exportCard}>
      <div className={styles.exportCardHeader}>
        <span className={styles.exportTitle}>Export</span>
        <Menu open={open} onOpenChange={setOpen}>
          <Menu.Trigger
            render={
              <IconButton
                icon="moreHorizontal"
                appearance="neutral"
                attention="low"
                aria-label="Card actions"
              />
            }
          />
          <Menu.Portal side="bottom" align="end">
            <Menu.Group label="Export">
              {EXPORT_ITEMS.map((item) => (
                <Menu.Item
                  key={item.kind}
                  className={styles.menuItem}
                  onClick={() => {
                    void runExport(item.kind);
                  }}
                >
                  {item.label}
                </Menu.Item>
              ))}
            </Menu.Group>
          </Menu.Portal>
        </Menu>
      </div>

      {phase.state === 'preparing' && (
        <div className={styles.statusRow}>
          <Badge appearance="informative" attention="medium">
            {`Preparing ${FORMAT_LABEL[phase.kind]} export…`}
          </Badge>
        </div>
      )}

      {phase.state === 'error' && (
        <div className={styles.statusRow}>
          <Badge appearance="negative" attention="medium">
            Export failed
          </Badge>
          <span className={styles.statusText}>{phase.message}</span>
        </div>
      )}

      {phase.state === 'ready' && (
        <>
          <div className={styles.statusRow}>
            <Badge appearance="positive" attention="medium">
              Export ready
            </Badge>
            {phase.downloadUrl && (
              <div className={styles.downloadRow}>
                <Button
                  attention="medium"
                  appearance="primary"
                  onClick={() => {
                    if (phase.downloadUrl) window.open(phase.downloadUrl, '_blank', 'noopener');
                  }}
                >
                  Download
                </Button>
              </div>
            )}
          </div>
          {phase.kind === 'code' && phase.code != null && (
            <Surface mode="subtle">
              <span className={styles.codePreviewHeader}>Code</span>
              <pre className={styles.codeBlock}>{phase.code}</pre>
            </Surface>
          )}
        </>
      )}
    </div>
  );
}
