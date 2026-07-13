import { describe, expect, it } from 'vitest';
import {
  buildCarouselDefaultScrimProps,
  CAROUSEL_SLIDE_SCRIM_PROPS,
  carouselIndexToPage,
  carouselPageToIndex,
  normalizeCarouselButtonWidth,
  resolveCarouselControlsGate,
  resolveCarouselHeightCSSValue,
  resolveCarouselSlideScrimProps,
} from '../Carousel.shared';

describe('carousel.shared Figma helpers', () => {
  it('converts 1-based pages to 0-based indices', () => {
    expect(carouselPageToIndex(1, 5)).toBe(0);
    expect(carouselPageToIndex(3, 5)).toBe(2);
    expect(carouselPageToIndex(0, 5)).toBe(0);
    expect(carouselPageToIndex(99, 5)).toBe(4);
  });

  it('converts 0-based indices to 1-based pages', () => {
    expect(carouselIndexToPage(0, 5)).toBe(1);
    expect(carouselIndexToPage(2, 5)).toBe(3);
  });

  it('resolves scrim props from boolean or object', () => {
    expect(resolveCarouselSlideScrimProps(undefined)).toBeNull();
    expect(resolveCarouselSlideScrimProps(false)).toBeNull();
    expect(resolveCarouselSlideScrimProps(true)).toEqual(CAROUSEL_SLIDE_SCRIM_PROPS);
    expect(resolveCarouselSlideScrimProps(true, 'middleBottom')).toEqual(
      buildCarouselDefaultScrimProps('middleBottom'),
    );
    expect(
      resolveCarouselSlideScrimProps({ variant: 'overlay', attention: 'low' }),
    ).toEqual({ variant: 'overlay', attention: 'low' });
  });

  it('normalizes buttonWidth fill to wide', () => {
    expect(normalizeCarouselButtonWidth('fill')).toBe('wide');
    expect(normalizeCarouselButtonWidth('hug')).toBe('hug');
  });

  it('resolves numeric height to px CSS', () => {
    expect(resolveCarouselHeightCSSValue(480)).toBe('480px');
    expect(resolveCarouselHeightCSSValue(100)).toBe('300px');
  });

  it('gates controlsType behind controls=true', () => {
    expect(resolveCarouselControlsGate(false, 'pagination')).toBeNull();
    expect(resolveCarouselControlsGate(true, 'pagination')).toBe('pagination');
    expect(resolveCarouselControlsGate(undefined, 'pagination')).toBeNull();
  });
});
