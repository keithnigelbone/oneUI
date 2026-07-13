/**
 * JioRibbon.tsx
 *
 * Jio brand dot-pattern ribbon component. Renders a procedural SVG grid of
 * colored circles with optional Jio symbol, unified across four modes:
 *   variant (dots | dots-with-symbol) x orientation (vertical | horizontal)
 *
 * The ribbon dynamically scales to the canvas via geometric-mean sizing,
 * matching the Jio Banner Builder implementation.
 */

'use client';

import { useMemo, useEffect, useRef, useState, useCallback, useId } from 'react';
import styles from './JioRibbon.module.css';
import {
  JIO_SYMBOL_PATH,
  JIO_DEFAULT_COLORS,
  computeRibbonGeometry,
  resolveOrientation,
  defaultPlacement,
  type JioRibbonProps,
  type SymbolGradient,
} from './JioRibbon.shared';

export function JioRibbon({
  variant = 'dots',
  orientation: orientationProp,
  placement: placementProp,
  color1,
  color2,
  color3,
  canvasWidth,
  canvasHeight,
  size,
  symbolPosition,
  onSymbolPositionChange,
  onThicknessCalculated,
  symbolGradient,
  className,
  style,
}: JioRibbonProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragSlotRef = useRef<number>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<number | null>(null);
  const gradientId = useId().replace(/:/g, '');

  const resolvedOrientation =
    orientationProp ?? resolveOrientation(canvasWidth, canvasHeight);
  const resolvedPlacement =
    placementProp ?? defaultPlacement(resolvedOrientation);

  const resolvedColors: [string, string, string] = [
    color1 ?? JIO_DEFAULT_COLORS.color1,
    color2 ?? JIO_DEFAULT_COLORS.color2,
    color3 ?? JIO_DEFAULT_COLORS.color3,
  ];

  const effectiveSymbolPosition =
    isDragging && dragPosition != null ? dragPosition : symbolPosition;

  const geometry = useMemo(
    () =>
      computeRibbonGeometry({
        variant,
        orientation: resolvedOrientation,
        canvasWidth,
        canvasHeight,
        colors: resolvedColors,
        placement: resolvedPlacement,
        symbolPosition: effectiveSymbolPosition,
        size,
      }),
    [
      variant,
      resolvedOrientation,
      canvasWidth,
      canvasHeight,
      size,
      resolvedColors[0],
      resolvedColors[1],
      resolvedColors[2],
      resolvedPlacement,
      effectiveSymbolPosition,
    ],
  );

  useEffect(() => {
    if (
      onThicknessCalculated &&
      isFinite(geometry.ribbonExtent) &&
      geometry.ribbonExtent > 0
    ) {
      onThicknessCalculated(geometry.ribbonExtent);
    }
  }, [geometry.ribbonExtent, onThicknessCalculated]);

  // -----------------------------------------------------------------------
  // Symbol drag interaction (with-symbol variant only)
  // -----------------------------------------------------------------------

  const getNearestSlot = useCallback(
    (coord: number): number => {
      const centers = geometry.slotCenters;
      if (centers.length === 0) return 1;
      let best = 0;
      let bestDist = Math.abs(coord - centers[0]);
      for (let i = 1; i < centers.length; i++) {
        const d = Math.abs(coord - centers[i]);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      return best + 1;
    },
    [geometry.slotCenters],
  );

  const handleSymbolMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!onSymbolPositionChange || !svgRef.current) return;
      e.preventDefault();
      e.stopPropagation();

      const initial = effectiveSymbolPosition ?? 4;
      dragSlotRef.current = initial;
      setIsDragging(true);
      setDragPosition(initial);

      const svg = svgRef.current;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;

      const isVert = resolvedOrientation === 'vertical';

      const move = (e2: MouseEvent) => {
        const pt = new DOMPoint(e2.clientX, e2.clientY).matrixTransform(
          ctm.inverse(),
        );
        const slot = getNearestSlot(isVert ? pt.y : pt.x);
        dragSlotRef.current = slot;
        setDragPosition(slot);
      };

      const up = () => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
        onSymbolPositionChange(dragSlotRef.current);
        setIsDragging(false);
        setDragPosition(null);
      };

      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    },
    [
      onSymbolPositionChange,
      effectiveSymbolPosition,
      resolvedOrientation,
      getNearestSlot,
    ],
  );

  // -----------------------------------------------------------------------
  // Bail out for degenerate geometry
  // -----------------------------------------------------------------------

  if (
    geometry.dots.length === 0 ||
    !isFinite(geometry.containerWidth) ||
    geometry.containerWidth <= 0
  ) {
    return null;
  }

  // -----------------------------------------------------------------------
  // Container sizing — hug-content, no absolute positioning.
  // Placement within the artboard is handled by the tldraw shape x/y.
  // -----------------------------------------------------------------------

  const svgW = resolvedOrientation === 'vertical'
    ? geometry.containerWidth
    : canvasWidth;

  const containerStyle: React.CSSProperties = {
    ...style,
    width: `${svgW}px`,
    height: `${geometry.containerHeight}px`,
  };

  const hasInteraction =
    variant === 'dots-with-symbol' && !!onSymbolPositionChange;

  const classNames = [styles.ribbon, className].filter(Boolean).join(' ');

  return (
    <div
      className={classNames}
      data-variant={variant}
      data-orientation={resolvedOrientation}
      data-placement={resolvedPlacement}
      data-name="Jio Ribbon"
      style={containerStyle}
    >
      <svg
        ref={svgRef}
        fill="none"
        width={svgW}
        height={geometry.containerHeight}
        viewBox={`0 0 ${svgW} ${geometry.containerHeight}`}
        preserveAspectRatio="none"
        className={styles.svg}
      >
        {symbolGradient && (
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              {symbolGradient.stops.map((s, i) => (
                <stop key={i} offset={s.offset} stopColor={s.color} />
              ))}
            </linearGradient>
          </defs>
        )}

        <g style={{ pointerEvents: 'none' }}>
          {geometry.dots.map((dot, i) => (
            <circle
              key={i}
              cx={dot.x}
              cy={dot.y}
              r={dot.radius}
              style={{ fill: dot.color }}
            />
          ))}

          {geometry.symbol && (
            <g
              transform={`translate(${geometry.symbol.cx}, ${geometry.symbol.cy})`}
              style={{
                pointerEvents: hasInteraction ? 'all' : 'none',
              }}
            >
              <rect
                width={geometry.symbol.size}
                height={geometry.symbol.size}
                rx={geometry.symbol.size / 2}
                style={{
                  fill: symbolGradient
                    ? `url(#${gradientId})`
                    : geometry.symbol.fillColor,
                }}
              />
              <g
                transform={`scale(${geometry.symbol.size / 32})`}
              >
                <path d={JIO_SYMBOL_PATH} fill="white" />
              </g>
              {hasInteraction && (
                <rect
                  width={geometry.symbol.size}
                  height={geometry.symbol.size}
                  fill="transparent"
                  style={{
                    cursor: isDragging ? 'grabbing' : 'grab',
                  }}
                  onMouseDown={handleSymbolMouseDown}
                />
              )}
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
