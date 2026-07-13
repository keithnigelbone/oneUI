/**
 * postbuild.mjs  (invoked as `postbuild` via package.json scripts)
 *
 * tsup + tsc already wrote JS bundles + type declarations directly into
 *   <repo-root>/dist/packages/ui-native/
 *
 * This script finalises the publish output:
 *
 *   1. Prune components/ — keep Icon/ fully (public export) + index.d.ts for
 *      every other component (public prop types for AI agents / IDEs). Strip
 *      all internal implementation .d.ts files (.native.d.ts, .styles.d.ts…).
 *
 *   2. Strip .d.ts.map files — type sourcemaps consumers never need.
 *
 *   3. Copy *.usage.md docs into docs/components/ so AI agents and consumers
 *      can understand each component's API, props, and usage patterns without
 *      needing access to the source repo.
 *
 *   4. package.json (publish manifest) — workspace manifest has ./showcase/*
 *      and ./components/* for internal monorepo use. The publish manifest
 *      exposes only the three public entries: . / ./theme / ./icons.
 *      src/ is NOT copied — react-native export resolves to the compiled
 *      .mjs bundle which bundles @oneui/shared and @oneui/tokens internally.
 *
 * Final layout at dist/packages/ui-native/ :
 *
 *   index.cjs               ← all components + theme runtime (bundled)
 *   index.d.ts              ← types for main entry
 *   theme.cjs               ← theme-only entry
 *   theme/index.d.ts        ← types for theme entry
 *   icons.cjs               ← icon system entry
 *   components/Icon/        ← full types for icons entry
 *   components/<Name>/      ← index.d.ts only (public prop types)
 *   docs/components/        ← *.usage.md — component API + usage examples
 *   slots/ utils/           ← helper .d.ts files
 *   package.json            ← publish manifest (3 public entries)
 *   README.md
 *   GETTING_STARTED.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { GATED_COMPONENTS as GATED_LIST } from './gated-components.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PKG_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(PKG_ROOT, '../..');
const OUT_DIR   = path.resolve(REPO_ROOT, 'dist', 'packages', 'ui-native');

// ── Gated components ──────────────────────────────────────────────────────────
// Implementation-complete components that are intentionally NOT part of the
// public API yet (their export lines are commented out in src/index.ts).
//
// `tsc --emitDeclarationOnly` mirrors the whole src/ tree and the docs step
// copies every *.usage.md, so without this gate the publish artifact would
// ship types + docs for components the barrel never exports — exactly the
// drift the audit flagged. We strip their type folder + usage docs here, and
// generate-kb-markdown.mjs reads the same list to mark their KB entry `planned`.
//
// The list lives in scripts/gated-components.mjs (single source of truth shared
// with scripts/check-exports.mjs, which enforces barrel + KB agreement).
const GATED_COMPONENTS = new Set(GATED_LIST);

// ── helpers ──────────────────────────────────────────────────────────────────

/** Recursively delete a directory and all its contents. */
function removeDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

/** Recursively delete all files matching `pattern` under `dir`. */
function deleteByPattern(dir, pattern) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      deleteByPattern(full, pattern);
    } else if (pattern.test(entry.name)) {
      fs.unlinkSync(full);
    }
  }
}

// ── validate tsup / tsc output ────────────────────────────────────────────────

const requiredBundles = [
  'index.cjs', 'theme.cjs', 'icons.cjs', 'internal.cjs', // CommonJS (react-native / require)
  'index.mjs', 'theme.mjs', 'icons.mjs', 'internal.mjs', // ESM (import / bundler tree-shaking)
];
for (const bundle of requiredBundles) {
  if (!fs.existsSync(path.join(OUT_DIR, bundle))) {
    console.error(`\n✗  ${bundle} not found in dist/packages/ui-native/ — run build:js first.\n`);
    process.exit(1);
  }
}
if (!fs.existsSync(path.join(OUT_DIR, 'index.d.ts'))) {
  console.error('\n✗  index.d.ts not found — run build:dts first.\n');
  process.exit(1);
}

console.log('\n📦  Finalising dist/packages/ui-native/\n');

// ── 1. Prune components/ ──────────────────────────────────────────────────────
// tsc --emitDeclarationOnly mirrors the full src/ tree into components/.
// Strategy:
//   - Icon/  : keep fully — it's the public ./icons export.
//   - Others : keep only index.d.ts (public prop types exported per component);
//              strip .native.d.ts, .styles.d.ts, .showcase.d.ts, test files etc.

