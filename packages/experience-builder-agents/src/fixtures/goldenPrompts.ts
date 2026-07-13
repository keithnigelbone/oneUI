/**
 * goldenPrompts.ts
 *
 * Golden Lab prompts for screenshot-backed quality gates. These are data-only:
 * slow workflow/browser suites can import them without duplicating prompt text.
 */

import type {
  PageCompositionPageTypeT,
  PageCompositionDensityT,
  SectionGridT,
} from '@oneui/experience-builder-core';

export type GoldenPromptViewport = 'desktop' | 'tablet' | 'mobile';

export interface GoldenPromptFixture {
  id: string;
  prompt: string;
  artifactType: string;
  expectedPageType: PageCompositionPageTypeT;
  expectedDensity: PageCompositionDensityT;
  expectedGrids: SectionGridT[];
  viewports: GoldenPromptViewport[];
}

export const GOLDEN_PROMPT_FIXTURES: readonly GoldenPromptFixture[] = [
  {
    id: 'commerce-homepage',
    prompt:
      'Create a commerce homepage for JioMart groceries with a launch hero, category shortcuts, product deals, and trust signals.',
    artifactType: 'web-ui',
    expectedPageType: 'commerce-homepage',
    expectedDensity: 'comfortable',
    expectedGrids: ['twoColumn', 'rail', 'productGrid'],
    viewports: ['desktop', 'tablet', 'mobile'],
  },
  {
    id: 'product-listing',
    prompt:
      'Design a product listing page for prepaid plans with filters, comparison cards, promotional offer strip, and repeated purchase CTAs.',
    artifactType: 'web-ui',
    expectedPageType: 'product-listing',
    expectedDensity: 'compact',
    expectedGrids: ['rail', 'productGrid'],
    viewports: ['desktop', 'tablet', 'mobile'],
  },
  {
    id: 'campaign-landing',
    prompt:
      'Build a campaign landing page for a new unlimited 5G bundle with a bold hero, benefit grid, proof, offer banner, and FAQ.',
    artifactType: 'web-ui',
    expectedPageType: 'campaign-landing',
    expectedDensity: 'editorial',
    expectedGrids: ['oneColumn', 'threeColumn', 'twoColumn'],
    viewports: ['desktop', 'tablet', 'mobile'],
  },
  {
    id: 'dashboard',
    prompt:
      'Generate a dashboard for a Jio account showing usage summary, bill recommendations, quick actions, and support shortcuts.',
    artifactType: 'web-ui',
    expectedPageType: 'dashboard',
    expectedDensity: 'compact',
    expectedGrids: ['threeColumn', 'rail'],
    viewports: ['desktop', 'tablet', 'mobile'],
  },
  {
    id: 'onboarding',
    prompt:
      'Create an onboarding flow for activating a new Jio SIM with setup steps, preferences, helpful proof points, and final confirmation.',
    artifactType: 'web-ui',
    expectedPageType: 'onboarding',
    expectedDensity: 'comfortable',
    expectedGrids: ['oneColumn', 'threeColumn'],
    viewports: ['desktop', 'tablet', 'mobile'],
  },
] as const;
