/**
 * irGenerator.test.ts — GEN-05 behaviors, all credential-free (model mocked).
 *
 *   1. mocked model → parseIR-valid IR → generateIR returns { ok: true, ir }.
 *   2. Zod-invalid then valid → re-prompts with appended error, succeeds on
 *      attempt 2 (in-gen retry, D-06); mock called exactly twice.
 *   3. compiled-AST validateAst fails within the cap → { ok: false } gap after
 *      ~3 attempts; mock called exactly MAX_IR_ATTEMPTS times (cap proven).
 *   4. an IR naming an unregistered component → componentGap, never compiled.
 *   5. smuggled JSX/HTML in an IR string field → rejected by the markup-free
 *      Zod guard → gap, never compiled.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { __setCallModelImpl, type CallModelArgs } from './modelAdapter';
import { createModelMock } from './testModelMock';
import {
  generateIR,
  __setCompileImpl,
  buildComponentContracts,
  MAX_IR_ATTEMPTS,
  MAX_INSTANCES_PER_SECTION,
  seedSectionTypography,
  type GenerateIRInput,
} from './irGenerator';
import { queryRegistry } from '@oneui/experience-builder-registry';
import type { JioExperienceIRT, JioValidationResultT } from '@oneui/experience-builder-core';

const BASE_INPUT: GenerateIRInput = {
  request: {
    brandId: 'jio-default',
    artifactType: 'web-ui',
    outputProfile: 'web-desktop',
  },
  requestedComponents: ['Button', 'Badge'],
};

/** A passing validation result (compile leg green). */
const PASS: JioValidationResultT = {
  passed: true,
  blocking: [],
  warnings: [],
  repairSuggestions: [],
  componentGaps: [],
  foundationGaps: [],
};

/** A failing validation result (compile leg red → retry trigger). */
const FAIL: JioValidationResultT = {
  passed: false,
  blocking: [{ code: 'invalid-prop', message: 'bad', severity: 'blocking' }],
  warnings: [],
  repairSuggestions: ['fix it'],
  componentGaps: [],
  foundationGaps: [],
};

/** Valid section-fill payload: registered types, no props (always allowlist-clean). */
const VALID_FILL = {
  instances: [
    { id: 'cmp-1', type: 'Button', props: {}, slots: {} },
    { id: 'cmp-2', type: 'Badge', props: {}, slots: {} },
  ],
};

const restores: Array<() => void> = [];
afterEach(() => {
  while (restores.length) restores.pop()!();
});

function useModel(queue: unknown[]): ReturnType<typeof createModelMock> {
  const mock = createModelMock(queue);
  restores.push(__setCallModelImpl(mock.impl));
  return mock;
}

function useCompile(impl: () => { bundle: string; validation: JioValidationResultT }): void {
  restores.push(__setCompileImpl((ir: JioExperienceIRT) => impl()));
}

/** Compile seam variant that receives the candidate IR (GAP-01 missing-prop tests). */
function useCompileWithIr(
  impl: (ir: JioExperienceIRT) => { bundle: string; validation: JioValidationResultT }
): void {
  restores.push(__setCompileImpl((ir: JioExperienceIRT) => impl(ir)));
}

