/**
 * runStream.ts
 *
 * The NDJSON frame contract shared between the Node run route
 * (`/api/experience-lab/run`) and the client canvas reducer. The route streams
 * one JSON object per line; the client decodes line-by-line.
 *
 * Two frame kinds:
 *   - `event`  — one ordered `ExperienceBuilderEvent` (ORCH-03 stream).
 *   - `result` — the terminal frame carrying the run outcome plus the produced
 *                IR (structured JSON, NEVER markup — IR-02 / T-01-16) and its
 *                validation result, when the run produced a valid artifact.
 *
 * Pure types + a decoder helper — no React, no DOM-specific code, so the route
 * (Node) and the canvas (browser) share the exact contract.
 */

import type {
  CampaignPlanT,
  CompositionSpecT,
  ExperienceBuilderEventT,
  JioExperienceIRT,
  JioValidationResultT,
} from '@oneui/experience-builder-core';
import type { AgentTraceT } from '@oneui/experience-builder-agents';
import type { PreviewVerification } from '@oneui/experience-builder-preview/client-types';

/** A single `ExperienceBuilderEvent` frame. */
export interface RunEventFrame {
  kind: 'event';
  event: ExperienceBuilderEventT;
}

/**
 * One ordered carousel frame on the result stream (CAMP-04 / D-07). Shared
 * `variantGroupId` + sequential `orderIndex`; the canvas renders them
 * left-to-right by `orderIndex` inside one ordered tldraw group. A frame that
 * could not be made DS-compliant within the shared budget surfaces
 * `outcome: 'repair-exhausted'` — its siblings are unaffected (D-09).
 */
export interface CarouselFrameFrame {
  variantGroupId: string;
  orderIndex: number;
  outcome: 'artifact' | 'repair-exhausted' | 'gap';
  validationPassed: boolean;
  copy: { headline: string; body: string; cta?: string; caption?: string };
  ir?: JioExperienceIRT;
  validation?: JioValidationResultT;
}

/** The terminal frame: outcome + (valid-run) IR + validation + live preview. */
export interface RunResultFrame {
  kind: 'result';
  outcome: 'artifact' | 'gap' | 'error';
  ir?: JioExperienceIRT;
  /** Canonical component-only live-canvas spec, additive beside IR. */
  compositionSpec?: CompositionSpecT;
  validation?: JioValidationResultT;
  /**
   * The immutable separate-origin live preview URL from `previewState.url`
   * (PREV-02 / CANVAS-06). The artifact card embeds it in a sandboxed iframe.
   * Carries only an opaque token — never anything sensitive (PREV-01).
   */
  previewUrl?: string;
  /**
   * Legacy marker retained for persisted frames. Artifact-card iframes ignore
   * this now and always use strict `allow-scripts` without `allow-same-origin`.
   */
  previewSameOrigin?: boolean;
  /** A signed `_storage` thumbnail URL for the card's `thumbnail` lifecycle. */
  thumbnailUrl?: string;
  /** Runtime preview verification for CSS variables, theme, and screenshots. */
  previewVerification?: PreviewVerification;
  /** Expanded visual evaluation surfaced to the workbench/card. */
  evaluation?: { composite: number; rubric?: Record<string, unknown>; objectivePass?: boolean };
  /** Storybook MCP status for strict compound component recipes. */
  storybookMcpStatus?: 'available' | 'unavailable' | 'not-required';
  /** Storybook documentation/story sources used by the backend recipe step. */
  storybookDocsUsed?: string[];
  /** The best-of-N variant group id (CANVAS-05 / D-14), when this run was a variant. */
  variantGroupId?: string;
  /**
   * Preview-INFRA failure signal (Plan 03 `previewError`). Present ONLY when the
   * preview/screenshot executor (e.g. the Daytona sandbox) threw — generation
   * itself SUCCEEDED and the IR is still carried above. The card uses this to
   * render "preview failed" copy instead of the misleading gap/"generation
   * refused" copy (T-031-06 attribution fix). `outcome` rides as `'error'` (the
   * frozen-union value Plan 03 chose); this flag is what distinguishes a preview
   * infra error from a true model/run error.
   */
  previewError?: { message: string };
  /**
   * CAMP-01 / CAMP-02: the campaign plan a SUSPENDED campaign run carries (brief
   * summary + audience + message hierarchy + 3 DS-grounded directions +
   * recommended index + frame count). Present only for a campaign-plan suspend
   * (`outcome` rides as `'gap'` on the wire, like every suspend). The canvas
   * renders the plan card from this; the user picks a direction + frame count
   * and POSTs to `/api/experience-lab/resume` (the card UI lands in plan 03).
   */
  campaignPlan?: CampaignPlanT;
  /**
   * The durable Convex `experienceRuns` id the campaign plan was persisted
   * under (T-04-14). The client passes this as `runId` to the resume route so
   * the plan is re-hydrated from Convex — never from process memory.
   */
  campaignRunId?: string;
  /**
   * CAMP-04 / D-07: the ordered carousel frames a RESUMED campaign run produced
   * (after the user picked a direction). Shared `variantGroupId` + sequential
   * `orderIndex`; the canvas renders them as one ordered tldraw group via
   * `CarouselGroupFrame`. Present only on the resume route's terminal frame.
   */
  carouselFrames?: CarouselFrameFrame[];
  /**
   * AGENT-01 / D-06a: the multi-agent transparency trace assembled by the run
   * (planner output, design recs, ToV recs, registry matches, validation
   * result, eval composite, backfill provenance). Carried to the canvas exactly
   * like `evaluation` / `previewState` so the artifact card's "How this was
   * built" disclosure can surface it. STRUCTURED AGENT OUTPUTS ONLY — never a
   * secret/token (T-04.2-11). Absent for runs that produced no traceable agent
   * output (old runs round-trip unchanged).
   */
  agentTrace?: AgentTraceT;
}

/** Any NDJSON frame emitted by the run route. */
export type RunStreamFrame = RunEventFrame | RunResultFrame;

/** Type guard for the terminal result frame. */
export function isResultFrame(frame: RunStreamFrame): frame is RunResultFrame {
  return frame.kind === 'result';
}

/** Type guard for an event frame. */
export function isEventFrame(frame: RunStreamFrame): frame is RunEventFrame {
  return frame.kind === 'event';
}

/**
 * Parse a single NDJSON line into a typed frame, or `null` for blank lines.
 * Invalid JSON throws — callers decide whether to surface or swallow.
 */
export function parseRunStreamLine(line: string): RunStreamFrame | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  return JSON.parse(trimmed) as RunStreamFrame;
}
