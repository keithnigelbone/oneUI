/**
 * useDocStaleness.ts
 *
 * Hook that detects when component documentation is stale
 * by comparing the sourceHash in the baseline JSON against
 * a freshly computed hash from imported manifests.
 */

'use client';

import { useMemo } from 'react';
import type {
  ComponentDocumentationSpec,
  ComponentTokenManifest,
  ComponentRecipeDefinition,
} from '@oneui/shared';

interface StalenessResult {
  isStale: boolean;
  staleReason: string | null;
}

/**
 * Simple deterministic hash for client-side use.
 * Not cryptographic — just stable enough for change detection.
 */
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return hash.toString(36);
}

/**
 * Compute a deterministic hash from component manifests.
 */
export function computeSourceHash(
  tokenManifest?: ComponentTokenManifest,
  recipeDefinition?: ComponentRecipeDefinition,
  props?: unknown[],
): string {
  const parts: string[] = [];

  if (tokenManifest) {
    parts.push(JSON.stringify({
      totalTokens: tokenManifest.totalTokens,
      categories: tokenManifest.categories,
      tokenNames: Object.keys(tokenManifest.tokens).sort(),
    }));
  }

  if (recipeDefinition) {
    parts.push(JSON.stringify(recipeDefinition));
  }

  if (props) {
    parts.push(JSON.stringify(props));
  }

  return simpleHash(parts.join('|'));
}

/**
 * Hook that checks if the documentation is stale by comparing
 * the stored sourceHash with a freshly computed one.
 */
export function useDocStaleness(
  spec: ComponentDocumentationSpec,
  tokenManifest?: ComponentTokenManifest,
  recipeDefinition?: ComponentRecipeDefinition,
): StalenessResult {
  return useMemo(() => {
    if (!spec.sourceHash) {
      return { isStale: false, staleReason: null };
    }

    const currentHash = computeSourceHash(
      tokenManifest,
      recipeDefinition,
      spec.props,
    );

    if (currentHash !== spec.sourceHash) {
      return {
        isStale: true,
        staleReason: 'Component source (tokens, recipe, or props) has changed since documentation was generated.',
      };
    }

    return { isStale: false, staleReason: null };
  }, [spec.sourceHash, spec.props, tokenManifest, recipeDefinition]);
}
