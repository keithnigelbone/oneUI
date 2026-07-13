#!/usr/bin/env node
/**
 * generate-design-md.ts
 *
 * Emits a baseline DESIGN.md per context to
 * `apps/platform/src/generated/design-md/<context>.md`.
 *
 * This is the offline/default manifest — uses seed rules + the full component
 * registry, with no brand-specific overrides and no active skills. Production
 * per-brand manifests should be assembled at request time by the `/api/brand/
 * [slug]/design.md` endpoint from Convex data.
 *
 * Run: `pnpm tsx scripts/generate-design-md.ts`
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildSeedRules,
  getDefaultCompositionConfig,
} from '@oneui/shared/engine';
import type { CompositionContext } from '@oneui/shared/engine';
import { generateDesignManifest } from '@oneui/shared/meta';
import { ALL_COMPONENT_METAS } from '@oneui/ui/registry/metaRegistry';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');

const CONTEXTS: CompositionContext[] = [
  'mobile-app',
  'web-app',
  'marketing-page',
  'social-post',
  'print',
  'outdoor',
];

function main() {
  const outDir = resolve(REPO_ROOT, 'apps/platform/src/generated/design-md');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const config = getDefaultCompositionConfig();
  const rules = buildSeedRules();
  // Frozen timestamp so CI can detect stale output without timestamp churn.
  const now = new Date('2026-01-01T00:00:00.000Z');

  for (const context of CONTEXTS) {
    const md = generateDesignManifest({
      brandName: 'One UI (baseline)',
      config,
      rules,
      skills: [],
      components: ALL_COMPONENT_METAS,
      context,
      now,
    });
    const outPath = resolve(outDir, `${context}.md`);
    writeFileSync(outPath, md, 'utf8');
    console.log(`  → ${outPath} (${md.length} chars)`);
  }

  // Also emit an all-contexts baseline used as a single-file drop-in.
  const md = generateDesignManifest({
    brandName: 'One UI (baseline)',
    config,
    rules,
    skills: [],
    components: ALL_COMPONENT_METAS,
    now,
  });
  const outPath = resolve(outDir, 'default.md');
  writeFileSync(outPath, md, 'utf8');
  console.log(`  → ${outPath} (${md.length} chars)`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
