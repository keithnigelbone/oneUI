/**
 * ArtifactCardShape.tsx
 *
 * The artifact card. It carries the STRUCTURED IR SUMMARY of a valid generation
 * (artifact type, output profile, brand, layout-section / component-instance
 * outline) AND — when a live preview is available (P3 / CANVAS-06) — a real-DOM
 * preview region. The preview NEVER injects raw HTML strings and is NEVER
 * a raster flatten of the web UI: the `live` lifecycle embeds a sandboxed
 * `<iframe>` with a strict `sandbox="allow-scripts"` policy. The legacy
 * `previewSameOrigin` prop remains in persisted shape data for compatibility,
 * but it no longer relaxes iframe origin isolation. The src always carries only
 * an opaque token (PREV-02). The IR itself stays structured JSON, never markup
 * (IR-02 / T-01-16).
 *
 * PREV-03 lifecycle: the preview region escalates `thumbnail → lightweight →
 * live` driven by the pure `nextLifecycleState` state machine from
 * `@oneui/experience-builder-preview`. `thumbnail` renders the cheap `_storage`
 * thumbnail image; `lightweight` a static framed placeholder; `live` mounts the
 * sandboxed iframe. The canvas advances the state on viewport entry / hover so
 * many cards stay cheap until the user focuses one.
 *
 * Mirrors `ComponentShape.tsx`'s ShapeUtil pattern without importing it
 * (LAB-03). Chrome uses `<Surface>` containers (never a raw
 * `<div style={{ background }}>`); all styling is token-only (LAB-02).
 */

'use client';

import {
  ShapeUtil,
  HTMLContainer,
  Rectangle2d,
  T,
  useEditor,
  type Geometry2d,
  type RecordProps,
  type TLBaseShape,
} from 'tldraw';
import React, { useCallback, useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import {
  irToCompositionSpec,
  type CompositionSpecT,
  type JioExperienceIRT,
} from '@oneui/experience-builder-core';
import type { AgentTraceT } from '@oneui/experience-builder-agents';
import {
  nextLifecycleState,
  type PreviewVerification,
  type PreviewLifecycleState,
} from '@oneui/experience-builder-preview/client-types';
import {
  agentCursorsFromTrace,
  parseIrNodeRectsMessage,
  resolveCursorRegions,
  type CursorRegion,
  type IrNodeRect,
} from '../agentCursors';
import { Surface } from '@oneui/ui/components/Surface';
import { Badge } from '@oneui/ui/components/Badge';
import { Button } from '@oneui/ui/components/Button';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Menu } from '@oneui/ui/components/Menu';
import { ToggleGroup } from '@oneui/ui/components/ToggleGroup';
import {
  cardShell,
  cardTitle,
  cardBody,
  cardLabel,
  cardMeta,
  cardCode,
  metaRow,
  inspectorScroll,
  previewRegion,
  previewIframe,
  previewThumbnail,
  previewPlaceholder,
  createRoundedRectIndicatorPath,
  stopCanvasWheel,
} from './cardChrome';
import { SpecRenderer } from '../SpecRenderer';
import styles from './ArtifactCardShape.module.css';

export const ARTIFACT_CARD_SHAPE_TYPE = 'exp-lab-artifact' as const;

export type ArtifactCardShapeProps = {
  w: number;
  h: number;
  /** The validated IR (structured JSON, never markup). May be empty pre-fill. */
  ir: JioExperienceIRT | null;
  /** Canonical component-only live-canvas spec, additive beside IR. */
  compositionSpec: CompositionSpecT | null;
  /** The prompt-card this artifact descends from (spatial lineage). */
  sourcePromptId: string;
  /**
   * The immutable separate-origin preview URL from `previewState.url` (PREV-02).
   * Embedded by the `live` lifecycle in a sandboxed iframe (CANVAS-06). Empty
   * until the run produced a live preview.
   */
  previewUrl: string;
  /**
   * Legacy trust marker retained for persisted shapes. It no longer relaxes the
   * iframe sandbox; live previews always use strict 'allow-scripts'.
   */
  previewSameOrigin: boolean;
  /** A signed `_storage` thumbnail URL shown in the `thumbnail` lifecycle. */
  thumbnailUrl: string;
  /** The best-of-N variant group id this card belongs to (CANVAS-05 / D-14). */
  variantGroupId: string;
  /**
   * The PREV-03 render lifecycle state for the preview region: escalates
   * `thumbnail → lightweight → live`. Stored as a string for tldraw's record
   * validation; narrowed to {@link PreviewLifecycleState} at read.
   */
  lifecycle: string;
  /**
   * AGENT-01/03 / D-06a/d: the persisted multi-agent transparency trace
   * (planner output, design recs, ToV recs, registry matches, validation
   * result, eval composite, backfill provenance). Surfaced by the card's
   * "How this was built" disclosure. Stored as opaque JSON (tldraw `T.jsonValue`)
   * like `ir`; `null`/absent when the run carried no trace (backward-compatible).
   * STRUCTURED AGENT OUTPUTS ONLY — never a secret (T-04.2-11).
   */
  agentTrace: AgentTraceT | null;
  /** Preview infra error message, when preview failed after generation. */
  previewErrorMessage: string;
  /** Expanded evaluator composite, when available. */
  evaluationComposite: number;
  /** Runtime token/theme/screenshot verification from the preview executor. */
  previewVerification: PreviewVerification | null;
};

