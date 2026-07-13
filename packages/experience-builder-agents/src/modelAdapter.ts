/**
 * modelAdapter.ts
 *
 * THE single module that owns all Vercel AI SDK (`ai` / `@ai-sdk/*`) and
 * `@mastra/ai-sdk` access (Pitfall 1 — centralize the model/stream layer).
 *
 * Boundary rule (ORCH-04): this module is the model + transport layer ONLY. It
 * contains NO sequencing, branching, repair, or HITL logic — that all lives in
 * the Mastra workflow (`workflow.ts`). The workflow calls into here purely to
 * (a) convert a Mastra workflow stream into an AI-SDK **v6** UI-message stream,
 * and (b) provide the typed seam where a real model would be wired in P2.
 *
 * Why `version: 'v6'` is pinned here (Pitfall 1): `@mastra/ai-sdk`'s
 * `toAISdkStream` defaults to the v5 protocol. The Lab transport is AI-SDK v6,
 * so every conversion in the Lab MUST pass `version: 'v6'`. Funnelling that
 * choice through one helper keeps the version decision in exactly one place.
 *
 * P2 wires the real model: `callModel` is the single typed structured-output
 * seam wrapping `@ai-sdk/anthropic` + `ai`'s `generateText` with
 * `Output.object`. It is the ONLY module that imports `ai` / `@ai-sdk/*`. A
 * module-level test seam (`__setCallModelImpl`) lets tests inject a
 * credential-free mock, so no orchestration/retry leaks into the model layer.
 */

import { toAISdkStream } from '@mastra/ai-sdk';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText, Output } from 'ai';
import type { z } from 'zod';
import { CLAUDE_MODEL, CLAUDE_VISION_MODEL } from '@oneui/shared/agent';

/**
 * The AI-SDK protocol version the Experience Lab speaks. Pinned to v6 (Pitfall
 * 1). This is the ONLY place the version literal appears.
 */
export const AI_SDK_STREAM_VERSION = 'v6' as const;
export type AiSdkStreamVersion = typeof AI_SDK_STREAM_VERSION;

/**
 * Convert a Mastra workflow run/stream into an AI-SDK **v6** UI-message stream
 * for transport to the client run inspector. This is the sole bridge between
 * Mastra (orchestration) and the AI SDK (transport) — the route handler (P1+)
 * forwards the returned stream; it never sequences anything itself.
 *
 * `stream` is typed `unknown` at this boundary because the concrete
 * `MastraWorkflowStream` generic is pinned by the workflow that produced it;
 * the adapter only needs to forward it through the v6 converter. The cast is
 * localized here so no other module touches `@mastra/ai-sdk` types.
 */
export function toV6WorkflowStream(stream: unknown): ReturnType<typeof toAISdkStream> {
  // `from: 'workflow'` + `version: 'v6'` selects the v6 workflow overload.
  return toAISdkStream(stream as never, {
    from: 'workflow',
    version: AI_SDK_STREAM_VERSION,
  });
}

/**
 * The single typed structured-output model seam (ORCH-04 / Pitfall 1).
 *
 * `callModel` is the ONLY place in the Lab that touches `ai` / `@ai-sdk/*`. It
 * wraps `@ai-sdk/anthropic`'s `anthropic(model)` provider + `ai`'s
 * `generateText` with an `Output.object({ schema })` option, and returns the
 * parsed structured output read from the VERIFIED accessor
 * `GenerateTextResult.experimental_output` (`ai@6.0.111`).
 *
 * NO sequencing / branching / retry lives here — that is orchestration and
 * belongs in `irGenerator.ts` / `workflow.ts`. This seam does exactly one
 * thing: one structured model call → one parsed object.
 *
 * `ANTHROPIC_API_KEY` is read by `@ai-sdk/anthropic` server-side only; the key
 * is never logged and never written into any IR / bundle / event.
 */
export interface CallModelArgs<TSchema extends z.ZodType> {
  /** Zod schema constraining the structured output. */
  schema: TSchema;
  /** The user prompt. */
  prompt: string;
  /** Optional system prompt. */
  system?: string;
  /** Optional model id override; defaults to CLAUDE_MODEL (CLAUDE_VISION_MODEL when images are present). */
  model?: string;
  /**
   * Optional preview screenshots for the multimodal vision judge (EVAL-01 /
   * D-06 subjective track). When present, `callModelReal` builds the AI-SDK
   * `messages:[{role:'user', content:[…text…, …image…]}]` multimodal form
   * (each image sent as `data:image/png;base64,…`) instead of a bare `prompt`,
   * and defaults the model to `CLAUDE_VISION_MODEL`. This keeps the vision judge
   * inside the single ORCH-04 seam — the step never imports `ai`/`@ai-sdk`.
   */
  images?: Array<{ png: Buffer }>;
}

/** The real model call. Kept separate so tests can swap `callModel` wholesale. */
async function callModelReal<TSchema extends z.ZodType>(
  args: CallModelArgs<TSchema>,
): Promise<z.infer<TSchema>> {
  const { schema, prompt, system, images } = args;

  // Vision path (EVAL-01 / D-06 subjective track): build the multimodal
  // message form from the verified verify-route excerpt, defaulting to the
  // vision model. The image is a base64 data URI; the structured rubric still
  // rides `experimental_output: Output.object({ schema })`.
  if (images && images.length > 0) {
    const model = args.model ?? CLAUDE_VISION_MODEL;
    const result = await generateText({
      model: anthropic(model),
      ...(system ? { system } : {}),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            ...images.map((img) => ({
              type: 'image' as const,
              image: `data:image/png;base64,${img.png.toString('base64')}`,
            })),
          ],
        },
      ],
      experimental_output: Output.object({ schema }),
    });
    return result.experimental_output as z.infer<TSchema>;
  }

  const model = args.model ?? CLAUDE_MODEL;
  const result = await generateText({
    model: anthropic(model),
    ...(system ? { system } : {}),
    prompt,
    experimental_output: Output.object({ schema }),
  });
  // VERIFIED accessor: GenerateTextResult.experimental_output (ai@6.0.111).
  return result.experimental_output as z.infer<TSchema>;
}

/**
 * Module-level seam (dependency-injection-for-tests idiom). Production points
 * at `callModelReal`; tests override it via `__setCallModelImpl` (see
 * `testModelMock.ts`) so GEN-05 tests run credential-free with a deterministic,
 * fail-then-succeed queue and NO `ANTHROPIC_API_KEY`.
 */
let _callModelImpl: <TSchema extends z.ZodType>(
  args: CallModelArgs<TSchema>,
) => Promise<z.infer<TSchema>> = callModelReal;

/** Invoke the active model implementation (real in prod, mock in tests). */
export function callModel<TSchema extends z.ZodType>(
  args: CallModelArgs<TSchema>,
): Promise<z.infer<TSchema>> {
  return _callModelImpl(args);
}

/**
 * TEST SEAM ONLY. Override the `callModel` implementation (e.g. with a
 * deterministic queue from `testModelMock.ts`). Returns a restore function.
 * Never used in production code paths.
 */
export function __setCallModelImpl(
  impl: <TSchema extends z.ZodType>(args: CallModelArgs<TSchema>) => Promise<z.infer<TSchema>>,
): () => void {
  const previous = _callModelImpl;
  _callModelImpl = impl;
  return () => {
    _callModelImpl = previous;
  };
}
