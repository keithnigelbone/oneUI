import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getOrCreateUserRecord, getUserRecord, requirePlatformOwner } from './lib/auth';

const platformRoleValidator = v.union(
  v.literal('owner'),
  v.literal('creator'),
  v.literal('member'),
);

const PLATFORM_INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days
const normalizeEmail = (email: string) => email.trim().toLowerCase();

/**
 * Provision (or fetch) the mirrored `users` row for the signed-in identity.
 * Called by the client once after sign-in so the row exists before any brand
 * membership is granted. Idempotent.
 */
export const getOrCreateUser = mutation({
  args: {},
  handler: async (ctx) => {
    return await getOrCreateUserRecord(ctx);
  },
});

/** The current user's mirrored record (role, email, …) or null if not signed in. */
export const getCurrentUserRecord = query({
  args: {},
  handler: async (ctx) => {
    return await getUserRecord(ctx);
  },
});

/**
 * One-time bootstrap: promote the current signed-in user to platform owner —
 * but ONLY while the platform has zero owners. After the first owner exists this
 * throws. This solves the chicken-and-egg of the very first admin without hand-
 * editing the database; the owner can then grant per-brand roles to everyone else.
 */
export const bootstrapFirstOwner = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getOrCreateUserRecord(ctx);
    const existingOwner = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('platformRole'), 'owner'))
      .first();
    if (existingOwner) {
      if (existingOwner._id === user._id) return user;
      throw new Error('A platform owner already exists');
    }
    await ctx.db.patch(user._id, { platformRole: 'owner' });
    return await ctx.db.get(user._id);
  },
});

/**
 * Owner-only: set another user's platform tier. This is how the by-invitation
 * platform elevates a viewer (member) to a 'creator' (can make brands) or 'owner'.
 */
export const setPlatformRole = mutation({
  args: {
    userId: v.id('users'),
    role: v.union(v.literal('owner'), v.literal('creator'), v.literal('member')),
  },
  handler: async (ctx, args) => {
    const actor = await requirePlatformOwner(ctx);
    // Guard against an owner accidentally demoting the last owner (themselves).
    if (args.userId === actor._id && args.role !== 'owner') {
      const owners = await ctx.db
        .query('users')
        .filter((q) => q.eq(q.field('platformRole'), 'owner'))
        .collect();
      if (owners.length <= 1) {
        throw new Error('Cannot demote the only platform owner');
      }
    }
    await ctx.db.patch(args.userId, { platformRole: args.role });
    return args.userId;
  },
});

/** Owner-only: list all platform users (for the admin / members management UI). */
export const listAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const me = await getUserRecord(ctx);
    if (me?.platformRole !== 'owner') return [];
    return await ctx.db.query('users').collect();
  },
});

/** Public: whether ANY platform owner exists yet — drives the one-time owner-setup prompt. */
export const hasPlatformOwner = query({
  args: {},
  handler: async (ctx) => {
    const owner = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('platformRole'), 'owner'))
      .first();
    return owner !== null;
  },
});

// ─── Platform invitations (global tier, owner-issued) ──────────────────────
// Mirrors the per-brand invite flow in brandMembers.ts, but grants a GLOBAL
// platform tier instead of brand membership. Delivered in-app: the invitee
// signs in with the invited email and accepts from the invite toast.

/**
 * Owner-only: invite someone (by email) to the platform at a global tier.
 * If a user with that email already exists they already have platform access —
 * the owner should change their tier from the list instead. Returns the token.
 */
export const invitePlatformMember = mutation({
  args: { email: v.string(), role: platformRoleValidator },
  handler: async (ctx, args) => {
    const actor = await requirePlatformOwner(ctx);
    const email = normalizeEmail(args.email);
    if (!email.includes('@')) throw new Error('Enter a valid email address');

    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique();
    if (existingUser) {
      throw new Error(
        'That person already has an account — set their tier from the list below.',
      );
    }

    // Replace any existing pending invite for this email (re-inviting bumps tier).
    const priorInvites = await ctx.db
      .query('platformInvites')
      .withIndex('by_email', (q) => q.eq('email', email))
      .collect();
    for (const inv of priorInvites) await ctx.db.delete(inv._id);

    const now = Date.now();
    const token = crypto.randomUUID();
    await ctx.db.insert('platformInvites', {
      email,
      role: args.role,
      token,
      invitedBy: actor._id,
      expiresAt: now + PLATFORM_INVITE_TTL_MS,
      createdAt: now,
    });
    return { token };
  },
});

/** Owner-only: pending platform invites. */
export const listPlatformInvites = query({
  args: {},
  handler: async (ctx) => {
    const me = await getUserRecord(ctx);
    if (me?.platformRole !== 'owner') return [];
    return await ctx.db.query('platformInvites').collect();
  },
});

/** Owner-only: revoke a pending platform invite. */
export const revokePlatformInvite = mutation({
  args: { inviteId: v.id('platformInvites') },
  handler: async (ctx, args) => {
    await requirePlatformOwner(ctx);
    const inv = await ctx.db.get(args.inviteId);
    if (!inv) return null;
    await ctx.db.delete(args.inviteId);
    return args.inviteId;
  },
});

/** Pending platform invites addressed to the CURRENT user (by email). Drives the accept toast. */
export const listMyPlatformInvites = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUserRecord(ctx);
    if (!user?.email) return [];
    return await ctx.db
      .query('platformInvites')
      .withIndex('by_email', (q) => q.eq('email', normalizeEmail(user.email)))
      .collect();
  },
});

/**
 * Accept a platform invite by token. Matches the invite email against the
 * signed-in user and sets their global platformRole to the invited tier.
 */
export const acceptPlatformInvite = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await getOrCreateUserRecord(ctx);
    const invite = await ctx.db
      .query('platformInvites')
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
    await ctx.db.patch(user._id, { platformRole: invite.role });
    await ctx.db.delete(invite._id);
    return invite.role;
  },
});
