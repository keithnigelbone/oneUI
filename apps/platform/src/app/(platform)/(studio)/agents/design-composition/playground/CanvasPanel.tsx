/**
 * CanvasPanel.tsx
 *
 * The artifact-first right rail of the Playground v2 layout. This component
 * owns everything about the rendered composition: device framing, the
 * preview/code toggle, version history, export actions, and the references
 * footer. The chat on the left is pure context; the canvas is the work.
 */

'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { ASTRenderer } from '@oneui/ui/runtime';
import type { ASTRoot, BreakpointId } from '@oneui/shared';
import { resolveBreakpointRange } from '@oneui/shared';
import { usePlatformContext } from '@/contexts/PlatformContext';
import type {
  CompositionASTData,
  CompositionReferenceSummary,
} from '@oneui/ui/components/ChatSurface';
import { Badge } from '@oneui/ui/components/Badge';
import { Button } from '@oneui/ui/components/Button';
import { Menu } from '@oneui/ui/components/Menu';
import { Select, type SelectOption } from '@oneui/ui/components/Select';
import { Icon } from '@oneui/ui/icons/Icon';
import { IconButton } from '@oneui/ui/components/IconButton';
import type { RetrievalTrace } from '@oneui/shared/engine';
import { computeASTHash, computeCodeHash } from '@oneui/shared/engine';
import type { CritiqueResponse } from '@oneui/shared';
import { DevicePicker, DEVICE_PRESETS, type DeviceSpec } from './DevicePicker';
import { JsonHighlighter } from './JsonHighlighter';
import { TsxHighlighter } from './TsxHighlighter';
import { RetrievalTracePanel } from './RetrievalTracePanel';
import { CritiquePanel } from './CritiquePanel';
import { SandpackCanvas } from './SandpackCanvas';
import { useDcaRenderer } from './useDcaRenderer';
import type { CompositionVersion } from './useCompositionVersions';
import s from './playground.module.css';

type Rating = 'positive' | 'negative';

type ViewMode = 'preview' | 'code';

const MIN_DEVICE_WIDTH = 320;
const MAX_DEVICE_WIDTH = 1920;
const MIN_DEVICE_HEIGHT = 360;
const MAX_DEVICE_HEIGHT = 1400;

const VIEW_MODE_OPTIONS: Array<SelectOption<ViewMode>> = [
  { value: 'preview', label: 'Preview' },
  { value: 'code', label: 'Code' },
];

export interface CanvasPanelProps {
  versions: CompositionVersion[];
  selectedVersion: CompositionVersion | null;
  onSelectVersion: (index: number) => void;
  /** Latest resolved references so the footer stays accurate per version. */
  references: CompositionReferenceSummary[];
  /** Hybrid-RAG retrieval trace for the currently-selected version. When
   *  set, a collapsible debug drawer is rendered beneath the canvas. */
  retrievalTrace?: RetrievalTrace;
  /** System prompt size in characters for the currently-selected version.
   *  Displayed inside the retrieval debug drawer. */
  retrievalPromptSize?: number;
  brandId?: string;
  context?: string;
  /**
   * The AST node id currently pinned for revision (if any). The frame
   * highlights the matching element and `onSelectNode` fires on clicks
   * inside the rendered tree so the parent can track the selection and
   * include it in the next revision request.
   */
  selectedNodeId?: string | null;
  onSelectNode?: (selection: { id: string; type: string } | null) => void;
  /**
   * Code-mode counterpart of `onSelectNode`. Fires when the user clicks
   * a JSX element inside the Sandpack iframe — `loc` is the source
   * range from `data-oneui-loc`, `tag` is the component name. Page
   * stores this on the same revision payload as the AST selection.
   */
  onSelectCodeElement?: (selection: { loc: string; tag: string } | null) => void;
  /** Fired when Sandpack self-heals the current version so the parent can
   *  use repaired source as the base for the next revision. */
  onCodeRepaired?: (versionIndex: number, code: string) => void;
  /** Currently-pinned code-mode element. Renders the "Pinned <Button> L42"
   *  pill above the iframe. */
  selectedCodeElement?: { loc: string; tag: string } | null;
  /**
   * Optional takeover content rendered in place of the canvas stage. When
   * non-null, the device frame, code view, and feedback group are hidden;
   * the takeover owns the stage. Used by the Direction Picker so the
   * explore-mode flow can dominate the canvas without a separate route.
   */
  stageTakeover?: ReactNode;
}

