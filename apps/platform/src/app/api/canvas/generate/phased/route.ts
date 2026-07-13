/**
 * Canvas Phased Generate API — junior-designer workflow.
 *
 * POST { phase: 'skeleton' | 'components' | 'polish', prompt, priorAst?, ... }
 *
 * Generates one phase at a time. The client drives the workflow:
 *   1. POST { phase: 'skeleton', prompt } → returns skeleton AST
 *   2. user confirms → POST { phase: 'components', prompt, priorAst: <step 1 output> }
 *   3. user confirms → POST { phase: 'polish', prompt, priorAst: <step 2 output> }
 *
 * This keeps state on the client (no server-side session) and lets the user
 * step back to any prior phase by re-sending its prior input.
 */

import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { CLAUDE_MODEL } from '@oneui/shared/agent';
import {
  buildPhasedUserPrompt,
  buildSeedRules,
  compileCompositionRules,
  getDefaultCompositionConfig,
  validateComposition,
  GENERATION_PHASES,
  computeASTHash,
  isCompositionContext,
  normalizeCompositionAST,
  stripJSONFences,
} from '@oneui/shared/engine';
import type {
  BrandVertical,
  CompositionContext,
  CompositionConfig,
  CompositionRule,
  GenerationPhase,
} from '@oneui/shared/engine';
import { generateAIContext } from '@oneui/shared/meta';
import { ALL_COMPONENT_METAS } from '@oneui/ui/registry/metaRegistry';
import type { ASTRoot } from '@oneui/shared';

export const maxDuration = 60;

function isPhase(value: unknown): value is GenerationPhase {
  return typeof value === 'string' && (GENERATION_PHASES as readonly string[]).includes(value);
}

interface PhasedRequestBody {
  phase: GenerationPhase;
  prompt: string;
  brandName?: string;
  context?: string;
  rules?: CompositionRule[];
  config?: CompositionConfig;
  vertical?: BrandVertical;
  /** JSON-stringified prior-phase AST. Required for phases 2 and 3. */
  priorAst?: string;
  model?: string;
}

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  let body: PhasedRequestBody;
  try {
    body = (await request.json()) as PhasedRequestBody;
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!isPhase(body.phase)) {
    return Response.json(
      { error: `phase must be one of: ${GENERATION_PHASES.join(', ')}` },
      { status: 400 },
    );
  }
  if (typeof body.prompt !== 'string' || body.prompt.trim().length === 0) {
    return Response.json({ error: 'prompt is required' }, { status: 400 });
  }
  if (body.phase !== 'skeleton' && !body.priorAst) {
    return Response.json(
      { error: `phase "${body.phase}" requires priorAst (output of the previous phase)` },
      { status: 400 },
    );
  }

  const context: CompositionContext = isCompositionContext(body.context)
    ? body.context
    : 'mobile-app';

  const resolvedConfig = body.config ?? getDefaultCompositionConfig();
  const rules = body.rules ?? buildSeedRules();

  const componentRef = generateAIContext(ALL_COMPONENT_METAS, {
    brandName: body.brandName,
    includeSlots: true,
  });

  const compiled = compileCompositionRules(
    rules,
    resolvedConfig,
    componentRef,
    body.brandName ? `Brand: ${body.brandName}` : '',
    undefined,
    context,
    { references: [] },
  );

  let phasedUserPrompt: string;
  try {
    phasedUserPrompt = buildPhasedUserPrompt({
      phase: body.phase,
      userPrompt: body.prompt,
      brandName: body.brandName,
      priorAst: body.priorAst,
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 },
    );
  }

  let raw: string;
  try {
    const result = await generateText({
      model: anthropic(body.model ?? CLAUDE_MODEL),
      system: compiled.prompt,
      prompt: phasedUserPrompt,
      // Skeleton + components phases want low randomness (structural clarity);
      // polish phase wants a touch more so copy variation isn't stilted.
      temperature: body.phase === 'polish' ? 0.5 : 0.2,
    });
    raw = result.text;
  } catch (err) {
    return Response.json(
      { error: `LLM call failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 502 },
    );
  }

  let ast: ASTRoot;
  try {
    const parsed = JSON.parse(stripJSONFences(raw));
    if (!parsed || typeof parsed !== 'object' || !parsed.root || !parsed.version) {
      return Response.json(
        { error: 'Generated AST missing root or version', raw },
        { status: 502 },
      );
    }
    const normalization = normalizeCompositionAST(parsed as ASTRoot);
    ast = normalization.ast;
    if (normalization.issues.length > 0) {
      console.info(
        '[canvas/generate/phased] normalized generated AST:',
        normalization.issues.map((issue) => `${issue.kind}:${issue.path}`).join(', '),
      );
    }
  } catch (err) {
    return Response.json(
      {
        error: `Could not parse AST JSON: ${err instanceof Error ? err.message : String(err)}`,
        raw,
      },
      { status: 502 },
    );
  }

  const validation = validateComposition(ast, undefined, context);
  const astHash = computeASTHash(ast);

  return Response.json({
    phase: body.phase,
    ast,
    astHash,
    validation,
    context,
  });
}
