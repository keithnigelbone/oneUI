#!/usr/bin/env node
/**
 * capture-designmd-spec.ts
 *
 * Captures the Google Labs `design.md` spec (via `npx @google/design.md spec`)
 * and writes it to two places:
 *
 *   1. `docs/design-md-spec-alpha.md`         — human-readable reference
 *   2. `packages/shared/src/engine/compositionDesignMdSpec.ts` — runtime import
 *
 * The `.ts` file is the runtime source of truth for agent priming; the `.md`
 * file is the human mirror. We regenerate rather than hand-maintain so any
 * upstream spec change is a one-command refresh.
 *
 * Run: `pnpm designmd:capture-spec`
 */

import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const DOCS_PATH = resolve(REPO_ROOT, 'docs/design-md-spec-alpha.md');
const TS_OUT = resolve(
  REPO_ROOT,
  'packages/shared/src/engine/compositionDesignMdSpec.ts',
);

function fetchSpec(): string {
  const result = spawnSync('npx', ['--yes', '@google/design.md', 'spec'], {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(
      `design.md spec CLI failed (exit ${result.status}): ${result.stderr}`,
    );
  }
  return result.stdout;
}

function escapeForBacktickTemplate(source: string): string {
  return source
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

function main(): void {
  const spec = fetchSpec();

  writeFileSync(DOCS_PATH, spec, 'utf8');

  const ts = [
    '/**',
    ' * compositionDesignMdSpec.ts',
    ' *',
    ' * Verbatim capture of `npx @google/design.md spec` output. Used by the',
    ' * design agent executor to prime models when an external DESIGN.md is',
    ' * supplied alongside a composition request. The runtime import is this',
    ' * file; `docs/design-md-spec-alpha.md` is a human-readable mirror.',
    ' *',
    ' * Regenerate: `pnpm designmd:capture-spec`. Do not hand-edit.',
    ' */',
    '',
    `export const DESIGN_MD_SPEC_ALPHA = \`${escapeForBacktickTemplate(spec)}\`;`,
    '',
  ].join('\n');

  writeFileSync(TS_OUT, ts, 'utf8');

  // eslint-disable-next-line no-console
  console.log(
    `captured ${spec.length} chars → docs/design-md-spec-alpha.md\n` +
      `bundled packages/shared/src/engine/compositionDesignMdSpec.ts`,
  );
}

main();
