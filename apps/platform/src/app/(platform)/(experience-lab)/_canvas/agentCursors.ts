/**
 * agentCursors.ts
 *
 * (AGENT-04 / D-06c) The agent→IR-node→canvas-region mapping substrate + the
 * per-agent pointer model for the canvas cursor overlay.
 *
 * THE SUBSTRATE (locked at the Plan-06 decision checkpoint: `postmessage-rects`):
 *   1. The live-preview renderer (`ASTRenderer`) stamps a stable
 *      `data-ir-node-id` (from each node's existing `id` field) onto every
 *      rendered DOM element AT RENDER TIME. The compiled AST / codegen export
 *      stays clean — canvas instrumentation lives only on the preview DOM.
 *   2. The sandboxed preview iframe (`RenderASTBranded` → `IrNodeRectReporter`)
 *      posts each node's bounding rect to the canvas via `postMessage`.
 *   3. This module maps the per-agent node ids recorded in the Plan-05
 *      `agentTrace` onto those rects, producing the per-agent cursor descriptors
 *      the `ArtifactCardShape` overlay draws OUTSIDE the iframe.
 *
 * SECURITY (T-04.2-14, LOCKED — PREV-01): the postMessage channel is rect-ONLY.
 * The payload carries node id STRINGS and numeric bounding-box coordinates and
 * NOTHING else — no tokens, cookies, storage, or auth surface ever crosses the
 * separate-origin boundary. The CSP / sandbox of the untrusted compiled-bundle
 * path is unchanged (`allow-scripts`, no `allow-same-origin`). This file is pure
 * data + pure functions — no React, no DOM, no network — so it is unit-testable
 * and carries no side effects.
 *
 * The overlay is strictly ADDITIVE: it reads rects the preview volunteers and
 * draws lightweight pointers on top of the canvas. It never mutates the preview,
 * never relaxes isolation, and the canvas can ignore it entirely (it renders
 * nothing when no rects/trace are present) so the perf budget is unaffected.
 */

import type { AgentTraceT } from '@oneui/experience-builder-agents';

/**
 * The postMessage message-type discriminator the iframe reporter tags its
 * payload with and the canvas validates before drawing. A constant string so
 * the canvas can cheaply reject unrelated cross-frame messages.
 */
export const IR_NODE_RECTS_MESSAGE_TYPE = 'oneui:ir-node-rects' as const;

/**
 * A single IR node's bounding rect, relative to the iframe's own content
 * viewport. Numbers + an id STRING only — the entire payload contract that
 * crosses the origin boundary (T-04.2-14).
 */
