/**
 * irGenerator.ts — GEN-05: the LLM IR Generator (replaces mockGeneration.ts 1:1).
 *
 * This is the COMMIT step of the assembler-last pipeline (D-01): it is the
 * single LLM call that assembles the advisory spec fragments into one valid
 * `JioExperienceIR` via constrained structured output (`Output.object`, routed
 * through the single `callModel` seam — the ONLY `ai`/`@ai-sdk` touchpoint).
 *
 * It preserves `mockGeneration.ts`'s contract and structure 1:1:
 *   - the discriminated result `{ ok: true; ir } | { ok: false; foundationGap?;
 *     componentGap? }`;
 *   - gate-then-assemble: foundation gate (uncovered/unresolvable → gap, no IR)
 *     → component gate (every requested id must be an EXACT registry member,
 *     never a near match) → assemble;
 *   - a defensive `parseIR` guard before returning `ok: true`.
 *
 * What is NEW (vs the mock):
 *   - PER-SECTION DECOMPOSITION (roadmap mandate): the planner's section list +
 *     message hierarchy is the skeleton; each section's component instances are
 *     filled in a bounded `callModel` request that receives the full section
 *     list as shared context for global coherence; the results assemble into
 *     one IR. (In this slice the planner advisory is minimal — Plan 02 adds the
 *     real planner/Design/ToV advisors.)
 *   - IN-GEN RETRY (D-06): on a `parseIR` failure OR a compiled-AST
 *     `validateAst` failure of the compiled output, the error is appended to
 *     the prompt and the model is re-called, capped at ~3 attempts, then a gap
 *     is emitted. This loop lives HERE (orchestration), never in an AI-SDK
 *     callback.
 *   - COMPONENT-ID CONSTRAINT (Pitfall #9 / REG-03): the model is told the
 *     retrieved `queryRegistry()` ids, and any IR naming an unregistered id is
 *     rejected to a `componentGap` — never compiled, never substituted.
 *   - PER-COMPONENT PROP CONTRACTS (closes the degenerate-IR gap): for every
 *     requested component the prompt now declares its REQUIRED props and the
 *     allowed enum values for its variant/enum props, sourced from the SAME
 *     `getRegistryItem` metadata the validator enforces. The model is told
 *     exactly what `validateAst` will check (e.g. `PaginationDots` needs a
 *     numeric `count`), so it stops emitting prop-incomplete instances that the
 *     repair loop would otherwise have to catch.
 *   - REAL-COPY + INSTANCE-BUDGET GUIDANCE: the prompt requires real, meaningful
 *     text in content slots (never placeholders/empty) and caps instances per
 *     section so a simple prompt can no longer balloon into ~225 instances.
 *   - MARKUP-FREE GUARD (Pitfall #2): smuggled JSX/HTML in any IR string field
 *     is rejected by `parseIR`'s markup-free Zod refinement → gap, never compile.
 *   - DETERMINISTIC REQUIRED-PROP BACKFILL (GAP-01): the model is unreliable —
 *     across live UAT it kept omitting structural required props (`alt` on Logo,
 *     `title` on ListItem, `icon` on Icon/IconButton), so Gate C
 *     (`missing-required-prop`) rejected every attempt and generation refused.
 *     The prompt-injection contracts above improve first-pass quality but cannot
 *     GUARANTEE compliance. So on EVERY attempt, BEFORE validation, we
 *     deterministically complete every registry-required prop that the model
 *     left absent on any instance — using a valid enum value (`values[0]`) for
 *     enum props and a sensible non-empty default for free props. This is a
 *     completeness safety-net for REQUIRED STRUCTURAL props only: it never
 *     invents token values, never adds non-required or unregistered props, never
 *     overwrites a prop the model supplied, and never introduces a new component.
 *     The artifact therefore stays 100% real Jio components + tokens; the backfill
 *     only ensures the candidate is structurally complete so generation converges
 *     regardless of model compliance.
 */

import { z } from 'zod';
import {
  JioExperienceIR,
  parseIR,
  type JioExperienceIRT,
  type JioIRComponentInstanceT,
  type JioIRLayoutNodeT,
  type FoundationResolveInputT,
  type FoundationGapT,
  type PageCompositionT,
  type SectionCompositionT,
  DEFAULT_SECTION_PATTERN_ID,
  getSectionPattern,
} from '@oneui/experience-builder-core';
import {
  queryRegistry,
  getRegistryItem,
  type JioComponentGap,
} from '@oneui/experience-builder-registry';
import { callModel } from './modelAdapter';
import { compile as compileReal, type CompileContext, type CompileResult } from './compiler';
import { resolveFoundation, type ResolveFoundationInput } from './foundationResolver';
import type { SectionDesignSpecT } from './adapters/designAdapter';
import type { SectionCopySpecT } from './adapters/voiceAdapter';
import { renderReactWebOneUIEnvironmentContract } from './reactWebEnvironment';
import type { GeneratedImageAsset } from './imageGeneration';

type GenerateIRDesignSpec =
  | SectionDesignSpecT
  | {
      sectionId: string;
      surfaceMode?: string;
      components?: string[];
    };

// ---------------------------------------------------------------------------
// compile seam (DI-for-tests, mirrors modelAdapter's __setCallModelImpl idiom)
//
// The in-gen retry loop references compile() through this seam so the GEN-05
// unit test can inject a deterministic validateAst result (so Task 2 is
// independently testable) while production uses the real compiler.
// ---------------------------------------------------------------------------

let _compileImpl: (ir: JioExperienceIRT, ctx?: CompileContext) => CompileResult = compileReal;

/** TEST SEAM ONLY. Override `compile` used by the retry check. Returns restore. */
export function __setCompileImpl(
  impl: (ir: JioExperienceIRT, ctx?: CompileContext) => CompileResult
): () => void {
  const previous = _compileImpl;
  _compileImpl = impl;
  return () => {
    _compileImpl = previous;
  };
}

// ---------------------------------------------------------------------------
// Public contract (preserved 1:1 from mockGeneration.ts)
// ---------------------------------------------------------------------------

export interface GenerateIRInput {
  /** The frozen request identity + (optionally) the brand's real foundations. */
  request: ResolveFoundationInput;
  /**
   * Raw user prompt for this run. This is intentionally separate from the
   * foundation request identity: the resolver needs stable brand/profile fields,
   * while the assembler needs the full product/module brief to avoid drifting
   * into generic Jio landing-page copy.
   */
  userPrompt?: string;
  /**
   * Component ids the request wants. Defaults to a registry-approved set so the
   * happy path always yields a valid IR. If ANY requested id is unregistered /
   * known-drift, generation short-circuits to a component gap (no IR).
   */
  requestedComponents?: string[];
  /**
   * The planner's section skeleton (D-01 advisory). Each section carries an
   * optional `intent` (what it communicates) so the per-section prompt can ground
   * copy + composition in the planner's intent. Defaults to a single 'main'
   * section. (D-05: advisors are no longer discarded — the workflow threads the
   * full planner skeleton here.)
   */
  sections?: Array<{
    id: string;
    name: string;
    intent?: string;
    patternId?: string;
    attentionLevel?: string;
  }>;
  /**
   * The planner's message hierarchy: key messages ordered most→least prominent.
   * The IR Generator orders the prompt's prominence guidance by this list so the
   * model weights headline/body/CTA accordingly (D-07).
   */
  messageHierarchy?: string[];
  /**
   * The Design advisor's per-section spec (chosen registry components +
   * surfaceMode). The IR Generator composes the ADVISED components into layout
   * primitives instead of re-asking the model from scratch (D-05).
   */
  designSpecs?: GenerateIRDesignSpec[];
  /** First-class page/section composition plan selected before assembly. */
  compositionPlan?: PageCompositionT;
  /** Generated topic image assets that can satisfy required image/media props. */
  imageAssets?: GeneratedImageAsset[];
  /**
   * The ToV advisor's per-section copy spec (headline/body/cta). The IR Generator
   * places this REAL copy into content props instead of generic placeholders
   * (D-05/D-07).
   */
  copySpecs?: SectionCopySpecT[];
}

