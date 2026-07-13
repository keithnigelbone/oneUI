#!/usr/bin/env node
/**
 * Voice Evaluation Runner — CLI
 *
 * Runs Level 2 (generative) evaluation from the command line.
 *
 * Usage:
 *   pnpm eval:voice                           # Run all scenarios
 *   pnpm eval:voice --category emotion        # Filter by category
 *   pnpm eval:voice --local                   # Use local fixtures (no Convex)
 *   pnpm eval:voice --dry-run                 # Print results, don't save to Convex
 *   pnpm eval:voice --threshold 75            # Fail if average < 75
 *
 * Env vars:
 *   ANTHROPIC_API_KEY     — Required
 *   NEXT_PUBLIC_CONVEX_URL — Required unless --local --dry-run
 */

import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import {
  runToneGuard,
  buildJudgePrompt,
  buildScenarioResult,
  aggregateResults,
  compileVoiceRules,
} from '@oneui/shared';
import type {
  EvalScenario,
  EvalScenarioResult,
  JudgeResponse,
  VoiceConfig,
  ResolvedVoiceRule,
} from '@oneui/shared';

// ============================================
// CLI Args
// ============================================

const args = process.argv.slice(2);
function getArg(name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return args[idx + 1];
}
const hasFlag = (name: string) => args.includes(`--${name}`);

const category = getArg('category') ?? 'all';
const threshold = Number(getArg('threshold') ?? '70');
const isLocal = hasFlag('local');
const isDryRun = hasFlag('dry-run');

const GENERATION_MODEL = 'claude-sonnet-4-6';
const JUDGE_MODEL = 'claude-sonnet-4-6';

