import type { Meta, StoryObj } from '@storybook/react-vite';
import { Container } from '../Container';
import { Grid } from './Grid';
import { Column } from './Column';

const Cell = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      background: 'var(--Primary-Subtle, var(--Surface-Subtle))',
      color: 'var(--Primary-High, var(--Text-High))',
      padding: 'var(--Spacing-4)',
      borderRadius: 'var(--Shape-2)',
      textAlign: 'center',
      fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))',
      fontSize: 'var(--Label-S-FontSize)',
      lineHeight: 'var(--Label-S-LineHeight)',
    }}
  >
    {children}
  </div>
);

const meta: Meta<typeof Grid> = {
  title: 'Layout/Grid',
  component: Grid,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Responsive CSS Grid track. Defaults to `--Grid-Columns` (4/8/8/12/12 per platform) and `--Grid-Gutter`. Wrap in `<Container>` to apply margins.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Grid>;

export const Default: Story = {
  render: () => (
    <Container variant="fluid">
      <Grid>
        {Array.from({ length: 12 }, (_, i) => (
          <Column key={i}>
            <Cell>{i + 1}</Cell>
          </Column>
        ))}
      </Grid>
    </Container>
  ),
};

export const MobileFirstResponsive: Story = {
  render: () => (
    <Container variant="fluid">
      <Grid>
        <Column span={{ S: 4, M: 4, L: 6 }}>
          <Cell>span S:4 M:4 L:6</Cell>
        </Column>
        <Column span={{ S: 4, M: 4, L: 6 }}>
          <Cell>span S:4 M:4 L:6</Cell>
        </Column>
        <Column span={{ S: 4, M: 8, L: 12 }}>
          <Cell>span S:4 M:8 L:12 (full row on tablet+)</Cell>
        </Column>
      </Grid>
    </Container>
  ),
};

export const FixedContainer: Story = {
  render: () => (
    <Container variant="fixed">
      <Grid>
        {Array.from({ length: 12 }, (_, i) => (
          <Column key={i}>
            <Cell>col {i + 1}</Cell>
          </Column>
        ))}
      </Grid>
    </Container>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Fixed container caps at `--Grid-MaxWidth` (1280–1440px at the L breakpoint). Use for marketing/reading content.',
      },
    },
  },
};

export const FluidContainer: Story = {
  render: () => (
    <Container variant="fluid">
      <Grid>
        {Array.from({ length: 12 }, (_, i) => (
          <Column key={i}>
            <Cell>col {i + 1}</Cell>
          </Column>
        ))}
      </Grid>
    </Container>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Fluid container fills viewport (no max-width). Use for apps, dashboards, software tools — works past 1920px.',
      },
    },
  },
};

export const FullBleed: Story = {
  render: () => (
    <Container variant="full-bleed">
      <Grid>
        {Array.from({ length: 4 }, (_, i) => (
          <Column key={i} span={{ S: 4, M: 2, L: 3 }}>
            <Cell>full-bleed cell {i + 1}</Cell>
          </Column>
        ))}
      </Grid>
    </Container>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Full-bleed removes margin and cap. Use for hero sections, media strips.',
      },
    },
  },
};

export const ColumnsOverride: Story = {
  render: () => (
    <Container variant="fluid">
      <Grid columns={6}>
        {Array.from({ length: 6 }, (_, i) => (
          <Column key={i}>
            <Cell>{i + 1}/6</Cell>
          </Column>
        ))}
      </Grid>
    </Container>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Override the default column count with a custom number (here: 6) or per-breakpoint object.',
      },
    },
  },
};