describe('generateIR (GEN-05)', () => {
  it('returns { ok: true, ir } for a model that emits a parseIR-valid IR', async () => {
    useModel([VALID_FILL]);
    useCompile(() => ({ bundle: 'export function GeneratedArtifact() {}', validation: PASS }));

    const result = await generateIR(BASE_INPUT);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.ir.componentInstances.length).toBe(4);
      expect(result.ir.componentInstances[0].type).toBe('Text');
      expect(result.ir.componentInstances[2].type).toBe('Button');
    }
  });

  it('attaches generated topic images to Image instances before asset filtering', async () => {
    useModel([{ instances: [{ id: 'image-1', type: 'Image', props: {}, slots: {} }] }]);
    useCompile(() => ({ bundle: 'export function GeneratedArtifact() {}', validation: PASS }));

    const result = await generateIR({
      request: BASE_INPUT.request,
      requestedComponents: ['Image'],
      imageAssets: [
        {
          id: 'asset-1',
          provider: 'google-nano-banana',
          model: 'gemini-2.5-flash-image',
          mimeType: 'image/png',
          src: 'data:image/png;base64,abc123',
          alt: 'Generated image for Jio fiber launch page',
          prompt: 'Generate Jio fiber imagery',
          topic: 'Jio fiber launch page',
        },
      ],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      const image = result.ir.componentInstances.find((instance) => instance.type === 'Image');
      expect(image).toBeDefined();
      expect(image?.props).toMatchObject({
        src: 'data:image/png;base64,abc123',
        alt: 'Generated image for Jio fiber launch page',
      });
    }
  });

  it('builds responsive grids from the composition plan instead of fixed desktop columns', async () => {
    useModel([VALID_FILL]);
    useCompile(() => ({ bundle: 'ok', validation: PASS }));

    const result = await generateIR({
      request: BASE_INPUT.request,
      requestedComponents: ['Button', 'Badge'],
      sections: [{ id: 'sec-features', name: 'features' }],
      compositionPlan: {
        brandId: 'jio-default',
        pageType: 'homepage',
        pagePatternId: 'homepage-basic',
        density: 'comfortable',
        sections: [
          {
            sectionId: 'sec-features',
            patternId: 'feature-grid',
            attentionLevel: 'secondary',
            container: 'contained',
            grid: 'threeColumn',
            spacingTop: 'lg',
            spacingBottom: 'lg',
            surfaceMode: 'default',
            allowedComponents: ['Button', 'Badge'],
          },
        ],
      },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      const sectionLayout = result.ir.sections[0]?.layout;
      const grid = sectionLayout?.children[0] as any;
      expect(grid?.primitive).toBe('grid');
      expect(grid?.columns).toEqual({ S: '1', M: '2', L: '3' });
    }
  });

  it('seeds each generated section with real ToV Text before quality normalization', () => {
    const instances = [{ id: 'cta', type: 'Button', props: {}, slots: {} }];
    seedSectionTypography(
      instances,
      {
        sectionId: 'sec-hero',
        headline: 'Check JioFiber in your building',
        body: 'Confirm availability, choose a speed, and book installation.',
        cta: 'Check availability',
        toneScore: 92,
      },
      {
        id: 'sec-hero',
        name: 'hero',
        intent: 'Help users check JioFiber availability',
        attentionLevel: 'primary',
      },
    );

    expect(instances[0]?.type).toBe('Text');
    expect(instances[0]?.props).toMatchObject({
      text: 'Check JioFiber in your building',
      variant: 'headline',
      as: 'h1',
    });
    expect(instances[1]?.type).toBe('Text');
    expect(instances[1]?.props).toMatchObject({
      text: 'Confirm availability, choose a speed, and book installation.',
      variant: 'body',
    });
  });

  it('re-prompts with the appended error and succeeds on attempt 2 (in-gen retry, D-06)', async () => {
    // attempt 1: Zod-invalid (instance missing `id`) → parseIR fails → retry.
    const INVALID_FILL = { instances: [{ type: 'Button', props: {}, slots: {} }] };
    const mock = useModel([INVALID_FILL, VALID_FILL]);
    useCompile(() => ({ bundle: 'ok', validation: PASS }));

    const result = await generateIR(BASE_INPUT);

    expect(result.ok).toBe(true);
    // Fail-then-succeed = exactly 2 model calls (one section each).
    expect(mock.callCount()).toBe(2);
    // The 2nd prompt carries the appended FIX feedback (proves re-prompt).
    const secondPrompt = mock.calls()[1].prompt;
    expect(secondPrompt).toMatch(/FIX:/);
  });

  it('emits a gap after the cap when validateAst keeps failing (cap enforced, D-06)', async () => {
    // Model always returns a parseable IR, but compile validateAst always fails.
    const mock = useModel([VALID_FILL]); // queue exhausts → repeats last
    useCompile(() => ({ bundle: 'ok', validation: FAIL }));

    const result = await generateIR(BASE_INPUT);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.foundationGap).toBeDefined();
      expect(result.foundationGap!.reason).toMatch(new RegExp(`${MAX_IR_ATTEMPTS} attempts`));
    }
    // Cap reached = exactly MAX_IR_ATTEMPTS model calls (one section each).
    expect(mock.callCount()).toBe(MAX_IR_ATTEMPTS);
  });

  it('rejects an IR naming an unregistered component as a componentGap, never compiled', async () => {
    // 'FakeWidget' is not a registry id → component gap (REG-03 / Pitfall 9).
    const UNREGISTERED_FILL = {
      instances: [{ id: 'cmp-1', type: 'FakeWidget', props: {}, slots: {} }],
    };
    let compiled = false;
    const mock = useModel([UNREGISTERED_FILL]);
    useCompile(() => {
      compiled = true;
      return { bundle: 'ok', validation: PASS };
    });

    const result = await generateIR(BASE_INPUT);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.componentGap).toBeDefined();
      expect(result.componentGap!.requestedId).toBe('FakeWidget');
    }
    // Never compiled (the gap short-circuits before the compile leg).
    expect(compiled).toBe(false);
    expect(mock.callCount()).toBe(1);
  });

  it('rejects smuggled markup in an IR string field via the markup-free guard, never compiled', async () => {
    // A slot string carrying an HTML tag → parseIR markup-free refinement fails.
    const MARKUP_FILL = {
      instances: [
        {
          id: 'cmp-1',
          type: 'Button',
          props: {},
          slots: { children: '<script>alert(1)</script>' },
        },
      ],
    };
    let compiled = false;
    useModel([MARKUP_FILL]); // repeats → all attempts fail the same way
    useCompile(() => {
      compiled = true;
      return { bundle: 'ok', validation: PASS };
    });

    const result = await generateIR(BASE_INPUT);

    expect(result.ok).toBe(false);
    // Never compiled — markup is rejected at parseIR, before the compile leg.
    expect(compiled).toBe(false);
  });
});
// ---------------------------------------------------------------------------
// Prop-contract prompt enrichment (Fix 2 — closes degenerate-IR generation).
// The prompt must declare the SAME required props + enum values the validator
// enforces, plus real-copy + instance-budget guidance.
// ---------------------------------------------------------------------------

