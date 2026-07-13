/**
 * adapters/designAdapter.ts — GEN-03 / D-04: the Design/Composition adapter,
 * wrapped as a Mastra tool. It chooses LAYOUT + COMPONENTS per section.
 *
 * ROLE (assembler-last, D-01): the Design adapter ADVISES. It emits a per-section
 * layout/component spec FRAGMENT — it does NOT produce IR. The IR Generator
 * assembles these fragments last.
 *
 * REUSE-BY-CONTRACT (Pitfall A): the "real Design engine" is NOT the HTTP-route
 * executor at `apps/platform/.../executors/design.ts` (which couples to a Convex
 * HTTP client + `@/lib/*` and imports `ai`). Importing it would break Lab
 * isolation + the single-model seam. This adapter reuses ONLY the node-safe pure
 * engine pieces from `@oneui/shared/engine`:
 *   - `compileCompositionRules(...)` → the system PROMPT (deterministic builder);
 *   - `getDefaultCompositionConfig()` → the seed config when the brand has none.
 * The model call routes through the single `callModel` seam.
 *
 * REGISTRY CONSTRAINT (Pitfall #9 / T-02-08): every component the adapter
 * chooses MUST be a member of the retrieved `queryRegistry()` ids. A hallucinated
 * / unregistered component is DROPPED here (never passed downstream) — the IR
 * Generator's exact-membership gate is the final backstop.
 */

import { z } from 'zod';
import { createTool } from '@mastra/core/tools';
import { compileCompositionRules, getDefaultCompositionConfig } from '@oneui/shared/engine';
import { queryRegistry } from '@oneui/experience-builder-registry';
import {
  SectionAttentionLevel,
  SectionContainer,
  SectionGrid,
  SectionSpacing,
  SurfaceMode,
  getSectionPattern,
} from '@oneui/experience-builder-core';
import { callModel } from '../modelAdapter';
import { getCompactDesignContext } from '../designContext';
import { renderReactWebOneUIEnvironmentContract } from '../reactWebEnvironment';

// ---------------------------------------------------------------------------
// I/O schemas
// ---------------------------------------------------------------------------

export const DesignSectionInputSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  intent: z.string().min(1),
  patternId: z.string().min(1).optional(),
  attentionLevel: SectionAttentionLevel.optional(),
});

export const DesignAdapterInputSchema = z.object({
  sections: z.array(DesignSectionInputSchema).min(1),
  artifactType: z.string().min(1),
  brandId: z.string().optional(),
  /**
   * The registry ids the model may choose from. Defaults to the live
   * `queryRegistry()` ids; the membership filter below enforces the constraint
   * regardless of what the model returns (Pitfall #9).
   */
  allowedComponentIds: z.array(z.string()).optional(),
});

/** A layout/component spec fragment for one section (advisory). */
export const SectionDesignSpecSchema = z.object({
  sectionId: z.string().min(1),
  /** First-class section recipe selected by the planner/design adapter. */
  patternId: z.string().min(1),
  /** The section's role in the page hierarchy. */
  attentionLevel: SectionAttentionLevel,
  /** Container width strategy from the composition recipe. */
  container: SectionContainer,
  /** Grid/layout primitive from the composition recipe. */
  grid: SectionGrid,
  /** Tokenized top rhythm bucket. */
  spacingTop: SectionSpacing,
  /** Tokenized bottom rhythm bucket. */
  spacingBottom: SectionSpacing,
  /** Surface/layout intent (e.g. 'bold', 'subtle', 'default'). Plain token name. */
  surfaceMode: SurfaceMode,
  /** The chosen registry component ids for this section (registry members only). */
  components: z.array(z.string()),
  /** Registry ids permitted by the selected composition recipe. */
  allowedComponents: z.array(z.string()),
});
export type SectionDesignSpecT = z.infer<typeof SectionDesignSpecSchema>;

export const DesignAdapterOutputSchema = z.object({
  designSpecs: z.array(SectionDesignSpecSchema),
});
export type DesignAdapterOutputT = z.infer<typeof DesignAdapterOutputSchema>;

// The structured per-section design the model returns (one bounded call).
const SectionDesignModelSchema = z.object({
  patternId: z.string().min(1).optional(),
  attentionLevel: SectionAttentionLevel.optional(),
  container: SectionContainer.optional(),
  grid: SectionGrid.optional(),
  spacingTop: SectionSpacing.optional(),
  spacingBottom: SectionSpacing.optional(),
  surfaceMode: SurfaceMode.optional(),
  components: z.array(z.string()).optional(),
  allowedComponents: z.array(z.string()).optional(),
});

