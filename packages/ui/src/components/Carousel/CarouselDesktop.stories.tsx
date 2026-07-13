import type { Meta, StoryObj } from '@storybook/react-vite';
import { Carousel } from './Carousel';
import {
  CAROUSEL_DEMO_STORY_OVERRIDES,
  createCarouselPresetArgs,
  PresetAspectRatiosGrid,
  renderPresetCarouselStory,
  getCarouselStoryOptions,
} from './stories/Carousel.stories.shared';

const meta = {
  title: 'Components/Navigation/Carousel/Desktop',
  component: Carousel.Desktop,
  tags: ['autodocs'],
  ...getCarouselStoryOptions('Desktop'),
} satisfies Meta<typeof Carousel.Desktop>;

export default meta;
type Story = StoryObj<typeof Carousel.Desktop>;

export const Default: Story = {
  args: createCarouselPresetArgs('desktop'),
  render: renderPresetCarouselStory('desktop'),
};

export const Pagination: Story = {
  name: 'Pagination',
  args: {
    ...createCarouselPresetArgs('desktop'),
    ...CAROUSEL_DEMO_STORY_OVERRIDES,
    controlsType: 'pagination',
  },
  render: renderPresetCarouselStory('desktop'),
};

export const PaginationOnMedia: Story = {
  name: 'Pagination On Media',
  args: {
    ...createCarouselPresetArgs('desktop'),
    ...CAROUSEL_DEMO_STORY_OVERRIDES,
    controlsType: 'paginationOnMedia',
  },
  render: renderPresetCarouselStory('desktop'),
};

export const SelectionRail: Story = {
  name: 'Selection Rail',
  args: {
    ...createCarouselPresetArgs('desktop'),
    ...CAROUSEL_DEMO_STORY_OVERRIDES,
    controlsType: 'selectionRail',
  },
  render: renderPresetCarouselStory('desktop'),
};

export const SelectionRailOnMedia: Story = {
  name: 'Selection Rail On Media',
  args: {
    ...createCarouselPresetArgs('desktop'),
    ...CAROUSEL_DEMO_STORY_OVERRIDES,
    controlsType: 'selectionRailOnMedia',
    fullWidth: true,
  },
  render: renderPresetCarouselStory('desktop'),
};

export const FullWidth: Story = {
  name: 'Full Width',
  args: {
    ...createCarouselPresetArgs('desktop'),
    ...CAROUSEL_DEMO_STORY_OVERRIDES,
    fullWidth: true,
    controlsType: 'selectionRailOnMedia',
  },
  render: renderPresetCarouselStory('desktop'),
};

export const AspectRatios: Story = {
  name: 'Aspect Ratios',
  parameters: { controls: { disable: true } },
  render: () => <PresetAspectRatiosGrid preset="desktop" />,
};
