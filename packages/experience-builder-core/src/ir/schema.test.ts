import { describe, it, expect } from 'vitest';
import {
  JioExperienceIR,
  parseIR,
  containsMarkup,
  MarkupFreeString,
  JioIRComponentInstance,
} from './schema';
// Wave 0 (04.2-01) RED scaffold: the layout node does NOT exist yet. This
// import resolves to `undefined` today, so every assertion that exercises it
// fails with a meaningful "cannot read property of undefined" / parse mismatch
// — the contract Plan 02 (schema) drives to GREEN (LAYOUT-01/02/03/04/05).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import * as Schema from './schema';
import { makeValidIr } from './__fixtures__/validIr';

/** The to-be-added recursive layout node (LAYOUT-01). Undefined in RED. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const JioIRLayoutNode: any = (Schema as Record<string, unknown>).JioIRLayoutNode;

describe('JioExperienceIR — valid parse + required fields (IR-01 / IR-04)', () => {
  it('parses a fully-populated valid IR', () => {
    const result = parseIR(makeValidIr());
    expect(result.success).toBe(true);
  });

  const REQUIRED_FIELDS = [
    'version',
    'artifactType',
    'targetProfile',
    'brandId',
    'foundationRefs',
    'sections',
    'componentInstances',
    'content',
    'a11yRequirements',
    'validationStatus',
  ] as const;

  it.each(REQUIRED_FIELDS)('fails safeParse when required field "%s" is omitted', (field) => {
    const ir = makeValidIr() as Record<string, unknown>;
    delete ir[field];
    expect(JioExperienceIR.safeParse(ir).success).toBe(false);
  });

  it('rejects a wrong version literal', () => {
    const ir = { ...makeValidIr(), version: 2 };
    expect(JioExperienceIR.safeParse(ir).success).toBe(false);
  });
});

describe('Markup-free invariant (IR-02 / T-01-01)', () => {
  it('containsMarkup flags tags, attributes, and dangerouslySetInnerHTML', () => {
    expect(containsMarkup('<div>')).toBe(true);
    expect(containsMarkup('</span>')).toBe(true);
    expect(containsMarkup('text className="w-full"')).toBe(true);
    expect(containsMarkup('class="x"')).toBe(true);
    expect(containsMarkup('style="color:red"')).toBe(true);
    expect(containsMarkup('dangerouslySetInnerHTML')).toBe(true);
  });

  it('containsMarkup allows plain escaped text', () => {
    expect(containsMarkup('Get started')).toBe(false);
    expect(containsMarkup('Price < 100 rupees')).toBe(false); // `<` not followed by a tag letter
    expect(containsMarkup('a > b comparison')).toBe(false);
    expect(MarkupFreeString.safeParse('Welcome to Jio').success).toBe(true);
  });

  it('rejects a slot string carrying <div>', () => {
    const ir = makeValidIr();
    ir.sections[0].instances[0].slots = { children: '<div>hi</div>' };
    expect(JioExperienceIR.safeParse(ir).success).toBe(false);
  });

  it('rejects a slot string carrying className=', () => {
    const ir = makeValidIr();
    ir.sections[0].instances[0].slots = { children: 'hi className="x"' };
    expect(JioExperienceIR.safeParse(ir).success).toBe(false);
  });

  it('rejects a slot string carrying style=', () => {
    const ir = makeValidIr();
    ir.sections[0].instances[0].slots = { children: 'hi style="color:red"' };
    expect(JioExperienceIR.safeParse(ir).success).toBe(false);
  });

  it('ADVERSARIAL "just give me the HTML": an IR smuggling raw markup is rejected', () => {
    // Red-team fixture: a prompt that tries to bypass the DS by stuffing the
    // full HTML page into a content string. Must NOT parse as valid IR.
    const ir = makeValidIr() as Record<string, unknown>;
    ir.content = {
      'hero.title':
        '<section class="hero"><h1 style="font-size:64px">Buy now</h1>' +
        '<button onclick="x()">CTA</button></section>',
    };
    expect(JioExperienceIR.safeParse(ir).success).toBe(false);
  });

  it('ADVERSARIAL dangerouslySetInnerHTML in a prop string is rejected', () => {
    const ir = makeValidIr();
    ir.sections[0].instances[0].props = {
      label: 'click dangerouslySetInnerHTML',
    };
    expect(JioExperienceIR.safeParse(ir).success).toBe(false);
  });
});

describe('No markup-bearing field exists anywhere (IR-02 static + dynamic audit)', () => {
  const FORBIDDEN_KEYS = [
    'rawHtml',
    'html',
    'tag',
    'dangerouslySetInnerHTML',
  ] as const;

  it.each(FORBIDDEN_KEYS)('a component instance carrying forbidden key "%s" is rejected (strict)', (key) => {
    const instance = {
      id: 'x',
      type: 'Button',
      [key]: 'div',
    };
    // `.strict()` rejects unknown keys → the smuggling channel is closed.
    expect(JioIRComponentInstance.safeParse(instance).success).toBe(false);
  });

  it('static key audit: schema source defines no markup-bearing field', async () => {
    // Read the schema source and assert it never DEFINES a markup field.
    // (Refinement strings that REJECT markup are allowed.)
    const fs = await import('node:fs');
    const url = await import('node:url');
    const path = url.fileURLToPath(new URL('./schema.ts', import.meta.url));
    const src = fs.readFileSync(path, 'utf8');
    // No object key literally named rawHtml/html/tag/dangerouslySetInnerHTML.
    expect(/\b(rawHtml|dangerouslySetInnerHTML)\s*:/.test(src)).toBe(false);
    // `tag:` and `html:` as a Zod object key would be a field definition.
    expect(/\n\s*tag\s*:/.test(src)).toBe(false);
    expect(/\n\s*html\s*:/.test(src)).toBe(false);
  });
});

// ===========================================================================
// Wave 0 (04.2-01) RED — compositional layout node contract
// (LAYOUT-01/02/03/04/05 + Pitfall 1 old-flat-IR round-trip).
//
// These tests PIN the contract Plan 02 (schema.ts JioIRLayoutNode + additive
// `layout` tree on JioIRSection) drives to GREEN. They MUST fail now because
// `JioIRLayoutNode` does not exist yet (it imports `undefined`).
// ===========================================================================

describe('JioIRLayoutNode — compositional layout primitive (LAYOUT-01..05 / RED)', () => {
  it('exists as an exported Zod schema (LAYOUT-01) — RED: not yet added to schema.ts', () => {
    // The whole block depends on this. In RED this is `undefined`.
    expect(JioIRLayoutNode).toBeDefined();
    expect(typeof JioIRLayoutNode?.safeParse).toBe('function');
  });

  it('(a) parses a kind:"layout" node with primitive:"stack", token gap and empty children', () => {
    const node = {
      kind: 'layout',
      primitive: 'stack',
      gap: '4',
      children: [],
    };
    expect(JioIRLayoutNode.safeParse(node).success).toBe(true);
  });

  it('(b) rejects a layout node carrying a `tag` key via .strict() (markup-smuggling guard)', () => {
    const node = {
      kind: 'layout',
      primitive: 'stack',
      gap: '4',
      children: [],
      tag: 'div',
    };
    expect(JioIRLayoutNode.safeParse(node).success).toBe(false);
  });

  it('(b2) rejects a layout node carrying a `rawHtml` key via .strict()', () => {
    const node = {
      kind: 'layout',
      primitive: 'stack',
      gap: '4',
      children: [],
      rawHtml: '<div>x</div>',
    };
    expect(JioIRLayoutNode.safeParse(node).success).toBe(false);
  });

  it('(c) rejects a literal `gap:"16px"` — token-only refinement (LAYOUT-03)', () => {
    const node = {
      kind: 'layout',
      primitive: 'stack',
      gap: '16px',
      children: [],
    };
    expect(JioIRLayoutNode.safeParse(node).success).toBe(false);
  });

  it('(c2) accepts a token-ref gap `var(--Spacing-4)` (LAYOUT-03 escape hatch)', () => {
    const node = {
      kind: 'layout',
      primitive: 'stack',
      gap: 'var(--Spacing-4)',
      children: [],
    };
    expect(JioIRLayoutNode.safeParse(node).success).toBe(true);
  });

  it('(d) parses a responsive `columns:{S:"4",L:"12"}` object on a grid primitive (LAYOUT-04)', () => {
    const node = {
      kind: 'layout',
      primitive: 'grid',
      gap: '4',
      columns: { S: '4', L: '12' },
      children: [],
    };
    expect(JioIRLayoutNode.safeParse(node).success).toBe(true);
  });

  it('(e) parses a nested layout-in-layout-in-instance tree to arbitrary depth (LAYOUT-02)', () => {
    const node = {
      kind: 'layout',
      primitive: 'stack',
      gap: '4',
      children: [
        {
          kind: 'layout',
          primitive: 'grid',
          gap: '2',
          columns: { S: '4', L: '12' },
          children: [
            // A leaf component instance lives at the bottom of the layout tree.
            { id: 'btn-1', type: 'Button', props: { variant: 'bold' } },
          ],
        },
      ],
    };
    expect(JioIRLayoutNode.safeParse(node).success).toBe(true);
  });

  it('(f) an OLD flat IR using only `instances` (no `layout` field) still parses (Pitfall 1 round-trip)', () => {
    // The additive-optional strategy: the canonical pre-04.2 fixture must keep
    // parsing unchanged once `layout` is added as an OPTIONAL section field.
    const ir = makeValidIr();
    expect(parseIR(ir).success).toBe(true);
    // And the section carries NO `layout` field — proving optionality.
    expect((ir.sections[0] as Record<string, unknown>).layout).toBeUndefined();
  });

  it('(f2) a NEW IR carrying an additive section `layout` tree parses (additive-optional)', () => {
    const ir = makeValidIr() as Record<string, unknown>;
    const sections = ir.sections as Array<Record<string, unknown>>;
    sections[0].layout = {
      kind: 'layout',
      primitive: 'stack',
      gap: '4',
      children: [{ id: 'inst-hero-button', type: 'Button', props: { variant: 'bold' } }],
    };
    expect(JioExperienceIR.safeParse(ir).success).toBe(true);
  });
});
