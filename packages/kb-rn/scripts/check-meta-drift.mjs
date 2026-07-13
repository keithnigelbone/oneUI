/**
 * KB ↔ source drift gate (`kb:check`).
 *
 * WHY: ~45% of each meta (composition.accepts, tokens, figma keys, the contract
 * prose) is human-authored design intent that blind auto-regeneration would
 * destroy. So instead of silently rewriting metas, we DETECT when a component's
 * source has changed since its meta was last reconciled and FAIL — forcing a
 * human to review the meta and acknowledge ("bless") the new source. This is
 * the same SHA-256 incremental model code-review-graph uses, applied to KB↔code.
 *
 * Scope: for each meta with a real `@oneui/ui-native` source, hash the prop
 * contract (`interface.ts`) + the impl (`<Name>.native.tsx`). `verify:tokens`
 * already guards the token claims against the impl; this guards the
 * props / a11y / render contract.
 *
 *   pnpm --filter @jds/kb-rn kb:check   → fail if any tracked source drifted
 *   pnpm --filter @jds/kb-rn kb:bless   → record current hashes (reconciled)
 *
 * Reads ALL_COMPONENTS from the built dist so it matches what ships.
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distIndex = join(__dirname, '..', 'dist', 'index.js');
if (!existsSync(distIndex)) {
  console.error('[kb:check] dist/index.js missing — run `pnpm --filter @jds/kb-rn build` first.');
  process.exit(1);
}
const { ALL_COMPONENTS } = await import(distIndex);

// kb-rn/scripts → kb-rn → packages → <repoRoot>
const repoRoot = resolve(__dirname, '..', '..', '..');
const UI_NATIVE = join(repoRoot, 'packages', 'ui-native', 'src', 'components');
const HASH_FILE = join(__dirname, '..', '.meta-source-hashes.json');
const bless = process.argv.includes('--bless');

/** Candidate ui-native component dirs for a meta: the importPath's last segment,
 * then the meta name itself (covers barrel importPaths like `.../icons`). */
function candidateDirs(meta) {
  const dirs = [];
  if (meta.importPath) dirs.push(meta.importPath.split('/').pop());
  if (meta.name && !dirs.includes(meta.name)) dirs.push(meta.name);
  return dirs;
}

/** Map a meta → its source files (interface.ts + <Dir>.native.tsx). */
function sourceFilesFor(meta) {
  for (const dir of candidateDirs(meta)) {
    const files = [
      { rel: join('packages', 'ui-native', 'src', 'components', dir, 'interface.ts'), abs: join(UI_NATIVE, dir, 'interface.ts') },
      { rel: join('packages', 'ui-native', 'src', 'components', dir, `${dir}.native.tsx`), abs: join(UI_NATIVE, dir, `${dir}.native.tsx`) },
    ].filter((f) => existsSync(f.abs));
    if (files.length) return files;
  }
  return [];
}

function hashSources(files) {
  const h = createHash('sha256');
  for (const f of files) h.update(f.rel).update('\0').update(readFileSync(f.abs));
  return h.digest('hex').slice(0, 16);
}

const stored = existsSync(HASH_FILE) ? JSON.parse(readFileSync(HASH_FILE, 'utf8')) : {};
const current = {};
const drift = [];
const noSource = [];

for (const meta of ALL_COMPONENTS) {
  const files = sourceFilesFor(meta);
  if (files.length === 0) {
    noSource.push(meta.name); // authored composite (Surface/Card/Banner/SearchBar) — no 1:1 source
    continue;
  }
  const hash = hashSources(files);
  current[meta.name] = { sources: files.map((f) => f.rel), hash };
  const prev = stored[meta.name]?.hash;
  if (prev === undefined) drift.push({ name: meta.name, kind: 'never-blessed' });
  else if (prev !== hash) drift.push({ name: meta.name, kind: 'source-changed' });
}

if (bless) {
  writeFileSync(HASH_FILE, JSON.stringify(current, null, 2) + '\n', 'utf8');
  console.log(`[kb:check] blessed ${Object.keys(current).length} component source hashes → .meta-source-hashes.json`);
  process.exit(0);
}

if (noSource.length) {
  console.log(`[kb:check] ${noSource.length} authored composite(s) without a 1:1 ui-native source (drift N/A): ${noSource.join(', ')}`);
}

if (drift.length === 0) {
  console.log(`[kb:check] OK — ${Object.keys(current).length} component metas in sync with their ui-native source.`);
  process.exit(0);
}

for (const d of drift) {
  const why =
    d.kind === 'never-blessed'
      ? 'no recorded baseline (new component — author/verify its meta, then bless)'
      : 'source changed since the meta was last reconciled';
  console.error(`[kb:check] DRIFT ${d.name}: ${why}`);
}
console.error(
  `\n[kb:check] ${drift.length} component(s) drifted. Review the corresponding ` +
    `packages/kb-rn/src/components/JDS<Name>.ts meta(s) against the changed source, ` +
    `then run \`pnpm --filter @jds/kb-rn kb:bless\` to acknowledge. Exiting non-zero.`,
);
process.exit(1);
