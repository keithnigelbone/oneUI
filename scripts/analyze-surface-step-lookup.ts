#!/usr/bin/env tsx
/**
 * Phase 0 — Surface step-lookup CSS analysis (RFC measurability spike).
 *
 * For each of the 8 `verify-theme-redundancy` fixtures, generates step-lookup CSS
 * (`generateNewStepLookupCSS`) and reports declaration/rule counts, stepSet
 * histograms, gzip/brotli bytes, distinct hex count, and Approach B grouping
 * projections (distinct (token,value) pairs, projected rule count).
 *
 * Ref: `surface_lookup_css_optimization_architecture.md` §1, §4, §7 Q1
 *
 * Usage:
 *   pnpm analyze:surface-step-lookup
 *   pnpm analyze:surface-step-lookup --json
 *   pnpm analyze:surface-step-lookup --fixture=jio-default
 *   pnpm analyze:surface-step-lookup --sample=200 --seed=42
 *   pnpm analyze:surface-step-lookup --sample=100 --with-fixtures
 */

import { brotliCompressSync, gzipSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import { generateNewStepLookupCSS } from '@oneui/ui/engine';

import {
  BRANDS,
  buildConvexLikePalette,
  buildFixturePalette,
  randomConvexLikeParams,
} from './verify-theme-redundancy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');

const args = process.argv.slice(2);
const JSON_ONLY = args.includes('--json');
function getArg(name: string): string | undefined {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  if (hit) return hit.slice(name.length + 3);
  return undefined;
}
const FIXTURE_FILTER = getArg('fixture')?.trim().toLowerCase();

const SAMPLE_COUNT_RAW = getArg('sample');
const SAMPLE_COUNT =
  SAMPLE_COUNT_RAW !== undefined ? Math.max(0, parseInt(SAMPLE_COUNT_RAW, 10) || 0) : 0;
const SEED_RAW = getArg('seed');
const SAMPLE_SEED = SEED_RAW !== undefined ? parseInt(SEED_RAW, 10) || 0 : 42;
const WITH_FIXTURES = args.includes('--with-fixtures');

function numericStats(nums: number[]):
  | { min: number; max: number; mean: number; std: number }
  | undefined {
  if (nums.length === 0) return undefined;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const variance = nums.reduce((s, n) => s + (n - mean) ** 2, 0) / nums.length;
  return {
    min,
    max,
    mean: Number(mean.toFixed(4)),
    std: Number(Math.sqrt(variance).toFixed(4)),
  };
}

// ---------------------------------------------------------------------------
// Parse Option-C step lookup CSS into theme-agnostic / light / dark sections
// ---------------------------------------------------------------------------

type SectionKind = 'themeAgnostic' | 'themeLight' | 'themeDark';

interface ParsedBlock {
  kind: SectionKind;
  step: number;
  decls: Map<string, string>;
}

function parseSectionBlocks(css: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const blockEnd = String.raw`\r?\n  \}`;

  const agnosticRe = new RegExp(
    String.raw`  \[data-surface-step="(\d+)"\] \{([\s\S]*?)${blockEnd}`,
    'g',
  );
  const lightRe = new RegExp(
    String.raw`  \[data-theme="light"\] \[data-surface-step="(\d+)"\] \{([\s\S]*?)${blockEnd}`,
    'g',
  );
  const darkRe = new RegExp(
    String.raw`  \[data-theme="dark"\] \[data-surface-step="(\d+)"\] \{([\s\S]*?)${blockEnd}`,
    'g',
  );

  for (const m of css.matchAll(agnosticRe)) {
    blocks.push({
      kind: 'themeAgnostic',
      step: Number(m[1]),
      decls: parseDeclLines(m[2]),
    });
  }
  for (const m of css.matchAll(lightRe)) {
    blocks.push({
      kind: 'themeLight',
      step: Number(m[1]),
      decls: parseDeclLines(m[2]),
    });
  }
  for (const m of css.matchAll(darkRe)) {
    blocks.push({
      kind: 'themeDark',
      step: Number(m[1]),
      decls: parseDeclLines(m[2]),
    });
  }
  return blocks;
}

function parseDeclLines(body: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('/*')) continue;
    const m = line.match(/^(--[\w-]+):\s*(.+?);?\s*$/);
    if (m) out.set(m[1], m[2].trim());
  }
  return out;
}

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

function countDistinctHex(css: string): number {
  const set = new Set<string>();
  const re = /#[0-9a-fA-F]{3,8}\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) set.add(m[0].toLowerCase());
  return set.size;
}

interface SectionMetrics {
  ruleCount: number;
  declarationCount: number;
}