export type ArtifactCardShape = TLBaseShape<
  typeof ARTIFACT_CARD_SHAPE_TYPE,
  ArtifactCardShapeProps
>;

export class ArtifactCardShapeUtil extends ShapeUtil<any> {
  static override type = ARTIFACT_CARD_SHAPE_TYPE;

  static override props: RecordProps<any> = {
    w: T.number,
    h: T.number,
    ir: T.jsonValue,
    compositionSpec: T.jsonValue,
    sourcePromptId: T.string,
    previewUrl: T.string,
    previewSameOrigin: T.boolean,
    thumbnailUrl: T.string,
    variantGroupId: T.string,
    lifecycle: T.string,
    agentTrace: T.jsonValue,
    previewErrorMessage: T.string,
    evaluationComposite: T.number,
    previewVerification: T.jsonValue,
  };

  getDefaultProps(): ArtifactCardShapeProps {
    return {
      w: 360,
      h: 320,
      ir: null,
      compositionSpec: null,
      sourcePromptId: '',
      previewUrl: '',
      previewSameOrigin: false,
      thumbnailUrl: '',
      variantGroupId: '',
      lifecycle: 'thumbnail',
      agentTrace: null,
      previewErrorMessage: '',
      evaluationComposite: 0,
      previewVerification: null,
    };
  }

  override canEdit() {
    return false;
  }
  override canResize() {
    return false;
  }
  override canCull() {
    return false;
  }

  getGeometry(shape: ArtifactCardShape): Geometry2d {
    return new Rectangle2d({ width: shape.props.w, height: shape.props.h, isFilled: true });
  }

  component(shape: ArtifactCardShape) {
    return <PreviewArtifactCard shape={shape} />;
  }

  override getIndicatorPath(shape: ArtifactCardShape): Path2D {
    return createRoundedRectIndicatorPath(shape.props.w, shape.props.h);
  }

