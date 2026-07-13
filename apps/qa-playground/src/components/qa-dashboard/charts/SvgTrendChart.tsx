import type { TrendPoint } from '@/services/notion/bugAnalytics';
import styles from '@/styles/qa-dashboard.module.css';

type SvgTrendChartProps = {
  points: TrendPoint[];
  height?: number;
};

function seriesPath(
  values: number[],
  width: number,
  height: number,
  max: number,
  padX: number,
  padY: number,
  labelHeight: number,
): string {
  if (values.length === 0) return '';
  const innerW = width - padX * 2;
  const innerH = height - padY - labelHeight;
  return values
    .map((v, i) => {
      const x = padX + (i / Math.max(1, values.length - 1)) * innerW;
      const y = padY + innerH - (v / max) * innerH;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

export function SvgTrendChart({ points, height = 220 }: SvgTrendChartProps) {
  const width = 520;
  const padX = 32;
  const padY = 20;
  const labelHeight = 28;
  const max = Math.max(1, ...points.flatMap((p) => [p.created, p.fixed, p.closed]));

  const created = seriesPath(
    points.map((p) => p.created),
    width,
    height,
    max,
    padX,
    padY,
    labelHeight,
  );
  const fixed = seriesPath(
    points.map((p) => p.fixed),
    width,
    height,
    max,
    padX,
    padY,
    labelHeight,
  );
  const closed = seriesPath(
    points.map((p) => p.closed),
    width,
    height,
    max,
    padX,
    padY,
    labelHeight,
  );

  return (
    <div className={styles.trendChartWrap}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={styles.chartSvgFluid}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Status trend chart"
      >
        <path d={created} className={styles.trendLineCreated} fill="none" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
        <path d={fixed} className={styles.trendLineFixed} fill="none" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
        <path d={closed} className={styles.trendLineClosed} fill="none" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => {
          const x = padX + (i / Math.max(1, points.length - 1)) * (width - padX * 2);
          return (
            <text key={p.label} x={x} y={height - 6} textAnchor="middle" className={styles.chartBarLabel}>
              {p.label}
            </text>
          );
        })}
      </svg>
      <ul className={styles.trendLegend}>
        <li><span className={styles.trendSwatchCreated} /> Created</li>
        <li><span className={styles.trendSwatchFixed} /> Fixed</li>
        <li><span className={styles.trendSwatchClosed} /> Closed</li>
      </ul>
    </div>
  );
}