/**
 * One deterministic-backfill provenance record (QUAL-03 / D-08). Carries ONLY
 * structural metadata — `instanceId`, the filled `propName`, and whether it was a
 * CONTENT prop (`isContent`). Never any prompt secret or token (T-04.2-07). Plan
 * 04's quality gate reads `meta.backfilled` to flag any content prop the model
 * failed to supply (which real ToV copy should now make rare).
 */
export interface BackfillRecord {
  instanceId: string;
  propName: string;
  isContent: boolean;
}

export type GenerateIRResult =
  | { ok: true; ir: JioExperienceIRT; meta: { backfilled: BackfillRecord[] } }
  | { ok: false; foundationGap?: FoundationGapT; componentGap?: JioComponentGap };

/** Max in-gen retry attempts (D-06 cap ~2–3). */
export const MAX_IR_ATTEMPTS = 3;

/**
 * Soft cap on component instances the model should emit per section. Stated in
 * the prompt as guidance (not schema-enforced) to stop a simple prompt from
 * ballooning into hundreds of degenerate instances. A real, usable section is
 * a handful of components, not a wall of them.
 */
export const MAX_INSTANCES_PER_SECTION = 12;

// ---------------------------------------------------------------------------
// Per-section structured-output schema (the model fills one section's instances)
// ---------------------------------------------------------------------------

/**
 * The model returns ONE section's component instances per bounded call (the
 * per-section decomposition). We reuse the IR component-instance shape; the
 * full-IR `parseIR` guard + the registry-id check below are the real gates.
 */
const SectionFillSchema = z.object({
  instances: z.array(
    z.object({
      id: z.string().min(1),
      type: z.string().min(1),
      // Arbitrary-key bags. NOT `z.record(z.string(), …)`: in Zod 4 that emits
      // JSON-schema `propertyNames`, which Anthropic's structured output rejects
      // (400: "For 'object' type, property 'propertyNames' is not supported").
      // `z.object({}).catchall(...)` yields {type:object, additionalProperties}
      // with no propertyNames — same Record<string, unknown> semantics. parseIR
      // is the real structural gate downstream.
      props: z.object({}).catchall(z.unknown()).optional(),
      slots: z.object({}).catchall(z.unknown()).optional(),
    })
  ),
});

// ---------------------------------------------------------------------------
// The generator
// ---------------------------------------------------------------------------