function scoreAppearance(score?: number): 'positive' | 'warning' | 'negative' {
  if (score === undefined) return 'warning';
  if (score >= 80) return 'positive';
  if (score >= 50) return 'warning';
  return 'negative';
}

/** Pick the default device for a composition context. Mobile contexts open
 *  in the phone frame; marketing/web open at desktop width. */
function defaultDeviceFor(context?: string): DeviceSpec {
  if (context === 'web-app' || context === 'marketing-page') return DEVICE_PRESETS[2];
  if (context === 'social-post') return { label: 'Square', width: 1080 };
  if (context === 'print') return { label: 'A4', width: 794, height: 1123 };
  if (context === 'outdoor') return { label: 'Billboard', width: 1500 };
  return DEVICE_PRESETS[0];
}

/** Map the device picker's width to the S/M/L breakpoint consumed by
 *  `dimensions/scale.css`. Mirrors the viewport-width → breakpoint lookup in
 *  PlatformContext (619/990 ladder) so the dimension cascade resolves against
 *  the framed canvas size instead of the ambient studio viewport. */
function deviceToBreakpoint(width: number): BreakpointId {
  return resolveBreakpointRange(width);
}

function triggerDownload(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function CanvasPanel({
  versions,
  selectedVersion,
  onSelectVersion,
  references,
  retrievalTrace,
  retrievalPromptSize,
  brandId,
  context,
  selectedNodeId,
  onSelectNode,
  onSelectCodeElement,
  onCodeRepaired,
  selectedCodeElement,
  stageTakeover,
}: CanvasPanelProps) {
  const { density, iconSet, theme, setTheme } = usePlatformContext();
  const renderer = useDcaRenderer();
  const deviceFrameRef = useRef<HTMLDivElement | null>(null);
  const resizeStartRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    width: number;
    height: number;
  } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [device, setDevice] = useState<DeviceSpec>(() => defaultDeviceFor(context));
  const [isResizingDevice, setIsResizingDevice] = useState(false);
  const [exportingPng, setExportingPng] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  // Collapsed by default. Debug trace is useful but visually dense — keep
  // it off the default view so the canvas stays readable at a glance.
  const [traceOpen, setTraceOpen] = useState(false);
  // Per-version rating cache so the buttons can show acknowledgment after
  // submit and prevent double-write. Keyed by version index because the
  // server insert is one row per (brand, version) submission and we don't
  // need cross-session persistence here — this is just UI affordance.
  const [ratedVersions, setRatedVersions] = useState<Record<number, Rating>>({});
  const [submittingRating, setSubmittingRating] = useState(false);

  // Critique state — keyed by version index so switching versions doesn't
  // leak a stale review onto a new composition. Setting `visible` to true
  // mounts the panel; the user can dismiss it without losing the cached
  // result so re-opening returns instantly.
  const [critiqueByVersion, setCritiqueByVersion] = useState<Record<number, CritiqueResponse | null>>({});
  const [critiqueLoading, setCritiqueLoading] = useState(false);
  const [critiqueError, setCritiqueError] = useState<string | null>(null);
  const [critiqueVisible, setCritiqueVisible] = useState(false);

  const submitFeedback = useMutation(api.compositionFeedback.submit);
  const createScenario = useMutation(api.compositionEval.createScenario);

  const data: CompositionASTData | null = selectedVersion?.data ?? null;
  const ast = data?.ast ?? null;
  const validation = data?.validation;
  // Code-mode payload (sandpack renderer). Coexists with `ast` because the
  // CompositionVersion type widens both shapes — only one is set per
  // version. The Sandpack branch below reads `code`; the AST branch reads `ast`.
  const code = (data as { code?: string } | null)?.code ?? null;
  const codeValidation = (data as { codeValidation?: { score?: number } } | null)?.codeValidation;
  const designGate = (data as { designGate?: { score: number; passed: boolean } } | null)?.designGate;
  const hasArtifact = Boolean(ast || code);
  const displayedScore = validation?.score ?? codeValidation?.score;

  // Auto-verify: stable hash for the current composition so we can
  // subscribe to the `renderedScreenshots` row the verify route writes
  // asynchronously. The same Convex column carries either an AST hash
  // or a `code:`-prefixed code hash — server `verify` route enforces the
  // namespacing so the two never collide.
  const astHash = useMemo(() => {
    if (code) return `code:${computeCodeHash(code)}`;
    if (ast) return computeASTHash(ast);
    return null;
  }, [ast, code]);
  // Reactive Convex query — flips from `[]` to a populated row when the
  // background verify call completes. The visual-alignment badge below
  // re-renders automatically when this resolves.
  const renderedRows = useQuery(
    api.renderedScreenshots.getByAstHash,
    astHash ? { astHash } : 'skip',
  );
  const visualAlignment = useMemo(() => {
    if (!renderedRows) return null;
    const withScore = renderedRows.find((r) => r.visualAlignment);
    return withScore?.visualAlignment ?? null;
  }, [renderedRows]);
  // Single-slot guard against the in-flight window between firing verify and
  // Convex returning the row. Only the current hash matters — switching
  // versions back to an older composition is fine because `renderedRows`
  // already short-circuits when a row exists. Memory is O(1).
  const lastFiredHashRef = useRef<string | null>(null);

  useEffect(() => {
    if (!astHash || (!ast && !code)) return;
    if (renderedRows === undefined) return; // query still loading
    if (renderedRows.length > 0) return;
    if (lastFiredHashRef.current === astHash) return;
    lastFiredHashRef.current = astHash;
    void fetch('/api/composition/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...(code ? { code } : { ast }),
        brandId,
        context: context ?? data?.context,
        viewports: ['mobile'],
      }),
    }).catch((err) => {
      console.error('[CanvasPanel] auto-verify failed:', err);
    });
  }, [astHash, ast, code, renderedRows, brandId, context, data]);

  // Click-to-select: walk up from the click target inside the device frame
  // until we find a `[data-ast-node-id]` ancestor. Lifts `{ id, type }` so
  // the parent can pin that node for the next revision request. Resolves
  // `type` from either a real component (`data-ast-component`, emitted by
  // ASTRenderer) or the unknown-fallback marker.
  const handleCanvasClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!onSelectNode) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const node = target.closest('[data-ast-node-id]') as HTMLElement | null;
      if (!node) {
        onSelectNode(null);
        return;
      }
      const id = node.getAttribute('data-ast-node-id');
      if (!id) return;
      const unknownType = node.getAttribute('data-ast-unknown');
      const type = unknownType ?? node.getAttribute('data-ast-component') ?? node.tagName.toLowerCase();
      onSelectNode({ id, type });
    },
    [onSelectNode],
  );

  const handleDeviceResizeStart = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const frame = deviceFrameRef.current;
      if (!frame) return;
      event.preventDefault();
      event.stopPropagation();
      const rect = frame.getBoundingClientRect();
      resizeStartRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        width: rect.width,
        height: rect.height,
      };
      setIsResizingDevice(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [],
  );

  const handleDeviceResizeMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const start = resizeStartRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    event.preventDefault();
    const nextWidth = clamp(
      Math.round(start.width + event.clientX - start.startX),
      MIN_DEVICE_WIDTH,
      MAX_DEVICE_WIDTH,
    );
    const nextHeight = clamp(
      Math.round(start.height + event.clientY - start.startY),
      MIN_DEVICE_HEIGHT,
      MAX_DEVICE_HEIGHT,
    );
    setDevice({
      label: 'Custom',
      width: nextWidth,
      height: nextHeight,
    });
  }, []);

  const handleDeviceResizeEnd = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const start = resizeStartRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    resizeStartRef.current = null;
    setIsResizingDevice(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  }, []);

  // Paint a `data-oneui-selected="true"` attribute on the DOM node whose
  // `data-ast-node-id` matches `selectedNodeId`. Runs after each render so
  // it catches nodes that React re-created on a version change. CSS handles
  // the visible outline.
  useEffect(() => {
    const frame = deviceFrameRef.current;
    if (!frame) return;
    const previous = frame.querySelectorAll('[data-oneui-selected="true"]');
    previous.forEach((el) => el.removeAttribute('data-oneui-selected'));
    if (!selectedNodeId) return;
    const match = frame.querySelector(
      `[data-ast-node-id="${CSS.escape(selectedNodeId)}"]`,
    );
    if (match instanceof HTMLElement) {
      match.setAttribute('data-oneui-selected', 'true');
    }
  }, [selectedNodeId, ast]);

  // Clear selection when switching to a different version: node ids are
  // stable per tree but a pinned id from v1 may not exist in v2.
  useEffect(() => {
    if (!onSelectNode || !selectedNodeId || !ast) return;
    const frame = deviceFrameRef.current;
    if (!frame) return;
    const stillExists = frame.querySelector(
      `[data-ast-node-id="${CSS.escape(selectedNodeId)}"]`,
    );
    if (!stillExists) onSelectNode(null);
  }, [selectedVersion?.index, ast, onSelectNode, selectedNodeId]);
  const currentRating: Rating | undefined = selectedVersion
    ? ratedVersions[selectedVersion.index]
    : undefined;

  const handleRate = useCallback(
    async (rating: Rating) => {
      if (!selectedVersion || (!ast && !code) || !brandId) return;
      // Already-rated guard — repeat clicks on a version that's already been
      // submitted are a no-op so we don't insert duplicate rows.
      if (ratedVersions[selectedVersion.index]) return;
      // Optimistic — flip UI immediately, but block the buttons during the
      // network round-trip so a quick double-tap can't insert two rows.
      setSubmittingRating(true);
      setRatedVersions((prev) => ({ ...prev, [selectedVersion.index]: rating }));
      const resolvedContext = context ?? data?.context ?? 'unknown';
      const promptForRow = selectedVersion.prompt || '(no prompt captured)';
      const generatedArtifact = ast
        ? JSON.stringify(ast)
        : JSON.stringify({ renderer: 'sandpack', code });
      const validationResult = validation ?? codeValidation;
      try {
        const insertedId = await submitFeedback({
          brandId: brandId as Id<'brands'>,
          source: 'playground',
          prompt: promptForRow,
          generatedAST: generatedArtifact,
          context: resolvedContext,
          rating,
          validationResult,
          annotation: code ? 'Sandpack TSX composition feedback.' : undefined,
        });
        // Auto-promote: positive AST ratings flow straight into the brand's
        // Evaluation scenario bank so designers see the prompt show up in
        // /evaluation immediately. Negative ratings are diagnostic and stay
        // in the Feedback inbox for triage (rule update vs reference vs
        // dismiss vs manual promote).
        if (rating === 'positive' && ast) {
          const title =
            promptForRow.length > 60 ? `${promptForRow.slice(0, 60)}…` : promptForRow;
          try {
            const scenarioInsertedId = await createScenario({
              brandId: brandId as Id<'brands'>,
              // Stable per-feedback id so the same rating click can't yield
              // two scenario rows even if React fires the handler twice.
              scenarioId: `feedback_${insertedId}`,
              category: 'general',
              title: title || 'Untitled scenario',
              description:
                'Auto-promoted from a positive playground rating. Edit to add expected behaviours.',
              prompt: promptForRow,
              context: resolvedContext,
              expectedBehaviors: [],
              forbiddenBehaviors: [],
              rubric: {},
              referenceAST: JSON.stringify(ast),
            });
            void scenarioInsertedId;
          } catch (scenarioErr) {
            // Don't fail the whole click — the feedback row is already in.
            // Surface the scenario error for diagnosis but keep the UI ack
            // so the user knows their rating was recorded.
            console.error('[CanvasPanel] auto-promote to scenario failed:', scenarioErr);
          }
        }
      } catch (err) {
        console.error('[CanvasPanel] feedback submit failed:', err);
        // Roll back the optimistic mark on failure so the user can retry.
        setRatedVersions((prev) => {
          const next = { ...prev };
          delete next[selectedVersion.index];
          return next;
        });
        setActionError(`Could not submit feedback: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setSubmittingRating(false);
      }
    },
    [
      ast,
      brandId,
      code,
      codeValidation,
      context,
      createScenario,
      data,
      ratedVersions,
      selectedVersion,
      submitFeedback,
      validation,
    ],
  );

  const requestCritique = useCallback(async () => {
    // Critique works in either renderer mode — send `code` in sandpack
    // mode, `ast` in legacy mode. The route accepts either; the prompt
    // adapts via `buildCritiquePrompt`'s `generatedCode` branch.
    if (!selectedVersion || (!ast && !code)) return;
    setCritiqueVisible(true);
    setCritiqueLoading(true);
    setCritiqueError(null);
    try {
      const res = await fetch('/api/composition/critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(code ? { code } : { ast }),
          context: context ?? data?.context,
          brandId,
          userPrompt: selectedVersion.prompt,
        }),
      });
      const payload = (await res.json()) as
        | { critique: CritiqueResponse; validation: unknown; context: string }
        | { error: string };
      if (!res.ok || 'error' in payload) {
        throw new Error('error' in payload ? payload.error : `HTTP ${res.status}`);
      }
      setCritiqueByVersion((prev) => ({ ...prev, [selectedVersion.index]: payload.critique }));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[CanvasPanel] critique failed:', err);
      setCritiqueError(message);
    } finally {
      setCritiqueLoading(false);
    }
  }, [ast, code, brandId, context, data, selectedVersion]);

  const handleCodeRepaired = useCallback(
    (repairedCode: string) => {
      if (selectedVersion) onCodeRepaired?.(selectedVersion.index, repairedCode);
    },
    [onCodeRepaired, selectedVersion],
  );

  // Reset error when the user switches versions — old failure shouldn't haunt
  // a new composition.
  useEffect(() => {
    setCritiqueError(null);
  }, [selectedVersion?.index]);

  const handleReviewClick = useCallback(() => {
    if (!selectedVersion) return;
    const cached = critiqueByVersion[selectedVersion.index];
    if (cached) {
      // Cached — just re-open the panel.
      setCritiqueVisible(true);
      setCritiqueError(null);
      return;
    }
    void requestCritique();
  }, [selectedVersion, critiqueByVersion, requestCritique]);

  const handleDownloadJson = useCallback(() => {
    if (!ast) return;
    setActionError(null);
    const blob = new Blob([JSON.stringify(ast, null, 2)], { type: 'application/json' });
    triggerDownload(`composition-v${selectedVersion?.index ?? 1}.json`, blob);
    setActionMenuOpen(false);
  }, [ast, selectedVersion]);

  const handleCopyJson = useCallback(async () => {
    if (!ast) return;
    setActionError(null);
    try {
      await navigator.clipboard.writeText(JSON.stringify(ast, null, 2));
    } catch (err) {
      setActionError(`Could not copy JSON: ${err instanceof Error ? err.message : String(err)}`);
    }
    setActionMenuOpen(false);
  }, [ast]);

  const handleDownloadPng = useCallback(async () => {
    if (!ast && !code) return;
    setExportingPng(true);
    setActionError(null);
    setActionMenuOpen(false);
    try {
      // Map the current DeviceSpec to a viewport slug that /api/composition/verify
      // recognises. Tablet / mobile / desktop are the built-ins.
      const viewport: 'mobile' | 'tablet' | 'desktop' =
        device.width <= 500 ? 'mobile' : device.width <= 900 ? 'tablet' : 'desktop';
      const res = await fetch('/api/composition/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(code ? { code } : { ast }),
          brandId,
          context,
          viewports: [viewport],
          exportOnly: true,
        }),
      });
      const payload = (await res.json()) as {
        results?: Array<{ url?: string }>;
        error?: string;
      };
      if (!res.ok || !payload.results?.[0]?.url) {
        throw new Error(payload.error ?? 'Export failed');
      }
      const pngRes = await fetch(payload.results[0].url);
      const blob = await pngRes.blob();
      triggerDownload(`composition-v${selectedVersion?.index ?? 1}.png`, blob);
    } catch (err) {
      console.error('[CanvasPanel] PNG export failed:', err);
      setActionError(`PNG export failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setExportingPng(false);
    }
  }, [ast, brandId, code, context, device.width, selectedVersion]);

  const title = useMemo(() => ast?.name ?? (code ? 'Live TSX composition' : 'Composition'), [ast, code]);
  const versionOptions = useMemo<Array<SelectOption<number>>>(
    () =>
      versions.map((v) => ({
        value: v.index,
        label: `v${v.index}${v.index === versions.length ? ' · latest' : ''}`,
      })),
    [versions],
  );

  return (
    <section className={s.canvasPanel} aria-label="Canvas">
      <header className={s.canvasHeader}>
        <div className={s.canvasHeaderLeft}>
          <h2 className={s.canvasTitle}>{title}</h2>
          {displayedScore !== undefined && (
            <Badge
              attention="medium"
              size="s"
              appearance={scoreAppearance(displayedScore)}
            >
              {code ? 'Code' : 'AST'}: {displayedScore}/100
            </Badge>
          )}
          {designGate && (
            <Badge
              attention="medium"
              size="s"
              appearance={scoreAppearance(designGate.score)}
            >
              Design: {designGate.score}/100
            </Badge>
          )}
          {hasArtifact && (
            visualAlignment ? (
              <span title="Visual alignment score from headless render + Claude vision judge. Updates automatically after each generation.">
                <Badge
                  attention="medium"
                  size="s"
                  appearance={scoreAppearance(visualAlignment.overall)}
                  aria-label={`Visual alignment ${visualAlignment.overall} of 100`}
                >
                  Visual: {Math.round(visualAlignment.overall)}/100
                </Badge>
              </span>
            ) : (
              renderedRows !== undefined && (
                <span title="Rendering composition in a headless browser, then asking Claude to score visual alignment…">
                  <Badge
                    attention="medium"
                    size="s"
                    appearance="neutral"
                    aria-label="Visual verification in progress"
                  >
                    Visual: …
                  </Badge>
                </span>
              )
            )
          )}
          {versions.length > 1 && selectedVersion && (
            <Select
              value={selectedVersion.index}
              onChange={onSelectVersion}
              options={versionOptions}
              size="sm"
              aria-label="Version"
              className={s.versionSelect}
            />
          )}
        </div>

        <div className={s.canvasHeaderRight}>
          {hasArtifact && (
            <>
              <DevicePicker value={device} onChange={setDevice} />
              <Select
                value={viewMode}
                onChange={setViewMode}
                options={VIEW_MODE_OPTIONS}
                size="sm"
                aria-label="Canvas view"
                className={s.viewModeSelect}
              />
              <Button
                appearance={
                  selectedVersion && critiqueByVersion[selectedVersion.index] !== undefined
                    ? 'primary'
                    : 'neutral'
                }
                attention="low"
                size="s"
                disabled={critiqueLoading}
                onPress={handleReviewClick}
                aria-label="Review this composition (5-dimension critique — Token, Surface, Hierarchy, Brand, Density)"
                start={<Icon name="search" />}
              >
                {critiqueLoading ? 'Reviewing…' : 'Review'}
              </Button>
              <div
                className={s.feedbackGroup}
                role="group"
                aria-label="Rate this composition"
              >
                <IconButton
                  icon={<Icon name="check" />}
                  appearance={currentRating === 'positive' ? 'positive' : 'neutral'}
                  attention={currentRating === 'positive' ? 'medium' : 'low'}
                  size="s"
                  aria-label="Mark as good — adds to Evaluation scenarios"
                  aria-pressed={currentRating === 'positive'}
                  // Once rated either way, the buttons lock so re-clicks
                  // don't insert duplicate feedback / scenario rows.
                  disabled={submittingRating || !brandId || currentRating !== undefined}
                  onPress={() => handleRate('positive')}
                />
                <IconButton
                  icon={<Icon name="close" />}
                  appearance={currentRating === 'negative' ? 'negative' : 'neutral'}
                  attention={currentRating === 'negative' ? 'medium' : 'low'}
                  size="s"
                  aria-label="Mark as bad — sends to Feedback inbox"
                  aria-pressed={currentRating === 'negative'}
                  disabled={submittingRating || !brandId || currentRating !== undefined}
                  onPress={() => handleRate('negative')}
                />
              </div>
              {ast && (
                <Menu open={actionMenuOpen} onOpenChange={setActionMenuOpen}>
                  <Menu.Trigger
                    render={
                      <IconButton
                        icon={<Icon name="menu" />}
                        appearance="neutral"
                        attention="low"
                        size="s"
                        aria-label="More actions"
                        aria-expanded={actionMenuOpen}
                      />
                    }
                  />
                  <Menu.Portal align="end">
                    <Menu.Item onClick={handleDownloadJson}>Download JSON</Menu.Item>
                    <Menu.Item onClick={handleCopyJson}>Copy JSON</Menu.Item>
                    <Menu.Item onClick={handleDownloadPng} disabled={exportingPng}>
                      {exportingPng ? 'Rendering PNG…' : 'Download PNG'}
                    </Menu.Item>
                  </Menu.Portal>
                </Menu>
              )}
              {code && (
                <Button
                  appearance="neutral"
                  attention="low"
                  size="s"
                  disabled={exportingPng}
                  onPress={handleDownloadPng}
                  start={<Icon name="download" />}
                >
                  {exportingPng ? 'Rendering…' : 'PNG'}
                </Button>
              )}
            </>
          )}
        </div>
      </header>

      {actionError && (
        <div className={s.canvasInlineError} role="alert">
          <span>{actionError}</span>
          <Button
            appearance="negative"
            attention="low"
            size="s"
            onPress={() => setActionError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      <div className={s.canvasStage} data-view={viewMode}>
        {stageTakeover ? (
          <div className={s.stageTakeover}>{stageTakeover}</div>
        ) : renderer === 'sandpack' ? (
          viewMode === 'preview' ? (
            <div
              ref={deviceFrameRef}
              className={s.canvasDeviceFrame}
              data-oneui-canvas="true"
              data-renderer="sandpack"
              data-resizing={isResizingDevice ? 'true' : undefined}
              style={{
                width: `${device.width}px`,
                height: device.height ? `${device.height}px` : undefined,
              }}
            >
              <SandpackCanvas
                code={code ?? undefined}
                theme={theme}
                density={density}
                platform={deviceToBreakpoint(device.width)}
                context={context}
                iconSet={iconSet}
                onSelectElement={onSelectCodeElement}
                onThemeChange={setTheme}
                onCodeRepaired={handleCodeRepaired}
              />
              <div
                role="separator"
                className={s.deviceResizeHandle}
                aria-label="Resize preview frame"
                aria-orientation="vertical"
                onPointerDown={handleDeviceResizeStart}
                onPointerMove={handleDeviceResizeMove}
                onPointerUp={handleDeviceResizeEnd}
                onPointerCancel={handleDeviceResizeEnd}
              />
              {selectedCodeElement && (
                <Button
                  className={s.pinnedCodeElement}
                  appearance="primary"
                  attention="medium"
                  size="s"
                  onPress={() => onSelectCodeElement?.(null)}
                  aria-label="Clear pinned code element"
                >
                  <span>Pinned</span>
                  <strong>{`<${selectedCodeElement.tag}>`}</strong>
                  <span className={s.pinnedCodeMeta}>{selectedCodeElement.loc}</span>
                  <span aria-hidden className={s.pinnedCodeMeta}>×</span>
                </Button>
              )}
            </div>
          ) : (
            <div className={s.codeViewWrap}>
              <div className={s.codeToolbar}>
                <Button
                  appearance="neutral"
                  attention="low"
                  size="s"
                  onPress={() => {
                    if (code) void navigator.clipboard.writeText(code);
                  }}
                  disabled={!code}
                >
                  Copy TSX
                </Button>
                <Button
                  appearance="neutral"
                  attention="low"
                  size="s"
                  onPress={() => {
                    if (!code) return;
                    triggerDownload(
                      `composition-v${selectedVersion?.index ?? 1}.tsx`,
                      new Blob([code], { type: 'text/plain;charset=utf-8' }),
                    );
                  }}
                  disabled={!code}
                >
                  Download
                </Button>
              </div>
              <pre className={s.codeIde}>
                <TsxHighlighter source={code ?? '// No composition generated yet.'} />
              </pre>
            </div>
          )
        ) : !ast ? (
          <EmptyState />
        ) : viewMode === 'preview' ? (
          <div
            ref={deviceFrameRef}
            className={s.canvasDeviceFrame}
            data-oneui-canvas="true"
            data-resizing={isResizingDevice ? 'true' : undefined}
            role="button"
            tabIndex={0}
            aria-label="Composition preview. Click an element to pin it for the next revision."
            onClick={handleCanvasClick}
            onKeyDown={(event) => {
              if (event.key === 'Escape') onSelectNode?.(null);
            }}
            style={{
              width: `${device.width}px`,
              height: device.height ? `${device.height}px` : undefined,
            }}
          >
            <ASTRenderer
              tree={ast as ASTRoot}
              mode="render"
              surfaceMode={(ast.surfaceMode as string | undefined) ?? 'default'}
              platform={deviceToBreakpoint(device.width)}
              density={density}
            />
            <div
              role="separator"
              className={s.deviceResizeHandle}
              aria-label="Resize preview frame"
              aria-orientation="vertical"
              onPointerDown={handleDeviceResizeStart}
              onPointerMove={handleDeviceResizeMove}
              onPointerUp={handleDeviceResizeEnd}
              onPointerCancel={handleDeviceResizeEnd}
            />
          </div>
        ) : (
          <pre className={s.codeIde}>
            <JsonHighlighter json={JSON.stringify(ast, null, 2)} />
          </pre>
        )}
      </div>

      {references.length > 0 && (
        <footer className={s.canvasFooter}>
          <span className={s.canvasFooterLabel}>References used</span>
          <div className={s.canvasFooterChips}>
            {references.map((r) => (
              <Badge key={r.screenId} attention="medium" size="s" appearance="neutral">
                {r.name} · {r.archetype}
              </Badge>
            ))}
          </div>
        </footer>
      )}

      {critiqueVisible && (
        <div className={s.critiqueWrap}>
          <CritiquePanel
            critique={
              selectedVersion ? critiqueByVersion[selectedVersion.index] ?? null : null
            }
            loading={critiqueLoading}
            error={critiqueError}
            onDismiss={() => setCritiqueVisible(false)}
            onRetry={requestCritique}
          />
        </div>
      )}

      {retrievalTrace && (
        <div className={s.retrievalTrace}>
          <Button
            className={s.retrievalTraceToggle}
            appearance="neutral"
            attention="low"
            size="s"
            onPress={() => setTraceOpen((v) => !v)}
          >
            <Icon name={traceOpen ? 'chevronDown' : 'chevronRight'} size="sm" />
            <span>Retrieval trace</span>
            <Badge attention="medium" size="s" appearance="informative">
              {retrievalTrace.kept.length} kept · {retrievalTrace.dropped.length} dropped
            </Badge>
          </Button>
          {traceOpen && (
            <RetrievalTracePanel
              trace={retrievalTrace}
              promptSize={retrievalPromptSize}
            />
          )}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Empty state — quiet neutral slate. The chat-side greeting carries the
// suggestions; the canvas only needs to confirm there's nothing to render.
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className={s.emptyState}>
      <p className={s.emptyStateLine}>
        No composition yet — describe one in the chat.
      </p>
    </div>
  );
}
