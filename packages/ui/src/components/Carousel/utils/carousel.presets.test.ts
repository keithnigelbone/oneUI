import { describe, expect, it, vi } from 'vitest';
import {
  CAROUSEL_DESKTOP_PRESET,
  CAROUSEL_MOBILE_PRESET,
  resolveCarouselControlsPlacement,
  resolveCarouselControlsType,
  resolveCarouselWrapperControlsType,
  usesCarouselSelectionRail,
} from '../carousel.presets';

describe('carousel.presets', () => {
  it('maps controlsType to placement', () => {
    expect(resolveCarouselControlsPlacement('pagination')).toBe('below');
    expect(resolveCarouselControlsPlacement('paginationOnMedia')).toBe('onMedia');
    expect(resolveCarouselControlsPlacement('selectionRail')).toBe('below');
    expect(resolveCarouselControlsPlacement('selectionRailOnMedia')).toBe('onMedia');
    expect(resolveCarouselControlsPlacement('none')).toBeNull();
  });

  it('falls back to platform default controlsType', () => {
    expect(resolveCarouselControlsType(undefined, CAROUSEL_DESKTOP_PRESET)).toBe('pagination');
    expect(resolveCarouselControlsType('selectionRail', CAROUSEL_DESKTOP_PRESET)).toBe(
      'selectionRail',
    );
  });

  it('detects selection rail controls', () => {
    expect(usesCarouselSelectionRail('selectionRail')).toBe(true);
    expect(usesCarouselSelectionRail('selectionRailOnMedia')).toBe(true);
    expect(usesCarouselSelectionRail('pagination')).toBe(false);
  });

  it('gates controlsType behind controls=true', () => {
    expect(
      resolveCarouselWrapperControlsType(false, 'pagination', false, CAROUSEL_DESKTOP_PRESET),
    ).toBeNull();
    expect(
      resolveCarouselWrapperControlsType(undefined, 'pagination', false, CAROUSEL_DESKTOP_PRESET),
    ).toBeNull();
    expect(
      resolveCarouselWrapperControlsType(true, 'pagination', false, CAROUSEL_DESKTOP_PRESET),
    ).toBe('pagination');
  });

  it('falls back selectionRailOnMedia when fullWidth is false', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(
      resolveCarouselWrapperControlsType(
        true,
        'selectionRailOnMedia',
        false,
        CAROUSEL_DESKTOP_PRESET,
      ),
    ).toBe('selectionRail');
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('selectionRailOnMedia'),
    );
    warn.mockRestore();
  });

  it('allows selectionRailOnMedia when fullWidth is true', () => {
    expect(
      resolveCarouselWrapperControlsType(
        true,
        'selectionRailOnMedia',
        true,
        CAROUSEL_MOBILE_PRESET,
      ),
    ).toBe('selectionRailOnMedia');
  });
});