export async function generateIR(input: GenerateIRInput): Promise<GenerateIRResult> {
  // (1) Foundation gate — uncovered/unresolvable profile → foundation gap (no
  //     IR), never a fabricated dimension (FND-03 / Pitfall 6).
  const resolved = resolveFoundation(input.request);
  if (!resolved.ok) {
    return { ok: false, foundationGap: resolved.gap };
  }

  // (2) Component gate — every requested component MUST be an exact registry
  //     member (REG-03 / Pitfall 9). An unregistered / known-drift id →
  //     component gap (no IR), never a near match.
  const requested =
    input.requestedComponents && input.requestedComponents.length > 0
      ? input.requestedComponents
      : ['Button', 'Badge'];

  for (const id of requested) {
    const lookup = getRegistryItem(id);
    if (!lookup.ok) {
      return { ok: false, componentGap: lookup };
    }
  }

  // Registry id allowlist passed to the model (constrained decoding context).
  const registryIds = queryRegistry().map((i) => i.id);
  // Per-component prop contracts for the requested ids — required props + enum
  // values, sourced from the SAME registry metadata the validator enforces.
  const componentContracts = buildComponentContracts(requested);
  const sections: Array<{
    id: string;
    name: string;
    intent?: string;
    patternId?: string;
    attentionLevel?: string;
  }> =
    input.sections && input.sections.length > 0
      ? input.sections
      : [{ id: 'section-main', name: 'main' }];

  // Index the advisor specs by section id so each per-section prompt can read its
  // OWN design components + ToV copy (D-05 — advisors are no longer discarded).
  const designBySection = new Map<string, SectionDesignSpecT>();
  for (const spec of input.designSpecs ?? []) {
    designBySection.set(spec.sectionId, normalizeDesignSpec(spec));
  }
  const compositionBySection = new Map<string, SectionCompositionT>();
  for (const spec of input.compositionPlan?.sections ?? []) {
    compositionBySection.set(spec.sectionId, spec);
  }
  const copyBySection = new Map<string, SectionCopySpecT>();
  for (const spec of input.copySpecs ?? []) copyBySection.set(spec.sectionId, spec);
  const messageHierarchy = input.messageHierarchy ?? [];
  const imageAssets = input.imageAssets ?? [];

  const ctx: CompileContext = {
    ...(input.request.brandId ? { brandId: input.request.brandId } : {}),
    ...(input.request.outputProfile ? { outputProfile: input.request.outputProfile } : {}),
    ...(input.userPrompt ? { intent: input.userPrompt } : {}),
  };

  const foundationRefs = Object.keys(resolved.theme.appearances).map(
    (role) => `appearance:${role}`
  );

  // (3) In-gen retry loop (D-06). Each attempt re-runs per-section decomposition
  //     and assembles a candidate IR; on parseIR OR compiled-AST validateAst
  //     failure we append the error to the prompt and re-call, capped at
  //     MAX_IR_ATTEMPTS, then emit a gap.
  //
  //     GAP-01 fix: the raw blocking JSON alone tells the model WHAT failed but
  //     not the POSITIVE contract (the required-prop names per component). When
  //     the model reaches for components outside `requested` (e.g. Logo/Image/
  //     Icon/ListItem on a landing page), it has no required-prop guidance and
  //     keeps omitting `alt`/`src`/`icon`/`title` across all 3 attempts. So on
  //     every failure we derive the component types actually present in the
  //     failing candidate (from the parsed IR when available, else from the
  //     blocking offenders) and inject their `buildComponentContracts(...)`
  //     required-prop + enum contracts into the next attempt's prompt — a clear,
  //     positive "these components MUST include these props" block, in addition
  //     to the existing blocking-error text. This is what makes the repair loop
  //     able to actually recover.
  let lastError = '';
  let lastRetryContracts = '';
  for (let attempt = 1; attempt <= MAX_IR_ATTEMPTS; attempt++) {
    const componentInstances: JioIRComponentInstanceT[] = [];
    const sectionInstanceMap: Record<string, JioIRComponentInstanceT[]> = {};
    // QUAL-03 / D-08: every deterministic backfill on this attempt is recorded as
    // provenance for the quality gate (Plan 04). Reset per attempt.
    const backfilled: BackfillRecord[] = [];

    // Per-section decomposition: fill each section's instances in a bounded
    // call, passing the full section list + the registry id allowlist + the
    // requested components as shared context for global coherence.
    for (const section of sections) {
      const designSpec = designBySection.get(section.id);
      const compositionSpec = compositionBySection.get(section.id);
      const sectionContracts = renderComponentContracts(
        buildComponentContracts(
          unionTypes(requested, designSpec?.components ?? compositionSpec?.allowedComponents ?? [])
        )
      );
      const basePrompt = buildSectionPrompt({
        request: input.request,
        userPrompt: input.userPrompt,
        section,
        allSections: sections,
        registryIds,
        requested,
        componentContractsText: sectionContracts || renderComponentContracts(componentContracts),
        messageHierarchy,
        ...(designSpec ? { designSpec } : {}),
        ...(compositionSpec ? { compositionSpec } : {}),
        ...(copyBySection.get(section.id) ? { copySpec: copyBySection.get(section.id) } : {}),
        ...(imageAssets.length > 0 ? { imageAssets } : {}),
      });
      let prompt = basePrompt;
      if (lastError) {
        prompt += `\n\nPREVIOUS ATTEMPT FAILED — FIX: ${lastError}`;
        // GAP-01: positive required-prop/enum contracts for the components the
        // failing IR actually used, so the model supplies what validation needs
        // (not just what it omitted last time).
        if (lastRetryContracts) {
          prompt +=
            `\n\nThe components used in the failing attempt MUST include these props ` +
            `(supply every REQUIRED prop, only allowed enum values):\n${lastRetryContracts}`;
        }
      }

      const fill = await callModel({
        schema: SectionFillSchema,
        prompt,
        system:
          'You assemble Jio Experience IR sections. Use ONLY the provided registry component ids ' +
          'for every instance `type`. Supply every REQUIRED prop listed for each component, and only ' +
          'values from the stated allowed sets for enum props. Put real, meaningful copy in text/content ' +
          'props — never placeholders, lorem ipsum, or empty strings. Emit plain, escaped text only — ' +
          `never HTML/JSX/markup.\n\n${renderReactWebOneUIEnvironmentContract()}`,
      });

      const rawInstances = (fill.instances ?? []) as JioIRComponentInstanceT[];
      seedSectionTypography(rawInstances, copyBySection.get(section.id), section);
      attachGeneratedAssets(rawInstances, imageAssets, section.name);
      // Drop instances that need a real image/media asset we do not have (a
      // required src/href/url that is empty or a placeholder URL). Backfilling
      // such a prop with `placehold.co` is exactly what the quality gate rejects,
      // so every run with an image gapped. Honour the prompt's MEDIA rule
      // deterministically: OMIT the asset-dependent instance rather than fabricate
      // a URL. (The model is also instructed not to emit these; this is the
      // belt-and-suspenders guarantee for when it does anyway.)
      const instances = rawInstances.filter((inst) => !requiresUnavailableAsset(inst));
      // OUTPUT-QUALITY: wire the section's REAL ToV copy into the components'
      // visible `children`, overriding the model's "<Section> children" junk. Runs
      // BEFORE backfill so backfill never re-adds a junk default.
      wireRealCopyIntoInstances(instances, copyBySection.get(section.id), section.name);
      // GAP-01 / QUAL-03: deterministically complete every registry-required prop
      // the model left absent on these instances, BEFORE assembly/validation, and
      // record each fill as provenance. Done per-section so the section name can
      // seed humanized content defaults. Content props should now be rare here —
      // real ToV copy fills them first — and any that remain are flagged for the
      // quality gate (D-08).
      for (const inst of instances) backfilled.push(...backfillRequiredProps(inst, section.name));
      sectionInstanceMap[section.id] = instances;
      componentInstances.push(...instances);
    }

    // Assemble the candidate IR. Each section carries an explicit `layout` tree
    // (LAYOUT-05) — so `irToAst` compiles the section into real Jio
    // `Container`/`Grid` nodes explicitly, never the legacy 'Stack' wrapper. This
    // is what retires the redundant Stack→Container remap in workflow.ts:
    // primitives now compile explicitly (D-01/D-05). The design advisor's
    // surfaceMode (when present) anchors the section's surface.
    //
    // The layout is NESTED — an outer `stack` wraps an inner `row` of the
    // section's instances — so the section has REAL structure (depth≥2 AND a
    // row), clearing the QUAL-04 `flat-layout` gate. A flat single-level stack of
    // leaves is exactly what D-10 rejects as "not a genuine product UI"; the
    // assembler composes genuine nesting instead of a flat list.
    const contentByKey: Record<string, string> = {};
    const candidate: unknown = {
      version: 1,
      artifactType: input.request.artifactType,
      targetProfile: input.request.outputProfile,
      brandId: input.request.brandId,
      foundationRefs,
      sections: sections.map((s) => {
        const instances = sectionInstanceMap[s.id] ?? [];
        const designSpec = designBySection.get(s.id);
        const composition = compositionBySection.get(s.id) ?? compositionForSection(s, designSpec);
        const surfaceMode = composition.surfaceMode;

        // QUAL-04 `empty-section-copy`: place the ToV advisor's REAL per-section
        // copy into `content` keyed `<section>.headline` / `<section>.body` (the
        // exact keys the structural gate reads). When the ToV advisor produced no
        // copy for this section, fall back to a substantive line derived from the
        // section intent so a covered request never emits empty-copy. This is
        // honest authored content (not a placeholder sentinel) — the placeholder
        // gate continues to block backfilled/placeholder CONTENT props separately.
        const copy = copyBySection.get(s.id);
        const headline = copy?.headline?.trim() ? copy.headline.trim() : `${humanize(s.name)}`;
        const body = copy?.body?.trim()
          ? copy.body.trim()
          : s.intent?.trim() ||
            `The ${humanize(s.name)} section of this ${humanize(input.request.artifactType)}.`;
        contentByKey[`${s.name}.headline`] = headline;
        contentByKey[`${s.name}.body`] = body;

        return {
          id: s.id,
          name: s.name,
          surfaceMode,
          instances,
          // Explicit NESTED layout: an outer vertical `stack` containing an inner
          // `row` of the section's instances, both on token-driven gaps. The
          // compiler maps these onto real Jio Container/Container(row) nodes
          // (never an invented Stack/Row/Spacer). The nesting gives depth≥2 + a
          // row primitive so the section reads as real structure (QUAL-04).
          layout: buildCompositionLayout(s.id, instances, composition),
        };
      }),
      componentInstances,
      content: contentByKey,
      a11yRequirements: { wcagLevel: 'AA' },
      validationStatus: 'draft',
    };

    // Gate A: markup-free Zod parse (Pitfall #2). A smuggled tag/attr fails here.
    const parsed = parseIR(candidate);
    if (!parsed.success) {
      lastError = parsed.error.message;
      // The candidate failed Zod, so `parsed.data` is unavailable — derive the
      // types from the raw assembled instances instead, so the retry still
      // carries positive prop contracts for whatever the model just used.
      lastRetryContracts = renderComponentContracts(
        buildComponentContracts(collectTypesFromInstances(componentInstances))
      );
      continue;
    }

    // Gate B: every component instance `type` must be a registered id
    //         (Pitfall #9 / REG-03). An unregistered id → component gap, never
    //         compiled, never a near match.
    const unregistered = findUnregisteredType(parsed.data);
    if (unregistered) {
      const lookup = getRegistryItem(unregistered);
      if (!lookup.ok) {
        return { ok: false, componentGap: lookup };
      }
    }

    // Gate C: compiled-AST allowlist validation (D-06 retry trigger). On a
    //         validateAst failure (now incl. missing required props) we
    //         re-prompt with the violations so the model can supply them.
    const { validation } = _compileImpl(parsed.data, ctx);
    if (!validation.passed) {
      lastError = JSON.stringify(validation.blocking);
      // Derive the component types present in the failing IR (primary source),
      // unioned with any types the blocking offenders point at, and surface
      // their required-prop + enum contracts on the next attempt.
      lastRetryContracts = renderComponentContracts(
        buildComponentContracts(
          unionTypes(
            collectInstanceTypes(parsed.data),
            extractTypesFromBlocking(validation.blocking, parsed.data)
          )
        )
      );
      continue;
    }

    // Defensive final parse (mirrors mockGeneration) before returning ok:true.
    const finalParsed = JioExperienceIR.safeParse(parsed.data);
    if (!finalParsed.success) {
      lastError = finalParsed.error.message;
      lastRetryContracts = renderComponentContracts(
        buildComponentContracts(collectInstanceTypes(parsed.data))
      );
      continue;
    }
    return { ok: true, ir: finalParsed.data, meta: { backfilled } };
  }

  // Cap reached (D-06) → emit a foundation-shaped gap carrying the last error.
  return {
    ok: false,
    foundationGap: {
      artifactType: input.request.artifactType,
      outputProfile: input.request.outputProfile,
      reason:
        `IR generation failed to produce a valid, allowlist-compliant Jio Experience IR ` +
        `after ${MAX_IR_ATTEMPTS} attempts. Last error: ${lastError || 'unknown'}.`,
    },
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function compositionForSection(
  section: { id: string; patternId?: string; attentionLevel?: string },
  designSpec?: SectionDesignSpecT
): SectionCompositionT {
  const pattern = getSectionPattern(
    designSpec?.patternId ?? section.patternId ?? DEFAULT_SECTION_PATTERN_ID
  );
  return {
    sectionId: section.id,
    patternId: designSpec?.patternId ?? pattern.id,
    attentionLevel: designSpec?.attentionLevel ?? pattern.attentionLevel,
    container: designSpec?.container ?? pattern.container,
    grid: designSpec?.grid ?? pattern.grid,
    spacingTop: designSpec?.spacingTop ?? pattern.spacingTop,
    spacingBottom: designSpec?.spacingBottom ?? pattern.spacingBottom,
    surfaceMode: designSpec?.surfaceMode ?? pattern.surfaceMode,
    allowedComponents:
      designSpec?.allowedComponents && designSpec.allowedComponents.length > 0
        ? designSpec.allowedComponents
        : pattern.allowedComponents,
  };
}

function normalizeSurfaceMode(
  value: string | undefined,
  fallback: SectionCompositionT['surfaceMode']
): SectionCompositionT['surfaceMode'] {
  if (
    value === 'default' ||
    value === 'ghost' ||
    value === 'minimal' ||
    value === 'subtle' ||
    value === 'moderate' ||
    value === 'bold' ||
    value === 'elevated'
  ) {
    return value;
  }
  return fallback;
}

function normalizeDesignSpec(spec: GenerateIRDesignSpec): SectionDesignSpecT {
  const patternId =
    'patternId' in spec && spec.patternId ? spec.patternId : DEFAULT_SECTION_PATTERN_ID;
  const pattern = getSectionPattern(patternId);
  return {
    sectionId: spec.sectionId,
    patternId: 'patternId' in spec && spec.patternId ? spec.patternId : pattern.id,
    attentionLevel:
      'attentionLevel' in spec && spec.attentionLevel
        ? spec.attentionLevel
        : pattern.attentionLevel,
    container: 'container' in spec && spec.container ? spec.container : pattern.container,
    grid: 'grid' in spec && spec.grid ? spec.grid : pattern.grid,
    spacingTop: 'spacingTop' in spec && spec.spacingTop ? spec.spacingTop : pattern.spacingTop,
    spacingBottom:
      'spacingBottom' in spec && spec.spacingBottom ? spec.spacingBottom : pattern.spacingBottom,
    surfaceMode: normalizeSurfaceMode(spec.surfaceMode, pattern.surfaceMode),
    components: spec.components ?? [],
    allowedComponents:
      'allowedComponents' in spec && spec.allowedComponents && spec.allowedComponents.length > 0
        ? spec.allowedComponents
        : pattern.allowedComponents,
  };
}

function spacingKey(bucket: SectionCompositionT['spacingTop']): string {
  if (bucket === 'none') return '0';
  if (bucket === 'sm') return '2';
  if (bucket === 'md') return '4';
  if (bucket === 'lg') return '6';
  return '8';
}

function hasTypographyInstance(instances: JioIRComponentInstanceT[]): boolean {
  return instances.some((inst) => inst.type === 'Text' || inst.type === 'Heading' || inst.type === 'Paragraph');
}

export function seedSectionTypography(
  instances: JioIRComponentInstanceT[],
  copy: SectionCopySpecT | undefined,
  section: { id: string; name: string; intent?: string; attentionLevel?: string },
): void {
  if (hasTypographyInstance(instances)) return;
  const headline = copy?.headline?.trim() || humanize(section.name);
  const body =
    copy?.body?.trim() ||
    section.intent?.trim() ||
    `A focused ${humanize(section.name)} section for this experience.`;
  const isPrimary = section.attentionLevel === 'primary' || /hero|banner/i.test(section.name);

  instances.unshift(
    {
      id: `${section.id}-headline`,
      type: 'Text',
      props: {
        text: headline,
        variant: isPrimary ? 'headline' : 'title',
        size: isPrimary ? 'L' : 'M',
        weight: 'high',
        attention: 'high',
        as: isPrimary ? 'h1' : 'h2',
      },
    },
    {
      id: `${section.id}-body`,
      type: 'Text',
      props: {
        text: body,
        variant: 'body',
        size: isPrimary ? 'L' : 'M',
        weight: 'low',
        attention: 'medium',
        as: 'p',
      },
    },
  );
}

function buildCompositionLayout(
  sectionId: string,
  instances: JioIRComponentInstanceT[],
  composition: SectionCompositionT
): JioIRLayoutNodeT {
  const gap = spacingKey(composition.spacingBottom);
  const padding = spacingKey(composition.spacingTop);
  const innerId = `${sectionId}-layout-${composition.grid}`;
  const gridColumns =
    composition.grid === 'twoColumn'
      ? { S: '1', M: '2', L: '2' }
      : composition.grid === 'productGrid'
        ? { S: '1', M: '2', L: '4' }
        : { S: '1', M: '2', L: '3' };
  const inner =
    composition.grid === 'oneColumn'
      ? ({
          kind: 'layout',
          id: innerId,
          primitive: 'stack',
          direction: 'column',
          gap,
          children: instances,
        } satisfies JioIRLayoutNodeT)
      : composition.grid === 'rail'
        ? ({
            kind: 'layout',
            id: innerId,
            primitive: 'cluster',
            direction: 'row',
            gap,
            wrap: true,
            children: instances,
          } satisfies JioIRLayoutNodeT)
        : ({
            kind: 'layout',
            id: innerId,
            primitive: 'grid',
            gap,
            columns: gridColumns,
            children: instances,
          } satisfies JioIRLayoutNodeT);

  return {
    kind: 'layout',
    id: `${sectionId}-layout`,
    primitive: 'stack',
    direction: 'column',
    gap,
    padding,
    surfaceMode: composition.surfaceMode,
    children: [inner],
  };
}

/** Distinct registered component `type`s present across a candidate's raw instances. */
function collectTypesFromInstances(instances: JioIRComponentInstanceT[]): string[] {
  const seen = new Set<string>();
  for (const inst of instances) {
    if (inst && typeof inst.type === 'string' && inst.type.length > 0) seen.add(inst.type);
  }
  return [...seen];
}

/** Distinct component `type`s present across a parsed IR (componentInstances + sections). */
function collectInstanceTypes(ir: JioExperienceIRT): string[] {
  const seen = new Set<string>();
  for (const inst of ir.componentInstances) seen.add(inst.type);
  for (const section of ir.sections) {
    for (const inst of section.instances) seen.add(inst.type);
  }
  return [...seen];
}

/**
 * Best-effort extraction of the component `type`s the blocking violations point
 * at, used as a FALLBACK source for the retry contracts (the parsed IR is the
 * primary source). Each `missing-required-prop` / `invalid-*` violation is
 * anchored to a `nodeId` (the offending instance `id`) — we resolve that id back
 * to its instance `type` via the IR. Also parses the type out of the violation
 * message (`… on Jio component "TYPE".`) so a type is still recovered if the
 * nodeId mapping is unavailable.
 */
function extractTypesFromBlocking(
  blocking: ReadonlyArray<{ message?: string; nodeId?: string }>,
  ir: JioExperienceIRT
): string[] {
  const idToType = new Map<string, string>();
  for (const inst of ir.componentInstances) idToType.set(inst.id, inst.type);
  for (const section of ir.sections) {
    for (const inst of section.instances) idToType.set(inst.id, inst.type);
  }

  const seen = new Set<string>();
  const messageType = /Jio component "([^"]+)"/;
  for (const v of blocking) {
    if (v.nodeId && idToType.has(v.nodeId)) {
      seen.add(idToType.get(v.nodeId)!);
      continue;
    }
    const match = v.message ? messageType.exec(v.message) : null;
    if (match && match[1]) seen.add(match[1]);
  }
  return [...seen];
}

