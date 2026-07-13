/**
 * Composition Engine Types — Framework-Agnostic
 *
 * Type definitions for the Design Composition Agent (DCA) rules engine.
 * Used by: composition compiler, validator, eval scorer, Convex functions, UI.
 *
 * Mirrors the voice engine type structure (voiceTypes.ts) but adapted for
 * visual composition rules rather than textual voice rules.
 */

// ============================================
// Composition Context (output surface)
// ============================================
//
// Contexts describe WHERE the composition will be rendered. The same brand's
// composition rules are expressed differently depending on whether the output
// is a mobile app screen, a responsive web page, a marketing landing page,
// or a social media post.
//
// - mobile-app:      compact, single-column, 44px touch targets, thumb-zone
//                    awareness, bottom-anchored CTAs, 390px viewport
// - web-app:         responsive breakpoints, multi-column grid, hover states,
//                    keyboard navigation, sidebar layouts
// - marketing-page:  hero-driven, scroll-based, ContentBlock + JioRibbon,
//                    bold surface usage, conversion-focused CTAs
// - social-post:     fixed dimensions (IG 1080×1080, FB 1200×630), high-contrast
//                    text overlays, ContentBlock overlay pattern
//
// Future (Phase 3): 'print' (CMYK, DPI, bleed), 'outdoor' (bold, minimal)

export type CompositionContext =
  | 'mobile-app'
  | 'web-app'
  | 'marketing-page'
  | 'social-post'
  | 'print'
  | 'outdoor';

export const COMPOSITION_CONTEXTS: readonly CompositionContext[] = [
  'mobile-app',
  'web-app',
  'marketing-page',
  'social-post',
  'print',
  'outdoor',
] as const;

export function isCompositionContext(value: unknown): value is CompositionContext {
  return typeof value === 'string' && (COMPOSITION_CONTEXTS as readonly string[]).includes(value);
}

// ============================================
// Composition Configuration (brand-level)
// ============================================

/** Industry vertical for the brand or sub-brand */
export type BrandVertical =
  | 'entertainment'
  | 'e-commerce'
  | 'finance'
  | 'governance'
  | 'farm'
  | 'iot'
  | 'telecom'
  | 'mobility'
  | 'health'
  | 'general';

export const BRAND_VERTICALS: readonly BrandVertical[] = [
  'entertainment',
  'e-commerce',
  'finance',
  'governance',
  'farm',
  'iot',
  'telecom',
  'mobility',
  'health',
  'general',
] as const;

/**
 * Two-dial layout personality. Every brand's composition style is
 * fundamentally two things: how information-dense it is and how
 * visually expressive/immersive it is.
 *
 * - density:      0 = spacious, breathable, editorial-like
 *                 100 = compact, data-dense, dashboard-like
 * - expressiveness: 0 = minimal, functional, utility-focused
 *                   100 = bold, immersive, hero-driven
 */
export interface LayoutPersonality {
  /** 0 = spacious, editorial → 100 = compact, data-dense */
  density: number;
  /** 0 = minimal, functional → 100 = bold, immersive, hero-driven */
  expressiveness: number;
}

/**
 * Brand-level composition configuration. One per brand.
 * Analogous to VoiceConfig for the voice system.
 */
export interface CompositionConfig {
  /** Primary vertical for this brand (drives vertical-specific rule filtering) */
  vertical: BrandVertical;
  /** Layout personality dials */
  layoutPersonality: LayoutPersonality;
  /** Preferred default composition context */
  defaultContext: CompositionContext;
  /** Max components per screen (guidance for the LLM) */
  maxComponentsPerScreen?: number;
  /** Whether to prefer bold surface hero patterns */
  preferBoldHeros?: boolean;
  /** Whether to prefer minimal/ghost containers */
  preferMinimalContainers?: boolean;
  isActive: boolean;
  version: number;
}

// ============================================
// Composition Rules
// ============================================

/**
 * Default context classification for the 12 composition rule sections.
 * Used by the compiler when a CompositionRule does not carry its own
 * `contexts` field — same pattern as DEFAULT_SECTION_CONTEXTS in voice.
 *
 * `'all'` is a wildcard: the rule applies to every context.
 */
export const DEFAULT_COMPOSITION_CONTEXTS: Record<string, readonly string[]> = {
  // Universal — core composition principles apply everywhere
  'layout-structure': ['all'],
  'spacing-rhythm': ['all'],
  'typography-hierarchy': ['all'],
  'attention-flow': ['all'],
  'surface-application': ['all'],
  'component-selection': ['all'],
  'color-role-usage': ['all'],
  'motion-elevation': ['all'],
  'accessibility-layout': ['all'],

  // Context-specific — different platforms have different patterns
  'navigation-patterns': ['mobile-app', 'web-app'],
  'responsive-adaptation': ['web-app'],
  'vertical-specifics': ['all'],

  // Physical media contexts inherit layout and typography rules but not
  // navigation or responsive adaptation
};

