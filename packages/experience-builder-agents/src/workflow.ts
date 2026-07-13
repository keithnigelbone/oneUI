/**
 * workflow.ts
 *
 * The Mastra workflow skeleton — the ORCHESTRATION BRAIN (ORCH-01/03/04).
 *
 * Mastra `createWorkflow().then(...)` sequences the mock pipeline:
 *   intent (GEN-01) → resolve (resolveFoundation) → retrieve (queryRegistry)
 *   → IR-gen (mockGenerate) → validate (irToAst → validateAst).
 *
 * EVERY step emits the matching `ExperienceBuilderEvent` (run-started, per-step,
 * ir-produced, validation, gap, run-completed). The events are collected by the
 * run runner and are also what the route forwards over the `@mastra/ai-sdk`
 * **v6** transport (via `modelAdapter.toV6WorkflowStream`).
 *
 * ORCH-04 (the central invariant): ALL sequencing, branching (the gap
 * short-circuit), and completion live HERE, inside the Mastra workflow /
 * runner. NONE of it lives in an AI-SDK callback — the AI SDK is touched only
 * by `modelAdapter.ts`, and only for stream transport. This module imports
 * `@mastra/core/workflows`; it does NOT import `ai` / `@ai-sdk/*`.
 *
 * Node-runtime only (agents are backend, never Edge).
 */

import { z } from 'zod';
import { createWorkflow, createStep } from '@mastra/core/workflows';
import {
  irToCompositionSpec,
  compositionSpecToAst,
  irToAst,
  auditCompositionSpecQuality,
  improveCompositionSpecQuality,
  PageCompositionSchema,
  getSectionPattern,
  normalizeRenderDensity,
  renderPlatformForOutputProfile,
  type JioExperienceIRT,
} from '@oneui/experience-builder-core';
import { getPreviewExecutor } from '@oneui/experience-builder-preview';
import { queryRegistry } from '@oneui/experience-builder-registry';
import {
  validateAst,
  validateCompositionSpec,
  validateIRStructure,
  type ArtifactAst,
  type ResolvedImport,
  type ArtifactAstNode,
} from '@oneui/experience-builder-validation';
import type { JioValidationResultT } from '@oneui/experience-builder-core';
import { generateIR, wireRealCopyIntoIR } from './irGenerator';
import { astRootToArtifactAst, compile } from './compiler';
import { resolveFoundation } from './foundationResolver';
import { runPlanner, runCampaignPlanner } from './agents/plannerAgent';
import type { CampaignPlanT } from '@oneui/experience-builder-core';
import { runDesignAdapter } from './adapters/designAdapter';
import { runVoiceAdapter } from './adapters/voiceAdapter';
import { runImageGeneration } from './imageGeneration';
import { cacheKey, memoize, sharedCache } from './cache';
import { ctxSchema, emit, now, type RunContext } from './runContext';
import { getCompactDesignContext } from './designContext';
import type {
  RunExperienceInput,
  RunExperienceResult,
  FoundationsLoader,
  FoundationsLoaderInput,
  VoiceAssetsLoader,
  AgentTraceT,
} from './runTypes';
import { evaluateStep } from './steps/evaluate';
import { repairStep, updateSameValidationError } from './steps/repair';
import { EVALUATOR_CONFIG } from './evaluatorRubric';
import {
  runCarousel,
  type CanvasResolveResult,
  type FrameCopy,
  type FrameCopyRequest,
  type FramePipelineInput,
  type FramePipelineResult,
} from './steps/carousel';
import { resolveStorybookRecipeContext } from './storybookMcp';
import type { CarouselFrameResultT } from './runContext';
import type { CreativeDirectionT } from '@oneui/experience-builder-core';

// ---------------------------------------------------------------------------
// AST bridge: core ASTRoot → validator ArtifactAst (imports + root tree)
//
// `irToAst` maps the IR into a `@oneui/shared` ASTRoot. Since the IR Generator
// now emits an explicit `layout` primitive per section (04.2-03), `irToAst`
// compiles each section into a REAL Jio `Container`/`Grid` directly — there is no
// longer a 'Stack' wrapper to normalize, so the legacy `LAYOUT_TYPE_REMAP`
// Stack→Container remap has been RETIRED. (Old persisted flat IRs without a
// layout tree still round-trip through irToAst's own legacy fallback; the current
// generator never emits that flat shape.)
//
// The bridge synthesizes the resolved import set the validator needs: one Jio
// import (`@oneui/ui/components/<Type>`) per distinct compiled component type
// (Container/Grid + every instance). This is what a real compiler would emit;
// the validator's job is to confirm every binding's source is a Jio path.
// ---------------------------------------------------------------------------

/** Convert a shared AST node (component/text) into a validator node. */
function toValidatorNode(node: {
  id: string;
  kind: string;
  type?: string;
  text?: string;
  props?: Record<string, unknown>;
  children?: unknown[];
}): ArtifactAstNode {
  if (node.kind === 'text') {
    return { id: node.id, kind: 'text', text: String(node.text ?? '') };
  }
  // component
  const children = Array.isArray(node.children)
    ? node.children.map((c) => toValidatorNode(c as never))
    : [];
  return {
    id: node.id,
    kind: 'component',
    type: String(node.type ?? ''),
    props: (node.props ?? {}) as Record<string, never>,
    children,
  };
}

/** Collect every distinct component type used in the validator tree. */
function collectTypes(node: ArtifactAstNode, acc: Set<string>): void {
  if (node.kind === 'component') {
    acc.add(node.type);
    node.children.forEach((c) => collectTypes(c, acc));
  }
}

/**
 * Build the validator `ArtifactAst` from an IR: map IR → ASTRoot, then
 * synthesize one Jio import per distinct compiled component type (what a
 * compliant compiler would emit). The IR Generator's explicit layout primitives
 * compile to Container/Grid, so no type normalization is needed here anymore.
 */
export function irToArtifactAst(ir: JioExperienceIRT): ArtifactAst {
  const astRoot = irToAst(ir);
  const root = toValidatorNode(astRoot.root as never);

  const types = new Set<string>();
  collectTypes(root, types);

  const imports: ResolvedImport[] = [...types].map((type) => ({
    source: `@oneui/ui/components/${type}`,
    imported: type,
    local: type,
  }));

  return { imports, root };
}

// ---------------------------------------------------------------------------
// Event sink — collects the emitted ExperienceBuilderEvent stream
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Run input/result + context shapes are defined in `runTypes.ts` / `runContext.ts`
// (extracted so the per-step modules can share them without a circular import
// back into this file). Re-exported here so existing importers are unaffected.
//
// FoundationsLoader injection contract (D-05 isolation / FND-01 / FND-04): the
// route injects a per-run `foundationsLoader` carrying its backend client; the
// agents package treats it as an opaque async function and stays backend-free.
// The loader resolves a brand (+ optional sub-brand) to `BrandFoundations`, or
// `null` → engine system defaults (D-08; never a fabricated gap). See runTypes.ts.
// ---------------------------------------------------------------------------

export type {
  RunExperienceInput,
  RunExperienceResult,
  FoundationsLoader,
  FoundationsLoaderInput,
  VoiceAssets,
  VoiceAssetsLoader,
  AgentTraceT,
} from './runTypes';
export { ctxSchema, type RunContext } from './runContext';

// ---------------------------------------------------------------------------
// Mastra steps — orchestration lives HERE (ORCH-04), never in an AI-SDK callback
// ---------------------------------------------------------------------------

const intentStep = createStep({
  id: 'intent',
  inputSchema: ctxSchema,
  outputSchema: ctxSchema,
  execute: async ({ inputData }) => {
    const { ctx } = inputData;
    // GEN-01 intent: P1 mock — the request already carries artifactType/profile.
    emit(ctx, { type: 'step', runId: ctx.runId, step: 'intent', status: 'completed', at: now() });
    return { ctx };
  },
});

const resolveStep = createStep({
  id: 'resolve-foundation',
  inputSchema: ctxSchema,
  outputSchema: ctxSchema,
  execute: async ({ inputData }) => {
    const { ctx } = inputData;
    if (ctx.halted) return { ctx };
    emit(ctx, {
      type: 'step',
      runId: ctx.runId,
      step: 'resolve-foundation',
      status: 'started',
      at: now(),
    });

    // FND-01/FND-04: populate `brandFoundations` from the injected loader. When
    // a loader is supplied AND nothing pre-supplied `brandFoundations`, call it
    // with the brand (and optional sub-brand) id and write any non-null result
    // into RunContext — `planStep`/`generateStep` already consume it via the
    // `resolveFoundation` chain. A null result is NOT a gap: the resolver falls
    // back to the engine's system defaults (D-08). The downstream gap branch is
    // still decided in those steps via `resolveFoundation`.
    if (ctx.request.foundationsLoader && !ctx.request.brandFoundations) {
      try {
        const loaded = await ctx.request.foundationsLoader({
          brandId: ctx.request.brandId,
          ...(ctx.request.subBrandConfigId
            ? { subBrandConfigId: ctx.request.subBrandConfigId }
            : {}),
        });
        if (loaded) {
          ctx.request.brandFoundations = loaded;
        }
      } catch (err) {
        // CR-01 / D-08: a THROWN loader error (Convex network blip, malformed
        // id, transient outage) must NOT abort the run. Degrade to the engine's
        // system defaults exactly like a null result — the documented "never a
        // crash" guarantee. Logged server-side; the downstream gap branch (via
        // resolveFoundation) is unaffected.
        console.error(
          `[experience-lab] run ${ctx.runId} foundations loader threw — degrading to system defaults (D-08):`,
          err
        );
      }
    }

    emit(ctx, {
      type: 'step',
      runId: ctx.runId,
      step: 'resolve-foundation',
      status: 'completed',
      at: now(),
    });
    return { ctx };
  },
});

const retrieveStep = createStep({
  id: 'retrieve',
  inputSchema: ctxSchema,
  outputSchema: ctxSchema,
  execute: async ({ inputData }) => {
    const { ctx } = inputData;
    emit(ctx, { type: 'step', runId: ctx.runId, step: 'retrieve', status: 'started', at: now() });
    // Retrieve registry candidates (REG-02) — deterministic.
    queryRegistry();
    emit(ctx, { type: 'step', runId: ctx.runId, step: 'retrieve', status: 'completed', at: now() });
    return { ctx };
  },
});

