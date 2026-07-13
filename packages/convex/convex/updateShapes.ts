/**
 * updateShapes.ts
 *
 * Safe mutation to update shape tokens for all brands to Figma-aligned values.
 * Preserves all other data (brands, colors, typography, etc.)
 *
 * Run with:
 *   npx convex run updateShapes:updateShapeTokens
 *
 * This only modifies shape category tokens for all existing brands.
 */

import { mutation } from './_generated/server';
import { requirePlatformOwner } from './lib/auth';

const NEW_SHAPES = [
  { name: 'Shape-Pill', value: '9999px', description: 'Fully rounded for circular elements' },
  { name: 'Shape-0-5', value: 'var(--Dimension-f-7)', description: 'Shape 6XS — derived from dimension f-7' },
  { name: 'Shape-1', value: 'var(--Dimension-f-6)', description: 'Shape 5XS — derived from dimension f-6' },
  { name: 'Shape-1-5', value: 'var(--Dimension-f-5)', description: 'Shape 4XS — derived from dimension f-5' },
  { name: 'Shape-2', value: 'var(--Dimension-f-4)', description: 'Shape 3XS — derived from dimension f-4' },
  { name: 'Shape-2-5', value: 'var(--Dimension-f-3)', description: 'Shape 2XS — derived from dimension f-3' },
  { name: 'Shape-3', value: 'var(--Dimension-f-2)', description: 'Shape XS — derived from dimension f-2' },
  { name: 'Shape-3-5', value: 'var(--Dimension-f-1)', description: 'Shape S — derived from dimension f-1' },
  { name: 'Shape-4', value: 'var(--Dimension-f0)', description: 'Shape M — derived from dimension f0' },
  { name: 'Shape-4-5', value: 'var(--Dimension-f1)', description: 'Shape L — derived from dimension f1' },
  { name: 'Shape-5', value: 'var(--Dimension-f2)', description: 'Shape XL — derived from dimension f2' },
  { name: 'Shape-6', value: 'var(--Dimension-f3)', description: 'Shape 2XL — derived from dimension f3' },
  { name: 'Shape-7', value: 'var(--Dimension-f4)', description: 'Shape 3XL — derived from dimension f4' },
  { name: 'Shape-8', value: 'var(--Dimension-f5)', description: 'Shape 4XL — derived from dimension f5' },
  { name: 'Shape-9', value: 'var(--Dimension-f6)', description: 'Shape 5XL — derived from dimension f6' },
  { name: 'Shape-10', value: 'var(--Dimension-f7)', description: 'Shape 6XL — derived from dimension f7' },
];

export const updateShapeTokens = mutation(async (ctx) => {
  await requirePlatformOwner(ctx);
  // Get all brands
  const brands = await ctx.db.query('brands').collect();
  let tokenCount = 0;
  
  for (const brand of brands) {
    // Delete old shape tokens for this brand
    const oldShapeTokens = await ctx.db
      .query('tokens')
      .withIndex('by_brand_category', (q) =>
        q.eq('brandId', brand._id).eq('category', 'shape')
      )
      .collect();
    
    for (const token of oldShapeTokens) {
      await ctx.db.delete(token._id);
    }
    
    // Insert new shape tokens
    for (const shape of NEW_SHAPES) {
      await ctx.db.insert('tokens', {
        name: shape.name,
        category: 'shape',
        value: shape.value,
        mode: 'light',
        brandId: brand._id,
        description: shape.description,
        source: 'foundation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      tokenCount++;
    }
  }
  
  return {
    success: true,
    brandsUpdated: brands.length,
    tokensInserted: tokenCount,
    message: `✓ Updated shape tokens: ${brands.length} brands × ${NEW_SHAPES.length} tokens = ${tokenCount} total`,
  };
});
