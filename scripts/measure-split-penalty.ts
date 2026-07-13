/**
 * Measure how often the grouped emitter co-locates a static-prefix token and a
 * dynamic-prefix token in the SAME rule (same step-set, same value). Splitting
 * the emitter breaks that co-location and adds an extra rule per mixed group.
 *
 * Reports per fixture:
 *   - rules total
 *   - rules with >1 declaration
 *   - mixed rules (would split into 2 rules after the split)
 *   - extra bytes added by splitting (duplicated selector list)
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const STATIC = ['--Neutral-', '--Positive-', '--Negative-', '--Warning-', '--Informative-', '--Border-'];
const isStatic = (t: string) => STATIC.some((p) => t.startsWith(p));

interface Rule {
  selector: string;
  decls: { token: string; value: string }[];
}

function parseRules(css: string): Rule[] {
  const out: Rule[] = [];
  const ruleRe = /([^{}]+)\{([^{}]+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = ruleRe.exec(css)) !== null) {
    const selector = m[1].trim();
    const body = m[2];
    const decls: Rule['decls'] = [];
    const declRe = /(--[A-Za-z][\w-]+):\s*([^;]+);/g;
    let d: RegExpExecArray | null;
    while ((d = declRe.exec(body)) !== null) {
      decls.push({ token: d[1], value: d[2].trim() });
    }
    if (decls.length > 0) out.push({ selector, decls });
  }
  return out;
}

const dir = path.join(process.cwd(), 'temp/surface-step-lookup');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.css')).sort();

const pad = (s: string | number, n: number) => String(s).padEnd(n);
console.log(
  pad('fixture', 16),
  pad('rules', 8),
  pad('multi-decl', 12),
  pad('mixed', 8),
  pad('extra bytes', 14),
  pad('% of CSS', 10),
);

for (const f of files) {
  const css = fs.readFileSync(path.join(dir, f), 'utf8');
  const rules = parseRules(css);
  let multi = 0;
  let mixed = 0;
  let extraBytes = 0;
  for (const r of rules) {
    if (r.decls.length > 1) multi++;
    const hasStatic = r.decls.some((d) => isStatic(d.token));
    const hasDyn = r.decls.some((d) => !isStatic(d.token));
    if (hasStatic && hasDyn) {
      mixed++;
      // Cost of splitting: duplicate the selector list (one extra " { }" wrap)
      // The selector + brace overhead per duplicated rule:
      extraBytes += Buffer.byteLength(r.selector, 'utf8') + 4; // selector + " {\n}" overhead
    }
  }
  const totalBytes = Buffer.byteLength(css, 'utf8');
  const pct = ((extraBytes / totalBytes) * 100).toFixed(2);
  console.log(
    pad(f.replace('surface-step-lookup--full-injected--', '').replace('.css', ''), 16),
    pad(rules.length, 8),
    pad(multi, 12),
    pad(mixed, 8),
    pad(extraBytes, 14),
    pad(`${pct}%`, 10),
  );
}
