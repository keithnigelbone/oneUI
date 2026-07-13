import { query, mutation, action } from './_generated/server';
import { v } from 'convex/values';
import { api } from './_generated/api';
import { decryptToken } from './utils/encryption';
import { requireBrandRole, requireBrandRoleForDoc, canReadBrand } from './lib/auth';

const FIGMA_API_BASE = 'https://api.figma.com/v1';

// ============================================================================
// Queries
// ============================================================================

export const getParityMappings = query({
  args: {
    brandId: v.id('brands'),
    componentName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return [];
    if (args.componentName) {
      return await ctx.db
        .query('parityMappings')
        .withIndex('by_brand_component', (q) =>
          q.eq('brandId', args.brandId).eq('componentName', args.componentName)
        )
        .collect();
    }
    return await ctx.db
      .query('parityMappings')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();
  },
});

export const getLatestParitySnapshot = query({
  args: {
    brandId: v.id('brands'),
    componentName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return null;
    const snapshots = await ctx.db
      .query('paritySnapshots')
      .withIndex('by_brand_component', (q) =>
        args.componentName !== undefined
          ? q.eq('brandId', args.brandId).eq('componentName', args.componentName)
          : q.eq('brandId', args.brandId),
      )
      .order('desc')
      .take(1);
    return snapshots[0] ?? null;
  },
});

// ============================================================================
// Mutations
// ============================================================================

