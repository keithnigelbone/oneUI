import { describe, expect, it } from 'vitest';
import { CompositionSpec, type CompositionSpecT } from './schema';
import { auditCompositionSpecQuality, improveCompositionSpecQuality } from './quality';
import { collectCompositionComponents } from './converters';

function weakLandingSpec(): CompositionSpecT {
  return {
    version: '1',
    name: 'weak landing',
    artifactType: 'web-ui',
    targetProfile: 'web-desktop',
    brandId: 'jio',
    content: {
      'hero.headline': 'Your world, one tap away',
      'hero.body': 'Recharge, stream and manage daily digital life with Jio.',
      'plans.headline': 'Plans for every rhythm',
      'plans.body': 'Compare practical options before choosing what fits.',
      'faq.headline': 'Quick answers',
      'faq.body': 'Know the essentials before you recharge or upgrade.',
    },
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
                { id: 'empty-surface', component: 'Surface', surface: 'bold', slots: { children: [] } },
                { id: 'cta', component: 'Button', props: { variant: 'bold' }, slots: { children: 'Get started' } },
              ],
            },
          },
          { id: 'section-plans', component: 'Container', slots: { children: [] } },
          { id: 'section-faq', component: 'Container', slots: { children: [] } },
        ],
      },
    },
  };
}

function strongGeneratedSpec(): CompositionSpecT {
  return {
    version: '1',
    name: 'strong generated page',
    artifactType: 'web-ui',
    targetProfile: 'web-desktop',
    brandId: 'jio',
    root: {
      id: 'composition-root',
      component: 'Container',
      props: { layout: 'flex', direction: 'column' },
      slots: {
        children: [
          {
            id: 'section-hero',
            component: 'Container',
            slots: {
              children: [
                { id: 'hero-title', component: 'Text', props: { text: 'A fiber plan for busy homes', variant: 'headline', size: 'L' } },
                { id: 'hero-body', component: 'Text', props: { text: 'Stream, work and learn with a home broadband plan that fits your family.' } },
              ],
            },
          },
          {
            id: 'section-availability',
            component: 'Container',
            slots: {
              children: [
                { id: 'availability-title', component: 'Text', props: { text: 'Check availability by address', variant: 'title', size: 'M' } },
                { id: 'availability-body', component: 'Text', props: { text: 'See installation options before choosing a speed.' } },
              ],
            },
          },
          {
            id: 'section-support',
            component: 'Container',
            slots: {
              children: [
                { id: 'support-title', component: 'Text', props: { text: 'Support that stays close', variant: 'title', size: 'M' } },
                { id: 'support-body', component: 'Text', props: { text: 'Manage plan changes, setup and help from one place.' } },
              ],
            },
          },
        ],
      },
    },
  };
}

describe('CompositionSpec quality recipes', () => {
  it('detects weak generated structure before recipe normalization', () => {
    const audit = auditCompositionSpecQuality(weakLandingSpec());
    expect(audit.passed).toBe(false);
    expect(audit.issues).toEqual(expect.arrayContaining(['missing-text-hierarchy', 'empty-surface-nodes']));
  });

  it('rewrites weak web UI specs into component-only recipe sections', () => {
    const improved = improveCompositionSpecQuality(weakLandingSpec());
    const parsed = CompositionSpec.safeParse(improved);
    expect(parsed.success).toBe(true);

    const audit = auditCompositionSpecQuality(improved);
    expect(audit.passed).toBe(true);
    expect(audit.sectionCount).toBe(4);
    expect(audit.textNodeCount).toBeGreaterThanOrEqual(8);

    const components = collectCompositionComponents(improved);
    expect(components).toEqual(
      expect.arrayContaining([
        'WebHeader',
        'PrimaryNav',
        'HeaderItem',
        'Logo',
        'IconButton',
        'Avatar',
        'Icon',
        'Container',
        'Text',
        'Grid',
        'Button',
      ]),
    );
    expect(components).not.toContain('Surface');
    expect(improved.metadata?.qualityRecipeVersion).toBe('landing-web-v1');
  });

  it('leaves already-structured generated specs unchanged', () => {
    const spec = strongGeneratedSpec();
    const audit = auditCompositionSpecQuality(spec);
    expect(audit.passed).toBe(true);

    const improved = improveCompositionSpecQuality(spec);
    expect(improved).toBe(spec);
    expect(JSON.stringify(improved)).not.toContain('Explore Jio');
  });

  it('does not inflate focused module prompts into the generic landing-page recipe', () => {
    const spec: CompositionSpecT = {
      version: '1',
      name: 'premium subscription upgrade module',
      artifactType: 'web-ui',
      targetProfile: 'web-desktop',
      brandId: 'jio',
      intent:
        "Design a Premium Subscription Upgrade module for the Jio mobile dashboard with Upgrade Now and Learn More actions.",
      content: {
        'upgrade.headline': 'Upgrade to Jio Premium',
        'upgrade.body': 'Unlock faster speeds, priority support and entertainment benefits in one plan.',
      },
      root: {
        id: 'composition-root',
        component: 'Container',
        props: { layout: 'flex', direction: 'column' },
        slots: {
          children: [
            {
              id: 'section-upgrade',
              component: 'Container',
              slots: {
                children: [
                  {
                    id: 'upgrade-title',
                    component: 'Text',
                    props: { text: 'Upgrade to Jio Premium', variant: 'title', size: 'M' },
                  },
                  {
                    id: 'upgrade-body',
                    component: 'Text',
                    props: {
                      text: 'Unlock faster speeds, priority support and entertainment benefits in one plan.',
                    },
                  },
                  { id: 'upgrade-now', component: 'Button', slots: { children: 'Upgrade Now' } },
                  { id: 'learn-more', component: 'Button', slots: { children: 'Learn More' } },
                ],
              },
            },
          ],
        },
      },
    };

    const audit = auditCompositionSpecQuality(spec);
    expect(audit.issues).not.toContain('too-few-sections');

    const improved = improveCompositionSpecQuality(spec);
    expect(improved).toBe(spec);
    const serialized = JSON.stringify(improved);
    expect(serialized).toContain('Upgrade Now');
    expect(serialized).toContain('Learn More');
    expect(serialized).not.toContain('Explore Jio');
    expect(serialized).not.toContain('Everyday 5G');
  });

  it('uses product-aware fallback copy for JioFiber prompts', () => {
    const spec = weakLandingSpec();
    spec.name = 'JioFiber landing page';
    spec.intent = 'Promote JioFiber home internet with a web header and product cards';
    spec.content = {};

    const improved = improveCompositionSpecQuality(spec);
    const serialized = JSON.stringify(improved);

    expect(serialized).toContain('JioFiber');
    expect(serialized).toContain('WebHeader');
    expect(serialized).toContain('/JioLogo.svg');
    expect(serialized).toContain('High-speed internet built for every room');
    expect(serialized).toContain('Check availability');
    expect(serialized).toContain('Entertainment bundle');
    expect(serialized).not.toContain('Everyday 5G');
  });

  it('leaves non-web artifacts unchanged', () => {
    const spec = weakLandingSpec();
    spec.artifactType = 'instagram-carousel';
    const improved = improveCompositionSpecQuality(spec);
    expect(improved).toBe(spec);
  });
});
