#!/usr/bin/env node
/**
 * Codemod: t-shirt shape tokens → canonical numeric dimension-scale names.
 *
 * ⚠️ THE HAZARD THIS SCRIPT EXISTS TO AVOID
 *
 * There are TWO mappings, because two hand-authored tables had drifted:
 *
 *   --Shape-M   (CSS)          → f0  → 16px → Shape-4     ] migrate BY NAME
 *   NativeShape.M              → f0  → 16px → shape['4']  ]
 *   tokens.shape.m  (static)   → f-4 →  8px → shape['2']    migrate BY VALUE
 *
 * `M` is 16px. `m` is 8px. A case-insensitive find-and-replace silently doubles
 * every static radius, and nothing catches it — not typecheck, not tests, not
 * `check:literals`. The three patterns below are case-sensitive and lexically
 * disjoint (uppercase = by-name, lowercase = by-value), so one pass is safe.
 *
 * Verified precondition: no file in the repo uses both vocabularies. If that
 * ever stops being true this script still holds, because the patterns can't
 * overlap — but re-check before trusting a bulk run.
 *
 * Usage:
 *   tsx scripts/codemod-shape-tokens.ts <path...>            # dry run (default)
 *   tsx scripts/codemod-shape-tokens.ts --write <path...>    # apply
 *   tsx scripts/codemod-shape-tokens.ts --write --only=css <path...>
 *
 *   --only=css     `--Shape-M`, `Shape-M` (docs/CSS/markdown)   [by name]
 *   --only=native  `shape.M`, `shape['3XS']`                    [by name]
 *   --only=static  `tokens.shape.m`, `shape['3xl']`             [by value]
 *
 * After running: `pnpm check:shape-tokens --prune` to ratchet the allowlist down.
 */

import { readFileSync, writeFileSync, statSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { MIGRATION_MAP } from './check-shape-tokens';

// Re-exported from the gate rather than re-declared. Two copies is how `pill`
// went missing here while the gate still flagged it — the codemod reported
// "Rewrote N file(s)" and left the usage for `check:shape-tokens` to fail on.

/** CSS custom props + NativeShape keys — name-preserving (`M` = f0 = 16px). */
export const BY_NAME: Record<string, string> = MIGRATION_MAP.byName;

/**
 * Static `tokens.shape` — value-preserving (`m` = 8px, NOT 16px), with one
 * exception: `pill` is 999 and `Pill` is 9999. Both clamp identically as a
 * border-radius, so every current consumer renders the same; audit any raw-number
 * consumer (animation output ranges, size comparisons) before relying on that.
 */
export const BY_VALUE: Record<string, string> = MIGRATION_MAP.byValue;

/** Longest-first so `2XL` never matches as `2` + `XL`, and `XS` beats `S`. */
const alt = (keys: string[]) =>
  keys.slice().sort((a, b) => b.length - a.length).join('|');

const NAME_ALT = alt(Object.keys(BY_NAME));
const VALUE_ALT = alt(Object.keys(BY_VALUE));

interface Rule {
  id: 'css' | 'native' | 'static';
  pattern: RegExp;
  replace: (m: RegExpMatchArray) => string;
}

const RULES: Rule[] = [
  {
    // `--Shape-M`, `` `Shape-3XS` ``, `Shape-2XL` in prose/CSS/markdown/JSON.
    id: 'css',
    pattern: new RegExp(`(--)?\\bShape-(${NAME_ALT})\\b`, 'g'),
    replace: (m) => `${m[1] ?? ''}Shape-${BY_NAME[m[2]]}`,
  },
  {
    // `shape.M`, `theme.shape['3XS']`, `shape["3XS"]` — the dynamic NativeShape map.
    id: 'native',
    pattern: new RegExp(`\\bshape(?:\\.(${NAME_ALT})\\b|\\[(['"])(${NAME_ALT})\\2\\])`, 'g'),
    replace: (m) => `shape['${BY_NAME[m[1] ?? m[3]]}']`,
  },
  {
    // `tokens.shape.m`, `shape['3xl']`, `shape["pill"]` — the static, drifted table.
    // `pill` lives in BY_VALUE (via MIGRATION_MAP), so both the dot and bracket
    // forms are handled here; there is no separate pill rule to fall out of sync.
    id: 'static',
    pattern: new RegExp(`\\bshape(?:\\.(${VALUE_ALT})\\b|\\[(['"])(${VALUE_ALT})\\2\\])`, 'g'),
    replace: (m) => `shape['${BY_VALUE[m[1] ?? m[3]]}']`,
  },
];

export type RuleId = Rule['id'];

/** Pure transform — the unit under test. */
export function applyShapeCodemod(
  source: string,
  only?: readonly RuleId[],
): { text: string; hits: Record<string, number> } {
  const rules = RULES.filter((r) => !only || only.includes(r.id));
  const hits: Record<string, number> = {};
  let text = source;

  for (const rule of rules) {
    text = text.replace(rule.pattern, (...args) => {
      const m = args.slice(0, -2) as unknown as RegExpMatchArray;
      hits[rule.id] = (hits[rule.id] ?? 0) + 1;
      return rule.replace(m);
    });
  }
  return { text, hits };
}

const EXTS = /\.(?:css|ts|tsx|dart|md|json)$/;
const IGNORE = ['/node_modules/', '/.next/', '/dist/', '/storybook-build/'];

function walk(path: string): string[] {
  if (!existsSync(path)) return [];
  if (!statSync(path).isDirectory()) return [path.replace(/\\/g, '/')];
  const out: string[] = [];
  for (const e of readdirSync(path, { withFileTypes: true })) {
    const full = join(path, e.name).replace(/\\/g, '/');
    if (IGNORE.some((p) => full.includes(p))) continue;
    if (e.isDirectory()) out.push(...walk(full));
    else if (EXTS.test(e.name)) out.push(full);
  }
  return out;
}

function main(): void {
  const argv = process.argv.slice(2);
  const write = argv.includes('--write');
  const onlyArg = argv.find((a) => a.startsWith('--only='))?.split('=')[1];
  const only = onlyArg ? onlyArg.split(',') : null;
  const paths = argv.filter((a) => !a.startsWith('--'));

  if (paths.length === 0) {
    console.error('usage: tsx scripts/codemod-shape-tokens.ts [--write] [--only=css,native,static] <path...>');
    process.exit(2);
  }

  let touched = 0;
  let total = 0;

  for (const file of paths.flatMap(walk)) {
    const before = readFileSync(file, 'utf8');
    const { text: after, hits } = applyShapeCodemod(before, only as RuleId[] | undefined);

    if (after === before) continue;
    const n = Object.values(hits).reduce((a, b) => a + b, 0);
    touched++;
    total += n;
    const tag = Object.entries(hits).map(([k, v]) => `${k}:${v}`).join(' ');
    console.log(`${write ? 'write' : ' dry '}  ${String(n).padStart(3)}  ${tag.padEnd(28)}  ${file}`);
    if (write) writeFileSync(file, after);
  }

  console.log(`\n${write ? 'Rewrote' : 'Would rewrite'} ${touched} file(s), ${total} replacement(s).`);
  if (!write) console.log('Re-run with --write to apply.');
  else console.log('Now run: pnpm check:shape-tokens --prune');
}

// Only run as a CLI — importing this module (e.g. from tests) must not exit.
if (/codemod-shape-tokens\.[cm]?ts$/.test(process.argv[1] ?? '')) {
  main();
}