export interface IrNodeRect {
  /** The `data-ir-node-id` of the reporting element (an IR node id). */
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

/** The rect-report message the iframe posts to the canvas. */
export interface IrNodeRectsMessage {
  type: typeof IR_NODE_RECTS_MESSAGE_TYPE;
  rects: IrNodeRect[];
}

/**
 * Validate an untrusted cross-frame message into a typed rect report, or null.
 * The canvas MUST run every `window.message` event through this before using
 * the payload — it rejects anything that is not our exact rect-only shape, so a
 * hostile frame cannot smuggle a non-rect payload into the overlay (defence in
 * depth on top of the reporter only ever sending rects).
 */
export function parseIrNodeRectsMessage(data: unknown): IrNodeRectsMessage | null {
  if (!data || typeof data !== 'object') return null;
  const msg = data as { type?: unknown; rects?: unknown };
  if (msg.type !== IR_NODE_RECTS_MESSAGE_TYPE) return null;
  if (!Array.isArray(msg.rects)) return null;
  const rects: IrNodeRect[] = [];
  for (const r of msg.rects) {
    if (!r || typeof r !== 'object') continue;
    const rect = r as Record<string, unknown>;
    if (
      typeof rect.id === 'string' &&
      typeof rect.left === 'number' &&
      typeof rect.top === 'number' &&
      typeof rect.width === 'number' &&
      typeof rect.height === 'number'
    ) {
      rects.push({
        id: rect.id,
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      });
    }
  }
  return { type: IR_NODE_RECTS_MESSAGE_TYPE, rects };
}

/**
 * The agents that leave a spatial trace on the canvas. Each maps to a distinct
 * appearance role so the cursors are visually distinguishable:
 *   - `design`    → layout regions the Design advisor shaped (Sparkle).
 *   - `tone`      → copy / CTA nodes the Tone advisor refined (Secondary).
 *   - `evaluator` → hierarchy/spacing/density/a11y issue nodes (Warning).
 */
export type CursorAgent = 'design' | 'tone' | 'evaluator';

/** Human-readable agent label + the appearance role its pointer uses. */
export const AGENT_CURSOR_META: Record<
  CursorAgent,
  { label: string; appearance: string }
> = {
  design: { label: 'Design advisor', appearance: 'sparkle' },
  tone: { label: 'Tone advisor', appearance: 'secondary' },
  evaluator: { label: 'Evaluator', appearance: 'warning' },
};

/**
 * A per-agent pointer descriptor: which agent touched which IR node ids. The
 * canvas resolves each node id against the reported rects to draw the actual
 * pointer. Node ids with no reported rect are simply not drawn (the preview may
 * not have escalated to `live` yet) — the overlay degrades gracefully.
 */
export interface AgentCursor {
  agent: CursorAgent;
  label: string;
  appearance: string;
  /** The IR node ids this agent spatially touched. */
  nodeIds: string[];
}

/**
 * (D-06c) Pure mapper: an `agentTrace` → the per-agent cursor descriptors.
 *
 * - Design advisor → the section ids it produced design recs for (layout regions).
 * - Tone advisor   → the section ids it refined copy/CTA for.
 * - Evaluator      → the nodes flagged by validation/eval. When the trace has no
 *                    node-level issue list, the Evaluator cursor falls back to
 *                    the section ids that have design recs (the composed regions
 *                    it scored) so the cursor still points somewhere meaningful;
 *                    it is omitted entirely when the run passed cleanly with no
 *                    composite issues to highlight.
 *
 * Returns only agents that actually touched at least one node, so the overlay
 * renders nothing for agents that produced no spatial trace.
 */
export function agentCursorsFromTrace(
  trace: AgentTraceT | null | undefined,
): AgentCursor[] {
  if (!trace) return [];
  const cursors: AgentCursor[] = [];

  const designNodeIds = (trace.designRecs ?? []).map((d) => d.sectionId).filter(Boolean);
  if (designNodeIds.length > 0) {
    cursors.push({
      agent: 'design',
      ...AGENT_CURSOR_META.design,
      nodeIds: dedupe(designNodeIds),
    });
  }

  const toneNodeIds = (trace.toneRecs ?? []).map((t) => t.sectionId).filter(Boolean);
  if (toneNodeIds.length > 0) {
    cursors.push({
      agent: 'tone',
      ...AGENT_CURSOR_META.tone,
      nodeIds: dedupe(toneNodeIds),
    });
  }

  // The Evaluator highlights problem regions: backfilled instance ids (GAP-01
  // provenance) are the most node-specific signal. When validation blocked, the
  // composed sections are the coarser fallback. A clean pass with no backfill
  // produces no Evaluator cursor (nothing to flag).
  const backfillIds = (trace.backfilled ?? []).map((b) => b.instanceId).filter(Boolean);
  const blocked = trace.validation ? !trace.validation.passed : false;
  const evaluatorNodeIds = backfillIds.length > 0
    ? dedupe(backfillIds)
    : blocked
      ? dedupe(designNodeIds)
      : [];
  if (evaluatorNodeIds.length > 0) {
    cursors.push({
      agent: 'evaluator',
      ...AGENT_CURSOR_META.evaluator,
      nodeIds: evaluatorNodeIds,
    });
  }

  return cursors;
}

/**
 * Resolve a per-agent cursor against the reported rects → the drawable regions.
 * A region is an absolute box in the iframe's content coordinate space plus the
 * owning agent's appearance role; the canvas offsets it by the iframe's screen
 * position. Node ids without a reported rect are dropped (graceful degradation).
 */
export interface CursorRegion {
  agent: CursorAgent;
  appearance: string;
  nodeId: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

export function resolveCursorRegions(
  cursors: AgentCursor[],
  rects: IrNodeRect[],
): CursorRegion[] {
  const byId = new Map(rects.map((r) => [r.id, r]));
  const regions: CursorRegion[] = [];
  for (const cursor of cursors) {
    for (const nodeId of cursor.nodeIds) {
      const rect = byId.get(nodeId);
      if (!rect) continue;
      regions.push({
        agent: cursor.agent,
        appearance: cursor.appearance,
        nodeId,
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      });
    }
  }
  return regions;
}

function dedupe(ids: string[]): string[] {
  return Array.from(new Set(ids));
}
