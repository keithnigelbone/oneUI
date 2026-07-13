/**
 * adapters/voiceAdapter.ts — GEN-02 / D-04: the Tone-of-Voice (ToV) adapter,
 * wrapped as a Mastra tool. It produces brand-aligned, per-section COPY.
 *
 * ROLE (assembler-last, D-01): the ToV adapter ADVISES. It emits a structured,
 * MARKUP-FREE copy spec fragment PER SECTION (headline / body / cta strings) —
 * it does NOT produce IR. The IR Generator assembles these fragments last.
 *
 * REUSE-BY-CONTRACT (Pitfall A — the load-bearing rule for this file): the
 * "real ToV engine" is NOT the HTTP-route executor at
 * `apps/platform/.../executors/voice.ts` (which returns a streaming `Response`,
 * imports `ai` directly, reads `process.env.ANTHROPIC_API_KEY`, and uses
 * `@/lib/*`). Importing that would break Lab isolation and the single-model
 * seam. Instead this adapter reuses ONLY the node-safe pure engine pieces from
 * `@oneui/shared/engine`:
 *   - `compileVoiceRules(rules, config, channel, skills, context)` → the system
 *     PROMPT (a deterministic prompt-builder, NOT the LLM call);
 *   - `runToneGuard(text, config, channel)` → the tone VALIDATION loop.
 * The model call routes through the single `callModel` seam — so this module
 * imports NO `ai`/`@ai-sdk` and never touches `apps/platform`/`@/lib`.
 */

import { z } from 'zod';
import { createTool } from '@mastra/core/tools';
import {
  compileVoiceRules,
  runToneGuard,
  type VoiceConfig,
  type VoiceRule,
} from '@oneui/shared/engine';
import { callModel } from '../modelAdapter';

// ---------------------------------------------------------------------------
// I/O schemas (Mastra tool inputSchema/outputSchema)
// ---------------------------------------------------------------------------

/** One section the planner asked the ToV adapter to write copy for. */
export const VoiceSectionInputSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  /** One-line intent from the planner (what this section communicates). */
  intent: z.string().min(1),
});

export const VoiceAdapterInputSchema = z.object({
  /** The sections to write copy for (the planner's skeleton). */
  sections: z.array(VoiceSectionInputSchema).min(1),
  /** The artifact type (carried from intent), for prompt framing. */
  artifactType: z.string().min(1),
  /** Optional brand id (prompt framing only). */
  brandId: z.string().optional(),
});

/**
 * A markup-free copy spec for one section. Every field is plain escaped text —
 * NO HTML/JSX/markup (D-01 "advises"; the markup-free guard is also re-asserted
 * by `parseIR` downstream — defence in depth, Pitfall #2).
 */
export const SectionCopySpecSchema = z.object({
  sectionId: z.string().min(1),
  headline: z.string(),
  body: z.string(),
  cta: z.string().optional(),
  /** Tone-guard score (0-100) from runToneGuard for the assembled copy. */
  toneScore: z.number(),
});
export type SectionCopySpecT = z.infer<typeof SectionCopySpecSchema>;

export const VoiceAdapterOutputSchema = z.object({
  copySpecs: z.array(SectionCopySpecSchema),
});
export type VoiceAdapterOutputT = z.infer<typeof VoiceAdapterOutputSchema>;

// ---------------------------------------------------------------------------
// Lab-owned minimal VoiceConfig default (the engine has no getDefaultVoiceConfig)
// ---------------------------------------------------------------------------

/**
 * A minimal, node-safe default `VoiceConfig` so the adapter compiles a prompt +
 * runs the tone guard without a Convex round-trip. In production the brand's
 * real voice config is threaded in; this default keeps the adapter unit-testable
 * and credential-free. Mirrors the shape of `DEFAULT_VOICE_CONFIG` in
 * `convex/voiceConfigs.ts`.
 */
