/**
 * figmaSync.ts
 *
 * Convex actions for Figma Variables sync
 * Actions can make external API calls and interact with queries/mutations
 */

import { action, query } from './_generated/server';
import { v } from 'convex/values';
import { api, internal } from './_generated/api';
import { decryptToken } from './utils/encryption';
import {
  transformFigmaVariables,
  autoDetectModeMappings,
} from './utils/figmaTransformer';
import { calculateDiff } from './utils/diffEngine';
import type {
  FigmaVariablesResponse,
  FigmaFileResponse,
  FigmaVariableCollection,
  ModeMapping,
  SyncPreviewData,
} from '@oneui/shared';

// ============================================================================
// Configuration
// ============================================================================

const FIGMA_API_BASE = 'https://api.figma.com/v1';

/**
 * Get or create mode mapping configuration for a brand
 */
export const getModeMapping = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    // For now, return default mappings
    // In future, this could be stored per-brand in a configuration table
    return [
      { figmaModeId: '', figmaModeName: 'Light', platformMode: 'light' as const },
      { figmaModeId: '', figmaModeName: 'Dark', platformMode: 'dark' as const },
      { figmaModeId: '', figmaModeName: 'Dim', platformMode: 'dim' as const },
    ];
  },
});

// ============================================================================
// Figma API Actions
// ============================================================================

/**
 * Fetch file info from Figma
 */
