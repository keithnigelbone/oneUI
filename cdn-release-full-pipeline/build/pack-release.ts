/**
 * pack-release.ts — build every publishable package and produce renamed
 * tarballs under `release/tarballs/`.
 *
 * Pipeline:
 *   1. Build each publishable workspace package.
 *   2. For @oneui/ui specifically: prepend `packages/ui/foundation.css` to
 *      `packages/ui/dist/ui.css` (Cut #1 from PLAN-v3-clean.md — single CSS
 *      import for consumers; foundation must have been produced by
 *      `pnpm build:foundation` upstream, or use `pnpm pack:all` to chain).
 *   3. Stage each package into `release/staging/<slug>/` with a rewritten
 *      package.json (name → `@jds4/oneui-*`, workspace deps inlined or
 *      mapped, devDeps/scripts/private stripped).
 *   4. Run `npm pack` in each staging dir → `release/tarballs/*.tgz`.
 *   5. Print SHA256s + sizes.
 *
 * Source repo is never modified — staging is a pure copy + manifest rewrite.
 *
 * Run `pnpm pack:all` (orchestrator) to chain foundation + brand-css +
 * jio-bootstrap + this script. Run `pnpm pack:release` to run just this
 * file (when foundation.css already exists).
 */

import {
  writeFileSync, readFileSync, existsSync, mkdirSync, rmSync,
} from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { PUBLISHABLE_PACKAGES } from './publishConfig';
import { stagePackage, printSummary, formatBytes, type StagedTarball } from './stagePackage';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const RELEASE_DIR = join(ROOT, 'release');

const FOUNDATION_CSS = join(ROOT, 'packages/ui/foundation.css');
const UI_DIST_CSS = join(ROOT, 'packages/ui/dist/ui.css');

