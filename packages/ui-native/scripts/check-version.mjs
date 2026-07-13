/**
 * check-version.mjs — version hygiene gate for @oneui/ui-native.
 *
 * The audit found three disagreeing version strings (package.json
 * `0.1.0-alpha-test.1`, docs `0.1.0-alpha.1`, KB `12.0.0-wip.0`) and internal
 * `-wip`/`-test` markers leaking toward a published artifact. This gate makes
 * those classes of drift impossible:
 *
 *   1. The package version must be well-formed semver. Prerelease channels
 *      (alpha/beta/rc) are allowed but must be DOT-numbered (e.g. alpha.1).
 *      The accidental/internal markers `wip` and `test` are forbidden anywhere.
 *   2. The shipped KB version constants (kb-core) must not carry `wip`/`test`.
 *   3. GETTING_STARTED.md must reference the current package version and must
 *      not advertise a different @oneui/ui-native version.
 *
 * The KB keeps its OWN version lineage (by design — see kb-core version.ts);
 * this gate only forbids pre-release leakage, it does not force KB == package.
 *
 * Run: node scripts/check-version.mjs   (wired into `pnpm check:version`)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(PKG_ROOT, '../..');

const errors = [];

// ── 1. Package version format ─────────────────────────────────────────────────
const pkg = JSON.parse(fs.readFileSync(path.join(PKG_ROOT, 'package.json'), 'utf8'));
const version = pkg.version;

// MAJOR.MINOR.PATCH with optional -(alpha|beta|rc).N prerelease.
const SEMVER_RE = /^\d+\.\d+\.\d+(-(alpha|beta|rc)\.\d+)?$/;
const FORBIDDEN_RE = /(wip|test)/i;

if (FORBIDDEN_RE.test(version)) {
  errors.push(
    `package.json version "${version}" contains a forbidden internal marker ` +
      `(wip/test). Use a clean release or well-formed prerelease (e.g. 0.1.0-alpha.1).`,
  );
} else if (!SEMVER_RE.test(version)) {
  errors.push(
    `package.json version "${version}" is not well-formed. Expected ` +
      `MAJOR.MINOR.PATCH or MAJOR.MINOR.PATCH-(alpha|beta|rc).N.`,
  );
}

// ── 2. Shipped KB version constants ───────────────────────────────────────────
const versionTs = path.join(REPO_ROOT, 'packages', 'kb-core', 'src', 'types', 'version.ts');
if (fs.existsSync(versionTs)) {
  const src = fs.readFileSync(versionTs, 'utf8');
  for (const constName of ['KB_VERSION', 'BRAND_SET_VERSION', 'KB_SCHEMA_VERSION']) {
    const m = src.match(new RegExp(`${constName}\\s*=\\s*'([^']+)'`));
    if (m && FORBIDDEN_RE.test(m[1])) {
      errors.push(
        `kb-core ${constName} = "${m[1]}" carries a forbidden marker (wip/test). ` +
          `Strip it before publishing — the KB ships inside the package.`,
      );
    }
  }
}

// ── 3. Docs agreement (GETTING_STARTED.md) ────────────────────────────────────
const gsPath = path.join(PKG_ROOT, 'GETTING_STARTED.md');
if (fs.existsSync(gsPath)) {
  const gs = fs.readFileSync(gsPath, 'utf8');
  if (!gs.includes(version)) {
    errors.push(
      `GETTING_STARTED.md does not mention the current version "${version}". ` +
        `Update the install table (or regenerate docs).`,
    );
  }
  // Any backtick- or @-prefixed ui-native version that differs is a contradiction.
  const mentioned = new Set();
  for (const m of gs.matchAll(/@oneui\/ui-native(?:@|[`\s|]+`?)(\d+\.\d+\.\d+(?:-[a-z]+\.\d+)?)/gi)) {
    mentioned.add(m[1]);
  }
  for (const v of mentioned) {
    if (v !== version) {
      errors.push(
        `GETTING_STARTED.md advertises @oneui/ui-native version "${v}" but ` +
          `package.json is "${version}". Reconcile them.`,
      );
    }
  }
}

// ── Report ────────────────────────────────────────────────────────────────────
if (errors.length > 0) {
  console.error('\n✗  Version hygiene violations:\n');
  for (const e of errors) console.error(`   • ${e}`);
  console.error('');
  process.exit(1);
}

console.log(`✓  Version hygiene OK — @oneui/ui-native@${version} (no wip/test leakage).`);
