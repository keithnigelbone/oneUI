/**
 * agents/plannerAgent.ts — GEN-04 / D-02: the net-new lightweight UX/flow
 * PLANNER agent. There is no planner anywhere in the repo (ToV + Design exist; a
 * planner does not), so this is the ONE genuinely new agent — and the one new
 * eval surface — this phase.
 *
 * ROLE (assembler-last, D-01): the planner ADVISES. Given the prompt + artifact
 * type + resolved foundation coverage, it returns a structured PLAN
 * (`{ sections, messageHierarchy, primaryCTA, screenCount }`) that feeds the
 * Design + ToV advisors and, finally, the IR Generator (the only step that
 * commits IR). The planner does NOT emit IR.
 *
 * SINGLE MODEL SEAM (ORCH-04 / Pitfall #1): the model call routes ONLY through
 * `callModel` (the `Output.object` structured-output seam in `modelAdapter.ts`,
 * the sole `ai`/`@ai-sdk` touchpoint). This module imports NO `ai`/`@ai-sdk`.
 * The model defaults to `CLAUDE_MODEL` (claude-sonnet-4-6) — `callModel` applies
 * that default when `model` is omitted.
 *
 * DETERMINISM (D-05 Response Caching): identical canonical inputs are memoized
 * via `cache.ts`, so the same plan request does not re-call the model.
 */

import { z } from 'zod';
import { callModel } from '../modelAdapter';
import { cacheKey, memoize, sharedCache, type ResponseCache } from '../cache';
import { getCompactDesignContext } from '../designContext';
import { renderReactWebOneUIEnvironmentContract } from '../reactWebEnvironment';
import {
  CampaignPlanSchema,
  DEFAULT_SECTION_PATTERN_ID,
  PageCompositionDensity,
  PageCompositionPageType,
  SectionAttentionLevel,
  densityForPageType,
  getPagePattern,
  getSectionPattern,
  inferPageTypeFromPrompt,
  pagePatternForType,
  type CampaignPlanT,
  type PageCompositionDensityT,
  type PageCompositionPageTypeT,
  type SectionAttentionLevelT,
} from '@oneui/experience-builder-core';

// ---------------------------------------------------------------------------
// Plan schema (Output.object / structuredOutput) — D-02
// ---------------------------------------------------------------------------

/** Model-facing section schema. Older mocks may omit composition fields. */
const PlanSectionModelSchema = z.object({
  /** Stable section id (referenced by Design/ToV fragments + the IR Generator). */
  id: z.string().min(1),
  /** Human-readable section name (e.g. 'hero', 'features', 'cta'). */
  name: z.string().min(1),
  /** One-line intent for the section (what it communicates). */
  intent: z.string().min(1),
  /** Optional page-recipe section pattern id. Normalized after the model call. */
  patternId: z.string().min(1).optional(),
  /** Optional section prominence. Normalized after the model call. */
  attentionLevel: SectionAttentionLevel.optional(),
});

/** One planned section of the artifact (skeleton the Design/ToV advisors fill). */
export const PlanSectionSchema = z.object({
  /** Stable section id (referenced by Design/ToV fragments + the IR Generator). */
  id: z.string().min(1),
  /** Human-readable section name (e.g. 'hero', 'features', 'cta'). */
  name: z.string().min(1),
  /** One-line intent for the section (what it communicates). */
  intent: z.string().min(1),
  /** First-class composition recipe selected for the section. */
  patternId: z.string().min(1),
  /** The section's role in the page hierarchy. */
  attentionLevel: SectionAttentionLevel,
});
export type PlanSectionT = z.infer<typeof PlanSectionSchema>;

