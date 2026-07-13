/**
 * parts.shared.ts
 *
 * Typed contracts for the non-text `data-*` message parts that ride on a
 * UIMessage alongside regular text. Shape matches Vercel AI SDK's
 * `DataUIPart` convention: `{type: 'data-<name>', id?, data: <payload>}`.
 * Servers emit these via `writer.write({type, data})`; clients match on
 * `type` and read `part.data` for the payload.
 *
 * Import note: payload types are pulled structurally from `@oneui/shared`
 * so this module has no runtime dependency on the engine at call sites.
 */

import type { ASTRoot } from '@oneui/shared';
import type {
  CodeValidationResult,
  CompositionValidationResult,
  DesignGateResult,
  RetrievalTrace,
  ToneGuardResult,
} from '@oneui/shared/engine';

// ── Part type discriminators ────────────────────────────────────────────

export const PART_COMPOSITION_AST = 'data-composition-ast' as const;
export const PART_COMPOSITION_CODE = 'data-composition-code' as const;
export const PART_COMPOSITION_ERROR = 'data-composition-error' as const;
export const PART_COMPOSITION_REFERENCES = 'data-composition-references' as const;
export const PART_COMPOSITION_RETRIEVAL_TRACE = 'data-composition-retrieval-trace' as const;
export const PART_TONE_GUARD = 'data-tone-guard' as const;
export const PART_ASSET = 'data-asset' as const;

// ── Payload shapes (what servers put in `data:`) ────────────────────────

export interface CompositionASTData {
  /** Final parsed AST. Only emitted once JSON.parse + validate succeed. */
  ast: ASTRoot;
  /** Deterministic validation outcome. Optional — may be computed lazily. */
  validation?: CompositionValidationResult;
  /** Composition context — drives device-frame sizing in preview cards. */
  context?: string;
}

/**
 * Code-mode (Sandpack) generation payload. Mirrors `CompositionASTData`
 * but carries raw TSX instead of a parsed AST. The renderer is responsible
 * for compiling and rendering — server only ships the source + validator
 * results so the client can decide whether to show a "self-heal in
 * progress" affordance.
 */
export interface CompositionCodeData {
  /** Full TSX source for `App.tsx`. Must be byte-equal to what Sandpack
   *  receives via `updateFile('/App.tsx', code)`. */
  code: string;
  /** Babel-based validator outcome. Errors trigger the self-heal loop;
   *  warnings are surfaced inline but don't block render. */
  validation?: CodeValidationResult;
  /** Deterministic visual/design quality gate. Separate from code
   *  validation so "renders" and "good enough first draft" stay distinct. */
  designGate?: DesignGateResult;
  /** Composition context — drives device-frame sizing in preview cards. */
  context?: string;
  /** Pre-formatted bullet list of validator issues. Used by the
   *  self-heal prompt and by the chat preview card so we don't re-format
   *  on the client. */
  errorSummary?: string;
  /** Origin of the emitted TSX. Fallback means the model did not produce
   *  renderable code in time and the server emitted a validator-safe draft. */
  source?: 'model' | 'stream-partial' | 'fallback';
  /** Final system prompt size in characters for debugging latency/budget. */
  promptSize?: number;
  /** End-to-end server generation duration in milliseconds. */
  durationMs?: number;
  /** Human-readable reason when source is fallback or stream-partial. */
  fallbackReason?: string;
}

export interface CompositionErrorData {
  /** Human-readable reason (parse failure, invariant violation, etc.). */
  message: string;
  /** Optional raw payload for debugging — never rendered. */
  raw?: string;
}

export interface CompositionReferenceSummary {
  screenId: string;
  name: string;
  archetype: string;
  score: number;
  reasons: string[];
}

export interface CompositionReferencesData {
  references: CompositionReferenceSummary[];
}

