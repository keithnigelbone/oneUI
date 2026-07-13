/**
 * tokenResolver.ts
 *
 * Token inheritance resolution logic
 * Resolves token values considering:
 * 1. Brand-specific overrides
 * 2. Base brand inheritance
 * 3. Default token values
 */

import { QueryCtx } from '../_generated/server';
import { Id } from '../_generated/dataModel';

export interface ResolvedToken {
  value: string;
  source: 'override' | 'base' | 'default';
  brandId?: Id<'brands'> | null;
  description?: string;
}

/**
 * Recursively resolve a token considering brand overrides and inheritance
 */
export async function resolveToken(
  ctx: QueryCtx,
  brandId: Id<'brands'>,
  tokenName: string,
  mode: string
): Promise<ResolvedToken | null> {
  // Step 1: Check for brand-specific override (using compound index)
  const override = await ctx.db
    .query('tokenOverrides')
    .withIndex('by_brand_token_mode', (q) =>
      q.eq('brandId', brandId).eq('tokenName', tokenName).eq('mode', mode)
    )
    .first();

  if (override) {
    const baseToken = await ctx.db
      .query('tokens')
      .withIndex('by_name_mode', (q) =>
        q.eq('name', tokenName).eq('mode', mode as 'light' | 'dark' | 'dim')
      )
      .first();

    return {
      value: override.value,
      source: 'override',
      brandId,
      description: baseToken?.description,
    };
  }

  // Step 2: Check if brand has a base brand and resolve from there
  const brand = await ctx.db.get(brandId);
  if (brand?.baseBrand) {
    const baseResolution = await resolveToken(
      ctx,
      brand.baseBrand,
      tokenName,
      mode
    );
    if (baseResolution) {
      return {
        ...baseResolution,
        source: 'base',
      };
    }
  }

  // Step 3: Fall back to default token (using index)
  const defaultToken = await ctx.db
    .query('tokens')
    .withIndex('by_name_mode', (q) =>
      q.eq('name', tokenName).eq('mode', mode as 'light' | 'dark' | 'dim')
    )
    .first();

  if (defaultToken) {
    return {
      value: defaultToken.value,
      source: 'default',
      brandId: null,
      description: defaultToken.description,
    };
  }

  return null;
}

/**
 * Resolve token with additional context info (category, etc.)
 */
export async function resolveTokenWithContext(
  ctx: QueryCtx,
  brandId: Id<'brands'>,
  tokenName: string,
  mode: string
) {
  const resolved = await resolveToken(ctx, brandId, tokenName, mode);

  if (!resolved) {
    return null;
  }

  // Get token metadata (using index)
  const tokenMetadata = await ctx.db
    .query('tokens')
    .withIndex('by_name_mode', (q) => q.eq('name', tokenName).eq('mode', mode as 'light' | 'dark' | 'dim'))
    .first();

  return {
    ...resolved,
    category: tokenMetadata?.category,
    name: tokenName,
    mode,
  };
}

/**
 * Resolve all modes for a token across a brand
 */
export async function resolveTokenAllModes(
  ctx: QueryCtx,
  brandId: Id<'brands'>,
  tokenName: string
) {
  const modes = ['light', 'dark', 'dim'];
  const resolvedByMode: Record<string, ResolvedToken> = {};

  for (const mode of modes) {
    const resolved = await resolveToken(ctx, brandId, tokenName, mode);
    if (resolved) {
      resolvedByMode[mode] = resolved;
    }
  }

  return resolvedByMode;
}
