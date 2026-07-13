import { mutation, query } from './_generated/server';
import { api } from './_generated/api';
import { v } from 'convex/values';
import { requireBrandRole, canReadBrand } from './lib/auth';

type SubBrandAccent = { scaleName: string; baseStep: number };
type SubBrandBrandBg = { scaleName: string; backgroundStep: { light: number; dark: number } };

const brandBgValidator = v.object({
  scaleName: v.string(),
  backgroundStep: v.object({ light: v.number(), dark: v.number() }),
});

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const getSyncedThemes = query({
  args: { parentBrandId: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.parentBrandId))) return [];
    return await ctx.db
      .query('supabaseSyncMeta')
      .withIndex('by_parent_brand', (q) => q.eq('parentBrandId', args.parentBrandId))
      .collect();
  },
});

export const syncTheme = mutation({
  args: {
    parentBrandId: v.id('brands'),
    supabaseThemeId: v.string(),
    supabaseProjectName: v.string(),
    primary: v.object({ scaleName: v.string(), baseStep: v.number() }),
    secondary: v.object({ scaleName: v.string(), baseStep: v.number() }),
    sparkle: v.object({ scaleName: v.string(), baseStep: v.number() }),
    brandBg: brandBgValidator,
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.parentBrandId, 'editor');
    const parent = await ctx.db.get(args.parentBrandId);
    if (!parent) throw new Error('Parent brand not found');

    const now = Date.now();

    const existingMeta = await ctx.db
      .query('supabaseSyncMeta')
      .withIndex('by_supabase_theme', (q) => q.eq('supabaseThemeId', args.supabaseThemeId))
      .first();

    const subBrandName = args.supabaseProjectName;
    const subBrandSlug = slugify(args.supabaseProjectName);

    if (existingMeta) {
      await ctx.db.patch(existingMeta._id, {
        parentBrandId: args.parentBrandId,
        supabaseProjectName: args.supabaseProjectName,
        lastSyncedAt: now,
      });

      await ctx.db.patch(existingMeta.subBrandConfigId, {
        parentBrandId: args.parentBrandId,
        name: subBrandName,
        slug: subBrandSlug,
        primary: args.primary as SubBrandAccent,
        secondary: args.secondary as SubBrandAccent,
        sparkle: args.sparkle as SubBrandAccent,
        brandBg: args.brandBg as SubBrandBrandBg,
        updatedAt: now,
      });

      return { subBrandConfigId: existingMeta.subBrandConfigId, metaId: existingMeta._id, created: false };
    }

    // Ensure slug uniqueness within brand. If collision, suffix with short ID segment.
    const sameSlug = await ctx.db
      .query('subBrandConfigs')
      .withIndex('by_parent_brand', (q) => q.eq('parentBrandId', args.parentBrandId))
      .collect();
    const finalSlug = sameSlug.some((s) => s.slug === subBrandSlug)
      ? `${subBrandSlug}-${args.supabaseThemeId.slice(0, 6)}`
      : subBrandSlug;

    const subBrandConfigId = await ctx.db.insert('subBrandConfigs', {
      parentBrandId: args.parentBrandId,
      name: subBrandName,
      slug: finalSlug,
      primary: args.primary as SubBrandAccent,
      secondary: args.secondary as SubBrandAccent,
      sparkle: args.sparkle as SubBrandAccent,
      brandBg: args.brandBg as SubBrandBrandBg,
      createdAt: now,
      updatedAt: now,
    });

    const metaId = await ctx.db.insert('supabaseSyncMeta', {
      parentBrandId: args.parentBrandId,
      supabaseThemeId: args.supabaseThemeId,
      subBrandConfigId,
      supabaseProjectName: args.supabaseProjectName,
      lastSyncedAt: now,
    });

    return { subBrandConfigId, metaId, created: true };
  },
});

export const removeTheme = mutation({
  args: {
    parentBrandId: v.id('brands'),
    supabaseThemeId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.parentBrandId, 'editor');
    const meta = await ctx.db
      .query('supabaseSyncMeta')
      .withIndex('by_supabase_theme', (q) => q.eq('supabaseThemeId', args.supabaseThemeId))
      .first();
    if (!meta) return { removed: false };

    // Guard against cross-brand removal if the same Supabase DB is used across brands.
    if (meta.parentBrandId !== args.parentBrandId) return { removed: false };

    await ctx.db.delete(meta.subBrandConfigId);
    await ctx.db.delete(meta._id);
    return { removed: true };
  },
});

