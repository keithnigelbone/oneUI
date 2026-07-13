#!/usr/bin/env tsx
/**
 * Dumps RFC-0003 surface step lookup CSS (`generateNewStepLookupCSS`) — the same
 * token-boundary-filtered string injected by useBrandCSS — for inspection under temp/.
 *
 * Modes:
 *   • Convex (default when a deployment URL is set: CONVEX_URL, NEXT_PUBLIC_CONVEX_URL, or STORYBOOK_CONVEX_URL):
 *     For each brand returned by `brands:list`, pulls `foundations:getBrandOverviewData`
 *     and writes one file per brand slug — matches platform / Storybook inputs.
 *   • Fixtures (`--fixture-only` or no Convex URL):
 *     Offline regression fixtures shared with `verify-theme-redundancy.ts`.
 *
 * Options:
 *   --fixture-only     Skip Convex; only write fixture files.
 *   --slug=<slug>      Only this brand (Convex: match brand.slug; fixtures: match fixture name).
 *
 * TLS / corporate proxy: put `NODE_EXTRA_CA_CERTS=/path/to/corp-root.pem` in `.env.local`
 * (or export it in the shell). Node reads it before HTTPS — loading `.env.local` here applies it.
 *
 * Usage:
 *   pnpm dump:step-css
 *   pnpm dump:step-css --slug=tira
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import { ConvexHttpClient } from 'convex/browser';
import { buildAvailableScales } from '@oneui/shared/engine';
import { buildNewPaletteData, generateNewStepLookupCSS } from '@oneui/ui/engine';
import { api } from '../packages/convex/convex/_generated/api';
import type { Id } from '../packages/convex/convex/_generated/dataModel';

import { BRANDS, buildFixturePalette } from './verify-theme-redundancy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');

/** Minimal dotenv merge — does not override vars already set in the shell. */
function mergeEnvFromFile(absPath: string): void {
  if (!existsSync(absPath)) return;
  const text = readFileSync(absPath, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    if (process.env[key] !== undefined) continue;
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

mergeEnvFromFile(resolve(REPO_ROOT, '.env'));
mergeEnvFromFile(resolve(REPO_ROOT, '.env.local'));

const args = process.argv.slice(2);
function getArg(name: string): string | undefined {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  if (hit) return hit.slice(name.length + 3);
  return undefined;
}

const FIXTURE_ONLY = args.includes('--fixture-only');
const SLUG_FILTER = getArg('slug')?.trim().toLowerCase();

const CONVEX_URL =
  process.env.CONVEX_URL ??
  process.env.NEXT_PUBLIC_CONVEX_URL ??
  process.env.STORYBOOK_CONVEX_URL;

function header(lines: string[]): string {
  return `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */\n\n`;
}

function sanitizeFilenameSlug(slug: string): string {
  return slug.replace(/[^a-zA-Z0-9._-]+/g, '_');
}

function generateFromFoundationOverview(foundation: Record<string, unknown> | null | undefined): string | null {
  if (!foundation) return null;
  const colorConfig = (foundation.color as { config?: unknown } | null)?.config;
  const presetSelection = foundation.presetSelection ?? null;
  const appearanceConfig = foundation.appearanceConfig ?? null;
  if (!colorConfig || !appearanceConfig) return null;

  const scales = buildAvailableScales(
    colorConfig as Parameters<typeof buildAvailableScales>[0],
    presetSelection as Parameters<typeof buildAvailableScales>[1],
  );
  const palette = buildNewPaletteData(
    scales,
    appearanceConfig as Parameters<typeof buildNewPaletteData>[1],
  );
  if (!palette) return null;
  return generateNewStepLookupCSS(palette);
}

function writeFullInjected(
  outDir: string,
  slug: string,
  displayName: string,
  sourceLine: string,
  css: string,
): void {
  const safe = sanitizeFilenameSlug(slug);
  const name = `surface-step-lookup--full-injected--${safe}.css`;
  const p = resolve(outDir, name);
  const bytes = Buffer.byteLength(css, 'utf8');
  writeFileSync(
    p,
    header([
      `Brand: ${displayName} (slug: ${slug})`,
      sourceLine,
      'Generated: scripts/dump-step-lookup-css.ts',
      `UTF-8 bytes (body): ${bytes}`,
    ]) + css,
    'utf8',
  );
  console.log(`Wrote ${p} (${bytes} bytes)`);
}

function collectErrorText(err: unknown, depth = 0): string {
  if (depth > 6) return '';
  if (err == null) return '';

  if (err instanceof Error) {
    const code =
      'code' in err && typeof (err as NodeJS.ErrnoException).code === 'string'
        ? (err as NodeJS.ErrnoException).code
        : '';
    const inner = (err as Error & { cause?: unknown }).cause;
    const nested = inner !== undefined ? collectErrorText(inner, depth + 1) : '';
    const head = [code, `${err.name}: ${err.message}`].filter(Boolean).join(' ');
    return [head, nested].filter(Boolean).join(' | ');
  }

  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = String((err as { code: unknown }).code);
    const msg =
      'message' in err && typeof (err as { message: unknown }).message === 'string'
        ? (err as { message: string }).message
        : '';
    const inner = collectErrorText((err as { cause?: unknown }).cause, depth + 1);
    return [code, msg, inner].filter(Boolean).join(' | ');
  }

  return String(err);
}

function isProbablyTlsError(err: unknown): boolean {
  const text = collectErrorText(err);
  if (/UNABLE_TO_GET_ISSUER|UNABLE_TO_VERIFY|issuer certificate|DEPTH_ZERO|SELF_SIGNED|certificate chain|TLS|SSL|cert/i.test(text)) {
    return true;
  }
  // fetch failed — inspect cause for Node TLS codes (common behind corporate proxies).
  if (/fetch failed/i.test(text) && /issuer|certificate|UNABLE_|TLS|SSL|CERT_/i.test(text)) return true;
  return false;
}

function printTlsHint(err: unknown, deploymentUrl: string): void {
  if (!isProbablyTlsError(err)) return;
  const full = collectErrorText(err);
  const extraCa = process.env.NODE_EXTRA_CA_CERTS;
  console.error(`
[dump-step-lookup-css] HTTPS / TLS failure calling ${deploymentUrl}

Your error (${/UNABLE_TO_GET_ISSUER/i.test(full) ? 'missing/intermediate CA in Node trust store' : 'TLS'}): common on networks that inspect HTTPS.

Fix (preferred): point Node at your organisation root CA PEM file:
  • In .env.local (this script loads it):
      NODE_EXTRA_CA_CERTS=/absolute/path/to/corporate-root-or-chain.pem
  • Or in the shell:
      export NODE_EXTRA_CA_CERTS=/path/to/corp.pem

Get the PEM from IT / export from Keychain (macOS) or Windows cert manager. Append intermediate + root into one .pem if needed.

${extraCa ? `NODE_EXTRA_CA_CERTS is set to "${extraCa}" — check the path exists and the file includes the issuing CA for your proxy.` : 'NODE_EXTRA_CA_CERTS is not set.'}

Full detail: ${full}
`);
}

async function dumpFromConvex(outDir: string, deploymentUrl: string): Promise<number> {
  const client = new ConvexHttpClient(deploymentUrl);
  const brands = await client.query(api.brands.list, {});
  const sorted = [...brands].sort((a, b) => a.slug.localeCompare(b.slug));

  let written = 0;
  for (const brand of sorted) {
    if (SLUG_FILTER && brand.slug.toLowerCase() !== SLUG_FILTER) continue;

    let overview: Record<string, unknown> | null = null;
    try {
      overview = (await client.query(api.foundations.getBrandOverviewData, {
        brandId: brand._id as Id<'brands'>,
      })) as Record<string, unknown> | null;
    } catch (e) {
      console.warn(`[dump-step-lookup-css] Skip ${brand.slug}: getBrandOverviewData failed`, e);
      continue;
    }

    const css = generateFromFoundationOverview(overview);
    if (!css) {
      console.warn(
        `[dump-step-lookup-css] Skip ${brand.slug}: missing color foundation or appearanceConfig (or palette build failed).`,
      );
      continue;
    }

    writeFullInjected(
      outDir,
      brand.slug,
      brand.name,
      'Source: Convex foundations:getBrandOverviewData',
      css,
    );
    written++;
  }

  if (SLUG_FILTER && written === 0) {
    console.warn(`[dump-step-lookup-css] No brand matched slug "${SLUG_FILTER}".`);
  }

  return written;
}

function dumpFixtures(outDir: string): number {
  let n = 0;
  for (const b of BRANDS) {
    if (SLUG_FILTER && b.name.toLowerCase() !== SLUG_FILTER) continue;
    const palette = buildFixturePalette(b);
    const css = generateNewStepLookupCSS(palette);
    writeFullInjected(outDir, b.name, b.name, 'Source: offline fixture (verify-theme-redundancy BRANDS)', css);
    n++;
  }
  if (SLUG_FILTER && n === 0) {
    console.warn(`[dump-step-lookup-css] No fixture matched slug "${SLUG_FILTER}".`);
  }
  return n;
}

async function main(): Promise<void> {
  const outDir = resolve(REPO_ROOT, 'temp', 'surface-step-lookup');
  mkdirSync(outDir, { recursive: true });

  const useConvex = Boolean(CONVEX_URL) && !FIXTURE_ONLY;

  if (useConvex && CONVEX_URL) {
    const n = await dumpFromConvex(outDir, CONVEX_URL);
    console.log(`[dump-step-lookup-css] Convex: ${n} brand file(s) under ${outDir}`);
    return;
  }

  if (!CONVEX_URL && !FIXTURE_ONLY) {
    console.warn(
      '[dump-step-lookup-css] No Convex URL (CONVEX_URL, NEXT_PUBLIC_CONVEX_URL, or STORYBOOK_CONVEX_URL) — using offline fixtures only. Set one to dump every brand from the DB.',
    );
  }

  const n = dumpFixtures(outDir);
  console.log(`[dump-step-lookup-css] Fixtures: ${n} file(s) under ${outDir}`);
}

main().catch((e) => {
  if (CONVEX_URL) printTlsHint(e, CONVEX_URL);
  console.error('[dump-step-lookup-css] Failed:', e);
  process.exit(1);
});
