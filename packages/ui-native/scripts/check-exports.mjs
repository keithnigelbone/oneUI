/**
 * check-exports.mjs — export/gating completeness gate for @oneui/ui-native.
 *
 * Enforces the C1 contract so the barrel, the publish pipeline, and the KB can
 * never silently drift again (the audit found 7 components built + documented +
 * marked "stable" yet unreachable):
 *
 *   1. Every shippable component folder under src/components/ is EITHER exported
 *      from src/index.ts OR listed in scripts/gated-components.mjs — exactly one.
 *   2. No component is both exported and gated.
 *   3. Every gated component's KB entry (packages/kb-rn) has status: 'planned'.
 *   4. No public (exported) component's KB entry is status: 'planned'.
 *
 * Exit 0 = contract holds. Exit 1 = drift; prints exactly what to fix.
 *
 * Run: node scripts/check-exports.mjs   (wired into `pnpm check:exports`)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GATED_COMPONENTS } from './gated-components.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(PKG_ROOT, '../..');
const COMPONENTS_DIR = path.join(PKG_ROOT, 'src', 'components');
const BARREL = path.join(PKG_ROOT, 'src', 'index.ts');
const KB_DIR = path.join(REPO_ROOT, 'packages', 'kb-rn', 'src', 'components');

// Folders that are not standalone public components (exported via a subpath or
// composed internally). Icon ships through the `./icons` entry, not the barrel.
const EXPORT_EXEMPT = new Set(['Icon']);

const errors = [];
const gated = new Set(GATED_COMPONENTS);

// ── 1. Enumerate shippable component folders ──────────────────────────────────
// A shippable component has an index.ts and a <Name>.native.tsx.
const componentFolders = fs
  .readdirSync(COMPONENTS_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .filter(
    (name) =>
      fs.existsSync(path.join(COMPONENTS_DIR, name, 'index.ts')) &&
      fs.existsSync(path.join(COMPONENTS_DIR, name, `${name}.native.tsx`)),
  );

// ── 2. Parse barrel exports (ignore commented-out lines) ──────────────────────
const barrelSrc = fs.readFileSync(BARREL, 'utf8');
const exported = new Set();
for (const rawLine of barrelSrc.split('\n')) {
  const line = rawLine.trim();
  if (line.startsWith('//') || line.startsWith('*')) continue; // skip comments
  const m = line.match(/from\s+['"]\.\/components\/([A-Za-z0-9]+)['"]/);
  if (m) exported.add(m[1]);
}

// ── 3. Folder ⇄ barrel ⇄ gated reconciliation ─────────────────────────────────
for (const name of componentFolders) {
  if (EXPORT_EXEMPT.has(name)) continue;
  const isExported = exported.has(name);
  const isGated = gated.has(name);

  if (isExported && isGated) {
    errors.push(
      `"${name}" is BOTH exported from src/index.ts AND in GATED_COMPONENTS. Pick one.`,
    );
  } else if (!isExported && !isGated) {
    errors.push(
      `"${name}" has a built component folder but is neither exported from ` +
        `src/index.ts nor listed in scripts/gated-components.mjs. ` +
        `Export it (public) or gate it (not ready).`,
    );
  }
}

// A gated name with no matching folder is a stale entry.
for (const name of gated) {
  if (!componentFolders.includes(name)) {
    errors.push(
      `GATED_COMPONENTS lists "${name}" but src/components/${name} has no ` +
        `index.ts + ${name}.native.tsx. Remove the stale gate entry.`,
    );
  }
}

// ── 4. KB must agree with gating + names must match ───────────────────────────
function kbMetaFor(name) {
  const file = path.join(KB_DIR, `JDS${name}.ts`);
  if (!fs.existsSync(file)) return null;
  const src = fs.readFileSync(file, 'utf8');
  return {
    status: src.match(/status:\s*'([a-z]+)'/)?.[1] ?? null,
    name: src.match(/name:\s*'([A-Za-z0-9]+)'/)?.[1] ?? null,
  };
}

for (const name of componentFolders) {
  if (EXPORT_EXEMPT.has(name)) continue;
  const meta = kbMetaFor(name);

  // 4a. KB completeness — every PUBLIC component must have a KB entry.
  if (!meta) {
    if (!gated.has(name)) {
      errors.push(
        `"${name}" is exported (public) but has no KB entry. Add ` +
          `packages/kb-rn/src/components/JDS${name}.ts (name: '${name}').`,
      );
    }
    continue;
  }

  // 4b. Naming consistency — KB name field must equal the export/folder name.
  if (meta.name && meta.name !== name) {
    errors.push(
      `KB entry JDS${name}.ts has name: '${meta.name}', expected '${name}'. ` +
        `KB names must exactly match export names.`,
    );
  }

  // 4c. Status must agree with gating.
  if (gated.has(name) && meta.status !== 'planned') {
    errors.push(
      `"${name}" is gated but its KB status is '${meta.status}'. Set status: 'planned' ` +
        `in packages/kb-rn/src/components/JDS${name}.ts.`,
    );
  }
  if (!gated.has(name) && meta.status === 'planned') {
    errors.push(
      `"${name}" is exported (public) but its KB status is 'planned'. ` +
        `Set a public status ('stable' | 'beta' | 'alpha') in JDS${name}.ts.`,
    );
  }
}

// ── Report ────────────────────────────────────────────────────────────────────
if (errors.length > 0) {
  console.error('\n✗  Export/gating contract violations:\n');
  for (const e of errors) console.error(`   • ${e}`);
  console.error(
    `\n   ${componentFolders.length} component folders · ${exported.size} exported · ${gated.size} gated\n`,
  );
  process.exit(1);
}

console.log(
  `✓  Export/gating contract holds — ${componentFolders.length} component folders ` +
    `(${exported.size} public, ${gated.size} gated).`,
);
