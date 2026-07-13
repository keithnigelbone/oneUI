#!/usr/bin/env node
/**
 * Parameterized QA component test runner.
 *
 * @example
 * pnpm qa:component -- icon-button
 * pnpm qa:component -- icon-button --suite=functional
 * pnpm qa:component -- icon-button --suite=a11y
 * pnpm qa:component -- --all
 * pnpm qa:component -- --list
 */
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
import {
  accessibilitySpecPath,
  functionalSpecPaths,
  getQaComponent,
  listQaComponentSlugs,
  QA_COMPONENTS,
  QA_PLAYGROUND_ROOT,
  type QaComponentEntry,
  type QaSuiteKind,
} from './qa-component-registry.mts';

const PLAYWRIGHT_CLI = join(QA_PLAYGROUND_ROOT, '../../node_modules/playwright/cli.js');
const TSX_CLI = join(QA_PLAYGROUND_ROOT, '../../node_modules/tsx/dist/cli.mjs');

type CliOptions = {
  slug?: string;
  suite: QaSuiteKind;
  ingest: boolean;
  list: boolean;
  all: boolean;
  failFast: boolean;
  openAxeReport: boolean;
};

type RunResult = {
  slug: string;
  ok: boolean;
  pwCode: number;
  ingCode: number;
};

function printUsage(): void {
  const slugs = listQaComponentSlugs().join(', ');
  console.log(`Usage: pnpm qa:component -- <slug> [options]
       pnpm qa:component -- --all [options]

  --suite=functional   Run functional (+ figma-matrix) specs only
  --suite=a11y         Run accessibility specs only
  --suite=all          Run full Playwright config (default), then ingest

  --all                Run every registered component sequentially
  --fail-fast          With --all, stop on the first failing component
  --no-ingest          Skip JSON ingest into public/qa-reports/
  --open-axe-report    Open test-results/<slug>-accessibility-axe-report.html after a11y run
  --list               List registered component slugs

Registered components: ${slugs}
`);
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    suite: 'all',
    ingest: true,
    list: false,
    all: false,
    failFast: false,
    openAxeReport: false,
  };

  const args = argv[0] === '--' ? argv.slice(1) : argv;

  for (const arg of args) {
    if (arg === '--list' || arg === '-l') {
      opts.list = true;
      continue;
    }
    if (arg === '--all') {
      opts.all = true;
      continue;
    }
    if (arg === '--fail-fast') {
      opts.failFast = true;
      continue;
    }
    if (arg === '--no-ingest') {
      opts.ingest = false;
      continue;
    }
    if (arg === '--open-axe-report') {
      opts.openAxeReport = true;
      continue;
    }
    const suiteMatch = arg.match(/^--suite=(.+)$/);
    if (suiteMatch) {
      const suite = suiteMatch[1] as QaSuiteKind;
      if (suite !== 'functional' && suite !== 'a11y' && suite !== 'all') {
        console.error(`Invalid --suite value: ${suiteMatch[1]}. Use functional, a11y, or all.`);
        process.exit(1);
      }
      opts.suite = suite;
      continue;
    }
    if (arg.startsWith('--')) {
      console.error(`Unknown option: ${arg}`);
      printUsage();
      process.exit(1);
    }
    if (!opts.slug) {
      opts.slug = arg;
      continue;
    }
    console.error(`Unexpected argument: ${arg}`);
    printUsage();
    process.exit(1);
  }

  if (opts.all && opts.slug) {
    console.error('Use either <slug> or --all, not both.');
    process.exit(1);
  }

  return opts;
}

function run(cmd: string, args: string[], env?: NodeJS.ProcessEnv): number {
  const result = spawnSync(cmd, args, {
    cwd: QA_PLAYGROUND_ROOT,
    stdio: 'inherit',
    env: { ...process.env, ...env },
    shell: false,
  });
  if (result.error) {
    console.error(result.error.message);
    return 1;
  }
  return result.status ?? 1;
}

function buildPlaywrightArgs(slug: string, entryConfig: string, suite: QaSuiteKind): string[] {
  const args = [PLAYWRIGHT_CLI, 'test', '--config', entryConfig, '--project=chromium'];

  if (suite === 'all') {
    return args;
  }

  if (suite === 'a11y') {
    const a11yPath = accessibilitySpecPath(slug);
    if (a11yPath) {
      args.push(a11yPath);
      return args;
    }
    const qaPath = `e2e/${slug}-qa.spec.ts`;
    args.push(qaPath, '--grep', 'Accessibility');
    return args;
  }

  const fnPaths = functionalSpecPaths(slug);
  if (fnPaths.length > 0) {
    args.push(...fnPaths);
    return args;
  }
  const qaPath = `e2e/${slug}-qa.spec.ts`;
  args.push(qaPath, '--grep', 'Functional|Figma');
  return args;
}

