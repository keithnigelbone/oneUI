/**
 * LineChart.tsx
 *
 * Duplicated from apps/storybook/src/stories/tools/LineChart.tsx for the
 * qa-playground Performance page. Keep in sync with the Storybook original.
 *
 * Minimal inline-SVG line chart for the perf tool. Token-only styling.
 */

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import styles from './PerformanceTool.module.css';

export interface ChartSeries {
  id: string;
  label: string;
  colorVar: string;
  dashed?: boolean;
  points: ReadonlyArray<{ x: number; y: number }>;
}

export interface OverheadBand {
  id: string;
  upperId: string;
  lowerId: string;
  label: string;
  colorVar: string;
}

export interface LineChartProps {
  series: ReadonlyArray<ChartSeries>;
  xLabel: string;
  yLabel: string;
  logX: boolean;
  logY: boolean;
  width?: number | 'auto';
  height?: number | 'auto';
  overheadBands?: ReadonlyArray<OverheadBand>;
  hiddenSeriesIds?: ReadonlySet<string>;
  onSeriesVisibilityChange?: (seriesId: string, visible: boolean) => void;
  legendPosition?: 'bottom' | 'right';
}

function resolveColor(c: string): string {
  return c.startsWith('--') ? `var(${c})` : c;
}

interface HoverState {
  x: number;
  y: number;
  values: Array<{ seriesId: string; label: string; xVal: number; yVal: number; colorVar: string }>;
}

const MARGIN = { top: 16, right: 16, bottom: 36, left: 52 };

function niceTicks(min: number, max: number, count: number): number[] {
  if (!isFinite(min) || !isFinite(max) || min === max) return [min];
  const range = max - min;
  const rough = range / count;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  let stepN: number;
  if (norm < 1.5) stepN = 1;
  else if (norm < 3) stepN = 2;
  else if (norm < 7) stepN = 5;
  else stepN = 10;
  const step = stepN * mag;
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + 1e-9; v += step) ticks.push(Number(v.toFixed(8)));
  return ticks;
}

function logTicks(min: number, max: number): number[] {
  if (min <= 0 || max <= 0) return [];
  const lo = Math.floor(Math.log10(min));
  const hi = Math.ceil(Math.log10(max));
  const ticks: number[] = [];
  for (let p = lo; p <= hi; p++) ticks.push(Math.pow(10, p));
  return ticks;
}