  indicator(shape: ArtifactCardShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}

type InspectorView = 'ir' | 'json';
type BadgeAppearance = 'positive' | 'negative' | 'warning' | 'informative' | 'neutral';

/** Narrow the persisted `lifecycle` string prop to the typed union (safe default). */
export function asLifecycle(value: string): PreviewLifecycleState {
  return value === 'lightweight' || value === 'live' ? value : 'thumbnail';
}

/**
 * The PREV-03 preview region. Renders by lifecycle fidelity:
 *  - `thumbnail`  → the cheap `_storage` thumbnail image (no iframe).
 *  - `lightweight`→ a static framed placeholder (no iframe).
 *  - `live`       → a real-DOM sandboxed iframe of the separate-origin preview.
 *
 * The `live` iframe sandbox is strict for every preview path:
 * `sandbox="allow-scripts"` with NO `allow-same-origin`. This avoids the browser
 * sandbox escape warning while keeping Daytona/compiled previews isolated. The
 * first-party AST render route now mounts its own brand/icon providers, so it no
 * longer depends on same-origin iframe access for visual fidelity. The src
 * carries only the opaque preview token (PREV-02). NEVER injects a raw HTML
 * string, NEVER a raster flatten.
 */
export function PreviewRegion({
  lifecycle,
  previewUrl,
  thumbnailUrl,
  shapeId,
  agentTrace,
  compositionSpec,
  fill = false,
}: {
  lifecycle: PreviewLifecycleState;
  previewUrl: string;
  previewSameOrigin: boolean;
  thumbnailUrl: string;
  shapeId: string;
  /** AGENT-04 / D-06c: drives the additive per-agent cursor overlay. */
  agentTrace?: AgentTraceT | null;
  /** Component-only same-tree preview. Takes precedence over iframe URLs. */
  compositionSpec?: CompositionSpecT | null;
  /** Fill the artifact card instead of using the default 16:9 thumbnail frame. */
  fill?: boolean;
}) {
  const regionStyle = fill
    ? {
        ...previewRegion,
        height: '100%',
        aspectRatio: 'auto',
        borderRadius: 'inherit',
      }
    : previewRegion;

  if (compositionSpec) {
    return (
      <div
        className={styles.specPreviewRegion}
        style={fill ? { height: '100%', borderRadius: 'inherit' } : undefined}
        data-testid={`artifact-preview-${shapeId}`}
      >
        <SpecRenderer spec={compositionSpec} />
      </div>
    );
  }

  if (lifecycle === 'live' && previewUrl) {
    const sandbox = 'allow-scripts';
    return (
      <div
        style={{ ...regionStyle, position: 'relative' }}
        data-testid={`artifact-preview-${shapeId}`}
      >
        <iframe
          title="Live experience preview"
          src={previewUrl}
          sandbox={sandbox}
          style={previewIframe}
          data-testid={`artifact-preview-iframe-${shapeId}`}
        />
        {/* AGENT-04 / D-06c: additive per-agent cursor overlay drawn on top of
            (never inside) the sandboxed iframe. */}
        <AgentCursorOverlay agentTrace={agentTrace} shapeId={shapeId} />
      </div>
    );
  }

  if (lifecycle === 'thumbnail' && thumbnailUrl) {
    return (
      <div style={regionStyle} data-testid={`artifact-preview-${shapeId}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt="Experience preview thumbnail"
          style={previewThumbnail}
          data-testid={`artifact-preview-thumbnail-${shapeId}`}
        />
      </div>
    );
  }

  // `lightweight` (or `thumbnail`/`live` with no asset yet): a static framed
  // placeholder — cheap, no iframe, keeps the canvas responsive (PREV-03).
  return (
    <Surface
      mode="subtle"
      material="solid"
      style={
        fill
          ? {
              ...previewPlaceholder,
              height: '100%',
              aspectRatio: 'auto',
              borderRadius: 'inherit',
            }
          : previewPlaceholder
      }
      data-testid={`artifact-preview-placeholder-${shapeId}`}
    >
      <span style={cardMeta}>
        {lifecycle === 'live' ? 'Preview unavailable' : 'Preview loading…'}
      </span>
    </Surface>
  );
}

type PreviewArtifactState =
  | 'idle'
  | 'understanding'
  | 'planning'
  | 'generating-composition'
  | 'rendering-preview'
  | 'screenshot-capturing'
  | 'visual-critiquing'
  | 'repairing'
  | 'ready'
  | 'preview-error'
  | 'quality-gap'
  | 'error';

const PREVIEW_STATE_ORDER: PreviewArtifactState[] = [
  'idle',
  'understanding',
  'planning',
  'generating-composition',
  'rendering-preview',
  'screenshot-capturing',
  'visual-critiquing',
  'repairing',
  'ready',
];

function previewStateLabel(state: PreviewArtifactState): string {
  if (state === 'idle') return 'Idle';
  if (state === 'understanding') return 'Understanding';
  if (state === 'planning') return 'Planning';
  if (state === 'generating-composition') return 'Generating composition';
  if (state === 'rendering-preview') return 'Rendering preview';
  if (state === 'screenshot-capturing') return 'Capturing screenshot';
  if (state === 'visual-critiquing') return 'Visual critique';
  if (state === 'repairing') return 'Repairing';
  if (state === 'preview-error') return 'Preview error';
  if (state === 'quality-gap') return 'Quality gap';
  if (state === 'error') return 'Error';
  return 'Ready';
}

function statusForShape(
  shape: ArtifactCardShape,
  lifecycle: PreviewLifecycleState
): PreviewArtifactState {
  if (shape.props.previewErrorMessage) return 'preview-error';
  if (shape.props.compositionSpec && shape.props.evaluationComposite >= 3.2) return 'ready';
  if (!shape.props.ir) return 'generating-composition';
  if (shape.props.previewVerification) {
    const cssPassed = shape.props.previewVerification.cssVariables.every(
      (check) => check.status === 'passed'
    );
    if (
      !shape.props.previewVerification.screenshotAvailable ||
      shape.props.previewVerification.rawBrowserDefaultsDetected ||
      (shape.props.previewVerification.consoleIssues?.length ?? 0) > 0 ||
      !cssPassed
    ) {
      return 'quality-gap';
    }
  }
  if (shape.props.evaluationComposite > 0 && shape.props.evaluationComposite < 3.2) {
    return 'quality-gap';
  }
  if (shape.props.compositionSpec || shape.props.ir) return 'ready';
  if (!shape.props.previewUrl && !shape.props.thumbnailUrl) return 'generating-composition';
  if (shape.props.previewVerification?.screenshotAvailable) return 'ready';
  if (lifecycle === 'thumbnail' && shape.props.thumbnailUrl) return 'screenshot-capturing';
  if (shape.props.previewUrl) return 'rendering-preview';
  return 'visual-critiquing';
}

function progressForState(state: PreviewArtifactState): string {
  const index = PREVIEW_STATE_ORDER.indexOf(state);
  if (index < 0) return '100%';
  return `${Math.round(((index + 1) / PREVIEW_STATE_ORDER.length) * 100)}%`;
}

function AIDotGridLoader() {
  return (
    <div className={styles.aiDotGrid} aria-hidden="true">
      {Array.from({ length: 36 }, (_, index) => (
        <span key={index} className={styles.aiDot} />
      ))}
    </div>
  );
}

function PreviewArtifactCard({ shape }: { shape: ArtifactCardShape }) {
  const editor = useEditor();
  const [view, setView] = useState<InspectorView>('ir');
  const ir = shape.props.ir;
  const compositionSpec = useMemo(() => {
    if (shape.props.compositionSpec) return shape.props.compositionSpec;
    if (!ir) return null;
    return irToCompositionSpec(ir);
  }, [shape.props.compositionSpec, ir]);
  const lifecycle = asLifecycle(shape.props.lifecycle);
  const renderLifecycle = shape.props.previewUrl ? 'live' : lifecycle;
  const status = statusForShape(shape, renderLifecycle);
  const statusAppearance =
    status === 'ready'
      ? 'positive'
      : status === 'preview-error' || status === 'error'
        ? 'negative'
        : status === 'quality-gap'
          ? 'warning'
          : 'informative';
  const verificationPassed =
    shape.props.previewVerification?.cssVariables.every((check) => check.status === 'passed') ??
    false;
  const hasPreviewAsset = Boolean(
    compositionSpec || shape.props.previewUrl || shape.props.thumbnailUrl
  );
  const shouldMaskPreview = status !== 'ready' && status !== 'preview-error' && !compositionSpec;

  // PREV-03: advance the preview fidelity one step on hover (viewport-entry is
  // wired by the canvas reducer). `nextLifecycleState` is idempotent at `live`,
  // so repeated hovers never overshoot. Persist via tldraw's updateShape so the
  // escalation survives re-renders.
  const advanceLifecycle = useCallback(() => {
    const current = asLifecycle(shape.props.lifecycle);
    const next = nextLifecycleState(current);
    if (next !== current) {
      editor.updateShape({
        id: shape.id,
        type: shape.type,
        props: { lifecycle: next },
      } as never);
    }
  }, [editor, shape.id, shape.type, shape.props.lifecycle]);

  if (!hasPreviewAsset && status !== 'preview-error') {
    return (
      <HTMLContainer
        style={{
          width: shape.props.w,
          height: shape.props.h,
          pointerEvents: 'all',
          borderRadius: 'var(--Shape-4)',
        }}
        onPointerDown={editor.markEventAsHandled}
        onPointerEnter={advanceLifecycle}
        onWheel={stopCanvasWheel}
      >
        <Surface
          mode="subtle"
          material="solid"
          appearance="primary"
          className={styles.pendingArtifactCard}
          data-testid={`artifact-card-${shape.id}`}
          aria-label={`Experience preview ${previewStateLabel(status)}`}
        >
          <ArtifactCardActions
            shapeId={shape.id}
            status={status}
            statusAppearance={statusAppearance}
            verificationPassed={verificationPassed}
          />
          <AIDotGridLoader />
          <div className={styles.pendingProgressTrack} aria-hidden="true">
            <div
              className={styles.pendingProgressFill}
              style={{ width: progressForState(status) }}
            />
          </div>
        </Surface>
      </HTMLContainer>
    );
  }

  if (hasPreviewAsset) {
    return (
      <HTMLContainer
        style={{
          width: shape.props.w,
          height: shape.props.h,
          pointerEvents: 'all',
          backgroundColor: 'transparent',
          borderRadius: 'var(--Shape-4)',
        }}
        onPointerDown={editor.markEventAsHandled}
        onPointerEnter={advanceLifecycle}
        onWheel={stopCanvasWheel}
      >
        <Surface
          mode="default"
          className={styles.previewArtifactCard}
          data-testid={`artifact-card-${shape.id}`}
          aria-label={`Experience preview ${previewStateLabel(status)}`}
        >
          <PreviewRegion
            lifecycle={renderLifecycle}
            previewUrl={shape.props.previewUrl}
            previewSameOrigin={shape.props.previewSameOrigin}
            thumbnailUrl={shape.props.thumbnailUrl}
            shapeId={shape.id}
            agentTrace={shape.props.agentTrace}
            compositionSpec={compositionSpec}
            fill
          />
          {shouldMaskPreview && (
            <Surface
              mode="subtle"
              material="solid"
              appearance="primary"
              className={styles.previewLoadingOverlay}
              data-testid={`artifact-preview-loading-${shape.id}`}
            >
              <AIDotGridLoader />
            </Surface>
          )}
          <ArtifactCardActions
            shapeId={shape.id}
            status={status}
            statusAppearance={statusAppearance}
            verificationPassed={verificationPassed}
            previewUrl={shape.props.previewUrl}
            ir={ir}
            onShowJson={() => setView('json')}
            onAccept={() => editor.select(shape.id)}
          />
          {shouldMaskPreview && (
            <div className={styles.previewProgressTrack} aria-hidden="true">
              <div
                className={styles.previewProgressFill}
                style={{ width: progressForState(status) }}
              />
            </div>
          )}
        </Surface>
      </HTMLContainer>
    );
  }

  return (
    <HTMLContainer
      style={{
        width: shape.props.w,
        height: shape.props.h,
        pointerEvents: 'all',
        borderRadius: 'var(--Shape-4)',
      }}
      onPointerDown={editor.markEventAsHandled}
      onPointerEnter={advanceLifecycle}
      onWheel={stopCanvasWheel}
    >
      <Surface
        mode={status === 'preview-error' ? 'subtle' : 'elevated'}
        material="solid"
        appearance={status === 'preview-error' ? 'negative' : 'primary'}
        style={{ width: '100%', height: '100%', borderRadius: 'var(--Shape-4)' }}
        data-testid={`artifact-card-${shape.id}`}
      >
        <div style={cardShell}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-0-5)' }}>
              <h3 style={cardTitle}>Experience preview</h3>
              <span style={cardMeta}>Generated artifact</span>
            </div>
            <Badge appearance={statusAppearance} size="s">
              {previewStateLabel(status)}
            </Badge>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--Spacing-2)',
              flexWrap: 'wrap',
            }}
          >
            {ir && (
              <Badge appearance="neutral" size="s">
                {ir.artifactType}
              </Badge>
            )}
            {ir && (
              <Badge appearance="secondary" size="s">
                {ir.targetProfile}
              </Badge>
            )}
            <Badge appearance={verificationPassed ? 'positive' : 'neutral'} size="s">
              {verificationPassed ? 'Tokens verified' : 'Tokens pending'}
            </Badge>
          </div>

          {status !== 'ready' && status !== 'preview-error' && (
            <Surface mode="subtle" style={{ borderRadius: 'var(--Shape-3)' }}>
              <AIDotGridLoader />
            </Surface>
          )}

          <Surface
            mode="ghost"
            style={{
              width: '100%',
              height: 'var(--Spacing-1)',
              borderRadius: 'var(--Shape-Pill)',
              overflow: 'hidden',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width: progressForState(status),
                height: '100%',
                backgroundColor:
                  status === 'ready' ? 'var(--Positive-Bold)' : 'var(--Primary-Bold)',
              }}
            />
          </Surface>

          {/* CANVAS-06 / PREV-03: real-DOM live-iframe preview, lifecycle-gated. */}
          {(shape.props.previewUrl || shape.props.thumbnailUrl) && (
            <PreviewRegion
              lifecycle={lifecycle}
              previewUrl={shape.props.previewUrl}
              previewSameOrigin={shape.props.previewSameOrigin}
              thumbnailUrl={shape.props.thumbnailUrl}
              shapeId={shape.id}
              agentTrace={shape.props.agentTrace}
              compositionSpec={compositionSpec}
            />
          )}

          {shape.props.previewErrorMessage && (
            <Surface mode="subtle">
              <p style={{ ...cardBody, padding: 'var(--Spacing-3)' }}>
                {toPlainText(shape.props.previewErrorMessage)}
              </p>
            </Surface>
          )}

          {/* The in-card preview is a thumbnail; open the generated UI full-size in
            its own tab so it can be viewed at the real rendered scale. */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--Spacing-2)',
              flexWrap: 'wrap',
            }}
          >
            {shape.props.previewUrl && (
              <Button
                appearance="primary"
                attention="medium"
                size="s"
                onClick={() => window.open(shape.props.previewUrl, '_blank', 'noopener,noreferrer')}
                data-testid={`artifact-open-preview-${shape.id}`}
              >
                Open preview
              </Button>
            )}
            <Button
              appearance="neutral"
              attention="low"
              size="s"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('oneui-lab-regenerate-artifact', {
                    detail: { shapeId: shape.id },
                  })
                );
              }}
              data-testid={`artifact-regenerate-${shape.id}`}
            >
              Regenerate
            </Button>
            <Button
              appearance="neutral"
              attention="low"
              size="s"
              onClick={() => setView('json')}
              data-testid={`artifact-show-critique-${shape.id}`}
            >
              Show critique
            </Button>
            <Button
              appearance="positive"
              attention="low"
              size="s"
              onClick={() => editor.select(shape.id)}
              data-testid={`artifact-accept-${shape.id}`}
            >
              Accept
            </Button>
          </div>

          {ir ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-1)' }}>
                <div style={metaRow}>
                  <span style={cardMeta}>Artifact</span>
                  <span style={cardLabel}>{ir.artifactType}</span>
                </div>
                <div style={metaRow}>
                  <span style={cardMeta}>Profile</span>
                  <span style={cardLabel}>{ir.targetProfile}</span>
                </div>
                <div style={metaRow}>
                  <span style={cardMeta}>Brand</span>
                  <span style={cardLabel}>{ir.brandId}</span>
                </div>
                <div style={metaRow}>
                  <span style={cardMeta}>Sections</span>
                  <span style={cardLabel}>{ir.sections.length}</span>
                  <span style={cardMeta}>Instances</span>
                  <span style={cardLabel}>{ir.componentInstances.length}</span>
                </div>
              </div>

              <ToggleGroup
                value={view}
                onValueChange={(v) => {
                  const next = Array.isArray(v) ? v[0] : v;
                  if (next === 'ir' || next === 'json') setView(next);
                }}
              >
                <ToggleGroup.Item value="ir">Show IR</ToggleGroup.Item>
                <ToggleGroup.Item value="json">Show JSON</ToggleGroup.Item>
              </ToggleGroup>

              <Surface mode="subtle" style={inspectorScroll}>
                {view === 'ir' ? (
                  <pre style={cardCode}>{outlineIr(ir)}</pre>
                ) : (
                  <pre style={cardCode}>{JSON.stringify(ir, null, 2)}</pre>
                )}
              </Surface>
            </>
          ) : (
            <p style={cardMeta}>No IR on this artifact card.</p>
          )}

          {/* AGENT-03 / D-06d: the expandable "How this was built" agent trace. */}
          <HowThisWasBuilt agentTrace={shape.props.agentTrace} />
        </div>
      </Surface>
    </HTMLContainer>
  );
}

function ArtifactCardActions({
  shapeId,
  status,
  statusAppearance,
  verificationPassed,
  previewUrl,
  ir,
  onShowJson,
  onAccept,
}: {
  shapeId: string;
  status: PreviewArtifactState;
  statusAppearance: BadgeAppearance;
  verificationPassed: boolean;
  previewUrl?: string;
  ir?: JioExperienceIRT | null;
  onShowJson?: () => void;
  onAccept?: () => void;
}) {
  return (
    <div className={styles.cardActions}>
      <Menu>
        <Menu.Trigger
          render={
            <IconButton
              icon="moreHorizontal"
              size="s"
              attention="medium"
              appearance="neutral"
              aria-label="Artifact details"
              data-testid={`artifact-details-${shapeId}`}
            />
          }
        />
        <Menu.Portal side="bottom" align="end" sideOffset={8}>
          <Menu.Group label="Status">
            <Menu.Item disabled>
              <span className={styles.menuStatus}>
                <Badge appearance={statusAppearance} size="s">
                  {previewStateLabel(status)}
                </Badge>
              </span>
            </Menu.Item>
            <Menu.Item disabled>
              {verificationPassed ? 'Tokens verified' : 'Tokens pending'}
            </Menu.Item>
            {ir && <Menu.Item disabled>{`${ir.sections.length} sections`}</Menu.Item>}
          </Menu.Group>
          <Menu.Separator />
          {previewUrl && (
            <Menu.Item onClick={() => window.open(previewUrl, '_blank', 'noopener,noreferrer')}>
              Open preview
            </Menu.Item>
          )}
          <Menu.Item
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent('oneui-lab-regenerate-artifact', {
                  detail: { shapeId },
                })
              );
            }}
          >
            Regenerate
          </Menu.Item>
          {onShowJson && <Menu.Item onClick={onShowJson}>Show JSON</Menu.Item>}
          {onAccept && <Menu.Item onClick={onAccept}>Accept</Menu.Item>}
        </Menu.Portal>
      </Menu>
    </div>
  );
}

/**
 * Defence-in-depth markup stripper for trace strings (T-04.2-12). Trace strings
 * ALREADY originate from markup-free advisor outputs, but the card strips any
 * angle-bracket construct before display so a smuggled `<img onerror=…>` cannot
 * survive even as React-escaped text. Pure text in, pure text out.
 */
function toPlainText(value: unknown): string {
  return String(value ?? '')
    .replace(/<[^>]*>?/g, '')
    .trim();
}

/**
 * AGENT-03 / D-06d: the "How this was built" trace disclosure.
 *
 * A PURE, editor-context-free render helper (NO `useEditor`) so it is
 * unit-renderable in jsdom without mounting tldraw. Given the persisted
 * `agentTrace` it renders an EXPANDABLE native `<button aria-expanded
 * aria-controls>` disclosure (keyboard-operable, Focus Halo via
 * `--Surface-Halo-Gap`) surfacing the planner output, design recs, ToV recs,
 * registry matches, validation result, and eval composite — legible without
 * implementation knowledge ("transparency, not noise"). Renders NOTHING when
 * `agentTrace` is undefined/null (backward-compatible). Every trace string
 * renders as plain React text — NEVER `dangerouslySetInnerHTML` (T-04.2-01b /
 * T-04.2-12 markup-safety); the tinted panel is a `<Surface>`, never a raw
 * `<div style={{ background }}>`; all styling is token-only (LAB-02).
 */
export function HowThisWasBuilt({ agentTrace }: { agentTrace?: AgentTraceT | null }) {
  const [open, setOpen] = useState(false);
  const regionId = useId();
  if (!agentTrace) return null;

  const { planner, designRecs, toneRecs, registryMatches, validation, evaluation } = agentTrace;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-1)' }}>
      <button
        type="button"
        className={styles.traceToggle}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={regionId}
      >
        How this was built
      </button>
      {open && (
        <Surface
          mode="subtle"
          id={regionId}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--Spacing-2)',
            padding: 'var(--Spacing-3)',
            borderRadius: 'var(--Shape-3)',
          }}
        >
          {planner && (
            <TraceRow label="Planner">
              <span style={cardLabel}>
                {planner.sections.map((s) => toPlainText(s)).join(' · ')}
              </span>
              <span style={cardMeta}>Primary CTA: {toPlainText(planner.primaryCTA)}</span>
            </TraceRow>
          )}
          {designRecs && designRecs.length > 0 && (
            <TraceRow label="Design advisor">
              {designRecs.map((d) => (
                <span key={d.sectionId} style={cardMeta}>
                  {toPlainText(d.sectionId)}: {toPlainText(d.surfaceMode)}
                </span>
              ))}
            </TraceRow>
          )}
          {toneRecs && toneRecs.length > 0 && (
            <TraceRow label="Tone advisor">
              {toneRecs.map((t) => (
                <span key={t.sectionId} style={cardMeta}>
                  {toPlainText(t.headline)} (tone {t.toneScore})
                </span>
              ))}
            </TraceRow>
          )}
          {registryMatches && registryMatches.length > 0 && (
            <TraceRow label="Registry matches">
              <span style={cardMeta}>{registryMatches.map((m) => toPlainText(m)).join(', ')}</span>
            </TraceRow>
          )}
          {validation && (
            <TraceRow label="Validation">
              <span style={cardMeta}>
                {validation.passed
                  ? 'Passed'
                  : `Blocked: ${validation.blockingCodes.map((c) => toPlainText(c)).join(', ') || 'unknown'}`}
              </span>
            </TraceRow>
          )}
          {evaluation && (
            <TraceRow label="Evaluation">
              <span style={cardMeta}>Composite {evaluation.composite}</span>
            </TraceRow>
          )}
        </Surface>
      )}
    </div>
  );
}

/**
 * (AGENT-04 / D-06c) The additive per-agent cursor overlay.
 *
 * Listens for the rect-only `postMessage` the sandboxed preview iframe posts
 * (`IrNodeRectReporter` → `parseIrNodeRectsMessage`), resolves the per-agent
 * node ids from the persisted `agentTrace` against those rects, and draws a
 * lightweight outlined pointer per touched region OVER the iframe. Strictly
 * additive: it draws on top of the iframe (never inside), it is
 * `pointerEvents: 'none'` so it never intercepts canvas/preview interaction, and
 * it renders NOTHING when there is no trace or no rects yet (graceful
 * degradation while the preview escalates to `live`).
 *
 * SECURITY (T-04.2-14): the only data crossing the origin boundary is the rect
 * payload, which `parseIrNodeRectsMessage` validates is node-id strings + numbers
 * ONLY. The overlay never relaxes the iframe sandbox/CSP. Token-only styling via
 * `<Surface>`-free absolutely-positioned boxes (LAB-02): the pointer borders use
 * role appearance tokens, never literals.
 */
function AgentCursorOverlay({
  agentTrace,
  shapeId,
}: {
  agentTrace?: AgentTraceT | null;
  shapeId: string;
}) {
  const [rects, setRects] = useState<IrNodeRect[]>([]);
  const cursors = useMemo(() => agentCursorsFromTrace(agentTrace), [agentTrace]);

  useEffect(() => {
    if (cursors.length === 0) return;
    function onMessage(event: MessageEvent) {
      const parsed = parseIrNodeRectsMessage(event.data);
      if (!parsed) return;
      setRects(parsed.rects);
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [cursors.length]);

  const regions: CursorRegion[] = useMemo(
    () => resolveCursorRegions(cursors, rects),
    [cursors, rects]
  );

  if (regions.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      data-testid={`agent-cursor-overlay-${shapeId}`}
    >
      {regions.map((region) => (
        <div
          key={`${region.agent}-${region.nodeId}`}
          data-agent-cursor={region.agent}
          data-ir-node-id={region.nodeId}
          style={{
            position: 'absolute',
            left: region.left,
            top: region.top,
            width: region.width,
            height: region.height,
            border: `var(--Stroke-M) solid var(--${cursorRole(region.appearance)}-TintedA11y)`,
            borderRadius: 'var(--Shape-2)',
            boxShadow: `inset 0 0 0 var(--Stroke-S) var(--${cursorRole(region.appearance)}-Subtle)`,
            boxSizing: 'border-box',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: 'translateY(-100%)',
              padding: 'var(--Spacing-0-5) var(--Spacing-1)',
              backgroundColor: `var(--${cursorRole(region.appearance)}-Subtle)`,
              color: `var(--${cursorRole(region.appearance)}-TintedA11y)`,
              fontFamily: 'var(--Typography-Font-Primary)',
              fontSize: 'var(--Label-XS-FontSize)',
              lineHeight: 'var(--Label-XS-LineHeight)',
              fontWeight: 'var(--Label-FontWeight-Medium)',
              borderRadius: 'var(--Shape-2)',
              whiteSpace: 'nowrap',
            }}
          >
            {AGENT_CURSOR_LABELS[region.agent]}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Map the appearance string to the role-token prefix used in token names. */
function cursorRole(appearance: string): string {
  if (appearance === 'sparkle') return 'Sparkle';
  if (appearance === 'secondary') return 'Secondary';
  if (appearance === 'warning') return 'Warning';
  return 'Primary';
}

/** Short pointer labels per agent (kept in the card so the overlay is self-contained). */
const AGENT_CURSOR_LABELS: Record<CursorRegion['agent'], string> = {
  design: 'Design',
  tone: 'Tone',
  evaluator: 'Eval',
};

/** A labelled trace row — a meta label over its plain-text value(s). */
function TraceRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-0-5)' }}>
      <span style={cardLabel}>{label}</span>
      {children}
    </div>
  );
}

/**
 * A compact, human-readable outline of the IR's structure (section → component
 * instance tree). Pure string derivation from validated IR fields — no markup.
 */
function outlineIr(ir: JioExperienceIRT): string {
  const lines: string[] = [];
  for (const section of ir.sections) {
    lines.push(`§ ${section.name}`);
    for (const inst of section.instances) {
      lines.push(`  • ${inst.type}`);
    }
  }
  if (ir.componentInstances.length > 0 && ir.sections.length === 0) {
    for (const inst of ir.componentInstances) {
      lines.push(`• ${inst.type}`);
    }
  }
  return lines.join('\n') || '(empty)';
}
