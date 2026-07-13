#!/usr/bin/env node
/**
 * resync-composition-rules.ts
 *
 * Pushes the current `COMPOSITION_SEED_SECTIONS` content (from
 * `packages/shared/src/engine/compositionSeedRules.ts`) into Convex by upserting
 * every section against the system brand (`oneui-system`, scope='base').
 *
 * Use this when:
 *   - The seed file has been edited (e.g. legacy surface vocab swept).
 *   - Convex DB still has the old prose, so DesignMD exports are stale.
 *
 * Idempotent — `compositionRules.upsert` patches existing sections by
 * (brandId, sectionId), incrementing `version` and re-scheduling the embedding
 * job. Existing brand-scoped overrides are not touched.
 *
 * Requires:
 *   NEXT_PUBLIC_CONVEX_URL (or CONVEX_URL) — public Convex deployment URL.
 *
 * Usage:
 *   set -a && source .env.local && set +a && pnpm tsx scripts/resync-composition-rules.ts
 *
 * Add `--dry-run` to print what would change without mutating anything.
 */

import { ConvexHttpClient } from 'convex/browser';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { COMPOSITION_SEED_SECTIONS } from '../packages/shared/src/engine/compositionSeedRules';
import { DEFAULT_SKILLS } from '../packages/convex/convex/compositionSkills';

interface ExistingRule {
  _id: Id<'compositionRules'>;
  sectionId: string;
  content: string;
  version: number;
}

interface ExistingSkill {
  _id: Id<'compositionSkills'>;
  skillId: string;
  name: string;
  description: string;
  systemPromptTemplate: string;
  applicableContexts?: readonly string[];
  archetype?: string;
  vertical?: string;
  attentionPattern?: string;
  dosDonts?: readonly string[];
}

async function main(): Promise<number> {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL;
  if (!url) {
    console.error(
      'ERROR: NEXT_PUBLIC_CONVEX_URL (or CONVEX_URL) is not set.\n' +
        'Run with env loaded:\n' +
        '  set -a && source .env.local && set +a && pnpm tsx scripts/resync-composition-rules.ts',
    );
    return 1;
  }

  const dryRun = process.argv.includes('--dry-run');
  const client = new ConvexHttpClient(url);

  console.log(`→ ${dryRun ? 'DRY RUN: ' : ''}resyncing seed rules to ${url}`);

  const systemBrand = await client.query(api.brands.getBySlug, { slug: 'oneui-system' });
  if (!systemBrand) {
    console.error("ERROR: System brand 'oneui-system' not found in Convex.");
    return 1;
  }
  const systemBrandId = systemBrand._id as Id<'brands'>;
  console.log(`→ system brand: ${systemBrand.name} (${systemBrandId})`);

  const existingRules = (await client.query(
    api.compositionRules.getByBrand,
    { brandId: systemBrandId },
  )) as unknown as ExistingRule[];
  const existingMap = new Map(existingRules.map((r) => [r.sectionId, r]));
  console.log(`→ ${existingRules.length} existing base rule(s) on system brand`);

  let changed = 0;
  let unchanged = 0;
  let created = 0;

  for (const section of COMPOSITION_SEED_SECTIONS) {
    const existing = existingMap.get(section.sectionId);
    if (existing) {
      if (existing.content === section.content) {
        unchanged += 1;
        continue;
      }
      console.log(`  ~ ${section.sectionId}  (content drift; v${existing.version} → v${existing.version + 1})`);
      if (!dryRun) {
        await client.mutation(
          api.compositionRules.upsert,
          {
            brandId: systemBrandId,
            sectionId: section.sectionId,
            scope: 'base',
            title: section.title,
            content: section.content,
            priority: section.priority,
            isActive: true,
          },
        );
      }
      changed += 1;
    } else {
      console.log(`  + ${section.sectionId}  (new)`);
      if (!dryRun) {
        await client.mutation(
          api.compositionRules.upsert,
          {
            brandId: systemBrandId,
            sectionId: section.sectionId,
            scope: 'base',
            title: section.title,
            content: section.content,
            priority: section.priority,
            isActive: true,
          },
        );
      }
      created += 1;
    }
  }

  console.log(
    `\nrules: ${dryRun ? '[dry-run] ' : ''}${changed} updated, ${created} created, ${unchanged} unchanged.`,
  );

  // ── Skills sync ─────────────────────────────────────────────────────────
  // Skills are stored per-brand under `compositionSkills`. Walk every active
  // brand and patch any skill whose source-of-truth content (DEFAULT_SKILLS)
  // has drifted from the DB row. New skills aren't auto-created here — that's
  // an opt-in operation done via the platform UI.
  const allBrands = await client.query(api.brands.list, {});
  const activeBrands = allBrands.filter((b) => b.status === 'active');
  console.log(`\n→ checking skills across ${activeBrands.length} active brand(s)`);

  const defaultSkillsBySkillId = new Map(DEFAULT_SKILLS.map((s) => [s.skillId, s]));

  let skillsChanged = 0;
  let skillsUnchanged = 0;
  let skillsSkipped = 0;

  for (const brand of activeBrands) {
    const brandId = brand._id as Id<'brands'>;
    const existingSkills = (await client.query(api.compositionSkills.list, {
      brandId,
    })) as unknown as ExistingSkill[];

    for (const existing of existingSkills) {
      const seed = defaultSkillsBySkillId.get(existing.skillId);
      if (!seed) {
        skillsSkipped += 1;
        continue;
      }
      if (existing.systemPromptTemplate === seed.systemPromptTemplate) {
        skillsUnchanged += 1;
        continue;
      }
      console.log(`  ~ ${brand.slug}/${existing.skillId}  (template drift)`);
      if (!dryRun) {
        await client.mutation(api.compositionSkills.update, {
          id: existing._id,
          name: seed.name,
          description: seed.description,
          systemPromptTemplate: seed.systemPromptTemplate,
          applicableContexts: [...seed.applicableContexts],
        });
      }
      skillsChanged += 1;
    }
  }

  console.log(
    `skills: ${dryRun ? '[dry-run] ' : ''}${skillsChanged} updated, ${skillsUnchanged} unchanged, ${skillsSkipped} brand-only (no seed entry).`,
  );

  if (!dryRun && (changed > 0 || created > 0 || skillsChanged > 0)) {
    console.log('\nNext: run `pnpm designmd:export:all` to refresh DesignMD exports, then commit.');
  }
  return 0;
}

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error(err instanceof Error ? err.stack ?? err.message : err);
    process.exit(1);
  },
);
