import type { Meta, StoryObj } from '@storybook/react-vite';
import { containerStoryArgTypes } from './containerStoryArgTypes';
import {
  demoGridCellStyle,
  demoGridShowcaseDefaults,
  demoTallGridCellStyle,
  FiveDemoCells,
  STORY_IMAGE_LANDSCAPE,
  STORY_IMAGE_PORTRAIT,
  STORY_IMAGE_WIDE,
  storyCardActionsRowStyle,
  storyCardDescriptionStyle,
  storyCardTitleStyle,
  storyGridMediaCellStyle,
} from './Container.story.shared';
import { Container } from './Container';
import { Image } from '../Image';
import { Button } from '../Button';

const meta: Meta<typeof Container> = {
  title: 'Layout/Container',
  component: Container,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
  },
  argTypes: containerStoryArgTypes,
};

export default meta;
type Story = StoryObj<typeof Container>;

export const Fluid: Story = {
  args: { variant: 'fluid', ...demoGridShowcaseDefaults },
  render: (args) => (
    <Container {...args}>
      <FiveDemoCells />
    </Container>
  ),
};

export const Fixed: Story = {
  args: { variant: 'fixed', ...demoGridShowcaseDefaults },
  render: (args) => (
    <Container {...args}>
      <FiveDemoCells />
    </Container>
  ),
};

export const FullBleed: Story = {
  args: { variant: 'full-bleed', ...demoGridShowcaseDefaults },
  render: (args) => (
    <Container {...args}>
      <FiveDemoCells />
    </Container>
  ),
};

export const CustomMaxWidth: Story = {
  args: { variant: 'fixed', maxWidth: '960px', ...demoGridShowcaseDefaults },
  render: (args) => (
    <Container {...args}>
      <FiveDemoCells />
    </Container>
  ),
};

/** Explicit `columns` + `rows` token grid (e.g. dashboards, A2UI `layout: "grid"`). */
export const GridColumnsAndRows: Story = {
  name: 'Grid — columns & rows',
  args: {
    variant: 'fluid',
    layout: 'grid',
    columns: 3,
    rows: 2,
    gap: '4',
    padding: '4',
  },
  render: (args) => (
    <Container {...args}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} style={demoGridCellStyle}>
          {String(i)}
        </div>
      ))}
    </Container>
  ),
};

/** `flex={1}` child fills remaining space beside a fixed-width token column. */
export const FlexGrowSplit: Story = {
  name: 'Flex — grow (flex=1)',
  args: {
    variant: 'fluid',
    layout: 'flex',
    direction: 'row',
    gap: '4',
    padding: '4',
    align: 'stretch',
  },
  render: (args) => (
    <Container {...args}>
      <div style={{ ...demoGridCellStyle, width: 'var(--Spacing-40)', minWidth: 'var(--Spacing-40)' }}>
        Sidebar
      </div>
      <Container variant="full-bleed" flex={1} surface="subtle" appearance="neutral" padding="4">
        <div style={demoGridCellStyle}>Main (flex 1)</div>
      </Container>
    </Container>
  ),
};

/** Per-side padding keys (`paddingTop` / `paddingBottom`) for forms, dialogs, cards. */
export const PerSidePadding: Story = {
  name: 'Padding — per side (tokens)',
  args: {
    variant: 'fluid',
    surface: 'subtle',
    appearance: 'primary',
    paddingTop: '8',
    paddingBottom: '4',
    paddingX: '6',
  },
  render: (args) => (
    <Container {...args}>
      <p
        style={{
          fontFamily: 'var(--Typography-Font-Primary)',
          fontSize: 'var(--Body-M-FontSize)',
          lineHeight: 'var(--Body-M-LineHeight)',
          fontWeight: 'var(--Body-FontWeight-Low)',
          color: 'var(--Text-High)',
          margin: 0,
        }}
      >
        More space above (`paddingTop: 8`) than below (`paddingBottom: 4`); horizontal axis from{' '}
        <code style={{ fontFamily: 'var(--Typography-Font-Code)' }}>paddingX: 6</code>.
      </p>
    </Container>
  ),
};

/** `alignSelf` on a nested `Container` inside a flex row. */
export const AlignSelfInFlexRow: Story = {
  name: 'Flex — alignSelf',
  args: {
    variant: 'fluid',
    layout: 'flex',
    direction: 'row',
    gap: '3',
    padding: '4',
    align: 'stretch',
  },
  render: (args) => (
    <Container {...args}>
      <div style={demoTallGridCellStyle}>Tall A</div>
      <Container variant="full-bleed" alignSelf="center" padding="3" surface="minimal" appearance="neutral">
        <div style={demoGridCellStyle}>B (alignSelf center)</div>
      </Container>
      <div style={demoTallGridCellStyle}>Tall C</div>
    </Container>
  ),
};

/** Omit `layout` — normal block flow; children stack as blocks (no flex/grid on root). */
export const BlockFlowStack: Story = {
  name: 'Block flow (no layout prop)',
  args: { variant: 'fluid', padding: '4' },
  render: (args) => (
    <Container {...args}>
      <div style={demoGridCellStyle}>Block 1</div>
      <div style={{ ...demoGridCellStyle, marginTop: 'var(--Spacing-3)' }}>Block 2</div>
    </Container>
  ),
};