/**
 * Choose layout + components per section. Pipeline: build the system prompt via
 * `compileCompositionRules` (the deterministic builder, seeded with
 * `getDefaultCompositionConfig`), call the model through the single seam, then
 * CONSTRAIN the chosen components to registry members (drop hallucinations).
 */
export async function runDesignAdapter(
  input: z.infer<typeof DesignAdapterInputSchema>
): Promise<DesignAdapterOutputT> {
  const registryIds = new Set<string>(
    input.allowedComponentIds && input.allowedComponentIds.length > 0
      ? input.allowedComponentIds
      : queryRegistry().map((i) => i.id)
  );
  const registryList = [...registryIds];

  const config = getDefaultCompositionConfig();
  // compileCompositionRules is a PROMPT-BUILDER (Pitfall A) — not the LLM call.
  const compiled = compileCompositionRules(
    [],
    config,
    '',
    input.brandId ?? '',
    undefined,
    'web-app'
  );

  const designSpecs: SectionDesignSpecT[] = [];
  for (const section of input.sections) {
    const basePattern = getSectionPattern(section.patternId ?? '');
    const hasPlannerPattern = Boolean(section.patternId);
    const recipeAllowed = basePattern.allowedComponents.filter((id) => registryIds.has(id));
    const allowedComponents =
      hasPlannerPattern && recipeAllowed.length > 0 ? recipeAllowed : registryList;
    const prompt = [
      `Artifact type: ${input.artifactType}.`,
      `Design the "${section.name}" section. Intent: ${section.intent}.`,
      `Planner recipe: ${basePattern.id}; attention: ${section.attentionLevel ?? basePattern.attentionLevel}; container: ${basePattern.container}; grid: ${basePattern.grid}.`,
      `Allowed recipe components: ${allowedComponents.join(', ')}.`,
      renderReactWebOneUIEnvironmentContract(),
      `OneUI design context:\n${getCompactDesignContext()}`,
      `Choose surface mode, layout fields, and components ONLY from these registry ids: ${registryList.join(', ')}.`,
      'Return { patternId, attentionLevel, container, grid, spacingTop, spacingBottom, surfaceMode, components[], allowedComponents[] }.',
    ].join('\n');

    const draft = await callModel({
      schema: SectionDesignModelSchema,
      prompt,
      system: [compiled.prompt, renderReactWebOneUIEnvironmentContract()].join('\n\n'),
    });

    const pattern = getSectionPattern(draft.patternId ?? basePattern.id);
    const normalizedAllowed = (draft.allowedComponents ?? allowedComponents)
      .filter((id) => registryIds.has(id))
      .filter((id, index, arr) => arr.indexOf(id) === index);
    const recipeComponents =
      normalizedAllowed.length > 0
        ? normalizedAllowed
        : pattern.allowedComponents.filter((id) => registryIds.has(id));
    const finalAllowed = recipeComponents.length > 0 ? recipeComponents : registryList;

    // T-02-08 / Pitfall #9: drop any component that is NOT a registry member or
    // not permitted by the selected recipe. A hallucinated id never leaves the adapter.
    const finalAllowedSet = new Set(finalAllowed);
    const components = (draft.components ?? [])
      .filter((id) => registryIds.has(id))
      .filter((id) => finalAllowedSet.has(id));
    const fallbackComponents = finalAllowed
      .filter((id) => id !== 'Surface' && id !== 'Container' && id !== 'Grid')
      .slice(0, 4);

    designSpecs.push({
      sectionId: section.id,
      patternId: pattern.id,
      attentionLevel: draft.attentionLevel ?? section.attentionLevel ?? pattern.attentionLevel,
      container: draft.container ?? pattern.container,
      grid: draft.grid ?? pattern.grid,
      spacingTop: draft.spacingTop ?? pattern.spacingTop,
      spacingBottom: draft.spacingBottom ?? pattern.spacingBottom,
      surfaceMode: draft.surfaceMode ?? pattern.surfaceMode,
      components: components.length > 0 ? components : fallbackComponents,
      allowedComponents: finalAllowed,
    });
  }

  return { designSpecs };
}

/**
 * GEN-03 Design Mastra tool. `execute` reuses the node-safe composition
 * prompt-compiler and routes the model call through the single seam.
 */
export const designAdapter = createTool({
  id: 'design-layout',
  description:
    'GEN-03 Design adapter: chooses surface/layout + registry-constrained components ' +
    'per section using compileCompositionRules. Advises only (no IR).',
  inputSchema: DesignAdapterInputSchema,
  outputSchema: DesignAdapterOutputSchema,
  // Mastra passes the parsed input as the first arg (inputData), context second.
  execute: async (inputData) =>
    runDesignAdapter(inputData as z.infer<typeof DesignAdapterInputSchema>),
});
