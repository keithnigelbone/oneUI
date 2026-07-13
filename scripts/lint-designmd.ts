#!/usr/bin/env node
/**
 * lint-designmd.ts
 *
 * CI lint for the DESIGN.md exporter. Generates a deterministic DESIGN.md
 * for a handful of representative brand hue/chroma fixtures, pipes each
 * through `@google/design.md lint`, and fails on any `error` severity.
 *
 * Fixture-based (no live Convex) so CI stays hermetic — catches exporter
 * regressions like broken token references, section order drift, or YAML
 * syntax breaks. Per-brand lints using live data live in Convex actions,
 * not here.
 *
 * Run: `pnpm lint:designmd`
 */

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  serializeBrandToDesignMd,
  type DesignMdSkill,
} from '../packages/shared/src/engine/compositionDesignMdExporter';
import { buildSeedRules } from '../packages/shared/src/engine/compositionSeedRules';

interface LintFinding {
  severity: 'error' | 'warning' | 'info';
  path?: string;
  message: string;
}

interface LintResult {
  findings: LintFinding[];
  summary?: { errors: number; warnings: number; infos: number };
}

const FIXTURES = [
  {
    name: 'Jio',
    slug: 'jio',
    description: 'India digital-life platform.',
    primaryHue: 220,
    primaryChroma: 0.17,
    secondaryHue: 240,
    secondaryChroma: 0.02,
  },
  {
    name: 'Tira',
    slug: 'tira',
    description: 'Premium beauty retail.',
    primaryHue: 340,
    primaryChroma: 0.12,
    secondaryHue: 20,
    secondaryChroma: 0.04,
  },
  {
    name: 'Neutral',
    slug: 'neutral',
    description: 'Chroma-locked neutral preset.',
    primaryHue: 220,
    primaryChroma: 0.02,
    secondaryHue: 220,
    secondaryChroma: 0.02,
  },
];

/**
 * Two committed skill fixtures — one pattern, one screen — so the linter
 * exercises the `## Skills` section emitter (recipe excerpt, contexts list,
 * front-matter manifest entry) instead of seeing an empty skills array.
 *
 * Vocab here is intentionally canonical (`bold` / `subtle`); regressions in
 * `compositionSkills.ts` or seed prose surface during local dev via
 * `pnpm check:ai-vocab`, not via this lint.
 */
const SKILL_FIXTURES: DesignMdSkill[] = [
  {
    skillId: 'hero-section',
    name: 'Hero Section',
    description: 'Full-width hero with bold surface, headline, and CTA.',
    category: 'pattern',
    applicableContexts: ['mobile-app', 'web-app', 'marketing-page'],
    archetype: 'hero',
    systemPromptTemplate:
      'Generate a {vertical} hero for {brand}. Wrap in <Surface mode="bold">. Use Display-L headline and a single primary bold CTA.',
  },
  {
    skillId: 'dashboard-grid',
    name: 'Dashboard Grid',
    description: 'Data dashboard with metric cards and quick actions.',
    category: 'screen',
    applicableContexts: ['web-app', 'mobile-app'],
    archetype: 'dashboard',
    systemPromptTemplate:
      'Generate a {vertical} dashboard for {brand}. Default surface throughout. Use <Surface mode="minimal"> for grouped metric cards.',
  },
];

const SEED_RULES = buildSeedRules();

function runLint(filePath: string, dumpDir: string): Promise<LintResult> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn('npx', ['--yes', '@google/design.md', 'lint', filePath], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    child.stdout.on('data', (c: Buffer) => stdoutChunks.push(c));
    child.stderr.on('data', (c: Buffer) => stderrChunks.push(c));
    child.on('error', reject);
    child.on('close', (code) => {
      const stdout = Buffer.concat(stdoutChunks).toString('utf8');
      const stderr = Buffer.concat(stderrChunks).toString('utf8');
      if (code !== 0) {
        reject(new Error(`design.md lint CLI exited ${code} for ${filePath}: ${stderr}`));
        return;
      }
      try {
        resolvePromise(JSON.parse(stdout) as LintResult);
      } catch (err) {
        // Dump full stdout so CI can diagnose malformed lint output without rerunning.
        const dumpPath = join(dumpDir, 'lint-stdout-dump.txt');
        writeFileSync(dumpPath, stdout, 'utf8');
        reject(
          new Error(
            `design.md lint emitted non-JSON stdout for ${filePath}: ${(err as Error).message}\nFull stdout written to ${dumpPath}`,
          ),
        );
      }
    });
  });
}

function formatFinding(finding: LintFinding): string {
  const where = finding.path ? ` [${finding.path}]` : '';
  return `  ${finding.severity.toUpperCase()}${where}: ${finding.message}`;
}

async function main(): Promise<number> {
  const outDir = join(tmpdir(), `designmd-lint-${process.pid}`);
  mkdirSync(outDir, { recursive: true });

  // Generate + lint each fixture in parallel — three independent subprocesses,
  // each paying ~1–2s of npx startup, so this saves ~4s/CI run vs. sequential.
  const lintsByFixture = await Promise.all(
    FIXTURES.map(async (fixture) => {
      const md = serializeBrandToDesignMd({
        brand: fixture,
        rules: SEED_RULES,
        skills: SKILL_FIXTURES,
        defaultContext: 'mobile-app',
        vertical: 'general',
      });
      const filePath = resolve(outDir, `${fixture.slug}.DESIGN.md`);
      writeFileSync(filePath, md, 'utf8');
      const lint = await runLint(filePath, outDir);
      return { fixture, mdLength: md.length, lint };
    }),
  );

  let totalErrors = 0;
  let totalWarnings = 0;
  let totalInfos = 0;
  for (const { fixture, mdLength, lint } of lintsByFixture) {
    const errors = lint.findings.filter((f) => f.severity === 'error');
    const warnings = lint.findings.filter((f) => f.severity === 'warning');
    const infos = lint.findings.filter((f) => f.severity === 'info');
    totalErrors += errors.length;
    totalWarnings += warnings.length;
    totalInfos += infos.length;
    // eslint-disable-next-line no-console
    console.log(`→ ${fixture.name} (${mdLength} chars)`);
    for (const e of errors) console.error(formatFinding(e));
    for (const w of warnings) console.warn(formatFinding(w));
  }

  // eslint-disable-next-line no-console
  console.log(
    `\nresult: ${totalErrors} errors, ${totalWarnings} warnings, ${totalInfos} infos across ${FIXTURES.length} fixture(s).`,
  );

  return totalErrors === 0 ? 0 : 1;
}

main().then(
  (code) => process.exit(code),
  (err) => {
    // eslint-disable-next-line no-console
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  },
);