describe('generateIR — prop-contract prompt enrichment', () => {
  it('buildComponentContracts surfaces required props + enum values from the registry', () => {
    // PaginationDots requires a numeric `count` and exposes an `appearance` enum.
    const contracts = buildComponentContracts(['PaginationDots']);
    expect(contracts).toHaveLength(1);
    const pd = contracts[0];
    expect(pd.id).toBe('PaginationDots');
    expect(pd.requiredProps).toContain('count');
    expect(pd.enumProps.some((e) => e.name === 'appearance' && e.values.includes('primary'))).toBe(
      true
    );
  });

  it('skips unregistered ids in buildComponentContracts (component gate owns rejection)', () => {
    expect(buildComponentContracts(['FakeWidget'])).toHaveLength(0);
  });

  it('injects required-prop + enum context and the instance budget into the section prompt', async () => {
    const mock = useModel([VALID_FILL]);
    useCompile(() => ({ bundle: 'ok', validation: PASS }));

    await generateIR({
      request: BASE_INPUT.request,
      requestedComponents: ['PaginationDots', 'Button'],
    });

    const prompt = mock.calls()[0].prompt;
    // The exact required-prop the validator now enforces is stated to the model.
    expect(prompt).toMatch(/PaginationDots/);
    expect(prompt).toMatch(/REQUIRED props:.*count/);
    // Enum values are stated so the model picks only allowed ones.
    expect(prompt).toMatch(/appearance ∈ \{/);
    // Real-copy guidance and the instance budget are present.
    expect(prompt).toMatch(/real, meaningful copy/i);
    expect(prompt).toMatch(new RegExp(`at most ${MAX_INSTANCES_PER_SECTION} component instances`));
  });

  it('the model system message instructs supplying required props + real copy', async () => {
    const mock = useModel([VALID_FILL]);
    useCompile(() => ({ bundle: 'ok', validation: PASS }));

    await generateIR(BASE_INPUT);

    const system = mock.calls()[0].system ?? '';
    expect(system).toMatch(/REQUIRED prop/i);
    expect(system).toMatch(/real, meaningful copy/i);
  });
});

// ---------------------------------------------------------------------------
// GAP-01 — the repair loop must inject POSITIVE required-prop contracts for the
// component types present in a failing IR, so a missing-required-prop attempt
// can actually recover (instead of looping on raw blocking JSON until the cap).
// Reproduces the live failure: the model used Logo (missing `alt`), Image
// (missing `src`/`alt`), Icon (missing `icon`), ListItem (missing `title`).
// ---------------------------------------------------------------------------

describe('generateIR — GAP-01 retry injects positive required-prop contracts', () => {
  // Attempt 1: the model reaches for components OUTSIDE the requested set and
  // omits their required props (exactly the live model output).
  const MISSING_PROPS_FILL = {
    instances: [
      { id: 'cmp-logo', type: 'Logo', props: {}, slots: {} },
      { id: 'cmp-img', type: 'Image', props: {}, slots: {} },
      { id: 'cmp-icon', type: 'Icon', props: {}, slots: {} },
      { id: 'cmp-li-1', type: 'ListItem', props: {}, slots: {} },
    ],
  };
  // Attempt 2: a complete IR (registered, prop-clean) that compiles green.
  const COMPLETE_FILL = {
    instances: [{ id: 'cmp-1', type: 'Button', props: {}, slots: {} }],
  };

  /** Blocking entries shaped exactly like the real validator's missing-required-prop. */
  const MISSING_PROP_FAIL: JioValidationResultT = {
    passed: false,
    blocking: [
      {
        code: 'missing-required-prop',
        message: 'Required prop "alt" is missing on Jio component "Logo".',
        severity: 'blocking',
        nodeId: 'cmp-logo',
        offender: 'alt',
      },
      {
        code: 'missing-required-prop',
        message: 'Required prop "src" is missing on Jio component "Image".',
        severity: 'blocking',
        nodeId: 'cmp-img',
        offender: 'src',
      },
      {
        code: 'missing-required-prop',
        message: 'Required prop "icon" is missing on Jio component "Icon".',
        severity: 'blocking',
        nodeId: 'cmp-icon',
        offender: 'icon',
      },
      {
        code: 'missing-required-prop',
        message: 'Required prop "title" is missing on Jio component "ListItem".',
        severity: 'blocking',
        nodeId: 'cmp-li-1',
        offender: 'title',
      },
    ],
    warnings: [],
    repairSuggestions: [],
    componentGaps: [],
    foundationGaps: [],
  };

  it('recovers to { ok: true } on attempt 2 after a missing-required-prop attempt 1', async () => {
    const mock = useModel([MISSING_PROPS_FILL, COMPLETE_FILL]);
    // First compile fails with missing-required-prop blocking; the rest pass.
    let compileCount = 0;
    useCompileWithIr(() => {
      compileCount += 1;
      return compileCount === 1
        ? { bundle: 'ok', validation: MISSING_PROP_FAIL }
        : { bundle: 'export function GeneratedArtifact() {}', validation: PASS };
    });

    const result = await generateIR(BASE_INPUT);

    expect(result.ok).toBe(true);
    // Fail-then-succeed = exactly 2 model calls (one section each).
    expect(mock.callCount()).toBe(2);

    // The retry prompt carries POSITIVE required-prop contracts for the exact
    // component types the failing IR used — the whole point of GAP-01.
    const retryPrompt = mock.calls()[1].prompt;
    expect(retryPrompt).toMatch(/FIX:/); // existing blocking-error text preserved
    expect(retryPrompt).toMatch(/Logo/);
    expect(retryPrompt).toMatch(/Image/);
    expect(retryPrompt).toMatch(/Icon/);
    expect(retryPrompt).toMatch(/ListItem/);
    // Required prop NAMES (not just the component ids) are surfaced positively.
    expect(retryPrompt).toMatch(/REQUIRED props:.*\balt\b/);
    expect(retryPrompt).toMatch(/REQUIRED props:.*\bsrc\b/);
    expect(retryPrompt).toMatch(/REQUIRED props:.*\bicon\b/);
    expect(retryPrompt).toMatch(/REQUIRED props:.*\btitle\b/);
  });

  it('still emits a gap at the cap when the model never supplies the required props', async () => {
    // The model keeps returning the same prop-incomplete IR; compile always fails.
    const mock = useModel([MISSING_PROPS_FILL]); // queue exhausts → repeats
    useCompileWithIr(() => ({ bundle: 'ok', validation: MISSING_PROP_FAIL }));

    const result = await generateIR(BASE_INPUT);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.foundationGap).toBeDefined();
      expect(result.foundationGap!.reason).toMatch(new RegExp(`${MAX_IR_ATTEMPTS} attempts`));
    }
    // Cap reached = exactly MAX_IR_ATTEMPTS model calls (one section each).
    expect(mock.callCount()).toBe(MAX_IR_ATTEMPTS);
    // The contracts were still injected on attempts after the first failure.
    expect(mock.calls()[1].prompt).toMatch(/REQUIRED props:.*\balt\b/);
  });
});

