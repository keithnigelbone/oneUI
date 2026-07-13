/**
 * brandMembers.ts
 *
 * Per-brand membership + invitation flow for the by-invitation platform.
 * Identity is derived server-side; role checks go through convex/lib/auth.ts.
 */
import { v } from 'convex/values';
import { internalQuery, mutation, query } from './_generated/server';
import type { MutationCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';
import {
  getBrandRole,
  getUserRecord,
  getOrCreateUserRecord,
  requireBrandRole,
} from './lib/auth';

const roleValidator = v.union(
  v.literal('admin'),
  v.literal('editor'),
  v.literal('viewer'),
);

const ROLE_RANK = { viewer: 1, editor: 2, admin: 3 } as const;

const INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** The current user's role on a brand ('owner' | 'admin' | 'editor' | 'viewer' | null). Drives useBrandRole. */
export const getMyRole = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    return await getBrandRole(ctx, args.brandId);
  },
});

/**
 * Assert the current user holds at least `min` role on a brand. For use from
 * actions via ctx.runQuery (actions can't call lib/auth guards directly).
 * Unlike canReadBrand, anonymous callers are ALWAYS rejected — use this to
 * protect actions that exercise stored credentials (e.g. Figma OAuth tokens).
 */
export const assertBrandRole = internalQuery({
  args: { brandId: v.id('brands'), min: roleValidator },
  handler: async (ctx, args) => {
    const role = await getBrandRole(ctx, args.brandId);
    if (!role) {
      throw new Error('Not authorized: sign in with access to this brand');
    }
    if (role !== 'owner' && ROLE_RANK[role] < ROLE_RANK[args.min]) {
      throw new Error(`Not authorized: requires ${args.min} access to this brand`);
    }
    return role;
  },
});

/** Members of a brand, with user info. Visible to brand admins + the platform owner. */
export const listMembers = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    const role = await getBrandRole(ctx, args.brandId);
    if (role !== 'owner' && role !== 'admin') return [];
    const members = await ctx.db
      .query('brandMembers')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();
    const out = [];
    for (const m of members) {
      const u = await ctx.db.get(m.userId);
      out.push({
        _id: m._id,
        userId: m.userId,
        role: m.role,
        email: u?.email,
        name: u?.name,
        image: u?.image,
        createdAt: m.createdAt,
      });
    }
    return out;
  },
});

/** Pending invites for a brand. Admin+ only. */
export const listInvites = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    const role = await getBrandRole(ctx, args.brandId);
    if (role !== 'owner' && role !== 'admin') return [];
    return await ctx.db
      .query('brandInvites')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();
  },
});

/** Pending invites addressed to the CURRENT user (by email). For an "accept invite" surface. */
export const listMyInvites = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUserRecord(ctx);
    if (!user?.email) return [];
    const invites = await ctx.db
      .query('brandInvites')
      .withIndex('by_email', (q) => q.eq('email', normalizeEmail(user.email)))
      .collect();
    const out = [];
    for (const inv of invites) {
      const b = await ctx.db.get(inv.brandId);
      out.push({ ...inv, brandName: b?.name, brandSlug: b?.slug });
    }
    return out;
  },
});

/** Invite someone (by email) to a brand with a role. Admin+ only. Returns the invite token. */
export const invite = mutation({
  args: { brandId: v.id('brands'), email: v.string(), role: roleValidator },
  handler: async (ctx, args) => {
    const { user } = await requireBrandRole(ctx, args.brandId, 'admin');
    const email = normalizeEmail(args.email);
    if (!email.includes('@')) throw new Error('Enter a valid email address');

    // Already a member?
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique();
    if (existingUser) {
      const m = await ctx.db
        .query('brandMembers')
        .withIndex('by_brand_and_user', (q) =>
          q.eq('brandId', args.brandId).eq('userId', existingUser._id),
        )
        .unique();
      if (m) throw new Error('That person is already a member of this brand');
    }

    // Replace any existing pending invite for this email+brand.
    const priorInvites = await ctx.db
      .query('brandInvites')
      .withIndex('by_email', (q) => q.eq('email', email))
      .collect();
    for (const inv of priorInvites) {
      if (inv.brandId === args.brandId) await ctx.db.delete(inv._id);
    }

    const now = Date.now();
    const token = crypto.randomUUID();
    await ctx.db.insert('brandInvites', {
      brandId: args.brandId,
      email,
      role: args.role,
      token,
      invitedBy: user._id,
      expiresAt: now + INVITE_TTL_MS,
      createdAt: now,
    });

    // Invites are delivered purely in-app: the invitee signs in with this
    // email address and accepts from the invite toast (listMyInvites).
    // No email provider is wired by design.

    return { token };
  },
});