/** Union two type lists, preserving order and de-duplicating. */
function unionTypes(a: string[], b: string[]): string[] {
  const seen = new Set<string>(a);
  for (const t of b) seen.add(t);
  return [...seen];
}

/** Find the first component-instance `type` that is not a registered id, if any. */
function findUnregisteredType(ir: JioExperienceIRT): string | null {
  for (const inst of ir.componentInstances) {
    if (!getRegistryItem(inst.type).ok) return inst.type;
  }
  for (const section of ir.sections) {
    for (const inst of section.instances) {
      if (!getRegistryItem(inst.type).ok) return inst.type;
    }
  }
  return null;
}

/** One requested component's prop contract, as the model will be told it. */
export interface ComponentContract {
  id: string;
  /** Names of props the registry marks `required` (validator enforces presence). */
  requiredProps: string[];
  /** Enum props → their allowed values (validator enforces membership). */
  enumProps: Array<{ name: string; values: string[] }>;
}

/**
 * Build per-component prop contracts for the requested ids from the SAME
 * registry metadata the validator enforces (`getRegistryItem`). Required props
 * + enum-value sets are exactly what `validateAst` checks (`missing-required-prop`
 * / `invalid-variant`), so the model is told precisely what will be validated —
 * keeping prompt and guardrail in lockstep. Unregistered ids are skipped here
 * (the component gate above already rejected them).
 */