/** Model-facing planner schema. Runtime normalization fills missing composition. */
const PlanModelSchema = z.object({
  /** The page intent the planner selected. */
  pageType: PageCompositionPageType.optional(),
  /** Overall page density. */
  density: PageCompositionDensity.optional(),
  /** Page-level composition recipe id. */
  pagePatternId: z.string().min(1).optional(),
  /** Ordered sections (the per-section decomposition skeleton). */
  sections: z.array(PlanSectionModelSchema).min(1),
  /**
   * The message hierarchy: an ordered list of the key messages from most to
   * least prominent. Drives Design emphasis + ToV copy weighting.
   */
  messageHierarchy: z.array(z.string().min(1)).min(1),
  /** The single primary call-to-action label. */
  primaryCTA: z.string().min(1),
  /**
   * Number of screens the artifact spans (>= 1; multi-screen for app flows).
   *
   * NOTE: plain `z.number()` — NOT `.int()` and NO `.min()`. Anthropic's
   * structured-output schema rejects `minimum`/`maximum` on `integer` types
   * (400 invalid_request_error: "For 'integer' type, properties maximum,
   * minimum are not supported"). In Zod 4, BOTH `.min(1)` AND `.int()` inject
   * those bounds — `.int()` emits the safe-integer `minimum`/`maximum`
   * (±9007199254740991). So the field is an unconstrained number in the
   * API-bound schema; integer-ness and the `>= 1` invariant are stated in the
   * description (for the model) and enforced at runtime by `runPlanner`.
   */
  screenCount: z
    .number()
    .describe(
      'Number of screens the artifact spans; a whole number, must be >= 1 (multi-screen for app flows).'
    ),
});
type PlanModelT = z.infer<typeof PlanModelSchema>;

/** The planner's structured output (GEN-04 / D-02). */
export const PlanSchema = z.object({
  /** The page intent the planner selected. */
  pageType: PageCompositionPageType,
  /** Overall page density. */
  density: PageCompositionDensity,
  /** Page-level composition recipe id. */
  pagePatternId: z.string().min(1),
  /** Ordered sections (the per-section decomposition skeleton). */
  sections: z.array(PlanSectionSchema).min(1),
  /**
   * The message hierarchy: an ordered list of the key messages from most to
   * least prominent. Drives Design emphasis + ToV copy weighting.
   */
  messageHierarchy: z.array(z.string().min(1)).min(1),
  /** The single primary call-to-action label. */
  primaryCTA: z.string().min(1),
  /**
   * Number of screens the artifact spans (>= 1; multi-screen for app flows).
   *
   * NOTE: plain `z.number()` — NOT `.int()` and NO `.min()`. Anthropic's
   * structured-output schema rejects `minimum`/`maximum` on `integer` types
   * (400 invalid_request_error: "For 'integer' type, properties maximum,
   * minimum are not supported"). In Zod 4, BOTH `.min(1)` AND `.int()` inject
   * those bounds — `.int()` emits the safe-integer `minimum`/`maximum`
   * (±9007199254740991). So the field is an unconstrained number in the
   * API-bound schema; integer-ness and the `>= 1` invariant are stated in the
   * description (for the model) and enforced at runtime by `runPlanner`.
   */
  screenCount: z
    .number()
    .describe(
      'Number of screens the artifact spans; a whole number, must be >= 1 (multi-screen for app flows).'
    ),
});
export type PlanT = z.infer<typeof PlanSchema>;

// ---------------------------------------------------------------------------
// Planner input
// ---------------------------------------------------------------------------

export interface RunPlannerInput {
  /** The raw user prompt describing the desired artifact. */
  prompt: string;
  /** The artifact type (e.g. 'web-ui', 'app-screen'); carried from intent. */
  artifactType: string;
  /**
   * The resolved foundation coverage from the resolve step (D-01 upstream). A
   * compact, node-safe summary the planner uses to scope the plan to what the
   * brand actually supports (e.g. the resolved appearance roles). Optional so
   * the planner is unit-testable in isolation.
   */
  resolvedCoverage?: {
    brandId?: string;
    outputProfile?: string;
    /** Resolved appearance role names (e.g. ['primary','neutral']). */
    appearanceRoles?: string[];
  };
  /** Optional component ids the request wants (affects the cache key). */
  requestedComponents?: readonly string[];
  /** Optional model id override; defaults to CLAUDE_MODEL via callModel. */
  model?: string;
  /** Optional cache instance (defaults to the shared response cache). */
  cache?: ResponseCache;
}

