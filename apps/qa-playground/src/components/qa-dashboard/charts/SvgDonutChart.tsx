import { useMemo } from 'react';

import { describeDonutSegment, resolveColor, type ChartSlice } from './chartUtils';
import styles from '@/styles/qa-dashboard.module.css';

const DEFAULT_SIZE = 220;

type SvgDonutChartProps = {
  slices: ChartSlice[];
  size?: number;
  onSliceClick?: (id: string) => void;
  activeId?: string | null;
  centerLabel?: string;
  centerSublabel?: string;
  hideLegend?: boolean;
};

export function SvgDonutChart({
  slices,
  size = DEFAULT_SIZE,
  onSliceClick,
  activeId,
  centerLabel,
  centerSublabel,
  hideLegend = false,
}: SvgDonutChartProps) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const outer = size * 0.4;
  const inner = size * 0.26;

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
        return {
          slice,
          d: describeDonutSegment(cx, cy, outer, inner, start, end),
        };
      })
      .filter((arc) => arc.d.length > 0);
  }, [slices, total, cx, cy, outer, inner]);

  return (
    <div className={`${styles.chartWrap}${hideLegend ? ` ${styles.chartWrapDonutOnly}` : ''}`}>
      <div className={styles.chartSquareFrame} style={{ width: size, height: size }}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className={styles.chartSvgSquare}
          role="img"
          aria-label="Donut chart"
        >
          {total === 0 ? (
            <circle cx={cx} cy={cy} r={outer} className={styles.chartEmptyRing} />
          ) : (
            arcs.map(({ slice, d }) => (
              <path
                key={slice.id}
                d={d}
                fill={resolveColor(slice.colorVar)}
                className={activeId === slice.id ? styles.chartSliceActive : styles.chartSlice}
                onClick={() => onSliceClick?.(slice.id)}
                tabIndex={onSliceClick ? 0 : undefined}
                role={onSliceClick ? 'button' : undefined}
                aria-label={`${slice.label}: ${slice.value}`}
              />
            ))
          )}
          {centerLabel ? (
            <>
              <text x={cx} y={centerSublabel ? cy - 6 : cy} textAnchor="middle" dominantBaseline="middle" className={styles.chartCenterLabel}>
                {centerLabel}
              </text>
              {centerSublabel ? (
                <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle" className={styles.chartCenterSublabel}>
                  {centerSublabel}
                </text>
              ) : null}
            </>
          ) : null}
        </svg>
      </div>
      {hideLegend ? null : (
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
      )}
    </div>
  );
}
