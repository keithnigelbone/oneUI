import { describe, expect, it } from 'vitest';
import {
  PageCompositionSchema,
  getPagePattern,
  getSectionPattern,
  inferPageTypeFromPrompt,
  pagePatternForType,
} from '../index';

describe('composition contract', () => {
  it('parses a page composition with section recipes', () => {
    const pagePattern = pagePatternForType('commerce-homepage');
    const firstSection = getSectionPattern(pagePattern.sectionPatternIds[0]);

    const parsed = PageCompositionSchema.safeParse({
      brandId: 'brand-jio',
      pageType: 'commerce-homepage',
      pagePatternId: pagePattern.id,
      density: pagePattern.density,
      sections: [
        {
          sectionId: 'hero',
          patternId: firstSection.id,
          attentionLevel: firstSection.attentionLevel,
          container: firstSection.container,
          grid: firstSection.grid,
          spacingTop: firstSection.spacingTop,
          spacingBottom: firstSection.spacingBottom,
          surfaceMode: firstSection.surfaceMode,
          allowedComponents: firstSection.allowedComponents,
        },
      ],
    });

    expect(parsed.success).toBe(true);
  });

  it('selects stable page and section pattern fallbacks', () => {
    expect(inferPageTypeFromPrompt('Build a grocery store homepage', 'web-ui')).toBe(
      'commerce-homepage'
    );
    expect(inferPageTypeFromPrompt('Usage dashboard for account health', 'web-ui')).toBe(
      'dashboard'
    );
    expect(getPagePattern('missing').id).toBe('homepage-basic');
    expect(getSectionPattern('missing').id).toBe('content-stack');
  });
});
