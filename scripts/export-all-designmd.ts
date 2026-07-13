#!/usr/bin/env node
/**
 * export-all-designmd.ts
 *
 * Generates a `DESIGN.md` for every active brand by snapshotting Convex
 * (foundations + composition rules + composition skills + config) and running
 * the exporter against each brand. Writes to `docs/exports/{slug}.DESIGN.md`.
 *
 * Two modes:
 *   - Default (write):    `pnpm designmd:export:all`
 *     Writes/overwrites every active brand's DESIGN.md under docs/exports/.
 *   - Check:              `pnpm designmd:export:check`
 *     Re-runs the export to a tmp directory and compares against committed
 *     files. Exits 1 if any differ — used as a CI gate.
 *
 * Requires:
 *   NEXT_PUBLIC_CONVEX_URL  (or CONVEX_URL)  — public Convex deployment URL.
 *   All queries used here are public; no auth token required.
 */

import { ConvexHttpClient } from 'convex/browser';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import {
  serializeBrandToDesignMd,
  type DesignMdSkill,
} from '../packages/shared/src/engine/compositionDesignMdExporter';
import { resolveBrandFontName } from '../packages/shared/src/data/fonts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const COMMITTED_DIR = resolve(REPO_ROOT, 'docs/exports');

interface ExportedBrand {
  slug: string;
  filename: string;
  contents: string;
}

async function snapshotAndSerialize(client: ConvexHttpClient): Promise<ExportedBrand[]> {
  const systemBrand = await client.query(api.brands.getBySlug, { slug: 'oneui-system' });
  if (!systemBrand) {
    throw new Error("System brand 'oneui-system' not found — seed it first.");
  }
  const systemBrandId = systemBrand._id as Id<'brands'>;

  const allBrands = await client.query(api.brands.list, {});
  const activeBrands = allBrands.filter((b) => b.status === 'active');

  const exports = await Promise.all(
    activeBrands.map(async (brand) => {
      const brandId = brand._id as Id<'brands'>;
      const [foundationData, rules, skills, config] = await Promise.all([
        client.query(api.foundations.getBrandOverviewData, { brandId }),
        client.query(api.compositionRules.getResolved, {
          brandId,
          systemBrandId,
        }),
        client.query(api.compositionSkills.list, { brandId }),
        client.query(api.compositionConfigs.get, { brandId }),
      ]);

      const fd = foundationData;
      const fontSelection =
        fd?.typography?.fontSelection ?? fd?.typography?.config?.fontSelection;
      const customFonts = fd?.customFonts ?? [];
      const primaryFontName = resolveBrandFontName(fontSelection?.primaryFontId, customFonts);
      const codeFontName = resolveBrandFontName(fontSelection?.codeFontId, customFonts);
      const md = serializeBrandToDesignMd({
        brand: {
          name: brand.name,
          slug: brand.slug,
          description: brand.description ?? undefined,
          primaryHue: brand.primaryHue,
          primaryChroma: brand.primaryChroma,
          secondaryHue: brand.secondaryHue,
          secondaryChroma: brand.secondaryChroma,
        },
        colorConfig: fd?.color?.config ?? null,
        presetSelection: fd?.presetSelection ?? null,
        rules: Array.isArray(rules) ? rules : [],
        skills: Array.isArray(skills)
          ? (skills.filter((s: { isActive?: boolean }) => s.isActive !== false) as DesignMdSkill[])
          : [],
        defaultContext: config?.defaultContext,
        vertical: config?.vertical,
        layoutPersonality: config?.layoutPersonality,
        fontFamilyPrimary: primaryFontName,
        fontFamilyCode: codeFontName,
      });

      return {
        slug: brand.slug,
        filename: `${brand.slug}.DESIGN.md`,
        contents: md,
      };
    }),
  );

  return exports.sort((a, b) => a.slug.localeCompare(b.slug));
}

function writeExports(exports: ExportedBrand[], outDir: string): void {
  mkdirSync(outDir, { recursive: true });
  for (const exp of exports) {
    writeFileSync(join(outDir, exp.filename), exp.contents, 'utf8');
  }
}

function diffExports(exports: ExportedBrand[]): { stale: string[]; missing: string[] } {
  const stale: string[] = [];
  const missing: string[] = [];
  for (const exp of exports) {
    const committedPath = join(COMMITTED_DIR, exp.filename);
    if (!existsSync(committedPath)) {
      missing.push(exp.filename);
      continue;
    }
    const committed = readFileSync(committedPath, 'utf8');
    if (committed !== exp.contents) stale.push(exp.filename);
  }
  return { stale, missing };
}

async function main(): Promise<number> {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL;
  if (!url) {
    // eslint-disable-next-line no-console
    console.error(
      'ERROR: NEXT_PUBLIC_CONVEX_URL (or CONVEX_URL) is not set.\n' +
        'Run `pnpm dev` once to populate `.env.local`, then re-run with the env loaded\n' +
        'or use `pnpm dotenv -- pnpm designmd:export:all`.',
    );
    return 1;
  }

  const mode = process.argv.includes('--check') ? 'check' : 'write';
  const client = new ConvexHttpClient(url);

  // eslint-disable-next-line no-console
  console.log(`→ snapshotting brands from ${url}`);
  const exports = await snapshotAndSerialize(client);
  // eslint-disable-next-line no-console
  console.log(`→ ${exports.length} active brand(s): ${exports.map((e) => e.slug).join(', ')}`);

  if (mode === 'write') {
    writeExports(exports, COMMITTED_DIR);
    // eslint-disable-next-line no-console
    console.log(
      `wrote ${exports.length} file(s) to docs/exports/. Commit them to lock the snapshot.`,
    );
    return 0;
  }

  // check mode
  const { stale, missing } = diffExports(exports);
  // Also dump the fresh exports to tmp so engineers can diff side-by-side.
  const tmpDir = join(tmpdir(), `designmd-export-check-${process.pid}`);
  writeExports(exports, tmpDir);

  if (stale.length === 0 && missing.length === 0) {
    // eslint-disable-next-line no-console
    console.log('OK: docs/exports/ is in sync with Convex.');
    return 0;
  }

  // eslint-disable-next-line no-console
  console.error('\nFAIL: docs/exports/ is out of sync with Convex.\n');
  if (missing.length > 0) {
    console.error(`  Missing ${missing.length} file(s):`);
    for (const f of missing) console.error(`    - docs/exports/${f}`);
  }
  if (stale.length > 0) {
    console.error(`  Stale ${stale.length} file(s):`);
    for (const f of stale) {
      console.error(`    - docs/exports/${f}  (fresh: ${tmpDir}/${f})`);
    }
  }
  console.error(
    '\nFix: run `pnpm designmd:export:all` and commit the updated files.\n',
  );
  return 1;
}

main().then(
  (code) => process.exit(code),
  (err) => {
    // eslint-disable-next-line no-console
    console.error(err instanceof Error ? err.stack ?? err.message : err);
    process.exit(1);
  },
);
