import { mutation } from './_generated/server';
import { internal } from './_generated/api';
import { requirePlatformOwner } from './lib/auth';

/**
 * One-off backfill (owner-only, idempotent): assigns ownership of pre-existing
 * brands to the platform owner so they aren't orphaned / invisible once read-side
 * membership scoping is live. Sets `brands.createdBy` and inserts an admin
 * `brandMembers` row for the owner on every non-system brand.
 *
 * Run ONCE from the Convex dashboard after `users.bootstrapFirstOwner`.
 */
export const backfillBrandOwnership = mutation({
  args: {},
  handler: async (ctx) => {
    const owner = await requirePlatformOwner(ctx);
    const brands = await ctx.db.query('brands').collect();
    let createdBySet = 0;
    let membershipsCreated = 0;
    for (const b of brands) {
      if (!b.createdBy) {
        await ctx.db.patch(b._id, { createdBy: owner._id });
        createdBySet++;
      }
      if (!b.isSystem) {
        const existing = await ctx.db
          .query('brandMembers')
          .withIndex('by_brand_and_user', (q) =>
            q.eq('brandId', b._id).eq('userId', owner._id),
          )
          .unique();
        if (!existing) {
          await ctx.db.insert('brandMembers', {
            brandId: b._id,
            userId: owner._id,
            role: 'admin',
            createdAt: Date.now(),
          });
          membershipsCreated++;
        }
      }
    }
    return { brands: brands.length, createdBySet, membershipsCreated };
  },
});

/** The pre-auth placeholder owner id agent/imagine threads were created under
 *  before real identity landed. Such rows are invisible to every signed-in user. */
const LEGACY_LOCAL_USER_ID = 'local-user';

/**
 * One-off backfill (owner-only, idempotent): reassigns agent-chat and imagine
 * threads created under the pre-auth `'local-user'` placeholder to the platform
 * owner, so prior conversation/canvas history isn't orphaned once threads are
 * scoped to the real Better Auth id. Run ONCE after `users.bootstrapFirstOwner`
 * (the OwnerSetupBanner triggers it automatically on first-run setup).
 */
export const claimLegacyLocalUserThreads = mutation({
  args: {},
  handler: async (ctx) => {
    const owner = await requirePlatformOwner(ctx);

    const agentThreads = await ctx.db
      .query('agentThreads')
      .withIndex('by_user', (q) => q.eq('userId', LEGACY_LOCAL_USER_ID))
      .collect();
    for (const t of agentThreads) {
      await ctx.db.patch(t._id, { userId: owner._id });
    }

    const imagineThreads = await ctx.db
      .query('imagineThreads')
      .withIndex('by_user', (q) => q.eq('userId', LEGACY_LOCAL_USER_ID))
      .collect();
    for (const t of imagineThreads) {
      await ctx.db.patch(t._id, { userId: owner._id });
    }

    return {
      agentThreadsClaimed: agentThreads.length,
      imagineThreadsClaimed: imagineThreads.length,
    };
  },
});

/**
 * One-off migration (owner-only, idempotent) for the Global Component Theme
 * taxonomy v2 split (actions → actions + selection + navigation) and the
 * inert-defaults change. Preserves the rendering of every existing brand:
 *
 * 1. `navigation` row seeded from `actions.shapeLanguage` — Tabs/WebHeader/
 *    BottomNavigation moved out of the actions target list.
 * 2. `selection` row seeded from `actions` (Chip/Selectables) and `inputs`
 *    (Checkbox/Radio/Switch) decisions. When both families set the same
 *    decision to different values, `actions` wins (chips/selectables are the
 *    larger, more visible set) and the brand is reported for manual re-tune.
 * 3. `cards` rows missing `shapeLanguage` get an explicit `'sharp'` — the
 *    decision default flipped from `sharp` to the inert `inherit`.
 * 4. `actions.emphasisStyle` copied to `highAttentionStyle` (the resolver
 *    also reads the legacy key as an alias — belt and braces).
 *
 * Run ONCE from the Convex dashboard after deploying the taxonomy v2 code.
 */
