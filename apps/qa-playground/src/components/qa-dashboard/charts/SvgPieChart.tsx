import { useMemo } from 'react';

import { describeArc, resolveColor, type ChartSlice } from './chartUtils';
import styles from '@/styles/qa-dashboard.module.css';

const DEFAULT_SIZE = 200;

type SvgPieChartProps = {
  slices: ChartSlice[];
  size?: number;
  onSliceClick?: (id: string) => void;
  activeId?: string | null;
};

export function SvgPieChart({ slices, size = DEFAULT_SIZE, onSliceClick, activeId }: SvgPieChartProps) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.4;

  const arcs = useMemo(() => {
    if (total === 0) return [];
    let angle = 0;
    return slices
      .filter((s) => s.value > 0)
      .map((slice) => {
        const sweep = (slice.value / total) * 360;
        const start = angle;
        const end = angle + sweep;
        angle = end;
        return { slice, path: describeArc(cx, cy, r, start, end - 0.8) };
      });
  }, [slices, total, cx, cy, r]);

  return (
    <div className={styles.chartWrap}>
      <div className={styles.chartSquareFrame} style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className={styles.chartSvgSquare} role="img" aria-label="Pie chart">
          {total === 0 ? (
            <circle cx={cx} cy={cy} r={r} className={styles.chartEmptyRing} />
          ) : (
            arcs.map(({ slice, path }) => (
              <path
                key={slice.id}
                d={`${path} L ${cx} ${cy} Z`}
                fill={resolveColor(slice.colorVar)}
                className={activeId === slice.id ? styles.chartSliceActive : styles.chartSlice}
                onClick={() => onSliceClick?.(slice.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onSliceClick?.(slice.id);
                }}
                tabIndex={onSliceClick ? 0 : undefined}
                role={onSliceClick ? 'button' : undefined}
                aria-label={`${slice.label}: ${slice.value}`}
              />
            ))
          )}
        </svg>
      </div>
      <ul className={styles.chartLegend}>
        {slices.map((slice) => (
          <li key={slice.id}>
            <button
              type="button"
              className={styles.chartLegendBtn}
              onClick={() => onSliceClick?.(slice.id)}
              aria-pressed={activeId === slice.id}
            >
              <span className={styles.chartLegendSwatch} style={{ background: resolveColor(slice.colorVar) }} />
              <span>{slice.label}</span>
              <span className={styles.chartLegendValue}>{slice.value}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
