/**
 * CubicBezierEditor
 *
 * Interactive SVG-based cubic bezier curve editor with draggable control points.
 * Supports per-point locking (entrance = P2 only, exit = P1 only, etc.)
 * and read-only mode for system brands.
 */

'use client';

import { memo, useCallback, useRef, useState, useEffect } from 'react';
import { parseCubicBezier } from '@oneui/shared';
import styles from './CubicBezierEditor.module.css';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CubicBezierEditorProps {
  /** CSS cubic-bezier string, e.g. "cubic-bezier(0.25, 0.8, 0.5, 1)" */
  value: string;
  /** Called when dragging, keyboard, or text input updates the curve */
  onChange: (value: string) => void;
  /** Read-only mode — curve visible but no drag handles or editing */
  readOnly?: boolean;
  /** Which control points are locked (not draggable) */
  lockedPoints?: { p1?: boolean; p2?: boolean };
  /** Warning message displayed below the graph */
  warning?: string;
  /** Called when reset button is pressed */
  onReset?: () => void;
  /** Easing type label shown above the graph column (e.g. "Entrance") */
  typeLabel?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SVG_SIZE = 200;
const PADDING = 20;
const GRAPH_MIN = PADDING;
const GRAPH_MAX = SVG_SIZE - PADDING;
const GRAPH_RANGE = GRAPH_MAX - GRAPH_MIN;
const HANDLE_RADIUS = 5;
const HANDLE_RADIUS_LOCKED = 3;
const KEYBOARD_STEP = 0.01;
const KEYBOARD_STEP_SHIFT = 0.05;

// ─── Coordinate mapping ─────────────────────────────────────────────────────

function getYBounds(y1: number, y2: number): { minY: number; maxY: number } {
  const minVal = Math.min(0, y1, y2);
  const maxVal = Math.max(1, y1, y2);
  const yPad = 0.1;
  return { minY: minVal - yPad, maxY: maxVal + yPad };
}

function toSvgX(bx: number): number {
  return GRAPH_MIN + bx * GRAPH_RANGE;
}

function toSvgY(by: number, minY: number, maxY: number): number {
  const t = (by - minY) / (maxY - minY);
  return GRAPH_MAX - t * GRAPH_RANGE;
}

function fromSvgX(sx: number): number {
  return (sx - GRAPH_MIN) / GRAPH_RANGE;
}

function fromSvgY(sy: number, minY: number, maxY: number): number {
  const t = (GRAPH_MAX - sy) / GRAPH_RANGE;
  return minY + t * (maxY - minY);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function formatBezier(pts: [number, number, number, number]): string {
  return `cubic-bezier(${pts.map(v => round2(v)).join(', ')})`;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/**
 * Evaluate a CSS cubic-bezier at evenly spaced time intervals.
 * Returns an array of progress values (0–1) representing where
 * the animated element would be at each time sample.
 */
function sampleBezierEasing(
  x1: number, y1: number, x2: number, y2: number, count: number,
): number[] {
  const results: number[] = [];
  for (let i = 1; i < count; i++) {
    const t = i / count;
    // Find parameter s where X(s) ≈ t using Newton's method
    let s = t;
    for (let j = 0; j < 8; j++) {
      const xs = 3 * (1 - s) * (1 - s) * s * x1 + 3 * (1 - s) * s * s * x2 + s * s * s;
      const dxs = 3 * (1 - s) * (1 - s) * x1 + 6 * (1 - s) * s * (x2 - x1) + 3 * s * s * (1 - x2);
      if (Math.abs(dxs) < 1e-6) break;
      s -= (xs - t) / dxs;
      s = Math.max(0, Math.min(1, s));
    }
    const ys = 3 * (1 - s) * (1 - s) * s * y1 + 3 * (1 - s) * s * s * y2 + s * s * s;
    results.push(ys * 100);
  }
  return results;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const CubicBezierEditor = memo(function CubicBezierEditor({
  value,
  onChange,
  readOnly = false,
  lockedPoints = {},
  warning,
  onReset,
  typeLabel,
}: CubicBezierEditorProps) {
  const parsed = parseCubicBezier(value);
  const [x1, y1, x2, y2] = parsed ?? [0, 0, 1, 1];

  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<'p1' | 'p2' | null>(null);
  // Animation phases: idle → forward → showReturn → return → idle
  const [phase, setPhase] = useState<'idle' | 'forward' | 'showReturn' | 'return'>('idle');
  const [forwardTrail, setForwardTrail] = useState<number[]>([]);
  const [returnTrail, setReturnTrail] = useState<number[]>([]);
  const [showForwardTrail, setShowForwardTrail] = useState(false);
  const [showReturnTrail, setShowReturnTrail] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const { minY, maxY } = getYBounds(y1, y2);

  // SVG positions
  const p0 = { x: toSvgX(0), y: toSvgY(0, minY, maxY) };
  const p1 = { x: toSvgX(x1), y: toSvgY(y1, minY, maxY) };
  const p2 = { x: toSvgX(x2), y: toSvgY(y2, minY, maxY) };
  const p3 = { x: toSvgX(1), y: toSvgY(1, minY, maxY) };

  const canDragP1 = !readOnly && !lockedPoints.p1;
  const canDragP2 = !readOnly && !lockedPoints.p2;

  // Pre-computed static trail for hover preview and return trail
  const TRAIL_SAMPLES = 12;
  const staticTrail = sampleBezierEasing(x1, y1, x2, y2, TRAIL_SAMPLES);
  const staticReturnTrail = staticTrail.map(pct => {
    const max = staticTrail.length > 0 ? Math.max(...staticTrail) : 100;
    return max - pct;
  }).reverse();

  const ANIM_DURATION = 600;
  const FADE_DURATION = 300;

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Hover: show pre-computed forward trail
  const handleTrackEnter = useCallback(() => {
    if (phase === 'idle') {
      setForwardTrail(staticTrail);
      setShowForwardTrail(true);
    }
  }, [phase, staticTrail]);

  const handleTrackLeave = useCallback(() => {
    if (phase === 'idle') {
      setShowForwardTrail(false);
    }
  }, [phase]);

  // Click sequence:
  // 1. Forward trail visible (already from hover), dot moves forward
  // 2. Dot arrives → forward trail fades out
  // 3. Return trail fades in
  // 4. Dot returns
  // 5. Return trail fades out → idle
  const triggerAnimation = useCallback(() => {
    if (phase !== 'idle') return;

    setForwardTrail(staticTrail);
    setReturnTrail([]);
    setShowForwardTrail(true);
    setShowReturnTrail(false);
    setPhase('forward');

    timerRef.current = setTimeout(() => {
      // Forward complete — fade out forward trail
      setShowForwardTrail(false);

      timerRef.current = setTimeout(() => {
        // Show return trail, then dot returns
        setForwardTrail([]);
        setReturnTrail(staticReturnTrail);
        setShowReturnTrail(true);
        setPhase('showReturn');

        timerRef.current = setTimeout(() => {
          setPhase('return');

          timerRef.current = setTimeout(() => {
            // Return complete — fade out return trail
            setShowReturnTrail(false);

            timerRef.current = setTimeout(() => {
              setReturnTrail([]);
              setPhase('idle');
            }, FADE_DURATION);
          }, ANIM_DURATION);
        }, 100);
      }, FADE_DURATION);
    }, ANIM_DURATION);
  }, [phase, staticTrail, staticReturnTrail]);

  const getSvgPoint = useCallback((e: { clientX: number; clientY: number }) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const inv = ctm.inverse();
    return {
      x: e.clientX * inv.a + e.clientY * inv.c + inv.e,
      y: e.clientX * inv.b + e.clientY * inv.d + inv.f,
    };
  }, []);

  const updatePoint = useCallback(
    (point: 'p1' | 'p2', sx: number, sy: number) => {
      const bx = clamp01(round2(fromSvgX(sx)));
      const by = round2(fromSvgY(sy, minY, maxY));
      const newPts: [number, number, number, number] =
        point === 'p1' ? [bx, by, x2, y2] : [x1, y1, bx, by];
      onChange(formatBezier(newPts));
    },
    [x1, y1, x2, y2, minY, maxY, onChange],
  );

  const handlePointerDown = useCallback(
    (point: 'p1' | 'p2') => (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as Element).setPointerCapture(e.pointerId);
      dragRef.current = point;
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const pt = getSvgPoint(e);
      if (!pt) return;
      updatePoint(dragRef.current, pt.x, pt.y);
    },
    [getSvgPoint, updatePoint],
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handlePreviewKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerAnimation();
    }
  }, [triggerAnimation]);

  const handleKeyDown = useCallback(
    (point: 'p1' | 'p2') => (e: React.KeyboardEvent) => {
      const step = e.shiftKey ? KEYBOARD_STEP_SHIFT : KEYBOARD_STEP;
      const [cx, cy] = point === 'p1' ? [x1, y1] : [x2, y2];
      let nx = cx;
      let ny = cy;

      switch (e.key) {
        case 'ArrowLeft':
          nx = clamp01(round2(cx - step));
          break;
        case 'ArrowRight':
          nx = clamp01(round2(cx + step));
          break;
        case 'ArrowUp':
          ny = round2(cy + step);
          break;
        case 'ArrowDown':
          ny = round2(cy - step);
          break;
        default:
          return;
      }
      e.preventDefault();
      const newPts: [number, number, number, number] =
        point === 'p1' ? [nx, ny, x2, y2] : [x1, y1, nx, ny];
      onChange(formatBezier(newPts));
    },
    [x1, y1, x2, y2, onChange],
  );

  return (
    <div className={styles.container}>
      {/* Type label (e.g. "Entrance") — only shown when provided */}
      {typeLabel && <span className={styles.typeLabel}>{typeLabel}</span>}

      {/* SVG graph */}
      <div className={styles.svgContainer}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          className={styles.svg}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Background */}
          <rect
            x={0} y={0}
            width={SVG_SIZE} height={SVG_SIZE}
            rx={12} ry={12}
            fill="transparent"
          />

          {/* Control lines — solid, thin */}
          <line
            x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y}
            stroke="var(--Primary-Tinted)" strokeWidth={1} opacity={0.4}
          />
          <line
            x1={p3.x} y1={p3.y} x2={p2.x} y2={p2.y}
            stroke="var(--Primary-Tinted)" strokeWidth={1} opacity={0.4}
          />

          {/* Bezier curve */}
          <path
            d={`M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`}
            fill="none" stroke="var(--Primary-Bold)" strokeWidth={1.5}
          />

          {/* P1 handle */}
          <circle
            cx={p1.x} cy={p1.y}
            r={canDragP1 ? HANDLE_RADIUS : HANDLE_RADIUS_LOCKED}
            fill={canDragP1 ? 'var(--Primary-Bold)' : 'var(--Primary-Tinted)'}
            style={{ cursor: canDragP1 ? 'grab' : 'default', opacity: lockedPoints.p1 ? 0.3 : 1 }}
            onPointerDown={canDragP1 ? handlePointerDown('p1') : undefined}
            onKeyDown={canDragP1 ? handleKeyDown('p1') : undefined}
            tabIndex={canDragP1 ? 0 : undefined}
            role={canDragP1 ? 'slider' : undefined}
            aria-label={canDragP1 ? `Ease-in control point: ${round2(x1)}, ${round2(y1)}` : undefined}
          />

          {/* P2 handle */}
          <circle
            cx={p2.x} cy={p2.y}
            r={canDragP2 ? HANDLE_RADIUS : HANDLE_RADIUS_LOCKED}
            fill={canDragP2 ? 'var(--Primary-Bold)' : 'var(--Primary-Tinted)'}
            style={{ cursor: canDragP2 ? 'grab' : 'default', opacity: lockedPoints.p2 ? 0.3 : 1 }}
            onPointerDown={canDragP2 ? handlePointerDown('p2') : undefined}
            onKeyDown={canDragP2 ? handleKeyDown('p2') : undefined}
            tabIndex={canDragP2 ? 0 : undefined}
            role={canDragP2 ? 'slider' : undefined}
            aria-label={canDragP2 ? `Ease-out control point: ${round2(x2)}, ${round2(y2)}` : undefined}
          />
        </svg>
      </div>

      {/* Editable value + reset button */}
      <div className={styles.valueRow}>
        {readOnly ? (
          <code className={styles.valueText}>{value}</code>
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={styles.valueInput}
          />
        )}
        {!readOnly && onReset && (
          <button
            type="button"
            className={styles.resetButton}
            onClick={onReset}
            title="Reset to default"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 105.64-11.36L1 10" />
            </svg>
          </button>
        )}
      </div>

      {/* Full-width circle animation preview with trail */}
      <div
        ref={trackRef}
        className={`${styles.animationTrack} ${phase !== 'idle' ? styles.trackHovered : ''}`}
        onClick={triggerAnimation}
        onKeyDown={handlePreviewKeyDown}
        onMouseEnter={handleTrackEnter}
        onMouseLeave={handleTrackLeave}
        role="button"
        tabIndex={0}
        aria-label="Preview easing animation"
        title="Click to preview easing"
      >
        {/* Start marker — centered under dot's start position */}
        <div className={styles.marker} style={{ left: 'calc(var(--Spacing-6) / 2)' }} />
        {/* End marker — centered under dot's end position */}
        <div className={styles.marker} style={{ left: 'calc(100% - var(--Spacing-6) / 2)' }} />

        {/* Forward trail */}
        <div className={`${styles.trailContainer} ${showForwardTrail ? styles.trailVisible : ''}`}>
          {forwardTrail.map((pct, i) => (
            <div key={`f${i}`} className={styles.trailDot} style={{ left: `${pct}%` }} />
          ))}
        </div>

        {/* Return trail */}
        <div className={`${styles.trailContainer} ${showReturnTrail ? styles.trailVisible : ''}`}>
          {returnTrail.map((pct, i) => (
            <div key={`r${i}`} className={styles.trailDot} style={{ left: `${pct}%` }} />
          ))}
        </div>

        {/* Main dot */}
        <div
          data-dot
          className={styles.animationDot}
          style={{
            left: phase === 'forward' || phase === 'showReturn'
              ? 'calc(100% - var(--Spacing-6))'
              : '0',
            transition: phase === 'forward' || phase === 'return'
              ? `left ${ANIM_DURATION}ms ${value}, transform 300ms var(--Motion-Easing-Transition-Moderate, ease)`
              : undefined,
          }}
        />
      </div>

      {warning && (
        <div className={styles.warning}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          {warning}
        </div>
      )}
    </div>
  );
});
