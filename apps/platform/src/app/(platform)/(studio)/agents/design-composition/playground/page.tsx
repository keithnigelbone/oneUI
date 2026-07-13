/**
 * agents/design-composition/playground/page.tsx
 *
 * Playground v2 — artifact-first layout. Chat on the left (~35%), canvas on
 * the right (~65%), default split. Mirrors the Claude Design / v0 / ChatGPT
 * Canvas shape: the artifact is the centre of gravity; the chat is context.
 *
 * Wires two new server features:
 *   - Revision mode: next prompt includes the currently-selected AST so the
 *     agent produces a delta, not a rebuild. Toggled via the "Revise" pill.
 *   - PNG/JSON export: canvas panel triggers client-side blob downloads; PNG
 *     reuses `/api/composition/verify?exportOnly=true` for headless rendering.
 */

'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react';
import { Id } from '@oneui/convex/_generated/dataModel';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { Icon } from '@oneui/ui/icons/Icon';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Button } from '@oneui/ui/components/Button';
import { Checkbox } from '@oneui/ui/components/Checkbox';
import { Select, type SelectOption } from '@oneui/ui/components/Select';
import {
  ChatSurface,
  defaultRenderMessagePart,
  isCompositionASTPart,
  isCompositionCodePart,
  isCompositionErrorPart,
  isCompositionReferencesPart,
  ASTPreviewCard,
  CompositionCodePreviewCard,
  type CompositionReferenceSummary,
  type RenderMessagePart,
} from '@oneui/ui/components/ChatSurface';
import type { CompositionContext } from '@oneui/shared/engine';
import type { ASTRoot, CompositionValidationResult } from '@oneui/shared';
import { useAgentChat } from '@/hooks/useAgentChat';
import IcHellojio from '@/Jio_Icons/icons/IcHellojio';
import { CanvasPanel } from './CanvasPanel';
import { useDcaRenderer } from './useDcaRenderer';
import { useCompositionVersions, type CompositionVersion } from './useCompositionVersions';
import {
  DirectionPicker,
  type DirectionEntry,
  type DirectionResult,
} from './DirectionPicker';
import {
  GENERATION_PHASE_SPECS,
  type GenerationPhase,
} from '@oneui/shared/engine';
import s from './playground.module.css';

// ─── Types ────────────────────────────────────────────────────────────────

export type GenMode = 'single' | 'explore' | 'phased';

// ─── Constants ──────────────────────────────────────────────────────────────

const CONTEXTS: Array<SelectOption<CompositionContext>> = [
  { value: 'mobile-app', label: 'Mobile App' },
  { value: 'web-app', label: 'Web App' },
  { value: 'marketing-page', label: 'Marketing' },
  { value: 'social-post', label: 'Social Post' },
  { value: 'print', label: 'Print' },
  { value: 'outdoor', label: 'Outdoor' },
];

function summarizeGateIssues(message: string) {
  const issueLines = message
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- [ERROR]') || line.startsWith('- [WARNING]'));
  return {
    issueCount: issueLines.length,
    preview: issueLines
      .slice(0, 3)
      .map((line) => line.replace(/^-\s+\[(ERROR|WARNING)\]\s*/, '')),
  };
}

