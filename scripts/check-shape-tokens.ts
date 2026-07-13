#!/usr/bin/env node
/**
 * Quality Gate: Shape token naming (ratchet)
 *
 * Shape tokens use the canonical numeric dimension-scale naming:
 *   --Shape-0, --Shape-0-5, --Shape-1, ... --Shape-10, --Shape-Pill
 *   tokens.shape['0'], tokens.shape['0-5'], ... tokens.shape.Pill
 *
 * The deprecated t-shirt vocabulary (--Shape-M, tokens.shape.m, NativeShape.XS)
 * is still emitted as a read-side compatibility layer. This gate stops NEW ones
 * from appearing.
 *
 * ⚠️ The CSS half of that compat layer is NOT global. `--Shape-<t-shirt>` custom
 * properties are declared only in the two `legacy-spacing-shape-aliases.css`
 * files (qa-playground, button-figma-validation). Anywhere else — the platform
 * app, Storybook, the published `@jds4/oneui-react` — `var(--Shape-M)` is
 * undefined, the declaration is invalid at computed-value time, and the element
 * falls back to `border-radius: 0`. An allowlist entry means "known debt", not
 * "renders correctly": a live `var(--Shape-<t-shirt>)` *declaration* outside
 * those two apps is a rendering bug, not debt. Fix it, don't allowlist it.
 *
 * ── How the ratchet works ────────────────────────────────────────────────────
 * `scripts/shape-token-allowlist.json` maps each file that still uses the old
 * vocabulary to its usage COUNT. A file may never exceed its recorded count, and
 * a file not listed may have none at all — so you cannot add a t-shirt token to
 * an already-dirty file either. Counts only ratchet down: `--prune` refuses to
 * run while any file is over budget, and `--seed` refuses to clobber an existing
 * allowlist without `--force`.
 *
 * The only way past the gate is a `shape-tokens-allow-next-line` comment on its
 * own line directly above the usage. A bare `@deprecated` tag exempts a line
 * only when that line is nothing but a comment.
 * When the allowlist is empty, delete:
 *   - the --Shape-* blocks in the two legacy-spacing-shape-aliases.css files
 *   - LEGACY_SHAPE_ALIASES        (packages/shared/src/constants/shape-system.ts)
 *   - LegacyNativeShapeKey        (packages/shared/src/engine/buildNativeDimensions.ts)
 *   - LEGACY_SHAPE_TOKEN_TO_KEY   (packages/ui-native/src/theme/recipeCornerRadius.ts)
 *   - the deprecated keys on tokens.shape (packages/tokens/src/index.ts)
 *   - this script and its allowlist
 *
 * ⚠️ MIGRATION HAZARD: `--Shape-M` and `NativeShape.M` are 16px (f0 → Shape-4),
 * but `tokens.shape.m` is 8px (f-4 → Shape-2). The static table had drifted.
 * Migrate CSS + NativeShape keys BY NAME and tokens.shape keys BY VALUE.
 * A case-insensitive find-and-replace silently doubles radii. See MIGRATION_MAP.
 *
 * Usage:
 *   pnpm check:shape-tokens              # fail on violations outside the allowlist
 *   pnpm check:shape-tokens --report     # print remaining debt, always exit 0
 *   pnpm check:shape-tokens --prune      # rewrite the allowlist, dropping clean files
 */