export const migrateComponentThemeTaxonomyV2 = mutation({
  args: {},
  handler: async (ctx) => {
    await requirePlatformOwner(ctx);

    const rows = await ctx.db.query('componentThemeSelections').collect();
    const byBrand = new Map<string, typeof rows>();
    for (const row of rows) {
      const key = row.brandId as unknown as string;
      const list = byBrand.get(key);
      if (list) list.push(row);
      else byBrand.set(key, [row]);
    }

    let navigationSeeded = 0;
    let selectionSeeded = 0;
    let cardsPatched = 0;
    let emphasisCopied = 0;
    const conflictBrands: string[] = [];
    const touchedBrands = new Set<string>();

    const nonDefault = (
      selections: Record<string, string> | undefined,
      decisionId: string,
      defaultValue: string,
    ): string | undefined => {
      const value = selections?.[decisionId];
      return value && value !== defaultValue ? value : undefined;
    };

    for (const [brandKey, brandRows] of byBrand) {
      const find = (familyId: string) => brandRows.find((row) => row.familyId === familyId);
      const actions = find('actions');
      const inputs = find('inputs');
      const cards = find('cards');
      const actionsSelections = (actions?.selections ?? {}) as Record<string, string>;
      const inputsSelections = (inputs?.selections ?? {}) as Record<string, string>;

      // 1. Navigation seeding (shape only — the family's single decision).
      const actionsShape = nonDefault(actionsSelections, 'shapeLanguage', 'inherit');
      if (actionsShape && !find('navigation')) {
        await ctx.db.insert('componentThemeSelections', {
          brandId: actions!.brandId,
          familyId: 'navigation',
          selections: { shapeLanguage: actionsShape },
          updatedAt: Date.now(),
        });
        navigationSeeded++;
        touchedBrands.add(brandKey);
      }

      // 2. Selection seeding: actions wins over inputs on conflict.
      if (!find('selection')) {
        const seeded: Record<string, string> = {};
        let hadConflict = false;
        for (const [decisionId, defaultValue] of [
          ['shapeLanguage', 'inherit'],
          ['controlScale', 'default'],
          // The old defaultAppearance default was 'primary' AND primary is the
          // CSS fallback, so only non-primary values are meaningful.
          ['defaultAppearance', 'primary'],
        ] as const) {
          const fromActions = nonDefault(actionsSelections, decisionId, defaultValue);
          const fromInputs = nonDefault(inputsSelections, decisionId, defaultValue);
          const value = fromActions ?? fromInputs;
          if (value) seeded[decisionId] = value;
          if (fromActions && fromInputs && fromActions !== fromInputs) hadConflict = true;
        }
        if (Object.keys(seeded).length > 0) {
          await ctx.db.insert('componentThemeSelections', {
            brandId: (actions ?? inputs)!.brandId,
            familyId: 'selection',
            selections: seeded,
            updatedAt: Date.now(),
          });
          selectionSeeded++;
          touchedBrands.add(brandKey);
          if (hadConflict) conflictBrands.push(brandKey);
        }
      }

      // 3. Cards default flip: pin the old implicit 'sharp'.
      if (cards) {
        const cardsSelections = (cards.selections ?? {}) as Record<string, string>;
        if (!cardsSelections.shapeLanguage) {
          await ctx.db.patch(cards._id, {
            selections: { ...cardsSelections, shapeLanguage: 'sharp' },
            updatedAt: Date.now(),
          });
          cardsPatched++;
          touchedBrands.add(brandKey);
        }
      }

      // 4. emphasisStyle → highAttentionStyle copy.
      if (
        actions &&
        actionsSelections.emphasisStyle &&
        actionsSelections.emphasisStyle !== 'solid' &&
        !actionsSelections.highAttentionStyle
      ) {
        await ctx.db.patch(actions._id, {
          selections: {
            ...actionsSelections,
            highAttentionStyle: actionsSelections.emphasisStyle,
          },
          updatedAt: Date.now(),
        });
        emphasisCopied++;
        touchedBrands.add(brandKey);
      }
    }

    for (const brandKey of touchedBrands) {
      await ctx.runMutation(internal.brandCSSCache.invalidateInternal, {
        brandId: brandKey as never,
      });
    }

    return {
      brandsWithThemeRows: byBrand.size,
      navigationSeeded,
      selectionSeeded,
      cardsPatched,
      emphasisCopied,
      conflictBrands,
    };
  },
});
