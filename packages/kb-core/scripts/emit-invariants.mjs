/**
 * Post-build emitter for @jds/kb-core. Runs after tsup completes.
 *
 * Today emits:
 *   - dist/invariants.json — the structured CoreInvariants object as JSON
 *     for non-TS consumers (Swift / Kotlin / Dart binders).
 *
 * Future:
 *   - dist/brands/<slug>.json — produced upstream by scripts/snapshot-brands.ts
 *     in OneUI CI and committed before publish; this script verifies presence.
 */

import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

// Re-import the compiled module to access CORE_INVARIANTS without re-implementing it.
// tsup outputs `index.js` (not `index.mjs`) because the package's
// `package.json` declares `"type": "module"` — Node treats `.js` files inside
// a "module"-typed package as ESM.
const { CORE_INVARIANTS } = await import(join(distDir, 'index.js'));

if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });

writeFileSync(
  join(distDir, 'invariants.json'),
  JSON.stringify(CORE_INVARIANTS, null, 2) + '\n',
  'utf8',
);

const brandsDir = join(distDir, 'brands');
if (!existsSync(brandsDir)) {
  // eslint-disable-next-line no-console
  console.warn(
    '[@jds/kb-core] dist/brands/ is empty. Run `pnpm -w snapshot:brands` ' +
      'before publish or shipping consumers will hit "Brand not found".',
  );
}

// eslint-disable-next-line no-console
console.log(`[@jds/kb-core] wrote ${join(distDir, 'invariants.json')}`);
