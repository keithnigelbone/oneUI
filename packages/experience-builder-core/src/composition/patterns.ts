/**
 * patterns.ts
 *
 * Typed, deterministic page and section pattern registry for the Lab
 * composition engine. These are compact recipes: the model can choose among
 * them, and the IR generator maps them to closed layout primitives.
 */

import type {
  PageCompositionDensityT,
  PageCompositionPageTypeT,
  SectionAttentionLevelT,
  SectionContainerT,
  SectionGridT,
  SectionSpacingT,
  SurfaceModeT,
} from './schema';
import {
  DEFAULT_DENSITY,
  DEFAULT_PAGE_PATTERN_ID,
  DEFAULT_PAGE_TYPE,
  DEFAULT_SECTION_PATTERN_ID,
} from './schema';

export interface SectionPattern {
  id: string;
  intent: string;
  allowedPageTypes: PageCompositionPageTypeT[];
  container: SectionContainerT;
  grid: SectionGridT;
  spacingTop: SectionSpacingT;
  spacingBottom: SectionSpacingT;
  attentionLevel: SectionAttentionLevelT;
  surfaceMode: SurfaceModeT;
  allowedComponents: string[];
}

export interface PagePattern {
  id: string;
  pageType: PageCompositionPageTypeT;
  density: PageCompositionDensityT;
  sectionPatternIds: string[];
}

export const SECTION_PATTERNS: readonly SectionPattern[] = [
  {
    id: 'hero-centered',
    intent: 'A focused hero with one headline, support copy, and a clear primary action.',
    allowedPageTypes: ['homepage', 'commerce-homepage', 'campaign-landing'],
    container: 'contained',
    grid: 'oneColumn',
    spacingTop: 'xl',
    spacingBottom: 'lg',
    attentionLevel: 'primary',
    surfaceMode: 'bold',
    allowedComponents: ['Surface', 'Container', 'Text', 'Button', 'Badge', 'Logo'],
  },
  {
    id: 'hero-split',
    intent: 'A two-column introduction with message on one side and support content on the other.',
    allowedPageTypes: ['homepage', 'commerce-homepage', 'campaign-landing', 'product-detail'],
    container: 'contained',
    grid: 'twoColumn',
    spacingTop: 'xl',
    spacingBottom: 'lg',
    attentionLevel: 'primary',
    surfaceMode: 'bold',
    allowedComponents: ['Surface', 'Container', 'Text', 'Button', 'Badge', 'Image', 'Logo'],
  },
  {
    id: 'category-rail',
    intent: 'A scannable horizontal rail for category or shortcut choices.',
    allowedPageTypes: ['commerce-homepage', 'product-listing', 'dashboard'],
    container: 'contained',
    grid: 'rail',
    spacingTop: 'md',
    spacingBottom: 'md',
    attentionLevel: 'supporting',
    surfaceMode: 'default',
    allowedComponents: ['Text', 'Chip', 'ChipGroup', 'Button', 'IconButton', 'Badge'],
  },
  {
    id: 'product-grid',
    intent: 'A dense but readable grid of comparable items with repeated CTAs.',
    allowedPageTypes: ['commerce-homepage', 'product-listing'],
    container: 'contained',
    grid: 'productGrid',
    spacingTop: 'md',
    spacingBottom: 'lg',
    attentionLevel: 'secondary',
    surfaceMode: 'default',
    allowedComponents: ['Container', 'Grid', 'Text', 'Button', 'Badge', 'Image', 'Divider'],
  },
  {
    id: 'offer-banner',
    intent: 'A compact promotional strip with one offer and one action.',
    allowedPageTypes: ['commerce-homepage', 'campaign-landing', 'product-listing'],
    container: 'contained',
    grid: 'twoColumn',
    spacingTop: 'md',
    spacingBottom: 'md',
    attentionLevel: 'secondary',
    surfaceMode: 'subtle',
    allowedComponents: ['Surface', 'Text', 'Button', 'Badge', 'Icon'],
  },
  {
    id: 'feature-grid',
    intent: 'A structured set of feature or benefit cards.',
    allowedPageTypes: ['homepage', 'campaign-landing', 'dashboard', 'onboarding'],
    container: 'contained',
    grid: 'threeColumn',
    spacingTop: 'lg',
    spacingBottom: 'lg',
    attentionLevel: 'secondary',
    surfaceMode: 'default',
    allowedComponents: ['Container', 'Grid', 'Text', 'Badge', 'Icon', 'Button', 'Divider'],
  },
  {
    id: 'trust-section',
    intent: 'A quiet proof section with reassurance, support, or trust signals.',
    allowedPageTypes: ['homepage', 'commerce-homepage', 'campaign-landing', 'checkout'],
    container: 'contained',
    grid: 'threeColumn',
    spacingTop: 'lg',
    spacingBottom: 'lg',
    attentionLevel: 'supporting',
    surfaceMode: 'minimal',
    allowedComponents: ['Surface', 'Text', 'Badge', 'Icon', 'Divider', 'Button'],
  },
  {
    id: 'settings-group',
    intent: 'A grouped task section with settings, fields, or preference controls.',
    allowedPageTypes: ['settings', 'onboarding', 'checkout'],
    container: 'narrow',
    grid: 'oneColumn',
    spacingTop: 'md',
    spacingBottom: 'md',
    attentionLevel: 'secondary',
    surfaceMode: 'subtle',
    allowedComponents: ['Surface', 'Text', 'InputField', 'Switch', 'Checkbox', 'Radio', 'Button'],
  },
  {
    id: 'dashboard-summary',
    intent: 'A data-first summary with metrics, recommendations, and quick actions.',
    allowedPageTypes: ['dashboard'],
    container: 'contained',
    grid: 'threeColumn',
    spacingTop: 'md',
    spacingBottom: 'lg',
    attentionLevel: 'secondary',
    surfaceMode: 'default',
    allowedComponents: ['Container', 'Grid', 'Text', 'Badge', 'Button', 'Divider'],
  },
  {
    id: 'faq',
    intent: 'A compact answer section for common objections or support questions.',
    allowedPageTypes: ['campaign-landing', 'product-detail', 'checkout', 'onboarding'],
    container: 'narrow',
    grid: 'oneColumn',
    spacingTop: 'lg',
    spacingBottom: 'lg',
    attentionLevel: 'supporting',
    surfaceMode: 'default',
    allowedComponents: ['Container', 'Text', 'Divider', 'Button', 'Badge'],
  },
  {
    id: DEFAULT_SECTION_PATTERN_ID,
    intent: 'A general content section with clear copy and one action.',
    allowedPageTypes: [
      'homepage',
      'commerce-homepage',
      'product-listing',
      'product-detail',
      'checkout',
      'campaign-landing',
      'dashboard',
      'settings',
      'onboarding',
    ],
    container: 'contained',
    grid: 'oneColumn',
    spacingTop: 'md',
    spacingBottom: 'md',
    attentionLevel: 'supporting',
    surfaceMode: 'default',
    allowedComponents: ['Container', 'Text', 'Button', 'Badge', 'Divider'],
  },
] as const;

