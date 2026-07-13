/**
 * Authorization helpers — the real security boundary for OneUI Studio.
 *
 * Identity comes from Better Auth (convex/auth.ts → authComponent). These helpers
 * resolve the current user, mirror them into the `users` table, and enforce
 * per-brand roles + a global platform owner. Every mutating Convex function that
 * touches brand-scoped data MUST call one of these and let it throw.
 *
 * Role hierarchy: viewer(1) < editor(2) < admin(3). platformRole 'owner' bypasses.
 * Never accept a userId as a function argument — identity is derived here.
 */
import type { TableNamesInDataModel } from 'convex/server';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import type { Doc, Id, DataModel } from '../_generated/dataModel';
import { authComponent } from '../auth';

export type BrandRole = 'viewer' | 'editor' | 'admin';
const RANK: Record<BrandRole, number> = { viewer: 1, editor: 2, admin: 3 };

type AnyCtx = QueryCtx | MutationCtx;

/** The authenticated Better Auth user document, or throw. */
export async function requireAuthUser(ctx: AnyCtx) {
  const authUser = await authComponent.getAuthUser(ctx).catch(() => null);
  if (!authUser) throw new Error('Not authenticated');
  return authUser;
}

/** Read the mirrored `users` row for the current identity (or null). Read-only — safe in queries. */
export async function getUserRecord(ctx: AnyCtx): Promise<Doc<'users'> | null> {
  const authUser = await authComponent.getAuthUser(ctx).catch(() => null);
  if (!authUser) return null;
  return await ctx.db
    .query('users')
    .withIndex('by_authUserId', (q) => q.eq('authUserId', authUser._id))
    .unique();
}

/** Canonical email form — lowercased + trimmed. Mirrors brandMembers.normalizeEmail
 *  so `users.email` and the invite dedup lookup (users.by_email) always agree. */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Ensure a mirrored `users` row exists (mutation context). Lazily provisions on first authenticated write. */
export async function getOrCreateUserRecord(ctx: MutationCtx): Promise<Doc<'users'>> {
  const authUser = await requireAuthUser(ctx);
  const email = normalizeEmail(authUser.email);
  const existing = await ctx.db
    .query('users')
    .withIndex('by_authUserId', (q) => q.eq('authUserId', authUser._id))
    .unique();
  if (existing) {
    // Self-heal the mirror: email casing (the brandMembers invite dedup looks
    // up users.by_email with a normalized email) plus name/image so renames in
    // the Account modal propagate to member lists on the next write.
    const patch: Partial<Doc<'users'>> = {};
    if (existing.email !== email) patch.email = email;
    const authName = authUser.name ?? undefined;
    const authImage = authUser.image ?? undefined;
    if (authName !== undefined && existing.name !== authName) patch.name = authName;
    if (authImage !== undefined && existing.image !== authImage) patch.image = authImage;
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(existing._id, patch);
      return { ...existing, ...patch };
    }
    return existing;
  }
  const id = await ctx.db.insert('users', {
    authUserId: authUser._id,
    email,
    name: authUser.name ?? undefined,
    image: authUser.image ?? undefined,
    platformRole: 'member',
    createdAt: Date.now(),
  });
  const created = await ctx.db.get(id);
  if (!created) throw new Error('Failed to create user record');
  return created;
}

/** Require an authenticated user with a mirrored record (mutation context). */
export async function requireUser(ctx: MutationCtx): Promise<Doc<'users'>> {
  return await getOrCreateUserRecord(ctx);
}

/** Require the global platform owner — the "change anything" super-admin (mutation context). */
export async function requirePlatformOwner(ctx: MutationCtx): Promise<Doc<'users'>> {
  const user = await getOrCreateUserRecord(ctx);
  if (user.platformRole !== 'owner') {
    throw new Error('Not authorized: requires platform owner');
  }
  return user;
}

/**
 * Require a user allowed to CREATE brands: platform 'owner' or 'creator'.
 * By-invitation platform — self-registered 'member' users are viewers and
 * cannot create brands until an owner promotes them.
 */
