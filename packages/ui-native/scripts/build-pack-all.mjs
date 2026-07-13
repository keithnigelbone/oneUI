/**
 * build-pack-all.mjs
 *
 * Builds and packs all publishable @oneui native packages in dependency order:
 *
 *   1. @oneui/shared      — types, engine, codegen (no @oneui/* deps)
 *   2. @oneui/tokens      — CSS primitives + TS token values (no runtime deps)
 *   3. @oneui/ui-native   — component library (bundles shared + tokens)
 *   4. @oneui/native-cdn  — brand-data prefetch CLI + runtime hook
 *
 * Each package is built with tsup, then packed with `npm pack` into:
 *
 *   dist/packages/shared/      → oneui-shared-<version>.tgz
 *   dist/packages/tokens/      → oneui-tokens-<version>.tgz
 *   dist/packages/ui-native/   → oneui-ui-native-<version>.tgz
 *   dist/packages/native-cdn/  → oneui-native-cdn-<version>.tgz
 *
 * Usage:
 *   pnpm --filter @oneui/ui-native run build:pack:all
 *
 * Install in any React Native project:
 *   npm i ./oneui-ui-native-<version>.tgz
 *   npm i ./oneui-native-cdn-<version>.tgz   # optional — for prefetch CLI + OTA runtime
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT  = path.resolve(__dirname, '../../..');
const UI_NATIVE  = path.resolve(__dirname, '..');                         // packages/ui-native
const NATIVE_CDN = path.resolve(__dirname, '../../../packages/native-cdn'); // packages/native-cdn

function run(label, cmd, cwd = REPO_ROOT) {
  console.log(`\n▶  ${label}`);
  console.log(`   ${cmd}  (cwd: ${path.relative(REPO_ROOT, cwd) || '.'})\n`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

console.log('\n════════════════════════════════════════════════════════');
console.log('  Build + Pack all @oneui publishable packages');
console.log('════════════════════════════════════════════════════════\n');

// ── 1. @oneui/shared ─────────────────────────────────────────────────────────
run('@oneui/shared — build', 'pnpm --filter @oneui/shared run build');
run('@oneui/shared — pack',  'pnpm --filter @oneui/shared run pack:dist');

// ── 2. @oneui/tokens ─────────────────────────────────────────────────────────
run('@oneui/tokens — build', 'pnpm --filter @oneui/tokens run build');
run('@oneui/tokens — pack',  'pnpm --filter @oneui/tokens run pack:dist');

// ── 2b. @jds/kb-core + @jds/kb-rn ────────────────────────────────────────────
// kb-core must be built before kb-rn (generate-json.mjs imports from its dist/).
// Both must run before ui-native so copy-to-root-dist.mjs finds kb-rn/dist/.
run('@jds/kb-core — build', 'pnpm --filter @jds/kb-core run build');
run('@jds/kb-rn — build',   'pnpm --filter @jds/kb-rn run build');

// ── 3. @oneui/ui-native ──────────────────────────────────────────────────────
// NOTE: pnpm --filter on the package that *owns* this running script is silently
// skipped by pnpm (loop-guard). Run build and pack directly with an explicit
// CWD to avoid that behaviour.
run('@oneui/ui-native — build', 'pnpm run build', UI_NATIVE);
run('@oneui/ui-native — pack',  'node scripts/pack-dist.mjs', UI_NATIVE);

// ── 4. @oneui/native-cdn ─────────────────────────────────────────────────────
run('@oneui/native-cdn — build', 'pnpm run build', NATIVE_CDN);
run('@oneui/native-cdn — pack',  'node scripts/pack-dist.mjs', NATIVE_CDN);

// ── 5. @oneui/icons-jio-native ───────────────────────────────────────────────
const ICONS_NATIVE = path.resolve(__dirname, '../../../packages/icons-jio-native');
run('@oneui/icons-jio-native — generate', 'pnpm run generate', ICONS_NATIVE);
run('@oneui/icons-jio-native — build',    'pnpm run build',    ICONS_NATIVE);
run('@oneui/icons-jio-native — pack',     'node scripts/pack-dist.mjs', ICONS_NATIVE);

// ── summary ───────────────────────────────────────────────────────────────────
console.log('\n════════════════════════════════════════════════════════');
console.log('  Done. Tarballs written to:');
console.log('    dist/packages/shared/');
console.log('    dist/packages/tokens/');
console.log('    dist/packages/ui-native/');
console.log('    dist/packages/native-cdn/');
console.log('    dist/packages/icons-jio-native/');
console.log('════════════════════════════════════════════════════════\n');
