/**
 * Tools / Performance
 *
 * The `title: 'Tools/Performance'` field creates a new `Tools` root section
 * in the Storybook sidebar, sibling to Components / Foundations / Layout.
 *
 * Measures mount + update timings for OneUI components across a sweep of
 * instance counts using React.Profiler. Outputs avg/median/p95/stddev per
 * step, a power-law fit, an SVG chart, and CSV export.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { PerformanceTool } from './PerformanceTool';

const meta: Meta<typeof PerformanceTool> = {
  title: 'Tools/Performance',
  component: PerformanceTool,
  parameters: {
    layout: 'fullscreen',
    docs: { disable: true },
  },
};
export default meta;

type Story = StoryObj<typeof PerformanceTool>;

export const Default: Story = {};