export function buildComponentContracts(requested: string[]): ComponentContract[] {
  const contracts: ComponentContract[] = [];
  for (const id of requested) {
    const lookup = getRegistryItem(id);
    if (!lookup.ok) continue;
    const requiredProps = lookup.item.props.filter((p) => p.required).map((p) => p.name);
    const enumProps = lookup.item.props
      .filter((p) => p.values && p.values.length > 0)
      .map((p) => ({ name: p.name, values: p.values as string[] }));
    contracts.push({ id, requiredProps, enumProps });
  }
  return contracts;
}

// ---------------------------------------------------------------------------
// GAP-01 — deterministic required-prop backfill (completeness safety-net)
//
// The model is unreliable: in live UAT it repeatedly omitted required structural
// props (`alt`/`title`/`icon`) across all retry attempts, so Gate C rejected the
// candidate every time and generation refused. This backfill makes generation
// CONVERGE regardless of model compliance by completing — never inventing — the
// REQUIRED props the registry meta declares.
//
// Invariants (so the artifact stays 100% real Jio components + tokens):
//   • Only props the registry marks `required` are touched.
//   • Props the model already supplied are NEVER overwritten (key-present check).
//   • Non-required props and unregistered props are NEVER added.
//   • Enum required props get a value from the registry `values` set (so the
//     value-level enum check in the validator passes — no `invalid-variant`).
//   • Free required props get a sensible, non-empty default (presence is all the
//     validator requires for non-enum props). No token values are invented.
//   • Unregistered instance types are left untouched — Gate B turns those into a
//     component gap, which must not be masked.
// ---------------------------------------------------------------------------

/**
 * Content-ish free required prop names whose default should read as real copy.
 * We prefer the instance's OWN existing string props, then a humanized default
 * derived from the section name, then a generic fallback.
 */
const CONTENT_PROP_NAMES = new Set([
  'title',
  'label',
  'heading',
  'name',
  'text',
  'caption',
  'alt',
  'ariaLabel',
  'aria-label',
  'description',
]);

/**
 * SECONDARY / derivable content props (a subset of CONTENT_PROP_NAMES). These
 * are screen-reader / image-fallback text (`alt`, `aria-label`) and a
 * component-level heading attribute (`title`) — NOT the section's PRIMARY visible
 * copy. The model reliably supplies primary copy (headlines, button labels via
 * the ToV copy spec) but routinely omits these secondary props, which then get
 * backfilled. A deterministically-DERIVED value for one of these (from the
 * instance's own visible text, else the section) is coherent, real content — NOT
 * a fabricated placeholder — so it must NOT hard-block (QUAL-04). The genuinely
 * primary copy props (`children` / `label` / `heading` / `text` / `caption` /
 * `description`) stay blocking when backfilled. Refusing an entire generation
 * because a `title` / `aria-label` was auto-derived was THE primary cause of
 * every real run gapping.
 */
const DERIVABLE_SECONDARY_PROPS = new Set(['alt', 'ariaLabel', 'aria-label', 'title']);

/** Instance string props (in priority order) that can seed a content default. */
const CONTENT_SOURCE_PROPS = ['title', 'label', 'text', 'heading', 'name', 'children', 'content'];

