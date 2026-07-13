/**
 * events.ts
 *
 * `ExperienceBuilderEvent` — the internal agent-run event stream (ORCH-03).
 * AG-UI-inspired; there is no in-repo analog. This rides the `@mastra/ai-sdk`
 * transport in plan 04 (the route forwards these events to the client run
 * inspector). The model is defined here, transport-agnostic, so the contract
 * is frozen before Mastra lands.
 *
 * Discriminated on `type`. Each variant is markup-free and JSON-serializable.
 */

import { z } from 'zod';
import { JioValidationResult } from './validation';
import { FoundationGap } from './foundationResolve';
import { ComponentGap } from './validation';

// ---------------------------------------------------------------------------
// Event variants — run lifecycle + per-step + ir + validation + gap
// ---------------------------------------------------------------------------

/** Run started: a generation run was accepted. */
export const RunStartedEvent = z
  .object({
    type: z.literal('run-started'),
    runId: z.string().min(1),
    at: z.number(), // epoch ms
  })
  .strict();

/** A workflow step transitioned (e.g. 'resolve-foundation', 'generate-ir'). */
export const StepEvent = z
  .object({
    type: z.literal('step'),
    runId: z.string().min(1),
    step: z.string().min(1),
    status: z.enum(['started', 'completed', 'failed']),
    at: z.number(),
  })
  .strict();

/** The workflow produced a (valid) IR document. Carries the IR id, not markup. */
export const IrProducedEvent = z
  .object({
    type: z.literal('ir-produced'),
    runId: z.string().min(1),
    irId: z.string().min(1),
    at: z.number(),
  })
  .strict();

/** A validation result for the run's IR. */
export const ValidationEvent = z
  .object({
    type: z.literal('validation'),
    runId: z.string().min(1),
    result: JioValidationResult,
    at: z.number(),
  })
  .strict();

/** A gap short-circuit (foundation or component) — produces no artifact. */
export const GapEvent = z
  .object({
    type: z.literal('gap'),
    runId: z.string().min(1),
    foundationGap: FoundationGap.optional(),
    componentGap: ComponentGap.optional(),
    at: z.number(),
  })
  .strict();

/** Run completed: terminal state for the run. */
export const RunCompletedEvent = z
  .object({
    type: z.literal('run-completed'),
    runId: z.string().min(1),
    outcome: z.enum(['artifact', 'gap', 'error']),
    at: z.number(),
  })
  .strict();

// ---------------------------------------------------------------------------
// The union (ORCH-03)
// ---------------------------------------------------------------------------

export const ExperienceBuilderEvent = z.discriminatedUnion('type', [
  RunStartedEvent,
  StepEvent,
  IrProducedEvent,
  ValidationEvent,
  GapEvent,
  RunCompletedEvent,
]);

export type ExperienceBuilderEventT = z.infer<typeof ExperienceBuilderEvent>;