/** Accept an invite by token. Matches the invite email against the signed-in user. */
export const acceptInvite = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await getOrCreateUserRecord(ctx);
    const invite = await ctx.db
      .query('brandInvites')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .unique();
    if (!invite) throw new Error('Invite not found or already used');
    if (invite.expiresAt < Date.now()) {
      await ctx.db.delete(invite._id);
      throw new Error('This invite has expired');
    }
    if (normalizeEmail(user.email) !== invite.email) {
      throw new Error('This invite was sent to a different email address');
    }
    const existing = await ctx.db
      .query('brandMembers')
      .withIndex('by_brand_and_user', (q) =>
        q.eq('brandId', invite.brandId).eq('userId', user._id),
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { role: invite.role });
    } else {
      await ctx.db.insert('brandMembers', {
        brandId: invite.brandId,
        userId: user._id,
        role: invite.role,
        invitedBy: invite.invitedBy,
        createdAt: Date.now(),
      });
    }
    await ctx.db.delete(invite._id);
    return invite.brandId;
  },
});

/** Revoke a pending invite. Admin+ only. */
export const revokeInvite = mutation({
  args: { inviteId: v.id('brandInvites') },
  handler: async (ctx, args) => {
    const inv = await ctx.db.get(args.inviteId);
    if (!inv) return null;
    await requireBrandRole(ctx, inv.brandId, 'admin');
    await ctx.db.delete(args.inviteId);
    return args.inviteId;
  },
});

/** Change a member's role. Admin+ only. Cannot demote the last admin. */
export const updateRole = mutation({
  args: { brandId: v.id('brands'), userId: v.id('users'), role: roleValidator },
  handler: async (ctx, args) => {
    const { role: actorRole } = await requireBrandRole(ctx, args.brandId, 'admin');
    const m = await ctx.db
      .query('brandMembers')
      .withIndex('by_brand_and_user', (q) =>
        q.eq('brandId', args.brandId).eq('userId', args.userId),
      )
      .unique();
    if (!m) throw new Error('Member not found');
    // Platform owners can change anything (they're always a fallback manager
    // for every brand), so the last-admin guard only constrains brand admins.
    if (m.role === 'admin' && args.role !== 'admin' && actorRole !== 'owner') {
      await assertNotLastAdmin(ctx, args.brandId);
    }
    await ctx.db.patch(m._id, { role: args.role });
    return m._id;
  },
});

/** Remove a member from a brand. Admin+ only. Cannot remove the last admin. */
export const removeMember = mutation({
  args: { brandId: v.id('brands'), userId: v.id('users') },
  handler: async (ctx, args) => {
    const { role: actorRole } = await requireBrandRole(ctx, args.brandId, 'admin');
    const m = await ctx.db
      .query('brandMembers')
      .withIndex('by_brand_and_user', (q) =>
        q.eq('brandId', args.brandId).eq('userId', args.userId),
      )
      .unique();
    if (!m) return null;
    // Owner bypasses the last-admin guard (see updateRole) — they remain a
    // manager for the brand regardless.
    if (m.role === 'admin' && actorRole !== 'owner') {
      await assertNotLastAdmin(ctx, args.brandId);
    }
    await ctx.db.delete(m._id);
    return m._id;
  },
});

async function assertNotLastAdmin(ctx: MutationCtx, brandId: Id<'brands'>) {
  const members = await ctx.db
    .query('brandMembers')
    .withIndex('by_brand', (q) => q.eq('brandId', brandId))
    .collect();
  const admins = members.filter((x) => x.role === 'admin');
  if (admins.length <= 1) {
    throw new Error('Cannot remove or demote the last admin of a brand');
  }
}
