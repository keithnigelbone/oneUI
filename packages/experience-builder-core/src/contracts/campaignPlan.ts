/**
 * campaignPlan.ts — CAMP-02 / D-06: the Campaign Planner's structured output.
 *
 * The planner ADVISES (assembler-last): given a campaign brief it returns a
 * STRUCTURED PLAN — brief summary + audience + an ordered message hierarchy +
 * exactly three DS-grounded creative directions + a recommended direction index
 * + a recommended carousel frame count. It does NOT emit IR, copy, or markup;
 * later steps assemble the artifact.
 *
 * DS GROUNDING (D-06 — "No invented colors/fonts/visual systems"): each
 * direction's visual emphasis is a CLOSED enum of EXISTING Jio foundation
 * values — `leadRole` is one of the 9 appearance roles, `surfaceMood` is one of
 * the 7 surface tokens (both verified against CLAUDE.md). The planner therefore
 * cannot invent a visual system; the downstream validator/registry gate catches
 * any non-Jio output (threat T-04-03).
 *
 * ANTHROPIC-SAFE (Pitfall 2, proven in plannerAgent.ts:65-67 + irGenerator.ts):
 * Anthropic structured output rejects `minimum`/`maximum` on numbers (`400
 * invalid_request_error`) and `propertyNames` (keyed `z.record`). In Zod 4 BOTH
 * `.int()` AND `.min()`/`.max()` on a number inject those bounds. So every
 * number here is a PLAIN `z.number()`; the constraints ("whole number 0..2",
 * "1..10", "exactly three directions") live in `.describe()` prose for the model
 * and are RE-ASSERTED at runtime in `runCampaignPlanner`. Array `.min(1)` is
 * safe (it constrains array length, not a number) — used only on
 * `messageHierarchy`. The "exactly 3 directions" rule is NOT an array bound; it
 * is prose + a runtime guard, to avoid any array-length grammar surprise.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Closed DS enums (D-06) — verified against CLAUDE.md.
// ---------------------------------------------------------------------------

/** The 9 Jio appearance roles (CLAUDE.md § Multi-Accent). */
export const APPEARANCE_ROLES = [
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
  'brand-bg',
] as const;
export type AppearanceRole = (typeof APPEARANCE_ROLES)[number];

/** The 7 Jio surface tokens (CLAUDE.md § Surfaces). */
export const SURFACE_MOODS = [
  'default',
  'ghost',
  'minimal',
  'subtle',
  'moderate',
  'bold',
  'elevated',
] as const;
export type SurfaceMood = (typeof SURFACE_MOODS)[number];

// ---------------------------------------------------------------------------
// Creative direction — a DS-grounded concept bundle (D-06)
// ---------------------------------------------------------------------------

/**
 * One creative direction: a name + concept + copy angle + a Jio-grounded visual
 * emphasis (which appearance role leads, which surface mood dominates) + a
 * layout/composition motif the Design agent can honour. The rich `.describe()`
 * text on each field is the single biggest reliability lever for the planner.
 */
export const CreativeDirectionSchema = z.object({
  /** Short direction name (e.g. 'Bold Data Drop'). */
  name: z.string().min(1).describe('Short, memorable name for this creative direction.'),
  /** One-line concept describing the direction. */
  concept: z.string().min(1).describe('One-line concept describing this creative direction.'),
  /** Tone emphasis fed to the ToV agent for per-frame copy. */
  copyAngle: z.string().min(1).describe('Tone emphasis fed to the ToV agent (e.g. punchy, calm, playful).'),
  /** Which Jio appearance role leads the composition. No invented colors. */
  leadRole: z
    .enum(APPEARANCE_ROLES)
    .describe(
      'Which Jio appearance role leads the composition. MUST be one of the existing Jio roles; no invented colors.',
    ),
  /** Which Jio surface mood dominates. No invented surfaces. */
  surfaceMood: z
    .enum(SURFACE_MOODS)
    .describe(
      'Which Jio surface mood dominates the composition. MUST be one of the existing Jio surface tokens.',
    ),
  /** A composition motif the Design agent can honour. */
  layoutMotif: z
    .string()
    .min(1)
    .describe('A composition/layout motif the Design agent can honour (e.g. centered-hero-stack, split-left-image).'),
});
export type CreativeDirectionT = z.infer<typeof CreativeDirectionSchema>;

// ---------------------------------------------------------------------------
// Campaign plan — the planner's full structured output (CAMP-02)
// ---------------------------------------------------------------------------

export const CampaignPlanSchema = z.object({
  /** A short summary of the brief, as the planner understood it. */
  briefSummary: z.string().min(1).describe('A short summary of the campaign brief as understood.'),
  /** The resolved target audience. */
  audience: z.string().min(1).describe('The target audience for this campaign.'),
  /**
   * The message hierarchy: an ordered list from most→least prominent. Array
   * `.min(1)` is safe (array length, not a number bound).
   */
  messageHierarchy: z
    .array(z.string().min(1))
    .min(1)
    .describe('The key messages, ordered most→least prominent (e.g. hook → features → proof → CTA).'),
  /**
   * Exactly THREE distinct creative directions. The "exactly 3" rule is stated
   * in prose + enforced at runtime in `runCampaignPlanner` — NOT an array bound
   * (avoids any array-length grammar surprise in structured output).
   */
  directions: z
    .array(CreativeDirectionSchema)
    .describe('Provide exactly three distinct creative directions, each DS-grounded (Jio role + surface).'),
  /**
   * 0-based index of the recommended direction. PLAIN number (no `.min`/`.max`/
   * `.int` — Anthropic rejects integer bounds); clamped 0..directions.length-1
   * at runtime.
   */
  recommendedDirectionIndex: z
    .number()
    .describe('0-based index of the recommended direction; a whole number, 0..2.'),
  /**
   * Recommended carousel frame count. PLAIN number; clamped 1..10 at runtime
   * (D-08). Derive it from the message hierarchy (e.g. hook→features→proof→CTA).
   */
  recommendedFrameCount: z
    .number()
    .describe('Recommended carousel frame count; a whole number, typically 3..6, max 10.'),
});
export type CampaignPlanT = z.infer<typeof CampaignPlanSchema>;