// ============================================
// Main
// ============================================

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Error: ANTHROPIC_API_KEY not set');
    process.exit(1);
  }

  console.log(`\nVoice Evaluation Runner`);
  console.log(`Category: ${category} | Threshold: ${threshold} | Local: ${isLocal} | Dry-run: ${isDryRun}\n`);

  // Load scenarios
  let scenarios: EvalScenario[];

  if (isLocal) {
    const fixtureData = await import(
      '../packages/shared/src/engine/__tests__/fixtures/voiceEvalScenarios.json'
    );
    scenarios = (fixtureData.default || fixtureData) as EvalScenario[];
  } else {
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      console.error('Error: NEXT_PUBLIC_CONVEX_URL not set (use --local for offline mode)');
      process.exit(1);
    }
    const { ConvexHttpClient } = await import('convex/browser');
    const { api } = await import('@oneui/convex');
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

    // Get the first active brand (or use --brand flag)
    const brandSlug = getArg('brand') ?? 'jio';
    const brand = await convex.query(api.brands.getBySlug, { slug: brandSlug });
    if (!brand) {
      console.error(`Error: Brand "${brandSlug}" not found`);
      process.exit(1);
    }

    const dbScenarios = await convex.query(api.voiceEval.listScenarios, { brandId: brand._id });
    scenarios = dbScenarios.filter((s) => s.isActive).map((s) => ({
      scenarioId: s.scenarioId,
      category: s.category,
      title: s.title,
      description: s.description,
      userMessage: s.userMessage,
      expectedBehaviors: s.expectedBehaviors,
      forbiddenBehaviors: s.forbiddenBehaviors,
      rubric: s.rubric,
      referenceAnswer: s.referenceAnswer,
    }));
  }

  // Filter by category
  if (category !== 'all') {
    scenarios = scenarios.filter((s) => s.category === category);
  }

  console.log(`Scenarios: ${scenarios.length}`);

  if (scenarios.length === 0) {
    console.log('No scenarios to evaluate.');
    process.exit(0);
  }

  // Load or build config
  const { TEST_VOICE_CONFIG } = await import(
    '../packages/shared/src/engine/__tests__/fixtures/voiceTestConfig'
  );
  const config: VoiceConfig = TEST_VOICE_CONFIG;

  // Compile a minimal voice prompt (no rules for local mode, just config)
  const resolvedRules: ResolvedVoiceRule[] = [];
  const compiled = compileVoiceRules(resolvedRules, config, 'app');

  // Run evaluation
  const results: EvalScenarioResult[] = [];
  const SCENARIO_DELAY_MS = 500;

  async function callWithRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
    let lastErr: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        const msg = err instanceof Error ? err.message : String(err);
        if (attempt < maxAttempts && /429|529|rate.?limit|overload/i.test(msg)) {
          const delay = 1000 * Math.pow(2, attempt - 1);
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
    const progress = `[${i + 1}/${scenarios.length}]`;

    // Delay between scenarios to respect rate limits
    if (i > 0) await new Promise((r) => setTimeout(r, SCENARIO_DELAY_MS));

    try {
      process.stdout.write(`${progress} ${scenario.scenarioId}... `);

      // Generate response with retry
      const { text: response } = await callWithRetry(() =>
        generateText({
          model: anthropic(GENERATION_MODEL),
          system: compiled.prompt,
          messages: [{ role: 'user', content: scenario.userMessage }],
        }),
      );

      // Run tone guard
      const toneGuardResult = runToneGuard(response, config, 'app');

      // Run LLM judge
      const { system: judgeSystem, user: judgeUser } = buildJudgePrompt(
        scenario,
        response,
        toneGuardResult,
      );

      const { text: judgeText } = await callWithRetry(() =>
        generateText({
          model: anthropic(JUDGE_MODEL),
          system: judgeSystem,
          messages: [{ role: 'user', content: judgeUser }],
        }),
      );

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
          systemicIssues: ['Judge parse error'],
        };
      }

      const result = buildScenarioResult(scenario, response, judgeResponse, toneGuardResult);
      results.push(result);

      const icon = result.passed ? '\u2705' : '\u274C';
      console.log(`${icon} ${result.score}/100`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`\u274C Error: ${msg}`);
      results.push({
        scenarioId: scenario.scenarioId,
        score: 0,
        passed: false,
        response: '',
        dimensionScores: [],
        notes: `Error: ${msg}`,
      });
    }
  }

  // Aggregate and display summary
  const summary = aggregateResults(results);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`EVALUATION SUMMARY`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total:    ${summary.totalScenarios}`);
  console.log(`Passed:   ${summary.passCount}`);
  console.log(`Failed:   ${summary.failCount}`);
  console.log(`Average:  ${summary.averageScore}/100`);
  console.log(`\nDimension Scores:`);
  for (const [dim, score] of Object.entries(summary.scoreBreakdown)) {
    console.log(`  ${dim}: ${score}/10`);
  }

  if (summary.systemicIssues.length > 0) {
    console.log(`\nSystemic Issues:`);
    for (const issue of summary.systemicIssues.slice(0, 10)) {
      console.log(`  - ${issue}`);
    }
  }

  // Save to Convex if not dry-run
  if (!isDryRun && process.env.NEXT_PUBLIC_CONVEX_URL) {
    try {
      const { ConvexHttpClient } = await import('convex/browser');
      const { api } = await import('@oneui/convex');
      const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

      const brandSlug = getArg('brand') ?? 'jio';
      const brand = await convex.query(api.brands.getBySlug, { slug: brandSlug });
      if (brand) {
        await convex.mutation(api.voiceEval.createRun, {
          brandId: brand._id,
          name: `CLI Eval ${new Date().toISOString().slice(0, 16)}`,
          rulesVersion: Date.now(),
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
          startedAt: Date.now(),
          completedAt: Date.now(),
        });
        console.log('\nResults saved to Convex.');
      }
    } catch (err) {
      console.error('\nFailed to save results to Convex:', err);
    }
  }

  // Exit with error if below threshold
  if (summary.averageScore < threshold) {
    console.log(`\nFAILED: Average score ${summary.averageScore} is below threshold ${threshold}`);
    process.exit(1);
  }

  console.log(`\nPASSED: Average score ${summary.averageScore} meets threshold ${threshold}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