export const fetchFileInfo = action({
  args: {
    brandId: v.id('brands'),
  },
  handler: async (ctx, args): Promise<FigmaFileResponse | null> => {
    // Exercises the brand's stored Figma OAuth token — editors only.
    await ctx.runQuery(internal.brandMembers.assertBrandRole, {
      brandId: args.brandId,
      min: 'editor',
    });

    // Get encrypted tokens
    const connection = await ctx.runQuery(
      api.figmaConnections.getEncryptedTokens,
      { brandId: args.brandId }
    );

    if (!connection || connection.status !== 'active') {
      throw new Error('No active Figma connection');
    }

    // Get encryption key from environment
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('Encryption key not configured');
    }

    // Decrypt access token
    const accessToken = await decryptToken(
      connection.encryptedAccessToken,
      encryptionKey
    );

    // Check if token is expired
    if (Date.now() > connection.tokenExpiresAt) {
      // Mark as expired and throw
      await ctx.runMutation(api.figmaConnections.updateStatus, {
        brandId: args.brandId,
        status: 'expired',
      });
      throw new Error('Figma token expired. Please reconnect.');
    }

    // Fetch file info
    const response = await fetch(
      `${FIGMA_API_BASE}/files/${connection.fileKey}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied. Check file permissions.');
      }
      throw new Error(`Figma API error: ${response.status}`);
    }

    return await response.json();
  },
});

/**
 * Fetch variables from Figma
 */
export const fetchVariables = action({
  args: {
    brandId: v.id('brands'),
  },
  handler: async (ctx, args): Promise<FigmaVariablesResponse> => {
    // Exercises the brand's stored Figma OAuth token — editors only.
    await ctx.runQuery(internal.brandMembers.assertBrandRole, {
      brandId: args.brandId,
      min: 'editor',
    });

    // Get encrypted tokens
    const connection = await ctx.runQuery(
      api.figmaConnections.getEncryptedTokens,
      { brandId: args.brandId }
    );

    if (!connection || connection.status !== 'active') {
      throw new Error('No active Figma connection');
    }

    // Get encryption key from environment
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('Encryption key not configured');
    }

    // Decrypt access token
    const accessToken = await decryptToken(
      connection.encryptedAccessToken,
      encryptionKey
    );

    // Check if token is expired
    if (Date.now() > connection.tokenExpiresAt) {
      await ctx.runMutation(api.figmaConnections.updateStatus, {
        brandId: args.brandId,
        status: 'expired',
      });
      throw new Error('Figma token expired. Please reconnect.');
    }

    // Fetch variables
    const response = await fetch(
      `${FIGMA_API_BASE}/files/${connection.fileKey}/variables/local`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error(
          'Access denied. Variables API requires Figma Enterprise or specific permissions.'
        );
      }
      if (response.status === 404) {
        throw new Error('File not found or no variables defined.');
      }
      throw new Error(`Figma API error: ${response.status}`);
    }

    return await response.json();
  },
});

/**
 * Calculate diff between Figma tokens and existing tokens
 * This is a query that can be called separately
 */
export const calculateTokenDiff = query({
  args: {
    brandId: v.id('brands'),
    incomingTokens: v.array(
      v.object({
        name: v.string(),
        category: v.string(),
        value: v.string(),
        mode: v.union(v.literal('light'), v.literal('dark')),
        description: v.optional(v.string()),
        figmaId: v.string(),
        figmaKey: v.string(),
        figmaCollectionId: v.string(),
        figmaCollectionName: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await calculateDiff(ctx, args.brandId, args.incomingTokens);
  },
});

/**
 * Full sync preview action that properly handles the diff calculation
 */
export const generatePreview = action({
  args: {
    brandId: v.id('brands'),
    modeMappings: v.optional(
      v.array(
        v.object({
          figmaModeId: v.string(),
          figmaModeName: v.string(),
          platformMode: v.union(
            v.literal('light'),
            v.literal('dark')
          ),
        })
      )
    ),
    collectionFilter: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args): Promise<SyncPreviewData> => {
    // Editors only (fetchVariables re-asserts, but fail fast + explicit).
    await ctx.runQuery(internal.brandMembers.assertBrandRole, {
      brandId: args.brandId,
      min: 'editor',
    });

    // Fetch variables from Figma
    const variablesResponse = await ctx.runAction(api.figmaSync.fetchVariables, {
      brandId: args.brandId,
    });

    // Auto-detect mode mappings if not provided
    let modeMappings: ModeMapping[] = args.modeMappings || [];
    if (modeMappings.length === 0) {
      modeMappings = autoDetectModeMappings(
        variablesResponse.meta.variableCollections
      );
    }

    // Transform Figma variables to tokens
    const transformResult = transformFigmaVariables(variablesResponse, {
      modeMappings,
      collectionFilter: args.collectionFilter,
    });

    // Calculate diff using query
    const diff = await ctx.runQuery(api.figmaSync.calculateTokenDiff, {
      brandId: args.brandId,
      incomingTokens: transformResult.tokens,
    });

    // Get collection info for UI
    const collectionValues2 = Object.values(
      variablesResponse.meta.variableCollections
    ) as FigmaVariableCollection[];
    const collections = collectionValues2
      .filter((c: FigmaVariableCollection) => !c.hiddenFromPublishing)
      .map((c: FigmaVariableCollection) => ({
        id: c.id,
        name: c.name,
        tokenCount: c.variableIds.length,
      }));

    return {
      diff,
      collections,
      modes: modeMappings,
      warnings: transformResult.warnings,
    };
  },
});

/**
 * Apply sync - calls the tokens.sync mutation with proper data
 */
export const applySync = action({
  args: {
    brandId: v.id('brands'),
    tokensToAdd: v.array(
      v.object({
        name: v.string(),
        category: v.string(),
        value: v.string(),
        mode: v.string(),
        description: v.optional(v.string()),
        figmaId: v.string(),
        figmaKey: v.string(),
      })
    ),
    tokensToUpdate: v.array(
      v.object({
        id: v.id('tokens'),
        value: v.string(),
        description: v.optional(v.string()),
      })
    ),
    tokensToRemove: v.array(v.id('tokens')),
    // DEPRECATED: ignored. Identity is derived server-side from ctx.auth so
    // audit attribution can't be spoofed. Kept optional for client back-compat.
    userId: v.optional(v.string()),
    fileKey: v.string(),
    fileName: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{
    added: number;
    updated: number;
    removed: number;
    durationMs: number;
  }> => {
    // Editors only; also guarantees ctx.auth resolves for the audit log below.
    await ctx.runQuery(internal.brandMembers.assertBrandRole, {
      brandId: args.brandId,
      min: 'editor',
    });
    const identity = await ctx.auth.getUserIdentity();

    const startTime = Date.now();

    // Call the sync mutation
    const result = (await ctx.runMutation(api.tokens.sync, {
      brandId: args.brandId,
      tokensToAdd: args.tokensToAdd.map((t) => ({
        name: t.name,
        category: t.category,
        value: t.value,
        mode: t.mode,
        description: t.description,
      })),
      tokensToUpdate: args.tokensToUpdate,
      tokensToRemove: args.tokensToRemove,
    })) as { added: number; updated: number; removed: number; durationMs: number };

    // Update last sync time
    await ctx.runMutation(api.figmaConnections.updateLastSync, {
      brandId: args.brandId,
    });

    const durationMs = Date.now() - startTime;

    // Log detailed audit
    await ctx.runMutation(internal.auditLogs.create, {
      action: 'FIGMA_SYNC_APPLY',
      resourceType: 'brand',
      resourceId: args.brandId as string,
      changes: {
        added: args.tokensToAdd.length,
        updated: args.tokensToUpdate.length,
        removed: args.tokensToRemove.length,
        source: 'figma',
        fileKey: args.fileKey,
        fileName: args.fileName,
        durationMs,
      },
      userId: identity?.email ?? identity?.subject ?? 'unknown',
    });

    return {
      added: result.added,
      updated: result.updated,
      removed: result.removed,
      durationMs,
    };
  },
});
