/**
 * auditLogs.ts
 *
 * Convex queries and mutations for audit logging
 */

import { query, internalMutation } from './_generated/server';
import { v } from 'convex/values';
import { getUserRecord } from './lib/auth';

/**
 * Create an audit log entry. INTERNAL ONLY — written by other Convex functions
 * (e.g. figmaSync), never directly by clients.
 */
export const create = internalMutation({
  args: {
    action: v.string(),
    resourceType: v.string(),
    resourceId: v.string(),
    changes: v.optional(v.any()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('auditLogs', {
      action: args.action,
      resourceType: args.resourceType,
      resourceId: args.resourceId,
      changes: args.changes,
      createdAt: Date.now(),
      createdBy: args.userId,
    });
  },
});

/**
 * List audit logs for a resource. Owner-only — returns [] for non-owners.
 */
export const listByResource = query({
  args: {
    resourceType: v.string(),
    resourceId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const me = await getUserRecord(ctx);
    if (me?.platformRole !== 'owner') return [];

    const logs = await ctx.db
      .query('auditLogs')
      .withIndex('by_resource', (q) =>
        q.eq('resourceType', args.resourceType).eq('resourceId', args.resourceId)
      )
      .order('desc')
      .take(args.limit || 50);

    return logs;
  },
});

/**
 * List recent audit logs. Owner-only — returns [] for non-owners.
 */
export const listRecent = query({
  args: {
    limit: v.optional(v.number()),
    action: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const me = await getUserRecord(ctx);
    if (me?.platformRole !== 'owner') return [];

    let q = ctx.db.query('auditLogs').order('desc');

    if (args.action) {
      q = q.filter((qf) => qf.eq(qf.field('action'), args.action));
    }

    return await q.take(args.limit || 100);
  },
});