/**
 * Hybrid-RAG retrieval trace (RFC 0002). Emitted by the design executor on
 * the same turn as the AST so the UI can render a "what was retrieved and
 * why" panel. Shape matches `RetrievalTrace` from @oneui/shared/engine so
 * the same payload flows from Convex → Next.js route → streaming part →
 * playground UI without reshaping.
 */
export interface CompositionRetrievalTraceData {
  trace: RetrievalTrace;
  /** Size of the final system prompt (chars) — surfaced alongside the trace
   *  so the playground can show "prompt shrank from 12k → 6k" at a glance. */
  promptSize?: number;
  /** Unique id for the generation turn this trace belongs to. Lets the UI
   *  associate the trace with the sibling AST part (same id namespace). */
  turnId?: string;
}

export type ToneGuardPhase = 'checking' | 'corrected' | 'passed';

export interface ToneGuardData {
  /** Streaming phase — client transitions through these in order. */
  phase: ToneGuardPhase;
  /** Populated for `corrected` and `passed` phases. */
  result?: ToneGuardResult;
}

export type AssetKind = 'image' | 'video' | 'doc' | 'audio';

export interface AssetData {
  kind: AssetKind;
  /** Addressable URL. Can be a dataUrl for inline previews. */
  url: string;
  name?: string;
  mimeType?: string;
  /** Optional byte size for display. */
  sizeBytes?: number;
  /** Free-form metadata (prompt, generator id, etc.). Not rendered. */
  meta?: Record<string, unknown>;
}

// ── Wire shapes (UIMessage.parts entries) ───────────────────────────────

export interface CompositionASTPart {
  type: typeof PART_COMPOSITION_AST;
  id?: string;
  data: CompositionASTData;
}

export interface CompositionCodePart {
  type: typeof PART_COMPOSITION_CODE;
  id?: string;
  data: CompositionCodeData;
}

export interface CompositionErrorPart {
  type: typeof PART_COMPOSITION_ERROR;
  id?: string;
  data: CompositionErrorData;
}

export interface CompositionReferencesPart {
  type: typeof PART_COMPOSITION_REFERENCES;
  id?: string;
  data: CompositionReferencesData;
}

export interface CompositionRetrievalTracePart {
  type: typeof PART_COMPOSITION_RETRIEVAL_TRACE;
  id?: string;
  data: CompositionRetrievalTraceData;
}

export interface ToneGuardPart {
  type: typeof PART_TONE_GUARD;
  id?: string;
  data: ToneGuardData;
}

export interface AssetPart {
  type: typeof PART_ASSET;
  id?: string;
  data: AssetData;
}

export type ChatSurfaceDataPart =
  | CompositionASTPart
  | CompositionCodePart
  | CompositionErrorPart
  | CompositionReferencesPart
  | CompositionRetrievalTracePart
  | ToneGuardPart
  | AssetPart;

// ── Narrowing helpers ───────────────────────────────────────────────────

export function isCompositionASTPart(p: { type: string }): p is CompositionASTPart {
  return p.type === PART_COMPOSITION_AST;
}

export function isCompositionCodePart(p: { type: string }): p is CompositionCodePart {
  return p.type === PART_COMPOSITION_CODE;
}

export function isCompositionErrorPart(p: { type: string }): p is CompositionErrorPart {
  return p.type === PART_COMPOSITION_ERROR;
}

export function isCompositionReferencesPart(p: { type: string }): p is CompositionReferencesPart {
  return p.type === PART_COMPOSITION_REFERENCES;
}

export function isCompositionRetrievalTracePart(
  p: { type: string },
): p is CompositionRetrievalTracePart {
  return p.type === PART_COMPOSITION_RETRIEVAL_TRACE;
}

export function isToneGuardPart(p: { type: string }): p is ToneGuardPart {
  return p.type === PART_TONE_GUARD;
}

export function isAssetPart(p: { type: string }): p is AssetPart {
  return p.type === PART_ASSET;
}
