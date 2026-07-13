/**
 * Container.Containers.stories.tsx
 *
 * Storybook entry under **Components → Containers** (alongside Surface).
 * The layout-focused stories remain under `Layout/Container` in
 * `Container.stories.tsx`.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { containerStoryArgTypes } from './containerStoryArgTypes';
import {
  demoGridCellStyle,
  demoGridShowcaseDefaults,
  FiveDemoCells,
  nestedSurfaceChipLabelStyle,
  nestedSurfaceParentRowLabelStyle,
  NESTED_PARENT_SHOWCASE_MODES,
  NESTED_SURFACE_DEMO_MODES,
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

/** One parent strip: row label + six inner `Container`s (subtle … ghost, incl. bold). */
function NestedSurfaceParentRow({ parentMode }: { parentMode: (typeof NESTED_PARENT_SHOWCASE_MODES)[number] }) {
  return (
    <Container
      variant="fluid"
      surface={parentMode}
      appearance="primary"
      layout="grid"
      columns={6}
      gap="3"
      padding="3"
    >
      <div style={{ gridColumn: 'span 6' }}>
        <span style={nestedSurfaceParentRowLabelStyle}>{parentMode}</span>
      </div>
      {NESTED_SURFACE_DEMO_MODES.map((innerMode) => (
        <Container
          key={innerMode}
          surface={innerMode}
          appearance="auto"
          variant="full-bleed"
          layout="flex"
          direction="column"
          justify="center"
          align="center"
          padding="3"
          style={{ minHeight: 'var(--Spacing-24)' }}
        >
          <span style={nestedSurfaceChipLabelStyle}>{innerMode}</span>
        </Container>
      ))}
    </Container>
  );
}

const meta: Meta<typeof Container> = {
  title: 'Components/Containers/Container',
  component: Container,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    docs: {
      description: {
        component:
          'Container is the page-width shell (fluid / fixed / full-bleed) and a layout primitive. On web the **root** is always `<Surface>` (default `surface="ghost"`); layout classes and token remapping apply on that node. Set `surface` / `appearance` to preview tinted roles. Flex/grid, spacing, and sizing use design tokens. **Composition** stories (grid + `Image`, cards + `Button`) live here and under `Layout/Container`. See `Layout/Container` for the full layout walkthrough.',
      },
    },
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

export const FlexRowWithGap: Story = {
  name: 'Flex row + gap',
  args: {
    variant: 'fluid',
    layout: 'flex',
    direction: 'row',
    gap: '4',
    align: 'stretch',
    wrap: true,
    padding: '4',
  },
  render: (args) => (
    <Container {...args}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={demoGridCellStyle}>
          {String(i)}
        </div>
      ))}
    </Container>
  ),
};

export const FlexColumnPadding: Story = {
  name: 'Flex column + padding',
  args: {
    variant: 'fluid',
    surface: 'subtle',
    appearance: 'primary',
    layout: 'flex',
    direction: 'column',
    gap: '3',
    padding: '4',
  },
  render: (args) => (
    <Container {...args}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={demoGridCellStyle}>
          {String(i)}
        </div>
      ))}
    </Container>
  ),
};

/**
 * **Six** parent strips (`subtle` … `ghost`, including **`bold`**), each with the same **six** inner tiles
 * so you can compare nesting + token remapping across parent surfaces. Page chrome uses **variant** /
 * **surface** / **appearance** from controls.
 */
export const NestedSurfaces: Story = {
  name: 'Nested surfaces',
  args: {
    variant: 'fluid',
    surface: 'default',
    appearance: 'auto',
  },
  render: (args) => (
    <Container
      variant={args.variant}
      surface={args.surface ?? 'ghost'}
      appearance={args.appearance}
      layout="flex"
      direction="column"
      gap="6"
      padding="4"
    >
      {NESTED_PARENT_SHOWCASE_MODES.map((parentMode) => (
        <NestedSurfaceParentRow key={parentMode} parentMode={parentMode} />
      ))}
    </Container>
  ),
};

/** Same demo as `Layout/Container` → **Grid — columns & rows** (discoverable under Components). */
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

/** Same demo as `Layout/Container` → **Flex — grow (flex=1)**. */
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

/** Same as `Layout/Container` → **Composition — grid + Image** (media overflow check). */
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

/** **Grid + `Image` + text + `Button`** — product-style cards without horizontal bleed. */
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

/** Same as `Layout/Container` → **Composition — flex row + Image**. */
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