export const bulkUpsertParityMappings = mutation({
  args: {
    brandId: v.id('brands'),
    mappings: v.array(v.object({
      figmaVariableName: v.string(),
      figmaVariableId: v.optional(v.string()),
      cssTokenName: v.string(),
      componentName: v.optional(v.string()),
      category: v.string(),
      mappingSource: v.union(v.literal('auto'), v.literal('manual'), v.literal('codeSyntax')),
    })),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const now = Date.now();
    // Get existing mappings for this brand
    const existing = await ctx.db
      .query('parityMappings')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();

    const existingByFigmaName = new Map(
      existing.map((m) => [m.figmaVariableName, m])
    );

    for (const mapping of args.mappings) {
      const existingMapping = existingByFigmaName.get(mapping.figmaVariableName);
      if (existingMapping) {
        // Update existing
        await ctx.db.patch(existingMapping._id, {
          cssTokenName: mapping.cssTokenName,
          componentName: mapping.componentName,
          category: mapping.category,
          mappingSource: mapping.mappingSource,
          figmaVariableId: mapping.figmaVariableId,
          updatedAt: now,
        });
      } else {
        // Insert new
        await ctx.db.insert('parityMappings', {
          brandId: args.brandId,
          ...mapping,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  },
});

export const storeParitySnapshot = mutation({
  args: {
    brandId: v.id('brands'),
    componentName: v.optional(v.string()),
    source: v.union(v.literal('convex'), v.literal('mcp')),
    summary: v.object({
      matched: v.number(),
      mismatched: v.number(),
      missingInFigma: v.number(),
      missingInTool: v.number(),
      unmapped: v.number(),
      total: v.number(),
    }),
    entries: v.array(v.object({
      figmaVariableName: v.optional(v.string()),
      cssTokenName: v.optional(v.string()),
      category: v.string(),
      status: v.union(
        v.literal('matched'),
        v.literal('mismatched'),
        v.literal('missing-in-figma'),
        v.literal('missing-in-tool'),
        v.literal('unmapped')
      ),
      figmaValue: v.optional(v.string()),
      toolValue: v.optional(v.string()),
      tokenProperty: v.optional(v.string()),
      size: v.optional(v.string()),
      variant: v.optional(v.string()),
      slot: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    await ctx.db.insert('paritySnapshots', {
      brandId: args.brandId,
      componentName: args.componentName,
      source: args.source,
      summary: args.summary,
      entries: args.entries,
      checkedAt: Date.now(),
    });
  },
});

export const upsertParityMapping = mutation({
  args: {
    brandId: v.id('brands'),
    figmaVariableName: v.string(),
    figmaVariableId: v.optional(v.string()),
    cssTokenName: v.string(),
    componentName: v.optional(v.string()),
    category: v.string(),
    mappingSource: v.union(v.literal('auto'), v.literal('manual'), v.literal('codeSyntax')),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const now = Date.now();
    const existing = await ctx.db
      .query('parityMappings')
      .withIndex('by_figma_name', (q) =>
        q.eq('brandId', args.brandId).eq('figmaVariableName', args.figmaVariableName)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        cssTokenName: args.cssTokenName,
        componentName: args.componentName,
        category: args.category,
        mappingSource: args.mappingSource,
        figmaVariableId: args.figmaVariableId,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert('parityMappings', {
      brandId: args.brandId,
      figmaVariableName: args.figmaVariableName,
      figmaVariableId: args.figmaVariableId,
      cssTokenName: args.cssTokenName,
      componentName: args.componentName,
      category: args.category,
      mappingSource: args.mappingSource,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const deleteParityMapping = mutation({
  args: {
    id: v.id('parityMappings'),
  },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'parityMappings', args.id, 'editor');
    await ctx.db.delete(args.id);
  },
});

// ============================================================================
// Actions — Figma API calls for component-scoped parity
// ============================================================================

/**
 * Binding extracted from a Figma component node.
 * Returned by fetchComponentBindings.
 */
interface ComponentBindingResult {
  figmaProperty: string;
  figmaVariableId: string;
  figmaVariableName: string;
  figmaResolvedValue?: string;
  layerName: string;
  layerPath: string;
}

/**
 * Recursively extract variable bindings from a Figma node tree.
 */
function extractBindingsFromNode(
  node: any,
  variableMap: Record<string, { name: string }>,
  parentPath: string = '',
): ComponentBindingResult[] {
  const bindings: ComponentBindingResult[] = [];
  const currentPath = parentPath ? `${parentPath} > ${node.name}` : node.name;

  // Extract bound variables from this node
  if (node.boundVariables) {
    for (const [property, binding] of Object.entries(node.boundVariables)) {
      // Bindings can be a single object or an array (for fills, strokes)
      const bindingsList = Array.isArray(binding) ? binding : [binding];

      for (const b of bindingsList) {
        if (!b || typeof b !== 'object') continue;
        const varId = (b as any).id;
        if (!varId) continue;

        const variable = variableMap[varId];
        const variableName = variable?.name ?? varId;

        bindings.push({
          figmaProperty: property,
          figmaVariableId: varId,
          figmaVariableName: variableName,
          layerName: node.name,
          layerPath: currentPath,
        });
      }
    }
  }

  // Recurse into children
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      bindings.push(...extractBindingsFromNode(child, variableMap, currentPath));
    }
  }

  return bindings;
}

/**
 * Fetch the variable bindings applied to a specific component node in Figma.
 *
 * Uses the Figma REST API to:
 * 1. Get the component node tree (with boundVariables)
 * 2. Get the file's variables (to resolve variable IDs → names)
 * 3. Flatten all bindings into a list
 *
 * Requires an active Figma connection with valid OAuth tokens.
 */
export const fetchComponentBindings = action({
  args: {
    brandId: v.id('brands'),
    nodeId: v.string(),
  },
  handler: async (ctx, args): Promise<{
    bindings: ComponentBindingResult[];
    componentName: string;
    nodeId: string;
  }> => {
    // Get encrypted tokens
    const connection = await ctx.runQuery(
      api.figmaConnections.getEncryptedTokens,
      { brandId: args.brandId }
    );

    if (!connection || connection.status !== 'active') {
      throw new Error('No active Figma connection');
    }

    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('Encryption key not configured');
    }

    const accessToken = await decryptToken(
      connection.encryptedAccessToken,
      encryptionKey
    );

    if (Date.now() > connection.tokenExpiresAt) {
      await ctx.runMutation(api.figmaConnections.updateStatus, {
        brandId: args.brandId,
        status: 'expired',
      });
      throw new Error('Figma token expired. Please reconnect.');
    }

    // Encode node ID for URL (Figma uses : separator, URL-encode it)
    const encodedNodeId = encodeURIComponent(args.nodeId);

    // Fetch the component node tree
    const nodeResponse = await fetch(
      `${FIGMA_API_BASE}/files/${connection.fileKey}/nodes?ids=${encodedNodeId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!nodeResponse.ok) {
      if (nodeResponse.status === 404) {
        throw new Error(`Component node "${args.nodeId}" not found in file.`);
      }
      throw new Error(`Figma API error: ${nodeResponse.status}`);
    }

    const nodeData = await nodeResponse.json();
    const nodeEntry = nodeData.nodes?.[args.nodeId];
    if (!nodeEntry?.document) {
      throw new Error(`Node "${args.nodeId}" not found in response.`);
    }

    const componentNode = nodeEntry.document;

    // Fetch file variables to resolve IDs → names
    const varsResponse = await fetch(
      `${FIGMA_API_BASE}/files/${connection.fileKey}/variables/local`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    let variableMap: Record<string, { name: string }> = {};
    if (varsResponse.ok) {
      const varsData = await varsResponse.json();
      const variables = varsData.meta?.variables ?? {};
      for (const [id, variable] of Object.entries(variables)) {
        variableMap[id] = { name: (variable as any).name };
      }
    }

    // Extract bindings from the node tree
    const bindings = extractBindingsFromNode(componentNode, variableMap);

    return {
      bindings,
      componentName: componentNode.name ?? 'Unknown',
      nodeId: args.nodeId,
    };
  },
});
