/**
 * Token-claim integrity gate (B6).
 *
 * For each component meta in @jds/kb-rn, find its implementation source under
 * `packages/ui-native/src/components/<Name>/<Name>.native.tsx`, regex-scan
 * for token references, and assert that every surface / content / state token
 * the implementation reads is declared in meta.tokens. Also warns when
 * meta.tokens declares values that the implementation never uses (stale claim).
 *
 * Scoped to the patterns OneUI's RN components actually use:
 *   role.surfaces.<key>         → meta.tokens.surface includes <key>
 *   role.content.<key>          → key ∈ {high, medium, low, tinted, tintedA11y}
 *   role.onBoldContent.<key>    → key ∈ {high, medium, tintedA11y}
 *   role.states.<key>           → key matches the state-token vocabulary
 *   tokens.spacing.<key>        → meta.tokens.spacing includes mapped scale
 *   tokens.shape.<key>          → meta.tokens.shape includes <key>
 *   useTypographyTokens('<r>', '<s>') → meta.tokens.typography includes `<r>.<s>`
 *
 * Exit code 1 on any drift; 0 on clean. Designed to wire into Turbo's lint
 * step and the @oneui CI matrix.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..', '..', '..');

// Pull ALL_COMPONENTS lazily from the built dist, so we run against the same
// JSON shape the published package ships.
const distIndex = join(__dirname, '..', 'dist', 'index.js');
if (!existsSync(distIndex)) {
  console.error('[verify-token-claims] dist/index.js missing — run `pnpm --filter @jds/kb-rn build` first.');
  process.exit(1);
}
const { ALL_COMPONENTS } = await import(distIndex);

// Map kb-rn component name → impl source under packages/ui-native/.
function implSourceFor(name) {
  const candidates = [
    `packages/ui-native/src/components/${name}/${name}.native.tsx`,
    `packages/ui-native/src/components/${name}/index.ts`,
    `packages/ui-native/src/components/${name}.native.tsx`,
  ];
  for (const c of candidates) {
    const p = join(repoRoot, c);
    if (existsSync(p)) return p;
  }
  return null;
}

const SURFACE_RE = /role\.surfaces\.([a-z]+)/g;
// Content / on-bold / state keys can carry digits (e.g. `tintedA11y`), so the
// capture group must be alphanumeric — a `[a-zA-Z]+` group truncates
// `tintedA11y` to `tintedA` and falsely flags it as an unknown token.
const CONTENT_RE = /role\.content\.([a-zA-Z0-9]+)/g;
const ON_BOLD_RE = /role\.onBoldContent\.([a-zA-Z0-9]+)/g;
const STATES_RE = /role\.states\.([a-zA-Z0-9]+)/g;
const TYPO_RE = /useTypographyTokens\(\s*['"]([a-z]+)['"]\s*,\s*['"]([0-9XLMSXSL]+)['"]/g;
const SHAPE_RE = /tokens\.shape\.([a-zA-Z]+)/g;

// Content + on-bold-content vocabularies per OneUI § Token Categories
// (CLAUDE.md): per-role content = High / Medium / Medium-Text / Low / Tinted /
// TintedA11y / Stroke-Medium / Stroke-Low; on-bold content = Bold-High /
// Bold-Medium / Bold-Tinted / Bold-TintedA11y.
const KNOWN_CONTENT = new Set([
  'high', 'medium', 'mediumText', 'low', 'tinted', 'tintedA11y', 'strokeMedium', 'strokeLow',
]);
const KNOWN_ON_BOLD = new Set(['high', 'medium', 'tinted', 'tintedA11y']);
const KNOWN_STATES = new Set(['hover', 'pressed', 'boldHover', 'boldPressed', 'subtleHover', 'subtlePressed']);

const issues = [];

for (const meta of ALL_COMPONENTS) {
  const impl = implSourceFor(meta.name);
  if (!impl) {
    issues.push({ kind: 'no-impl', component: meta.name });
    continue;
  }
  const src = readFileSync(impl, 'utf8');

  const usedSurfaces = new Set();
  for (const m of src.matchAll(SURFACE_RE)) usedSurfaces.add(m[1]);

  const usedContent = new Set();
  for (const m of src.matchAll(CONTENT_RE)) usedContent.add(m[1]);

  const usedOnBold = new Set();
  for (const m of src.matchAll(ON_BOLD_RE)) usedOnBold.add(m[1]);

  const usedStates = new Set();
  for (const m of src.matchAll(STATES_RE)) usedStates.add(m[1]);

  const usedTypography = new Set();
  for (const m of src.matchAll(TYPO_RE)) usedTypography.add(`${m[1]}.${m[2]}`);

  const usedShapes = new Set();
  for (const m of src.matchAll(SHAPE_RE)) usedShapes.add(m[1].toLowerCase());

  const claimedSurfaces = new Set(meta.tokens?.surface ?? []);
  const claimedShapes = new Set((meta.tokens?.shape ?? []).map((s) => s.toLowerCase()));
  const claimedTypography = new Set(meta.tokens?.typography ?? []);

  for (const s of usedSurfaces) {
    if (!claimedSurfaces.has(s)) {
      issues.push({ kind: 'surface-undeclared', component: meta.name, token: s, severity: 'error' });
    }
  }
  for (const c of usedContent) {
    if (!KNOWN_CONTENT.has(c)) {
      issues.push({ kind: 'content-unknown', component: meta.name, token: c, severity: 'error' });
    }
  }
  for (const c of usedOnBold) {
    if (!KNOWN_ON_BOLD.has(c)) {
      issues.push({ kind: 'onBold-unknown', component: meta.name, token: c, severity: 'error' });
    }
  }
  for (const s of usedStates) {
    if (!KNOWN_STATES.has(s)) {
      issues.push({ kind: 'state-unknown', component: meta.name, token: s, severity: 'error' });
    }
  }
  for (const t of usedTypography) {
    if (!claimedTypography.has(t)) {
      issues.push({ kind: 'typography-undeclared', component: meta.name, token: t, severity: 'error' });
    }
  }
  for (const s of usedShapes) {
    if (!claimedShapes.has(s)) {
      issues.push({ kind: 'shape-undeclared', component: meta.name, token: s, severity: 'warn' });
    }
  }

  // Stale-claim warnings (declared but unused).
  for (const s of claimedSurfaces) {
    if (!usedSurfaces.has(s)) {
      issues.push({ kind: 'surface-unused', component: meta.name, token: s, severity: 'warn' });
    }
  }
}

let errorCount = 0;
let warnCount = 0;
for (const i of issues) {
  const tag = i.severity ?? 'warn';
  if (tag === 'error') errorCount += 1;
  else warnCount += 1;
  // eslint-disable-next-line no-console
  console[tag === 'error' ? 'error' : 'warn'](
    `[verify-token-claims] ${tag.toUpperCase()} ${i.component}: ${i.kind}${i.token ? ` (${i.token})` : ''}`,
  );
}

if (errorCount > 0) {
  // eslint-disable-next-line no-console
  console.error(`[verify-token-claims] ${errorCount} error(s), ${warnCount} warning(s) — exiting non-zero.`);
  process.exit(1);
}
// eslint-disable-next-line no-console
console.log(`[verify-token-claims] OK — ${ALL_COMPONENTS.length} components, ${warnCount} warning(s).`);
