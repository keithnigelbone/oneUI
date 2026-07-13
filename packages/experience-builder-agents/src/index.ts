/**
 * @oneui/experience-builder-agents
 *
 * The Mastra orchestration brain for the Jio AI Experience Builder Lab. Mastra
 * owns sequencing/branching/HITL (ORCH-04); the Vercel AI SDK is the model +
 * transport layer only, funnelled through `modelAdapter.ts`.
 *
 * P1 (Walking Skeleton): every edge is a deterministic mock — no real LLM. The
 * workflow proves orchestration ownership (ORCH-04), the event stream
 * (ORCH-03), the valid-IR happy path (GEN-08), the gap short-circuit (FND-03),
 * and durable persistence is handled in the Convex layer (VER-03).
 *
 * Node-runtime package (agents are backend, never Edge — RESEARCH § Architectural
 * Responsibility Map).
 */

// Model + transport boundary (the ONLY AI-SDK / @mastra/ai-sdk touchpoint).
export {
  AI_SDK_STREAM_VERSION,
  type AiSdkStreamVersion,
  toV6WorkflowStream,
  callModel,
  __setCallModelImpl,
  type CallModelArgs,
} from './modelAdapter';

// Real foundation resolver (real ThemeConfig success or typed gap; FND-04).
export {
  resolveFoundation,
  type BrandFoundations,
  type ResolveFoundationInput,
} from './foundationResolver';

// Deterministic mock IR generator + the gap short-circuit (legacy P1 path).
export { mockGenerate, type MockGenerateInput, type MockGenerateResult } from './mockGeneration';

// LLM IR Generator (GEN-05): Output.object + per-section + in-gen retry.
export {
  generateIR,
  MAX_IR_ATTEMPTS,
  type GenerateIRInput,
  type GenerateIRResult,
} from './irGenerator';

// Topic-image generation seam used by the Experience Lab UI provider selector.
export {
  runImageGeneration,
  type GeneratedImageAsset,
  type ImageGenerationConfig,
  type ImageGenerationInput,
  type ImageGenerationResult,
  type ImageProviderPreference,
  type ResolvedImageProvider,
} from './imageGeneration';

// Storybook MCP provenance for strict compound component recipes.
export {
  fetchStorybookMcpDocs,
  requiresStorybookDesignContext,
  requiresStorybookNavigationDocs,
  resolveDesignContext,
  resolveStorybookRecipeContext,
  storybookMcpUrlFromEnv,
  type ResolveDesignContextInput,
  type ResolveStorybookRecipeContextInput,
  type StorybookMcpStatus,
  type StorybookRecipeContext,
} from './storybookMcp';

// GEN-06 compiler: IR → canonical React + Jio CSS string + allowlist validation.
export {
  compile,
  GENERATED_ARTIFACT_NAME,
  type CompileContext,
  type CompileResult,
} from './compiler';

// D-05 Response Caching: deterministic memoization keyed on a canonical-input hash.
export {
  cacheKey,
  createCache,
  memoize,
  sharedCache,
  clearCache,
  type CacheKeyInput,
  type ResponseCache,
} from './cache';

// GEN-04 planner agent (D-02): the net-new lightweight UX/flow planner.
export {
  plannerAgent,
  runPlanner,
  PlanSchema,
  PlanSectionSchema,
  type PlanT,
  type PlanSectionT,
  type RunPlannerInput,
} from './agents/plannerAgent';

// GEN-02 ToV adapter (Mastra tool): per-section markup-free copy spec.
export {
  voiceAdapter,
  runVoiceAdapter,
  DEFAULT_LAB_VOICE_CONFIG,
  VoiceAdapterInputSchema,
  VoiceAdapterOutputSchema,
  SectionCopySpecSchema,
  type VoiceAdapterOutputT,
  type SectionCopySpecT,
} from './adapters/voiceAdapter';

// GEN-03 Design adapter (Mastra tool): per-section registry-constrained layout/component spec.
export {
  designAdapter,
  runDesignAdapter,
  DesignAdapterInputSchema,
  DesignAdapterOutputSchema,
  SectionDesignSpecSchema,
  type DesignAdapterOutputT,
  type SectionDesignSpecT,
} from './adapters/designAdapter';

// Mastra workflow skeleton + run runner + the emitted event stream + AST bridge.
export {
  experienceWorkflow,
  runExperienceWorkflow,
  runExperienceWorkflowHitl,
  runVariants,
  irToArtifactAst,
  ResumeDecisionSchema,
  type ResumeDecisionT,
  type SuspendedRun,
  type RunExperienceInput,
  type RunExperienceResult,
  type AgentTraceT,
  type FoundationsLoader,
  type FoundationsLoaderInput,
  type VoiceAssets,
  type VoiceAssetsLoader,
  type RankedVariant,
  type VariantGroupResult,
  type RunContext,
} from './workflow';

// EVAL-01 / D-07: the Visual Evaluator rubric schema + config-tunable scoring.
export {
  VisualRubric,
  EVALUATOR_CONFIG,
  composite,
  clampRubric,
  RUBRIC_CRITERIA,
  SCORE_MIN,
  SCORE_MAX,
  type VisualRubricT,
  type RubricCriterion,
} from './evaluatorRubric';

// Golden prompt fixtures for screenshot-backed Lab quality gates.
export {
  GOLDEN_PROMPT_FIXTURES,
  type GoldenPromptFixture,
  type GoldenPromptViewport,
} from './fixtures/goldenPrompts';

// D-06 two-track evaluator step + D-09 IR-patch repair step.
export { evaluateStep } from './steps/evaluate';
export { repairStep, updateSameValidationError } from './steps/repair';

// CAMP-03/CAMP-04/CAMP-05 carousel driver: ordered, grouped, individually
// DS-compliant frames under a SHARED repair budget with per-frame ToV copy.
export {
  runCarousel,
  MAX_PER_FRAME_REPAIRS,
  type RunCarouselInput,
  type CarouselResult,
  type CarouselFrameResult,
  type FrameOutcome,
  type FrameCopy,
  type FrameCopyRequest,
  type FramePipelineInput,
  type FramePipelineResult,
  type CanvasResolveResult,
} from './steps/carousel';

// Run-context state types (RunEvaluation / RunScreenshot) for the route/canvas.
export type { RunEvaluation, RunScreenshot } from './runContext';

// D-05 Background Tasks: submit a long run via createBackgroundTask, streaming
// progress as ExperienceBuilderEvents (same result as the inline path).
export { runExperienceWorkflowBackground, type BackgroundRunOptions } from './backgroundRun';