let playwrightInstallDone = false;

function ensurePlaywrightInstall(needsInstall: boolean): number {
  if (!needsInstall || playwrightInstallDone) return 0;
  const code = run('pnpm', ['run', 'playwright:install']);
  if (code === 0) playwrightInstallDone = true;
  return code;
}

function playwrightEnv(needsInstall: boolean): NodeJS.ProcessEnv | undefined {
  if (!needsInstall) return undefined;
  return { PLAYWRIGHT_BROWSERS_PATH: join(homedir(), 'Library/Caches/ms-playwright') };
}

function runPlaywright(
  slug: string,
  configFile: string,
  suite: QaSuiteKind,
  needsInstall: boolean,
): number {
  const installCode = ensurePlaywrightInstall(needsInstall);
  if (installCode !== 0) return installCode;
  const pwArgs = buildPlaywrightArgs(slug, configFile, suite);
  return run('node', pwArgs, playwrightEnv(needsInstall));
}

function runIngest(slug: string): number {
  const ingestBySlug = join(QA_PLAYGROUND_ROOT, 'scripts', 'ingest-playwright-by-slug.mts');
  return run('node', [TSX_CLI, ingestBySlug, slug]);
}

function openAxeReport(slug: string): number {
  const report = join(
    QA_PLAYGROUND_ROOT,
    'test-results',
    `${slug}-accessibility-axe-report.html`,
  );
  return run('open', [report]);
}

function runOneComponent(entry: QaComponentEntry, opts: CliOptions): RunResult {
  const { slug, configFile, needsPlaywrightInstall } = entry;

  console.log(`\n${'='.repeat(72)}`);
  console.log(`QA component: ${slug} (suite=${opts.suite})`);
  console.log('='.repeat(72));

  const pwCode = runPlaywright(slug, configFile, opts.suite, !!needsPlaywrightInstall);

  let ingCode = 0;
  if (opts.ingest && opts.suite === 'all') {
    ingCode = runIngest(slug);
  } else if (opts.ingest && opts.suite !== 'all' && !opts.all) {
    console.warn(
      `Note: ingest runs only with --suite=all (updates public/qa-reports/${slug}-summary.json). ` +
        'Re-run with --suite=all to refresh the dashboard JSON.',
    );
  }

  if (opts.openAxeReport && !opts.all) {
    const openCode = openAxeReport(slug);
    if (openCode !== 0) {
      return { slug, ok: false, pwCode, ingCode: openCode };
    }
  }

  const ok = pwCode === 0 && ingCode === 0;
  return { slug, ok, pwCode, ingCode };
}

function printBatchSummary(results: RunResult[]): void {
  const passed = results.filter((r) => r.ok);
  const failed = results.filter((r) => !r.ok);

  console.log(`\n${'='.repeat(72)}`);
  console.log('QA batch summary');
  console.log('='.repeat(72));
  console.log(`Total: ${results.length}  Passed: ${passed.length}  Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\nFailed components:');
    for (const r of failed) {
      const parts: string[] = [];
      if (r.pwCode !== 0) parts.push(`playwright=${r.pwCode}`);
      if (r.ingCode !== 0) parts.push(`ingest=${r.ingCode}`);
      console.log(`  - ${r.slug} (${parts.join(', ') || 'error'})`);
    }
  }
}

function runAllComponents(opts: CliOptions): void {
  const results: RunResult[] = [];

  for (const entry of QA_COMPONENTS) {
    const result = runOneComponent(entry, opts);
    results.push(result);

    if (!result.ok && opts.failFast) {
      printBatchSummary(results);
      process.exit(1);
    }
  }

  printBatchSummary(results);

  if (results.some((r) => !r.ok)) {
    process.exit(1);
  }
}

function main(): void {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.list) {
    for (const slug of listQaComponentSlugs()) {
      console.log(slug);
    }
    return;
  }

  if (opts.all) {
    runAllComponents(opts);
    return;
  }

  if (!opts.slug) {
    printUsage();
    process.exit(1);
  }

  const entry = getQaComponent(opts.slug);
  if (!entry) {
    console.error(`Unknown component slug: "${opts.slug}"`);
    console.error(`Known slugs: ${listQaComponentSlugs().join(', ')}`);
    process.exit(1);
  }

  const result = runOneComponent(entry, opts);
  if (!result.ok) {
    process.exit(1);
  }
}

main();
