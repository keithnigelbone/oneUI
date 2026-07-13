import { describe, expect, it } from 'vitest';
import { CompositionSpec, parseCompositionSpec } from './schema';

function validSpec() {
  return {
    version: '1',
    name: 'Valid composition',
    artifactType: 'web-ui',
    targetProfile: 'web-desktop',
    brandId: 'jio',
    root: {
      id: 'root',
      component: 'Container',
      props: { direction: 'column' },
      surface: 'default',
      slots: {
        children: [
          {
            id: 'cta',
            component: 'Button',
            props: { variant: 'bold', appearance: 'primary' },
            slots: { children: 'Get started' },
            contentRef: 'hero.cta',
          },
        ],
      },
    },
    content: {
      'hero.cta': 'Get started',
    },
  } as const;
}

describe('CompositionSpec schema', () => {
  it('parses a component-only spec with stable ids, slots, surface, and content refs', () => {
    expect(parseCompositionSpec(validSpec()).success).toBe(true);
  });

  it('rejects raw element/tag fields', () => {
    const spec = validSpec() as any;
    spec.root.tag = 'div';
    expect(CompositionSpec.safeParse(spec).success).toBe(false);
  });

  it('rejects className and inline style props at the schema boundary', () => {
    const spec = validSpec() as any;
    spec.root.slots.children[0].props.className = 'hero';
    expect(CompositionSpec.safeParse(spec).success).toBe(false);

    delete spec.root.slots.children[0].props.className;
    spec.root.slots.children[0].props.style = { color: 'red' };
    expect(CompositionSpec.safeParse(spec).success).toBe(false);
  });

  it('rejects markup-bearing slot copy', () => {
    const spec = validSpec() as any;
    spec.root.slots.children[0].slots.children = '<div>Buy now</div>';
    expect(CompositionSpec.safeParse(spec).success).toBe(false);
  });
});
