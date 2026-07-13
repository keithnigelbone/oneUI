#!/usr/bin/env tsx
/**
 * audit-component-files.ts
 *
 * Phase 6 — "Standardize component file set".
 *
 * Walks `packages/ui/src/components/*` and reports, per component, which
 * members of the standard file set are present and which are missing.
 *
 * Standard file set (required for any non-infrastructure component):
 *   <Name>.tsx            — Component implementation                 (required)
 *   <Name>.module.css     — CSS Module (token-only styles)           (required)
 *   <Name>.shared.ts      — Shared types (cross-platform prop contract) (required)
 *   <Name>.stories.tsx    — Storybook stories                        (required)
 *   <Name>.test.tsx       — Vitest + RTL tests                       (required)
 *   index.ts              — Public re-exports                        (required)
 *
 *   <Name>.meta.ts        — Component metadata (editor/AI registry)  (optional)
 *   <Name>.recipe.ts      — Brand override recipes                    (optional)
 *   <Name>.tokens.ts      — Declarative token schema                  (optional)
 *   <Name>.showcase.tsx   — In-app showcase page                      (optional)
 *   <Name>Preview.tsx     — Editor preview component                  (optional)
 *
 * Modes:
 *   pnpm audit:component-files            — summary + per-component table
 *   pnpm audit:component-files --strict   — exit 1 if any required file is missing
 *   pnpm audit:component-files --json     — machine-readable JSON output
 *
 * This is intentionally a *report* rather than a hard enforcer. Some
 * components (ExperienceCanvas, ComponentHarness, GridOverlay, …) are
 * infrastructure primitives and are exempted below. Enforcement can be
 * ratcheted up later once the long-tail gaps are filled.
 */

import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const COMPONENTS_ROOT = 'packages/ui/src/components';

// Components that are exempt from the standard file set because they are
// infrastructure primitives, experimental surfaces, or intentionally partial.
// Keep this list short and document each exemption.
const EXEMPT = new Set<string>([
  // Platform-local editor / canvas surfaces (Phase 1 extraction candidates —
  // these live alongside components only because extraction is in-progress).
  'ComponentHarness',
  'ComponentTokenEditor',
  'ExperienceCanvas',
  'Foundations',
  'Brand',
  'Platform',
  'FigmaParity',
  // Debug / dev-tooling overlays — no user-facing surface.
  'GridOverlay',
  // Pure layout primitives — CSS only, no JS behaviour worth unit-testing yet.
  'Grid',
  'Container',
  // In-progress components with open backlog tickets.
  'Select',
  // Private implementation helpers (underscore prefix signals "internal").
  '_sliderInternals',
]);

const REQUIRED_FILES = [
  (name: string) => `${name}.tsx`,
  (name: string) => `${name}.module.css`,
  (name: string) => `${name}.shared.ts`,
  (name: string) => `${name}.stories.tsx`,
  (name: string) => `${name}.test.tsx`,
  () => `index.ts`,
] as const;

const OPTIONAL_FILES = [
  (name: string) => `${name}.meta.ts`,
  (name: string) => `${name}.recipe.ts`,
  (name: string) => `${name}.tokens.ts`,
  (name: string) => `${name}.showcase.tsx`,
  (name: string) => `${name}Preview.tsx`,
] as const;

interface ComponentAudit {
  name: string;
  exempt: boolean;
  missingRequired: string[];
  presentOptional: string[];
  missingOptional: string[];
}

function exists(path: string): boolean {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
}

function auditComponent(name: string): ComponentAudit {
  const dir = join(COMPONENTS_ROOT, name);
  const missingRequired: string[] = [];
  for (const f of REQUIRED_FILES) {
    const file = f(name);
    if (!exists(join(dir, file))) missingRequired.push(file);
  }
  const presentOptional: string[] = [];
  const missingOptional: string[] = [];
  for (const f of OPTIONAL_FILES) {
    const file = f(name);
    if (exists(join(dir, file))) presentOptional.push(file);
    else missingOptional.push(file);
  }
  return {
    name,
    exempt: EXEMPT.has(name),
    missingRequired,
    presentOptional,
    missingOptional,
  };
}

function main() {
  const argv = process.argv.slice(2);
  const strict = argv.includes('--strict');
  const asJson = argv.includes('--json');

  const dirs = readdirSync(COMPONENTS_ROOT)
    .filter((entry) => {
      const full = join(COMPONENTS_ROOT, entry);
      try {
        return statSync(full).isDirectory();
      } catch {
        return false;
      }
    })
    .sort();

  const audits = dirs.map(auditComponent);

  if (asJson) {
    process.stdout.write(JSON.stringify(audits, null, 2) + '\n');
    return;
  }

  const gapped = audits.filter((a) => !a.exempt && a.missingRequired.length > 0);
  const complete = audits.filter((a) => !a.exempt && a.missingRequired.length === 0);
  const exempt = audits.filter((a) => a.exempt);

  console.log('\n  OneUI Component File Standard — Audit Report');
  console.log('  ────────────────────────────────────────────────────────────');
  console.log(`  Total components : ${audits.length}`);
  console.log(`  Fully standard   : ${complete.length}`);
  console.log(`  Missing files    : ${gapped.length}`);
  console.log(`  Exempt           : ${exempt.length}`);
  console.log('');

  if (gapped.length > 0) {
    console.log('  Components missing required files:');
    for (const a of gapped) {
      console.log(`    • ${a.name.padEnd(32)}  missing: ${a.missingRequired.join(', ')}`);
    }
    console.log('');
  }

  if (exempt.length > 0) {
    console.log(`  Exempt (infrastructure / experimental): ${exempt.map((a) => a.name).join(', ')}`);
    console.log('');
  }

  if (strict && gapped.length > 0) {
    console.error(`✘ audit:component-files: ${gapped.length} component(s) missing required files.`);
    process.exit(1);
  }
}

main();
