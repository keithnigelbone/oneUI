/**
 * Split step-lookup CSS bytes/declarations into:
 *   STATIC  — roles invariant across brands (Neutral, Positive, Negative, Warning, Informative, Border)
 *   DYNAMIC — brand-dependent (Primary, Secondary, Tertiary, Quaternary, Sparkle, Brand-Bg, Surface, Text)
 *
 * Also cross-checks byte-identity of STATIC slice across all fixtures.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

const STATIC_PREFIXES = [
  '--Neutral-',
  '--Positive-',
  '--Negative-',
  '--Warning-',
  '--Informative-',
  '--Border-',
];
const DYNAMIC_PREFIXES = [
  '--Primary-',
  '--Secondary-',
  '--Tertiary-',
  '--Quaternary-',
  '--Sparkle-',
  '--Brand-Bg-',
  '--Surface-',
  '--Text-',
];

function classify(token: string): 'static' | 'dynamic' | 'other' {
  for (const p of STATIC_PREFIXES) if (token.startsWith(p)) return 'static';
  for (const p of DYNAMIC_PREFIXES) if (token.startsWith(p)) return 'dynamic';
  return 'other';
}

interface RuleStats {
  staticDecls: number;
  dynamicDecls: number;
  otherDecls: number;
  staticBytes: number;
  dynamicBytes: number;
  otherBytes: number;
  staticRulesText: string[]; // selector+declarations split out for hashing
}

function analyze(css: string): RuleStats {
  const stats: RuleStats = {
    staticDecls: 0,
    dynamicDecls: 0,
    otherDecls: 0,
    staticBytes: 0,
    dynamicBytes: 0,
    otherBytes: 0,
    staticRulesText: [],
  };

  // Split into rules: selectorList { decls }
  const ruleRe = /([^{}]+)\{([^{}]+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = ruleRe.exec(css)) !== null) {
    const selector = m[1].trim();
    const body = m[2];
    const declRe = /(--[A-Za-z][\w-]+):\s*([^;]+);/g;
    let d: RegExpExecArray | null;
    const declsInRule: { token: string; value: string; bytes: number; kind: 'static' | 'dynamic' | 'other' }[] = [];
    while ((d = declRe.exec(body)) !== null) {
      const token = d[1];
      const value = d[2].trim();
      const bytes = Buffer.byteLength(`${token}: ${value};`, 'utf8');
      const kind = classify(token);
      declsInRule.push({ token, value, bytes, kind });
      if (kind === 'static') {
        stats.staticDecls++;
        stats.staticBytes += bytes;
      } else if (kind === 'dynamic') {
        stats.dynamicDecls++;
        stats.dynamicBytes += bytes;
      } else {
        stats.otherDecls++;
        stats.otherBytes += bytes;
      }
    }
    // Build a canonical static-only fragment for this rule (selector + sorted static decls).
    const staticOnly = declsInRule.filter((d) => d.kind === 'static');
    if (staticOnly.length > 0) {
      const canonical = `${selector.replace(/\s+/g, ' ')} {\n${staticOnly
        .map((d) => `  ${d.token}: ${d.value};`)
        .sort()
        .join('\n')}\n}`;
      stats.staticRulesText.push(canonical);
    }
  }
  return stats;
}

function hashStaticSlice(stats: RuleStats): string {
  const sorted = [...stats.staticRulesText].sort();
  return crypto.createHash('sha256').update(sorted.join('\n\n')).digest('hex').slice(0, 16);
}

const dir = path.join(process.cwd(), 'temp/surface-step-lookup');
const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.css'))
  .sort();

console.log('\nStatic vs Dynamic split on step-lookup CSS:\n');
const rows: { fixture: string; total: number; staticB: number; dynB: number; otherB: number; sDecls: number; dDecls: number; oDecls: number; hash: string }[] = [];
for (const f of files) {
  const css = fs.readFileSync(path.join(dir, f), 'utf8');
  const s = analyze(css);
  const total = s.staticBytes + s.dynamicBytes + s.otherBytes;
  rows.push({
    fixture: f.replace('surface-step-lookup--full-injected--', '').replace('.css', ''),
    total,
    staticB: s.staticBytes,
    dynB: s.dynamicBytes,
    otherB: s.otherBytes,
    sDecls: s.staticDecls,
    dDecls: s.dynamicDecls,
    oDecls: s.otherDecls,
    hash: hashStaticSlice(s),
  });
}

const pad = (s: string | number, n: number) => String(s).padEnd(n);
console.log(
  pad('fixture', 18),
  pad('decls total', 12),
  pad('static', 14),
  pad('dynamic', 14),
  pad('other', 10),
  pad('staticHash', 18),
);
for (const r of rows) {
  const totalDecls = r.sDecls + r.dDecls + r.oDecls;
  const staticPct = ((r.staticB / r.total) * 100).toFixed(1);
  const dynPct = ((r.dynB / r.total) * 100).toFixed(1);
  console.log(
    pad(r.fixture, 18),
    pad(totalDecls, 12),
    pad(`${r.sDecls} (${staticPct}%)`, 14),
    pad(`${r.dDecls} (${dynPct}%)`, 14),
    pad(r.oDecls, 10),
    pad(r.hash, 18),
  );
}

const uniqueHashes = new Set(rows.map((r) => r.hash));
console.log(`\nDistinct static-slice hashes across ${rows.length} fixtures: ${uniqueHashes.size}`);
if (uniqueHashes.size === 1) {
  console.log('→ Static slice is BYTE-IDENTICAL across all brand fixtures.');
} else {
  console.log('→ Static slice DIFFERS across fixtures. Hashes:');
  for (const r of rows) console.log(`   ${r.fixture}: ${r.hash}`);
}

const avgStatic = rows.reduce((a, r) => a + r.staticB, 0) / rows.length;
const avgDyn = rows.reduce((a, r) => a + r.dynB, 0) / rows.length;
const avgOther = rows.reduce((a, r) => a + r.otherB, 0) / rows.length;
const avgTotal = avgStatic + avgDyn + avgOther;
console.log(`\nAverage bytes — static: ${avgStatic.toFixed(0)} (${((avgStatic / avgTotal) * 100).toFixed(1)}%)  dynamic: ${avgDyn.toFixed(0)} (${((avgDyn / avgTotal) * 100).toFixed(1)}%)  other: ${avgOther.toFixed(0)}`);
console.log(`\nProjected per-brand injected size if static slice is hoisted to shared sheet:`);
console.log(`  before: ${avgTotal.toFixed(0)} bytes`);
console.log(`  after:  ${(avgDyn + avgOther).toFixed(0)} bytes (-${((avgStatic / avgTotal) * 100).toFixed(1)}%)`);