function run(cmd: string, cwd: string): void {
  console.log(`$ ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

/**
 * Cut #1 from PLAN-v3-clean.md — prepend foundation tokens onto the
 * component CSS bundle so consumers do exactly one CSS import.
 *
 * Idempotent: detects the marker comment from a prior run and bails so
 * re-running pack:release on an already-prepended dist doesn't double up.
 */
function prependFoundationOntoUiCss(): void {
  if (!existsSync(FOUNDATION_CSS)) {
    throw new Error(
      `Missing ${FOUNDATION_CSS}. Run build-foundation-css.ts first, or use pnpm pack:all.`,
    );
  }
  if (!existsSync(UI_DIST_CSS)) {
    throw new Error(`Missing ${UI_DIST_CSS}. The @oneui/ui build did not produce dist/ui.css.`);
  }
  const foundation = readFileSync(FOUNDATION_CSS, 'utf8');
  const components = readFileSync(UI_DIST_CSS, 'utf8');
  const marker = '/* OneUI foundation CSS — brand-invariant tokens. */';
  if (components.startsWith('/* OneUI foundation CSS')) {
    console.log(`  ✓ ui.css already has prepended foundation (${formatBytes(components.length)})`);
    return;
  }
  const combined = `${marker}\n${foundation}\n/* ── component CSS Modules ── */\n${components}`;
  writeFileSync(UI_DIST_CSS, combined);
  console.log(
    `  ✓ prepended foundation.css (${formatBytes(foundation.length)}) → dist/ui.css `
    + `(${formatBytes(combined.length)})`,
  );
}

const UI_ROOT = join(ROOT, 'packages/ui');
const UI_JIO_TS = join(UI_ROOT, 'cdn-bootstrap/jio.ts');
const UI_DIST_BRAND_LOADER = join(UI_ROOT, 'dist/brand-loader.mjs');
const UI_DIST_JIO = join(UI_ROOT, 'dist/cdn-bootstrap/jio.mjs');
const UI_DIST_JIO_LOADER = join(UI_ROOT, 'dist/cdn-bootstrap/jio-loader.mjs');

/**
 * Ensures brand-loader + cdn-bootstrap dist artifacts exist after @oneui/ui build.
 * Vite should emit these via lib entries; esbuild is a fallback when jio.ts was
 * baked but Vite did not emit one of the outputs.
 */
function ensureUiBrandDistArtifacts(): void {
  if (!existsSync(UI_JIO_TS)) {
    console.warn(
      '  ⚠ packages/ui/cdn-bootstrap/jio.ts is missing — run `pnpm pack:all` (bake step) '
      + 'before publishing. No-plugin Jio fallback will be incomplete.',
    );
  }

  const needsFallback = !existsSync(UI_DIST_JIO)
    || !existsSync(UI_DIST_JIO_LOADER)
    || !existsSync(UI_DIST_BRAND_LOADER);
  if (!needsFallback) {
    console.log('  ✓ brand-loader + cdn-bootstrap dist artifacts present');
    return;
  }

  if (!existsSync(UI_JIO_TS)) {
    throw new Error(
      `Missing ${UI_JIO_TS}. Run bake-jio-fallback (pnpm pack:all) before pack:release.`,
    );
  }

  console.log('  ↻ compiling missing brand-loader / cdn-bootstrap dist via esbuild …');
  mkdirSync(join(UI_ROOT, 'dist/cdn-bootstrap'), { recursive: true });

  const esbuildCmd = (entry: string, outfile: string) =>
    `pnpm exec esbuild ${entry} --bundle --format=esm --platform=neutral --outfile=${outfile} `
    + `--tsconfig=${join(UI_ROOT, 'tsconfig.json')}`;

  if (!existsSync(UI_DIST_JIO)) {
    run(esbuildCmd('cdn-bootstrap/jio.ts', 'dist/cdn-bootstrap/jio.mjs'), UI_ROOT);
    run(
      `pnpm exec esbuild cdn-bootstrap/jio.ts --bundle --format=cjs --platform=neutral `
      + `--outfile=dist/cdn-bootstrap/jio.cjs --tsconfig=tsconfig.json`,
      UI_ROOT,
    );
  }
  if (!existsSync(UI_DIST_JIO_LOADER)) {
    run(
      esbuildCmd('cdn-bootstrap/jio-loader.ts', 'dist/cdn-bootstrap/jio-loader.mjs'),
      UI_ROOT,
    );
    run(
      `pnpm exec esbuild cdn-bootstrap/jio-loader.ts --bundle --format=cjs --platform=neutral `
      + `--outfile=dist/cdn-bootstrap/jio-loader.cjs --tsconfig=tsconfig.json`,
      UI_ROOT,
    );
  }
  if (!existsSync(UI_DIST_BRAND_LOADER)) {
    run(esbuildCmd('src/brand-loader.ts', 'dist/brand-loader.mjs'), UI_ROOT);
    run(
      `pnpm exec esbuild src/brand-loader.ts --bundle --format=cjs --platform=neutral `
      + `--outfile=dist/brand-loader.cjs --tsconfig=tsconfig.json`,
      UI_ROOT,
    );
  }
}

function main(): void {
  // Reset release/ each run — old tarballs from previous versions would
  // be confusing in CI logs and easy to upload by accident.
  if (existsSync(RELEASE_DIR)) rmSync(RELEASE_DIR, { recursive: true });
  mkdirSync(RELEASE_DIR, { recursive: true });

  // ── 1. Build each publishable package ────────────────────────────────────
  for (const pkg of PUBLISHABLE_PACKAGES) {
    const pkgRoot = join(ROOT, pkg.packageDir);
    if (!existsSync(join(pkgRoot, 'package.json'))) {
      // stagePackage will warn-and-skip later; no need to attempt a build.
      continue;
    }
    // Skip the build step if the package has no `build` script (some future
    // workspace packages — e.g. icons-jio JSON-only — may not need one).
    const sourcePkgJson = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8')) as {
      scripts?: Record<string, string>;
    };
    if (!sourcePkgJson.scripts?.build) {
      console.log(`\n→ ${pkg.sourceName}: no build script, using source files as-is`);
      continue;
    }
    console.log(`\n→ Building ${pkg.sourceName} …`);
    run(`pnpm --filter ${pkg.sourceName} build`, ROOT);
  }

  // ── 2. Cut #1: prepend foundation onto dist/ui.css ───────────────────────
  console.log('\n→ Prepending foundation.css onto @oneui/ui dist/ui.css …');
  prependFoundationOntoUiCss();

  console.log('\n→ Verifying @oneui/ui brand-loader / cdn-bootstrap dist …');
  ensureUiBrandDistArtifacts();

  // ── 3 + 4. Stage + pack each publishable package ─────────────────────────
  console.log('\n→ Staging packages …');
  const staged: StagedTarball[] = [];
  for (const pkg of PUBLISHABLE_PACKAGES) {
    const result = stagePackage(pkg, ROOT, RELEASE_DIR);
    if (result) {
      staged.push(result);
      console.log(
        `  ✓ ${result.publishedName}@${result.version} `
        + `(${formatBytes(result.bytes)})`,
      );
    }
  }

  // ── 5. Summary ───────────────────────────────────────────────────────────
  printSummary(staged);
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