// ---------------------------------------------------------------------------
// GAP-01 — DETERMINISTIC required-prop backfill. The model is unreliable, so the
// generator completes registry-required props BEFORE validation. These tests use
// the REAL compiler + validator (NO __setCompileImpl) to prove END-TO-END
// convergence: the live failure now resolves on attempt 1 with no model
// compliance and no extra attempts.
// ---------------------------------------------------------------------------

describe('generateIR — GAP-01 deterministic required-prop backfill', () => {
  // The exact live model output: components OUTSIDE the requested set, each
  // missing its required prop(s). Logo (no `alt`), ListItem ×2 (no `title`),
  // Icon (no `icon`), IconButton (no `icon`). NO __setCompileImpl → real compile.
  const LIVE_MISSING_PROPS_FILL = {
    instances: [
      { id: 'cmp-logo', type: 'Logo', props: {}, slots: {} },
      { id: 'cmp-li-1', type: 'ListItem', props: {}, slots: {} },
      { id: 'cmp-li-2', type: 'ListItem', props: {}, slots: {} },
      { id: 'cmp-icon', type: 'Icon', props: {}, slots: {} },
      { id: 'cmp-iconbtn', type: 'IconButton', props: {}, slots: {} },
    ],
  };

  it('converges to { ok: true } on attempt 1 (real compiler) despite zero model compliance', async () => {
    const mock = useModel([LIVE_MISSING_PROPS_FILL]);
    // NOTE: no useCompile* — the REAL compiler + validator run.

    const result = await generateIR({
      request: BASE_INPUT.request,
      requestedComponents: ['Logo', 'ListItem', 'Icon', 'IconButton'],
    });

    // Backfill completed every required prop BEFORE validation, so the real
    // validator passes on the FIRST attempt — no dependence on the model.
    expect(result.ok).toBe(true);
    expect(mock.callCount()).toBe(1);

    if (result.ok) {
      const byId = new Map(result.ir.componentInstances.map((i) => [i.id, i]));
      // Logo.alt is a free required prop → non-empty string backfilled.
      const logo = byId.get('cmp-logo')!;
      expect(typeof logo.props!.alt).toBe('string');
      expect((logo.props!.alt as string).length).toBeGreaterThan(0);
      // ListItem.title is a required ReactNode prop → non-empty string backfilled.
      const li = byId.get('cmp-li-1')!;
      expect(typeof li.props!.title).toBe('string');
      expect((li.props!.title as string).length).toBeGreaterThan(0);
      // Icon.icon + IconButton.icon are free required props → semantic name.
      expect(typeof byId.get('cmp-icon')!.props!.icon).toBe('string');
      expect(byId.get('cmp-icon')!.props!.icon).toBe('sparkles');
      expect(typeof byId.get('cmp-iconbtn')!.props!.icon).toBe('string');
      expect(byId.get('cmp-iconbtn')!.props!.icon).toBe('sparkles');
    }
  });

  it('backfills ENUM required props with a value from the registry values set (no invalid-variant)', async () => {
    // Find a registered component whose meta has an enum required prop, if any.
    const enumRequired = queryRegistry()
      .map((item) => ({
        id: item.id,
        prop: item.props.find((p) => p.required && p.values && p.values.length > 0),
      }))
      .find((x) => x.prop);

    // Only assert if such a component exists in the catalog; otherwise the
    // free-prop path above already covers backfill correctness.
    if (!enumRequired) return;

    const fill = {
      instances: [{ id: 'cmp-enum', type: enumRequired.id, props: {}, slots: {} }],
    };
    useModel([fill]); // real compiler

    const result = await generateIR({
      request: BASE_INPUT.request,
      requestedComponents: [enumRequired.id],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      const inst = result.ir.componentInstances.find((i) => i.id === 'cmp-enum')!;
      const value = inst.props![enumRequired.prop!.name];
      // The backfilled value is a member of the registry enum set.
      expect(enumRequired.prop!.values).toContain(value as string);
    }
  });

  it('does NOT overwrite a model-supplied prop and does NOT add non-required or unregistered props', async () => {
    // Logo arrives WITH a real `alt` already; backfill must leave it untouched
    // and must NOT add any non-required Logo prop (e.g. `variant`, `size`, `src`).
    const fill = {
      instances: [{ id: 'cmp-logo', type: 'Logo', props: { alt: 'Acme brand mark' }, slots: {} }],
    };
    useModel([fill]); // real compiler

    const result = await generateIR({
      request: BASE_INPUT.request,
      requestedComponents: ['Logo'],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      const logo = result.ir.componentInstances.find((i) => i.id === 'cmp-logo')!;
      // Model-supplied value preserved verbatim.
      expect(logo.props!.alt).toBe('Acme brand mark');
      // Only the required `alt` is present — no non-required props were injected.
      expect(Object.keys(logo.props!)).toEqual(['alt']);
    }
  });

  it('still produces a component gap for a genuinely unregistered id (Gate B unchanged)', async () => {
    const fill = {
      instances: [{ id: 'cmp-x', type: 'FakeWidget', props: {}, slots: {} }],
    };
    useModel([fill]); // real compiler

    const result = await generateIR(BASE_INPUT);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.componentGap).toBeDefined();
      expect(result.componentGap!.requestedId).toBe('FakeWidget');
    }
  });
});