export const PAGE_PATTERNS: readonly PagePattern[] = [
  {
    id: DEFAULT_PAGE_PATTERN_ID,
    pageType: 'homepage',
    density: 'comfortable',
    sectionPatternIds: ['hero-centered', 'feature-grid', 'trust-section'],
  },
  {
    id: 'commerce-homepage-standard',
    pageType: 'commerce-homepage',
    density: 'comfortable',
    sectionPatternIds: [
      'hero-split',
      'category-rail',
      'product-grid',
      'offer-banner',
      'trust-section',
    ],
  },
  {
    id: 'product-listing-standard',
    pageType: 'product-listing',
    density: 'compact',
    sectionPatternIds: ['category-rail', 'product-grid', 'offer-banner'],
  },
  {
    id: 'campaign-landing-premium',
    pageType: 'campaign-landing',
    density: 'editorial',
    sectionPatternIds: ['hero-centered', 'feature-grid', 'offer-banner', 'faq'],
  },
  {
    id: 'dashboard-standard',
    pageType: 'dashboard',
    density: 'compact',
    sectionPatternIds: ['dashboard-summary', 'feature-grid', 'category-rail'],
  },
  {
    id: 'onboarding-standard',
    pageType: 'onboarding',
    density: 'comfortable',
    sectionPatternIds: ['settings-group', 'feature-grid', 'faq'],
  },
] as const;

export function getSectionPattern(id: string): SectionPattern {
  return (
    SECTION_PATTERNS.find((pattern) => pattern.id === id) ??
    SECTION_PATTERNS[SECTION_PATTERNS.length - 1]
  );
}

export function getPagePattern(id: string): PagePattern {
  return PAGE_PATTERNS.find((pattern) => pattern.id === id) ?? PAGE_PATTERNS[0];
}

export function pagePatternForType(pageType: PageCompositionPageTypeT): PagePattern {
  return PAGE_PATTERNS.find((pattern) => pattern.pageType === pageType) ?? PAGE_PATTERNS[0];
}

export function inferPageTypeFromPrompt(
  prompt: string,
  artifactType: string
): PageCompositionPageTypeT {
  const normalized = `${prompt} ${artifactType}`.toLowerCase();
  if (
    normalized.includes('commerce') ||
    normalized.includes('grocery') ||
    normalized.includes('store')
  ) {
    return 'commerce-homepage';
  }
  if (
    normalized.includes('listing') ||
    normalized.includes('filters') ||
    normalized.includes('comparison')
  ) {
    return 'product-listing';
  }
  if (
    normalized.includes('campaign') ||
    normalized.includes('landing') ||
    normalized.includes('bundle')
  ) {
    return 'campaign-landing';
  }
  if (
    normalized.includes('dashboard') ||
    normalized.includes('usage') ||
    normalized.includes('bills')
  ) {
    return 'dashboard';
  }
  if (
    normalized.includes('onboarding') ||
    normalized.includes('activate') ||
    normalized.includes('step')
  ) {
    return 'onboarding';
  }
  if (normalized.includes('settings')) return 'settings';
  if (normalized.includes('checkout')) return 'checkout';
  if (normalized.includes('product detail')) return 'product-detail';
  return DEFAULT_PAGE_TYPE;
}

export function densityForPageType(pageType: PageCompositionPageTypeT): PageCompositionDensityT {
  if (pageType === 'dashboard' || pageType === 'product-listing') return 'compact';
  if (pageType === 'campaign-landing' || pageType === 'product-detail') return 'editorial';
  return DEFAULT_DENSITY;
}
