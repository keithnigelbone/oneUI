#!/usr/bin/env tsx
/**
 * Phase 1 of legacy_context_css_removal_plan.md.
 *
 * For each fixture brand, generates the legacy `[data-surface="<mode>"]`
 * context CSS and the step-keyed `[data-surface-step="N"]` lookup CSS, then
 * partitions every token emitted in a legacy block into one of:
 *
 *   - "redundant"   : the same token appears in some step-lookup block.
 *                     Safe to drop from legacy emissions — step-lookup will
 *                     provide the value at depth ≥ 1.
 *   - "legacy-only" : token never appears in any step-lookup block. Must be
 *                     migrated into the step-keyed cascade (or accepted to
 *                     work only at depth 1).
 *
 * Run: pnpm tsx scripts/audit-legacy-context-redundancy.ts
 */
import {
  generateNewContextCSS,
  generateNewStepLookupCSS,
} from '@oneui/ui/engine';

import { BRANDS, buildFixturePalette } from './verify-theme-redundancy';

type ModeBlocks = Map<string, Map<string, string>>; // mode → token → value
type StepBlocks = Map<string, Map<string, string>>; // step → token → value

function parseDecls(body: string): Map<string, string> {
  const decls = new Map<string, string>();
  for (const raw of body.split(';')) {
    const line = raw.trim();
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const prop = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (prop.startsWith('--')) decls.set(prop, val);
  }
  return decls;
}

function parseLegacyContext(css: string): ModeBlocks {
  const out: ModeBlocks = new Map();
  const re = /\[data-surface="([^"]+)"\]\s*\{([^}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) {
    out.set(m[1], parseDecls(m[2]));
  }
  return out;
}

function parseStepLookup(css: string): {
  agnostic: StepBlocks;
  overlays: StepBlocks;
} {
  const overlays: StepBlocks = new Map();
  const overlayRe =
    /\[data-theme="(light|dark)"\][^{]*\[data-surface-step="(\d+)"\][^{]*\{([^}]*)\}/g;
  let m: RegExpExecArray | null;
  let overlaySeq = 0;
  while ((m = overlayRe.exec(css)) !== null) {
    // Use a unique key per match (grouped emitter writes multiple overlay
    // rules per theme — one per slice — that would collide on theme:step).
    overlays.set(`${m[1]}:${m[2]}#${overlaySeq++}`, parseDecls(m[3]));
  }
  // Strip overlay blocks before matching bare blocks.
  const stripped = css.replace(overlayRe, '');
  const agnostic: StepBlocks = new Map();

  // Grouped emitter writes multi-step selector lists. Match any rule whose
  // first selector hits [data-surface-step="N"]; capture all step numbers in
  // the selector list.
  const ruleRe = /([^{}]+)\{([^}]*)\}/g;
  while ((m = ruleRe.exec(stripped)) !== null) {
    const selector = m[1];
    const body = m[2];
    const stepMatches = [...selector.matchAll(/\[data-surface-step="(\d+)"\]/g)];
    if (stepMatches.length === 0) continue;
    const decls = parseDecls(body);
    for (const sm of stepMatches) {
      const step = sm[1];
      let bucket = agnostic.get(step);
      if (!bucket) {
        bucket = new Map();
        agnostic.set(step, bucket);
      }
      for (const [k, v] of decls) bucket.set(k, v);
    }
  }
  return { agnostic, overlays };
}

function prefixOf(token: string): string {
  // `--Primary-Bold-High` → `--Primary`
  // `--Surface-Halo-Gap`  → `--Surface`
  const m = /^(--[A-Za-z]+(?:-[A-Z][a-z]+)?)/.exec(token);
  // Simpler: just first two segments
  const parts = token.split('-').filter(Boolean);
  return parts.length >= 2 ? `--${parts[0]}` : token;
}

function main() {
  const tokenStatus = new Map<
    string,
    { brands: Set<string>; modes: Set<string>; redundant: boolean }
  >();

  for (const brand of BRANDS) {
    const palette = buildFixturePalette(brand);
    const contextCSS = generateNewContextCSS(palette, 'light');
    const stepCSS = generateNewStepLookupCSS(palette);

    const legacy = parseLegacyContext(contextCSS);
    const { agnostic, overlays } = parseStepLookup(stepCSS);

    const stepLookupTokens = new Set<string>();
    for (const decls of agnostic.values())
      for (const t of decls.keys()) stepLookupTokens.add(t);
    for (const decls of overlays.values())
      for (const t of decls.keys()) stepLookupTokens.add(t);

    for (const [mode, decls] of legacy) {
      for (const token of decls.keys()) {
        const status = tokenStatus.get(token) ?? {
          brands: new Set(),
          modes: new Set(),
          redundant: stepLookupTokens.has(token),
        };
        status.brands.add(brand.name);
        status.modes.add(mode);
        // A token is considered legacy-only iff it's missing from step-lookup
        // for EVERY brand. So if any brand has it covered, it's redundant.
        if (stepLookupTokens.has(token)) status.redundant = true;
        tokenStatus.set(token, status);
      }
    }
  }

  // Group + report
  const redundant: string[] = [];
  const legacyOnly: string[] = [];
  for (const [token, st] of tokenStatus) {
    (st.redundant ? redundant : legacyOnly).push(token);
  }
  redundant.sort();
  legacyOnly.sort();

  console.log('Legacy [data-surface="<mode>"] redundancy audit');
  console.log('===============================================\n');
  console.log(`Total unique tokens emitted in legacy blocks: ${tokenStatus.size}`);
  console.log(`  Redundant (also in step-lookup): ${redundant.length}`);
  console.log(`  Legacy-only (must migrate or drop): ${legacyOnly.length}\n`);

  // Prefix breakdown
  const byPrefix = new Map<string, { redundant: number; legacyOnly: number }>();
  for (const t of redundant) {
    const p = prefixOf(t);
    const b = byPrefix.get(p) ?? { redundant: 0, legacyOnly: 0 };
    b.redundant++;
    byPrefix.set(p, b);
  }
  for (const t of legacyOnly) {
    const p = prefixOf(t);
    const b = byPrefix.get(p) ?? { redundant: 0, legacyOnly: 0 };
    b.legacyOnly++;
    byPrefix.set(p, b);
  }

  console.log('Per-prefix breakdown:');
  console.log('  prefix'.padEnd(20), 'redundant'.padEnd(12), 'legacy-only');
  for (const [p, b] of [...byPrefix].sort()) {
    console.log('  ' + p.padEnd(18), String(b.redundant).padEnd(12), b.legacyOnly);
  }

  console.log('\nLegacy-only tokens (need migration or to remain depth-1 only):');
  for (const t of legacyOnly) {
    const st = tokenStatus.get(t)!;
    console.log(`  ${t}   (modes: ${[...st.modes].join(', ')})`);
  }
}

main();
