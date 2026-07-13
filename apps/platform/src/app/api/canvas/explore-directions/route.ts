/**
 * Canvas Explore Directions API — fan out 3 differentiated compositions from
 * the same brief.
 *
 * POST { prompt, brandName?, context?, rules?, config?, vertical?, model? }
 *
 * For ambiguous briefs the playground often produces one composition the
 * designer half-wants. This route generates THREE in parallel, each tilted
 * along a different axis of the design philosophy:
 *
 *   1. **Calm**       — minimal expressiveness, default-surface dominant,
 *                       single hero. Apple/Airbnb spirit. Safe choice.
 *   2. **Confident**  — bold-leaning, brand-forward, hero with branded
 *                       surface and a clear primary CTA. Expressive choice.
 *   3. **Dense**      — high-density data screen, multiple medium pivots,
 *                       inverts the attention pyramid. Counter-context choice.
 *
 * Each direction shares the same component reference + brand foundations;
 * only the layoutPersonality dials and a one-paragraph "direction directive"
 * change. This keeps every result inside the design philosophy and avoids
 * the "purple-tech slop / GitHub-dark / bold-everywhere" failure modes.
 */

import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { CLAUDE_MODEL } from '@oneui/shared/agent';
import {
  compileCompositionRules,
  getDefaultCompositionConfig,
  validateComposition,
  buildSeedRules,
  computeASTHash,
  isCompositionContext,
  normalizeCompositionAST,
  stripJSONFences,
} from '@oneui/shared/engine';
import type {
  BrandVertical,
  CompositionContext,
  CompositionRule,
  CompositionConfig,
  CompositionValidationResult,
  DirectionId,
} from '@oneui/shared/engine';
import { generateAIContext } from '@oneui/shared/meta';
import { ALL_COMPONENT_METAS } from '@oneui/ui/registry/metaRegistry';
import type { ASTRoot } from '@oneui/shared';

export const maxDuration = 60;

// ---------------------------------------------------------------------------
// Direction definitions
// ---------------------------------------------------------------------------
//
// Each direction overrides the brand's `layoutPersonality` and prepends a
// short directive to the user prompt. The directive is intentionally NOT a
// rule override — rules stay constant so the design philosophy isn't
// abandoned. The dials and directive together produce visually distinct
// outputs that all sit inside OneUI's content-first canon.

interface DirectionSpec {
  id: DirectionId;
  label: string;
  description: string;
  layoutPersonality: { density: number; expressiveness: number };
  configOverrides: Partial<CompositionConfig>;
  /** Inserted into the user prompt as `[Direction: ...]`. */
  directive: string;
}

const DIRECTION_SPECS: DirectionSpec[] = [
  {
    id: 'calm',
    label: 'Calm',
    description:
      'Apple/Airbnb minimalism. Default surface dominates, single hero, generous whitespace. The safe choice when content is the product.',
    layoutPersonality: { density: 30, expressiveness: 20 },
    configOverrides: { preferMinimalContainers: true, preferBoldHeros: false },
    directive:
      'CALM direction — content-first minimalism. 90% default surface. Generous whitespace between sections (--Spacing-9+). One primary CTA only. No decorative borders, no decorative icons. Headlines use Display/Headline tokens. Body copy is generous. Reach for restraint over emphasis.',
  },
  {
    id: 'confident',
    label: 'Confident',
    description:
      'Brand-forward expressiveness. Hero with branded surface, single bold primary CTA, deliberate accent moments. The expressive choice for marketing or first-impression screens.',
    layoutPersonality: { density: 50, expressiveness: 85 },
    configOverrides: { preferBoldHeros: true, preferMinimalContainers: false },
    directive:
      'CONFIDENT direction — brand-forward. Open with a hero that uses <Surface mode="bold"> for the brand moment, with a single bold primary CTA inside it. Subsequent sections return to default surface. Use Display typography for the hero headline. Accent moments are deliberate, not decorative — keep Sparkle to one element max. The brand should feel present without flooding the page.',
  },
  {
    id: 'dense',
    label: 'Dense',
    description:
      'Data-first density. Multiple medium-attention pivots replace a single hero. Inverts the attention pyramid — right when intelligence IS the product.',
    layoutPersonality: { density: 90, expressiveness: 35 },
    configOverrides: { preferMinimalContainers: true, preferBoldHeros: false },
    directive:
      'DENSE direction — data-first. The attention pyramid does NOT apply here; multiple medium pivots are correct. Each region should show ≥3 differentiation data points (number + label + inferred reason or trend). Use Surface mode="subtle" to group related metrics; never add strokes around tinted surfaces. No hero CTA at the top — the data is the hero. Keep iconography functional only; no decorative icons.',
  },
];

// ---------------------------------------------------------------------------
// Per-direction generation
// ---------------------------------------------------------------------------

