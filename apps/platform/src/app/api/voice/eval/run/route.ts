/**
 * Voice Eval Run API — Trigger a batch evaluation.
 *
 * Generates AI responses for each scenario, runs tone guard,
 * uses an LLM judge to score against reference answers, and
 * records results in Convex.
 */

import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { createAuthedConvexClient } from '@/lib/convexServer';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import {
  compileVoiceRules,
  runToneGuard,
  buildJudgePrompt,
  buildScenarioResult,
  aggregateResults,
} from '@oneui/shared';
import type {
  VoiceConfig,
  EvalScenario,
  EvalScenarioResult,
  JudgeResponse,
  ResolvedVoiceRule,
} from '@oneui/shared';

export const maxDuration = 300; // 5 minutes for batch eval

const GENERATION_MODEL = 'claude-sonnet-4-6';
const JUDGE_MODEL = 'claude-sonnet-4-6';

interface EvalRunRequestBody {
  brandId: string;
  category?: string;
  scenarioIds?: string[];
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_CONVEX_URL not configured' }, { status: 500 });
  }

  const { brandId, category, scenarioIds } = (await request.json()) as EvalRunRequestBody;

  if (!brandId) {
    return NextResponse.json({ error: 'brandId is required' }, { status: 400 });
  }

  const convex = await createAuthedConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL);

  try {
    // 1. Fetch scenarios
    const allScenarios = await convex.query(api.voiceEval.listScenarios, {
      brandId: brandId as Id<'brands'>,
    });

    let scenarios = allScenarios.filter((s) => s.isActive);

    if (category && category !== 'all') {
      scenarios = scenarios.filter((s) => s.category === category);
    }

    if (scenarioIds && scenarioIds.length > 0) {
      scenarios = scenarios.filter((s) => scenarioIds.includes(s.scenarioId));
    }

    if (scenarios.length === 0) {
      return NextResponse.json({ error: 'No matching active scenarios found' }, { status: 404 });
    }

    // 2. Fetch voice config and rules
    const voiceConfig = await convex.query(api.voiceConfigs.get, {
      brandId: brandId as Id<'brands'>,
    });

    if (!voiceConfig) {
      return NextResponse.json({ error: 'No voice config found for this brand' }, { status: 404 });
    }

    const configObj: VoiceConfig = {
      agentName: voiceConfig.agentName,
      personality: voiceConfig.personality,
      toneProfile: voiceConfig.toneProfile,
      language: voiceConfig.language,
      communicationStyle: voiceConfig.communicationStyle,
      emotionalIntelligence: voiceConfig.emotionalIntelligence,
      channelDefaults: voiceConfig.channelDefaults as VoiceConfig['channelDefaults'],
      verbosity: voiceConfig.verbosity ?? 50,
      isActive: voiceConfig.isActive,
      version: voiceConfig.version,
    };

    // Fetch and resolve rules
    const systemBrand = await convex.query(api.brands.getBySlug, { slug: 'oneui-system' });
    const systemBrandId = systemBrand?._id;

    const baseRules = systemBrandId
      ? await convex.query(api.voiceRules.getByBrand, { brandId: systemBrandId })
      : [];
    const brandRules = await convex.query(api.voiceRules.getByBrand, {
      brandId: brandId as Id<'brands'>,
    });

    const resolvedRules: ResolvedVoiceRule[] = baseRules.map((base) => {
      const override = brandRules.find(
        (br) => br.sectionId === base.sectionId && br.isActive
      );
      return {
        sectionId: base.sectionId,
        title: override?.title ?? base.title,
        content: override?.content ?? base.content,
        priority: base.priority,
        scope: override ? 'brand' : 'base',
        isActive: override?.isActive ?? base.isActive,
        version: override?.version ?? base.version,
        source: override ? 'brand' : 'base',
      } as ResolvedVoiceRule;
    });

    // 3. Compile voice prompt
    const compiled = compileVoiceRules(resolvedRules, configObj, 'app');

    // 4. Create run record
    const runId = await convex.mutation(api.voiceEval.createRun, {
      brandId: brandId as Id<'brands'>,
      name: `Eval ${new Date().toISOString().slice(0, 16)}`,
      rulesVersion: Date.now(),
      totalScenarios: scenarios.length,
      passCount: 0,
      failCount: 0,
      averageScore: 0,
      scoreBreakdown: {},
      results: [],
      status: 'running',
      startedAt: Date.now(),
    });

    // 5. Run evaluation for each scenario (with rate limiting + retry)
    const results: EvalScenarioResult[] = [];
    const SCENARIO_DELAY_MS = 500;

    async function callWithRetry<T>(fn: () => Promise<T>, label: string, maxAttempts = 3): Promise<T> {
      let lastErr: unknown;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await fn();
        } catch (err) {
          lastErr = err;
          const msg = err instanceof Error ? err.message : String(err);
          // Retry on rate limit (429) or overload (529) with exponential backoff
          if (attempt < maxAttempts && /429|529|rate.?limit|overload/i.test(msg)) {
            const delay = 1000 * Math.pow(2, attempt - 1);
            console.warn(`[voice/eval/run] ${label} retry ${attempt}/${maxAttempts} after ${delay}ms: ${msg}`);
            await new Promise((r) => setTimeout(r, delay));
            continue;
          }
          throw err;
        }
      }
      throw lastErr;
    }

    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];
      // Delay between scenarios to respect rate limits (skip before first)
      if (i > 0) await new Promise((r) => setTimeout(r, SCENARIO_DELAY_MS));

      try {
        const evalScenario: EvalScenario = {
          scenarioId: scenario.scenarioId,
          category: scenario.category,
          title: scenario.title,
          description: scenario.description,
          userMessage: scenario.userMessage,
          expectedBehaviors: scenario.expectedBehaviors,
          forbiddenBehaviors: scenario.forbiddenBehaviors,
          rubric: scenario.rubric,
          referenceAnswer: scenario.referenceAnswer,
        };

        // Generate response with retry
        const { text: response } = await callWithRetry(
          () => generateText({
            model: anthropic(GENERATION_MODEL),
            system: compiled.prompt,
            messages: [{ role: 'user', content: scenario.userMessage }],
          }),
          `generate[${scenario.scenarioId}]`,
        );

        // Run tone guard
        const toneGuardResult = runToneGuard(response, configObj, 'app');

        // Run LLM judge
        const { system: judgeSystem, user: judgeUser } = buildJudgePrompt(
          evalScenario,
          response,
          toneGuardResult,
        );

        const { text: judgeText } = await callWithRetry(
          () => generateText({
            model: anthropic(JUDGE_MODEL),
            system: judgeSystem,
            messages: [{ role: 'user', content: judgeUser }],
          }),
          `judge[${scenario.scenarioId}]`,
        );

        // Parse judge response
        let judgeResponse: JudgeResponse;
        try {
          const cleaned = judgeText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          judgeResponse = JSON.parse(cleaned);
        } catch {
          judgeResponse = {
            dimensions: [],
            expectedBehaviorResults: [],
            forbiddenBehaviorResults: [],
            overallScore: toneGuardResult.score,
            overallPassed: toneGuardResult.allPassed,
            systemicIssues: ['Judge response parse error'],
          };
        }

        const scenarioResult = buildScenarioResult(
          evalScenario,
          response,
          judgeResponse,
          toneGuardResult,
        );

        results.push(scenarioResult);
      } catch (err) {
        results.push({
          scenarioId: scenario.scenarioId,
          score: 0,
          passed: false,
          response: '',
          dimensionScores: [],
          notes: `Error: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    }

    // 6. Aggregate and update the SAME run record (no duplicate)
    const summary = aggregateResults(results);

    await convex.mutation(api.voiceEval.updateRun, {
      id: runId,
      totalScenarios: summary.totalScenarios,
      passCount: summary.passCount,
      failCount: summary.failCount,
      averageScore: summary.averageScore,
      scoreBreakdown: summary.scoreBreakdown,
      results: results.map((r) => ({
        scenarioId: r.scenarioId,
        score: r.score,
        passed: r.passed,
        response: r.response,
        dimensionScores: r.dimensionScores.map((ds) => ({
          dimension: ds.dimension,
          score: ds.score,
          weight: ds.weight,
          passed: ds.passed,
          feedback: ds.feedback,
        })),
        notes: r.notes,
      })),
      status: 'completed',
      completedAt: Date.now(),
    });

    return NextResponse.json({
      runId,
      summary: {
        totalScenarios: summary.totalScenarios,
        passCount: summary.passCount,
        failCount: summary.failCount,
        averageScore: summary.averageScore,
        scoreBreakdown: summary.scoreBreakdown,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[voice/eval/run] error:', message);
    return NextResponse.json({ error: `Evaluation failed: ${message}` }, { status: 500 });
  }
}
