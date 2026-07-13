/**
 * build-all.ts — orchestrator (`pnpm pack:all`). Runs the full v3 release
 * pipeline in order:
 *
 *   1. build-foundation-css.ts   → packages/ui/foundation.css
 *   2. build-brand-css.ts        → cdn-dist/brands/<slug>/<version>.css
 *   3. bake-jio-fallback.ts      → packages/ui/cdn-bootstrap/jio.ts
 *   4. pack-release.ts           → release/*.tgz (foundation prepended into ui.css)
 *
 * Forwards CLI args downstream where relevant (e.g. --slug=jio for the
 * brand-css step). Stops on the first failing step.
 */

import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

const steps: Array<{ label: string; script: string; forwardArgs?: boolean }> = [
  { label: 'foundation',  script: 'cdn-release-full-pipeline/build/build-foundation-css.ts' },
  { label: 'brand-css',   script: 'cdn-release-full-pipeline/build/build-brand-css.ts', forwardArgs: true },
  { label: 'bake-jio',    script: 'cdn-release-full-pipeline/cdn-poc/bake-jio-fallback.ts' },
  { label: 'pack-release', script: 'cdn-release-full-pipeline/build/pack-release.ts' },
];

const userArgs = process.argv.slice(2);

// Pass the CSS-stub loader to every spawned tsx so the brand-css step can
// import the @oneui/ui registry (which transitively pulls `.module.css`).
// Harmless for the other steps.
const LOADER = './cdn-release-full-pipeline/build/loaders/register.mjs';

for (const step of steps) {
  const args = step.forwardArgs ? userArgs : [];
  console.log(`\n=== ${step.label} === pnpm tsx --import ${LOADER} ${step.script} ${args.join(' ')}`);
  const res = spawnSync('pnpm', ['tsx', '--import', LOADER, step.script, ...args], {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  });
  if (res.status !== 0) {
    console.error(`\n✗ ${step.label} failed (exit ${res.status}). Stopping.`);
    process.exit(res.status ?? 1);
  }
}

console.log('\n✓ Release pipeline complete.');
