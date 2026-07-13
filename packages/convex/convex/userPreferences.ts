/**
 * userPreferences.ts
 *
 * Per-user preferences. Single source of truth for brand/sub-brand
 * defaults, last-opened session state, theme, density, and theme scope.
 *
 * Identity is derived SERVER-SIDE from Better Auth. The `deviceId` arg
 * is kept optional for back-compat (client still passes it) but its value
 * is ignored — `authUser._id` is the real key stored in the `userId` field.
 */

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireAuthUser } from './lib/auth';
import { authComponent } from './auth';

const prefsPatchValidator = v.object({
  defaultBrandId: v.optional(v.union(v.id('brands'), v.null())),
  defaultSubBrandId: v.optional(v.union(v.string(), v.null())),
  lastOpenedBrandId: v.optional(v.union(v.id('brands'), v.null())),
  lastOpenedSubBrandId: v.optional(v.union(v.string(), v.null())),
  platformBrandId: v.optional(v.union(v.id('brands'), v.null())),
  themeScope: v.optional(
    v.union(v.literal('global'), v.literal('scoped'), v.literal('preview'))
  ),
  density: v.optional(
    v.union(v.literal('compact'), v.literal('default'), v.literal('open'))
  ),
  theme: v.optional(v.union(v.literal('light'), v.literal('dark'))),
  iconSet: v.optional(v.union(v.string(), v.null())),
});

/**
 * `deviceId` arg is kept optional for back-compat but ignored — identity is
 * derived server-side from Better Auth. Returns null when signed-out.
 */
export const get = query({
  args: { deviceId: v.optional(v.string()) },
  handler: async (ctx, { deviceId }) => {
    const authUser = await authComponent.getAuthUser(ctx).catch(() => null);
    if (!authUser) return null;
    const uid = authUser._id;

    const row = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', (q) => q.eq('userId', uid))
      .unique();
    if (row) return row;

    // MIGRATION: pre-auth rows were keyed by `deviceId` with no `userId`. Surface
    // the unclaimed legacy row for this device so a returning user keeps their
    // saved defaults (defaultBrandId, iconSet, …) — Convex-only fields the
    // localStorage re-seed can't restore. The next `upsert` claims it for `uid`.
    if (deviceId) {
      const legacy = await ctx.db
        .query('userPreferences')
        .withIndex('by_deviceId', (q) => q.eq('deviceId', deviceId))
        .first();
      if (legacy && !legacy.userId) return legacy;
    }
    return null;
  },
});

/**
 * `deviceId` arg is kept optional for back-compat but ignored — identity is
 * derived server-side from Better Auth. Rows are keyed by `userId`.
 */
export const upsert = mutation({
  args: {
    deviceId: v.optional(v.string()),
    patch: prefsPatchValidator,
  },
  handler: async (ctx, args) => {
    const authUser = await requireAuthUser(ctx);
    const uid = authUser._id;
    const { deviceId } = args;
    const now = Date.now();

    let existing = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', (q) => q.eq('userId', uid))
      .unique();

    // MIGRATION: claim an unclaimed pre-auth row for this device (keyed by
    // `deviceId`, no `userId`) instead of inserting a fresh one — preserves the
    // Convex-only fields (defaultBrandId, iconSet, …) across the auth cutover.
    if (!existing && deviceId) {
      const legacy = await ctx.db
        .query('userPreferences')
        .withIndex('by_deviceId', (q) => q.eq('deviceId', deviceId))
        .first();
      if (legacy && !legacy.userId) {
        await ctx.db.patch(legacy._id, { userId: uid });
        existing = await ctx.db.get(legacy._id);
      }
    }

    // Normalize explicit null → field removal via undefined in patch
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(args.patch)) {
      cleaned[k] = k === 'themeScope' ? 'global' : (v === null ? undefined : v);
    }

    if (existing) {
      await ctx.db.patch(existing._id, { ...cleaned, updatedAt: now });
      return existing._id;
    }

    return await ctx.db.insert('userPreferences', {
      userId: uid,
      ...cleaned,
      createdAt: now,
      updatedAt: now,
    });
  },
});