const SYSTEM_PROMPT =
  'You are a UX/flow planner for the Jio Experience Builder. Given a prompt, an ' +
  'artifact type, and the resolved Jio foundation coverage, produce a STRUCTURED ' +
  'PLAN only: a pageType, density, pagePatternId, an ordered section list (each ' +
  'with a stable id, a short name, a one-line intent, patternId, and ' +
  'attentionLevel), a message hierarchy (most→least prominent), a single primary ' +
  'CTA label, and a screen count (>= 1). Do NOT write copy, choose components, or ' +
  'emit any markup — you ADVISE; later steps assemble the artifact. The number of ' +
  'sections must be consistent with the screen count (never zero sections for a ' +
  'multi-screen artifact). ' +
  renderReactWebOneUIEnvironmentContract();

function buildPlannerPrompt(input: RunPlannerInput): string {
  const roles = input.resolvedCoverage?.appearanceRoles?.join(', ') || 'default Jio roles';
  return [
    `Prompt: ${input.prompt}`,
    `Artifact type: ${input.artifactType}.`,
    input.resolvedCoverage?.outputProfile
      ? `Output profile: ${input.resolvedCoverage.outputProfile}.`
      : '',
    `Resolved appearance roles available: ${roles}.`,
    renderReactWebOneUIEnvironmentContract(),
    `OneUI design context:\n${getCompactDesignContext()}`,
    'Return a plan: pageType, density, pagePatternId, sections[] with patternId + attentionLevel, messageHierarchy[], primaryCTA, screenCount.',
  ]
    .filter(Boolean)
    .join('\n');
}

function normalizePlan(plan: PlanModelT, input: RunPlannerInput): PlanT {
  const inferredPageType = inferPageTypeFromPrompt(input.prompt, input.artifactType);
  const pageType: PageCompositionPageTypeT = plan.pageType ?? inferredPageType;
  const suppliedPagePattern = plan.pagePatternId ? getPagePattern(plan.pagePatternId) : null;
  const pagePattern =
    suppliedPagePattern && suppliedPagePattern.pageType === pageType
      ? suppliedPagePattern
      : pagePatternForType(pageType);
  const density: PageCompositionDensityT =
    plan.density ?? pagePattern.density ?? densityForPageType(pageType);

  const recipeSectionPatternIds =
    pagePattern.sectionPatternIds.length > 0
      ? pagePattern.sectionPatternIds
      : [DEFAULT_SECTION_PATTERN_ID];
  const normalizedModelSections: PlanModelT['sections'] = [
    ...plan.sections,
    ...recipeSectionPatternIds.slice(plan.sections.length).map((patternId, index) => ({
      id: `s${plan.sections.length + index + 1}`,
      name: patternIdToName(patternId),
      intent: getSectionPattern(patternId).intent,
      patternId,
    })),
  ];

  const sections = normalizedModelSections.map((section, index) => {
    const candidatePatternId =
      section.patternId ??
      recipeSectionPatternIds[index] ??
      recipeSectionPatternIds[0] ??
      DEFAULT_SECTION_PATTERN_ID;
    const candidatePattern = getSectionPattern(candidatePatternId);
    const recipePattern = getSectionPattern(
      recipeSectionPatternIds[index] ?? recipeSectionPatternIds[0] ?? DEFAULT_SECTION_PATTERN_ID
    );
    const pattern = candidatePattern.allowedPageTypes.includes(pageType)
      ? candidatePattern
      : recipePattern;
    const attentionLevel: SectionAttentionLevelT = section.attentionLevel ?? pattern.attentionLevel;
    return {
      id: section.id,
      name: section.name,
      intent: section.intent,
      patternId: pattern.id,
      attentionLevel,
    };
  });

  return {
    pageType,
    density,
    pagePatternId: pagePattern.id,
    sections,
    messageHierarchy: plan.messageHierarchy,
    primaryCTA: plan.primaryCTA,
    screenCount: Math.max(1, Math.round(plan.screenCount)),
  };
}