function CompositionGateErrorCard({ message }: { message: string }) {
  const [expanded, setExpanded] = useState(false);
  const { issueCount, preview } = summarizeGateIssues(message);
  const hasStrictIssues = issueCount > 0;
  return (
    <div className={s.gateErrorCard} role="alert">
      <div className={s.gateErrorHeader}>
        <Icon name="warning" size="sm" />
        <div className={s.gateErrorCopy}>
          <strong>
            {hasStrictIssues
              ? 'Generation blocked by the strict render gate'
              : 'Generation did not finish'}
          </strong>
          <span>
            {hasStrictIssues
              ? 'No preview was rendered because the TSX still had design-system violations after repair.'
              : 'No preview was rendered because the model response did not complete cleanly.'}
          </span>
        </div>
      </div>
      {preview.length > 0 && (
        <ul className={s.gateErrorList}>
          {preview.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      )}
      <div className={s.gateErrorActions}>
        <Button
          size="s"
          attention="low"
          appearance="negative"
          onPress={() => setExpanded((value) => !value)}
        >
          {expanded ? 'Hide diagnostics' : `Show ${issueCount || 'all'} diagnostics`}
        </Button>
      </div>
      {expanded && <pre className={s.gateErrorDetails}>{message}</pre>}
    </div>
  );
}

const CONTEXT_SUGGESTIONS: Record<CompositionContext, string[]> = {
  'mobile-app': [
    'E-commerce home app with search, categories, hero carousel, and deals',
    'Create a login screen with OTP and password options',
    'Build a settings page with privacy and notification controls',
    'Design a product detail page with gallery, price, and add-to-cart',
  ],
  'web-app': [
    'Analytics dashboard with metric cards, charts, and activity feed',
    'Create account settings with profile, billing, and security sections',
    'Build a user profile page with avatar, form fields, and audit history',
    'Design a data table workspace with filters and bulk actions',
  ],
  'marketing-page': [
    'Jio e-commerce homepage with search, hero, categories, and deals',
    'Design a product launch page with hero, feature grid, and CTA',
    'Build a pricing comparison section for three plans',
    'Design a testimonial section with customer avatars and proof points',
  ],
  'social-post': [
    'Design an Instagram post announcing a new feature',
    'Create a Facebook banner for a sale event',
    'Build a LinkedIn announcement card',
  ],
  print: [
    'Design an A4 product brochure cover',
    'Create a DL flyer for a store opening',
    'Design a business card with brand elements',
  ],
  outdoor: [
    'Design a 48-sheet billboard for a new product launch',
    'Create a bus shelter ad with bold headline',
    'Design a minimal 6-sheet poster',
  ],
};

const MODE_OPTIONS: Array<SelectOption<GenMode>> = [
  { value: 'single', label: 'Single' },
  { value: 'explore', label: 'Explore' },
  { value: 'phased', label: 'Phased' },
];

const SPLIT_WIDTH_STORAGE_KEY = 'oneui.dca.playground.chatWidth.v3';
const DEFAULT_CHAT_WIDTH = 520;
const MIN_CHAT_WIDTH = 420;
const MAX_CHAT_WIDTH = 760;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Status phrases that cycle next to the spinner while a generation is
 * in flight. Ordered roughly along the agent's actual phases (read
 * references → plan → compose → polish → validate) so the rotation
 * gives the user a believable narration of what's happening even
 * though the agent doesn't emit per-phase events.
 */
const SINGLE_THINKING_MESSAGES: ReadonlyArray<string> = [
  'Reading the brief…',
  'Pulling brand foundations…',
  'Browsing reference compositions…',
  'Sketching a layout structure…',
  'Choosing components for each slot…',
  'Tuning typography and spacing…',
  'Picking colour roles and surfaces…',
  'Validating tokens and accessibility…',
  'Polishing the result…',
];

const EXPLORE_THINKING_MESSAGES: ReadonlyArray<string> = [
  'Reading the brief…',
  'Branching into three directions…',
  'Drafting a conservative take…',
  'Drafting a balanced take…',
  'Drafting an expressive take…',
  'Validating each direction…',
];

