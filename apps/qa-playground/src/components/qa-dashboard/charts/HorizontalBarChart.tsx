import { resolveColor, type ChartSlice } from './chartUtils';
import styles from '@/styles/qa-dashboard.module.css';

const ROW_HEIGHT = 32;
const LABEL_WIDTH = 140;
const BAR_AREA = 280;
const PAD = 16;

type HorizontalBarChartProps = {
  slices: ChartSlice[];
  onBarClick?: (id: string) => void;
  activeId?: string | null;
};

export function HorizontalBarChart({ slices, onBarClick, activeId }: HorizontalBarChartProps) {
  const max = Math.max(1, ...slices.map((s) => s.value));
  const height = slices.length * ROW_HEIGHT + PAD * 2;
  const width = LABEL_WIDTH + BAR_AREA + PAD * 2;

  return (
    <div className={styles.hBarChartWrap}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={styles.chartSvgFluid}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Assignee bar chart"
      >
        {slices.map((slice, index) => {
          const barW = (slice.value / max) * BAR_AREA;
          const y = PAD + index * ROW_HEIGHT + 6;
          const x = LABEL_WIDTH + PAD;
          return (
            <g key={slice.id}>
              <text
                x={LABEL_WIDTH + PAD - 8}
                y={y + 12}
                textAnchor="end"
                className={styles.hBarLabel}
              >
                {slice.label.length > 18 ? `${slice.label.slice(0, 17)}…` : slice.label}
              </text>
              <rect
                x={x}
                y={y}
                width={Math.max(barW, slice.value > 0 ? 4 : 0)}
                height={ROW_HEIGHT - 12}
                rx={4}
                fill={resolveColor(slice.colorVar)}
                className={activeId === slice.id ? styles.chartBarActive : styles.chartBar}
                onClick={() => onBarClick?.(slice.id)}
                tabIndex={onBarClick ? 0 : undefined}
                role={onBarClick ? 'button' : undefined}
                aria-label={`${slice.label}: ${slice.value}`}
              />
              <text x={x + barW + 6} y={y + 12} className={styles.hBarValue}>
                {slice.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