function summarizeBlocks(blocks: ParsedBlock[], kind: SectionKind): SectionMetrics {
  const filtered = blocks.filter((b) => b.kind === kind);
  let decls = 0;
  for (const b of filtered) decls += b.decls.size;
  return { ruleCount: filtered.length, declarationCount: decls };
}

/** Build (token, value) -> Set<step> for theme-agnostic blocks only. */
function buildAgnosticPairSteps(blocks: ParsedBlock[]): Map<string, Set<number>> {
  const pairSteps = new Map<string, Set<number>>();
  for (const b of blocks) {
    if (b.kind !== 'themeAgnostic') continue;
    for (const [token, value] of b.decls) {
      const key = `${token}\n${value}`;
      let set = pairSteps.get(key);
      if (!set) {
        set = new Set<number>();
        pairSteps.set(key, set);
      }
      set.add(b.step);
    }
  }
  return pairSteps;
}

function canonicalStepSetKey(steps: Set<number>): string {
  return [...steps].sort((a, b) => a - b).join(',');
}

interface GroupingProjection {
  /** Distinct (token, value) pairs in theme-agnostic blocks — equals declarations after Approach B for that section. */
  distinctTokenValuePairs: number;
  /** Distinct step-set patterns (unique subsets of steps) — projected rule count for agnostic after B (one rule per pattern, co-located tokens). */
  projectedRuleCount: number;
  /**
   * Distinct **patterns** (unique step subsets) bucketed by |stepSet| — matches architecture §1 table
   * “stepSet size | # distinct stepSets”.
   */
  distinctPatternsByCardinality: Record<string, number>;
  /** (token, value) pairs bucketed by footprint size |stepSet|. */
  tokenValuePairsByFootprintSize: Record<string, number>;
  /** How many (token, value) pairs have full-universe step coverage (B.1 `:root` candidates). */
  pairsWithFullStepCoverage: number;
  distinctStepValues: number;
}

function projectionFromAgnostic(blocks: ParsedBlock[]): GroupingProjection {
  const agnostic = blocks.filter((b) => b.kind === 'themeAgnostic');
  const stepsPresent = new Set(agnostic.map((b) => b.step));
  const universeSize = stepsPresent.size;

  const pairSteps = buildAgnosticPairSteps(blocks);
  const distinctTokenValuePairs = pairSteps.size;

  const uniquePatterns = new Map<string, Set<number>>();
  const pairsBySize: Record<string, number> = {};
  let fullCoverage = 0;

  const expectedUniverseKey =
    universeSize > 0 ? [...stepsPresent].sort((a, b) => a - b).join(',') : '';

  for (const [, steps] of pairSteps) {
    const key = canonicalStepSetKey(steps);
    uniquePatterns.set(key, steps);
    const ck = String(steps.size);
    pairsBySize[ck] = (pairsBySize[ck] ?? 0) + 1;
    if (universeSize > 0 && key === expectedUniverseKey) fullCoverage += 1;
  }

  const distinctPatternsByCardinality: Record<string, number> = {};
  for (const [, steps] of uniquePatterns) {
    const k = String(steps.size);
    distinctPatternsByCardinality[k] = (distinctPatternsByCardinality[k] ?? 0) + 1;
  }

  const projectedRuleCount = uniquePatterns.size;

  return {
    distinctTokenValuePairs,
    projectedRuleCount,
    distinctPatternsByCardinality,
    tokenValuePairsByFootprintSize: pairsBySize,
    pairsWithFullStepCoverage: fullCoverage,
    distinctStepValues: universeSize,
  };
}

interface FixtureReport {
  fixture: string;
  bytes: { utf8: number; gzip: number; brotli: number };
  compressionRatio: { gzipPct: string; brotliPct: string };
  distinctHexValues: number;
  rules: {
    themeAgnostic: number;
    themeLight: number;
    themeDark: number;
    total: number;
  };
  declarations: {
    themeAgnostic: number;
    themeLight: number;
    themeDark: number;
    total: number;
  };
  /** Whole-file distinct (token, value) — string key token\nvalue */
  distinctTokenValuePairsWholeFile: number;
  groupingProjectionThemeAgnostic: GroupingProjection;
  /** Declaration reduction if agnostic-only dedup: 1 - distinctPairs / agnosticDecls */
  declarationReductionAgnosticPct: string;
  /** Architecture doc compares total decls vs global distinct pairs */
  declarationReductionVsDistinctPairsPct: string;
  cssomEstimate: {
    current: { styleRules: number; declarations: number };
    projectedApproachB: {
      /** Sum of distinct step-set patterns per section (agnostic + light + dark overlays). */
      styleRules: number;
      /** Whole-file distinct (token, value); equals declaration count after lossless dedup. */
      declarationsDistinctPairs: number;
      projectedRulesBySection: { themeAgnostic: number; themeLight: number; themeDark: number };
    };
  };
}

