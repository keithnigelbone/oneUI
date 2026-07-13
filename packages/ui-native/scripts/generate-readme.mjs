/**
 * generate-readme.mjs — regenerate the "Components shipped" table in README.md
 * from the single source of truth (public barrel exports + KB metadata), so the
 * README can never again claim "only Button" while 35 components ship.
 *
 * Sources (both always present in-repo — no build ordering dependency):
 *   - src/index.ts                        → which components are PUBLIC (authoritative)
 *   - packages/kb-rn/src/components/*.ts  → status + description (enrichment)
 *
 * Modes:
 *   node scripts/generate-readme.mjs           → rewrite README.md in place
 *   node scripts/generate-readme.mjs --check   → fail (exit 1) if README is stale
 *                                                (no write) — used by CI.
 *
 * The table lives between:
 *   <!-- AUTO-GENERATED:components START ... --> ... <!-- AUTO-GENERATED:components END -->
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(PKG_ROOT, '../..');
const COMPONENTS_DIR = path.join(PKG_ROOT, 'src', 'components');
const BARREL = path.join(PKG_ROOT, 'src', 'index.ts');
const README = path.join(PKG_ROOT, 'README.md');
const KB_SRC = path.join(REPO_ROOT, 'packages', 'kb-rn', 'src', 'components');

const START = '<!-- AUTO-GENERATED:components START';
const END = '<!-- AUTO-GENERATED:components END -->';

const checkMode = process.argv.includes('--check');

// ── Public component names = barrel from-paths ∩ real component folders ────────
const componentFolders = new Set(
  fs
    .readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter(
      (e) =>
        e.isDirectory() &&
        fs.existsSync(path.join(COMPONENTS_DIR, e.name, `${e.name}.native.tsx`)),
    )
    .map((e) => e.name),
);

const barrelSrc = fs.readFileSync(BARREL, 'utf8');
const publicNames = new Set();
for (const rawLine of barrelSrc.split('\n')) {
  const line = rawLine.trim();
  if (line.startsWith('//') || line.startsWith('*')) continue;
  const m = line.match(/from\s+['"]\.\/components\/([A-Za-z0-9]+)['"]/);
  if (m && componentFolders.has(m[1])) publicNames.add(m[1]);
}

// ── KB enrichment from source (status + description) ──────────────────────────
// The component-level `description:` is the FIRST one in each JDS<Name>.ts file
// (it precedes the nested propsSchema descriptions), so the first match is safe.
function readKbMeta(name) {
  const file = path.join(KB_SRC, `JDS${name}.ts`);
  if (!fs.existsSync(file)) return { status: 'stable', description: '' };
  const src = fs.readFileSync(file, 'utf8');
  const status = src.match(/status:\s*'([a-z]+)'/)?.[1] ?? 'stable';
  const description = src.match(/description:\s*'((?:[^'\\]|\\.)*)'/)?.[1] ?? '';
  return { status, description };
}

// Collapse to a single line and cap length — predictable, abbreviation-safe.
function note(desc) {
  if (!desc) return '—';
  const flat = desc.replace(/\s+/g, ' ').replace(/\|/g, '\\|').trim();
  return flat.length > 110 ? flat.slice(0, 107).trimEnd() + '…' : flat;
}

// ── Build the table ───────────────────────────────────────────────────────────
const rows = [...publicNames].sort((a, b) => a.localeCompare(b)).map((name) => {
  const { status, description } = readKbMeta(name);
  return `| \`${name}\` | ${status} | ${note(description)} |`;
});

const table = [
  `| Component | Status | Notes |`,
  `| --- | --- | --- |`,
  ...rows,
].join('\n');

const block =
  `${START} — do not edit by hand. Run \`pnpm --filter @oneui/ui-native generate:readme\`. -->\n` +
  `<!-- ${publicNames.size} public components -->\n\n` +
  `${table}\n\n` +
  `${END}`;

// ── Splice into README between markers ────────────────────────────────────────
const readme = fs.readFileSync(README, 'utf8');
const startIdx = readme.indexOf(START);
const endIdx = readme.indexOf(END);
if (startIdx === -1 || endIdx === -1) {
  console.error(`\n✗  README.md is missing the AUTO-GENERATED:components markers.\n`);
  process.exit(1);
}
const next = readme.slice(0, startIdx) + block + readme.slice(endIdx + END.length);

if (checkMode) {
  if (next !== readme) {
    console.error(
      `\n✗  README.md component table is STALE (${publicNames.size} public components).\n` +
        `   Run: pnpm --filter @oneui/ui-native generate:readme\n`,
    );
    process.exit(1);
  }
  console.log(`✓  README.md component table is up to date (${publicNames.size} components).`);
} else {
  fs.writeFileSync(README, next);
  console.log(`✓  README.md regenerated — ${publicNames.size} public components.`);
}
