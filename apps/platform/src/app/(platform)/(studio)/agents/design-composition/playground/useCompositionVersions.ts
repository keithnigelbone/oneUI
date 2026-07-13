/**
 * useCompositionVersions.ts
 *
 * Client-side hook that walks the chat message array and returns an ordered
 * list of every generated composition AST. Each item is a "version" —
 * numbered v1, v2, … in generation order — addressable for the Version
 * dropdown in the canvas panel.
 *
 * This is read-only state derived from `useAgentChat`'s `messages`; the
 * server doesn't track versions. A session is as long as the chat is alive.
 */

import { useMemo } from 'react';
import {
  isCompositionASTPart,
  isCompositionCodePart,
  isCompositionRetrievalTracePart,
  type CompositionASTData,
  type CompositionCodeData,
  type CompositionRetrievalTraceData,
  type UIMessage,
} from '@oneui/ui/components/ChatSurface';
import { extractText } from '@oneui/shared';

/**
 * Version data shape — discriminates on whether the version is AST-shaped
 * (legacy ASTRenderer path) or code-shaped (new Sandpack path). Callers
 * branch with the `code` field; absence implies AST mode.
 */
export type CompositionVersionData = CompositionASTData & {
  /** Present iff the version was emitted by the sandpack renderer path.
   *  When set, the AST fields may be absent — callers should branch. */
  code?: string;
  /** Code-mode validator outcome. Distinct from AST `validation` because
   *  the shape differs (line numbers vs node paths). */
  codeValidation?: CompositionCodeData['validation'];
  /** Code-mode deterministic design gate outcome. Distinct from visual
   *  alignment because it runs before headless screenshot/vision scoring. */
  designGate?: CompositionCodeData['designGate'];
  /** Code-mode pre-formatted issue summary. Sourced from the server's
   *  `formatValidationIssues` so the chat UI doesn't re-format. */
  errorSummary?: string;
  source?: CompositionCodeData['source'];
  promptSize?: number;
  durationMs?: number;
  fallbackReason?: string;
};

export interface CompositionVersion {
  /** 1-based version label shown in the UI ("v1", "v2"). */
  index: number;
  /** AST + validation + context — matches the server's data-composition-ast
   *  payload, plus optional `code` fields when the sandpack renderer
   *  emitted the version instead. */
  data: CompositionVersionData;
  /** Hybrid-RAG retrieval trace emitted on the same turn as the AST. Only
   *  set when retrieval ran (flag on + brandId + non-compiled prompt). */
  retrieval?: CompositionRetrievalTraceData;
  /** Originating user prompt — the most recent user message before this AST.
   *  Empty string when no preceding user message exists (defensive). Used by
   *  the feedback submitter so each rating row records what was asked for. */
  prompt: string;
  /** UIMessage that carried this AST. Used to anchor the chat scroll if needed. */
  messageId: string;
  /** In-message part index (stable key). */
  partIndex: number;
}

export interface UseCompositionVersionsResult {
  versions: CompositionVersion[];
  latest: CompositionVersion | null;
}

export function useCompositionVersions(messages: UIMessage[]): UseCompositionVersionsResult {
  return useMemo(() => {
    const out: CompositionVersion[] = [];
    // Track the most recent user prompt as we walk forward — every AST emitted
    // by an assistant turn corresponds to whatever the user typed last.
    let lastUserPrompt = '';
    for (const msg of messages) {
      if (msg.role === 'user') {
        lastUserPrompt = extractText(msg).trim();
        continue;
      }
      const parts = msg.parts ?? [];
      // The retrieval-trace part is emitted BEFORE the AST in the same
      // message (see apps/platform/src/app/api/agent/executors/design.ts).
      // Capture it once per message so the paired AST gets the right trace.
      // If the server ever changes ordering, the fallback is still correct
      // thanks to the single-trace-per-message invariant.
      let messageTrace: CompositionRetrievalTraceData | undefined;
      for (const p of parts) {
        const part = p as { type: string } & Record<string, unknown>;
        if (isCompositionRetrievalTracePart(part)) {
          messageTrace = part.data;
          break;
        }
      }
      for (let j = 0; j < parts.length; j++) {
        const p = parts[j] as { type: string } & Record<string, unknown>;
        if (isCompositionASTPart(p)) {
          out.push({
            index: out.length + 1,
            data: p.data,
            retrieval: messageTrace,
            prompt: lastUserPrompt,
            messageId: msg.id,
            partIndex: j,
          });
        } else if (isCompositionCodePart(p)) {
          // Code-mode emit. Synthesise a CompositionASTData-shaped object
          // with the new code fields tacked on so the merged version list
          // stays one homogeneous type.
          out.push({
            index: out.length + 1,
            data: {
              // The AST shape stays as a placeholder — the canvas branches
              // on `data.code` to render Sandpack instead. We never read
              // `ast` when `code` is present.
              ast: undefined as unknown as CompositionASTData['ast'],
              validation: undefined,
              context: p.data.context,
              code: p.data.code,
              codeValidation: p.data.validation,
              designGate: p.data.designGate,
              errorSummary: p.data.errorSummary,
              source: p.data.source,
              promptSize: p.data.promptSize,
              durationMs: p.data.durationMs,
              fallbackReason: p.data.fallbackReason,
            },
            retrieval: messageTrace,
            prompt: lastUserPrompt,
            messageId: msg.id,
            partIndex: j,
          });
        }
      }
    }
    return {
      versions: out,
      latest: out.length > 0 ? out[out.length - 1] : null,
    };
  }, [messages]);
}
