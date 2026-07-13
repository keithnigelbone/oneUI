import * as fs from 'node:fs';
import * as path from 'node:path';

const STATIC = ['--Neutral-', '--Positive-', '--Negative-', '--Warning-', '--Informative-', '--Border-'];
const isStatic = (t: string) => STATIC.some((p) => t.startsWith(p));

function extractStaticPairs(css: string): Map<string, Set<string>> {
  // token -> set of "selector::value" entries
  const out = new Map<string, Set<string>>();
  const ruleRe = /([^{}]+)\{([^{}]+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = ruleRe.exec(css)) !== null) {
    const selector = m[1].trim().replace(/\s+/g, ' ');
    const body = m[2];
    const declRe = /(--[A-Za-z][\w-]+):\s*([^;]+);/g;
    let d: RegExpExecArray | null;
    while ((d = declRe.exec(body)) !== null) {
      const token = d[1];
      if (!isStatic(token)) continue;
      const value = d[2].trim();
      // Expand selector list into individual step selectors
      for (const sel of selector.split(',').map((s) => s.trim())) {
        const stepMatch = /\[data-surface-step="(\d+)"\]/.exec(sel);
        if (!stepMatch) continue;
        const step = stepMatch[1];
        const key = `step=${step}::${token}`;
        if (!out.has(key)) out.set(key, new Set());
        out.get(key)!.add(value);
      }
    }
  }
  return out;
}

const dir = path.join(process.cwd(), 'temp/surface-step-lookup');
const a = fs.readFileSync(path.join(dir, 'surface-step-lookup--full-injected--jio-default.css'), 'utf8');
const b = fs.readFileSync(path.join(dir, 'surface-step-lookup--full-injected--deep-base.css'), 'utf8');
const c = fs.readFileSync(path.join(dir, 'surface-step-lookup--full-injected--shallow-base.css'), 'utf8');

const ma = extractStaticPairs(a);
const mb = extractStaticPairs(b);
const mc = extractStaticPairs(c);

function diff(label: string, base: Map<string, Set<string>>, other: Map<string, Set<string>>) {
  const keys = new Set([...base.keys(), ...other.keys()]);
  let differ = 0;
  const diffs: string[] = [];
  for (const k of keys) {
    const va = [...(base.get(k) ?? [])].join('|');
    const vb = [...(other.get(k) ?? [])].join('|');
    if (va !== vb) {
      differ++;
      if (diffs.length < 12) diffs.push(`  ${k}\n    jio-default: ${va || '(missing)'}\n    ${label}:    ${vb || '(missing)'}`);
    }
  }
  console.log(`\njio-default vs ${label}: ${differ} differing (step,token) cells`);
  diffs.forEach((d) => console.log(d));
}

diff('deep-base', ma, mb);
diff('shallow-base', ma, mc);

// Token-prefix breakdown of differences
function prefixBreakdown(label: string, base: Map<string, Set<string>>, other: Map<string, Set<string>>) {
  const counts = new Map<string, number>();
  const keys = new Set([...base.keys(), ...other.keys()]);
  for (const k of keys) {
    const va = [...(base.get(k) ?? [])].join('|');
    const vb = [...(other.get(k) ?? [])].join('|');
    if (va !== vb) {
      const token = k.split('::')[1];
      const prefix = STATIC.find((p) => token.startsWith(p)) ?? 'other';
      counts.set(prefix, (counts.get(prefix) ?? 0) + 1);
    }
  }
  console.log(`\n  prefix breakdown (${label}):`);
  for (const [p, c] of [...counts.entries()].sort((x, y) => y[1] - x[1])) {
    console.log(`    ${p.padEnd(18)} ${c}`);
  }
}
prefixBreakdown('deep-base', ma, mb);
prefixBreakdown('shallow-base', ma, mc);
