/**
 * componentContextExtractor.ts
 *
 * Utility that builds the AI context payload from imported manifests.
 * Runs client-side — no file system access.
 */

import type { ComponentTokenManifest, TokenDefinition } from '../types/componentTokens';
import type { ComponentRecipeDefinition } from '../types/componentRecipes';
import type { ComponentPropDoc, ComponentSlotDoc } from '../types/componentDocumentation';

export interface ComponentAIContext {
  propsInterface: ComponentPropDoc[];
  tokenManifest: {
    totalTokens: number;
    categories: Record<string, number>;
    tokenNames: string[];
    tokenDescriptions: Record<string, string>;
  } | null;
  recipeDefinition: {
    decisions: Array<{
      id: string;
      label: string;
      options: string[];
      defaultOption: string;
    }>;
  } | null;
  slotDefinitions: ComponentSlotDoc[];
}

/**
 * Extract a structured AI context payload from component manifests.
 */
export function extractComponentContext(options: {
  props: ComponentPropDoc[];
  slots: ComponentSlotDoc[];
  tokenManifest?: ComponentTokenManifest;
  recipeDefinition?: ComponentRecipeDefinition;
}): ComponentAIContext {
  const { props, slots, tokenManifest, recipeDefinition } = options;

  let tokenCtx: ComponentAIContext['tokenManifest'] = null;
  if (tokenManifest) {
    const tokenNames = Object.keys(tokenManifest.tokens);
    const tokenDescriptions: Record<string, string> = {};
    for (const [name, def] of Object.entries(tokenManifest.tokens) as [string, TokenDefinition][]) {
      if (def.description) {
        tokenDescriptions[name] = def.description;
      }
    }
    tokenCtx = {
      totalTokens: tokenManifest.totalTokens,
      categories: tokenManifest.categories,
      tokenNames,
      tokenDescriptions,
    };
  }

  let recipeCtx: ComponentAIContext['recipeDefinition'] = null;
  if (recipeDefinition) {
    recipeCtx = {
      decisions: recipeDefinition.decisions.map((d) => ({
        id: d.id,
        label: d.label,
        options: d.options.map((o) => o.value),
        defaultOption: d.defaultOption,
      })),
    };
  }

  return {
    propsInterface: props,
    tokenManifest: tokenCtx,
    recipeDefinition: recipeCtx,
    slotDefinitions: slots,
  };
}