const componentsDir = path.join(OUT_DIR, 'components');
if (fs.existsSync(componentsDir)) {
  for (const entry of fs.readdirSync(componentsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name === 'Icon') continue; // keep fully — public icons export

    // Gated components are not public — drop their type folder entirely so the
    // artifact never advertises an API the barrel doesn't export.
    if (GATED_COMPONENTS.has(entry.name)) {
      fs.rmSync(path.join(componentsDir, entry.name), { recursive: true, force: true });
      continue;
    }

    const compDir = path.join(componentsDir, entry.name);
    // Keep only index.d.ts; remove everything else in this directory.
    for (const file of fs.readdirSync(compDir)) {
      if (file !== 'index.d.ts') {
        const full = path.join(compDir, file);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          fs.rmSync(full, { recursive: true, force: true });
        } else {
          fs.unlinkSync(full);
        }
      }
    }
    // If no index.d.ts was produced, remove the empty dir entirely.
    if (!fs.existsSync(path.join(compDir, 'index.d.ts'))) {
      fs.rmSync(compDir, { recursive: true, force: true });
    }
  }
}
console.log('  ✓  components/  (Icon/ kept fully; others trimmed to index.d.ts)');

// ── 2. Strip .d.ts.map files ──────────────────────────────────────────────────
// Type sourcemaps are only useful for debugging the TS compiler itself.
// Consumers never need them; they add ~600 KB unpacked.

for (const typeDir of ['components', 'theme', 'slots', 'utils']) {
  deleteByPattern(path.join(OUT_DIR, typeDir), /\.d\.ts\.map$/);
}
for (const f of fs.readdirSync(OUT_DIR)) {
  if (f.endsWith('.d.ts.map')) fs.unlinkSync(path.join(OUT_DIR, f));
}
console.log('  ✓  .d.ts.map    (type sourcemaps stripped)');

// ── 3. Copy *.usage.md docs ───────────────────────────────────────────────────
// Collect every src/components/<Name>/<name>.usage.md and publish them as
// docs/components/<Name>.usage.md so AI agents and consumers can understand
// component APIs, props, and usage patterns without accessing the source repo.

