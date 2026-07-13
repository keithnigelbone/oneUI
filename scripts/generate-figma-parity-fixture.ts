#!/usr/bin/env node
/**
 * Writes hub parity JSON from Figma REST (slug-specific path; Button uses the app harness).
 * Loads `apps/platform/.env.local` when present (does not override existing env vars).
 *
 * Usage (repo root):
 *   pnpm generate:figma-parity-fixture Badge "https://www.figma.com/design/FILE/...?node-id=..."
 *
 * Requires FIGMA_ACCESS_TOKEN or FIGMA_TOKEN for non-empty spec/checks.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { FigmaImplementationSpec } from '../apps/platform/src/lib/agents/validation/extractFigmaImplementationSpec';
import {
  buildParityChecksFromSpec,
  extractFigmaImplementationSpec,
} from '../apps/platform/src/lib/agents/validation/extractFigmaImplementationSpec';
import { defaultParityTargetSelector } from '../apps/platform/src/lib/agents/validation/parityTargetSelectors';
import { parseFigmaDesignUrl } from '../apps/platform/src/lib/agents/validation/parseFigmaUrl';
import { hubParityFixtureLocation } from '../apps/platform/src/lib/agents/validation/figmaParityFixturePaths';
import { resolveDefaultStorybookStoryId } from '../apps/platform/src/lib/agents/validation/scaffoldPlaywrightSpecs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const DEFAULT_BADGE_URL =
  'https://www.figma.com/design/mH1yPtRJzZSNCS0kX737t6/%E2%9D%96--Backup-2026-05-04--OneUI-Components?node-id=2540-10026&m=dev';

function applyDotEnvFile(path: string): void {
  if (!existsSync(path)) return;
  const raw = readFileSync(path, 'utf8');
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

function applyPlatformEnvLocal(): void {
  // Same order as `figma-fetch-variant-matrix-fixture.ts` (never override existing env).
  applyDotEnvFile(join(REPO_ROOT, '.env'));
  applyDotEnvFile(join(REPO_ROOT, '.env.local'));
  applyDotEnvFile(join(REPO_ROOT, 'apps/platform/.env.local'));
}

function placeholderSpec(fileKey: string, nodeId: string): FigmaImplementationSpec {
  return {
    fileKey,
    nodeId,
    rootName: '—',
    rootType: '—',
    primaryBackgroundRgb: null,
    cornerRadiusPx: null,
    strokeRgb: null,
    strokeWeightPx: null,
    layoutMode: null,
    padding: null,
    gapPx: null,
    labelTypography: null,
    solidFillsHex: [],
  };
}

async function main(): Promise<void> {
  applyPlatformEnvLocal();

  const slug = (process.argv[2] ?? 'Badge').trim();
  const figmaUrl = (process.argv[3] ?? process.env.FIGMA_URL ?? DEFAULT_BADGE_URL).trim();

  const parsed = parseFigmaDesignUrl(figmaUrl);
  if (!parsed) {
    console.error('Invalid Figma URL — expected figma.com/design/... with node-id.');
    process.exit(1);
  }

  const extracted = await extractFigmaImplementationSpec(parsed.fileKey, parsed.nodeId);
  const checks = extracted.spec ? buildParityChecksFromSpec(extracted.spec) : [];
  const spec = extracted.spec ?? placeholderSpec(parsed.fileKey, parsed.nodeId);

  const { dir: outDir, fileName } = hubParityFixtureLocation(REPO_ROOT, slug);
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, fileName);

  const storyId =
    resolveDefaultStorybookStoryId(REPO_ROOT, slug) ??
    `components-display-${slug.toLowerCase()}--default`;
  const targetSelector = defaultParityTargetSelector(slug);

  const payload = {
    meta: {
      componentSlug: slug,
      storyId,
      targetSelector,
      figmaFileKey: parsed.fileKey,
      figmaNodeId: parsed.nodeId,
      generated: extracted.spec !== null && checks.length > 0,
    },
    spec,
    checks,
  };

  writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${outPath} (${checks.length} check(s)).`);
  if (checks.some((c) => c.property === 'background-color')) {
    console.warn(
      'Note: background-color checks compare Figma RGB to computed CSS; tokenized fills often serialize as oklch(). Use a Figma node-id for the component instance, not a parent frame, or trim checks in the fixture.',
    );
  }
  if (extracted.apiHint) console.warn(`Figma API hint: ${extracted.apiHint}`);
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