/** Free required prop names that take a URL-ish placeholder. */
const URL_PROP_NAMES = new Set(['src', 'href', 'url', 'imageUrl', 'imageSrc']);
const GENERATED_IMAGE_PROP_NAMES = new Set(['src', 'url', 'imageUrl', 'imageSrc']);

/** Matches the placeholder image host the quality gate rejects (mirror of the
 * validator's `PLACEHOLDER_URL_RE`). A `src`/`href` holding such a URL is a fake
 * asset, not real content. */
const PLACEHOLDER_URL_RE = /placehold\.co|via\.placeholder|example\.com/i;

/**
 * True iff an instance REQUIRES a real image/media asset URL we cannot satisfy:
 * a registry-required `src`/`href`/`url` prop that is absent, empty, or holds a
 * placeholder URL. Such an instance is UNSATISFIABLE — we have no real assets,
 * and the deterministic backfill's only option is a `placehold.co` URL, which the
 * quality gate then blocks (a self-inflicted catch-22 that gapped every run with
 * an image). The honest resolution (matching the generation prompt's MEDIA rule)
 * is to OMIT the instance rather than fabricate an asset. Unregistered types are
 * left for the component-gap path.
 */
function requiresUnavailableAsset(inst: JioIRComponentInstanceT): boolean {
  if (!inst || typeof inst.type !== 'string') return false;
  const lookup = getRegistryItem(inst.type);
  if (!lookup.ok) return false;
  const props = (inst.props ?? {}) as Record<string, unknown>;
  for (const propMeta of lookup.item.props) {
    if (!propMeta.required || !URL_PROP_NAMES.has(propMeta.name)) continue;
    const val = props[propMeta.name];
    const hasRealAsset =
      typeof val === 'string' && val.trim().length > 0 && !PLACEHOLDER_URL_RE.test(val);
    if (!hasRealAsset) return true;
  }
  return false;
}

function attachGeneratedAssets(
  instances: JioIRComponentInstanceT[],
  assets: GeneratedImageAsset[],
  sectionName: string
): void {
  if (assets.length === 0) return;
  let assetIndex = 0;
  for (const inst of instances) {
    if (!inst || typeof inst.type !== 'string') continue;
    const lookup = getRegistryItem(inst.type);
    if (!lookup.ok) continue;
    const props = { ...((inst.props ?? {}) as Record<string, unknown>) };
    let touched = false;
    for (const propMeta of lookup.item.props) {
      if (!propMeta.required || !GENERATED_IMAGE_PROP_NAMES.has(propMeta.name)) continue;
      const current = props[propMeta.name];
      const needsAsset =
        typeof current !== 'string' ||
        current.trim().length === 0 ||
        PLACEHOLDER_URL_RE.test(current);
      if (!needsAsset) continue;
      const asset = assets[assetIndex % assets.length];
      if (!asset) continue;
      assetIndex += 1;
      props[propMeta.name] = asset.src;
      touched = true;
      if (lookup.item.props.some((p) => p.required && p.name === 'alt')) {
        const alt = props.alt;
        if (typeof alt !== 'string' || alt.trim().length === 0 || PLACEHOLDER_URL_RE.test(alt)) {
          props.alt = asset.alt || `Generated image for ${humanize(sectionName)}`;
        }
      }
    }
    if (touched) {
      inst.props = props as JioIRComponentInstanceT['props'];
    }
  }
}

/**
 * Conservative default for a required semantic `icon` prop. Icon-bearing OneUI
 * components render semantic icon names, not font-family tokens.
 */
const DEFAULT_ICON_NAME = 'sparkles';
const DEFAULT_FONT_TOKEN = 'var(--Typography-Font-Primary)';

/** Documented placeholder for URL-ish free required props (presence-only). */
const PLACEHOLDER_URL = 'https://placehold.co/600x400';

/**
 * Font props are token hooks. Icon props on icon-bearing components are semantic
 * names and are handled separately below.
 */
const FONT_PROP_RE = /^(font(family|-family)?)$/i;
const ICON_PROP_RE = /^icon(name|-name)?$/i;