const PHASED_THINKING_MESSAGES: Record<GenerationPhase, ReadonlyArray<string>> = {
  skeleton: [
    'Reading the brief…',
    'Mapping required slots…',
    'Drawing the wireframe skeleton…',
  ],
  components: [
    'Loading the prior skeleton…',
    'Selecting components for each slot…',
    'Resolving brand foundations…',
    'Validating component choices…',
  ],
  polish: [
    'Loading the composed layout…',
    'Refining spacing and rhythm…',
    'Tuning typography and weight…',
    'Final accessibility check…',
  ],
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function CompositionPlaygroundPage() {
  const { currentBrand } = usePlatformContext();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;
  const brandName = currentBrand?.name;
  // Renderer flag — flipped via `?renderer=sandpack` (persists to localStorage).
  // Decides whether the executor emits AST or TSX, and whether the canvas
  // mounts ASTRenderer or SandpackCanvas.
  const renderer = useDcaRenderer();

  const [context, setContext] = useState<CompositionContext>('mobile-app');
  const [composerValue, setComposerValue] = useState('');
  const [useReferences, setUseReferences] = useState(true);
  // Iteration is the default once a version exists. The "Fresh" pill is a
  // one-shot override that suppresses `previousAST` for the next send so the
  // server runs a clean generation instead of a delta.
  const [freshMode, setFreshMode] = useState(false);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState<number | null>(null);
  // Pinned canvas element for the next revision. Cleared when the user
  // dismisses the chip, when the selected version changes to one that
  // doesn't contain that node, or when the next send succeeds.
  const [selectedNode, setSelectedNode] = useState<{ id: string; type: string } | null>(null);
  // Code-mode selection — set when the user clicks an annotated JSX
  // element in the Sandpack iframe. Coexists with `selectedNode` (AST
  // mode) on the same state slot conceptually but as separate fields
  // so a renderer flip doesn't drop the wrong shape into the body.
  const [selectedCodeElement, setSelectedCodeElement] = useState<
    { loc: string; tag: string } | null
  >(null);
  const [chatWidth, setChatWidth] = useState(DEFAULT_CHAT_WIDTH);
  const [hasPinnedChatWidth, setHasPinnedChatWidth] = useState(false);
  const [isResizingSplit, setIsResizingSplit] = useState(false);
  const splitDragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const chatHalfRef = useRef<HTMLDivElement | null>(null);
  const chatWidthRef = useRef(DEFAULT_CHAT_WIDTH);
  const [codeOverrides, setCodeOverrides] = useState<Record<number, string>>({});

  // -- Explore-directions state -------------------------------------------
  // Lifted to the page so the picker can dominate the canvas stage while
  // active. Picked directions become synthetic "explore versions" merged
  // into the version stack alongside chat-derived ones — that lets the
  // existing CanvasPanel render either source without branching logic.
  const [exploreOpen, setExploreOpen] = useState(false);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [exploreError, setExploreError] = useState<string | null>(null);
  const [exploreDirections, setExploreDirections] = useState<DirectionEntry[]>([]);
  const [explorePrompt, setExplorePrompt] = useState<string>('');
  const [pickedExploreVersions, setPickedExploreVersions] = useState<
    Array<{
      ast: ASTRoot;
      validation: CompositionValidationResult;
      context: string;
      prompt: string;
      directionId: string;
    }>
  >([]);

  // -- Phased generation state (junior-designer workflow) -----------------
  // The user toggles into phased mode, then advances skeleton → components
  // → polish manually. Each phase's output is appended to `phasedVersions`
  // so the user can step back to any phase from the version dropdown.
  // `currentPhase` is derived from `phasedVersions.length`; `phasedMode`
  // is derived from the segmented control's `mode` (declared below).
  const [phasedLoading, setPhasedLoading] = useState(false);
  const [phasedError, setPhasedError] = useState<string | null>(null);
  const [phasedVersions, setPhasedVersions] = useState<
    Array<{
      ast: ASTRoot;
      validation: CompositionValidationResult;
      context: string;
      prompt: string;
      phase: GenerationPhase;
    }>
  >([]);
  const currentPhase: GenerationPhase =
    phasedVersions.length === 0
      ? 'skeleton'
      : phasedVersions.length === 1
      ? 'components'
      : 'polish';

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SPLIT_WIDTH_STORAGE_KEY);
      if (!stored) return;
      const parsed = Number.parseInt(stored, 10);
      if (Number.isFinite(parsed)) {
        const nextWidth = clamp(parsed, MIN_CHAT_WIDTH, MAX_CHAT_WIDTH);
        chatWidthRef.current = nextWidth;
        setChatWidth(nextWidth);
        setHasPinnedChatWidth(true);
      }
    } catch {
      // Non-critical; the layout simply falls back to the default width.
    }
  }, []);

  const handleSplitPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      const currentWidth = clamp(
        chatHalfRef.current?.getBoundingClientRect().width ?? chatWidth,
        MIN_CHAT_WIDTH,
        MAX_CHAT_WIDTH,
      );
      chatWidthRef.current = currentWidth;
      splitDragRef.current = {
        startX: event.clientX,
        startWidth: currentWidth,
      };
      setIsResizingSplit(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [chatWidth],
  );

  const handleSplitPointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const start = splitDragRef.current;
    if (!start) return;
    const nextWidth = clamp(
      start.startWidth + event.clientX - start.startX,
      MIN_CHAT_WIDTH,
      MAX_CHAT_WIDTH,
    );
      chatWidthRef.current = nextWidth;
    setChatWidth(nextWidth);
  }, []);

  const handleSplitPointerUp = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!splitDragRef.current) return;
    splitDragRef.current = null;
    setIsResizingSplit(false);
    setHasPinnedChatWidth(true);
    try {
      window.localStorage.setItem(SPLIT_WIDTH_STORAGE_KEY, String(chatWidthRef.current));
    } catch {
      // Non-critical persistence failure.
    }
    event.currentTarget.releasePointerCapture(event.pointerId);
  }, []);

  // -- Chat transport ------------------------------------------------------

  // Pending revision payload — set immediately before sendMessage fires so
  // the transport's body() call at request time sees it. Cleared after send.
  // Holds either AST-shape (`previousAST`) or code-shape (`previousCode`)
  // depending on which renderer is active.
  const pendingRevisionRef = useRef<
    | {
        previousAST?: string;
        previousCode?: string;
        selectedNodeId?: string;
        selectedNodeType?: string;
        selectedNodeLoc?: string;
        selectedNodeTag?: string;
        revisionInstruction?: string;
      }
    | null
  >(null);

  const bodyProvider = useCallback(
    () => {
      const pending = pendingRevisionRef.current;
      pendingRevisionRef.current = null; // consume
      return {
        brandName,
        // Passed through to the design executor so it can invoke the
        // hybrid-RAG retrieval action. Without a brandId the executor
        // falls back to the deterministic compile (RFC 0002).
        brandId,
        context,
        useReferences,
        // Renderer mode — `'sandpack'` flips the executor to TSX output
        // and the canvas to the Sandpack iframe path. Defaulted client-side
        // by `useDcaRenderer`; server treats absence as `'ast'`.
        renderer,
        // Revision payload only attached when the Revise pill was active.
        // Server re-frames the prompt as "apply this change, keep unchanged
        // sections intact." If absent, the prompt runs as a fresh generation.
        ...(pending
          ? {
              ...(pending.previousAST ? { previousAST: pending.previousAST } : {}),
              ...(pending.previousCode ? { previousCode: pending.previousCode } : {}),
              ...(pending.revisionInstruction
                ? { revisionInstruction: pending.revisionInstruction }
                : {}),
              ...(pending.selectedNodeId
                ? {
                    selectedNodeId: pending.selectedNodeId,
                    selectedNodeType: pending.selectedNodeType,
                  }
                : {}),
              ...(pending.selectedNodeLoc
                ? {
                    selectedNodeLoc: pending.selectedNodeLoc,
                    selectedNodeTag: pending.selectedNodeTag,
                  }
                : {}),
            }
          : {}),
      };
    },
    [brandName, brandId, context, useReferences, renderer],
  );

  const { messages, sendMessage, status, error } = useAgentChat({
    mode: 'design',
    body: bodyProvider,
  });

  const isStreaming = status === 'streaming' || status === 'submitted';

  // -- Derived state: versions + references -------------------------------

  const { versions: chatVersions } = useCompositionVersions(messages);

  // Merged version list — chat-derived ASTs followed by explore-picked ones.
  // Both sources share the same shape so CanvasPanel doesn't branch on
  // origin. Indices are recomputed sequentially across the merged list so
  // "v3" always means the third generation in this session, regardless of
  // which path produced it.
  const versions: CompositionVersion[] = useMemo(() => {
    const exploreVersions: CompositionVersion[] = pickedExploreVersions.map(
      (entry, i) => ({
        index: chatVersions.length + i + 1,
        data: { ast: entry.ast, validation: entry.validation, context: entry.context },
        prompt: `[Explore: ${entry.directionId}] ${entry.prompt}`,
        messageId: `explore-${entry.directionId}-${i}`,
        partIndex: 0,
      }),
    );
    const phasedVerEntries: CompositionVersion[] = phasedVersions.map((entry, i) => ({
      index: chatVersions.length + exploreVersions.length + i + 1,
      data: { ast: entry.ast, validation: entry.validation, context: entry.context },
      prompt: `[Phase: ${entry.phase}] ${entry.prompt}`,
      messageId: `phased-${entry.phase}-${i}`,
      partIndex: 0,
    }));
    return [...chatVersions, ...exploreVersions, ...phasedVerEntries].map((version) => {
      const repairedCode = codeOverrides[version.index];
      if (!repairedCode || !version.data.code) return version;
      return {
        ...version,
        data: {
          ...version.data,
          code: repairedCode,
        },
      };
    });
  }, [chatVersions, codeOverrides, pickedExploreVersions, phasedVersions]);

  const latest = versions.length > 0 ? versions[versions.length - 1] : null;

  const selectedVersion = useMemo(() => {
    if (selectedVersionIndex === null) return latest;
    return versions.find((v) => v.index === selectedVersionIndex) ?? latest;
  }, [latest, selectedVersionIndex, versions]);

  const latestReferences: CompositionReferenceSummary[] = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const parts = messages[i].parts ?? [];
      for (let j = parts.length - 1; j >= 0; j--) {
        const p = parts[j] as { type: string } & Record<string, unknown>;
        if (isCompositionReferencesPart(p)) {
          return p.data.references;
        }
      }
    }
    return [];
  }, [messages]);

  // -- Composer handlers ---------------------------------------------------

  const handleSubmit = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      // Iterate by default: whenever a version exists, attach `previousAST`
      // so the server treats the next prompt as a delta. The "Fresh" pill
      // (one-shot) explicitly opts out — useful when the user wants to
      // start a new composition from the same chat thread. Pinning a
      // canvas element strengthens iteration with `selectedNodeId`.
      const shouldIterate = !freshMode && Boolean(selectedVersion);
      if (shouldIterate && selectedVersion) {
        const versionData = selectedVersion.data;
        const isCodeVersion = Boolean(versionData.code);
        pendingRevisionRef.current = isCodeVersion
          ? {
              previousCode: versionData.code,
              revisionInstruction: trimmed,
              // selectedNodeLoc / selectedNodeTag come from the iframe
              // selection bridge — clicking a JSX element inside the
              // Sandpack iframe sets `selectedCodeElement`, and the
              // server-side annotator put data-oneui-loc on every
              // element so the click maps back to a source range.
              ...(selectedCodeElement
                ? {
                    selectedNodeLoc: selectedCodeElement.loc,
                    selectedNodeTag: selectedCodeElement.tag,
                  }
                : {}),
            }
          : {
              previousAST: JSON.stringify(versionData.ast),
              revisionInstruction: trimmed,
              selectedNodeId: selectedNode?.id,
              selectedNodeType: selectedNode?.type,
            };
      }
      sendMessage({ text: trimmed });
      // One-shot reset — user has to opt back in to fresh on the next send.
      if (freshMode) setFreshMode(false);
    },
    [freshMode, selectedNode, selectedCodeElement, selectedVersion, sendMessage],
  );

  // -- Explore-directions handlers ----------------------------------------

  const handleExplore = useCallback(async () => {
    const trimmed = composerValue.trim();
    if (!trimmed) return;
    setExploreOpen(true);
    setExploreLoading(true);
    setExploreError(null);
    setExploreDirections([]);
    setExplorePrompt(trimmed);
    try {
      const res = await fetch('/api/canvas/explore-directions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmed,
          brandName,
          context,
        }),
      });
      const payload = (await res.json()) as
        | { directions: DirectionEntry[]; context: string }
        | { error: string };
      if (!res.ok || 'error' in payload) {
        throw new Error('error' in payload ? payload.error : `HTTP ${res.status}`);
      }
      setExploreDirections(payload.directions);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[playground] explore-directions failed:', err);
      setExploreError(message);
    } finally {
      setExploreLoading(false);
    }
  }, [composerValue, brandName, context]);

  const handlePickDirection = useCallback(
    (direction: DirectionResult) => {
      // Promote the picked AST into the version stack so the rest of the
      // playground (CanvasPanel, critique, auto-verify) treats it like any
      // other version — no special-casing.
      setPickedExploreVersions((prev) => [
        ...prev,
        {
          ast: direction.ast,
          validation: direction.validation,
          context,
          prompt: explorePrompt,
          directionId: direction.id,
        },
      ]);
      setExploreOpen(false);
      setExploreDirections([]);
    },
    [context, explorePrompt],
  );

  const handleDismissExplore = useCallback(() => {
    setExploreOpen(false);
  }, []);

  // -- Phased generation handlers -----------------------------------------

  const handleRunPhase = useCallback(async () => {
    const trimmed = composerValue.trim();
    if (!trimmed) return;
    setPhasedLoading(true);
    setPhasedError(null);
    try {
      // Find the most recent phased AST as the priorAst for non-skeleton phases.
      const priorEntry = [...phasedVersions]
        .reverse()
        .find((v) =>
          currentPhase === 'components' ? v.phase === 'skeleton' :
          currentPhase === 'polish' ? v.phase === 'components' :
          false,
        );
      const priorAst = priorEntry ? JSON.stringify(priorEntry.ast) : undefined;
      if (currentPhase !== 'skeleton' && !priorAst) {
        throw new Error(
          `No prior ${currentPhase === 'components' ? 'skeleton' : 'components'} output found — run earlier phases first.`,
        );
      }

      const res = await fetch('/api/canvas/generate/phased', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: currentPhase,
          prompt: trimmed,
          brandName,
          context,
          priorAst,
        }),
      });
      const payload = (await res.json()) as
        | {
            phase: GenerationPhase;
            ast: ASTRoot;
            validation: CompositionValidationResult;
            context: string;
          }
        | { error: string };
      if (!res.ok || 'error' in payload) {
        throw new Error('error' in payload ? payload.error : `HTTP ${res.status}`);
      }
      setPhasedVersions((prev) => [
        ...prev,
        {
          ast: payload.ast,
          validation: payload.validation,
          context: payload.context,
          prompt: trimmed,
          phase: payload.phase,
        },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[playground] phased generate failed:', err);
      setPhasedError(message);
    } finally {
      setPhasedLoading(false);
    }
  }, [composerValue, brandName, context, currentPhase, phasedVersions]);

  const handleResetPhases = useCallback(() => {
    setPhasedVersions([]);
    setPhasedError(null);
  }, []);

  const suggestions = useMemo(
    () => (CONTEXT_SUGGESTIONS[context] ?? []).slice(0, 3),
    [context],
  );

  // -- Composer chrome -----------------------------------------------------

  const phaseLabel = useMemo(
    () =>
      GENERATION_PHASE_SPECS.find((p) => p.id === currentPhase)?.label ?? currentPhase,
    [currentPhase],
  );

  const [mode, setMode] = useState<GenMode>('single');
  const phasedMode = mode === 'phased';

  // Pick the rotation set that matches the active mode so the narrated
  // progress matches what the server is actually doing.
  const thinkingMessages = useMemo<ReadonlyArray<string>>(() => {
    if (mode === 'phased') return PHASED_THINKING_MESSAGES[currentPhase];
    if (mode === 'explore') return EXPLORE_THINKING_MESSAGES;
    return SINGLE_THINKING_MESSAGES;
  }, [mode, currentPhase]);

  const handleModeChange = useCallback(
    (next: GenMode) => {
      setMode((prev) => (prev === next ? prev : next));
      if (next !== 'explore') setExploreOpen(false);
    },
    [],
  );

  const handleSendPress = useCallback(() => {
    const trimmed = composerValue.trim();
    if (!trimmed) return;
    if (phasedMode) {
      handleRunPhase();
    } else if (mode === 'explore') {
      handleExplore();
    } else {
      handleSubmit(composerValue);
    }
  }, [composerValue, phasedMode, mode, handleRunPhase, handleExplore, handleSubmit]);

  const sendDisabled =
    composerValue.trim().length === 0 ||
    (phasedMode ? phasedLoading : mode === 'explore' ? exploreLoading : isStreaming);

  const isIterating = !freshMode && Boolean(selectedVersion);
  const sendAriaLabel =
    phasedMode
      ? `Run ${phaseLabel} phase`
      : mode === 'explore'
      ? 'Explore three differentiated directions'
      : isIterating
      ? `Iterate on v${selectedVersion?.index}`
      : 'Generate';

  const trailing = (
    <div className={s.composerTrailing}>
      <IconButton
        icon={<Icon name="arrowUp" />}
        appearance="primary"
        attention="high"
        size="s"
        aria-label={sendAriaLabel}
        disabled={sendDisabled}
        onPress={handleSendPress}
      />
    </div>
  );

  const modeOptions = useMemo(
    () =>
      MODE_OPTIONS.map((option) => ({
        ...option,
        disabled:
          option.value === 'single'
            ? isStreaming || phasedLoading || exploreLoading
            : option.value === 'explore'
            ? isStreaming || phasedLoading || exploreLoading
            : isStreaming || exploreLoading,
      })),
    [exploreLoading, isStreaming, phasedLoading],
  );

  const settingsBar = (
    <div className={s.promptSettingsBar} aria-label="Prompt settings">
      <div className={s.promptSettingsMain}>
        <Select
          value={context}
          onChange={setContext}
          options={CONTEXTS}
          size="sm"
          aria-label="Composition context"
          className={s.promptSelect}
        />
        <Select
          value={mode}
          onChange={handleModeChange}
          options={modeOptions}
          size="sm"
          aria-label="Generation mode"
          className={s.promptSelect}
        />
      </div>
      <div className={s.promptSettingsActions}>
        <Checkbox
          size="m"
          checked={useReferences}
          onCheckedChange={setUseReferences}
          appearance="neutral"
          label="Use references"
        />
        {selectedVersion && !freshMode && (
          <Button
            size="s"
            attention="low"
            appearance="neutral"
            onPress={() => setFreshMode(true)}
            aria-label="Start a new composition on the next send"
          >
            Start fresh
          </Button>
        )}
        {selectedNode && (
          <Button
            size="s"
            attention="medium"
            appearance="primary"
            onPress={() => setSelectedNode(null)}
          >
            Focus: {selectedNode.type}
          </Button>
        )}
        {phasedMode && phasedVersions.length > 0 && (
          <Button
            size="s"
            attention="low"
            appearance="neutral"
            onPress={handleResetPhases}
          >
            Reset phases
          </Button>
        )}
      </div>
      {phasedError && (
        <span className={s.promptError} role="alert">
          {phasedError}
        </span>
      )}
    </div>
  );

  // Phase progress strip — visible only while Phased mode is on. Shows the
  // user where they are in skeleton → components → polish so they don't
  // have to guess what the next "Run" press will execute.
  const phaseProgressStrip = phasedMode ? (
    <div className={s.phaseProgress} role="status" aria-label="Phase progress">
      {GENERATION_PHASE_SPECS.map((spec, idx) => {
        const stepIndex = idx;
        const completedCount = phasedVersions.length;
        const state =
          stepIndex < completedCount
            ? 'done'
            : stepIndex === completedCount
            ? 'active'
            : 'pending';
        return (
          <span key={spec.id} className={s.phaseProgressItem}>
            <span className={s.phaseStep} data-state={state}>
              <span className={s.phaseStepDot} aria-hidden="true" />
              {spec.label}
              {state === 'done' ? ' ✓' : ''}
            </span>
            {idx < GENERATION_PHASE_SPECS.length - 1 && (
              <span className={s.phaseSeparator} aria-hidden="true">
                →
              </span>
            )}
          </span>
        );
      })}
    </div>
  ) : null;

  const belowComposer = (
    <div className={s.composerSettingsStack}>
      {settingsBar}
      {phaseProgressStrip}
    </div>
  );

  // -- Custom part renderer — AST parts become compact chips inside chat ---
  //    since the canvas panel has its own dedicated preview. This keeps the
  //    chat rail lightweight and avoids two preview surfaces on screen.

  const renderMessagePart: RenderMessagePart = useCallback(
    (part, context) => {
      if (isCompositionASTPart(part)) {
        // Find the version index for this part so the chip can show "v2" etc.
        const version = versions.find(
          (v) => v.data.ast === part.data.ast,
        );
        return (
          <ASTPreviewCard
            part={part}
            variant="chip"
            versionLabel={version ? `v${version.index}` : undefined}
            onOpenInCanvas={() => {
              if (version) setSelectedVersionIndex(version.index);
            }}
          />
        );
      }
      if (isCompositionCodePart(part)) {
        const version = versions.find((v) => v.data.code === part.data.code);
        return (
          <CompositionCodePreviewCard
            part={part}
            variant="chip"
            versionLabel={version ? `v${version.index}` : undefined}
            onOpenInCanvas={() => {
              if (version) setSelectedVersionIndex(version.index);
            }}
          />
        );
      }
      if (isCompositionErrorPart(part)) {
        return <CompositionGateErrorCard message={part.data.message} />;
      }
      return defaultRenderMessagePart(part, context);
    },
    [versions],
  );

  // ─── Guard states ───────────────────────────────────────────────────────

  if (!brandId) {
    return (
      <div className={s.guardState}>
        <p className={s.guardText}>Select a brand to use the playground.</p>
      </div>
    );
  }

  const workspaceOpen = versions.length > 0 || exploreOpen || phasedVersions.length > 0;

  const greetingNode = (
    <div className={s.greeting}>
      <div className={s.greetingIcon} aria-hidden="true">
        <IcHellojio />
      </div>
      <h1 className={s.greetingTitle}>
        Composition Playground
      </h1>
      <p className={s.greetingBody}>
        Describe the screen you want. The canvas opens when the first composition is ready.
      </p>
      {!workspaceOpen && (
        <div className={s.greetingSuggestions} aria-label="Suggested prompts">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion}
              size="s"
              attention="low"
              appearance="neutral"
              onPress={() => setComposerValue(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}
    </div>
  );

  const workspaceStyle = workspaceOpen
    ? ({
        gridTemplateColumns: hasPinnedChatWidth
          ? `minmax(calc(var(--Spacing-40) * 2.6), ${chatWidth}px) var(--playground-divider-width, var(--Stroke-M)) minmax(calc(var(--Spacing-40) * 3), 1fr)`
          : 'minmax(calc(var(--Spacing-40) * 2.6), 36%) var(--playground-divider-width, var(--Stroke-M)) minmax(calc(var(--Spacing-40) * 4), 1fr)',
      } as CSSProperties)
    : undefined;

  return (
    <div
      className={workspaceOpen ? s.splitLayout : s.chatFirstLayout}
      data-resizing={isResizingSplit ? 'true' : undefined}
      data-chat-width={workspaceOpen && hasPinnedChatWidth ? 'pinned' : undefined}
      style={workspaceStyle}
    >
      <div ref={chatHalfRef} className={s.chatHalf}>
        <ChatSurface
          className={workspaceOpen ? s.chatSurfaceSplit : undefined}
          messages={messages}
          status={status}
          error={error ?? null}
          onSubmit={handleSubmit}
          value={composerValue}
          onValueChange={setComposerValue}
          greeting={greetingNode}
          agentIcon={<IcHellojio />}
          thinkingMessages={thinkingMessages}
          belowComposer={belowComposer}
          composerProps={{
            placeholder: isIterating
              ? 'Describe a change (e.g. make the CTA bolder)…'
              : 'Describe a composition…',
            trailing,
          }}
          renderMessagePart={renderMessagePart}
        />
      </div>
      {workspaceOpen && (
        <div
          role="separator"
          className={s.splitDivider}
          aria-label="Resize chat and canvas panels"
          aria-orientation="vertical"
          onPointerDown={handleSplitPointerDown}
          onPointerMove={handleSplitPointerMove}
          onPointerUp={handleSplitPointerUp}
          onPointerCancel={handleSplitPointerUp}
        />
      )}
      {workspaceOpen && (
        <CanvasPanel
          versions={versions}
          selectedVersion={selectedVersion}
          onSelectVersion={(idx) => {
            setSelectedVersionIndex(idx);
            // Different version — old node id likely doesn't exist in the new
            // tree. CanvasPanel also guards this, but clearing here keeps the
            // composer chip in sync with what the user can see.
            setSelectedNode(null);
            setSelectedCodeElement(null);
          }}
          references={latestReferences}
          retrievalTrace={selectedVersion?.retrieval?.trace}
          retrievalPromptSize={selectedVersion?.retrieval?.promptSize}
          brandId={brandId}
          context={context}
          selectedNodeId={selectedNode?.id ?? null}
          onSelectNode={setSelectedNode}
          selectedCodeElement={selectedCodeElement}
          onSelectCodeElement={setSelectedCodeElement}
          onCodeRepaired={(versionIndex, repairedCode) => {
            setCodeOverrides((prev) => ({ ...prev, [versionIndex]: repairedCode }));
          }}
          stageTakeover={
            exploreOpen ? (
              <DirectionPicker
                directions={exploreDirections}
                loading={exploreLoading}
                error={exploreError}
                prompt={explorePrompt}
                onPick={handlePickDirection}
                onDismiss={handleDismissExplore}
                onRetry={handleExplore}
              />
            ) : null
          }
        />
      )}
    </div>
  );
}
