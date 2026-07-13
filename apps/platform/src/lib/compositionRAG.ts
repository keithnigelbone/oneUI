/**
 * compositionRAG.ts
 *
 * Shared helpers for the Design Composition Agent's hybrid-RAG path
 * (RFC 0002). Consolidates three concerns that used to live inline in
 * every caller (executor, context-pack route, eval route):
 *
 *   1. The `COMPOSITION_RAG_ENABLED` feature flag — one source of truth
 *      so partial rollouts can't end up with one route on and another off.
 *   2. A telemetry emitter that logs retrieval decisions in a structured
 *      shape. In dev this is a `console.info`; in production the log line
 *      lands in the Vercel function logs and can be scraped into our
 *      observability pipeline without bespoke glue.
 *   3. Prompt-size bookkeeping — retrieving without measuring the budget
 *      impact defeats the purpose; the helper records both the pre- and
 *      post-retrieval sizes so regressions are visible in one place.
 *
 * Kept client-neutral: no React, no Convex. Imported only from server
 * routes and (potentially) Edge runtimes.
 */

import type { RetrievalTrace } from '@oneui/shared/engine';

// ── Flag ────────────────────────────────────────────────────────────────

/**
 * Canonical RAG kill switch. Reads `COMPOSITION_RAG_ENABLED` — any value
 * other than the literal string "true" means OFF. Defaulting to OFF keeps
 * prod behaviour unchanged until ops explicitly flips the flag, which is
 * the rollout strategy described in RFC 0002 §Rollback.
 */
export function isCompositionRAGEnabled(): boolean {
  return process.env.COMPOSITION_RAG_ENABLED === 'true';
}

// ── Telemetry ────────────────────────────────────────────────────────────

export type CompositionRAGCaller = 'executor' | 'context-pack' | 'eval';

export interface CompositionRAGTelemetry {
  caller: CompositionRAGCaller;
  /** Convex brand id used for the retrieval filter. */
  brandId?: string;
  /** Optional vertical / archetype / context — echoed so we can slice the
   *  logs by foundation scope without joining extra tables. */
  vertical?: string;
  archetype?: string;
  context?: string;
  /** Characters in the user prompt that was embedded. Hashing is left to
   *  the consumer — we don't want to log raw prompts by default. */
  promptLength?: number;
  /** System prompt size after retrieval (chars). Required when trace is
   *  present — this is the number we're trying to move. */
  systemPromptSize: number;
  /** Compiled trace from `retrieveRelevantContext`. */
  trace: RetrievalTrace;
  /** Milliseconds spent in retrieval (embedding + Convex search). Helps
   *  catch tail-latency regressions in the vector search. */
  latencyMs?: number;
}

/**
 * Emit a structured telemetry line for a single retrieval run. Log level
 * is `info` — retrieval isn't an error path and flooding `warn` would
 * dull the signal when something actually goes wrong.
 *
 * Shape is deliberately flat so it survives JSON stringification in both
 * Vercel's log aggregator and a local `pnpm dev` terminal.
 */
export function logCompositionRetrieval(event: CompositionRAGTelemetry): void {
  if (!event.trace) return;
  const keptCounts = {
    rule: 0,
    reference: 0,
    skill: 0,
  };
  for (const entry of event.trace.kept) keptCounts[entry.kind]++;

  const record = {
    event: 'composition.retrieval',
    caller: event.caller,
    brandId: event.brandId,
    vertical: event.vertical,
    archetype: event.archetype,
    context: event.context,
    promptLength: event.promptLength,
    systemPromptSize: event.systemPromptSize,
    latencyMs: event.latencyMs,
    keptRules: keptCounts.rule,
    keptReferences: keptCounts.reference,
    keptSkills: keptCounts.skill,
    droppedCount: event.trace.dropped.length,
    // Top 10 ids only — full kept/dropped lists live in the response
    // payload, and the log line must stay small enough for the platform's
    // line-length cap.
    topKeptIds: event.trace.kept
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((e) => ({ kind: e.kind, id: e.id, score: Number(e.score.toFixed(3)) })),
  };

  // `console.info` is picked up by Vercel's log drain without any extra
  // setup. Keep the message + structured payload — agents that scrape
  // logs by regex on the "composition.retrieval" event get both.
  console.info('[composition.retrieval]', JSON.stringify(record));
}