/** Title-case + de-slug a section/artifact name for a humanized content default. */
function humanize(raw: string): string {
  const cleaned = raw.replace(/[-_]+/g, ' ').trim();
  if (!cleaned) return '';
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Junk content the model emits when it ignores the real copy (e.g. "Hero children"). */
const JUNK_CONTENT_RE = /(?: children| item)$/i;

/**
 * Wire the section's REAL ToV copy (headline / body / cta) into the components'
 * visible `children`. THE central output-quality fix: the model reliably writes
 * good copy into the section `content` map but then fills each component's
 * `children` with literal junk like "Hero Banner children" — so the rendered
 * artifact showed that junk everywhere instead of the real headline / body / CTA
 * (the copy and the components were completely disconnected). This deterministic
 * pass OVERRIDES that junk (and fills empty children) with the real copy:
 * the CTA → button-like components, headline → the first text component, body →
 * the following ones. Genuine model-authored copy (anything not junk/empty) is
 * preserved. Runs BEFORE backfill so the backfill never re-adds a junk default.
 */
function wireRealCopyIntoInstances(
  instances: JioIRComponentInstanceT[],
  copy: SectionCopySpecT | undefined,
  sectionName: string
): void {
  const headline = copy?.headline?.trim() || humanize(sectionName);
  const body = copy?.body?.trim() || '';
  const cta = copy?.cta?.trim() || '';
  const textPool = [headline, body].filter((s) => s.length > 0);
  if (textPool.length === 0 && !cta) return;

  let textPtr = 0;
  for (const inst of instances) {
    if (!inst || typeof inst.type !== 'string') continue;
    const lookup = getRegistryItem(inst.type);
    if (!lookup.ok) continue;
    const props = { ...((inst.props ?? {}) as Record<string, unknown>) };
    // Target TEXT components only: those whose registry meta makes `children` a
    // REQUIRED prop. For these, an absent `children` is otherwise junk-filled by
    // the backfill with "<Section> children" (`${humanize(section)} children`), and
    // a present one may carry the model's "<Section> children" junk too. This
    // (children-required) discriminator correctly EXCLUDES Logo / Icon / Surface /
    // Image, where `children` is not required — so we never inject text into a
    // non-text component (the earlier `slots.includes('children')` test was too
    // broad: Logo declares a children slot but does not require it).
    const childrenRequired = lookup.item.props.some((p) => p.name === 'children' && p.required);
    const hasChildren = 'children' in props;
    const current = hasChildren && typeof props.children === 'string' ? props.children.trim() : '';
    const isJunk =
      current.length === 0 || JUNK_CONTENT_RE.test(current) || /^untitled$/i.test(current);
    // Skip components that neither require children nor already carry junk children.
    if (!childrenRequired && !(hasChildren && isJunk)) continue;
    // Preserve genuine, model-authored copy verbatim.
    if (hasChildren && !isJunk) continue;

    const isButtonish = /button|link|fab|chip/i.test(inst.type);
    let value: string;
    if (isButtonish && cta) {
      value = cta;
    } else if (textPool.length > 0) {
      value = textPool[textPtr % textPool.length];
      textPtr += 1;
    } else {
      value = cta || headline;
    }
    props.children = value;
    inst.props = props as JioIRComponentInstanceT['props'];
  }
}

/** Recursively collect component instances from a layout node's subtree. */
function collectLayoutInstances(node: JioIRLayoutNodeT, out: JioIRComponentInstanceT[]): void {
  for (const child of node.children ?? []) {
    if ((child as JioIRLayoutNodeT).kind === 'layout') {
      collectLayoutInstances(child as JioIRLayoutNodeT, out);
    } else {
      out.push(child as JioIRComponentInstanceT);
    }
  }
}

/**
 * Final deterministic copy-wiring pass over a COMPLETE IR (post-repair safety
 * net). The IR Generator wires real copy into component `children` at assembly
 * time, but the bounded REPAIR loop runs the model again and can re-emit
 * "<Section> children" junk when it patches the IR — and the renderer walks
 * `section.layout`, so that junk would surface in the artifact. Re-wire every
 * section's instances (the flat `section.instances` AND the nested instances in
 * its `section.layout` tree, which are distinct objects after parse/patch) from
 * the section's real ToV copy. Idempotent: genuine model copy is preserved; only
 * junk/empty `children` are overridden. Safe to call on any IR.
 */
export function wireRealCopyIntoIR(
  ir: JioExperienceIRT,
  copySpecs: SectionCopySpecT[] | undefined
): void {
  if (!ir || !Array.isArray(ir.sections)) return;
  const copyBySectionId = new Map<string, SectionCopySpecT>();
  for (const spec of copySpecs ?? []) copyBySectionId.set(spec.sectionId, spec);
  for (const section of ir.sections) {
    const collected: JioIRComponentInstanceT[] = [];
    if (Array.isArray(section.instances)) collected.push(...section.instances);
    if (section.layout) collectLayoutInstances(section.layout, collected);
    wireRealCopyIntoInstances(collected, copyBySectionId.get(section.id), section.name);
  }
}

/**
 * Backfill every registry-`required` prop that is ABSENT from `inst.props`, in
 * place, and RETURN a `BackfillRecord[]` provenance list (QUAL-03 / D-08) — one
 * `{ instanceId, propName, isContent }` per fill. Resolves the instance's
 * registry item first; unregistered types are left untouched (Gate B owns them).
 * A prop the model already supplied is NEVER overwritten and produces NO record.
 * `isContent` is `CONTENT_PROP_NAMES.has(propName)` so the quality gate can flag
 * a backfilled CONTENT prop (which real ToV copy should now make rare) distinctly
 * from a structural one. See the section comment for the full invariants.
 *
 * Exported so the agents fixtures + the quality gate can assert the provenance
 * contract directly.
 */
export function backfillRequiredProps(
  inst: JioIRComponentInstanceT,
  sectionName: string
): BackfillRecord[] {
  const records: BackfillRecord[] = [];
  if (!inst || typeof inst.type !== 'string') return records;
  const lookup = getRegistryItem(inst.type);
  if (!lookup.ok) return records; // unregistered → Gate B emits a component gap.

  const props: Record<string, unknown> = (inst.props ?? {}) as Record<string, unknown>;

  for (const propMeta of lookup.item.props) {
    if (!propMeta.required) continue;
    // Never overwrite a prop the model already supplied (key-present check,
    // mirrors the validator's presence semantics) — and record nothing for it.
    if (Object.prototype.hasOwnProperty.call(props, propMeta.name)) continue;

    props[propMeta.name] = defaultForRequiredProp(propMeta, inst, props, sectionName);
    records.push({
      instanceId: inst.id,
      propName: propMeta.name,
      // A11y metadata (alt / aria-label) is NOT visible display copy: a derived
      // value is acceptable a11y, so it is recorded as STRUCTURAL (non-content)
      // and the quality gate flags it (warning), never hard-blocks. Visible copy
      // props remain content → a backfilled one still blocks (QUAL-04).
      isContent:
        CONTENT_PROP_NAMES.has(propMeta.name) && !DERIVABLE_SECONDARY_PROPS.has(propMeta.name),
    });
  }

  inst.props = props as JioIRComponentInstanceT['props'];
  return records;
}

/** Compute a valid default value for one missing required prop. */
function defaultForRequiredProp(
  propMeta: { name: string; values?: string[] },
  inst: JioIRComponentInstanceT,
  props: Record<string, unknown>,
  sectionName: string
): unknown {
  // Enum prop → a guaranteed-valid value (validator checks membership).
  if (propMeta.values && propMeta.values.length > 0) {
    return propMeta.values[0];
  }

  const name = propMeta.name;

  if (ICON_PROP_RE.test(name)) return DEFAULT_ICON_NAME;

  // Font-named free prop → an approved Jio token.
  if (FONT_PROP_RE.test(name)) return DEFAULT_FONT_TOKEN;

  // Secondary derivable prop (alt / aria-label / title) → a CLEAN derived value:
  // the instance's own visible text first (the ideal label/title), else a
  // humanized section name. Never the "<X> item" / "Untitled" placeholder forms —
  // those match the gate's placeholder sentinels and would (wrongly) re-block this
  // non-blocking fill.
  if (DERIVABLE_SECONDARY_PROPS.has(name)) {
    const own = firstStringProp(props, CONTENT_SOURCE_PROPS);
    if (own) return own;
    const human = humanize(sectionName);
    return human || 'Content';
  }

  // Content-ish free prop → reuse own copy, else humanized section default.
  if (CONTENT_PROP_NAMES.has(name)) {
    const own = firstStringProp(props, CONTENT_SOURCE_PROPS);
    if (own) return own;
    const human = humanize(sectionName);
    return human ? `${human} item` : 'Untitled';
  }

  // URL-ish free prop → documented placeholder (a broken placeholder is fine in
  // the Lab; the user iterates). Presence is all the validator requires.
  if (URL_PROP_NAMES.has(name)) return PLACEHOLDER_URL;

  // Any other free required prop → a short, sensible non-empty default.
  const human = humanize(sectionName);
  return human ? `${human} ${name}` : name;
}

/** First non-empty string value among `keys` on the instance's prop bag. */
function firstStringProp(props: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = props[key];
    if (typeof value === 'string' && value.trim().length > 0) return value;
  }
  return null;
}

/**
 * Render the prop contracts as compact prompt lines. Each component states its
 * required props and any enum props with their allowed values, so the model
 * supplies exactly what validation requires.
 */
function renderComponentContracts(contracts: ComponentContract[]): string {
  if (contracts.length === 0) return '(no specific prop contracts)';
  return contracts
    .map((c) => {
      const parts: string[] = [];
      parts.push(
        c.requiredProps.length > 0
          ? `REQUIRED props: ${c.requiredProps.join(', ')}`
          : 'REQUIRED props: none'
      );
      if (c.enumProps.length > 0) {
        const enums = c.enumProps.map((e) => `${e.name} ∈ {${e.values.join(', ')}}`).join('; ');
        parts.push(`enum props: ${enums}`);
      }
      return `- ${c.id}: ${parts.join(' | ')}`;
    })
    .join('\n');
}

/**
 * Build the bounded per-section prompt (shared context for global coherence).
 *
 * D-05 advisor threading: when present, the Design advisor's `designSpec`
 * (chosen components + surfaceMode) and the ToV advisor's `copySpec` (headline /
 * body / cta) are injected so the model COMPOSES the advised components into
 * layout primitives (stack/grid/row) and places the REAL copy into content props
 * — rather than re-asking from scratch and emitting placeholders. The planner's
 * `messageHierarchy` (most→least prominent) orders the prominence guidance so
 * copy is prominence-weighted (D-07). The IR Generator remains the single
 * committing step — these are READS of context, never a mid-gen advisor re-call.
 */