/** Longhand `grow` / `shrink` / `basis` when `flex` shorthand is omitted. */
export const FlexGrowShrinkBasis: Story = {
  name: 'Flex — grow / shrink / basis',
  args: {
    variant: 'fluid',
    layout: 'flex',
    direction: 'row',
    gap: '4',
    padding: '4',
    align: 'stretch',
  },
  render: (args) => (
    <Container {...args}>
      <div style={{ ...demoGridCellStyle, minWidth: 'var(--Spacing-28)', maxWidth: 'var(--Spacing-28)' }}>
        Fixed
      </div>
      <Container variant="full-bleed" grow={1} shrink={1} basis="auto" surface="subtle" appearance="neutral" padding="4">
        <div style={demoGridCellStyle}>grow=1 shrink=1 basis=auto</div>
      </Container>
    </Container>
  ),
};

/**
 * **Grid + `Image`:** `minmax(0, 1fr)` columns plus `storyGridMediaCellStyle` (`minWidth` token + `overflow: hidden`)
 * keep wide assets inside cells — pair with `Image` aspect ratio + `cover` for predictable clipping.
 */
export const CompositionGridImages: Story = {
  name: 'Composition — grid + Image',
  args: {
    variant: 'fluid',
    surface: 'subtle',
    appearance: 'primary',
    layout: 'grid',
    columns: 3,
    gap: '4',
    padding: '4',
    overflow: 'hidden',
  },
  render: (args) => {
    const cells = [
      { src: STORY_IMAGE_LANDSCAPE, alt: 'Picsum landscape placeholder', ratio: '16:9' as const },
      { src: STORY_IMAGE_PORTRAIT, alt: 'Picsum portrait placeholder', ratio: '16:9' as const },
      { src: STORY_IMAGE_WIDE, alt: 'Picsum wide placeholder', ratio: '16:9' as const },
      { src: STORY_IMAGE_LANDSCAPE, alt: 'Picsum landscape in three-two tile', ratio: '3:2' as const },
      { src: STORY_IMAGE_PORTRAIT, alt: 'Picsum portrait in square tile', ratio: '1:1' as const },
      { src: STORY_IMAGE_WIDE, alt: 'Picsum wide in four-three tile', ratio: '4:3' as const },
    ];
    return (
      <Container {...args}>
        {cells.map((c, i) => (
          <Container
            key={i}
            variant="full-bleed"
            surface="minimal"
            appearance="neutral"
            padding="2"
            style={storyGridMediaCellStyle}
          >
            <Image
              src={c.src}
              alt={c.alt}
              aspectRatio={c.ratio}
              fit="cover"
              loading="eager"
              style={{ width: '100%' }}
            />
          </Container>
        ))}
      </Container>
    );
  },
};

/** **Grid + `Image` + typography + `Button`:** stacked card pattern inside each grid cell. */
export const CompositionGridMediaCards: Story = {
  name: 'Composition — grid + Image + Button',
  args: {
    variant: 'fluid',
    surface: 'subtle',
    appearance: 'primary',
    layout: 'grid',
    columns: 3,
    gap: '4',
    padding: '4',
    overflow: 'hidden',
  },
  render: (args) => {
    const cards = [
      {
        title: 'Editorial',
        body: '16:9 hero crop inside a token grid cell.',
        alt: 'Picsum landscape for editorial card',
        src: STORY_IMAGE_LANDSCAPE,
        ratio: '16:9' as const,
      },
      {
        title: 'Portrait',
        body: 'Tall source in a fixed tile — should not break the row.',
        alt: 'Picsum portrait for card',
        src: STORY_IMAGE_PORTRAIT,
        ratio: '3:2' as const,
      },
      {
        title: 'Panorama',
        body: 'Wide asset clipped with cover, not overflowing.',
        alt: 'Picsum wide for card',
        src: STORY_IMAGE_WIDE,
        ratio: '3:2' as const,
      },
    ];
    return (
      <Container {...args}>
        {cards.map((c) => (
          <Container
            key={c.title}
            variant="full-bleed"
            surface="minimal"
            appearance="neutral"
            padding="3"
            style={storyGridMediaCellStyle}
          >
            <Image
              src={c.src}
              alt={c.alt}
              aspectRatio={c.ratio}
              fit="cover"
              loading="eager"
              style={{ width: '100%' }}
            />
            <h3 style={storyCardTitleStyle}>{c.title}</h3>
            <p style={storyCardDescriptionStyle}>{c.body}</p>
            <div style={storyCardActionsRowStyle}>
              <Button attention="low" size="s">
                Details
              </Button>
              <Button attention="medium" size="s">
                Save
              </Button>
            </div>
          </Container>
        ))}
      </Container>
    );
  },
};

/** **Flex row + `Image`:** equal-width columns using nested `Container` with `flex={1}` and `minWidth="0"`. */
export const CompositionFlexImageRow: Story = {
  name: 'Composition — flex row + Image',
  args: {
    variant: 'fluid',
    surface: 'subtle',
    appearance: 'primary',
    layout: 'flex',
    direction: 'row',
    gap: '3',
    padding: '4',
    align: 'stretch',
    overflow: 'hidden',
  },
  render: (args) => (
    <Container {...args}>
      {[
        { src: STORY_IMAGE_LANDSCAPE, alt: 'Picsum landscape' },
        { src: STORY_IMAGE_PORTRAIT, alt: 'Picsum portrait' },
        { src: STORY_IMAGE_WIDE, alt: 'Picsum wide' },
      ].map((item) => (
        <Container
          key={item.alt}
          variant="full-bleed"
          flex={1}
          minWidth="0"
          surface="minimal"
          appearance="neutral"
          padding="2"
          overflow="hidden"
        >
          <Image
            src={item.src}
            alt={item.alt}
            aspectRatio="1:1"
            fit="cover"
            loading="eager"
            style={{ width: '100%' }}
          />
        </Container>
      ))}
    </Container>
  ),
};
