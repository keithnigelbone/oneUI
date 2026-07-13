/**
 * Carousel.test.tsx
 * Unit tests for the Carousel compound API.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeAll } from 'vitest';

// Base UI's ESM Button pulls a duplicate React instance in vitest, which
// breaks IconButton (used by Prev/Next/Play). Mock to a plain button so
// carousel logic — not IconButton internals — is under test.
vi.mock('../../IconButton/IconButton', () => {
  const React = require('react');
  return {
    IconButton: React.forwardRef(function MockIconButton(
      {
        'aria-label': ariaLabel,
        onPress,
        disabled,
        'aria-disabled': ariaDisabled,
        'aria-pressed': ariaPressed,
      }: {
        'aria-label'?: string;
        onPress?: () => void;
        disabled?: boolean;
        'aria-disabled'?: boolean;
        'aria-pressed'?: boolean;
      },
      ref: React.Ref<HTMLButtonElement>,
    ) {
      return (
        <button
          ref={ref}
          type="button"
          aria-label={ariaLabel}
          disabled={disabled}
          aria-disabled={ariaDisabled}
          aria-pressed={ariaPressed}
          onClick={() => onPress?.()}
        />
      );
    }),
  };
});

import { Carousel } from '../Carousel';
import { CarouselDesktop, CarouselTablet, CarouselMobile } from '../variants/CarouselPlatformWrappers';

const RAIL_FIXTURE = [
  { src: '/carousel-demo/slide-1.jpg', alt: 'Slide one' },
  { src: '/carousel-demo/slide-2.jpg', alt: 'Slide two' },
  { src: '/carousel-demo/slide-3.jpg', alt: 'Slide three' },
];

// jsdom ships without matchMedia / IntersectionObserver / ResizeObserver;
// Embla touches all three during init.
beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });
  }
  if (!('IntersectionObserver' in window)) {
    class IO {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
      root = null;
      rootMargin = '';
      thresholds: number[] = [];
    }
    (window as unknown as { IntersectionObserver: typeof IO }).IntersectionObserver = IO;
    (globalThis as unknown as { IntersectionObserver: typeof IO }).IntersectionObserver = IO;
  }
  if (!('ResizeObserver' in window)) {
    class RO {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    (window as unknown as { ResizeObserver: typeof RO }).ResizeObserver = RO;
    (globalThis as unknown as { ResizeObserver: typeof RO }).ResizeObserver = RO;
  }
});

function BasicCarousel({ autoPlay }: { autoPlay?: number | false } = {}) {
  return (
    <Carousel.Root aria-label="Test carousel" autoPlay={autoPlay}>
      <Carousel.Viewport>
        <Carousel.Track>
          <Carousel.Slide aspectRatio="16:9">
            <Carousel.Slide.Content>
              <h3>Slide one</h3>
            </Carousel.Slide.Content>
          </Carousel.Slide>
          <Carousel.Slide aspectRatio="16:9">
            <Carousel.Slide.Content>
              <h3>Slide two</h3>
            </Carousel.Slide.Content>
          </Carousel.Slide>
          <Carousel.Slide aspectRatio="16:9">
            <Carousel.Slide.Content>
              <h3>Slide three</h3>
            </Carousel.Slide.Content>
          </Carousel.Slide>
        </Carousel.Track>
      </Carousel.Viewport>
      <Carousel.Controls placement="below">
        <Carousel.PrevButton />
        <Carousel.IndicatorList />
        <Carousel.NextButton />
        {autoPlay !== undefined && <Carousel.PlayButton />}
      </Carousel.Controls>
    </Carousel.Root>
  );
}

describe('Carousel', () => {
  describe('Rendering & ARIA', () => {
    it('renders the region with the required aria-label', () => {
      render(<BasicCarousel />);
      const region = screen.getByRole('region', { name: 'Test carousel' });
      expect(region).toBeInTheDocument();
      expect(region).toHaveAttribute('aria-roledescription', 'carousel');
    });

    it('renders each slide with role="group" + aria-roledescription="slide"', () => {
      render(<BasicCarousel />);
      const slides = screen.getAllByRole('group').filter(
        (el) => el.getAttribute('aria-roledescription') === 'slide',
      );
      expect(slides.length).toBe(3);
    });

    it('throws if a part is rendered without Carousel.Root', () => {
      // Suppress React error boundary noise.
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      try {
        expect(() => render(<Carousel.Track>oops</Carousel.Track>)).toThrow(
          /Carousel\.Root/,
        );
      } finally {
        spy.mockRestore();
      }
    });

    it('PrevButton and NextButton expose the expected aria-labels', () => {
      render(<BasicCarousel />);
      expect(screen.getByRole('button', { name: 'Previous slide' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next slide' })).toBeInTheDocument();
    });
  });

  describe('IndicatorList', () => {
    it('delegates to PaginationDots and marks the first as selected', () => {
      render(<BasicCarousel />);
      const dots = screen.getAllByRole('tab', { name: /Page \d+ of/ });
      expect(dots).toHaveLength(3);
      expect(dots[0]).toHaveAttribute('aria-selected', 'true');
    });

    it('clicking an indicator dispatches without throwing', async () => {
      const user = userEvent.setup();
      render(<BasicCarousel />);
      const dots = screen.getAllByRole('tab', { name: /Page \d+ of/ });
      // jsdom never lays out the track, so Embla's selectedScrollSnap stays
      // at 0 even after scrollTo. Real selection behaviour is covered by
      // Storybook integration.
      await expect(user.click(dots[1])).resolves.toBeUndefined();
      expect(dots[1]).toBeInTheDocument();
    });
  });

  describe('Autoplay', () => {
    it('renders the PlayButton with a "Pause" label when autoplay is on', () => {
      render(<BasicCarousel autoPlay={3000} />);
      expect(
        screen.getByRole('button', { name: 'Pause autoplay' }),
      ).toBeInTheDocument();
    });
  });

  describe('Slide composition', () => {
    it('renders a corner slot with placement attribute', () => {
      render(
        <Carousel.Root aria-label="Composition">
          <Carousel.Viewport>
            <Carousel.Track>
              <Carousel.Slide aspectRatio="1:1" badgesEnd>
                <Carousel.Slide.Corner placement="end">
                  <span data-testid="corner-end">corner</span>
                </Carousel.Slide.Corner>
              </Carousel.Slide>
            </Carousel.Track>
          </Carousel.Viewport>
        </Carousel.Root>,
      );
      const corner = screen.getByTestId('corner-end').parentElement;
      expect(corner).toHaveAttribute('data-placement', 'end');
    });

    it('Slide.Content reflects alignment + width data-attrs', () => {
      render(
        <Carousel.Root aria-label="Content">
          <Carousel.Viewport>
            <Carousel.Track>
              <Carousel.Slide aspectRatio="16:9">
                <Carousel.Slide.Content content alignment="middleBottom" width="l">
                  <span data-testid="ct">content</span>
                </Carousel.Slide.Content>
              </Carousel.Slide>
            </Carousel.Track>
          </Carousel.Viewport>
        </Carousel.Root>,
      );
      const wrapper = screen.getByTestId('ct').closest('[data-align]');
      expect(wrapper).toHaveAttribute('data-align', 'middleBottom');
      expect(wrapper).toHaveAttribute('data-width', 'l');
    });

    it('Slide.Content text wrapper picks up the slide surface for token remapping', () => {
      render(
        <Carousel.Root aria-label="Surface">
          <Carousel.Viewport>
            <Carousel.Track>
              <Carousel.Slide aspectRatio="1:1" surface="subtle">
                <Carousel.Slide.Content content>
                  <span data-testid="s">s</span>
                </Carousel.Slide.Content>
              </Carousel.Slide>
            </Carousel.Track>
          </Carousel.Viewport>
        </Carousel.Root>,
      );
      // Surface lives on the inner text wrapper now (not the slide root) so
      // Slide.ButtonGroup can escape the bold cascade.
      const textWrap = screen.getByTestId('s').closest('[data-surface]');
      expect(textWrap).toHaveAttribute('data-surface', 'subtle');
    });

    it('supports middleTop content alignment', () => {
      render(
        <Carousel.Root aria-label="Middle top">
          <Carousel.Viewport>
            <Carousel.Track>
              <Carousel.Slide aspectRatio="16:9">
                <Carousel.Slide.Content content alignment="middleTop" width="m">
                  <span data-testid="mt">top</span>
                </Carousel.Slide.Content>
              </Carousel.Slide>
            </Carousel.Track>
          </Carousel.Viewport>
        </Carousel.Root>,
      );
      expect(screen.getByTestId('mt').closest('[data-align]')).toHaveAttribute(
        'data-align',
        'middleTop',
      );
    });

    it('renders expanded aspect ratio data attributes', () => {
      render(
        <Carousel.Root aria-label="Ratios">
          <Carousel.Viewport>
            <Carousel.Track>
              <Carousel.Slide aspectRatio="21:9">
                <Carousel.Slide.Content content>
                  <span>wide</span>
                </Carousel.Slide.Content>
              </Carousel.Slide>
            </Carousel.Track>
          </Carousel.Viewport>
        </Carousel.Root>,
      );
      const slide = screen.getByRole('group', { name: /1 of 1/ });
      expect(slide).toHaveAttribute('data-aspect', '21:9');
    });
  });

  describe('Pagination alias', () => {
    it('Carousel.Pagination renders pagination dots', () => {
      render(
        <Carousel.Root aria-label="Pagination alias">
          <Carousel.Viewport>
            <Carousel.Track>
              <Carousel.Slide aspectRatio="16:9">
                <Carousel.Slide.Content content>
                  <h3>One</h3>
                </Carousel.Slide.Content>
              </Carousel.Slide>
              <Carousel.Slide aspectRatio="16:9">
                <Carousel.Slide.Content content>
                  <h3>Two</h3>
                </Carousel.Slide.Content>
              </Carousel.Slide>
            </Carousel.Track>
          </Carousel.Viewport>
          <Carousel.Controls placement="below">
            <Carousel.Pagination />
          </Carousel.Controls>
        </Carousel.Root>,
      );
      expect(screen.getAllByRole('tab', { name: /Page \d+ of/ })).toHaveLength(2);
    });
  });

  describe('SelectionRail', () => {
    it('renders thumbnail buttons wired to carousel context', async () => {
      const user = userEvent.setup();
      render(
        <Carousel.Root aria-label="Rail">
          <Carousel.Viewport>
            <Carousel.Track>
              {RAIL_FIXTURE.map((slide) => (
                <Carousel.Slide key={slide.src} aspectRatio="16:9">
                  <Carousel.Slide.Image src={slide.src} alt={slide.alt} />
                </Carousel.Slide>
              ))}
            </Carousel.Track>
          </Carousel.Viewport>
          <Carousel.Controls placement="below" layout="split">
            <Carousel.SelectionRail items={RAIL_FIXTURE} />
          </Carousel.Controls>
        </Carousel.Root>,
      );
      const thumbs = screen.getAllByRole('button', { name: /Slide (one|two|three)/ });
      expect(thumbs).toHaveLength(3);
      await expect(user.click(thumbs[1])).resolves.toBeUndefined();
    });
  });

  describe('Controlled activePage', () => {
    it('calls onActivePageChange when an indicator is clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Carousel.Root aria-label="Controlled" onActivePageChange={onChange}>
          <Carousel.Viewport>
            <Carousel.Track>
              {[0, 1, 2].map((i) => (
                <Carousel.Slide key={i} aspectRatio="16:9">
                  <Carousel.Slide.Content content>
                    <h3>Slide {i + 1}</h3>
                  </Carousel.Slide.Content>
                </Carousel.Slide>
              ))}
            </Carousel.Track>
          </Carousel.Viewport>
          <Carousel.Controls placement="below">
            <Carousel.Pagination />
          </Carousel.Controls>
        </Carousel.Root>,
      );
      const dots = screen.getAllByRole('tab', { name: /Page \d+ of/ });
      await user.click(dots[2]);
      expect(onChange).toHaveBeenCalledWith(3);
    });
  });

  describe('Platform wrappers', () => {
    it('Carousel.Desktop renders region with controls when controls=true', () => {
      render(
        <CarouselDesktop
          aria-label="Desktop preset"
          controls
          items={RAIL_FIXTURE.slice(0, 2)}
          renderItem={(slide) => (
            <Carousel.Slide>
              <Carousel.Slide.Image src={slide.src} alt={slide.alt} />
            </Carousel.Slide>
          )}
        />,
      );
      expect(screen.getByRole('region', { name: 'Desktop preset' })).toBeInTheDocument();
      expect(screen.getAllByRole('tab', { name: /Page \d+ of/ })).toHaveLength(2);
    });

    it('Carousel.Desktop hides controls by default (controls=false)', () => {
      render(
        <CarouselDesktop
          aria-label="Desktop no controls"
          items={RAIL_FIXTURE.slice(0, 2)}
          renderItem={(slide) => (
            <Carousel.Slide>
              <Carousel.Slide.Image src={slide.src} alt={slide.alt} />
            </Carousel.Slide>
          )}
        />,
      );
      expect(screen.getByRole('region', { name: 'Desktop no controls' })).toBeInTheDocument();
      expect(screen.queryByRole('tab')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Next slide' })).not.toBeInTheDocument();
    });

    it('Carousel.Tablet renders region', () => {
      render(
        <CarouselTablet
          aria-label="Tablet preset"
          items={RAIL_FIXTURE.slice(0, 2)}
          renderItem={(slide) => (
            <Carousel.Slide>
              <Carousel.Slide.Image src={slide.src} alt={slide.alt} />
            </Carousel.Slide>
          )}
        />,
      );
      expect(screen.getByRole('region', { name: 'Tablet preset' })).toBeInTheDocument();
    });

    it('Carousel.Mobile renders region', () => {
      render(
        <CarouselMobile
          aria-label="Mobile preset"
          items={RAIL_FIXTURE.slice(0, 2)}
          renderItem={(slide) => (
            <Carousel.Slide>
              <Carousel.Slide.Image src={slide.src} alt={slide.alt} />
            </Carousel.Slide>
          )}
        />,
      );
      expect(screen.getByRole('region', { name: 'Mobile preset' })).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('next navigation dispatches without throwing', async () => {
      const user = userEvent.setup();
      render(<BasicCarousel />);
      await user.click(screen.getByRole('button', { name: 'Next slide' }));
    });

    it('previous navigation dispatches without throwing', async () => {
      const user = userEvent.setup();
      render(
        <Carousel.Root aria-label="Nav test" defaultActivePage={3}>
          <Carousel.Viewport>
            <Carousel.Track>
              {[0, 1, 2].map((i) => (
                <Carousel.Slide key={i} aspectRatio="16:9">
                  <Carousel.Slide.Content content>
                    <h3>Slide {i + 1}</h3>
                  </Carousel.Slide.Content>
                </Carousel.Slide>
              ))}
            </Carousel.Track>
          </Carousel.Viewport>
          <Carousel.Controls placement="below">
            <Carousel.PrevButton />
            <Carousel.Pagination />
            <Carousel.NextButton />
          </Carousel.Controls>
        </Carousel.Root>,
      );
      await user.click(screen.getByRole('button', { name: 'Previous slide' }));
    });

    it('disables previous at start when loop is false', () => {
      render(
        <Carousel.Root aria-label="Start boundary" loop={false} defaultActivePage={1}>
          <Carousel.Viewport>
            <Carousel.Track>
              {[0, 1].map((i) => (
                <Carousel.Slide key={i} aspectRatio="16:9">
                  <Carousel.Slide.Content content>
                    <h3>Slide {i + 1}</h3>
                  </Carousel.Slide.Content>
                </Carousel.Slide>
              ))}
            </Carousel.Track>
          </Carousel.Viewport>
          <Carousel.Controls placement="below">
            <Carousel.PrevButton />
            <Carousel.NextButton />
          </Carousel.Controls>
        </Carousel.Root>,
      );
      expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
    });

    it('disables next at end when loop is false', () => {
      render(
        <Carousel.Root aria-label="End boundary" loop={false} defaultActivePage={2}>
          <Carousel.Viewport>
            <Carousel.Track>
              {[0, 1].map((i) => (
                <Carousel.Slide key={i} aspectRatio="16:9">
                  <Carousel.Slide.Content content>
                    <h3>Slide {i + 1}</h3>
                  </Carousel.Slide.Content>
                </Carousel.Slide>
              ))}
            </Carousel.Track>
          </Carousel.Viewport>
          <Carousel.Controls placement="below">
            <Carousel.PrevButton />
            <Carousel.NextButton />
          </Carousel.Controls>
        </Carousel.Root>,
      );
      expect(screen.getByRole('button', { name: 'Next slide' })).toBeDisabled();
    });
  });

  describe('Edge cases', () => {
    it('renders without crashing with zero slides', () => {
      render(
        <Carousel.Root aria-label="Empty">
          <Carousel.Viewport>
            <Carousel.Track />
          </Carousel.Viewport>
        </Carousel.Root>,
      );
      expect(screen.getByRole('region', { name: 'Empty' })).toBeInTheDocument();
    });

    it('renders without crashing with one slide', () => {
      render(
        <Carousel.Root aria-label="Single">
          <Carousel.Viewport>
            <Carousel.Track>
              <Carousel.Slide aspectRatio="16:9">
                <Carousel.Slide.Content content>
                  <h3>Only</h3>
                </Carousel.Slide.Content>
              </Carousel.Slide>
            </Carousel.Track>
          </Carousel.Viewport>
        </Carousel.Root>,
      );
      expect(screen.getAllByRole('group')).toHaveLength(1);
    });

    it('controls hidden when controlsType is none on Desktop wrapper', () => {
      render(
        <CarouselDesktop
          aria-label="No controls"
          controls
          controlsType="none"
          items={RAIL_FIXTURE.slice(0, 2)}
          renderItem={(slide) => (
            <Carousel.Slide>
              <Carousel.Slide.Image src={slide.src} alt={slide.alt} />
            </Carousel.Slide>
          )}
        />,
      );
      expect(screen.queryByRole('button', { name: 'Next slide' })).not.toBeInTheDocument();
      expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    });
    it('controls hidden when controls is false on Desktop wrapper', () => {
      render(
        <CarouselDesktop
          aria-label="No controls bool"
          controls={false}
          items={RAIL_FIXTURE.slice(0, 2)}
          renderItem={(slide) => (
            <Carousel.Slide>
              <Carousel.Slide.Image src={slide.src} alt={slide.alt} />
            </Carousel.Slide>
          )}
        />,
      );
      expect(screen.queryByRole('button', { name: 'Next slide' })).not.toBeInTheDocument();
      expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    });
  });

  describe('Height mode', () => {
    it('applies followsAspectRatio=false for custom height mode', () => {
      render(
        <Carousel.Root aria-label="Custom height" followsAspectRatio={false} height={480}>
          <Carousel.Viewport>
            <Carousel.Track>
              <Carousel.Slide>
                <Carousel.Slide.Content content>
                  <h3>Tall</h3>
                </Carousel.Slide.Content>
              </Carousel.Slide>
            </Carousel.Track>
          </Carousel.Viewport>
        </Carousel.Root>,
      );
      expect(screen.getByRole('region')).toHaveAttribute('data-height-mode', 'custom');
    });

    it('accepts deprecated followAspectRatio alias', () => {
      render(
        <Carousel.Root aria-label="Legacy height" followAspectRatio={false} height={480}>
          <Carousel.Viewport>
            <Carousel.Track>
              <Carousel.Slide>
                <Carousel.Slide.Content content>
                  <h3>Tall</h3>
                </Carousel.Slide.Content>
              </Carousel.Slide>
            </Carousel.Track>
          </Carousel.Viewport>
        </Carousel.Root>,
      );
      expect(screen.getByRole('region')).toHaveAttribute('data-height-mode', 'custom');
    });
  });

  describe('PlayButton visibility', () => {
    it('does not render PlayButton when autoplay is disabled', () => {
      render(<BasicCarousel />);
      expect(screen.queryByRole('button', { name: /autoplay/i })).not.toBeInTheDocument();
    });
  });
});