export async function requireBrandCreator(ctx: MutationCtx): Promise<Doc<'users'>> {
  const user = await getOrCreateUserRecord(ctx);
  if (user.platformRole !== 'owner' && user.platformRole !== 'creator') {
    throw new Error('Not authorized: brand creation is invitation-only — ask a platform owner for access');
  }
  return user;
}

/**
 * Require the current user to hold at least `min` role on `brandId`.
 * - platformRole 'owner' bypasses every check.
 * - System brands are platform-managed: owner-only.
 * Returns the user + their effective role.
 */
export async function requireBrandRole(
  ctx: MutationCtx,
  brandId: Id<'brands'>,
  min: BrandRole,
): Promise<{ user: Doc<'users'>; role: BrandRole | 'owner' }> {
  const user = await getOrCreateUserRecord(ctx);
  const brand = await ctx.db.get(brandId);
  if (!brand) throw new Error('Brand not found');

  if (user.platformRole === 'owner') return { user, role: 'owner' };

  if (brand.isSystem) {
    throw new Error('Not authorized: system brands can only be edited by the platform owner');
  }

  const membership = await ctx.db
    .query('brandMembers')
    .withIndex('by_brand_and_user', (q) => q.eq('brandId', brandId).eq('userId', user._id))
    .unique();
  if (!membership) {
    throw new Error('Not authorized: you are not a member of this brand');
  }
  if (RANK[membership.role] < RANK[min]) {
    throw new Error(`Not authorized: requires ${min} on this brand`);
  }
  return { user, role: membership.role };
}

// Tables whose rows carry a `brandId` foreign key — used by requireBrandRoleForDoc
// so mutations that only receive a document id can still authorize by brand.
// Intersected with the real table-name union so `Id<T>` / ctx.db.get stay sound.
type BrandScopedTable = Extract<
  TableNamesInDataModel<DataModel>,
  | 'foundations'
  | 'colorScales'
  | 'tokens'
  | 'componentTokenOverrides'
  | 'brandOrnaments'
  | 'componentRecipeSelections'
  | 'campaigns'
  | 'createProjects'
  | 'subBrandConfigs'
  | 'appearanceConfigs'
  | 'voiceConfigs'
  | 'voiceRules'
  | 'compositionConfigs'
  | 'compositionRules'
  | 'campaignAssets'
  | 'campaignMedia'
  | 'createAssets'
  | 'createMedia'
  | 'materialConfigs'
  | 'tokenOverrides'
  | 'compositions'
  | 'compositionSkills'
  | 'compositionEvalScenarios'
  | 'compositionEvalRuns'
  | 'compositionFeedback'
  | 'voiceSkills'
  | 'voiceEvalScenarios'
  | 'voiceEvalRuns'
  | 'voiceFeedback'
  | 'parityMappings'
  | 'createTemplates'
  | 'experienceRuns'
>;

/**
 * Authorize a mutation that only receives a row id (e.g. foundations.update(id)).
 * Loads the doc, derives its brandId, enforces `min`, and returns the doc so the
 * caller reuses it instead of re-reading.
 */
export async function requireBrandRoleForDoc<T extends BrandScopedTable>(
  ctx: MutationCtx,
  table: T,
  id: Id<T>,
  min: BrandRole,
): Promise<{ user: Doc<'users'>; brandId: Id<'brands'>; doc: Doc<T> }> {
  const doc = await ctx.db.get(id);
  if (!doc) throw new Error(`${table} not found`);
  const brandId = (doc as { brandId?: Id<'brands'> }).brandId;
  if (!brandId) throw new Error(`${table} is not associated with a brand`);
  const { user } = await requireBrandRole(ctx, brandId, min);
  return { user, brandId, doc };
}

/**
 * Idempotent variant of {@link requireBrandRoleForDoc}: returns `null` instead of
 * throwing when the row is already gone, so delete / late-write mutations treat a
 * missing target as a successful no-op (double-click, retry, two clients deleting
 * concurrently, an upload completing after its asset was deleted) rather than
 * surfacing a spurious "<table> not found" error. Authorization is still enforced
 * whenever the row exists.
 */
