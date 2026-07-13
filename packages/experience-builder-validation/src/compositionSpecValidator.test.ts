import { describe, expect, it } from 'vitest';
import { improveCompositionSpecQuality, type CompositionSpecT } from '@oneui/experience-builder-core';
import { validateCompositionSpec } from './compositionSpecValidator';

function validSpec() {
  return {
    version: '1',
    name: 'Spec validation fixture',
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
            id: 'hero',
            component: 'Surface',
            surface: 'bold',
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
        ],
      },
    },
    content: {
      'hero.cta': 'Get started',
    },
  } as const;
}

describe('validateCompositionSpec', () => {
  it('passes a registry-only spec with canonical surface fields', () => {
    const result = validateCompositionSpec(validSpec());
    expect(result.passed).toBe(true);
    expect(result.blocking).toHaveLength(0);
  });

  it('blocks raw style/className/code props', () => {
    const spec = validSpec() as any;
    spec.root.slots.children[0].slots.children[0].props.className = 'hero';
    const result = validateCompositionSpec(spec);
    expect(result.passed).toBe(false);
    expect(result.blocking.some((violation) => violation.code === 'invalid-composition-spec')).toBe(
      true
    );
  });

  it('blocks unregistered components with a component gap', () => {
    const spec = validSpec() as any;
    spec.root.slots.children[0].slots.children[0].component = 'GlassHero';
    const result = validateCompositionSpec(spec);
    expect(result.passed).toBe(false);
    expect(result.blocking.some((violation) => violation.code === 'unregistered-component')).toBe(
      true
    );
    expect(result.componentGaps.some((gap) => gap.componentType === 'GlassHero')).toBe(true);
  });

  it('blocks invalid props, variants, and missing required children', () => {
    const spec = validSpec() as any;
    const cta = spec.root.slots.children[0].slots.children[0];
    cta.props.variant = 'glass';
    cta.props.madeUp = 'x';
    delete cta.slots.children;
    const result = validateCompositionSpec(spec);
    expect(result.passed).toBe(false);
    expect(result.blocking.some((violation) => violation.code === 'invalid-variant')).toBe(true);
    expect(result.blocking.some((violation) => violation.code === 'invalid-prop')).toBe(true);
    expect(result.blocking.some((violation) => violation.code === 'missing-required-prop')).toBe(
      true
    );
  });

  it('blocks manual background token props instead of requiring surface context by convention only', () => {
    const spec = validSpec() as any;
    spec.root.props.backgroundColor = 'var(--Primary-Bold)';
    const result = validateCompositionSpec(spec);
    expect(result.passed).toBe(false);
    expect(
      result.blocking.some((violation) => violation.code === 'manual-background-without-surface')
    ).toBe(true);
  });

  it('blocks placeholder content and stale content refs', () => {
    const spec = validSpec() as any;
    const cta = spec.root.slots.children[0].slots.children[0];
    cta.slots.children = 'Hero item';
    cta.contentRef = 'missing.copy';
    const result = validateCompositionSpec(spec);
    expect(result.passed).toBe(false);
    expect(result.blocking.some((violation) => violation.code === 'placeholder-content')).toBe(
      true
    );
    expect(result.blocking.some((violation) => violation.code === 'missing-content-ref')).toBe(
      true
    );
  });

  it('blocks Surface nodes that omit the canonical surface field', () => {
    const spec = validSpec() as any;
    delete spec.root.slots.children[0].surface;
    const result = validateCompositionSpec(spec);
    expect(result.passed).toBe(false);
    expect(result.blocking.some((violation) => violation.code === 'missing-surface')).toBe(true);
  });

  it('allows WebHeader compound navigation parts from the registry', () => {
    const spec = validSpec() as any;
    spec.root.slots.children = [
      {
        id: 'header',
        component: 'WebHeader',
        props: { variant: 'default', breakpoint: 'L', 'aria-label': 'Jio site header' },
        slots: {
          children: [
            {
              id: 'primary-nav',
              component: 'PrimaryNav',
              props: {
                type: 'homeBar',
                middle: 'fluid',
                searchInput: 'end',
                showMenuButton: true,
                primaryNavItems: true,
                showAvatar: true,
                divider: true,
                activeValue: 'home',
                'aria-label': 'Jio primary navigation',
              },
              slots: {
                logo: [
                  {
                    id: 'logo',
                    component: 'Logo',
                    props: { alt: 'Jio', size: 'l', variant: 'mark', src: '/JioLogo.svg' },
                  },
                ],
                end: [
                  {
                    id: 'hello-jio',
                    component: 'IconButton',
                    props: {
                      icon: 'sparkles',
                      'aria-label': 'Ask HelloJio',
                      variant: 'subtle',
                      appearance: 'primary',
                      size: 8,
                      condensed: true,
                    },
                  },
                  {
                    id: 'notifications',
                    component: 'IconButton',
                    props: {
                      icon: 'notification',
                      'aria-label': 'Notifications',
                      variant: 'ghost',
                      appearance: 'neutral',
                      size: 8,
                      condensed: true,
                    },
                  },
                ],
                avatar: [
                  {
                    id: 'avatar',
                    component: 'Avatar',
                    props: { alt: 'Jane Doe', size: 'xl', content: 'icon', appearance: 'secondary' },
                  },
                ],
                children: [
                  {
                    id: 'home-item',
                    component: 'HeaderItem',
                    props: { value: 'home', href: '#home', active: true, attention: 'high' },
                    slots: { children: 'Home' },
                  },
                ],
              },
            },
          ],
        },
      },
    ];

    const result = validateCompositionSpec(spec);
    expect(result.passed).toBe(true);
    expect(result.componentGaps).toHaveLength(0);
  });

  it('rejects WebHeader aliases in final output', () => {
    const spec = validSpec() as any;
    spec.root.slots.children = [
      {
        id: 'nav',
        component: 'Navbar',
        slots: { children: [] },
      },
    ];

    const result = validateCompositionSpec(spec);
    expect(result.passed).toBe(false);
    expect(result.blocking.some((violation) => violation.code === 'storybook-recipe-drift')).toBe(
      true
    );
    expect(result.blocking.some((violation) => violation.code === 'unregistered-component')).toBe(
      false
    );
  });

  it('rejects WebHeader without PrimaryNav', () => {
    const spec = validSpec() as any;
    spec.root.slots.children = [
      {
        id: 'header',
        component: 'WebHeader',
        slots: { children: [] },
      },
    ];

    const result = validateCompositionSpec(spec);
    expect(result.passed).toBe(false);
    expect(result.blocking.some((violation) => violation.code === 'compound-contract-violation')).toBe(
      true
    );
  });

  it('rejects PrimaryNav children that are not HeaderItem', () => {
    const spec = validSpec() as any;
    spec.root.slots.children = [
      {
        id: 'header',
        component: 'WebHeader',
        slots: {
          children: [
            {
              id: 'primary-nav',
              component: 'PrimaryNav',
              props: { type: 'homeBar', activeValue: 'home', showAvatar: false },
              slots: {
                logo: [{ id: 'logo', component: 'Logo', props: { alt: 'Jio' } }],
                end: [{ id: 'search', component: 'IconButton', props: { icon: 'search', 'aria-label': 'Search' } }],
                children: [{ id: 'bad-child', component: 'Button', slots: { children: 'Home' } }],
              },
            },
          ],
        },
      },
    ];

    const result = validateCompositionSpec(spec);
    expect(result.passed).toBe(false);
    expect(result.blocking.some((violation) => violation.code === 'compound-contract-violation')).toBe(
      true
    );
  });

  it('rejects activeValue that does not match the active HeaderItem', () => {
    const spec = validSpec() as any;
    spec.root.slots.children = [
      {
        id: 'header',
        component: 'WebHeader',
        slots: {
          children: [
            {
              id: 'primary-nav',
              component: 'PrimaryNav',
              props: { type: 'homeBar', activeValue: 'home', showAvatar: false },
              slots: {
                logo: [{ id: 'logo', component: 'Logo', props: { alt: 'Jio' } }],
                end: [{ id: 'search', component: 'IconButton', props: { icon: 'search', 'aria-label': 'Search' } }],
                children: [
                  {
                    id: 'products-item',
                    component: 'HeaderItem',
                    props: { value: 'products', active: true },
                    slots: { children: 'Products' },
                  },
                ],
              },
            },
          ],
        },
      },
    ];

    const result = validateCompositionSpec(spec);
    expect(result.passed).toBe(false);
    expect(result.blocking.some((violation) => violation.code === 'compound-contract-violation')).toBe(
      true
    );
  });

  it('keeps the landing quality recipe aligned with registry enum props', () => {
    const weakSpec: CompositionSpecT = {
      version: '1',
      name: 'Jio.com app web',
      artifactType: 'web-ui',
      targetProfile: 'web-desktop',
      brandId: 'jio',
      intent: 'Webheader navigation and product teasers using storybook components',
      root: {
        id: 'composition-root',
        component: 'Container',
        props: { direction: 'column' },
        slots: {
          children: [
            {
              id: 'section-hero',
              component: 'Container',
              slots: {
                children: [
                  {
                    id: 'cta',
                    component: 'Button',
                    props: { variant: 'bold' },
                    slots: { children: 'Get started' },
                  },
                ],
              },
            },
            { id: 'section-plans', component: 'Container', slots: { children: [] } },
            { id: 'section-faq', component: 'Container', slots: { children: [] } },
          ],
        },
      },
    };

    const result = validateCompositionSpec(improveCompositionSpecQuality(weakSpec));
    expect(result.passed).toBe(true);
    expect(result.blocking).toHaveLength(0);
  });
});