import { existsSync, readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ALLOWLIST_PATH = 'scripts/shape-token-allowlist.json';

const SCAN_ROOTS = [
  'apps/button-figma-validation/src',
  'apps/flutter_sample/lib',
  'apps/mobile/src',
  'apps/native-components-sample/src',
  'apps/native-sample/src',
  'apps/platform/src',
  'apps/qa-native/src',
  'apps/qa-playground/src',
  'apps/qa-playground-flutter/lib',
  'apps/storybook/src',
  'apps/storybook_flutter/lib',
  'packages/kb-rn/src',
  'packages/shared/src',
  'packages/tokens/src',
  'packages/ui/src',
  'packages/ui-native/src',
  'packages/ui_flutter/lib',
  'scripts/scaffold-figma-validation-matrix.ts',
  // Knowledge assets. These teach the vocabulary to agents and to the MCP's
  // figma_to_code / codegen paths, so a regression here ships `--Shape-M` into
  // consumer projects where it is undefined and the declaration is dropped.
  'docs',
  'starter-mcp/assets',
  '.agents/skills',
  '.claude/skills',
];

const TSHIRT = 'None|6XS|5XS|4XS|3XS|2XS|XS|S|M|L|XL|2XL|3XL|4XL|5XL|6XL';

/** `var(--Shape-M)`, `--Shape-3XS:` — CSS custom properties. */
const LEGACY_SHAPE_CSS_PATTERN = new RegExp(`--Shape-(?:${TSHIRT})\\b`, 'g');

/** `tokens.shape.m`, `shape['3xl']` — the static, drifted, lowercase table. */
const LEGACY_SHAPE_STATIC_PATTERN =
  /\b(?:tokens\.)?shape(?:\[['"](?:xs|s|m|l|xl|2xl|3xl|4xl|5xl|pill)['"]\]|\.(?:xs|s|m|l|xl|pill)\b)/g;

/** `shape.M`, `theme.shape['3XS']` — the dynamic NativeShape map. */
const LEGACY_SHAPE_NATIVE_PATTERN = new RegExp(
  `\\bshape(?:\\[['"](?:${TSHIRT})['"]\\]|\\.(?:${TSHIRT})\\b)`,
  'g',
);

/** `{ token: 'Shape-4', label: 'Shape M' }` — editor labels teaching old names. */
const LEGACY_SHAPE_LABEL_PATTERN =
  /\{\s*token:\s*['"]Shape-[^'"]+['"],\s*label:\s*['"][^'"]*\b(?:6XS|5XS|4XS|3XS|2XS|XS|S|M|L|XL|2XL|3XL|4XL|5XL|6XL)\b[^'"]*['"]/g;

const PATTERNS = [
  LEGACY_SHAPE_CSS_PATTERN,
  LEGACY_SHAPE_STATIC_PATTERN,
  LEGACY_SHAPE_NATIVE_PATTERN,
  LEGACY_SHAPE_LABEL_PATTERN,
];

/**
 * The two mappings a codemod must keep separate. Exported for
 * `scripts/codemod-shape-tokens.ts`.
 */
export const MIGRATION_MAP = {
  /** CSS custom props + NativeShape keys — name-preserving (`M` = f0 = 16px). */
  byName: {
    None: '0', '6XS': '0-5', '5XS': '1', '4XS': '1-5', '3XS': '2', '2XS': '2-5',
    XS: '3', S: '3-5', M: '4', L: '4-5', XL: '5',
    '2XL': '6', '3XL': '7', '4XL': '8', '5XL': '9', '6XL': '10',
  },
  /** Static `tokens.shape` — value-preserving (`m` = 8px, NOT 16px). */
  byValue: {
    xs: '0-5', s: '1', m: '2', l: '3', xl: '4',
    '2xl': '5', '3xl': '6', '4xl': '8', '5xl': '10', pill: 'Pill',
  },
} as const;

const IGNORE_PATH_PARTS = [
  '/node_modules/',
  '/.next/',
  '/dist/',
  '/storybook-build/',
  // skill-creator scratch: frozen "before" snapshots and captured eval outputs.
  // Rewriting them would falsify the eval record they exist to preserve.
  '-workspace/',
];

/**
 * Files that DEFINE the compatibility layer, rather than consuming it.
 * These are deleted wholesale in the final PR, not migrated.
 */
const COMPAT_LAYER_FILES = new Set([
  'apps/button-figma-validation/src/legacy-spacing-shape-aliases.css',
  'apps/qa-playground/src/legacy-spacing-shape-aliases.css',
  'packages/shared/src/constants/shape-system.ts',
  'packages/shared/src/engine/buildNativeDimensions.ts',
  'packages/shared/src/utils/dimensionCSS.ts',
  'packages/tokens/src/index.ts',
  'packages/ui-native/src/theme/recipeCornerRadius.ts',
  'packages/ui-native/src/theme/recipeCornerRadius.test.ts',
  'packages/shared/src/engine/__tests__/buildNativeDimensions.test.ts',
  'packages/shared/src/utils/__tests__/dimensionCSS.test.ts',
  // Dart mirror of the same compat layer: `_shapeTshirtToFStep` + the
  // `case '--Shape-None'` branch in `lengthPrimitiveSansPlatformDims`.
  'packages/ui_flutter/lib/engine/native_design_system_payload.dart',
]);

interface Violation {
  file: string;
  line: number;
  match: string;
  context: string;
}

function walk(path: string): string[] {
  if (!existsSync(path)) return [];
  if (!statSync(path).isDirectory()) return [path];

  const files: string[] = [];
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const fullPath = join(path, entry.name);
    const normalised = fullPath.replace(/\\/g, '/');
    if (IGNORE_PATH_PARTS.some((part) => normalised.includes(part))) continue;
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (/\.(?:css|ts|tsx|dart|md|json)$/.test(entry.name)) {
      files.push(normalised);
    }
  }
  return files;
}

/**
 * A comment-only line carrying a JSDoc `@deprecated` tag legitimately names the
 * old tokens. Matching the whole line (rather than the bare substring anywhere
 * in it) is what stops `borderRadius: tokens.shape.m, // DEPRECATED` from
 * smuggling a live usage past the ratchet.
 */
const COMMENT_ONLY_DEPRECATED = /^\s*(?:\/\/|\/\*+|\*|<!--)[^\n]*@deprecated/;

/**
 * The one escape hatch, on its own line directly above the usage. Explicit and
 * greppable, so it shows up in review — unlike a stray word in a trailing
 * comment. (There is no `oneui/shape-tokens` eslint rule; do not cite one.)
 */
const ALLOW_NEXT_LINE = /shape-tokens-allow-next-line/;

function scanFile(file: string): Violation[] {
  const violations: Violation[] = [];
  const lines = readFileSync(file, 'utf8').split('\n');

  lines.forEach((line, index) => {
    if (COMMENT_ONLY_DEPRECATED.test(line)) return;
    if (index > 0 && ALLOW_NEXT_LINE.test(lines[index - 1])) return;

    for (const pattern of PATTERNS) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(line)) !== null) {
        violations.push({ file, line: index + 1, match: match[0], context: line.trim() });
      }
    }
  });

  return violations;
}

/** file path → number of legacy usages still permitted in it. */
type Allowlist = Record<string, number>;

function loadAllowlist(): Allowlist {
  if (!existsSync(ALLOWLIST_PATH)) return {};
  return JSON.parse(readFileSync(ALLOWLIST_PATH, 'utf8')) as Allowlist;
}

function writeAllowlist(counts: Map<string, number>): number {
  const next: Allowlist = {};
  for (const file of [...counts.keys()].sort()) next[file] = counts.get(file)!;
  writeFileSync(ALLOWLIST_PATH, `${JSON.stringify(next, null, 2)}\n`);
  return counts.size;
}

function main(): void {
  const report = process.argv.includes('--report');
  const prune = process.argv.includes('--prune');
  const seed = process.argv.includes('--seed');

  const allowed = loadAllowlist();
  const files = SCAN_ROOTS.flatMap(walk);
  const all = files.flatMap(scanFile).filter((v) => !COMPAT_LAYER_FILES.has(v.file));

  const actual = new Map<string, number>();
  for (const v of all) actual.set(v.file, (actual.get(v.file) ?? 0) + 1);

  if (seed || prune) {
    // `--seed` bootstraps the allowlist from scratch and may therefore record
    // any count. `--prune` maintains an existing one and must never raise a
    // budget — otherwise the "counts only ratchet down" contract is a lie and
    // the gate's own failure message ("or run --prune") becomes the bypass.
    if (prune) {
      const overBudget = [...actual].filter(([file, count]) => count > (allowed[file] ?? 0));
      if (overBudget.length > 0) {
        console.error('❌ Refusing to prune: these files are over budget.\n');
        console.error('`--prune` only drops clean files and lowers counts. Fix the');
        console.error('regressions below (or re-seed deliberately with --seed):\n');
        for (const [file, count] of overBudget) {
          console.error(`  ${file}: allowed ${allowed[file] ?? 0}, found ${count}`);
        }
        process.exit(1);
      }
    }

    if (seed && existsSync(ALLOWLIST_PATH) && !process.argv.includes('--force')) {
      console.error(`❌ ${ALLOWLIST_PATH} already exists.`);
      console.error('   Use --prune to ratchet it down, or --seed --force to overwrite it.');
      process.exit(1);
    }

    const verb = seed ? 'Seeded' : 'Pruned';
    const before = Object.keys(allowed).length;
    const size = writeAllowlist(actual);
    console.log(
      `✅ ${verb} allowlist: ${size} file(s), ${all.length} usage(s)` +
        (prune ? ` (was ${before} file(s))` : ''),
    );
    return;
  }

  if (report) {
    console.log(`Shape token debt: ${all.length} usage(s) across ${actual.size} file(s)\n`);
    for (const [file, count] of [...actual].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${String(count).padStart(4)}  ${file}`);
    }
    return;
  }

  // Regressions: a file exceeding its budget, or a fresh file not on the list.
  const regressed = [...actual].filter(([file, count]) => count > (allowed[file] ?? 0));
  // Stale: a file that improved. The allowlist must track reality so it can hit zero.
  const stale = Object.keys(allowed).filter((file) => (actual.get(file) ?? 0) < allowed[file]);

  if (regressed.length > 0) {
    console.error('❌ Numeric shape token check FAILED\n');
    console.error('Use numeric shape tokens: --Shape-2, --Shape-3-5, --Shape-Pill,');
    console.error("tokens.shape['2'], shape['4'].\n");
    console.error('⚠️  --Shape-M / NativeShape.M = 16px → Shape-4');
    console.error('    tokens.shape.m           =  8px → Shape-2');
    console.error('    Do not case-fold. See MIGRATION_MAP in this file.\n');

    for (const [file, count] of regressed) {
      const budget = allowed[file] ?? 0;
      console.error(`${file}  (${count} usage(s), allowed ${budget})`);
      for (const v of all.filter((x) => x.file === file)) {
        console.error(`  ${v.line}: ${v.match}`);
        console.error(`     ${v.context}`);
      }
    }
    console.error(`\n${regressed.length} file(s) over budget. The allowlist only ratchets down.`);
    process.exit(1);
  }

  if (stale.length > 0) {
    console.error('❌ Shape token allowlist is stale\n');
    console.error('These files improved. Update their counts (or run');
    console.error('`pnpm check:shape-tokens --prune`) so the ratchet can reach zero:\n');
    for (const file of stale) {
      console.error(`  ${file}: ${allowed[file]} → ${actual.get(file) ?? 0}`);
    }
    process.exit(1);
  }

  const remaining = Object.keys(allowed).length;
  console.log(
    `✅ Numeric shape token check PASSED (${files.length} files scanned, ` +
      `${all.length} legacy usage(s) across ${remaining} allowlisted file(s))`,
  );
}

// Run the gate only when invoked directly. `scripts/codemod-shape-tokens.ts`
// imports MIGRATION_MAP from this module and must not trigger a scan.
if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