// ---------------------------------------------------------------------------
// Advisory steps (assembler-last, D-01): plan → design → copy. Each ADVISES —
// it writes a structured fragment into RunContext; NONE emits IR. The IR
// Generator (generate-ir) reads these fragments and is the only committing step.
//
// D-05 RUN TRACING (explicit, in-scope): the per-step started/completed
// ExperienceBuilderEvent stream emitted here IS the P2 Run-Tracing surface. This
// is honored by D-05's own locked caveat that some Mastra-native features may be
// Cloud-only/newer-API: RESEARCH verified @mastra/observability@1.14.0 is NOT
// installed at the pinned @mastra/core@1.37.1 (Pitfall C / Open Q3 RESOLVED), so
// richer Observability spans are the genuine P5 (PROD-02) extension, NOT a P2
// omission. We deliberately do NOT pass an `observability` instance to Mastra
// (it would silently fall back to NoOpObservability) — the event stream is the
// trace surface.
//
// D-05 RESPONSE CACHING: each advisory step body is wrapped with cache.ts
// memoization keyed on the canonical inputs, so identical inputs reuse results.
// ---------------------------------------------------------------------------

const planStep = createStep({
  id: 'plan',
  inputSchema: ctxSchema,
  outputSchema: ctxSchema,
  execute: async ({ inputData }) => {
    const { ctx } = inputData;
    if (ctx.halted) return { ctx };
    emit(ctx, { type: 'step', runId: ctx.runId, step: 'plan', status: 'started', at: now() });

    // Resolve coverage for the planner (D-01 upstream). An unresolvable profile
    // short-circuits to a gap here — plan/design/copy never run on an uncovered
    // profile. Branching is the workflow's job (ORCH-04).
    const resolved = resolveFoundation({
      brandId: ctx.request.brandId,
      artifactType: ctx.request.artifactType,
      outputProfile: ctx.request.outputProfile,
      ...(ctx.request.theme ? { theme: ctx.request.theme } : {}),
      ...(ctx.request.brandFoundations ? { brandFoundations: ctx.request.brandFoundations } : {}),
    });
    if (!resolved.ok) {
      emit(ctx, { type: 'gap', runId: ctx.runId, foundationGap: resolved.gap, at: now() });
      emit(ctx, { type: 'step', runId: ctx.runId, step: 'plan', status: 'completed', at: now() });
      ctx.outcome = 'gap';
      ctx.halted = true;
      return { ctx };
    }

    const appearanceRoles = Object.keys(resolved.theme.appearances);
    const prompt = ctx.request.prompt ?? `Generate a ${ctx.request.artifactType}.`;

    // D-05 memoization: identical canonical inputs reuse the plan.
    ctx.plan = await memoize(
      sharedCache(),
      cacheKey({
        step: 'plan',
        brandId: ctx.request.brandId,
        artifactType: ctx.request.artifactType,
        outputProfile: ctx.request.outputProfile,
        prompt,
        requestedComponents: ctx.request.requestedComponents,
      }),
      () =>
        runPlanner({
          prompt,
          artifactType: ctx.request.artifactType,
          resolvedCoverage: {
            brandId: ctx.request.brandId,
            outputProfile: ctx.request.outputProfile,
            appearanceRoles,
          },
          ...(ctx.request.requestedComponents
            ? { requestedComponents: ctx.request.requestedComponents }
            : {}),
        })
    );

    emit(ctx, { type: 'step', runId: ctx.runId, step: 'plan', status: 'completed', at: now() });
    return { ctx };
  },
});

function storybookDocsUnavailableResult(ctx: RunContext): JioValidationResultT {
  return {
    passed: false,
    blocking: [
      {
        code: 'storybook-docs-unavailable',
        severity: 'blocking',
        message:
          'Storybook MCP documentation for WebHeader navigation is unavailable, so strict one-to-one composition cannot proceed.',
        offender: 'WebHeader',
      },
    ],
    warnings: [],
    repairSuggestions: [
      'Run Storybook locally with STORYBOOK_OFFLINE=1 pnpm storybook and verify http://localhost:6006/mcp with a JSON-RPC tools/list POST.',
      'Keep strictStorybook enabled for WebHeader/navigation runs unless intentionally testing offline fallback.',
    ],
    componentGaps: [
      {
        componentType: 'WebHeader',
        reason: `Storybook MCP docs were unavailable for the strict compound recipe${
          ctx.storybookRecipeContext?.error ? `: ${ctx.storybookRecipeContext.error}` : '.'
        }`,
      },
    ],
    foundationGaps: [],
  };
}

function designContextMissingComponentsResult(components: string[]): JioValidationResultT {
  return {
    passed: false,
    blocking: components.map((component) => ({
      code: 'design-context-component-unavailable',
      severity: 'blocking',
      message: `${component} is not registered in the OneUI component registry, so generation cannot safely continue.`,
      offender: component,
    })),
    warnings: [],
    repairSuggestions: [
      'Use only registered OneUI components from Storybook MCP or the registry snapshot.',
      'Add the missing component to the OneUI registry before requesting it from the Lab.',
    ],
    componentGaps: components.map((component) => ({
      componentType: component,
      reason: 'Component is missing from Storybook/registry design context.',
    })),
    foundationGaps: [],
  };
}

const storybookDocsStep = createStep({
  id: 'storybook-docs',
  inputSchema: ctxSchema,
  outputSchema: ctxSchema,
  execute: async ({ inputData }) => {
    const { ctx } = inputData;
    if (ctx.halted || !ctx.plan) return { ctx };
    emit(ctx, {
      type: 'step',
      runId: ctx.runId,
      step: 'storybook-docs',
      status: 'started',
      at: now(),
    });

    const strictStorybook = ctx.request.strictStorybook ?? (ctx.request.artifactType === 'web-ui');
    const recipeContext = await resolveStorybookRecipeContext({
      prompt: ctx.request.prompt,
      requestedComponents: ctx.request.requestedComponents,
      sections: ctx.plan.sections.map((section) => ({
        name: section.name,
        intent: section.intent,
        patternId: section.patternId,
      })),
      strictStorybook,
      storybookMcpUrl: ctx.request.storybookMcpUrl,
    });

    ctx.storybookRecipeContext = recipeContext;
    ctx.storybookMcpStatus = recipeContext.status;
    ctx.storybookDocsUsed = recipeContext.docsUsed;

    const missingComponents = recipeContext.designContext?.missingComponents ?? [];
    if (strictStorybook && missingComponents.length > 0) {
      const result = designContextMissingComponentsResult(missingComponents);
      const componentGap = result.componentGaps[0];
      ctx.validation = result;
      emit(ctx, { type: 'validation', runId: ctx.runId, result, at: now() });
      emit(ctx, {
        type: 'gap',
        runId: ctx.runId,
        ...(componentGap ? { componentGap } : {}),
        at: now(),
      });
      ctx.outcome = 'gap';
      ctx.halted = true;
    }

    if (
      !ctx.halted &&
      strictStorybook &&
      recipeContext.status === 'unavailable' &&
      recipeContext.source !== 'local-fallback'
    ) {
      const result = storybookDocsUnavailableResult(ctx);
      const componentGap = result.componentGaps[0];
      ctx.validation = result;
      emit(ctx, { type: 'validation', runId: ctx.runId, result, at: now() });
      emit(ctx, {
        type: 'gap',
        runId: ctx.runId,
        ...(componentGap ? { componentGap } : {}),
        at: now(),
      });
      ctx.outcome = 'gap';
      ctx.halted = true;
    }

    emit(ctx, {
      type: 'step',
      runId: ctx.runId,
      step: 'storybook-docs',
      status: 'completed',
      at: now(),
    });
    return { ctx };
  },
});

const designStep = createStep({
  id: 'design',
  inputSchema: ctxSchema,
  outputSchema: ctxSchema,
  execute: async ({ inputData }) => {
    const { ctx } = inputData;
    if (ctx.halted || !ctx.plan) return { ctx };
    emit(ctx, { type: 'step', runId: ctx.runId, step: 'design', status: 'started', at: now() });

    const sections = ctx.plan.sections;
    ctx.designSpec = await memoize(
      sharedCache(),
      cacheKey({
        step: 'design',
        brandId: ctx.request.brandId,
        artifactType: ctx.request.artifactType,
        outputProfile: ctx.request.outputProfile,
        prompt: JSON.stringify(sections),
        requestedComponents: ctx.request.requestedComponents,
      }),
      () =>
        runDesignAdapter({
          sections,
          artifactType: ctx.request.artifactType,
          ...(ctx.request.brandId ? { brandId: ctx.request.brandId } : {}),
          ...(ctx.request.requestedComponents
            ? { allowedComponentIds: ctx.request.requestedComponents }
            : {}),
        })
    );

    const composition = PageCompositionSchema.safeParse({
      brandId: ctx.request.brandId,
      pageType: ctx.plan.pageType,
      pagePatternId: ctx.plan.pagePatternId,
      density: ctx.plan.density,
      sections: ctx.designSpec.designSpecs.map((spec) => {
        const pattern = getSectionPattern(spec.patternId);
        return {
          sectionId: spec.sectionId,
          patternId: spec.patternId,
          attentionLevel: spec.attentionLevel,
          container: spec.container,
          grid: spec.grid,
          spacingTop: spec.spacingTop,
          spacingBottom: spec.spacingBottom,
          surfaceMode: spec.surfaceMode,
          allowedComponents:
            spec.allowedComponents.length > 0 ? spec.allowedComponents : pattern.allowedComponents,
        };
      }),
    });
    if (composition.success) ctx.compositionPlan = composition.data;

    emit(ctx, { type: 'step', runId: ctx.runId, step: 'design', status: 'completed', at: now() });
    return { ctx };
  },
});

const copyStep = createStep({
  id: 'copy',
  inputSchema: ctxSchema,
  outputSchema: ctxSchema,
  execute: async ({ inputData }) => {
    const { ctx } = inputData;
    if (ctx.halted || !ctx.plan) return { ctx };
    emit(ctx, { type: 'step', runId: ctx.runId, step: 'copy', status: 'started', at: now() });

    const sections = ctx.plan.sections;
    const voiceAssets = ctx.request.voiceAssetsLoader
      ? await ctx.request.voiceAssetsLoader({
          brandId: ctx.request.brandId,
          ...(ctx.request.subBrandConfigId ? { subBrandConfigId: ctx.request.subBrandConfigId } : {}),
        })
      : null;
    ctx.copySpec = await memoize(
      sharedCache(),
      cacheKey({
        step: 'copy',
        brandId: ctx.request.brandId,
        artifactType: ctx.request.artifactType,
        outputProfile: ctx.request.outputProfile,
        prompt: JSON.stringify(sections),
        model: voiceAssets?.versionKey ?? 'default-voice',
      }),
      () =>
        runVoiceAdapter({
          sections,
          artifactType: ctx.request.artifactType,
          ...(ctx.request.brandId ? { brandId: ctx.request.brandId } : {}),
        }, {
          ...(voiceAssets?.config ? { config: voiceAssets.config } : {}),
          ...(voiceAssets?.rules ? { rules: voiceAssets.rules } : {}),
          channel: voiceAssets?.channel ?? 'copy',
        }),
    );

    emit(ctx, { type: 'step', runId: ctx.runId, step: 'copy', status: 'completed', at: now() });
    return { ctx };
  },
});