export function LineChart({
  series,
  xLabel,
  yLabel,
  logX,
  logY,
  width = 'auto',
  height = 'auto',
  overheadBands = [],
  hiddenSeriesIds,
  onSeriesVisibilityChange,
  legendPosition = 'bottom',
}: LineChartProps) {
  const [hover, setHover] = useState<HoverState | null>(null);
  const plotSlotRef = useRef<HTMLDivElement | null>(null);
  const [measured, setMeasured] = useState<{ w: number; h: number }>({ w: 720, h: 320 });

  const autoWidth = width === 'auto';
  const autoHeight = height === 'auto';

  useLayoutEffect(() => {
    if (!autoWidth && !autoHeight) return;
    const el = plotSlotRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setMeasured({
        w: Math.max(280, Math.floor(r.width)),
        h: Math.max(220, Math.floor(r.height)),
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [autoWidth, autoHeight, legendPosition]);

  const resolvedW = autoWidth ? measured.w : (width as number);
  const resolvedH = autoHeight ? measured.h : (height as number);

  const activeSeries = useMemo(
    () => series.filter((s) => !hiddenSeriesIds?.has(s.id)),
    [series, hiddenSeriesIds],
  );

  const activeBands = useMemo(
    () =>
      overheadBands.filter(
        (b) => !hiddenSeriesIds?.has(b.upperId) && !hiddenSeriesIds?.has(b.lowerId),
      ),
    [overheadBands, hiddenSeriesIds],
  );

  const innerW = Math.max(40, resolvedW - MARGIN.left - MARGIN.right);
  const innerH = Math.max(40, resolvedH - MARGIN.top - MARGIN.bottom);

  const { scaleX, scaleY, xTicks, yTicks, allXs } = useMemo(() => {
    let xMin = Infinity;
    let xMax = -Infinity;
    let yMin = Infinity;
    let yMax = -Infinity;
    const allXs = new Set<number>();
    for (const s of activeSeries) {
      for (const p of s.points) {
        if (p.x < xMin) xMin = p.x;
        if (p.x > xMax) xMax = p.x;
        if (p.y < yMin) yMin = p.y;
        if (p.y > yMax) yMax = p.y;
        allXs.add(p.x);
      }
    }
    if (!isFinite(xMin)) {
      xMin = 0;
      xMax = 1;
    }
    if (!isFinite(yMin)) {
      yMin = 0;
      yMax = 1;
    }
    if (xMin === xMax) xMax = xMin + 1;
    if (yMin === yMax) yMax = yMin + 1;
    if (logX && xMin <= 0) xMin = 1;
    if (logY && yMin <= 0) yMin = 0.01;
    if (!logY) {
      const pad = (yMax - yMin) * 0.08;
      yMax += pad;
      yMin = Math.max(0, yMin - pad);
    }

    const xLo = logX ? Math.log10(xMin) : xMin;
    const xHi = logX ? Math.log10(xMax) : xMax;
    const yLo = logY ? Math.log10(yMin) : yMin;
    const yHi = logY ? Math.log10(yMax) : yMax;

    const sx = (v: number): number => {
      const u = logX ? Math.log10(v) : v;
      return ((u - xLo) / (xHi - xLo)) * innerW;
    };
    const sy = (v: number): number => {
      const u = logY ? Math.log10(v) : v;
      return innerH - ((u - yLo) / (yHi - yLo)) * innerH;
    };

    const xt = logX ? logTicks(xMin, xMax) : niceTicks(xMin, xMax, 6);
    const yt = logY ? logTicks(yMin, yMax) : niceTicks(yMin, yMax, 5);

    return {
      scaleX: sx,
      scaleY: sy,
      xTicks: xt,
      yTicks: yt,
      allXs: Array.from(allXs).sort((a, b) => a - b),
    };
  }, [activeSeries, logX, logY, innerW, innerH]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (allXs.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const localX = e.clientX - rect.left - MARGIN.left;
    if (localX < 0 || localX > innerW) {
      setHover(null);
      return;
    }
    let nearestX = allXs[0];
    let bestD = Math.abs(scaleX(nearestX) - localX);
    for (const xv of allXs) {
      const d = Math.abs(scaleX(xv) - localX);
      if (d < bestD) {
        bestD = d;
        nearestX = xv;
      }
    }
    const values = activeSeries
      .map((s) => {
        const pt = s.points.find((p) => p.x === nearestX);
        if (!pt) return null;
        return {
          seriesId: s.id,
          label: s.label,
          xVal: nearestX,
          yVal: pt.y,
          colorVar: s.colorVar,
        };
      })
      .filter((v): v is NonNullable<typeof v> => v !== null);
    if (values.length === 0) {
      setHover(null);
      return;
    }
    const topYVal = values.reduce(
      (best, v) => (best === null || v.yVal > best ? v.yVal : best),
      null as number | null,
    );
    const screenY = topYVal === null ? 0 : scaleY(topYVal);
    setHover({ x: scaleX(nearestX), y: screenY, values });
  };

  return (
    <div className={styles.chartWrap} data-legend-position={legendPosition}>
      <div ref={plotSlotRef} className={styles.chartPlotSlot}>
      <svg
        width={resolvedW}
        height={resolvedH}
        viewBox={`0 0 ${resolvedW} ${resolvedH}`}
        role="img"
        aria-label="Performance chart"
        className={styles.chartSvg}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHover(null)}
      >
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {yTicks.map((t, i) => (
            <line
              key={`gy-${i}`}
              x1={0}
              x2={innerW}
              y1={scaleY(t)}
              y2={scaleY(t)}
              className={styles.chartGridLine}
            />
          ))}
          <line x1={0} y1={innerH} x2={innerW} y2={innerH} className={styles.chartAxis} />
          <line x1={0} y1={0} x2={0} y2={innerH} className={styles.chartAxis} />
          {xTicks.map((t, i) => (
            <g key={`tx-${i}`}>
              <line
                x1={scaleX(t)}
                x2={scaleX(t)}
                y1={innerH}
                y2={innerH + 4}
                className={styles.chartAxis}
              />
              <text
                x={scaleX(t)}
                y={innerH + 18}
                textAnchor="middle"
                className={styles.chartTickLabel}
              >
                {logX ? t.toString() : Number(t.toPrecision(3)).toString()}
              </text>
            </g>
          ))}
          {yTicks.map((t, i) => (
            <text
              key={`ty-${i}`}
              x={-6}
              y={scaleY(t)}
              textAnchor="end"
              dominantBaseline="middle"
              className={styles.chartTickLabel}
            >
              {t < 0.01 ? t.toExponential(1) : Number(t.toPrecision(3)).toString()}
            </text>
          ))}
          <text
            x={innerW / 2}
            y={innerH + 32}
            textAnchor="middle"
            className={styles.chartAxisLabel}
          >
            {xLabel}
          </text>
          <text
            x={-innerH / 2}
            y={-38}
            transform={`rotate(-90)`}
            textAnchor="middle"
            className={styles.chartAxisLabel}
          >
            {yLabel}
          </text>
          {activeBands.map((band) => {
            const upper = activeSeries.find((s) => s.id === band.upperId);
            const lower = activeSeries.find((s) => s.id === band.lowerId);
            if (!upper || !lower) return null;
            const lowerByX = new Map<number, number>();
            for (const p of lower.points) lowerByX.set(p.x, p.y);
            const paired = upper.points
              .map((p) => {
                const ly = lowerByX.get(p.x);
                return ly === undefined ? null : { x: p.x, upperY: p.y, lowerY: ly };
              })
              .filter((p): p is { x: number; upperY: number; lowerY: number } => p !== null);
            if (paired.length < 2) return null;
            const top = paired
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x)} ${scaleY(p.upperY)}`)
              .join(' ');
            const bottom = paired
              .slice()
              .reverse()
              .map((p) => `L ${scaleX(p.x)} ${scaleY(p.lowerY)}`)
              .join(' ');
            const d = `${top} ${bottom} Z`;
            return (
              <path
                key={`band-${band.id}`}
                d={d}
                fill={resolveColor(band.colorVar)}
                fillOpacity={0.18}
                stroke="none"
                aria-hidden="true"
              />
            );
          })}
          {activeSeries.map((s) => {
            const d = s.points
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x)} ${scaleY(p.y)}`)
              .join(' ');
            return (
              <g key={s.id}>
                <path
                  d={d}
                  fill="none"
                  stroke={resolveColor(s.colorVar)}
                  strokeWidth={2}
                  strokeDasharray={s.dashed ? '6 4' : undefined}
                />
                {s.points.map((p, i) => (
                  <circle
                    key={`${s.id}-${i}`}
                    cx={scaleX(p.x)}
                    cy={scaleY(p.y)}
                    r={3}
                    fill={resolveColor(s.colorVar)}
                  />
                ))}
              </g>
            );
          })}
          {hover && (
            <line
              x1={hover.x}
              x2={hover.x}
              y1={0}
              y2={innerH}
              className={styles.chartHoverLine}
            />
          )}
        </g>
      </svg>
      {hover && (
        <div
          className={styles.chartTooltip}
          style={{
            left: Math.min(
              resolvedW - 8,
              Math.max(8, hover.x + MARGIN.left + 12),
            ),
            top: Math.min(
              resolvedH - 8,
              Math.max(8, hover.y + MARGIN.top - 12),
            ),
          }}
        >
          <div className={styles.chartTooltipTitle}>
            {xLabel}: {hover.values[0]?.xVal}
          </div>
          {hover.values.map((v) => (
            <div key={v.seriesId} className={styles.chartTooltipRow}>
              <span
                className={styles.chartLegendSwatch}
                style={{ background: resolveColor(v.colorVar) }}
              />
              <span className={styles.chartTooltipLabel}>{v.label}</span>
              <span className={styles.chartTooltipValue}>{v.yVal.toFixed(3)}ms</span>
            </div>
          ))}
        </div>
      )}
      </div>
      <div className={styles.chartLegend} role="group" aria-label="Chart series">
        {series.map((s) => {
          const visible = !hiddenSeriesIds?.has(s.id);
          const swatchClass = s.dashed
            ? `${styles.chartLegendSwatch} ${styles.chartLegendSwatchDashed}`
            : styles.chartLegendSwatch;
          const itemClass = visible
            ? styles.chartLegendItem
            : `${styles.chartLegendItem} ${styles.chartLegendItemHidden}`;
          const swatchStyle = {
            '--legend-swatch-color': resolveColor(s.colorVar),
          } as React.CSSProperties;
          if (onSeriesVisibilityChange) {
            return (
              <button
                key={s.id}
                type="button"
                className={itemClass}
                onClick={() => onSeriesVisibilityChange(s.id, !visible)}
                aria-pressed={visible}
                title={visible ? `Hide ${s.label}` : `Show ${s.label}`}
              >
                <span className={swatchClass} style={swatchStyle} aria-hidden="true" />
                <span className={styles.chartLegendLabel}>{s.label}</span>
              </button>
            );
          }
          return (
            <span key={s.id} className={itemClass}>
              <span className={swatchClass} style={swatchStyle} aria-hidden="true" />
              <span className={styles.chartLegendLabel}>{s.label}</span>
            </span>
          );
        })}
        {activeBands.map((b) => (
          <span key={`band-legend-${b.id}`} className={styles.chartLegendItem}>
            <span
              className={`${styles.chartLegendSwatch} ${styles.chartLegendSwatchBand}`}
              style={
                { '--legend-swatch-color': resolveColor(b.colorVar) } as React.CSSProperties
              }
              aria-hidden="true"
            />
            <span className={styles.chartLegendLabel}>{b.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