function projectedRulesForSection(blocks: ParsedBlock[], kind: SectionKind): number {
  const pairSteps = new Map<string, Set<number>>();
  for (const b of blocks) {
    if (b.kind !== kind) continue;
    for (const [token, value] of b.decls) {
      const key = `${token}\n${value}`;
      let set = pairSteps.get(key);
      if (!set) {
        set = new Set<number>();
        pairSteps.set(key, set);
      }
      set.add(b.step);
    }
  }
  const patterns = new Set<string>();
  for (const [, steps] of pairSteps) patterns.add(canonicalStepSetKey(steps));
  return patterns.size;
}

function buildFixtureReport(name: string, css: string, blocks: ParsedBlock[]): FixtureReport {
  const utf8 = Buffer.byteLength(css, 'utf8');
  const gzip = gzipSync(Buffer.from(css, 'utf8')).length;
  const brotli = brotliCompressSync(Buffer.from(css, 'utf8')).length;

  const sa = summarizeBlocks(blocks, 'themeAgnostic');
  const sl = summarizeBlocks(blocks, 'themeLight');
  const sd = summarizeBlocks(blocks, 'themeDark');

  const pairGlobal = new Set<string>();
  for (const b of blocks) {
    for (const [t, v] of b.decls) pairGlobal.add(`${t}\n${v}`);
  }

  const proj = projectionFromAgnostic(blocks);

  const declTotal = sa.declarationCount + sl.declarationCount + sd.declarationCount;
  const distinctGlobal = pairGlobal.size;

  const redAgn =
    sa.declarationCount > 0
      ? (100 * (1 - proj.distinctTokenValuePairs / sa.declarationCount)).toFixed(2)
      : '0.00';
  const redVsDistinct =
    declTotal > 0 ? (100 * (1 - distinctGlobal / declTotal)).toFixed(2) : '0.00';

  const prAgn = proj.projectedRuleCount;
  const prLight = projectedRulesForSection(blocks, 'themeLight');
  const prDark = projectedRulesForSection(blocks, 'themeDark');

  return {
    fixture: name,
    bytes: { utf8, gzip, brotli },
    compressionRatio: {
      gzipPct: ((gzip / utf8) * 100).toFixed(1),
      brotliPct: ((brotli / utf8) * 100).toFixed(1),
    },
    distinctHexValues: countDistinctHex(css),
    rules: {
      themeAgnostic: sa.ruleCount,
      themeLight: sl.ruleCount,
      themeDark: sd.ruleCount,
      total: sa.ruleCount + sl.ruleCount + sd.ruleCount,
    },
    declarations: {
      themeAgnostic: sa.declarationCount,
      themeLight: sl.declarationCount,
      themeDark: sd.declarationCount,
      total: declTotal,
    },
    distinctTokenValuePairsWholeFile: distinctGlobal,
    groupingProjectionThemeAgnostic: proj,
    declarationReductionAgnosticPct: redAgn,
    declarationReductionVsDistinctPairsPct: redVsDistinct,
    cssomEstimate: {
      current: { styleRules: sa.ruleCount + sl.ruleCount + sd.ruleCount, declarations: declTotal },
      projectedApproachB: {
        styleRules: prAgn + prLight + prDark,
        declarationsDistinctPairs: distinctGlobal,
        projectedRulesBySection: {
          themeAgnostic: prAgn,
          themeLight: prLight,
          themeDark: prDark,
        },
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const reports: FixtureReport[] = [];

const runNamedFixtures = SAMPLE_COUNT === 0 || WITH_FIXTURES;
if (runNamedFixtures) {
  for (const b of BRANDS) {
    if (FIXTURE_FILTER && b.name.toLowerCase() !== FIXTURE_FILTER) continue;
    const palette = buildFixturePalette(b);
    const css = generateNewStepLookupCSS(palette);
    const blocks = parseSectionBlocks(css);
    reports.push(buildFixtureReport(b.name, css, blocks));
  }
}

if (SAMPLE_COUNT > 0) {
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const p = randomConvexLikeParams(i, SAMPLE_SEED);
    const palette = buildConvexLikePalette(p);
    const css = generateNewStepLookupCSS(palette);
    const blocks = parseSectionBlocks(css);
    reports.push(buildFixtureReport(p.name, css, blocks));
  }
}

const analysisMode =
  SAMPLE_COUNT > 0 ? (WITH_FIXTURES ? 'fixtures+random' : 'random') : 'fixtures';

const outDir = resolve(REPO_ROOT, 'temp', 'surface-step-lookup-analysis');
mkdirSync(outDir, { recursive: true });
const outPath = resolve(outDir, 'report.json');
const summary = {
  generatedAt: new Date().toISOString(),
  analysisMode,
  seed: SAMPLE_COUNT > 0 ? SAMPLE_SEED : undefined,
  randomSampleCount: SAMPLE_COUNT > 0 ? SAMPLE_COUNT : undefined,
  withFixtures: SAMPLE_COUNT > 0 ? WITH_FIXTURES : undefined,
  fixtureCount: reports.length,
  fixtures: reports,
  aggregate:
    reports.length === 0
      ? {}
      : {
          declarationReductionVsDistinctPairsPct: numericStats(
            reports.map((r) => Number(r.declarationReductionVsDistinctPairsPct)),
          ),
          declarationReductionAgnosticPct: numericStats(
            reports.map((r) => Number(r.declarationReductionAgnosticPct)),
          ),
          bytesUtf8: numericStats(reports.map((r) => r.bytes.utf8)),
          declarationsTotal: numericStats(reports.map((r) => r.declarations.total)),
          distinctTokenValuePairsWholeFile: numericStats(
            reports.map((r) => r.distinctTokenValuePairsWholeFile),
          ),
          projectedRulesApproachBTotal: numericStats(
            reports.map((r) => r.cssomEstimate.projectedApproachB.styleRules),
          ),
        },
};

writeFileSync(outPath, JSON.stringify(summary, null, 2), 'utf8');

if (!JSON_ONLY) {
  const omitPerFixture =
    SAMPLE_COUNT > 12 || (reports.length > 16 && SAMPLE_COUNT > 0);
  console.log(`Surface step-lookup analysis — ${reports.length} report(s) (${analysisMode})\n`);
  if (SAMPLE_COUNT > 0) {
    console.log(`  seed=${SAMPLE_SEED}  randomSamples=${SAMPLE_COUNT}${WITH_FIXTURES ? '  +8 fixtures' : ''}`);
  }
  console.log(`JSON written: ${outPath}\n`);
  if (omitPerFixture) {
    console.log(
      '(Per-fixture lines omitted — large run. Inspect report.json or use --fixture / smaller --sample.)\n',
    );
  } else {
    console.log('--- Per fixture (key RFC metrics) ---\n');
    for (const r of reports) {
      const p = r.groupingProjectionThemeAgnostic;
      console.log(`${r.fixture}`);
      console.log(
        `  bytes utf8=${r.bytes.utf8} gzip=${r.bytes.gzip} (${r.compressionRatio.gzipPct}%) brotli=${r.bytes.brotli} (${r.compressionRatio.brotliPct}%)`,
      );
      console.log(`  distinct hex=${r.distinctHexValues}`);
      console.log(
        `  rules: agnostic=${r.rules.themeAgnostic} light=${r.rules.themeLight} dark=${r.rules.themeDark} total=${r.rules.total}`,
      );
      console.log(
        `  declarations: agnostic=${r.declarations.themeAgnostic} light=${r.declarations.themeLight} dark=${r.declarations.themeDark} total=${r.declarations.total}`,
      );
      console.log(`  distinct (token,value) whole file=${r.distinctTokenValuePairsWholeFile}`);
      console.log(
        `  agnostic distinct pairs=${p.distinctTokenValuePairs} | projected rules (B)=${p.projectedRuleCount} | step universe=${p.distinctStepValues}`,
      );
      console.log(
        `  reduction: agnostic-only dedup=${r.declarationReductionAgnosticPct}% | vs whole-file distinct pairs=${r.declarationReductionVsDistinctPairsPct}%`,
      );
      console.log(`  pairs with full ${p.distinctStepValues}-step coverage (B.1 candidates)=${p.pairsWithFullStepCoverage}`);
      console.log(
        `  projected rules (B): agnostic=${r.cssomEstimate.projectedApproachB.projectedRulesBySection.themeAgnostic} light=${r.cssomEstimate.projectedApproachB.projectedRulesBySection.themeLight} dark=${r.cssomEstimate.projectedApproachB.projectedRulesBySection.themeDark} total=${r.cssomEstimate.projectedApproachB.styleRules}`,
      );
      console.log('');
    }
  }
  console.log(`--- Aggregate (${reports.length} reports) ---`);
  console.log(JSON.stringify(summary.aggregate, null, 2));
}

if (JSON_ONLY) {
  console.log(JSON.stringify(summary, null, 2));
}