export const bulkSync = mutation({
  args: {
    parentBrandId: v.id('brands'),
    themes: v.array(
      v.object({
        supabaseThemeId: v.string(),
        supabaseProjectName: v.string(),
        primary: v.object({ scaleName: v.string(), baseStep: v.number() }),
        secondary: v.object({ scaleName: v.string(), baseStep: v.number() }),
        sparkle: v.object({ scaleName: v.string(), baseStep: v.number() }),
        brandBg: brandBgValidator,
      })
    ),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.parentBrandId, 'editor');
    const existingMeta = await ctx.db
      .query('supabaseSyncMeta')
      .withIndex('by_parent_brand', (q) => q.eq('parentBrandId', args.parentBrandId))
      .collect();

    const incomingIds = new Set(args.themes.map((t) => t.supabaseThemeId));

    // Remove orphans (previously synced, now absent)
    const orphans = existingMeta.filter((m) => !incomingIds.has(m.supabaseThemeId));
    for (const orphan of orphans) {
      await ctx.db.delete(orphan.subBrandConfigId);
      await ctx.db.delete(orphan._id);
    }

    // Upsert incoming themes
    let created = 0;
    let updated = 0;
    for (const t of args.themes) {
      const result = await ctx.runMutation(api.supabaseSync.syncTheme, {
        parentBrandId: args.parentBrandId,
        supabaseThemeId: t.supabaseThemeId,
        supabaseProjectName: t.supabaseProjectName,
        primary: t.primary,
        secondary: t.secondary,
        sparkle: t.sparkle,
        brandBg: t.brandBg,
      });
      if (result.created) created += 1;
      else updated += 1;
    }

    return { created, updated, removed: orphans.length };
  },
});

export const importSyncedThemesUpsertBySlug = mutation({
  args: {
    parentBrandId: v.id('brands'),
    themes: v.array(
      v.object({
        supabaseThemeId: v.string(),
        supabaseProjectName: v.string(),
        primary: v.object({ scaleName: v.string(), baseStep: v.number() }),
        secondary: v.object({ scaleName: v.string(), baseStep: v.number() }),
        sparkle: v.object({ scaleName: v.string(), baseStep: v.number() }),
        brandBg: brandBgValidator,
      })
    ),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.parentBrandId, 'editor');
    const parent = await ctx.db.get(args.parentBrandId);
    if (!parent) throw new Error('Parent brand not found');

    const now = Date.now();
    const existingSubBrands = await ctx.db
      .query('subBrandConfigs')
      .withIndex('by_parent_brand', (q) => q.eq('parentBrandId', args.parentBrandId))
      .collect();
    const existingMeta = await ctx.db
      .query('supabaseSyncMeta')
      .withIndex('by_parent_brand', (q) => q.eq('parentBrandId', args.parentBrandId))
      .collect();

    const subBrandBySlug = new Map(existingSubBrands.map((subBrand) => [subBrand.slug, subBrand]));
    const metaByThemeId = new Map(existingMeta.map((meta) => [meta.supabaseThemeId, meta]));

    let created = 0;
    let updated = 0;
    let linked = 0;

    for (const theme of args.themes) {
      const slug = slugify(theme.supabaseProjectName);
      const fields = {
        parentBrandId: args.parentBrandId,
        name: theme.supabaseProjectName,
        slug,
        primary: theme.primary as SubBrandAccent,
        secondary: theme.secondary as SubBrandAccent,
        sparkle: theme.sparkle as SubBrandAccent,
        brandBg: theme.brandBg as SubBrandBrandBg,
      };

      const meta = metaByThemeId.get(theme.supabaseThemeId);
      if (meta) {
        await ctx.db.patch(meta.subBrandConfigId, { ...fields, updatedAt: now });
        await ctx.db.patch(meta._id, {
          parentBrandId: args.parentBrandId,
          supabaseProjectName: theme.supabaseProjectName,
          lastSyncedAt: now,
        });
        updated += 1;
        continue;
      }

      const existingSubBrand = subBrandBySlug.get(slug);
      if (existingSubBrand) {
        await ctx.db.patch(existingSubBrand._id, { ...fields, updatedAt: now });
        await ctx.db.insert('supabaseSyncMeta', {
          parentBrandId: args.parentBrandId,
          supabaseThemeId: theme.supabaseThemeId,
          subBrandConfigId: existingSubBrand._id,
          supabaseProjectName: theme.supabaseProjectName,
          lastSyncedAt: now,
        });
        linked += 1;
        continue;
      }

      const subBrandConfigId = await ctx.db.insert('subBrandConfigs', {
        ...fields,
        createdAt: now,
        updatedAt: now,
      });
      await ctx.db.insert('supabaseSyncMeta', {
        parentBrandId: args.parentBrandId,
        supabaseThemeId: theme.supabaseThemeId,
        subBrandConfigId,
        supabaseProjectName: theme.supabaseProjectName,
        lastSyncedAt: now,
      });
      subBrandBySlug.set(slug, { ...fields, _id: subBrandConfigId } as typeof existingSubBrands[number]);
      created += 1;
    }

    return { created, updated, linked };
  },
});