interface DirectionRequest {
  prompt: string;
  brandName?: string;
  context: CompositionContext;
  rules?: CompositionRule[];
  config?: CompositionConfig;
  vertical?: BrandVertical;
  model?: string;
}

interface DirectionResult {
  id: DirectionId;
  label: string;
  description: string;
  ast: ASTRoot;
  validation: CompositionValidationResult;
  astHash: string;
  /** Layout personality used for this direction (informational, for the picker). */
  layoutPersonality: { density: number; expressiveness: number };
}

interface DirectionFailure {
  id: DirectionId;
  label: string;
  description: string;
  error: string;
}

async function generateOneDirection(
  spec: DirectionSpec,
  req: DirectionRequest,
  componentRef: string,
): Promise<DirectionResult | DirectionFailure> {
  const baseConfig = req.config ?? getDefaultCompositionConfig();
  const directionConfig: CompositionConfig = {
    ...baseConfig,
    ...spec.configOverrides,
    layoutPersonality: spec.layoutPersonality,
    vertical: req.vertical ?? baseConfig.vertical,
  };

  const rules = req.rules ?? buildSeedRules();

  const compiled = compileCompositionRules(
    rules,
    directionConfig,
    componentRef,
    req.brandName ? `Brand: ${req.brandName}` : '',
    undefined,
    req.context,
    { references: [] }, // Skip references for thumbnails — keep latency low
  );

  const userPrompt = [
    `[Direction: ${spec.label}]`,
    spec.directive,
    '',
    req.brandName ? `Brand: ${req.brandName}.` : '',
    `Create: ${req.prompt}`,
    '',
    'Output ONLY the JSON AST.',
  ]
    .filter(Boolean)
    .join('\n');

  let text: string;
  try {
    const result = await generateText({
      model: anthropic(req.model ?? CLAUDE_MODEL),
      system: compiled.prompt,
      prompt: userPrompt,
      // Higher temperature than the single-shot generate — we WANT divergence
      // across the three directions so the picker has real choices.
      temperature: 0.7,
    });
    text = result.text;
  } catch (err) {
    return {
      id: spec.id,
      label: spec.label,
      description: spec.description,
      error: `LLM call failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  let ast: ASTRoot;
  try {
    const parsed = JSON.parse(stripJSONFences(text));
    if (!parsed || typeof parsed !== 'object' || !parsed.root || !parsed.version) {
      return {
        id: spec.id,
        label: spec.label,
        description: spec.description,
        error: 'Generated AST missing root or version',
      };
    }
    const normalization = normalizeCompositionAST(parsed as ASTRoot);
    ast = normalization.ast;
    if (normalization.issues.length > 0) {
      console.info(
        `[canvas/explore-directions] normalized ${spec.id} AST:`,
        normalization.issues.map((issue) => `${issue.kind}:${issue.path}`).join(', '),
      );
    }
  } catch (err) {
    return {
      id: spec.id,
      label: spec.label,
      description: spec.description,
      error: `Could not parse AST JSON: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const validation = validateComposition(ast, undefined, req.context);
  const astHash = computeASTHash(ast);

  return {
    id: spec.id,
    label: spec.label,
    description: spec.description,
    ast,
    validation,
    astHash,
    layoutPersonality: spec.layoutPersonality,
  };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

interface ExploreRequestBody {
  prompt: string;
  brandName?: string;
  model?: string;
  context?: string;
  rules?: CompositionRule[];
  config?: CompositionConfig;
  vertical?: BrandVertical;
}

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY not configured' },
      { status: 500 },
    );
  }

  let body: ExploreRequestBody;
  try {
    body = (await request.json()) as ExploreRequestBody;
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof body.prompt !== 'string' || body.prompt.trim().length === 0) {
    return Response.json({ error: 'prompt is required' }, { status: 400 });
  }

  const context: CompositionContext = isCompositionContext(body.context)
    ? body.context
    : 'mobile-app';

  // Component reference is identical across all three directions — compute
  // once, reuse for each.
  const componentRef = generateAIContext(ALL_COMPONENT_METAS, {
    brandName: body.brandName,
    includeSlots: true,
  });

  const req: DirectionRequest = {
    prompt: body.prompt,
    brandName: body.brandName,
    context,
    rules: body.rules,
    config: body.config,
    vertical: body.vertical,
    model: body.model,
  };

  // Fan out — three independent generations in parallel.
  const settled = await Promise.allSettled(
    DIRECTION_SPECS.map((spec) => generateOneDirection(spec, req, componentRef)),
  );

  const directions: Array<DirectionResult | DirectionFailure> = settled.map((s, i) => {
    if (s.status === 'fulfilled') return s.value;
    const spec = DIRECTION_SPECS[i];
    return {
      id: spec.id,
      label: spec.label,
      description: spec.description,
      error: s.reason instanceof Error ? s.reason.message : String(s.reason),
    };
  });

  return Response.json({
    directions,
    context,
  });
}