// ===========================================================================
// Wave 0 (04.2-01) RED — advisor threading (QUAL-01/02) + backfill provenance
// (QUAL-03 / Pitfall 5).
//
// PINS the contract Plan 04 (irGenerator) drives to GREEN:
//   - GenerateIRInput carries `messageHierarchy`, `designSpecs`, `copySpecs`,
//     and `buildSectionPrompt` references the advised components + ToV copy.
//   - the deterministic required-prop backfill records a `backfilled[]` list of
//     `{ instanceId, propName, isContent }` (provenance), never overwriting a
//     model-supplied prop.
//
// These MUST fail now: `GenerateIRInput` has no advisor-spec fields, the prompt
// does not reference designSpecs/copySpecs, and no `backfilled[]` provenance is
// exposed.
// ===========================================================================

// Pull the to-be-added exports off the module namespace. `undefined` in RED.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import * as IrGen from './irGenerator';

/** The to-be-exported provenance-recording backfill (QUAL-03). Undefined in RED. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const backfillRequiredProps: any = (IrGen as Record<string, unknown>).backfillRequiredProps;

describe('generateIR — advisor threading (QUAL-01/02 / RED)', () => {
  it('GenerateIRInput accepts designSpecs / copySpecs / messageHierarchy (type-level + runtime)', async () => {
    const mock = useModel([VALID_FILL]);
    useCompile(() => ({ bundle: 'ok', validation: PASS }));

    // Type-level: these advisor-spec fields now exist on GenerateIRInput (GREEN
    // — 04.2-03 added them; the RED `@ts-expect-error` directives are retired).
    const input: GenerateIRInput = {
      request: BASE_INPUT.request,
      requestedComponents: ['Button'],
      sections: [{ id: 'sec-hero', name: 'hero', intent: 'introduce the offer' }],
      messageHierarchy: ['Get the new plan', 'Save more'],
      designSpecs: [
        {
          sectionId: 'sec-hero',
          patternId: 'hero-centered',
          attentionLevel: 'primary',
          container: 'contained',
          grid: 'oneColumn',
          spacingTop: 'xl',
          spacingBottom: 'lg',
          surfaceMode: 'bold',
          components: ['Surface', 'Button'],
          allowedComponents: ['Surface', 'Container', 'Button', 'Badge', 'Logo'],
        },
      ],
      copySpecs: [
        {
          sectionId: 'sec-hero',
          headline: 'Unlimited 5G for less',
          body: 'Switch today.',
          cta: 'Get started',
          toneScore: 88,
        },
      ],
    };

    await generateIR(input);

    // The section prompt references the advised components + the ToV copy.
    const prompt = mock.calls()[0].prompt;
    expect(prompt).toMatch(/Surface/);
    expect(prompt).toMatch(/Unlimited 5G for less/);
    expect(prompt).toMatch(/Get started/);
  });

  it('orders prompt prominence by messageHierarchy (most-prominent message first)', async () => {
    const mock = useModel([VALID_FILL]);
    useCompile(() => ({ bundle: 'ok', validation: PASS }));

    await generateIR({
      request: BASE_INPUT.request,
      requestedComponents: ['Button'],
      sections: [{ id: 'sec-hero', name: 'hero', intent: 'introduce' }],
      messageHierarchy: ['Primary message', 'Secondary message'],
    } as GenerateIRInput);

    const prompt = mock.calls()[0].prompt;
    const primary = prompt.indexOf('Primary message');
    const secondary = prompt.indexOf('Secondary message');
    expect(primary).toBeGreaterThanOrEqual(0);
    expect(secondary).toBeGreaterThan(primary);
  });

  it('threads the raw user brief into the committing IR prompt', async () => {
    const mock = useModel([VALID_FILL]);
    useCompile(() => ({ bundle: 'ok', validation: PASS }));

    await generateIR({
      request: BASE_INPUT.request,
      userPrompt:
        "Design a Premium Subscription Upgrade module for the Jio mobile dashboard with Upgrade Now and Learn More actions.",
      requestedComponents: ['Button'],
      sections: [{ id: 'sec-upgrade', name: 'upgrade module', intent: 'present the premium upgrade offer' }],
    });

    const prompt = mock.calls()[0].prompt;
    expect(prompt).toContain('USER BRIEF');
    expect(prompt).toContain('Premium Subscription Upgrade');
    expect(prompt).toContain('Upgrade Now');
    expect(prompt).toContain('Learn More');
  });
});

describe('backfillRequiredProps — provenance + non-overwrite (QUAL-03 / RED)', () => {
  it('is exported and returns a backfilled[] provenance list — RED: not yet exported', () => {
    expect(typeof backfillRequiredProps).toBe('function');
  });

  it('records each filled prop as { instanceId, propName, isContent }', () => {
    // ListItem requires a `title`; Icon requires a structural `icon`.
    const li = { id: 'li-1', type: 'ListItem', props: {}, slots: {} };
    const icon = { id: 'icon-1', type: 'Icon', props: {}, slots: {} };

    const recsLi = backfillRequiredProps(li, 'hero');
    const recsIcon = backfillRequiredProps(icon, 'hero');

    // `title` is a SECONDARY derivable prop (like alt / aria-label): a backfilled
    // value is coherent derived content, not a fabricated placeholder, so it is
    // recorded as NON-content (isContent:false) and the quality gate flags it
    // (warning) rather than hard-blocking the whole generation. Hard-blocking on a
    // backfilled `title` was a primary cause of every real run gapping.
    expect(recsLi).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ instanceId: 'li-1', propName: 'title', isContent: false }),
      ])
    );
    // The derived value is real, not a "<X> item" / "Untitled" sentinel.
    expect((li.props as Record<string, unknown>).title as string).not.toMatch(/ item$|^untitled$/i);
    // A structural icon prop is recorded with isContent:false.
    expect(recsIcon).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ instanceId: 'icon-1', propName: 'icon', isContent: false }),
      ])
    );
  });

  it('never overwrites a model-supplied prop and records nothing for it', () => {
    const li = { id: 'li-1', type: 'ListItem', props: { title: 'Real model copy' }, slots: {} };
    const recs = backfillRequiredProps(li, 'hero');
    // Model value preserved verbatim.
    expect(li.props.title).toBe('Real model copy');
    // No provenance record for a prop the model already supplied.
    expect(recs.some((r: { propName: string }) => r.propName === 'title')).toBe(false);
  });
});
