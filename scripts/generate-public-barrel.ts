#!/usr/bin/env node
/**
 * generate-public-barrel.ts
 *
 * Generates `packages/ui/src/index.public.ts` from `packages/ui/src/index.ts`
 * by dropping every `export ... from './components/<Name>'` statement whose
 * component folder is not on the released-component list
 * (`packages/ui/src/registry/releasedComponents.ts`).
 *
 * The published tarball's root export (`.`) is pointed at the built
 * `dist/index.public.*` by `cdn-release-full-pipeline/build/stagePackage.ts`,
 * so WIP components cannot be imported from the package root. Everything that
 * is not a component re-export (providers, hooks, contexts, icons, registry,
 * engine, runtime, utils, shared types) is kept verbatim — only component
 * exposure is gated.
 *
 * Run:   pnpm generate:public-barrel
 * Check: pnpm check:public-barrel   (CI freshness gate — no writes)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isComponentReleased } from '../packages/ui/src/registry/releasedComponents';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SOURCE = resolve(ROOT, 'packages/ui/src/index.ts');
const TARGET = resolve(ROOT, 'packages/ui/src/index.public.ts');

const BANNER = `/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * Public (released) barrel for @oneui/ui. Generated from src/index.ts by
 * scripts/generate-public-barrel.ts; the published tarball's root export
 * points here so WIP components are not importable from the package root.
 *
 * To change what is exported: edit src/index.ts and/or
 * src/registry/releasedComponents.ts, then run \`pnpm generate:public-barrel\`.
 */

`;

/**
 * Matches one top-level re-export statement. Statements in src/index.ts never
 * contain `;` or `}` inside the braces, so the lazy body match is safe. The
 * specifier quote is captured (group 1) and back-referenced so both single-
 * and double-quoted `from` specifiers are recognised — otherwise a stray
 * double-quoted export (e.g. after a one-off reformat) would slip a WIP
 * component past the filter undetected. Group 2 is the specifier.
 */
const EXPORT_FROM_RE = /export\s+(?:type\s+)?\{[^}]*\}\s+from\s+(['"])([^'"]+)\1;/g;

/** Folder name when the specifier targets a component module, else null. */
function componentFolder(specifier: string): string | null {
  const match = specifier.match(/^\.\/components\/([^/']+)/);
  return match ? match[1] : null;
}

export function generatePublicBarrel(source: string): string {
  const dropped: string[] = [];
  const filtered = source.replace(EXPORT_FROM_RE, (statement, _quote: string, specifier: string) => {
    const folder = componentFolder(specifier);
    if (folder !== null && !isComponentReleased(folder)) {
      if (!dropped.includes(folder)) dropped.push(folder);
      return '';
    }
    return statement;
  });

  // Collapse the blank runs left behind by removed statements.
  const compacted = filtered.replace(/\n{3,}/g, '\n\n');

  console.log(`  dropped ${dropped.length} unreleased component module(s): ${dropped.join(', ')}`);
  return BANNER + compacted;
}

function main(): void {
  const checkOnly = process.argv.includes('--check');
  const source = readFileSync(SOURCE, 'utf8');
  const generated = generatePublicBarrel(source);

  if (checkOnly) {
    let existing = '';
    try {
      existing = readFileSync(TARGET, 'utf8');
    } catch {
      console.error('✗ packages/ui/src/index.public.ts is missing. Run: pnpm generate:public-barrel');
      process.exit(1);
    }
    if (existing !== generated) {
      console.error('✗ packages/ui/src/index.public.ts is stale. Run: pnpm generate:public-barrel');
      process.exit(1);
    }
    console.log('✓ public barrel is fresh');
    return;
  }

  writeFileSync(TARGET, generated, 'utf8');
  console.log(`✓ wrote ${TARGET}`);
}

// Only run when executed as a script (pnpm generate:public-barrel /
// check:public-barrel). Guarding this lets the pure `generatePublicBarrel`
// be imported by unit tests without triggering a real file read/write.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