const srcComponentsDir = path.join(PKG_ROOT, 'src', 'components');
const docsDir = path.join(OUT_DIR, 'docs', 'components');
if (fs.existsSync(srcComponentsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
  let usageDocCount = 0;
  for (const compEntry of fs.readdirSync(srcComponentsDir, { withFileTypes: true })) {
    if (!compEntry.isDirectory()) continue;
    // Gated components are not public — don't publish their usage docs.
    if (GATED_COMPONENTS.has(compEntry.name)) continue;
    const compDir = path.join(srcComponentsDir, compEntry.name);
    for (const file of fs.readdirSync(compDir)) {
      if (!file.endsWith('.usage.md')) continue;
      fs.copyFileSync(
        path.join(compDir, file),
        path.join(docsDir, `${compEntry.name}.usage.md`),
      );
      usageDocCount++;
    }
  }
  console.log(`  ✓  docs/components/  (${usageDocCount} usage docs copied)`);
}

// ── 4. README + GETTING_STARTED ──────────────────────────────────────────────

const readmeSrc = path.join(PKG_ROOT, 'README.md');
if (fs.existsSync(readmeSrc)) {
  fs.copyFileSync(readmeSrc, path.join(OUT_DIR, 'README.md'));
  console.log('  ✓  README.md');
}

const gettingStartedSrc = path.join(PKG_ROOT, 'GETTING_STARTED.md');
if (fs.existsSync(gettingStartedSrc)) {
  fs.copyFileSync(gettingStartedSrc, path.join(OUT_DIR, 'GETTING_STARTED.md'));
  console.log('  ✓  GETTING_STARTED.md');
}

const changelogSrc = path.join(PKG_ROOT, 'CHANGELOG.md');
if (fs.existsSync(changelogSrc)) {
  fs.copyFileSync(changelogSrc, path.join(OUT_DIR, 'CHANGELOG.md'));
  console.log('  ✓  CHANGELOG.md');
}

// ── 4b. Copy KB and Generate Markdown ─────────────────────────────────────────

const kbDistDir = path.join(REPO_ROOT, 'packages', 'kb-rn', 'dist');
const outKbDir = path.join(OUT_DIR, 'kb');

if (fs.existsSync(kbDistDir)) {
  fs.mkdirSync(outKbDir, { recursive: true });
  if (fs.existsSync(path.join(kbDistDir, 'kb-graph.json'))) {
    fs.copyFileSync(path.join(kbDistDir, 'kb-graph.json'), path.join(outKbDir, 'kb-graph.json'));
  }
  if (fs.existsSync(path.join(kbDistDir, 'components.json'))) {
    fs.copyFileSync(path.join(kbDistDir, 'components.json'), path.join(outKbDir, 'components.json'));
  }

  execSync('node scripts/generate-kb-markdown.mjs', { cwd: PKG_ROOT, stdio: 'inherit' });
  console.log('  ✓  kb/ (KB graph copied & Markdown generated)');
} else {
  console.warn(
    '\n⚠️   packages/kb-rn/dist/ not found — kb/ will be missing from the pack.\n' +
    '    Run `pnpm --filter @jds/kb-rn run build` before building ui-native,\n' +
    '    or use `pnpm run build:pack` which now does this automatically.\n',
  );
}

// ── 5. publish package.json ───────────────────────────────────────────────────
//
// Dual-manifest model:
//   workspace manifest  — includes ./showcase/* and ./components/* for internal
//                         monorepo apps (native-components-sample, mobile).
//   publish manifest    — exposes only the three public entries so external
//                         consumers can't accidentally depend on src/ paths
//                         that don't exist in the tgz.

const workspacePkg = JSON.parse(
  fs.readFileSync(path.join(PKG_ROOT, 'package.json'), 'utf8'),
);

const publishPkg = {
  name:        workspacePkg.name,
  version:     workspacePkg.version,
  description: workspacePkg.description,
  keywords:    workspacePkg.keywords,
  license:     workspacePkg.license ?? 'UNLICENSED',
  author:      workspacePkg.author,
  homepage:    workspacePkg.homepage,
  repository:  workspacePkg.repository,
  bugs:        workspacePkg.bugs,
  sideEffects: workspacePkg.sideEffects,

  // Explicit allowlist so npm pack never picks up *.map sourcemaps, src/,
  // or any other artefacts that land in the dist folder during the build.
  files: [
    'index.cjs',
    'index.mjs',
    'index.d.ts',
    'theme.cjs',
    'theme.mjs',
    'theme/',
    'icons.cjs',
    'icons.mjs',
    'internal.cjs',
    'internal.mjs',
    'internal.d.ts',
    'components/',
    'docs/',
    'slots/',
    'utils/',
    'kb/',
    'README.md',
    'GETTING_STARTED.md',
    'CHANGELOG.md',
  ],

  // Top-level resolution fields.
  //   main / react-native → .cjs : Metro and legacy require() consumers. CJS
  //     keeps require('.oneui-cached') statically detectable by Metro.
  //   module → .mjs : hint for bundlers that prefer ESM (tree-shaking).
  'react-native': './index.cjs',
  main:           './index.cjs',
  module:         './index.mjs',
  types:          './index.d.ts',

  // Export conditions are ordered most-specific first. `react-native` MUST win
  // for Metro and MUST point at .cjs (see module-resolution note above). `import`
  // serves ESM/bundler consumers (.mjs, tree-shakeable). `require` + `default`
  // fall back to .cjs for maximum CJS compatibility.
  exports: {
    '.': {
      types:          './index.d.ts',
      'react-native': './index.cjs',
      import:         './index.mjs',
      require:        './index.cjs',
      default:        './index.cjs',
    },
    './theme': {
      // Curated public theme API (theme/public.d.ts), not the full internal barrel.
      types:          './theme/public.d.ts',
      'react-native': './theme.cjs',
      import:         './theme.mjs',
      require:        './theme.cjs',
      default:        './theme.cjs',
    },
    './icons': {
      types:          './components/Icon/icons.d.ts',
      'react-native': './icons.cjs',
      import:         './icons.mjs',
      require:        './icons.cjs',
      default:        './icons.cjs',
    },
    './internal': {
      // Advanced component-authoring helpers. NOT semver-stable.
      types:          './internal.d.ts',
      'react-native': './internal.cjs',
      import:         './internal.mjs',
      require:        './internal.cjs',
      default:        './internal.cjs',
    },
    './kb': {
      require: './kb/components.json',
      default: './kb/components.json'
    },
    './kb/graph': {
      require: './kb/kb-graph.json',
      default: './kb/kb-graph.json'
    },
    // NOTE: ./showcase/* and ./components/* are intentionally omitted.
    // They exist in the workspace manifest for internal monorepo use only.
  },

  peerDependencies:     workspacePkg.peerDependencies,
  peerDependenciesMeta: workspacePkg.peerDependenciesMeta,
  // Strip workspace:* deps — @oneui/shared and @oneui/tokens are bundled by
  // tsup; they must not appear as runtime deps in the publish manifest.
  dependencies: Object.fromEntries(
    Object.entries(workspacePkg.dependencies ?? {}).filter(
      ([, v]) => !String(v).startsWith('workspace:'),
    ),
  ) || undefined,
  engines: workspacePkg.engines,
};

fs.writeFileSync(
  path.join(OUT_DIR, 'package.json'),
  JSON.stringify(publishPkg, null, 2) + '\n',
);
console.log('  ✓  package.json (publish manifest — 3 public entries only)');

// ── 6. Verify no ./src/ references remain ─────────────────────────────────────

const publishPkgText = JSON.stringify(publishPkg);
if (publishPkgText.includes('./src/')) {
  console.error('\n✗  publish package.json still references ./src/ — check exports.\n');
  process.exit(1);
}

// ── summary ───────────────────────────────────────────────────────────────────

const rootFiles = fs.readdirSync(OUT_DIR).filter(f =>
  !fs.statSync(path.join(OUT_DIR, f)).isDirectory()
);

console.log(`\n  Output : ${OUT_DIR}`);
console.log(`  Files  : ${rootFiles.join('  ')}`);
console.log('\n✅  Done.\n');