export async function requireBrandRoleForDocIfExists<T extends BrandScopedTable>(
  ctx: MutationCtx,
  table: T,
  id: Id<T>,
  min: BrandRole,
): Promise<{ user: Doc<'users'>; brandId: Id<'brands'>; doc: Doc<T> } | null> {
  const doc = await ctx.db.get(id);
  if (!doc) return null;
  const brandId = (doc as { brandId?: Id<'brands'> }).brandId;
  if (!brandId) throw new Error(`${table} is not associated with a brand`);
  const { user } = await requireBrandRole(ctx, brandId, min);
  return { user, brandId, doc };
}

// ─── Read-side access (by-invitation visibility) ───────────────────────────
// Read scoping applies ONLY to authenticated platform users. An ANONYMOUS caller
// (no Better Auth session) gets full read access — this is the design tooling /
// pipeline path (Storybook, React Native, Flutter, CDN build, export scripts),
// which reaches Convex over plain HTTP with no Authorization header and must be
// able to render every brand's foundations/tokens without logging in. Writes are
// unaffected: every mutation helper (requireBrandRole/requirePlatformOwner/…)
// goes through getOrCreateUserRecord → requireAuthUser and THROWS when anonymous.
// The public Voice SDK path (brands.getBySlug) is also intentionally NOT scoped.

/**
 * Brand ids the current user may READ. Returns 'all' for anonymous callers
 * (unauthenticated design tooling) and for the platform owner; a scoped set for
 * authenticated non-owner platform users (their memberships + system brands).
 *
 * IMPORTANT: "anonymous" means NO Better Auth session — not "no `users` mirror
 * row". The mirror is provisioned lazily on the first authenticated mutation,
 * so a fresh signup that has only run queries has a session but no row. Such a
 * user must be scoped like any member (empty membership set), NOT granted the
 * anonymous-tooling bypass.
 */
export async function getAccessibleBrandIds(ctx: AnyCtx): Promise<'all' | Set<string>> {
  const authUser = await authComponent.getAuthUser(ctx).catch(() => null);
  if (!authUser) return 'all'; // anonymous tooling/pipeline — public read
  const user = await ctx.db
    .query('users')
    .withIndex('by_authUserId', (q) => q.eq('authUserId', authUser._id))
    .unique();
  if (!user) return new Set(); // signed in, mirror not provisioned yet — no memberships exist
  if (user.platformRole === 'owner') return 'all';
  const ids = new Set<string>();
  const memberships = await ctx.db
    .query('brandMembers')
    .withIndex('by_user', (q) => q.eq('userId', user._id))
    .collect();
  for (const m of memberships) ids.add(m.brandId);
  return ids;
}

/**
 * Whether the current user may READ this brand (owner, member, or a system
 * brand). Same anonymous-vs-unprovisioned distinction as getAccessibleBrandIds.
 */
export async function canReadBrand(ctx: AnyCtx, brandId: Id<'brands'>): Promise<boolean> {
  const brand = await ctx.db.get(brandId);
  if (!brand) return false;
  if (brand.isSystem) return true;
  const authUser = await authComponent.getAuthUser(ctx).catch(() => null);
  if (!authUser) return true; // anonymous tooling/pipeline — public read of any brand
  const user = await ctx.db
    .query('users')
    .withIndex('by_authUserId', (q) => q.eq('authUserId', authUser._id))
    .unique();
  if (!user) return false; // signed in, mirror not provisioned yet — member-scoped, no access
  if (user.platformRole === 'owner') return true;
  const membership = await ctx.db
    .query('brandMembers')
    .withIndex('by_brand_and_user', (q) => q.eq('brandId', brandId).eq('userId', user._id))
    .unique();
  return membership !== null;
}

/**
 * The current user's effective role on a brand — query-safe and null-tolerant.
 * Returns 'owner' for the platform owner, the per-brand role for a member, or null.
 * Used by the useBrandRole hook + the members UI.
 */
export async function getBrandRole(
  ctx: AnyCtx,
  brandId: Id<'brands'>,
): Promise<'owner' | BrandRole | null> {
  const user = await getUserRecord(ctx);
  if (user?.platformRole === 'owner') return 'owner';
  if (!user) return null;
  const membership = await ctx.db
    .query('brandMembers')
    .withIndex('by_brand_and_user', (q) => q.eq('brandId', brandId).eq('userId', user._id))
    .unique();
  return membership?.role ?? null;
}
