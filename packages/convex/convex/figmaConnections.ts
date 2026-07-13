/**
 * figmaConnections.ts
 *
 * Convex queries and mutations for Figma OAuth connections
 */

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireBrandRole, canReadBrand } from './lib/auth';

/**
 * Get the Figma connection for a brand
 */
export const getByBrand = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return null;
    const connection = await ctx.db
      .query('figmaConnections')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (!connection) {
      return null;
    }

    // Return connection without encrypted tokens
    return {
      id: connection._id,
      brandId: connection.brandId,
      userId: connection.userId,
      fileKey: connection.fileKey,
      fileName: connection.fileName,
      status: connection.status,
      lastSyncedAt: connection.lastSyncedAt,
      tokenExpiresAt: connection.tokenExpiresAt,
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
    };
  },
});

/**
 * Get all active connections (for admin/monitoring)
 */
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const connections = await ctx.db
      .query('figmaConnections')
      .withIndex('by_status', (q) => q.eq('status', 'active'))
      .collect();

    return connections.map((c) => ({
      id: c._id,
      brandId: c.brandId,
      userId: c.userId,
      fileKey: c.fileKey,
      fileName: c.fileName,
      status: c.status,
      lastSyncedAt: c.lastSyncedAt,
      createdAt: c.createdAt,
    }));
  },
});

/**
 * Create or update a Figma connection
 */
export const upsert = mutation({
  args: {
    brandId: v.id('brands'),
    userId: v.string(),
    encryptedAccessToken: v.string(),
    encryptedRefreshToken: v.string(),
    tokenExpiresAt: v.number(),
    fileKey: v.string(),
    fileName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const now = Date.now();

    // Check for existing connection
    const existing = await ctx.db
      .query('figmaConnections')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (existing) {
      // Update existing connection
      await ctx.db.patch(existing._id, {
        userId: args.userId,
        encryptedAccessToken: args.encryptedAccessToken,
        encryptedRefreshToken: args.encryptedRefreshToken,
        tokenExpiresAt: args.tokenExpiresAt,
        fileKey: args.fileKey,
        fileName: args.fileName,
        status: 'active',
        updatedAt: now,
      });

      return existing._id;
    }

    // Create new connection
    const connectionId = await ctx.db.insert('figmaConnections', {
      brandId: args.brandId,
      userId: args.userId,
      encryptedAccessToken: args.encryptedAccessToken,
      encryptedRefreshToken: args.encryptedRefreshToken,
      tokenExpiresAt: args.tokenExpiresAt,
      fileKey: args.fileKey,
      fileName: args.fileName,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });

    // Log the connection creation
    await ctx.db.insert('auditLogs', {
      action: 'FIGMA_CONNECT',
      resourceType: 'brand',
      resourceId: args.brandId,
      changes: {
        fileKey: args.fileKey,
        fileName: args.fileName,
        userId: args.userId,
      },
      createdAt: now,
      createdBy: args.userId,
    });

    return connectionId;
  },
});

/**
 * Update connection status (expired, revoked)
 */
export const updateStatus = mutation({
  args: {
    brandId: v.id('brands'),
    status: v.union(
      v.literal('active'),
      v.literal('expired'),
      v.literal('revoked')
    ),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const connection = await ctx.db
      .query('figmaConnections')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (!connection) {
      throw new Error('Connection not found');
    }

    await ctx.db.patch(connection._id, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update last sync time
 */
export const updateLastSync = mutation({
  args: {
    brandId: v.id('brands'),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const connection = await ctx.db
      .query('figmaConnections')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (!connection) {
      throw new Error('Connection not found');
    }

    await ctx.db.patch(connection._id, {
      lastSyncedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Refresh tokens
 */
export const refreshTokens = mutation({
  args: {
    brandId: v.id('brands'),
    encryptedAccessToken: v.string(),
    encryptedRefreshToken: v.string(),
    tokenExpiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const connection = await ctx.db
      .query('figmaConnections')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (!connection) {
      throw new Error('Connection not found');
    }

    await ctx.db.patch(connection._id, {
      encryptedAccessToken: args.encryptedAccessToken,
      encryptedRefreshToken: args.encryptedRefreshToken,
      tokenExpiresAt: args.tokenExpiresAt,
      status: 'active',
      updatedAt: Date.now(),
    });
  },
});

/**
 * Delete a connection (disconnect from Figma)
 */
export const disconnect = mutation({
  args: {
    brandId: v.id('brands'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const connection = await ctx.db
      .query('figmaConnections')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (!connection) {
      throw new Error('Connection not found');
    }

    await ctx.db.delete(connection._id);

    // Log the disconnection
    await ctx.db.insert('auditLogs', {
      action: 'FIGMA_DISCONNECT',
      resourceType: 'brand',
      resourceId: args.brandId,
      changes: {
        fileKey: connection.fileKey,
        fileName: connection.fileName,
      },
      createdAt: Date.now(),
      createdBy: args.userId,
    });
  },
});

/**
 * Get encrypted tokens for internal use (actions only)
 * This is used by Convex actions to make Figma API calls
 */
export const getEncryptedTokens = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return null;
    const connection = await ctx.db
      .query('figmaConnections')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (!connection) {
      return null;
    }

    return {
      encryptedAccessToken: connection.encryptedAccessToken,
      encryptedRefreshToken: connection.encryptedRefreshToken,
      tokenExpiresAt: connection.tokenExpiresAt,
      fileKey: connection.fileKey,
      status: connection.status,
    };
  },
});