/** One of the 12 modular composition rule sections */
export interface CompositionRule {
  sectionId: string;
  title: string;
  content: string;
  priority: number;
  scope: 'base' | 'brand';
  isActive: boolean;
  version: number;
  /**
   * Contexts this rule applies to. If missing or empty, the compiler falls
   * back to DEFAULT_COMPOSITION_CONTEXTS[sectionId]. Use `'all'` as a wildcard.
   */
  contexts?: string[];
  /**
   * Optional vertical tag. When set, this rule only applies when the brand's
   * vertical matches. Enables cross-brand vertical patterns (e.g., all
   * e-commerce brands share product grid rules regardless of parent brand).
   */
  vertical?: string;
}

/** Resolved rule with source indicator (after base/brand merge) */
export interface ResolvedCompositionRule extends CompositionRule {
  source: 'base' | 'brand' | 'none';
}

// ============================================
// Junior-designer phased generation
// ============================================
//
// Three discrete phases mirror the "show early, refine later" workflow.
// Each phase has its own prompt envelope and validator subset; outputs
// flow forward as `priorAst` so the next phase refines instead of rebuilding.
//
//   - skeleton:   layout shape only — Surfaces + labelled placeholder boxes
//   - components: real components fill the placeholders; copy is [bracketed]
//   - polish:     final copy, attention pass, micro-tuning

export type GenerationPhase = 'skeleton' | 'components' | 'polish';

export const GENERATION_PHASES: readonly GenerationPhase[] = [
  'skeleton',
  'components',
  'polish',
] as const;

export interface GenerationPhaseSpec {
  id: GenerationPhase;
  label: string;
  description: string;
}

/** Three differentiated takes the Direction Advisor can produce. Shared
 *  between the explore-directions API route and the playground picker UI
 *  so the IDs stay in lockstep. */
export type DirectionId = 'calm' | 'confident' | 'dense';

export const GENERATION_PHASE_SPECS: readonly GenerationPhaseSpec[] = [
  {
    id: 'skeleton',
    label: 'Skeleton',
    description:
      'Layout shape only. Surface containers plus labelled placeholder boxes. Confirm the structure before filling components.',
  },
  {
    id: 'components',
    label: 'Components',
    description:
      'Replace placeholders with real components. Copy stays as [bracketed] placeholders so structure decisions stay primary.',
  },
  {
    id: 'polish',
    label: 'Polish',
    description:
      'Real copy, final attention pass, typography refinement. The composition is now ready to ship.',
  },
] as const;

// ============================================
// Composition Skills
// ============================================

/** Example input/output for a composition skill */
export interface CompositionSkillExample {
  /** Natural language prompt */
  prompt: string;
  /** Expected AST output (JSON string) */
  expectedAST: string;
  /** Composition context this example targets */
  context?: CompositionContext;
}

/**
 * Reusable composition skill — a codified pattern for a specific
 * screen type or layout archetype.
 *
 * Analogous to VoiceSkill but for visual composition.
 */
export interface CompositionSkill {
  skillId: string;
  name: string;
  description: string;
  category: 'screen' | 'pattern' | 'flow';
  /**
   * Template with placeholders: {brand}, {vertical}, {components}, {tokens}.
   * Injected into the system prompt when this skill is invoked.
   */
  systemPromptTemplate: string;
  /** Which contexts this skill is applicable to */
  applicableContexts: CompositionContext[];
  /** Example prompt/AST pairs */
  examples: CompositionSkillExample[];
  isActive: boolean;
  version: number;
}

// ============================================
// Composition Validator (deterministic checks)
// ============================================

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface CompositionCheck {
  /** Check identifier (e.g., 'token-compliance', 'attention-hierarchy') */
  id: string;
  /** Human-readable check name */
  name: string;
  /** Whether the check passed */
  passed: boolean;
  /** Severity level — errors block output, warnings are advisory */
  severity: ValidationSeverity;
  /** Details about what was found */
  details?: string;
  /** Path to the offending AST node (e.g., 'root > children[2] > props.style.color') */
  nodePath?: string;
}

export interface CompositionValidationResult {
  /** Whether all error-level checks passed */
  valid: boolean;
  /** Total score (0-100) — errors heavily penalized, warnings mildly */
  score: number;
  /** Individual check results */
  checks: CompositionCheck[];
  /** Count by severity */
  errorCount: number;
  warningCount: number;
  infoCount: number;
}

// ============================================
// Evaluation
// ============================================

export interface CompositionEvalRubric {
  tokenCompliance?: number;
  attentionHierarchy?: number;
  spacingConsistency?: number;
  surfaceCorrectness?: number;
  componentSelection?: number;
  brandConsistency?: number;
  accessibility?: number;
  layoutQuality?: number;
  /** Visual alignment against referenced screens (requires render pass). */
  visualAlignment?: number;
}

