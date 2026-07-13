/**
 * Hash the underlying (step,token,value) cells of the static slice, not the
 * rule structure. Two fixtures with the same static cells but different rule
 * groupings should hash identically.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

const STATIC = ['--Neutral-', '--Positive-', '--Negative-', '--Warning-', '--Informative-', '--Border-'];
const isStatic = (t: string) => STATIC.some((p) => t.startsWith(p));

function extract(css: string): string[] {
  const cells = new Map<string, string>(); // "ctx::step::token" -> value
  const ruleRe = /([^{}]+)\{([^{}]+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = ruleRe.exec(css)) !== null) {
    const selectorList = m[1].trim();
    const body = m[2];
    const decls: Array<[string, string]> = [];
    const declRe = /(--[A-Za-z][\w-]+):\s*([^;]+);/g;
    let d: RegExpExecArray | null;
    while ((d = declRe.exec(body)) !== null) {
      if (isStatic(d[1])) decls.push([d[1], d[2].trim()]);
    }
    if (decls.length === 0) continue;
    for (const sel of selectorList.split(',').map((s) => s.trim())) {
      let ctx = 'agnostic';
      let stepMatch = /\[data-surface-step="(\d+)"\]/.exec(sel);
      if (sel.startsWith('[data-theme="light"]')) ctx = 'light';
      else if (sel.startsWith('[data-theme="dark"]')) ctx = 'dark';
      else if (sel === ':root') stepMatch = null; // universe
      const steps = stepMatch ? [stepMatch[1]] : (ctx === 'agnostic' ? ['*'] : []);
      for (const step of steps) {
        for (const [token, value] of decls) {
          cells.set(`${ctx}::${step}::${token}`, value);
        }
      }
    }
  }
  return [...cells.entries()].map(([k, v]) => `${k}=${v}`).sort();
}

const dir = path.join(process.cwd(), 'temp/surface-step-lookup');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.css')).sort();

const hashes = new Map<string, string[]>();
for (const f of files) {
  const css = fs.readFileSync(path.join(dir, f), 'utf8');
  const cells = extract(css);
  const h = crypto.createHash('sha256').update(cells.join('\n')).digest('hex').slice(0, 16);
  const name = f.replace('surface-step-lookup--full-injected--', '').replace('.css', '');
  console.log(`${name.padEnd(16)} ${cells.length.toString().padStart(5)} cells  hash=${h}`);
  if (!hashes.has(h)) hashes.set(h, []);
  hashes.get(h)!.push(name);
}

console.log(`\nDistinct content hashes: ${hashes.size}`);
for (const [h, names] of hashes) console.log(`  ${h}: ${names.join(', ')}`);
