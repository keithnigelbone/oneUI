/**
 * mockGeneration.ts
 *
 * The DETERMINISTIC mock IR generator for the Walking Skeleton (GEN-01 /
 * GEN-08). There is NO LLM here: `mockGenerate` hand-shapes a VALID
 * `JioExperienceIR` from retrieved (mock) registry candidates + a resolved
 * (mock) foundation, for a COVERED request. The produced IR:
 *
 *   - parses against the frozen `JioExperienceIR` Zod schema (GEN-08), and
 *   - once mapped IR → AST → validator, passes `validateAst` (GEN-08) because
 *     it uses ONLY registry-approved component ids (Pitfall 2/5).
 *
 * Gap short-circuit (FND-03 / REG-03): for an UNCOVERED foundation profile or a
 * request naming an unregistered/known-drift component, `mockGenerate` returns
 * the gap WITHOUT producing an IR — mirroring the rule "missing profile/
 * component → gap report, never the repair loop." It NEVER substitutes a
 * near-match component and NEVER fabricates dimensions.
 *
 * Pure + deterministic: same input → same IR. No randomness, no I/O.
 */

import {
  JioExperienceIR,
  type JioExperienceIRT,
  type JioIRComponentInstanceT,
  type SlotValueT,
  type FoundationResolveInputT,
  type FoundationGapT,
} from '@oneui/experience-builder-core';
import {
  getRegistryItem,
  type JioComponentGap,
} from '@oneui/experience-builder-registry';
import { resolveFoundation } from './foundationResolver';

/** Input to the mock generator — the request plus optional requested components. */
export interface MockGenerateInput {
  request: FoundationResolveInputT;
  /**
   * Component ids the request wants. Defaults to a registry-approved set so the
   * happy path always yields a valid IR. If ANY requested id is unregistered /
   * known-drift, the generator short-circuits to a component gap (no IR).
   */
  requestedComponents?: string[];
}

/**
 * Result of mock generation. Discriminated on `ok`:
 *   - ok: true  → a valid `JioExperienceIR`.
 *   - ok: false → a typed gap (foundation OR component); NO IR is produced.
 */
export type MockGenerateResult =
  | { ok: true; ir: JioExperienceIRT }
  | { ok: false; foundationGap?: FoundationGapT; componentGap?: JioComponentGap };

/**
 * A small, registry-approved default composition used when the caller does not
 * specify components. Every id here is asserted present in the registry below
 * before it lands in the IR, so the produced IR always validates.
 */
const DEFAULT_COMPONENTS = ['Button', 'Badge'] as const;

export function mockGenerate(input: MockGenerateInput): MockGenerateResult {
  // (1) Foundation gate — uncovered profile short-circuits to a foundation gap
  //     (no IR), never a fabricated dimension (FND-03 / Pitfall 6).
  const resolved = resolveFoundation(input.request);
  if (!resolved.ok) {
    return { ok: false, foundationGap: resolved.gap };
  }

  // (2) Component gate — every requested component must be an EXACT registry
  //     member. An unregistered / known-drift id short-circuits to a component
  //     gap (no IR), never a near match (REG-03 / Pitfall 5).
  const requested =
    input.requestedComponents && input.requestedComponents.length > 0
      ? input.requestedComponents
      : [...DEFAULT_COMPONENTS];

  const resolvedItems = [];
  for (const id of requested) {
    const lookup = getRegistryItem(id);
    if (!lookup.ok) {
      return { ok: false, componentGap: lookup };
    }
    resolvedItems.push(lookup.item);
  }

  // (3) Hand-shape a VALID IR from the resolved foundation + registry items.
  //     Component instances use only the looked-up (registry-approved) ids and
  //     valid props/variants taken from the item meta — so IR → AST → validator
  //     passes. Slots carry only escaped, markup-free text.
  const componentInstances: JioIRComponentInstanceT[] = resolvedItems.map((item, i) => {
    const props: Record<string, string> = {};
    // Use the first valid variant if the component declares any (always a valid
    // enumerated value — keeps the validator's variant check green).
    if (item.variants.length > 0) {
      props.variant = item.variants[0];
    }
    // `children` slot holds plain, escaped text (markup-free) when supported.
    const slots: Record<string, SlotValueT> = item.slots.includes('children')
      ? { children: `${item.name} ${i + 1}` }
      : {};
    return {
      id: `cmp-${i + 1}`,
      type: item.id,
      props,
      slots,
    };
  });

  const ir: JioExperienceIRT = {
    version: 1,
    artifactType: input.request.artifactType,
    targetProfile: input.request.outputProfile,
    brandId: input.request.brandId,
    foundationRefs: Object.keys(resolved.theme.appearances).map(
      (role) => `appearance:${role}`,
    ),
    sections: [
      {
        // No `surfaceMode` on the section: `irToAst` copies a section's
        // surfaceMode onto its layout-wrapper component's props, but the
        // registered layout component ('Container') declares no `surfaceMode`
        // prop, so the validator would (correctly) reject it. Surface context
        // is applied via an explicit `Surface` instance when needed (P2+).
        id: 'section-main',
        name: 'main',
        instances: componentInstances,
        // Explicit `layout` stack primitive (LAYOUT-05): so `irToAst` compiles
        // the section into a REAL Jio `Container` directly — never the legacy
        // 'Stack' wrapper. This keeps the mock aligned with the IR Generator now
        // that the workflow's Stack→Container remap has been retired (04.2-03).
        layout: {
          kind: 'layout',
          id: 'section-main-layout',
          primitive: 'stack',
          direction: 'column',
          gap: '4',
          children: componentInstances,
        },
      },
    ],
    componentInstances,
    content: { title: 'Mock experience', subtitle: 'Deterministic walking skeleton' },
    a11yRequirements: { wcagLevel: 'AA' },
    validationStatus: 'draft',
  };

  // Defensive parse: prove the produced IR conforms to the frozen schema before
  // returning. A drift throws loudly rather than emitting an invalid IR.
  const parsed = JioExperienceIR.safeParse(ir);
  if (!parsed.success) {
    throw new Error(
      `mockGenerate produced an IR that failed the JioExperienceIR schema: ${parsed.error.message}`,
    );
  }
  return { ok: true, ir: parsed.data };
}