export interface CompositionEvalScenario {
  scenarioId: string;
  category: string;
  title: string;
  description?: string;
  /** Natural language prompt for the composition */
  prompt: string;
  /** Composition context to generate in */
  context: CompositionContext;
  /** Expected structural behaviors (e.g., 'uses Surface mode=bold for hero') */
  expectedBehaviors: string[];
  /** Structural patterns that must NOT appear */
  forbiddenBehaviors: string[];
  rubric: CompositionEvalRubric;
  /** Gold-standard AST (JSON string) for comparison */
  referenceAST?: string;
}

export interface CompositionEvalDimensionScore {
  dimension: string;
  score: number;
  weight: number;
  passed: boolean;
  feedback: string;
}

export interface CompositionEvalResult {
  scenarioId: string;
  score: number;
  passed: boolean;
  /** Generated AST (JSON string) */
  generatedAST: string;
  /** Validation result from the deterministic checker */
  validation: CompositionValidationResult;
  dimensionScores: CompositionEvalDimensionScore[];
  notes?: string;
}

// ============================================
// Compiled Prompt
// ============================================

export interface CompiledCompositionPrompt {
  /** The assembled system prompt string */
  prompt: string;
  /** Size in characters */
  size: number;
  /** Which rule sections were included */
  includedSections: string[];
  /** Which composition context this was compiled for */
  context: CompositionContext;
  /** Hash for cache invalidation */
  hash: string;
  /** Reference screens selected for vision grounding (IDs, resolved at API edge) */
  referenceScreenIds?: string[];
}

// ============================================
// Reference UI Library — visual precedent for composition
// ============================================

/**
 * A catalogued reference screen. Lives in Convex (`referenceScreens` table) but
 * this shape is also the pure-function contract for `resolveReferences`.
 * The engine never touches Convex directly — callers load rows and pass them in.
 */
export interface ReferenceScreen {
  /** Convex id as string (so engine stays framework-free) */
  id: string;
  /** Human label */
  name: string;
  /** Archetype slug (product-grid, hero, player, settings, detail, onboarding, …) */
  archetype: string;
  /** Composition context the reference was captured from */
  context: CompositionContext;
  /** Optional vertical tag — drives relevance scoring */
  vertical?: BrandVertical;
  /** Short designer-authored description */
  description?: string;
  /** Structured notes used as text context alongside the image */
  tokensObserved?: string[];
  attentionNotes?: string;
  dosDonts?: string[];
  /** Markdown summary from `referenceAnalyses` — primary prompt material */
  analysisSummary?: string;
  /** Storage handle used by the API edge to attach image content blocks */
  storageId?: string;
  /** Denormalised for resolver scoring (avoid chasing FK) */
  collectionVertical?: BrandVertical;
  collectionPlatform?: string;
  /** Lifecycle */
  status?: 'draft' | 'approved' | 'archived';
  tags?: string[];
}

/** Inputs for selecting top-k references for a composition request. */
export interface ResolveReferencesInput {
  vertical?: BrandVertical;
  context: CompositionContext;
  /** Optional archetype hint inferred from the prompt or skill */
  archetype?: string;
  /** Hard cap on references returned (typically 2–3) */
  limit?: number;
  /** Only `approved` status screens enter the candidate pool by default */
  includeDrafts?: boolean;
}

/** A ranked reference with its relevance score and reasoning breadcrumb. */
export interface ScoredReference {
  screen: ReferenceScreen;
  score: number;
  reasons: string[];
}

// ============================================
// Feedback
// ============================================

export type CompositionFeedbackSource =
  | 'playground'
  | 'evaluation'
  | 'canvas'
  | 'experience-builder'
  | 'visual-verification';
export type CompositionFeedbackRating = 'positive' | 'negative';
export type CompositionFeedbackStatus = 'open' | 'reviewed' | 'resolved' | 'dismissed';
export type CompositionFeedbackResolutionAction =
  | 'rule-updated'
  | 'scenario-added'
  | 'skill-added'
  | 'reference-added'
  | 'dismissed';

export interface CompositionFeedback {
  source: CompositionFeedbackSource;
  /** The prompt that generated this composition */
  prompt: string;
  /** The generated AST (JSON string) */
  generatedAST: string;
  /** Composition context used */
  context: CompositionContext;
  /** Designer annotation explaining what's wrong/right */
  annotation?: string;
  rating: CompositionFeedbackRating;
  /** Validation result at time of feedback */
  validationResult?: CompositionValidationResult;
  /** Related rule sections (for routing feedback to rule owners) */
  relatedRuleSections?: string[];
  status: CompositionFeedbackStatus;
  resolution?: {
    action: CompositionFeedbackResolutionAction;
    details?: string;
    resolvedAt?: number;
  };
}
