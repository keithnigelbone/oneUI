/**
 * Carousel.render.test.tsx
 *
 * Render-layer coverage for the native compound Carousel. The pure engine /
 * layout / a11y helpers are unit-tested in `Carousel.test.ts`; this file proves
 * the compound wiring: the SR-only region name, the below-media controls
 * (indicator + nav + play buttons), nav-availability gating, and the play/pause
 * toggle — everything that mounts without a measured viewport.
 *
 * Environment note: the mocked `react-native` never fires the viewport
 * `onLayout`, so `slideWidth` stays 0 and `Carousel.Rail` renders its
 * pre-measurement placeholder (slides do not mount). Assertions therefore target
 * the root + below-chrome, which mount regardless. Slide-body layout is covered
 * by the pure-logic suite.
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Carousel } from './Carousel.native';
import { OneUINativeThemeProvider, defaultNativeTheme } from '../../theme';

const wrap = (ui: React.ReactElement): React.ReactElement => (
  <OneUINativeThemeProvider theme={defaultNativeTheme()}>{ui}</OneUINativeThemeProvider>
);

function Slides({ count }: { count: number }): React.ReactElement {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Carousel.Item key={i} surface="bold">
          <Carousel.Item.Image src="https://example.test/a.jpg" alt={`Slide ${i + 1}`} />
          <Carousel.Item.Content alignment="startBottom" width="m">
            <Carousel.Item.Headline>Headline {i + 1}</Carousel.Item.Headline>
          </Carousel.Item.Content>
        </Carousel.Item>
      ))}
    </>
  );
}

function renderCarousel(
  props: Partial<React.ComponentProps<typeof Carousel>> & { count?: number } = {},
): void {
  const { count = 3, children, ...rootProps } = props;
  render(
    wrap(
      <Carousel aria-label="Featured carousel" testID="carousel" {...rootProps}>
        <Carousel.Rail testID="carousel-rail">
          <Slides count={count} />
        </Carousel.Rail>
        {children ?? (
          <Carousel.Controls placement="below" layout="center">
            <Carousel.IndicatorList testID="carousel-indicator" />
            <Carousel.PrevButton />
            <Carousel.NextButton />
          </Carousel.Controls>
        )}
      </Carousel>,
    ),
  );
}

describe('Carousel (native) — render', () => {
  it('mounts the compound tree without crashing', () => {
    renderCarousel();
    expect(screen.getByTestId('carousel')).toBeTruthy();
    expect(screen.getByTestId('carousel-rail')).toBeTruthy();
  });

  it('announces the region name on an SR-only node from aria-label', () => {
    renderCarousel();
    const region = screen.getByLabelText('Featured carousel');
    expect(region.props.accessibilityRole).toBe('header');
  });

  it('forwards accessibilityHint onto the region-name node', () => {
    renderCarousel({ accessibilityHint: 'Swipe to browse offers' });
    expect(screen.getByLabelText('Featured carousel').props.accessibilityHint).toBe(
      'Swipe to browse offers',
    );
  });

  it('excludes the root container from the a11y tree so children stay reachable', () => {
    renderCarousel();
    const root = screen.getByTestId('carousel');
    expect(root.props.accessible).toBe(false);
    expect(root.props.importantForAccessibility).toBe('no');
  });

  it('renders the below-media indicator once the rail reports its slide count', () => {
    renderCarousel({ count: 4 });
    expect(screen.getByTestId('carousel-indicator')).toBeTruthy();
  });

  it('renders default-labelled prev / next nav buttons', () => {
    renderCarousel();
    expect(screen.getByLabelText('Previous slide')).toBeTruthy();
    expect(screen.getByLabelText('Next slide')).toBeTruthy();
  });

  it('disables prev at the first slide when not looping', () => {
    // `canScrollPrev` is `loop || selectedIndex > 0`, so it is deterministically
    // false at the first slide regardless of viewport measurement. (`canScrollNext`
    // depends on the measured slide count, which the RN mock cannot supply — the
    // loop case below covers next-enablement deterministically.)
    renderCarousel();
    expect(screen.getByLabelText('Previous slide').props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });

  it('keeps both nav directions enabled when looping', () => {
    renderCarousel({ loop: true });
    expect(screen.getByLabelText('Previous slide').props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: false }),
    );
    expect(screen.getByLabelText('Next slide').props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: false }),
    );
  });

  it('forwards custom nav-button aria-labels', () => {
    renderCarousel({
      children: (
        <Carousel.Controls placement="below" layout="split">
          <Carousel.PrevButton aria-label="Go back" />
          <Carousel.NextButton aria-label="Go forward" />
        </Carousel.Controls>
      ),
    });
    expect(screen.getByLabelText('Go back')).toBeTruthy();
    expect(screen.getByLabelText('Go forward')).toBeTruthy();
  });

  it('does not render the play button without autoPlay', () => {
    renderCarousel();
    expect(screen.queryByLabelText('Start autoplay')).toBeNull();
    expect(screen.queryByLabelText('Pause autoplay')).toBeNull();
  });

  it('renders a play button in the playing state when autoPlay is set, and pauses on press', () => {
    renderCarousel({
      autoPlay: 4000,
      children: (
        <Carousel.Controls placement="below" layout="center">
          <Carousel.PlayButton />
        </Carousel.Controls>
      ),
    });
    // autoPlay starts playing → the control offers to pause.
    const playControl = screen.getByLabelText('Pause autoplay');
    expect(playControl).toBeTruthy();
    fireEvent.press(playControl);
    // After pausing, the control flips to offering to start again.
    expect(screen.getByLabelText('Start autoplay')).toBeTruthy();
  });

  it('renders on-media controls without crashing', () => {
    renderCarousel({
      children: (
        <Carousel.Controls placement="onMedia" layout="center" paginationAlign="middle">
          <Carousel.IndicatorList testID="carousel-indicator" />
        </Carousel.Controls>
      ),
    });
    expect(screen.getByTestId('carousel-indicator')).toBeTruthy();
  });
});
