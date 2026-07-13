/**
 * One-off measurement: estimate how big a sub-brand delta CSS would be.
 *
 * Approach: parse an existing per-brand CDN CSS, attribute every declaration
 * to a role (primary / secondary / sparkle / brand-bg / neutral / positive /
 * negative / warning / informative) by its CSS variable name prefix, then
 * report byte distribution. The 4 overridable accent roles' share is the
 * delta upper bound; everything else is inherited from the parent.
 *
 * Run: pnpm tsx scripts/measure-subbrand-delta.ts <brandSlug>
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROLE_PREFIXES: Record<string, string[]> = {
  primary:     ['--Primary-'],
  secondary:   ['--Secondary-'],
  sparkle:     ['--Sparkle-'],
  'brand-bg':  ['--Brand-Bg-', '--BrandBg-'],
  neutral:     ['--Neutral-'],
  positive:    ['--Positive-'],
  negative:    ['--Negative-'],
  warning:     ['--Warning-'],
  informative: ['--Informative-'],
};
const OVERRIDDEN = new Set(['primary', 'secondary', 'sparkle', 'brand-bg']);

function classifyDeclaration(line: string): string | null {
  const m = line.match(/(--[A-Za-z0-9_-]+)\s*:/);
  if (!m) return null;
  const token = m[1];
  for (const [role, prefixes] of Object.entries(ROLE_PREFIXES)) {
    if (prefixes.some((p) => token.startsWith(p))) return role;
  }
  return 'other';
}

function measure(cssPath: string): void {
  const css = readFileSync(cssPath, 'utf8');
  const totalBytes = Buffer.byteLength(css, 'utf8');

  const roleBytes: Record<string, number> = {};
  let structuralBytes = 0;
  let declarationCount = 0;
  const roleCounts: Record<string, number> = {};

  for (const line of css.split('\n')) {
    const bytes = Buffer.byteLength(line + '\n', 'utf8');
    const role = classifyDeclaration(line);
    if (role) {
      roleBytes[role] = (roleBytes[role] ?? 0) + bytes;
      roleCounts[role] = (roleCounts[role] ?? 0) + 1;
      declarationCount++;
    } else {
      structuralBytes += bytes;
    }
  }

  const overriddenBytes = Object.entries(roleBytes)
    .filter(([r]) => OVERRIDDEN.has(r))
    .reduce((s, [, b]) => s + b, 0);
  const inheritedBytes = Object.entries(roleBytes)
    .filter(([r]) => !OVERRIDDEN.has(r))
    .reduce((s, [, b]) => s + b, 0);

  console.log(`\n=== ${cssPath} ===`);
  console.log(`Total bytes:           ${totalBytes.toLocaleString()} (${(totalBytes / 1024).toFixed(1)} KB)`);
  console.log(`Declaration lines:     ${declarationCount.toLocaleString()}`);
  console.log(`Structural / other:    ${structuralBytes.toLocaleString()} (${(structuralBytes / 1024).toFixed(1)} KB)`);
  console.log(`\nBytes by role:`);
  for (const role of Object.keys(ROLE_PREFIXES)) {
    const b = roleBytes[role] ?? 0;
    const c = roleCounts[role] ?? 0;
    const mark = OVERRIDDEN.has(role) ? '★' : ' ';
    console.log(`  ${mark} ${role.padEnd(12)} ${b.toString().padStart(8)} bytes  (${(b / totalBytes * 100).toFixed(1)}%)  ${c} decls`);
  }
  console.log(`\nDelta estimate (overridden roles' declarations only):`);
  console.log(`  Overridden roles:    ${overriddenBytes.toLocaleString()} (${(overriddenBytes / 1024).toFixed(1)} KB)`);
  console.log(`  Inherited roles:     ${inheritedBytes.toLocaleString()} (${(inheritedBytes / 1024).toFixed(1)} KB)`);
  console.log(`  Structural (delta):  ~${Math.round(structuralBytes * (overriddenBytes / (overriddenBytes + inheritedBytes || 1))).toLocaleString()} (proportional share)`);
  const deltaApprox = overriddenBytes + Math.round(structuralBytes * (overriddenBytes / (overriddenBytes + inheritedBytes || 1)));
  console.log(`  → Delta CSS approx:  ${deltaApprox.toLocaleString()} bytes (${(deltaApprox / 1024).toFixed(1)} KB) = ${(deltaApprox / totalBytes * 100).toFixed(1)}% of full`);
}

const brandsDir = resolve(process.cwd(), 'cdn-dist/brands');
const arg = process.argv[2];

if (arg) {
  const path = join(brandsDir, arg, 'latest.css');
  if (!existsSync(path)) {
    console.error(`Not found: ${path}`);
    process.exit(1);
  }
  measure(path);
} else {
  console.log('No brand specified — measuring jio, reliance, swadesh as samples.');
  for (const slug of ['jio', 'reliance', 'swadesh']) {
    const path = join(brandsDir, slug, 'latest.css');
    if (existsSync(path)) measure(path);
  }
}

// Summary across all real (non-synthetic) brands listed in manifest
try {
  const manifestPath = join(brandsDir, 'manifest.json');
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
      brands: Array<{ slug: string; synthetic?: boolean; cssBytes?: number }>;
    };
    const real = manifest.brands.filter((b) => !b.synthetic);
    console.log(`\n=== Summary across ${real.length} real brand(s) ===`);
    let totalFull = 0;
    let totalDelta = 0;
    for (const b of real) {
      const p = join(brandsDir, b.slug, 'latest.css');
      if (!existsSync(p)) continue;
      const css = readFileSync(p, 'utf8');
      const total = Buffer.byteLength(css, 'utf8');
      let over = 0, inh = 0, struc = 0;
      for (const line of css.split('\n')) {
        const bytes = Buffer.byteLength(line + '\n', 'utf8');
        const role = classifyDeclaration(line);
        if (!role) struc += bytes;
        else if (OVERRIDDEN.has(role)) over += bytes;
        else inh += bytes;
      }
      const delta = over + Math.round(struc * (over / (over + inh || 1)));
      totalFull += total;
      totalDelta += delta;
      console.log(`  ${b.slug.padEnd(20)} full=${(total/1024).toFixed(0).padStart(4)}KB  delta≈${(delta/1024).toFixed(0).padStart(3)}KB  (${(delta/total*100).toFixed(1)}%)`);
    }
    console.log(`\n  TOTAL full:   ${(totalFull/1024).toFixed(0)} KB`);
    console.log(`  TOTAL delta:  ${(totalDelta/1024).toFixed(0)} KB`);
    console.log(`  Savings:      ${((1 - totalDelta/totalFull) * 100).toFixed(1)}% if every brand had 1 sub-brand`);
  }
} catch (err) {
  console.warn('Could not compute summary:', (err as Error).message);
}
