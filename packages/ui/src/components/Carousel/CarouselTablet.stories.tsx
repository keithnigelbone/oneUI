import type { Meta, StoryObj } from '@storybook/react-vite';
import { Carousel } from './Carousel';
import {
  CAROUSEL_DEMO_STORY_OVERRIDES,
  createCarouselPresetArgs,
  PresetAspectRatiosGrid,
  renderPresetCarouselStory,
  getCarouselStoryOptions,
  withCarouselDocsLayout,
  withCarouselStoryViewport,
} from './stories/Carousel.stories.shared';

const tabletStoryOptions = getCarouselStoryOptions('Tablet');

const meta = {
  title: 'Components/Navigation/Carousel/Tablet',
  component: Carousel.Tablet,
  tags: ['autodocs'],
  ...tabletStoryOptions,
  decorators: [withCarouselDocsLayout, withCarouselStoryViewport('tablet')],
  parameters: {
    ...tabletStoryOptions.parameters,
    layout: 'centered',
    viewport: { defaultViewport: 'tablet' },
  },
} satisfies Meta<typeof Carousel.Tablet>;

export default meta;
type Story = StoryObj<typeof Carousel.Tablet>;

export const Default: Story = {
  args: createCarouselPresetArgs('tablet'),
  render: renderPresetCarouselStory('tablet'),
};

export const Pagination: Story = {
  name: 'Pagination',
  args: {
    ...createCarouselPresetArgs('tablet'),
    ...CAROUSEL_DEMO_STORY_OVERRIDES,
    controlsType: 'pagination',
  },
  render: renderPresetCarouselStory('tablet'),
};

export const PaginationOnMedia: Story = {
  name: 'Pagination On Media',
  args: {
    ...createCarouselPresetArgs('tablet'),
    ...CAROUSEL_DEMO_STORY_OVERRIDES,
    controlsType: 'paginationOnMedia',
  },
  render: renderPresetCarouselStory('tablet'),
};

export const SelectionRail: Story = {
  name: 'Selection Rail',
  args: {
    ...createCarouselPresetArgs('tablet'),
    ...CAROUSEL_DEMO_STORY_OVERRIDES,
    controlsType: 'selectionRail',
  },
  render: renderPresetCarouselStory('tablet'),
};

export const SelectionRailOnMedia: Story = {
  name: 'Selection Rail On Media',
  args: {
    ...createCarouselPresetArgs('tablet'),
    ...CAROUSEL_DEMO_STORY_OVERRIDES,
    controlsType: 'selectionRailOnMedia',
    fullWidth: true,
  },
  render: renderPresetCarouselStory('tablet'),
};

export const FullWidth: Story = {
  name: 'Full Width',
  args: {
    ...createCarouselPresetArgs('tablet'),
    ...CAROUSEL_DEMO_STORY_OVERRIDES,
    fullWidth: true,
    controlsType: 'selectionRailOnMedia',
  },
  render: renderPresetCarouselStory('tablet'),
};

export const AspectRatios: Story = {
  name: 'Aspect Ratios',
  parameters: { controls: { disable: true } },
  render: () => <PresetAspectRatiosGrid preset="tablet" />,
};
