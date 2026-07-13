import type { Meta, StoryObj } from '@storybook/react-vite';
import { Carousel } from './Carousel';
import {
  CAROUSEL_DEMO_STORY_OVERRIDES,
  createCarouselPresetArgs,
  PresetAspectRatiosGrid,
  renderPresetCarouselStory,
  DEMO_SLIDES,
  demoRailItems,
  mobileSlideRenderer,
  getCarouselStoryOptions,
  withCarouselDocsLayout,
  withCarouselStoryViewport,
} from './stories/Carousel.stories.shared';

const mobileStoryOptions = getCarouselStoryOptions('Mobile');

const meta = {
  title: 'Components/Navigation/Carousel/Mobile',
  component: Carousel.Mobile,
  tags: ['autodocs'],
  ...mobileStoryOptions,
  decorators: [withCarouselDocsLayout, withCarouselStoryViewport('mobile')],
  parameters: {
    ...mobileStoryOptions.parameters,
    layout: 'centered',
    viewport: { defaultViewport: 'mobile1' },
  },
} satisfies Meta<typeof Carousel.Mobile>;

export default meta;
type Story = StoryObj<typeof Carousel.Mobile>;

export const Default: Story = {
  args: createCarouselPresetArgs('mobile'),
  render: renderPresetCarouselStory('mobile'),
};

export const Pagination: Story = {
  name: 'Pagination',
  args: {
    ...createCarouselPresetArgs('mobile'),
    ...CAROUSEL_DEMO_STORY_OVERRIDES,
    controlsType: 'pagination',
  },
  render: renderPresetCarouselStory('mobile'),
};

export const PaginationOnMedia: Story = {
  name: 'Pagination On Media',
  args: {
    ...createCarouselPresetArgs('mobile'),
    ...CAROUSEL_DEMO_STORY_OVERRIDES,
    controlsType: 'paginationOnMedia',
  },
  render: renderPresetCarouselStory('mobile'),
};

export const SelectionRail: Story = {
  name: 'Selection Rail',
  args: {
    ...createCarouselPresetArgs('mobile'),
    ...CAROUSEL_DEMO_STORY_OVERRIDES,
    controlsType: 'selectionRail',
  },
  render: renderPresetCarouselStory('mobile'),
};

export const SelectionRailOnMedia: Story = {
  name: 'Selection Rail On Media',
  args: {
    ...createCarouselPresetArgs('mobile'),
    ...CAROUSEL_DEMO_STORY_OVERRIDES,
    controlsType: 'selectionRailOnMedia',
    fullWidth: true,
  },
  render: renderPresetCarouselStory('mobile'),
};

export const SelectionRailOverflow: Story = {
  name: 'Selection Rail Overflow',
  parameters: { controls: { disable: true } },
  render: () => (
    <Carousel.Mobile
      aria-label="Mobile selection rail overflow"
      controls
      controlsType="selectionRail"
      selectionRailItems={demoRailItems(DEMO_SLIDES.length)}
      items={DEMO_SLIDES}
      renderItem={mobileSlideRenderer}
    />
  ),
};

export const FullWidth: Story = {
  name: 'Full Width',
  args: {
    ...createCarouselPresetArgs('mobile'),
    ...CAROUSEL_DEMO_STORY_OVERRIDES,
    fullWidth: true,
    controlsType: 'selectionRailOnMedia',
  },
  render: renderPresetCarouselStory('mobile'),
};

export const AspectRatios: Story = {
  name: 'Aspect Ratios',
  parameters: { controls: { disable: true } },
  render: () => <PresetAspectRatiosGrid preset="mobile" />,
};