export const DEFAULT_LAB_VOICE_CONFIG: VoiceConfig = {
  agentName: 'the brand',
  toneProfile: { warmth: 69, directness: 70 },
  language: {
    primary: 'en-IN',
    hindiSupport: false,
    hinglishSupport: false,
    spellingConvention: 'british',
    numberFormat: 'indian',
  },
  communicationStyle: {
    forbiddenWords: [],
    useEmojis: false,
  },
  emotionalIntelligence: {
    navarasa: false,
    sensitiveTopicHandling: 'gentle',
  },
  isActive: true,
  version: 1,
} as VoiceConfig;

// ---------------------------------------------------------------------------
// The structured per-section copy the model returns (one bounded call)
// ---------------------------------------------------------------------------

const SectionCopyModelSchema = z.object({
  headline: z.string(),
  body: z.string(),
  cta: z.string().optional(),
});

/** Crude markup sniff: a string is rejected as copy if it carries a tag-like `<...>`. */
function stripToMarkupFree(text: string): string {
  // The engine + parseIR are the authoritative guards; here we defensively
  // strip any tag-like sequence so the advisory copy spec is markup-free by
  // construction (D-01). This never injects markup — it only removes it.
  return text.replace(/<[^>]*>/g, '').trim();
}

/**
 * Generate a brand-aligned, markup-free copy spec per section.
 *
 * Pipeline per section: build the system prompt via `compileVoiceRules` (the
 * deterministic prompt-builder), call the model through the single `callModel`
 * seam, then validate the output with `runToneGuard` (the validation loop). The
 * copy is stripped to markup-free text before it leaves the adapter.
 */
export async function runVoiceAdapter(
  input: z.infer<typeof VoiceAdapterInputSchema>,
  options?: { config?: VoiceConfig; rules?: VoiceRule[]; channel?: string },
): Promise<VoiceAdapterOutputT> {
  const config = options?.config ?? DEFAULT_LAB_VOICE_CONFIG;
  const rules = options?.rules ?? [];
  const channel = options?.channel ?? 'default';

  // compileVoiceRules is a PROMPT-BUILDER (config → prompt string), NOT the LLM
  // call (Pitfall A). 'copy' context is the marketing/editorial surface.
  const compiled = compileVoiceRules(rules, config, channel, undefined, 'copy');

  const copySpecs: SectionCopySpecT[] = [];
  for (const section of input.sections) {
    const prompt = [
      `Artifact type: ${input.artifactType}.`,
      `Write copy for the "${section.name}" section. Intent: ${section.intent}.`,
      'Return headline, body, and (if appropriate) a short cta. Plain text only — NO markup.',
    ].join('\n');

    const draft = await callModel({
      schema: SectionCopyModelSchema,
      prompt,
      system: compiled.prompt,
    });

    const headline = stripToMarkupFree(draft.headline ?? '');
    const body = stripToMarkupFree(draft.body ?? '');
    const cta = draft.cta ? stripToMarkupFree(draft.cta) : undefined;

    // runToneGuard is the brand-voice VALIDATION loop (mirrors the executor's
    // validation step shape; the executor itself is NOT imported — Pitfall A).
    const guard = runToneGuard([headline, body, cta].filter(Boolean).join('\n'), config, channel);

    copySpecs.push({
      sectionId: section.id,
      headline,
      body,
      ...(cta ? { cta } : {}),
      toneScore: guard.score,
    });
  }

  return { copySpecs };
}

/**
 * GEN-02 ToV Mastra tool. `execute` reuses the node-safe engine prompt-compiler
 * + tone guard and routes the model call through the single seam.
 */
export const voiceAdapter = createTool({
  id: 'tov-copy',
  description:
    'GEN-02 Tone-of-Voice adapter: produces a brand-aligned, markup-free copy spec ' +
    'per section using compileVoiceRules + runToneGuard. Advises only (no IR).',
  inputSchema: VoiceAdapterInputSchema,
  outputSchema: VoiceAdapterOutputSchema,
  // Mastra passes the parsed input as the first arg (inputData), context second.
  execute: async (inputData) => runVoiceAdapter(inputData as z.infer<typeof VoiceAdapterInputSchema>),
});
