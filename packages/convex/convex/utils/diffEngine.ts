/**
 * diffEngine.ts
 *
 * Calculate differences between incoming Figma tokens and existing tokens
 * Used to generate preview before applying sync
 */

import { QueryCtx } from '../_generated/server';
import { Id } from '../_generated/dataModel';
import type {
  TransformedToken,
  TokenDiff,
  TokenToAdd,
  TokenToUpdate,
  TokenToRemove,
} from '@oneui/shared';

/**
 * Calculate the diff between incoming tokens and existing tokens
 */
export async function calculateDiff(
  ctx: QueryCtx,
  brandId: Id<'brands'>,
  incomingTokens: TransformedToken[]
): Promise<TokenDiff> {
  const added: TokenToAdd[] = [];
  const modified: TokenToUpdate[] = [];
  const removed: TokenToRemove[] = [];
  let unchanged = 0;

  // Get all existing tokens for this brand
  const existingTokens = await ctx.db
    .query('tokens')
    .withIndex('by_brand', (q) => q.eq('brandId', brandId))
    .collect();

  // Create a map for quick lookup: "name:mode" -> token
  const existingMap = new Map<
    string,
    {
      id: Id<'tokens'>;
      name: string;
      category: string;
      value: string;
      mode: string;
      figmaId?: string;
    }
  >();

  for (const token of existingTokens) {
    const key = `${token.name}:${token.mode}`;
    existingMap.set(key, {
      id: token._id,
      name: token.name,
      category: token.category,
      value: token.value,
      mode: token.mode,
      figmaId: token.figmaId,
    });
  }

  // Track which existing tokens are matched
  const matchedKeys = new Set<string>();

  // Process incoming tokens
  for (const incoming of incomingTokens) {
    const key = `${incoming.name}:${incoming.mode}`;
    const existing = existingMap.get(key);

    if (!existing) {
      // Token doesn't exist - add it
      added.push({
        name: incoming.name,
        category: incoming.category,
        value: incoming.value,
        mode: incoming.mode,
        description: incoming.description,
        figmaId: incoming.figmaId,
        figmaKey: incoming.figmaKey,
      });
    } else {
      matchedKeys.add(key);

      // Check if value changed
      if (existing.value !== incoming.value) {
        modified.push({
          id: existing.id as string,
          name: incoming.name,
          category: incoming.category,
          oldValue: existing.value,
          newValue: incoming.value,
          mode: incoming.mode,
          description: incoming.description,
          figmaId: incoming.figmaId,
        });
      } else {
        unchanged++;
      }
    }
  }

  // Find tokens that exist in DB but not in incoming (only if they have a figmaId)
  // We only remove tokens that were previously synced from Figma
  for (const [key, existing] of existingMap) {
    if (!matchedKeys.has(key) && existing.figmaId) {
      removed.push({
        id: existing.id as string,
        name: existing.name,
        category: existing.category,
        value: existing.value,
        mode: existing.mode,
      });
    }
  }

  return {
    added,
    modified,
    removed,
    unchanged,
  };
}

/**
 * Calculate diff stats for display
 */
export function getDiffStats(diff: TokenDiff): {
  totalChanges: number;
  byCategory: Record<
    string,
    { added: number; modified: number; removed: number }
  >;
  byMode: Record<string, { added: number; modified: number; removed: number }>;
} {
  const totalChanges =
    diff.added.length + diff.modified.length + diff.removed.length;

  // Group by category
  const byCategory: Record<
    string,
    { added: number; modified: number; removed: number }
  > = {};

  for (const token of diff.added) {
    const cat = token.category;
    if (!byCategory[cat]) {
      byCategory[cat] = { added: 0, modified: 0, removed: 0 };
    }
    byCategory[cat].added++;
  }

  for (const token of diff.modified) {
    const cat = token.category;
    if (!byCategory[cat]) {
      byCategory[cat] = { added: 0, modified: 0, removed: 0 };
    }
    byCategory[cat].modified++;
  }

  for (const token of diff.removed) {
    const cat = token.category;
    if (!byCategory[cat]) {
      byCategory[cat] = { added: 0, modified: 0, removed: 0 };
    }
    byCategory[cat].removed++;
  }

  // Group by mode
  const byMode: Record<
    string,
    { added: number; modified: number; removed: number }
  > = {};

  for (const token of diff.added) {
    if (!byMode[token.mode]) {
      byMode[token.mode] = { added: 0, modified: 0, removed: 0 };
    }
    byMode[token.mode].added++;
  }

  for (const token of diff.modified) {
    if (!byMode[token.mode]) {
      byMode[token.mode] = { added: 0, modified: 0, removed: 0 };
    }
    byMode[token.mode].modified++;
  }

  for (const token of diff.removed) {
    if (!byMode[token.mode]) {
      byMode[token.mode] = { added: 0, modified: 0, removed: 0 };
    }
    byMode[token.mode].removed++;
  }

  return { totalChanges, byCategory, byMode };
}

/**
 * Filter diff by category
 */
export function filterDiffByCategory(
  diff: TokenDiff,
  categories: string[]
): TokenDiff {
  return {
    added: diff.added.filter((t) => categories.includes(t.category)),
    modified: diff.modified.filter((t) => categories.includes(t.category)),
    removed: diff.removed.filter((t) => categories.includes(t.category)),
    unchanged: diff.unchanged,
  };
}

/**
 * Filter diff by mode
 */
export function filterDiffByMode(diff: TokenDiff, modes: string[]): TokenDiff {
  return {
    added: diff.added.filter((t) => modes.includes(t.mode)),
    modified: diff.modified.filter((t) => modes.includes(t.mode)),
    removed: diff.removed.filter((t) => modes.includes(t.mode)),
    unchanged: diff.unchanged,
  };
}

/**
 * Create a subset of the diff based on selected items
 */
export function selectFromDiff(
  diff: TokenDiff,
  selection: {
    addedNames?: string[];
    modifiedIds?: string[];
    removedIds?: string[];
  }
): TokenDiff {
  return {
    added: selection.addedNames
      ? diff.added.filter((t) =>
          selection.addedNames!.includes(`${t.name}:${t.mode}`)
        )
      : [],
    modified: selection.modifiedIds
      ? diff.modified.filter((t) => selection.modifiedIds!.includes(t.id))
      : [],
    removed: selection.removedIds
      ? diff.removed.filter((t) => selection.removedIds!.includes(t.id))
      : [],
    unchanged: diff.unchanged,
  };
}