const imageAssetsStep = createStep({
  id: 'image-assets',
  inputSchema: ctxSchema,
  outputSchema: ctxSchema,
  execute: async ({ inputData }) => {
    const { ctx } = inputData;
    if (ctx.halted || !ctx.request.imageGeneration) return { ctx };
    emit(ctx, { type: 'step', runId: ctx.runId, step: 'image-assets', status: 'started', at: now() });

    try {
      const result = await runImageGeneration({
        config: ctx.request.imageGeneration,
        topic: ctx.request.prompt ?? ctx.plan?.messageHierarchy?.[0] ?? ctx.request.artifactType,
        artifactType: ctx.request.artifactType,
        outputProfile: ctx.request.outputProfile,
        ...(ctx.request.brandId ? { brandId: ctx.request.brandId } : {}),
        designContext: getCompactDesignContext(),
      });
      ctx.generatedImageAssets = result.assets;
      ctx.imageGenerationStatus = {
        assetCount: result.assets.length,
        ...(result.provider ? { provider: result.provider } : {}),
        ...(result.model ? { model: result.model } : {}),
        ...(result.skippedReason ? { skippedReason: result.skippedReason } : {}),
      };
      if (result.assets.length > 0) {
        preferImageInEligibleSection(ctx);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[experience-lab] run ${ctx.runId} image generation skipped:`, err);
      ctx.generatedImageAssets = [];
      ctx.imageGenerationStatus = {
        assetCount: 0,
        skippedReason: message,
      };
    }

    emit(ctx, { type: 'step', runId: ctx.runId, step: 'image-assets', status: 'completed', at: now() });
    return { ctx };
  },
});

const generateStep = createStep({
  id: 'generate-ir',
  inputSchema: ctxSchema,
  outputSchema: ctxSchema,
  execute: async ({ inputData }) => {
    const { ctx } = inputData;
    if (ctx.halted) return { ctx };
    emit(ctx, {
      type: 'step',
      runId: ctx.runId,
      step: 'generate-ir',
      status: 'started',
      at: now(),
    });

    // Assemble the advisory fragments (D-01/D-05): the planner's section skeleton
    // (WITH per-section intent) + message hierarchy, the Design advisor's
    // per-section spec, and the ToV advisor's per-section copy are ALL threaded
    // into the IR Generator — true assembler-last. The advisors are no longer
    // discarded (the prior `{id,name}` discard). The generate-ir step remains the
    // ONLY committing step — these are READS of context, NOT mid-generation
    // advisor re-calls (no tool loop). Each field is presence-guarded.
    const gen = await generateIR({
      request: {
        brandId: ctx.request.brandId,
        artifactType: ctx.request.artifactType,
        outputProfile: ctx.request.outputProfile,
        ...(ctx.request.theme ? { theme: ctx.request.theme } : {}),
        ...(ctx.request.brandFoundations ? { brandFoundations: ctx.request.brandFoundations } : {}),
      },
      ...(ctx.request.prompt ? { userPrompt: ctx.request.prompt } : {}),
      requestedComponents: ctx.request.requestedComponents,
      ...(ctx.plan
        ? {
            sections: ctx.plan.sections.map((s) => ({
              id: s.id,
              name: s.name,
              ...(s.intent ? { intent: s.intent } : {}),
              ...(s.patternId ? { patternId: s.patternId } : {}),
              ...(s.attentionLevel ? { attentionLevel: s.attentionLevel } : {}),
            })),
            ...(ctx.plan.messageHierarchy ? { messageHierarchy: ctx.plan.messageHierarchy } : {}),
          }
        : {}),
      ...(ctx.designSpec ? { designSpecs: ctx.designSpec.designSpecs } : {}),
      ...(ctx.compositionPlan ? { compositionPlan: ctx.compositionPlan } : {}),
      ...(ctx.copySpec ? { copySpecs: ctx.copySpec.copySpecs } : {}),
      ...(ctx.generatedImageAssets && ctx.generatedImageAssets.length > 0
        ? { imageAssets: ctx.generatedImageAssets }
        : {}),
    });

    if (!gen.ok) {
      // Gap short-circuit (FND-03 / REG-03): emit a gap event + complete with
      // NO artifact. Branching is owned by the workflow, not any callback.
      emit(ctx, {
        type: 'gap',
        runId: ctx.runId,
        ...(gen.foundationGap ? { foundationGap: gen.foundationGap } : {}),
        ...(gen.componentGap
          ? {
              componentGap: {
                componentType: gen.componentGap.requestedId,
                reason: gen.componentGap.message,
              },
            }
          : {}),
        at: now(),
      });
      emit(ctx, {
        type: 'step',
        runId: ctx.runId,
        step: 'generate-ir',
        status: 'completed',
        at: now(),
      });
      ctx.outcome = 'gap';
      ctx.halted = true;
      return { ctx };
    }

    ctx.ir = gen.ir;
    refreshCompositionSpec(ctx);
    // Persist the backfill provenance onto run metadata (QUAL-03 / D-08) so the
    // quality gate (Plan 04) can read which required props were deterministically
    // filled — and flag any CONTENT prop the model failed to supply.
    ctx.backfilled = gen.meta.backfilled;
    emit(ctx, { type: 'ir-produced', runId: ctx.runId, irId: `${ctx.runId}-ir`, at: now() });
    emit(ctx, {
      type: 'step',
      runId: ctx.runId,
      step: 'generate-ir',
      status: 'completed',
      at: now(),
    });
    return { ctx };
  },
});

const compileStep = createStep({
  id: 'compile',
  inputSchema: ctxSchema,
  outputSchema: ctxSchema,
  execute: async ({ inputData }) => {
    const { ctx } = inputData;
    if (ctx.halted || !ctx.ir) {
      // Gap branch already completed the run — nothing to compile.
      return { ctx };
    }
    emit(ctx, { type: 'step', runId: ctx.runId, step: 'compile', status: 'started', at: now() });

    // GEN-06: IR → canonical React + Jio CSS string (D-07). The bundle is the
    // persisted artifact; the validation it carries is recomputed by the
    // validate step below against the same bridge, so we keep only the bundle.
    const { bundle } = compile(ctx.ir, {
      brandId: ctx.request.brandId,
      outputProfile: ctx.request.outputProfile,
      ...(ctx.request.prompt ? { intent: ctx.request.prompt } : {}),
    });
    ctx.bundle = bundle;

    emit(ctx, { type: 'step', runId: ctx.runId, step: 'compile', status: 'completed', at: now() });
    return { ctx };
  },
});

const validateStep = createStep({
  id: 'validate',
  inputSchema: ctxSchema,
  outputSchema: ctxSchema,
  execute: async ({ inputData }) => {
    const { ctx } = inputData;
    if (ctx.halted || !ctx.ir) {
      // Gap branch already completed the run — skip validation.
      return { ctx };
    }
    emit(ctx, { type: 'step', runId: ctx.runId, step: 'validate', status: 'started', at: now() });

    const result = validateIrAndAst(ctx);
    ctx.validation = result;

    emit(ctx, { type: 'validation', runId: ctx.runId, result, at: now() });
    emit(ctx, { type: 'step', runId: ctx.runId, step: 'validate', status: 'completed', at: now() });
    // Provisional outcome — the preview→evaluate→repair loop may upgrade a
    // failing validation to 'artifact' after repair, or finalize as 'gap'.
    ctx.outcome = result.passed ? 'artifact' : 'gap';
    return { ctx };
  },
});

// ---------------------------------------------------------------------------
// Preview → evaluate → bounded repair → version-freeze (D-05 steps 6-10, Plan 04)
// ---------------------------------------------------------------------------

const previewStep = createStep({
  id: 'preview',
  inputSchema: ctxSchema,
  outputSchema: ctxSchema,
  execute: async ({ inputData }) => {
    const { ctx } = inputData;
    if (ctx.halted || !ctx.ir || !ctx.bundle) return { ctx };
    emit(ctx, { type: 'step', runId: ctx.runId, step: 'preview', status: 'started', at: now() });

    // The PreviewExecutor is injected per-run (opaque seam, like foundationsLoader)
    // so the agents package stays vendor-free. Defaults to the configured executor.
    const executor = ctx.request.previewExecutor ?? getPreviewExecutor();
    try {
      const result = await executor.render({
        bundle: ctx.bundle,
        brandId: ctx.request.brandId,
        ...(ctx.request.theme ? { theme: ctx.request.theme } : {}),
        ...(ctx.request.outputProfile
          ? { platform: renderPlatformForOutputProfile(ctx.request.outputProfile) }
          : {}),
        ...(ctx.compositionPlan?.density
          ? { density: normalizeRenderDensity(ctx.compositionPlan.density) }
          : {}),
        // Keep AST executors aligned with the Daytona bundle: prefer the
        // quality-normalized CompositionSpec tree, falling back to legacy IR only
        // for older test paths that have not refreshed a spec.
        ast: ctx.compositionSpec
          ? astRootToArtifactAst(compositionSpecToAst(ctx.compositionSpec).root)
          : irToArtifactAst(ctx.ir),
        // PREV-03 desktop framing default; richer per-profile framing is Plan 05.
        profiles: [{ name: 'desktop', width: 1280, height: 800 }],
      });
      ctx.screenshots = result.screenshots.map((s) => ({ profile: s.profile, png: s.png }));
      ctx.previewState = result.previewState;
      ctx.previewVerification = result.previewVerification;
      ctx.rendered = result.rendered;
      emit(ctx, {
        type: 'step',
        runId: ctx.runId,
        step: 'preview',
        status: 'completed',
        at: now(),
      });
    } catch (err) {
      // A preview-executor THROW is an INFRA failure (Daytona / browser launch /
      // sandbox provisioning), NOT a Jio DS decision (PREV-04 / RESEARCH Pitfall 5
      // / T-031-06). Generation + validation already succeeded; only the
      // screenshot/preview step failed. We CONTAIN it here instead of rethrowing:
      // rethrowing would hit the generic run-level error-catch, which finalizeRun
      // then demotes to 'gap' (ir present, previewState empty) — falsely blaming
      // generation ("gap — generation refused"). Recording `ctx.previewError`
      // lets finalizeRun skip that demotion and surface a preview-error instead.
      const message = err instanceof Error ? err.message : String(err);
      ctx.previewError = { message };
      ctx.rendered = false;
      // Leave ctx.previewState empty — there is no live preview to show. Emit the
      // frozen-union 'failed' status (the StepEvent schema is 'started'|'completed'
      // |'failed'; there is no 'error' status — the wire union stays unchanged).
      emit(ctx, { type: 'step', runId: ctx.runId, step: 'preview', status: 'failed', at: now() });
    }
    return { ctx };
  },
});

const versionFreezeStep = createStep({
  id: 'version-freeze',
  inputSchema: ctxSchema,
  outputSchema: ctxSchema,
  execute: async ({ inputData }) => {
    const { ctx } = inputData;
    if (ctx.halted) return { ctx };
    // A preview-executor INFRA failure (previewError) must NOT be frozen as an
    // approved artifact — there is no live preview to ship. Leave the outcome for
    // finalizeRun to surface as a preview-error (PREV-04 / T-031-06).
    if (ctx.previewError) return { ctx };
    emit(ctx, {
      type: 'step',
      runId: ctx.runId,
      step: 'version-freeze',
      status: 'started',
      at: now(),
    });
    // OUTPUT-QUALITY (final guarantee): re-wire the real ToV copy into the IR and
    // recompile the persisted bundle, so the frozen artifact never ships the
    // model's "<Section> children" junk — whatever the repair loop last produced.
    if (ctx.ir) {
      wireRealCopyIntoIR(ctx.ir, ctx.copySpec?.copySpecs);
      refreshCompositionSpec(ctx);
      ctx.bundle = compile(ctx.ir, {
        brandId: ctx.request.brandId,
        outputProfile: ctx.request.outputProfile,
      }).bundle;
    }
    // Assemble the terminal artifact: the IR/bundle/previewState/evaluation are
    // already on ctx; this step marks the approved version (persisted by the route).
    ctx.outcome = 'artifact';
    emit(ctx, {
      type: 'step',
      runId: ctx.runId,
      step: 'version-freeze',
      status: 'completed',
      at: now(),
    });
    return { ctx };
  },
});

/**
 * The PRIMARY deterministic quality gate (QUAL-04) fused with the AST validator.
 * Runs `validateIRStructure` on the IR section/layout tree FIRST (its flat-layout
 * / empty-section-copy codes depend on section boundaries lost after flatten),
 * then `validateAst` over the compiled AST (threading the Plan-03 `backfilled`
 * provenance so the placeholder-content check can flag a backfilled CONTENT
 * prop). Their `blocking` / `warnings` / `repairSuggestions` / gap arrays are
 * MERGED into one result so the existing repair loop patches every code, and so a
 * structural block pins `objectivePass=false` in evaluate.ts with NO vision call
 * (deterministic primary, D-06/QUAL-05).
 */
function validateIrAndAst(ctx: RunContext): JioValidationResultT {
  refreshCompositionSpec(ctx);
  const irResult = validateIRStructure(ctx.ir!, ctx.backfilled ?? []);
  const artifactAst = ctx.compositionSpec
    ? astRootToArtifactAst(compositionSpecToAst(ctx.compositionSpec).root)
    : irToArtifactAst(ctx.ir!);
  const astResult = validateAst(artifactAst, {
    brandId: ctx.request.brandId,
    outputProfile: ctx.request.outputProfile,
    ...(ctx.backfilled ? { backfilled: ctx.backfilled } : {}),
  });
  const specResult = validateCompositionSpec(ctx.compositionSpec, {
    brandId: ctx.request.brandId,
    outputProfile: ctx.request.outputProfile,
    strictStorybook: ctx.request.strictStorybook ?? (ctx.request.artifactType === 'web-ui'),
    storybookMcpStatus: ctx.storybookMcpStatus,
    storybookDocsUsed: ctx.storybookDocsUsed,
  });
  const blocking = [...irResult.blocking, ...astResult.blocking, ...specResult.blocking];
  return {
    passed: blocking.length === 0,
    blocking,
    warnings: [...irResult.warnings, ...astResult.warnings, ...specResult.warnings],
    repairSuggestions: [
      ...irResult.repairSuggestions,
      ...astResult.repairSuggestions,
      ...specResult.repairSuggestions,
    ],
    componentGaps: [
      ...irResult.componentGaps,
      ...astResult.componentGaps,
      ...specResult.componentGaps,
    ],
    foundationGaps: [
      ...irResult.foundationGaps,
      ...astResult.foundationGaps,
      ...specResult.foundationGaps,
    ],
  };
}

function refreshCompositionSpec(ctx: RunContext): void {
  if (!ctx.ir) return;
  const rawSpec = irToCompositionSpec(ctx.ir, {
    ...(ctx.request.prompt ? { intent: ctx.request.prompt } : {}),
    ...(ctx.compositionPlan?.density
      ? { density: mapCompositionDensity(ctx.compositionPlan.density) }
      : {}),
  });
  ctx.compositionSpec = improveCompositionSpecQuality(rawSpec);
  ctx.compositionQuality = auditCompositionSpecQuality(ctx.compositionSpec);
}

function mapCompositionDensity(value: string): 'compact' | 'default' | 'open' {
  if (value === 'compact') return 'compact';
  if (value === 'editorial') return 'open';
  return 'default';
}

function preferImageInEligibleSection(ctx: RunContext): void {
  const specs = ctx.designSpec?.designSpecs;
  if (!specs || specs.length === 0) return;
  for (const spec of specs) {
    const pattern = getSectionPattern(spec.patternId);
    const allowed = new Set([
      ...pattern.allowedComponents,
      ...spec.allowedComponents,
      ...(ctx.request.requestedComponents ?? []),
    ]);
    if (!allowed.has('Image')) continue;
    spec.components = ['Image', ...spec.components.filter((component) => component !== 'Image')];
    return;
  }
}

/** Re-run compile + validate after a repair patch (drives the loop re-entry). */
async function reCompileAndValidate(ctx: RunContext): Promise<void> {
  if (!ctx.ir) return;
  // OUTPUT-QUALITY: the repair model can re-emit "<Section> children" junk into
  // component `children` when it patches the IR. Re-wire the real ToV copy into
  // the (post-repair) IR BEFORE recompiling, so the recompiled bundle / rendered
  // preview / frozen artifact all carry real copy, not the regenerated junk.
  wireRealCopyIntoIR(ctx.ir, ctx.copySpec?.copySpecs);
  const { bundle } = compile(ctx.ir, {
    brandId: ctx.request.brandId,
    outputProfile: ctx.request.outputProfile,
  });
  ctx.bundle = bundle;
  const result = validateIrAndAst(ctx);
  ctx.validation = result;
  emit(ctx, { type: 'validation', runId: ctx.runId, result, at: now() });
  // Update the D-10 convergence signal against the pre-repair blocking set.
  updateSameValidationError(ctx);
}

/**
 * Bounded-repair termination predicate (D-10/D-11). Returns TRUE to STOP the
 * loop (Pitfall 6 polarity): a gap halt, the hard cap N=3, a passing composite,
 * no-improvement convergence, or a repeated blocking error all terminate.
 */
function shouldStopRepairLoop(ctx: RunContext): boolean {
  const attempt = ctx.attempt ?? 0;
  const composite = ctx.composite ?? 0;
  const threshold = ctx.threshold ?? EVALUATOR_CONFIG.threshold;
  const epsilon = ctx.epsilon ?? EVALUATOR_CONFIG.epsilon;
  const scoreDelta = ctx.scoreDelta ?? Number.POSITIVE_INFINITY;
  return (
    ctx.halted ||
    attempt >= 3 ||
    composite >= threshold ||
    scoreDelta < epsilon ||
    ctx.sameValidationError === true
  );
}

/**
 * True iff the bounded repair loop exhausted WITHOUT the artifact clearing the
 * quality gates (QUAL-06 / D-11): not halted (a gap already short-circuits via
 * its own path), not HITL-suspended, and either a blocking validation still
 * stands OR the composite never reached the secondary threshold. When this holds
 * after the N=3 cap, the run must emit a terminal quality GAP rather than freeze
 * a low-quality artifact.
 */
function gatesStillFail(ctx: RunContext): boolean {
  if (ctx.halted) return false;
  // A preview-executor INFRA failure (previewError) is NOT a quality-gate
  // failure — it is a diagnosable preview/sandbox error that finalizeRun surfaces
  // as `previewError` / outcome 'error' (PREV-04 / T-031-06). It must NOT be
  // recast as a quality GAP, and the low composite it leaves behind (the
  // subjective track never ran because the screenshot was never produced) must
  // not trip this gate. Mirrors versionFreezeStep's previewError short-circuit.
  if (ctx.previewError) return false;
  // ONLY the deterministic structural gate is a HARD refusal: real Jio
  // components, no placeholder content, real per-section copy (validateIrAndAst).
  // The multimodal VISION score (`composite` vs `threshold`) is a SUBJECTIVE
  // signal — it still drives the bounded repair loop (shouldStopRepairLoop) so
  // the run tries to improve — but a low score ALONE must NOT refuse the whole
  // generation. Gating terminal refusal on the vision score threw away every
  // imperfect-but-real artifact as a "gap", so the user saw nothing ship. The
  // score is recorded on the version (`evaluation`) and surfaced as feedback;
  // re-tighten by re-adding `|| composite < threshold` once generation quality
  // reliably clears the bar.
  return !!ctx.validation && !ctx.validation.passed;
}

/**
 * Emit the terminal quality-GAP (QUAL-06 / D-11). Mirrors the generate-ir /
 * repair gap short-circuit: a `gap` event carrying the quality reason + the
 * still-blocking validation, then halt with `outcome:'gap'`. The artifact is NOT
 * frozen — an honest quality gap is reported instead of a weak artifact
 * (T-04.2-08). `qualityGap` is the typed marker the route/canvas reads.
 */
function emitQualityGap(ctx: RunContext): void {
  const blockingCodes = [...new Set((ctx.validation?.blocking ?? []).map((v) => v.code))];
  ctx.qualityGap = {
    runId: ctx.runId,
    reason: 'quality-gate',
    composite: ctx.composite ?? 0,
    threshold: ctx.threshold ?? EVALUATOR_CONFIG.threshold,
    attempts: ctx.attempt ?? 0,
    blockingCodes,
  };
  emit(ctx, {
    type: 'gap',
    runId: ctx.runId,
    ...(ctx.validation ? { validation: ctx.validation } : {}),
    at: now(),
  });
  ctx.outcome = 'gap';
  ctx.halted = true;
}

// ---------------------------------------------------------------------------
// HITL checkpoint (ORCH-02) — Mastra suspend()/resumeData at non-convergence
// ---------------------------------------------------------------------------

/**
 * The resume decision a human supplies after a non-convergence suspend. Plain
 * Zod types only (Anthropic-safe shape rules still apply: no keyed `z.record`,
 * no integer min/max) since this schema rides the same structured-output stack.
 */
export const ResumeDecisionSchema = z.object({
  decision: z.enum(['accept', 'repair-again', 'abandon']),
  note: z.string().optional(),
});
export type ResumeDecisionT = z.infer<typeof ResumeDecisionSchema>;

/** The payload a non-convergence suspend surfaces to the HITL prompt. */
export const SuspendPayloadSchema = z.object({
  runId: z.string(),
  reason: z.literal('non-converging-repair'),
});

// ---------------------------------------------------------------------------
// Campaign branch (CAMP-01 / CAMP-02 / D-05) — plan → suspend → resume
// ---------------------------------------------------------------------------

/**
 * The HITL selection a user supplies to resume a suspended campaign run: which
 * creative direction (0-based) + how many carousel frames. PLAIN Zod numbers
 * (Anthropic-safe rules still apply: no integer min/max — it rides the
 * structured-output stack), CLAMPED at runtime in the resume branch. `.strict()`
 * rejects unknown keys (T-04-04).
 */
export const CampaignResumeSchema = z
  .object({
    directionIndex: z.number(),
    frameCount: z.number(),
  })
  .strict();
export type CampaignResumeT = z.infer<typeof CampaignResumeSchema>;

/** The payload a campaign-plan suspend surfaces to the HITL card. */
export const CampaignSuspendPayloadSchema = z.object({
  runId: z.string(),
  reason: z.literal('campaign-plan'),
});

/** Frame-count + direction-index clamp bounds (D-08 / V5). */
const CAMPAIGN_MIN_FRAMES = 1;
const CAMPAIGN_MAX_FRAMES = 10;

/**
 * Apply (and CLAMP) a campaign HITL selection onto the context. Branching lives
 * here (ORCH-04), never a model callback. `directionIndex` is clamped to a valid
 * index into the plan's directions; `frameCount` to 1..10 (V5 / D-08 — bounds
 * the carousel so an oversized resume cannot trigger an unbounded loop, T-04-05).
 */
function applyCampaignSelection(ctx: RunContext, selection: CampaignResumeT): void {
  const directionCount = ctx.campaignPlan?.directions.length ?? 1;
  const directionIndex = Math.max(
    0,
    Math.min(directionCount - 1, Math.round(selection.directionIndex))
  );
  const frameCount = Math.max(
    CAMPAIGN_MIN_FRAMES,
    Math.min(CAMPAIGN_MAX_FRAMES, Math.round(selection.frameCount))
  );
  ctx.campaignSelection = { directionIndex, frameCount };
  ctx.suspended = false;
  ctx.suspendPayload = undefined;
}

/**
 * Is this a campaign run? Keyed on the artifact type (ORCH-04 — the branch
 * decision is the workflow's, never a model's). Social-post + instagram-carousel
 * take the campaign path; every web/app/dashboard type takes the web path.
 */
function isCampaignRun(ctx: RunContext): boolean {
  return (
    ctx.request.artifactType === 'social-post' || ctx.request.artifactType === 'instagram-carousel'
  );
}

/**
 * The Mastra-native campaign-plan checkpoint (D-05). After the planner runs, it
 * persists the plan to Convex (via the injected `persistCampaignPlan`, T-04-14)
 * and SUSPENDS carrying the plan on `suspendPayload`. On resume, the
 * `resumeData` selection is applied IN THE WORKFLOW (ORCH-04), never a model
 * callback. The committed-workflow analog of the deterministic campaign branch
 * in `runInternal`.
 */
export const campaignPlanCheckpoint = createStep({
  id: 'campaign-plan-checkpoint',
  inputSchema: ctxSchema,
  outputSchema: ctxSchema,
  resumeSchema: CampaignResumeSchema,
  suspendSchema: CampaignSuspendPayloadSchema,
  execute: async ({ inputData, resumeData, suspend }) => {
    const { ctx } = inputData as { ctx: RunContext };

    // Resume branch (ORCH-04): apply the user's clamped selection and proceed.
    if (resumeData) {
      applyCampaignSelection(ctx, resumeData as CampaignResumeT);
      return { ctx };
    }

    // First entry: persist the plan durably BEFORE suspend, then suspend.
    if (ctx.campaignPlan && ctx.request.persistCampaignPlan) {
      await ctx.request.persistCampaignPlan({
        runId: ctx.runId,
        campaignPlan: ctx.campaignPlan,
      });
    }
    ctx.suspended = true;
    ctx.outcome = 'suspended';
    ctx.suspendPayload = {
      runId: ctx.runId,
      reason: 'campaign-plan',
      ...(ctx.campaignPlan ? { plan: ctx.campaignPlan } : {}),
    };
    return suspend({ runId: ctx.runId, reason: 'campaign-plan' });
  },
});

/** True iff the loop terminated on a NON-convergence terminal (not pass, not gap). */
function isNonConverging(ctx: RunContext): boolean {
  const passed = (ctx.composite ?? 0) >= (ctx.threshold ?? EVALUATOR_CONFIG.threshold);
  return !ctx.halted && !passed;
}

/**
 * The Mastra-native HITL checkpoint. When `ctx.request.hitl` is enabled AND the
 * bounded loop terminated non-converging, it SUSPENDS with the failing
 * validation + last composite + candidate IR. On resume, the `resumeData`
 * decision branches IN THE WORKFLOW (ORCH-04): `accept` proceeds to
 * version-freeze, `repair-again` re-opens one bounded attempt, `abandon` emits a
 * gap. Default-off: when `hitl` is false this step is a pass-through so the
 * deterministic autonomous path is unchanged.
 */
const repairCheckpoint = createStep({
  id: 'repair-checkpoint',
  inputSchema: ctxSchema,
  outputSchema: ctxSchema,
  resumeSchema: ResumeDecisionSchema,
  suspendSchema: SuspendPayloadSchema,
  execute: async ({ inputData, resumeData, suspend }) => {
    const { ctx } = inputData as { ctx: RunContext };

    // Default-off OR converged/gap → pass-through (no suspend).
    if (!ctx.request.hitl || !isNonConverging(ctx)) return { ctx };

    // Resume branch (ORCH-04 — decision handled in the workflow, never a model
    // callback). Validated against ResumeDecisionSchema by Mastra before here.
    if (resumeData) {
      applyResumeDecision(ctx, resumeData);
      return { ctx };
    }

    // First entry under HITL + non-convergence → suspend for a human decision.
    ctx.suspended = true;
    ctx.outcome = 'suspended';
    ctx.suspendPayload = {
      runId: ctx.runId,
      reason: 'non-converging-repair',
      ...(ctx.validation ? { validation: ctx.validation } : {}),
      ...(ctx.composite !== undefined ? { composite: ctx.composite } : {}),
      ...(ctx.ir ? { ir: ctx.ir } : {}),
    };
    return suspend({ runId: ctx.runId, reason: 'non-converging-repair' });
  },
});

/**
 * Apply a HITL resume decision to the context (shared by the Mastra checkpoint
 * step and the deterministic `resumeRun` helper). Branching lives here, never in
 * a model callback (ORCH-04).
 *   - accept       → clear the suspend, proceed to version-freeze.
 *   - repair-again → clear the suspend + sameValidationError, allow one more
 *                    bounded attempt (the caller re-enters the loop).
 *   - abandon      → emit a gap, halt.
 */
function applyResumeDecision(ctx: RunContext, resume: ResumeDecisionT): void {
  ctx.suspended = false;
  ctx.suspendPayload = undefined;
  switch (resume.decision) {
    case 'accept':
      ctx.outcome = 'artifact';
      break;
    case 'repair-again':
      // Re-open the loop for ONE more bounded attempt: clear the converged
      // signals so shouldStopRepairLoop doesn't immediately re-terminate.
      ctx.sameValidationError = false;
      ctx.scoreDelta = undefined;
      ctx.outcome = 'error'; // provisional; the re-entered loop resets it.
      break;
    case 'abandon':
      emit(ctx, { type: 'gap', runId: ctx.runId, at: now() });
      ctx.outcome = 'gap';
      ctx.halted = true;
      break;
  }
}

/**
 * The Mastra workflow skeleton. Steps are sequenced with `.then(...)` — the
 * sequencing/branching is Mastra's, not an AI-SDK callback's (ORCH-04). The
 * preview→evaluate→bounded-repair→version-freeze tail uses `.dountil` for the
 * Mastra-native bounded loop; `repairCheckpoint` is the ORCH-02 HITL
 * suspend/resume gate. The deterministic runner below mirrors all of it.
 */
export const experienceWorkflow = createWorkflow({
  id: 'experience-generation',
  inputSchema: ctxSchema,
  outputSchema: ctxSchema,
})
  .then(intentStep)
  .then(resolveStep)
  .then(retrieveStep)
  .then(planStep)
  .then(storybookDocsStep)
  .then(designStep)
  .then(copyStep)
  .then(imageAssetsStep)
  .then(generateStep)
  .then(compileStep)
  .then(validateStep)
  .then(previewStep)
  .then(evaluateStep)
  .dountil(repairStep, async ({ inputData }) =>
    shouldStopRepairLoop((inputData as { ctx: RunContext }).ctx)
  )
  .then(repairCheckpoint)
  .then(versionFreezeStep)
  .commit();

// ---------------------------------------------------------------------------
// Run runner — drives the workflow steps in order and returns the event stream.
//
// We execute the committed step sequence directly (deterministic, node-safe) so
// the run is testable without a live Mastra runtime/transport. The ORDER and
// the gap BRANCH are defined by the workflow above; this runner honours them.
// ---------------------------------------------------------------------------

let _runSeq = 0;
function nextRunId(): string {
  _runSeq += 1;
  return `run-${Date.now()}-${_runSeq}`;
}

/** The linear lead-in steps (intent…validate) the runner drives in order. */
const ORDERED_STEPS = [
  intentStep,
  resolveStep,
  retrieveStep,
  planStep,
  storybookDocsStep,
  designStep,
  copyStep,
  imageAssetsStep,
  generateStep,
  compileStep,
  validateStep,
] as const;

/** The shared lead-in steps the campaign branch drives before the planner. */
const CAMPAIGN_LEAD_IN_STEPS = [intentStep, resolveStep, retrieveStep] as const;

/** Hard cap on bounded-repair attempts (D-11). Mirrors the predicate's `attempt>=3`. */
const MAX_REPAIR_ATTEMPTS = 3;

async function runStep(
  // The param is contravariant: typing the step's `execute` argument as `never`
  // lets ANY concrete Mastra `Step` (whose `execute` takes a fully-typed
  // `ExecuteFunctionParams`) be passed here without the generic-assignability
  // mismatch the deterministic runner doesn't care about — it only invokes
  // `execute({ inputData: { ctx } })`. (Resolves the pre-existing Mastra
  // ExecuteFunction/ObservabilityContext deferred typecheck class for runStep.)
  step: { execute: (a: never) => Promise<unknown> },
  ctx: RunContext
): Promise<void> {
  await step.execute({ inputData: { ctx } } as never);
}

/**
 * Drive the bounded repair loop (D-10/D-11) on a context whose preview+evaluate
 * have already run once. Mirrors the committed `.dountil`: repair → re-compile +
 * re-validate → re-evaluate, capped at MAX_REPAIR_ATTEMPTS.
 */
async function driveRepairLoop(ctx: RunContext): Promise<void> {
  while (!shouldStopRepairLoop(ctx) && (ctx.attempt ?? 0) < MAX_REPAIR_ATTEMPTS) {
    await runStep(repairStep, ctx);
    if (ctx.halted) break; // repair short-circuited a gap (D-11).
    await reCompileAndValidate(ctx);
    await runStep(evaluateStep, ctx);
  }
}

/**
 * Assemble the D-06a multi-agent transparency trace (AGENT-01) from the run
 * context. STRUCTURED AGENT OUTPUTS ONLY — every field is derived from the
 * already-markup-free advisor outputs / validation / evaluation already on the
 * context; NO auth/session/Convex token is ever read or written (T-04.2-11,
 * mirroring the previewState/evaluation security rule). Every field is optional
 * so a partial run (a gap before evaluation, a run with no advisors) still
 * produces a legible trace of what DID run. Returns `undefined` when the run
 * produced no traceable agent output at all (so old/empty runs round-trip with
 * no trace, exactly like `evaluation`).
 */
function assembleAgentTrace(ctx: RunContext): AgentTraceT | undefined {
  const trace: AgentTraceT = {};

  if (ctx.plan) {
    trace.planner = {
      sections: ctx.plan.sections.map((s) => s.name),
      messageHierarchy: ctx.plan.messageHierarchy,
      primaryCTA: ctx.plan.primaryCTA,
    };
  }

  if (ctx.compositionPlan) {
    trace.compositionPlan = ctx.compositionPlan;
  }

  if (ctx.designSpec?.designSpecs?.length) {
    trace.designRecs = ctx.designSpec.designSpecs.map((d) => ({
      sectionId: d.sectionId,
      surfaceMode: d.surfaceMode,
      components: d.components,
    }));
  }

  if (ctx.copySpec?.copySpecs?.length) {
    trace.toneRecs = ctx.copySpec.copySpecs.map((c) => ({
      sectionId: c.sectionId,
      headline: c.headline,
      toneScore: c.toneScore,
    }));
  }

  // Registry matches = the distinct component types the artifact composed (real
  // Jio components, NEVER markup). Derived from the IR component instances.
  if (ctx.ir) {
    const matches = Array.from(
      new Set(
        ctx.ir.componentInstances
          .map((i) => i.type)
          .filter((type): type is string => typeof type === 'string' && type.length > 0)
      )
    );
    if (matches.length > 0) trace.registryMatches = matches;
  }

  if (ctx.validation) {
    trace.validation = {
      passed: ctx.validation.passed,
      blockingCodes: ctx.validation.blocking.map((v) => v.code),
    };
  }

  if (ctx.storybookMcpStatus) {
    trace.storybook = {
      status: ctx.storybookMcpStatus,
      docsUsed: ctx.storybookDocsUsed ?? [],
    };
  }

  if (ctx.imageGenerationStatus) {
    trace.imageGeneration = ctx.imageGenerationStatus;
  }

  if (ctx.compositionQuality) {
    trace.compositionQuality = {
      passed: ctx.compositionQuality.passed,
      issues: ctx.compositionQuality.issues,
      sectionCount: ctx.compositionQuality.sectionCount,
      textNodeCount: ctx.compositionQuality.textNodeCount,
      emptySurfaceCount: ctx.compositionQuality.emptySurfaceCount,
      maxRepeatedTextCount: ctx.compositionQuality.maxRepeatedTextCount,
    };
  }

  if (ctx.evaluation) {
    trace.evaluation = { composite: ctx.evaluation.composite };
  }

  if (ctx.backfilled && ctx.backfilled.length > 0) {
    trace.backfilled = ctx.backfilled;
  }

  return Object.keys(trace).length > 0 ? trace : undefined;
}

/**
 * Finalize a terminal context: set the terminal outcome, emit `run-completed`
 * (mapped to the frozen wire union), and assemble the `RunExperienceResult`.
 */
function finalizeRun(ctx: RunContext): RunExperienceResult {
  if (ctx.previewError) {
    // A preview-executor INFRA failure (Daytona / browser / sandbox) after a
    // successful generation+validation. Surface it as a preview-error terminal —
    // NOT a 'gap' (which the route renders as "generation refused"). The route
    // reads `previewError` to choose the preview-failed card copy
    // (PREV-04 / RESEARCH Pitfall 5 / T-031-06). We DELIBERATELY skip the
    // ir-but-no-url → 'gap' demotion below: previewError IS the empty-url cause.
    ctx.outcome = 'error';
  } else if (ctx.outcome === 'error') {
    // Only promote to 'artifact' when IR is present AND preview produced a live URL.
    // Promoting when previewState is empty causes the canvas to show IR tree with no iframe.
    ctx.outcome = ctx.ir && ctx.previewState?.url ? 'artifact' : 'gap';
  }
  // The frozen RunCompletedEvent union is artifact|gap|error; a 'suspended' run
  // reports 'gap' on the wire (no artifact produced) while the RESULT carries
  // outcome:'suspended' + the suspendPayload for the route/canvas to surface.
  const wireOutcome: 'artifact' | 'gap' | 'error' =
    ctx.outcome === 'artifact' ? 'artifact' : ctx.outcome === 'error' ? 'error' : 'gap';
  emit(ctx, { type: 'run-completed', runId: ctx.runId, outcome: wireOutcome, at: now() });
  const agentTrace = assembleAgentTrace(ctx);
  return {
    runId: ctx.runId,
    events: ctx.events,
    outcome: ctx.outcome,
    ...(ctx.ir ? { ir: ctx.ir } : {}),
    ...(ctx.compositionSpec ? { compositionSpec: ctx.compositionSpec } : {}),
    ...(ctx.validation ? { validation: ctx.validation } : {}),
    ...(ctx.bundle ? { bundle: ctx.bundle } : {}),
    ...(ctx.previewState ? { previewState: ctx.previewState } : {}),
    ...(ctx.previewVerification ? { previewVerification: ctx.previewVerification } : {}),
    ...(ctx.previewError ? { previewError: ctx.previewError } : {}),
    ...(ctx.screenshots && ctx.screenshots.length > 0 ? { screenshots: ctx.screenshots } : {}),
    ...(ctx.evaluation ? { evaluation: ctx.evaluation } : {}),
    ...(ctx.storybookMcpStatus ? { storybookMcpStatus: ctx.storybookMcpStatus } : {}),
    ...(ctx.storybookDocsUsed ? { storybookDocsUsed: ctx.storybookDocsUsed } : {}),
    ...(ctx.generatedImageAssets && ctx.generatedImageAssets.length > 0
      ? { generatedImageAssets: ctx.generatedImageAssets }
      : {}),
    ...(ctx.suspendPayload ? { suspendPayload: ctx.suspendPayload } : {}),
    ...(ctx.carouselFrames ? { carouselFrames: ctx.carouselFrames } : {}),
    ...(agentTrace ? { agentTrace } : {}),
  };
}

/** Build the partial result returned when a run SUSPENDS for HITL (no terminal emit). */
function suspendedResult(ctx: RunContext): RunExperienceResult {
  return {
    runId: ctx.runId,
    events: ctx.events,
    outcome: 'suspended',
    ...(ctx.ir ? { ir: ctx.ir } : {}),
    ...(ctx.compositionSpec ? { compositionSpec: ctx.compositionSpec } : {}),
    ...(ctx.validation ? { validation: ctx.validation } : {}),
    ...(ctx.bundle ? { bundle: ctx.bundle } : {}),
    ...(ctx.previewState ? { previewState: ctx.previewState } : {}),
    ...(ctx.previewVerification ? { previewVerification: ctx.previewVerification } : {}),
    ...(ctx.previewError ? { previewError: ctx.previewError } : {}),
    ...(ctx.screenshots && ctx.screenshots.length > 0 ? { screenshots: ctx.screenshots } : {}),
    ...(ctx.evaluation ? { evaluation: ctx.evaluation } : {}),
    ...(ctx.storybookMcpStatus ? { storybookMcpStatus: ctx.storybookMcpStatus } : {}),
    ...(ctx.storybookDocsUsed ? { storybookDocsUsed: ctx.storybookDocsUsed } : {}),
    ...(ctx.generatedImageAssets && ctx.generatedImageAssets.length > 0
      ? { generatedImageAssets: ctx.generatedImageAssets }
      : {}),
    ...(ctx.suspendPayload ? { suspendPayload: ctx.suspendPayload } : {}),
  };
}

/** A live, resumable handle returned when a HITL run suspends (ORCH-02 / Plan 04). */
export interface SuspendedRun {
  /** The suspended result carrying the HITL payload. */
  result: RunExperienceResult;
  /**
   * Resume the run with a human decision/selection. For a non-converging-repair
   * suspend the decision is a `ResumeDecisionT` (accept/repair-again/abandon);
   * for a campaign-plan suspend it is a `CampaignResumeT`
   * (`{ directionIndex, frameCount }`). Validated against the matching schema.
   * Returns the next terminal (or suspended) result.
   */
  resume: (
    decision: ResumeDecisionT | CampaignResumeT
  ) => Promise<RunExperienceResult | SuspendedRun>;
}

function isSuspended(value: RunExperienceResult | SuspendedRun): value is SuspendedRun {
  return (value as SuspendedRun).resume !== undefined;
}

/**
 * Run the experience-generation workflow end-to-end, returning the terminal
 * `RunExperienceResult`. This is the AUTONOMOUS default-off path: when
 * `request.hitl` is unset/false the bounded loop finalizes to artifact/gap as
 * before (no suspend). When `hitl` is true and the loop ends non-converging,
 * the run still finalizes here with `outcome:'suspended'` + the suspendPayload
 * (the caller can then resume via {@link runExperienceWorkflowHitl} for a live
 * resume handle). Orchestration is owned HERE; the committed chain is the
 * Mastra-native equivalent. ORCH-04: no branching in any AI-SDK callback.
 */
export async function runExperienceWorkflow(
  request: RunExperienceInput
): Promise<RunExperienceResult> {
  const out = await runInternal(request);
  return isSuspended(out) ? out.result : out;
}

/**
 * The HITL entry point (ORCH-02): identical to {@link runExperienceWorkflow}
 * except that when `request.hitl` is enabled AND the loop ends non-converging it
 * returns a live {@link SuspendedRun} handle whose `resume(decision)` continues
 * the run deterministically. When the run does not suspend it returns the plain
 * terminal `RunExperienceResult`.
 */
export async function runExperienceWorkflowHitl(
  request: RunExperienceInput
): Promise<RunExperienceResult | SuspendedRun> {
  return runInternal({ ...request, hitl: true });
}

/** Shared run body. Returns a SuspendedRun handle iff it suspended under HITL. */
async function runInternal(
  request: RunExperienceInput
): Promise<RunExperienceResult | SuspendedRun> {
  const runId = nextRunId();
  const ctx: RunContext = {
    runId,
    request,
    events: [],
    outcome: 'error',
    halted: false,
  };

  emit(ctx, { type: 'run-started', runId, at: now() });

  try {
    // Campaign branch (CAMP-01 / CAMP-02 / ORCH-04): a social-post /
    // instagram-carousel run takes the plan→suspend→resume path instead of the
    // web pipeline. The branch decision is the workflow's, keyed on the artifact
    // type — never a model callback. The web branch below is untouched.
    if (isCampaignRun(ctx)) {
      const out = await runCampaignInternal(ctx);
      return out;
    }

    // Linear lead-in: intent…validate. The gap branch is honoured by the steps
    // themselves (compile/validate skip when halted).
    for (const step of ORDERED_STEPS) {
      await runStep(step, ctx);
    }

    // Quality loop (D-05 steps 6-10): preview → evaluate → bounded repair →
    // version-freeze. Only runs when an IR survived the lead-in (no gap halt).
    if (!ctx.halted && ctx.ir) {
      await runStep(previewStep, ctx);
      await runStep(evaluateStep, ctx);
      await driveRepairLoop(ctx);

      // HITL checkpoint (ORCH-02): when enabled AND the loop terminated on a
      // NON-convergence terminal (not a pass, not a gap), SUSPEND for a human
      // decision instead of auto-finalizing. Default-off path is unchanged.
      if (ctx.request.hitl && isNonConverging(ctx)) {
        ctx.suspended = true;
        ctx.outcome = 'suspended';
        ctx.suspendPayload = {
          runId,
          reason: 'non-converging-repair',
          ...(ctx.validation ? { validation: ctx.validation } : {}),
          ...(ctx.composite !== undefined ? { composite: ctx.composite } : {}),
          ...(ctx.ir ? { ir: ctx.ir } : {}),
        };
        return { result: suspendedResult(ctx), resume: makeResume(ctx) };
      }

      // Terminal QUALITY GAP (QUAL-06 / D-11): the bounded loop exhausted the
      // N=3 cap and the deterministic/secondary gates STILL fail. Emit an honest
      // quality gap instead of freezing a low-quality artifact (T-04.2-08).
      if (!ctx.halted && gatesStillFail(ctx)) {
        emitQualityGap(ctx);
      } else if (!ctx.halted) {
        // Converged to a pass → freeze the version.
        await runStep(versionFreezeStep, ctx);
      }
    }
  } catch (err) {
    ctx.outcome = 'error';
    // Surface the underlying failure on the server. Without this the error is
    // swallowed entirely — the run inspector only shows a bare 'error' and the
    // server console shows nothing, making model/credential/config failures in
    // the plan/generate steps impossible to diagnose. The API key is never part
    // of a thrown AI-SDK error message, so this does not leak secrets.
    console.error(`[experience-lab] run ${runId} failed:`, err);
    return finalizeRun(ctx);
  }

  return finalizeRun(ctx);
}

/** Build the `resume` closure for a suspended context (ORCH-02). */
function makeResume(ctx: RunContext): SuspendedRun['resume'] {
  return async (
    decision: ResumeDecisionT | CampaignResumeT
  ): Promise<RunExperienceResult | SuspendedRun> => {
    // Validate the decision against the resume schema (Mastra does this for the
    // committed path; the deterministic path validates explicitly).
    const parsed = ResumeDecisionSchema.parse(decision);
    applyResumeDecision(ctx, parsed);

    if (parsed.decision === 'accept') {
      await runStep(versionFreezeStep, ctx);
      return finalizeRun(ctx);
    }
    if (parsed.decision === 'abandon') {
      return finalizeRun(ctx);
    }
    // repair-again: one more bounded attempt, then re-checkpoint.
    await driveRepairLoop(ctx);
    if (ctx.request.hitl && isNonConverging(ctx)) {
      ctx.suspended = true;
      ctx.outcome = 'suspended';
      ctx.suspendPayload = {
        runId: ctx.runId,
        reason: 'non-converging-repair',
        ...(ctx.validation ? { validation: ctx.validation } : {}),
        ...(ctx.composite !== undefined ? { composite: ctx.composite } : {}),
        ...(ctx.ir ? { ir: ctx.ir } : {}),
      };
      return { result: suspendedResult(ctx), resume: makeResume(ctx) };
    }
    if (!ctx.halted && gatesStillFail(ctx)) {
      // QUAL-06: a repair-again that still fails reports a quality gap, never a
      // frozen low-quality artifact.
      emitQualityGap(ctx);
    } else if (!ctx.halted) {
      await runStep(versionFreezeStep, ctx);
    }
    return finalizeRun(ctx);
  };
}

// ---------------------------------------------------------------------------
// Campaign run body (CAMP-01 / CAMP-02 / D-05) — resolve → plan → suspend
// ---------------------------------------------------------------------------

/**
 * Drive the campaign branch deterministically (the committed-workflow analog is
 * `campaignPlanCheckpoint`). After the lead-in resolve confirms a COVERED
 * non-web foundation, the campaign planner runs and the run SUSPENDS carrying
 * the plan on `suspendPayload`. On a foundation MISS the run short-circuits to a
 * gap BEFORE the planner runs (reusing plan-01's resolver gap — no model call).
 *
 * Persistence (T-04-14): the plan is written to Convex via the injected
 * `persistCampaignPlan` IMMEDIATELY BEFORE suspend, so the resume route reads it
 * back durably (Pitfall 4 / A5) — never from the in-memory cache.
 *
 * Returns a `SuspendedRun` handle (deterministic resume) when it suspends, else
 * the terminal gap result.
 */
async function runCampaignInternal(ctx: RunContext): Promise<RunExperienceResult | SuspendedRun> {
  // Lead-in: intent → resolve (loader) → retrieve. These are the same shared
  // steps the web path runs; they populate brandFoundations from the loader.
  // Iterate the tuple (matches the clean ORDERED_STEPS iteration) so the loose
  // runStep param type holds.
  for (const step of CAMPAIGN_LEAD_IN_STEPS) {
    await runStep(step, ctx);
  }

  // Foundation coverage gate (D-02 / FND-03): resolve the non-web canvas against
  // the brand's Platforms foundation. A miss short-circuits to a gap BEFORE the
  // planner — no runCampaignPlanner call, no fabricated dimensions.
  const resolved = resolveFoundation({
    brandId: ctx.request.brandId,
    artifactType: ctx.request.artifactType,
    outputProfile: ctx.request.outputProfile,
    ...(ctx.request.theme ? { theme: ctx.request.theme } : {}),
    ...(ctx.request.brandFoundations ? { brandFoundations: ctx.request.brandFoundations } : {}),
    ...(ctx.request.brandPlatforms !== undefined
      ? { brandPlatforms: ctx.request.brandPlatforms }
      : {}),
  });
  if (!resolved.ok) {
    emit(ctx, { type: 'gap', runId: ctx.runId, foundationGap: resolved.gap, at: now() });
    ctx.outcome = 'gap';
    ctx.halted = true;
    return finalizeRun(ctx);
  }

  // Covered → run the DS-grounded campaign planner through the single seam.
  const appearanceRoles = Object.keys(resolved.theme.appearances);
  const prompt = ctx.request.prompt ?? `Plan a ${ctx.request.artifactType} campaign.`;
  emit(ctx, { type: 'step', runId: ctx.runId, step: 'plan', status: 'started', at: now() });
  const plan: CampaignPlanT = await runCampaignPlanner({
    prompt,
    artifactType: ctx.request.artifactType,
    ...(ctx.request.audience ? { audience: ctx.request.audience } : {}),
    ...(ctx.request.objective ? { objective: ctx.request.objective } : {}),
    ...(ctx.request.channel ? { channel: ctx.request.channel } : {}),
    resolvedCoverage: {
      brandId: ctx.request.brandId,
      outputProfile: ctx.request.outputProfile,
      appearanceRoles,
    },
  });
  ctx.campaignPlan = plan;
  emit(ctx, { type: 'step', runId: ctx.runId, step: 'plan', status: 'completed', at: now() });

  // If the resume selection is ALREADY on the request (the resume route re-enters
  // with it), apply it and drive the carousel past the checkpoint (CAMP-04).
  if (ctx.request.campaignSelection) {
    applyCampaignSelection(ctx, ctx.request.campaignSelection);
    const selection = ctx.campaignSelection!;
    const direction = plan.directions[selection.directionIndex]!;
    await runCampaignCarousel(ctx, direction, selection.frameCount);
    return finalizeRun(ctx);
  }

  // Persist the plan durably BEFORE suspend (T-04-14), then suspend.
  if (ctx.request.persistCampaignPlan) {
    await ctx.request.persistCampaignPlan({ runId: ctx.runId, campaignPlan: plan });
  }
  ctx.suspended = true;
  ctx.outcome = 'suspended';
  ctx.suspendPayload = { runId: ctx.runId, reason: 'campaign-plan', plan };
  return { result: suspendedResult(ctx), resume: makeCampaignResume(ctx) };
}

// ---------------------------------------------------------------------------
// Carousel generation after resume (CAMP-03/CAMP-04/CAMP-05 — Plan 03)
// ---------------------------------------------------------------------------

/** The carousel-level SHARED repair budget (Pitfall 3 / D-09 / T-04-07). */
const CAROUSEL_REPAIR_BUDGET = 6;

/**
 * Drive ONE carousel frame through the EXISTING per-frame quality loop
 * (generate→compile→validate→evaluate→bounded-repair, D-09). Builds a per-frame
 * sub-context off the parent run's request + the picked direction's surface mood,
 * then runs the same step sequence the web path uses. The frame's bounded-repair
 * loop is capped by `repairBudgetRemaining` (the SHARED carousel budget slice,
 * Pitfall 3) AND the per-frame hard cap (N=3) — a frame given 0 budget makes ZERO
 * repair attempts. Returns the frame's outcome + the repair attempts it actually
 * consumed (so the driver decrements the shared accumulator).
 */
async function runCarouselFramePipeline(
  parentCtx: RunContext,
  input: FramePipelineInput
): Promise<FramePipelineResult> {
  // A fresh per-frame sub-context: same request identity + already-resolved
  // foundation, distinct event log. Order is meaningful (D-07) — no ranking.
  const frameCtx: RunContext = {
    runId: `${parentCtx.runId}-frame-${input.orderIndex}`,
    request: parentCtx.request,
    events: [],
    outcome: 'error',
    halted: false,
  };

  // Lead-in already done at the carousel level (resolve/retrieve). Run the
  // committing + validating steps for this frame.
  await runStep(generateStep, frameCtx);
  if (frameCtx.halted || !frameCtx.ir) {
    // A foundation/component gap inside a single frame — surface it as the
    // frame's outcome without aborting siblings (D-09).
    return {
      orderIndex: input.orderIndex,
      outcome: 'gap',
      validationPassed: false,
      repairAttemptsUsed: 0,
    };
  }
  await runStep(compileStep, frameCtx);
  await runStep(validateStep, frameCtx);
  await runStep(previewStep, frameCtx);
  await runStep(evaluateStep, frameCtx);

  // Bounded-repair loop, capped by the SHARED budget slice (Pitfall 3) AND the
  // per-frame hard cap. `repairBudgetRemaining` is already `min(shared, N=3)`.
  let repairAttemptsUsed = 0;
  while (repairAttemptsUsed < input.repairBudgetRemaining && !shouldStopRepairLoop(frameCtx)) {
    await runStep(repairStep, frameCtx);
    repairAttemptsUsed += 1;
    if (frameCtx.halted) break; // repair short-circuited an unsatisfiable gap.
    await reCompileAndValidate(frameCtx);
    await runStep(evaluateStep, frameCtx);
  }

  const validationPassed = frameCtx.validation?.passed === true;
  // A frame that converged to a passing validation is an artifact; a frame that
  // exhausted its budget without passing surfaces repair-exhausted (D-09 — never
  // ships a non-compliant artifact). A gap halt is surfaced as a gap.
  const outcome: FramePipelineResult['outcome'] = frameCtx.halted
    ? 'gap'
    : validationPassed
      ? 'artifact'
      : 'repair-exhausted';

  return {
    orderIndex: input.orderIndex,
    outcome,
    validationPassed,
    repairAttemptsUsed,
    ...(frameCtx.ir ? { ir: frameCtx.ir } : {}),
    ...(frameCtx.validation ? { validation: frameCtx.validation } : {}),
    ...(frameCtx.composite !== undefined ? { composite: frameCtx.composite } : {}),
  };
}

/**
 * Request ONE frame's brand-aligned copy via the existing ToV adapter (CAMP-03 —
 * DELIVERED here). The direction's `copyAngle` is the tone emphasis; the frame's
 * position drives the hook→…→CTA progression. Reuses `runVoiceAdapter` (the
 * node-safe ToV seam) — never a side path. Returns headline/body/cta + a caption.
 */
async function requestCarouselFrameCopy(
  parentCtx: RunContext,
  req: FrameCopyRequest
): Promise<FrameCopy> {
  const sectionName = `frame-${req.orderIndex + 1}`;
  const out = await runVoiceAdapter({
    sections: [
      {
        id: sectionName,
        name: sectionName,
        intent:
          `Frame ${req.orderIndex + 1} of ${req.frameCount} in a carousel. ` +
          `Concept: ${req.concept}. Tone: ${req.copyAngle}.`,
      },
    ],
    artifactType: parentCtx.request.artifactType,
    ...(parentCtx.request.brandId ? { brandId: parentCtx.request.brandId } : {}),
  });
  const spec = out.copySpecs[0];
  return {
    headline: spec?.headline ?? '',
    body: spec?.body ?? '',
    ...(spec?.cta ? { cta: spec.cta } : {}),
    // The caption reuses the body as the social caption seed (CAMP-03). A richer
    // dedicated caption pass is a later quality lever; the ToV seam owns the copy.
    ...(spec?.body ? { caption: spec.body } : {}),
  };
}

/**
 * Drive the carousel after a direction is picked (CAMP-04). Resolves the canvas
 * (CAMP-05 — a gap yields ZERO frames), then runs `runCarousel` wiring the
 * per-frame ToV copy seam + the per-frame quality loop + the carousel-level
 * SHARED repair budget (Pitfall 3). The ordered frames are collected onto
 * `ctx.carouselFrames`. Branching/sequencing stays in the workflow (ORCH-04).
 */
async function runCampaignCarousel(
  ctx: RunContext,
  direction: CreativeDirectionT,
  frameCount: number
): Promise<void> {
  // Resolve the carousel canvas once at the carousel level (CAMP-05). A gap →
  // zero frames; the driver short-circuits without requesting copy or generating.
  const resolveCanvas = (): CanvasResolveResult => {
    const resolved = resolveFoundation({
      brandId: ctx.request.brandId,
      artifactType: ctx.request.artifactType,
      outputProfile: ctx.request.outputProfile,
      ...(ctx.request.theme ? { theme: ctx.request.theme } : {}),
      ...(ctx.request.brandFoundations ? { brandFoundations: ctx.request.brandFoundations } : {}),
      ...(ctx.request.brandPlatforms !== undefined
        ? { brandPlatforms: ctx.request.brandPlatforms }
        : {}),
    });
    if (!resolved.ok) {
      return { ok: false, reason: resolved.gap.reason };
    }
    return {
      ok: true,
      ...(resolved.resolvedDimensions
        ? {
            resolvedDimensions: {
              width: resolved.resolvedDimensions.width,
              height: resolved.resolvedDimensions.height,
              units: resolved.resolvedDimensions.units,
            },
          }
        : {}),
    };
  };

  const carousel = await runCarousel({
    frameCount,
    direction,
    repairBudget: CAROUSEL_REPAIR_BUDGET,
    resolveCanvas,
    requestFrameCopy: (req) => requestCarouselFrameCopy(ctx, req),
    runFramePipeline: (frameInput) => runCarouselFramePipeline(ctx, frameInput),
  });

  // A gap canvas yields zero frames — surface the gap on the run (CAMP-05).
  if (carousel.gap) {
    emit(ctx, { type: 'gap', runId: ctx.runId, at: now() });
    ctx.outcome = 'gap';
    ctx.halted = true;
    ctx.carouselFrames = [];
    return;
  }

  ctx.carouselFrames = carousel.frames satisfies CarouselFrameResultT[];
  // The run produced ordered frames: at least one DS-compliant frame → artifact;
  // a carousel where EVERY frame is repair-exhausted/gap → gap (no shippable
  // frame). One bad frame does not break the carousel (D-09).
  const anyValid = carousel.frames.some((f) => f.outcome === 'artifact');
  ctx.outcome = anyValid ? 'artifact' : 'gap';
}

/** Build the `resume` closure for a suspended campaign run (D-05 / ORCH-04). */
function makeCampaignResume(ctx: RunContext): SuspendedRun['resume'] {
  return async (
    decision: ResumeDecisionT | CampaignResumeT
  ): Promise<RunExperienceResult | SuspendedRun> => {
    // Validate the selection against the campaign resume schema (the committed
    // path lets Mastra validate; the deterministic path validates explicitly).
    const selection = CampaignResumeSchema.parse(decision);
    applyCampaignSelection(ctx, selection);
    // Drive the carousel after the direction is picked (CAMP-04). The clamped
    // selection indexes the persisted plan's directions; runCampaignCarousel
    // resolves the canvas (CAMP-05), runs the per-frame loop under the shared
    // budget, and collects ordered frames onto ctx.
    const applied = ctx.campaignSelection!;
    const direction = ctx.campaignPlan?.directions[applied.directionIndex];
    if (direction) {
      await runCampaignCarousel(ctx, direction, applied.frameCount);
    } else {
      // No plan/direction to drive (defensive) — surface a gap, never fabricate.
      ctx.outcome = 'gap';
    }
    return finalizeRun(ctx);
  };
}

// ---------------------------------------------------------------------------
// Best-of-N variants (GEN-07 / D-08)
// ---------------------------------------------------------------------------

let _variantGroupSeq = 0;
function nextVariantGroupId(): string {
  _variantGroupSeq += 1;
  return `vgroup-${Date.now()}-${_variantGroupSeq}`;
}

/** One ranked variant in a best-of-N group. */
export interface RankedVariant {
  /** The full run result for this variant. */
  result: RunExperienceResult;
  /** The variant's evaluation composite used for ranking (0 when absent). */
  composite: number;
  /** Shared group id (D-08). */
  variantGroupId: string;
  /** 0-based rank (0 = best). */
  rank: number;
}

/** The best-of-N outcome: the winner + all ranked siblings sharing a group id. */
export interface VariantGroupResult {
  variantGroupId: string;
  /** The highest-composite variant. */
  best: RankedVariant;
  /** All variants, ranked best→worst (stable for equal composites). */
  ranked: RankedVariant[];
}

/**
 * Produce `n` variants by running `runExperienceWorkflow` N times SEQUENTIALLY
 * (GEN-07 / D-08), sharing the already-resolved `brandFoundations` so every
 * variant draws on the same foundation (no per-variant re-resolve). The judge
 * composite ranks them; the best is returned with a shared `variantGroupId`.
 *
 * Sequential (not parallel) keeps the deterministic, credential-free test path
 * and avoids hammering the model layer concurrently (RESEARCH Open Q3).
 */
export async function runVariants(
  request: RunExperienceInput,
  n: number
): Promise<VariantGroupResult> {
  const count = Math.max(1, Math.floor(n));
  const variantGroupId = nextVariantGroupId();

  const variants: RankedVariant[] = [];
  for (let i = 0; i < count; i++) {
    const result = await runExperienceWorkflow(request);
    const composite = result.evaluation?.composite ?? 0;
    variants.push({ result, composite, variantGroupId, rank: -1 });
  }

  // Rank best→worst by composite (stable for ties: preserves generation order).
  const ranked = variants
    .map((v, idx) => ({ v, idx }))
    .sort((a, b) => b.v.composite - a.v.composite || a.idx - b.idx)
    .map(({ v }, rank) => ({ ...v, rank }));

  return { variantGroupId, best: ranked[0]!, ranked };
}
