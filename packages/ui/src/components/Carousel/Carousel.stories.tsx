import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Carousel } from './Carousel';
import {
  CarouselAdoptionMatrix,
  DemoCarousel,
  DEMO_SLIDES,
  createCarouselPresetArgs,
  renderPresetCarouselStory,
  getCarouselStoryOptions,
  platformSlideRenderer,
} from './stories/Carousel.stories.shared';

const meta = {
  title: 'Components/Navigation/Carousel',
  component: Carousel.Desktop,
  tags: ['autodocs'],
  ...getCarouselStoryOptions('Root'),
} satisfies Meta<typeof Carousel.Desktop>;

export default meta;
type Story = StoryObj<typeof Carousel.Desktop>;

/** Interactive docs canvas — Controls panel drives this story. */
export const Playground: Story = {
  name: 'Playground',
  args: createCarouselPresetArgs('desktop'),
  render: renderPresetCarouselStory('desktop'),
};

export const Overview: Story = {
  name: 'Overview',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Canonical compound layout with split below-controls — pagination at the start, prev/next at the end.',
      },
    },
  },
  render: () => <DemoCarousel ariaLabel="Overview carousel" startAt={2} controls="below" />,
};

export const PlatformPresets: Story = {
  name: 'Platform Presets',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Side-by-side comparison of Desktop, Tablet, and Mobile preset wrappers.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-8)' }}>
      <Carousel.Desktop
        aria-label="Desktop preset"
        controls
        items={DEMO_SLIDES.slice(0, 3)}
        renderItem={platformSlideRenderer}
      />
      <Carousel.Tablet
        aria-label="Tablet preset"
        controls
        items={DEMO_SLIDES.slice(0, 3)}
        renderItem={platformSlideRenderer}
      />
      <Carousel.Mobile
        aria-label="Mobile preset"
        controls
        items={DEMO_SLIDES.slice(0, 3)}
        renderItem={platformSlideRenderer}
      />
    </div>
  ),
};

export const AdoptionMatrix: Story = {
  name: 'Adoption Matrix',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Visual matrix mapping Figma control and aspect combinations.',
      },
    },
  },
  render: () => <CarouselAdoptionMatrix />,
};
