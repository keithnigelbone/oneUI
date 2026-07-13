#!/usr/bin/env node
/**
 * Seed Voice Eval Scenarios — One-time Convex hydration
 *
 * Reads voiceEvalScenarios.json and inserts each scenario into Convex.
 *
 * Usage:
 *   pnpm seed:voice:eval --brand jio
 *
 * Env vars:
 *   NEXT_PUBLIC_CONVEX_URL — Required
 */

import { ConvexHttpClient } from 'convex/browser';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import scenarios from '../packages/shared/src/engine/__tests__/fixtures/voiceEvalScenarios.json';

const args = process.argv.slice(2);
function getArg(name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 ? args[idx + 1] : undefined;
}

async function main() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.error('Error: NEXT_PUBLIC_CONVEX_URL not set');
    process.exit(1);
  }

  const brandSlug = getArg('brand') ?? 'jio';
  const convex = new ConvexHttpClient(convexUrl);

  // Look up brand
  const brand = await convex.query(api.brands.getBySlug, { slug: brandSlug });
  if (!brand) {
    console.error(`Error: Brand "${brandSlug}" not found`);
    process.exit(1);
  }

  const brandId = brand._id as Id<'brands'>;
  console.log(`Seeding ${scenarios.length} scenarios for brand "${brandSlug}" (${brandId})\n`);

  // Check existing scenarios
  const existing = await convex.query(api.voiceEval.listScenarios, { brandId });
  const existingIds = new Set(existing.map((s) => s.scenarioId));

  let created = 0;
  let skipped = 0;

  for (const scenario of scenarios) {
    if (existingIds.has(scenario.scenarioId)) {
      console.log(`  Skip: ${scenario.scenarioId} (already exists)`);
      skipped++;
      continue;
    }

    await convex.mutation(api.voiceEval.createScenario, {
      brandId,
      scenarioId: scenario.scenarioId,
      category: scenario.category,
      title: scenario.title,
      description: (scenario as { description?: string }).description ?? scenario.title,
      userMessage: scenario.userMessage,
      expectedBehaviors: scenario.expectedBehaviors,
      forbiddenBehaviors: scenario.forbiddenBehaviors,
      rubric: scenario.rubric,
      referenceAnswer: scenario.referenceAnswer,
      isActive: true,
    });

    console.log(`  Add:  ${scenario.scenarioId}`);
    created++;
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