function patternIdToName(patternId: string): string {
  return patternId
    .split('-')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Run the planner: return a schema-valid `PlanT` via `Output.object` routed
 * through the single `callModel` seam, memoized on the canonical inputs (D-05).
 *
 * Semantic guard (Pitfall D): the plan's section count must be consistent with
 * `screenCount` — never a zero-section plan for a multi-screen artifact. The
 * Zod schema enforces `sections.min(1)` + `screenCount >= 1`; this is the
 * structured-output contract the test asserts (not free-form JSON).
 */
export async function runPlanner(input: RunPlannerInput): Promise<PlanT> {
  const cache = input.cache ?? sharedCache();
  const key = cacheKey({
    step: 'planner',
    brandId: input.resolvedCoverage?.brandId,
    artifactType: input.artifactType,
    outputProfile: input.resolvedCoverage?.outputProfile,
    prompt: input.prompt,
    requestedComponents: input.requestedComponents,
    model: input.model,
  });

  return memoize(cache, key, async () => {
    const plan = await callModel({
      schema: PlanModelSchema,
      prompt: buildPlannerPrompt(input),
      system: SYSTEM_PROMPT,
      ...(input.model ? { model: input.model } : {}),
    });
    // Re-assert what can no longer live in the API-bound schema (Anthropic
    // rejects integer min/max, and Zod 4's `.int()` injects safe-integer
    // bounds): round to a whole number and clamp to >= 1. A compliant model
    // returns a whole number >= 1; this guarantees it for downstream consumers.
    return normalizePlan(plan, input);
  });
}

/** Stable identity for the planner agent (used when surfacing/labelling steps). */
export const plannerAgent = {
  id: 'planner',
  description: 'GEN-04 UX/flow planner — sections, message hierarchy, primary CTA, screen count.',
  run: runPlanner,
} as const;

// ---------------------------------------------------------------------------
// Campaign planner (CAMP-02 / D-06) — alongside runPlanner, same single seam.
// ---------------------------------------------------------------------------

/** The number of distinct creative directions the campaign planner must emit. */
const CAMPAIGN_DIRECTIONS = 3;
/** Frame-count clamp bounds (D-08): a carousel never exceeds the perf cap. */
const MIN_FRAME_COUNT = 1;
const MAX_FRAME_COUNT = 10;

/** Input to the campaign planner. Carries the optional brief fields (D-04). */
export interface RunCampaignPlannerInput {
  /** The raw user prompt / brief body. */
  prompt: string;
  /** The artifact type ('social-post' | 'instagram-carousel'); affects the key. */
  artifactType: string;
  /** Optional target audience from the brief (D-04). */
  audience?: string;
  /** Optional campaign objective/goal from the brief (D-04). */
  objective?: string;
  /** Optional delivery channel from the brief (D-04). */
  channel?: string;
  /**
   * The resolved foundation coverage (D-01 upstream). Scopes the plan to what
   * the brand supports (e.g. the resolved appearance roles). Optional so the
   * planner is unit-testable in isolation.
   */
  resolvedCoverage?: {
    brandId?: string;
    outputProfile?: string;
    appearanceRoles?: string[];
  };
  /** Optional model id override; defaults to CLAUDE_MODEL via callModel. */
  model?: string;
  /** Optional cache instance (defaults to the shared response cache). */
  cache?: ResponseCache;
}

const CAMPAIGN_SYSTEM_PROMPT =
  'You are a campaign planner for the Jio Experience Builder. Given a campaign ' +
  'brief (prompt + optional audience / objective / channel) and the resolved Jio ' +
  'foundation coverage, produce a STRUCTURED PLAN only: a brief summary, the ' +
  'audience, an ordered message hierarchy (most→least prominent, e.g. ' +
  'hook → features → proof → CTA), EXACTLY THREE distinct creative directions, a ' +
  'recommended direction index (0-based), and a recommended carousel frame count ' +
  '(a whole number, typically 3..6, never more than 10) derived from the message ' +
  'hierarchy. Each creative direction MUST be grounded in the EXISTING Jio design ' +
  'system: pick a leadRole from the Jio appearance roles and a surfaceMood from the ' +
  'Jio surface tokens — NEVER invent colors, fonts, or a visual system. Do NOT ' +
  'write final copy, choose components, or emit any markup — you ADVISE; later ' +
  'steps assemble the artifact.';

function buildCampaignPlannerPrompt(input: RunCampaignPlannerInput): string {
  const roles = input.resolvedCoverage?.appearanceRoles?.join(', ') || 'default Jio roles';
  return [
    `Brief: ${input.prompt}`,
    `Artifact type: ${input.artifactType}.`,
    input.audience ? `Audience: ${input.audience}.` : '',
    input.objective ? `Objective: ${input.objective}.` : '',
    input.channel ? `Channel: ${input.channel}.` : '',
    input.resolvedCoverage?.outputProfile
      ? `Output profile: ${input.resolvedCoverage.outputProfile}.`
      : '',
    `Resolved Jio appearance roles available: ${roles}.`,
    'Return a campaign plan: briefSummary, audience, messageHierarchy[], exactly ' +
      'three directions[], recommendedDirectionIndex, recommendedFrameCount.',
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Run the campaign planner: return a schema-valid, DS-grounded `CampaignPlanT`
 * via the single `callModel` seam, memoized on the canonical inputs (D-05).
 *
 * Runtime re-assert (mirrors `runPlanner`'s `screenCount` idiom): the Zod schema
 * can no longer carry number bounds (Anthropic rejects integer min/max), so this
 * RE-ASSERTS what the schema cannot enforce:
 *   - `recommendedFrameCount` is rounded + clamped to 1..10 (D-08).
 *   - `recommendedDirectionIndex` is rounded + clamped to 0..directions.length-1.
 *   - exactly THREE directions — trim extras / throw on too few (documented:
 *     the model is instructed to return three; we trim a longer list to the
 *     first three deterministically and throw if it returns fewer, since a
 *     <3-direction plan is not the contract the HITL card renders).
 */
export async function runCampaignPlanner(input: RunCampaignPlannerInput): Promise<CampaignPlanT> {
  const cache = input.cache ?? sharedCache();
  const key = cacheKey({
    step: 'campaign-plan',
    brandId: input.resolvedCoverage?.brandId,
    artifactType: input.artifactType,
    outputProfile: input.resolvedCoverage?.outputProfile,
    prompt: [input.prompt, input.audience, input.objective, input.channel].filter(Boolean).join(' '),
    model: input.model,
  });

  return memoize(cache, key, async () => {
    const plan = await callModel({
      schema: CampaignPlanSchema as unknown as z.ZodType<CampaignPlanT>,
      prompt: buildCampaignPlannerPrompt(input),
      system: CAMPAIGN_SYSTEM_PROMPT,
      ...(input.model ? { model: input.model } : {}),
    });

    // Enforce EXACTLY three directions (prose-only in the schema). Trim a longer
    // list to the first three; a shorter list is a contract violation.
    let directions = plan.directions;
    if (directions.length > CAMPAIGN_DIRECTIONS) {
      directions = directions.slice(0, CAMPAIGN_DIRECTIONS);
    } else if (directions.length < CAMPAIGN_DIRECTIONS) {
      throw new Error(
        `Campaign plan must contain exactly ${CAMPAIGN_DIRECTIONS} directions; got ${directions.length}.`
      );
    }

    // Re-assert the number constraints the API-bound schema can't carry.
    const recommendedFrameCount = Math.max(
      MIN_FRAME_COUNT,
      Math.min(MAX_FRAME_COUNT, Math.round(plan.recommendedFrameCount))
    );
    const recommendedDirectionIndex = Math.max(
      0,
      Math.min(directions.length - 1, Math.round(plan.recommendedDirectionIndex))
    );

    return { ...plan, directions, recommendedFrameCount, recommendedDirectionIndex };
  });
}

/** Stable identity for the campaign planner agent. */
export const campaignPlannerAgent = {
  id: 'campaign-planner',
  description:
    'CAMP-02 campaign planner — brief summary, audience, message hierarchy, three DS-grounded directions, recommended index + frame count.',
  run: runCampaignPlanner,
} as const;
