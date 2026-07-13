/**
 * A fully-populated, valid Jio Experience IR fixture used across Wave 0 tests
 * (schema parse, IR↔AST mapping, JSON-patch round-trip). Markup-free by
 * construction. Layout primitives are registry component names (Surface,
 * Container, Stack) — never raw tags.
 */

import type { JioExperienceIRT } from '../schema';

export function makeValidIr(): JioExperienceIRT {
  return {
    version: 1,
    artifactType: 'web-ui',
    targetProfile: 'web-desktop',
    brandId: 'jio',
    foundationRefs: ['brand:jio', 'theme:light', 'density:default'],
    sections: [
      {
        id: 'sec-hero',
        name: 'hero',
        surfaceMode: 'bold',
        instances: [
          {
            id: 'inst-hero-surface',
            type: 'Surface',
            props: { mode: 'bold' },
            slots: {
              children: [
                {
                  id: 'inst-hero-button',
                  type: 'Button',
                  props: { variant: 'bold', appearance: 'primary' },
                  slots: { children: 'Get started' },
                },
              ],
            },
          },
        ],
      },
    ],
    componentInstances: [
      {
        id: 'inst-hero-surface',
        type: 'Surface',
        props: { mode: 'bold' },
        slots: {
          children: [
            {
              id: 'inst-hero-button',
              type: 'Button',
              props: { variant: 'bold', appearance: 'primary' },
              slots: { children: 'Get started' },
            },
          ],
        },
      },
    ],
    content: {
      'hero.title': 'Welcome to Jio',
      'hero.cta': 'Get started',
    },
    a11yRequirements: {
      wcagLevel: 'AA',
      minContrastRatio: 4.5,
      notes: ['All interactive controls keyboard reachable'],
    },
    validationStatus: 'valid',
  };
}
