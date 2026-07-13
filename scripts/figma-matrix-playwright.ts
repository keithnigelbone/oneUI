#!/usr/bin/env node
/**
 * Run Playwright figma-variant-matrix suite for a component folder under packages/ui/src/__tests__/<Slug>/.
 *
 * Usage (repo root): pnpm figma-matrix:test Checkbox
 */

import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const slug = process.argv[2]?.trim();
if (!slug) {
  console.error('Usage: pnpm figma-matrix:test <Slug>');
  console.error('Example: pnpm figma-matrix:test Checkbox');
  process.exit(1);
}

const config = join(REPO_ROOT, 'packages/ui/src/__tests__', slug, 'playwright.figma-matrix.config.ts');
if (!existsSync(config)) {
  console.error(`Missing ${config} — run pnpm figma-matrix:scaffold ${slug} ${slug}`);
  process.exit(1);
}

const r = spawnSync('pnpm', ['exec', 'playwright', 'test', '--config', config], {
  stdio: 'inherit',
  cwd: REPO_ROOT,
  env: { ...process.env },
});

process.exit(r.status === null ? 1 : r.status);
