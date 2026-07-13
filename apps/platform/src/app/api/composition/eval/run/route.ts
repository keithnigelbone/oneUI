/**
 * Composition Eval Run API — runs evaluation scenarios against the composition agent.
 *
 * For each scenario: generates a composition, validates it, optionally runs
 * an LLM judge, and returns scored results. Mirrors /api/voice/eval/run.
 */

import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { CLAUDE_MODEL } from '@oneui/shared/agent';
import {
  compileCompositionRules,
  getDefaultCompositionConfig,
  retrieveRelevantContext,
  validateComposition,
  buildSeedRules,
} from '@oneui/shared/engine';
import type {
  CompositionContext,
  CompositionEvalScenario,
  CompositionValidationResult,
  ReferenceSearchHit,
  RetrievalTrace,
  RuleSearchHit,
  SkillSearchHit,
} from '@oneui/shared/engine';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { isCompositionRAGEnabled, logCompositionRetrieval } from '@/lib/compositionRAG';
import { hydrateScreensByIds } from '@/lib/referenceResolver';

export const maxDuration = 120;

interface EvalRequest {
  scenarios: CompositionEvalScenario[];
  brandName?: string;
  /**
   * Convex brand id. Required to exercise the hybrid-RAG retrieval path
   * during evaluation (RFC 0002). Without it, the eval mirrors the legacy
   * deterministic compile — which is still useful as a baseline. When
   * set and `COMPOSITION_RAG_ENABLED=true` each scenario runs through
   * `retrieveRelevantContext` and the trace is returned on the result.
   */
  brandId?: string;
  /** If true, run LLM judge for quality scoring (slower). Otherwise validator-only. */
  useLLMJudge?: boolean;
}

interface ScenarioResult {
  scenarioId: string;
  score: number;
  passed: boolean;
  generatedAST: string;
  validation: CompositionValidationResult;
  notes?: string;
  /** Hybrid-RAG trace — only present when RAG ran for this scenario. Lets
   *  the evaluation UI render the same panel the playground uses. */
  retrievalTrace?: RetrievalTrace;
  /** System prompt size (chars) for this scenario, so the UI can show
   *  the prompt-shrink signal per-row when comparing RAG vs compile. */
  promptSize?: number;
}


export async function POST(request: Request) {
  try {
    const { scenarios, brandName, brandId } = (await request.json()) as EvalRequest;

    if (!scenarios?.length) {
      return Response.json({ error: 'No scenarios provided' }, { status: 400 });
    }

    const rules = buildSeedRules();
    const config = getDefaultCompositionConfig();

    // One Convex client for the whole run — calling `embedAndSearch` per
    // scenario is cheap because the action dedupes embeddings by hash on
    // the Convex side. Guard all RAG work behind the flag + brandId.
    const ragEligible =
      isCompositionRAGEnabled() && Boolean(brandId) && Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
    const convex = ragEligible
      ? new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
      : null;

    const results: ScenarioResult[] = [];

    for (const scenario of scenarios) {
      const context = (scenario.context ?? 'mobile-app') as CompositionContext;

      try {
        // Hybrid-RAG retrieval for this scenario's prompt. Failures degrade
        // to the deterministic compile so an outage in retrieval doesn't
        // fail the whole eval run — each scenario's trace simply comes
        // back undefined and the reviewer knows RAG didn't contribute.
        let retrievedRules: typeof rules | undefined;
        let retrievalTrace: RetrievalTrace | undefined;
        let retrievalLatencyMs: number | undefined;
        if (ragEligible && convex && brandId) {
          const startedAt = Date.now();
          try {
            const hits = await convex.action(api.compositionRetrieval.embedAndSearch, {
              query: scenario.prompt,
              brandId: brandId as Id<'brands'>,
              context,
            });
            // Bug A fix: hydrate the screen rows for every retrieved
            // reference so retrieveRelevantContext can produce proper
            // ScoredReference entries instead of dropping them all
            // with "screen row missing — skipped".
            const screenIds = hits.references.map((h) => h.screenId);
            const referenceScreens = await hydrateScreensByIds(convex, screenIds);
            const retrieval = retrieveRelevantContext({
              search: {
                rules: hits.rules as unknown as RuleSearchHit[],
                references: hits.references as unknown as ReferenceSearchHit[],
                skills: hits.skills as unknown as SkillSearchHit[],
              },
              allBrandRules: rules,
              fallbackReferences: [],
              referenceScreens,
              context,
            });
            retrievedRules = retrieval.rules;
            retrievalTrace = retrieval.trace;
            retrievalLatencyMs = Date.now() - startedAt;
          } catch (err) {
            console.warn(
              `[eval] retrieval failed for ${scenario.scenarioId}; falling back:`,
              err,
            );
          }
        }

        const compiled = compileCompositionRules(
          retrievedRules ?? rules,
          config,
          '',
          brandName ? `Brand: ${brandName}` : '',
          undefined,
          context,
        );

        // Generate composition
        const { text } = await generateText({
          model: anthropic(CLAUDE_MODEL),
          system: compiled.prompt,
          prompt: `Create a polished UI composition for: ${scenario.prompt}\n\nOutput ONLY the JSON AST.`,
        });

        let jsonStr = text.trim();
        if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }

        const ast = JSON.parse(jsonStr);

        // Validate
        const validation = validateComposition(ast, undefined, context);

        // Score: use validation score as base, with behavior check penalties
        let score = validation.score;

        // Check expected behaviors (simple keyword check in AST JSON)
        const astJson = JSON.stringify(ast).toLowerCase();
        const missedExpected = scenario.expectedBehaviors.filter(
          (b) => !astJson.includes(b.toLowerCase().split(' ')[0])
        );
        score -= missedExpected.length * 5;

        // Check forbidden behaviors
        const hitForbidden = scenario.forbiddenBehaviors.filter(
          (b) => astJson.includes(b.toLowerCase().split(' ')[0])
        );
        score -= hitForbidden.length * 10;

        score = Math.max(0, Math.min(100, score));

        results.push({
          scenarioId: scenario.scenarioId,
          score,
          passed: score >= 60 && validation.valid,
          generatedAST: JSON.stringify(ast),
          validation,
          notes: missedExpected.length > 0
            ? `Missed: ${missedExpected.join(', ')}`
            : undefined,
          retrievalTrace,
          promptSize: compiled.prompt.length,
        });

        if (retrievalTrace) {
          logCompositionRetrieval({
            caller: 'eval',
            brandId,
            context,
            promptLength: scenario.prompt.length,
            systemPromptSize: compiled.prompt.length,
            trace: retrievalTrace,
            latencyMs: retrievalLatencyMs,
          });
        }
      } catch (err: any) {
        results.push({
          scenarioId: scenario.scenarioId,
          score: 0,
          passed: false,
          generatedAST: '{}',
          validation: { valid: false, score: 0, checks: [], errorCount: 1, warningCount: 0, infoCount: 0 },
          notes: `Generation failed: ${err.message}`,
        });
      }
    }

    const passCount = results.filter((r) => r.passed).length;
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const averageScore = results.length > 0 ? Math.round(totalScore / results.length) : 0;

    return Response.json({
      results,
      summary: {
        total: results.length,
        passed: passCount,
        failed: results.length - passCount,
        averageScore,
      },
    });
  } catch (error: any) {
    console.error('Composition eval error:', error);
    return Response.json(
      { error: error.message || 'Evaluation failed' },
      { status: 500 },
    );
  }
}
