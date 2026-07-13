import { useMemo } from 'react';

import { resolveColor, type ChartSlice } from './chartUtils';
import styles from '@/styles/qa-dashboard.module.css';

const BAR_WIDTH = 28;
const CHART_PAD_X = 16;
const CHART_PAD_TOP = 16;
const LABEL_HEIGHT = 32;
const MIN_SLOT_WIDTH = 52;
const LABEL_CHAR_WIDTH = 7;

function displayLabel(label: string): string {
  return label.length > 14 ? `${label.slice(0, 13)}…` : label;
}

function slotWidthForLabel(label: string): number {
  const text = displayLabel(label);
  return Math.max(MIN_SLOT_WIDTH, text.length * LABEL_CHAR_WIDTH + CHART_PAD_X);
}

type BarLayout = {
  slice: ChartSlice;
  barX: number;
  labelX: number;
  slotWidth: number;
};

function layoutBars(slices: ChartSlice[]): { bars: BarLayout[]; plotWidth: number } {
  let cursor = CHART_PAD_X;
  const bars = slices.map((slice) => {
    const slotWidth = slotWidthForLabel(slice.label);
    const barX = cursor + (slotWidth - BAR_WIDTH) / 2;
    const labelX = cursor + slotWidth / 2;
    const layout = { slice, barX, labelX, slotWidth };
    cursor += slotWidth;
    return layout;
  });
  return { bars, plotWidth: cursor + CHART_PAD_X };
}

type SvgBarChartProps = {
  slices: ChartSlice[];
  height?: number;
  onBarClick?: (id: string) => void;
  activeId?: string | null;
};

export function SvgBarChart({ slices, height = 220, onBarClick, activeId }: SvgBarChartProps) {
  const max = Math.max(1, ...slices.map((s) => s.value));
  const plotHeight = height - LABEL_HEIGHT - CHART_PAD_TOP;
  const chartHeight = CHART_PAD_TOP + plotHeight + LABEL_HEIGHT;

  const { bars, plotWidth } = useMemo(() => layoutBars(slices), [slices]);

  return (
    <div className={styles.barChartWrap}>
      <svg
        viewBox={`0 0 ${plotWidth} ${chartHeight}`}
        width={plotWidth}
        height={chartHeight}
        className={styles.barChartSvg}
        role="img"
        aria-label="Bar chart"
      >
        {bars.map(({ slice, barX, labelX }) => {
          const barH = (slice.value / max) * plotHeight;
          const y = CHART_PAD_TOP + plotHeight - barH;
          return (
            <g key={slice.id}>
              <rect
                x={barX}
                y={y}
                width={BAR_WIDTH}
                height={Math.max(barH, slice.value > 0 ? 2 : 0)}
                rx={4}
                fill={resolveColor(slice.colorVar)}
                className={activeId === slice.id ? styles.chartBarActive : styles.chartBar}
                onClick={() => onBarClick?.(slice.id)}
                tabIndex={onBarClick ? 0 : undefined}
                role={onBarClick ? 'button' : undefined}
                aria-label={`${slice.label}: ${slice.value}`}
              />
              <text
                x={labelX}
                y={chartHeight - 10}
                textAnchor="middle"
                className={styles.chartBarLabel}
              >
                {displayLabel(slice.label)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