function buildSectionPrompt(args: {
  request: FoundationResolveInputT;
  userPrompt?: string;
  section: {
    id: string;
    name: string;
    intent?: string;
    patternId?: string;
    attentionLevel?: string;
  };
  allSections: Array<{
    id: string;
    name: string;
    intent?: string;
    patternId?: string;
    attentionLevel?: string;
  }>;
  registryIds: string[];
  requested: string[];
  componentContractsText: string;
  messageHierarchy?: string[];
  designSpec?: SectionDesignSpecT;
  compositionSpec?: SectionCompositionT;
  copySpec?: SectionCopySpecT;
  imageAssets?: GeneratedImageAsset[];
}): string {
  const {
    request,
    userPrompt,
    section,
    allSections,
    registryIds,
    requested,
    componentContractsText,
    messageHierarchy,
    designSpec,
    compositionSpec,
    copySpec,
    imageAssets = [],
  } = args;

  const lines: string[] = [
    `Artifact type: ${request.artifactType}; output profile: ${request.outputProfile}; brand: ${request.brandId}.`,
    renderReactWebOneUIEnvironmentContract(),
    ...(userPrompt?.trim()
      ? [
          `USER BRIEF (highest priority — preserve this intent, hierarchy, named CTAs, component constraints, and requested format):`,
          userPrompt.trim(),
        ]
      : []),
    `Full section list (for global coherence): ${allSections.map((s) => s.name).join(', ')}.`,
    `Fill the "${section.name}" section's component instances.`,
  ];

  if (section.intent) {
    lines.push(`Section intent (what it must communicate): ${section.intent}.`);
  }

  if (section.patternId || section.attentionLevel) {
    lines.push(
      `Planner composition: pattern ${section.patternId ?? DEFAULT_SECTION_PATTERN_ID}; attention ${section.attentionLevel ?? 'supporting'}.`
    );
  }

  // D-07: order the prompt's prominence guidance by the planner's message
  // hierarchy (most-prominent message first) so headline/body/CTA are weighted.
  if (messageHierarchy && messageHierarchy.length > 0) {
    lines.push(
      `Message hierarchy (most → least prominent — weight the most prominent message hardest): ${messageHierarchy
        .map((m, i) => `${i + 1}. ${m}`)
        .join(' ')}`
    );
  }

  lines.push(
    `Allowed registry component ids (use ONLY these for instance \`type\`): ${registryIds.join(', ')}.`
  );

  // D-05: compose the ADVISED components into layout primitives on the advised
  // surface, instead of re-asking the model to pick from scratch.
  if (designSpec) {
    if (designSpec.components.length > 0) {
      lines.push(
        `The design advisor chose these components for this section — compose THEM (do not re-pick): ${designSpec.components.join(', ')}.`
      );
    }
    lines.push(
      `Arrange the chosen components inside the ${designSpec.container} / ${designSpec.grid} recipe on a "${designSpec.surfaceMode}" surface — never a flat list.`
    );
  } else {
    lines.push(`Prefer these requested components where appropriate: ${requested.join(', ')}.`);
    lines.push(
      `Arrange components inside layout primitives (stack / grid / row) — never a flat list.`
    );
  }

  if (compositionSpec) {
    lines.push(
      `Composition contract: sectionPattern=${compositionSpec.patternId}; attention=${compositionSpec.attentionLevel}; container=${compositionSpec.container}; grid=${compositionSpec.grid}; spacingTop=${compositionSpec.spacingTop}; spacingBottom=${compositionSpec.spacingBottom}; surface=${compositionSpec.surfaceMode}; allowedComponents=${compositionSpec.allowedComponents.join(', ')}.`
    );
  }

  lines.push(
    `Component prop contracts (these EXACT requirements are validated — supply every required prop, and only allowed enum values):`,
    componentContractsText,
    // Empty required text/content props get deterministically backfilled and the
    // quality gate then REJECTS the backfilled copy — so fill them yourself.
    `Fill EVERY required text/content prop (e.g. title, label, heading, caption) with REAL, specific copy grounded in this section's intent — never leave one empty, never a generic word like "Title" or "Label". Supply a real, descriptive \`alt\`/\`aria-label\` for any component that needs one.`
  );

  // D-05/D-07: place the REAL ToV copy into content props so real copy lands,
  // not placeholders.
  if (copySpec) {
    lines.push(
      `Use this exact tone-of-voice copy in the section's content props (do NOT invent placeholders):`,
      `- headline: "${copySpec.headline}"`,
      `- body: "${copySpec.body}"`,
      ...(copySpec.cta ? [`- cta: "${copySpec.cta}"`] : [])
    );
  } else {
    lines.push(
      `Populate text/content props with real, meaningful copy for a "${request.artifactType}" — never placeholders, lorem ipsum, or empty strings.`
    );
  }

  if (imageAssets.length > 0) {
    lines.push(
      `Generated topic image assets are available for this run: ${imageAssets
        .map((asset) => `${asset.id} (${asset.provider})`)
        .join(', ')}.`,
      `For visual sections where Image is advised or allowed, include an Image component with a real descriptive alt. The assembler attaches the exact generated src automatically, so do not invent or copy any src/href/url value.`
    );
  }

  lines.push(
    // MEDIA / ASSET RULE: the single biggest source of refused runs was the
    // model emitting Image/media components with a fabricated placeholder URL
    // (e.g. "https://placehold.co/600x400"), which the quality gate correctly
    // blocks as placeholder-content — so every such run gapped. There are no
    // stock assets in the Lab. Forbid fabricated asset URLs outright and tell
    // the model to OMIT asset-dependent components rather than invent a URL.
    imageAssets.length > 0
      ? `MEDIA / ASSET RULE (critical): Generated topic imagery is available, but NEVER invent a placeholder or stock URL — no "placehold.co", "via.placeholder.com", "example.com", "lorem", "unsplash" guesses, or any made-up \`src\`/\`href\`/\`url\`. If you use Image, omit src or leave it empty and provide real descriptive alt text; the assembler attaches the generated src. Every \`alt\` / \`aria-label\` / \`caption\` must be real, descriptive, human-readable text — never empty, never a URL, never a default like "image" or "label".`
      : `MEDIA / ASSET RULE (critical): NEVER use a placeholder or fabricated image/media URL — no "placehold.co", "via.placeholder.com", "example.com", "lorem", "unsplash" guesses, or any made-up \`src\`/\`href\`/\`url\`/\`alt\` value. No stock assets are available. If a component would REQUIRE a real image/media asset you do not have, DO NOT emit that component — compose the section from text, layout, and interactive components (Button, Badge, Card, etc.) instead. Every \`alt\` / \`aria-label\` / \`caption\` must be real, descriptive, human-readable text — never empty, never a URL, never a default like "image" or "label".`,
    `Keep the section focused: emit at most ${MAX_INSTANCES_PER_SECTION} component instances (a real, usable section is a handful of components, not a wall of them).`,
    `Every instance needs a unique \`id\`. Slot/prop strings must be plain escaped text — no markup.`
  );

  return lines.join('\n');
}
