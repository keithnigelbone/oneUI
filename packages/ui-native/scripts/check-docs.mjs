/**
 * check-docs.mjs — documentation-completeness gate for @oneui/ui-native.
 *
 * Asserts every PUBLIC component (exported from the barrel, not gated) ships a
 * `*.usage.md` in its component folder. The publish pipeline copies these into
 * docs/components/, so a missing doc means a public component reaches consumers
 * undocumented — one of the audit's findings.
 *
 * Gated components are intentionally skipped (their docs are stripped on
 * publish). `Icon` is exempt — it documents through the `./icons` entry.
 *
 * Run: node scripts/check-docs.mjs   (wired into `pnpm check:docs`)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GATED_COMPONENTS } from './gated-components.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(PKG_ROOT, 'src', 'components');
const BARREL = path.join(PKG_ROOT, 'src', 'index.ts');

const EXEMPT = new Set(['Icon']); // documented via the ./icons entry
const gated = new Set(GATED_COMPONENTS);

// Public component names = barrel from-paths ∩ real component folders.
const folders = fs
  .readdirSync(COMPONENTS_DIR, { withFileTypes: true })
  .filter(
    (e) =>
      e.isDirectory() &&
      fs.existsSync(path.join(COMPONENTS_DIR, e.name, `${e.name}.native.tsx`)),
  )
  .map((e) => e.name);

const barrelSrc = fs.readFileSync(BARREL, 'utf8');
const exported = new Set();
for (const rawLine of barrelSrc.split('\n')) {
  const line = rawLine.trim();
  if (line.startsWith('//') || line.startsWith('*')) continue;
  const m = line.match(/from\s+['"]\.\/components\/([A-Za-z0-9]+)['"]/);
  if (m) exported.add(m[1]);
}

const missing = [];
for (const name of folders) {
  if (EXEMPT.has(name) || gated.has(name) || !exported.has(name)) continue;
  const hasDoc = fs
    .readdirSync(path.join(COMPONENTS_DIR, name))
    .some((f) => f.toLowerCase().endsWith('.usage.md'));
  if (!hasDoc) missing.push(name);
}

if (missing.length > 0) {
  console.error(
    `\n✗  ${missing.length} public component(s) missing a *.usage.md:\n` +
      missing.map((n) => `   • ${n} (add src/components/${n}/${n}.usage.md)`).join('\n') +
      '\n',
  );
  process.exit(1);
}

const documented = folders.filter(
  (n) => !EXEMPT.has(n) && !gated.has(n) && exported.has(n),
).length;
console.log(`✓  Docs complete — all ${documented} public components have a usage doc.`);
