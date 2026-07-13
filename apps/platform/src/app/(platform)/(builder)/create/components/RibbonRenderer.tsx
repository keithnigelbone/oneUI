'use client';

import type React from 'react';
import styles from './RibbonRenderer.module.css';
import { JioRibbon, resolveOrientation, defaultPlacement } from '@/design-tools/JioRibbon';
import type { JioRibbonOrientation } from '@/design-tools/JioRibbon';
import { isJioRibbon } from '../lib/ribbon-schema';
import type { RibbonDataV1 } from '../lib/ribbon-schema';

interface RibbonRendererProps {
  data: unknown;
  /** Canvas dimensions for JioRibbon dynamic sizing (V1 dot-pattern) */
  canvasWidth?: number;
  canvasHeight?: number;
}

function ribbonPreviewPosition(
  orientation: JioRibbonOrientation,
  placement: string | undefined,
): React.CSSProperties {
  if (orientation === 'vertical') {
    const p = placement ?? 'right';
    return {
      position: 'absolute',
      top: 0,
      ...(p === 'left' ? { left: 0 } : p === 'center' ? { left: '50%', transform: 'translateX(-50%)' } : { right: 0 }),
    };
  }
  const p = placement ?? 'bottom';
  return {
    position: 'absolute',
    left: 0,
    ...(p === 'top' ? { top: 0 } : p === 'center' ? { top: '50%', transform: 'translateY(-50%)' } : { bottom: 0 }),
  };
}

/**
 * Ribbon renderer — routes V0 text-strip and V1 Jio dot-pattern ribbon data
 * to the appropriate visual representation.
 */
export function RibbonRenderer({ data, canvasWidth, canvasHeight }: RibbonRendererProps) {
  if (isJioRibbon(data)) {
    const ribbon = data as RibbonDataV1;
    const w = canvasWidth ?? 800;
    const h = canvasHeight ?? 400;
    const orientation = ribbon.orientation ?? resolveOrientation(w, h);
    const placement = ribbon.placement ?? defaultPlacement(orientation);

    return (
      <div
        className={styles.jioRibbonWrap}
        style={{
          position: 'relative',
          width: `${w}px`,
          height: `${h}px`,
          overflow: 'hidden',
          borderRadius: 'var(--Shape-4)',
          boxShadow: 'var(--Elevation-2)',
          background: 'var(--Surface-Default)',
        }}
      >
        <div style={ribbonPreviewPosition(orientation, placement)}>
          <JioRibbon
            variant={ribbon.variant}
            size={ribbon.size}
            orientation={ribbon.orientation}
            placement={ribbon.placement}
            canvasWidth={w}
            canvasHeight={h}
            color1={ribbon.color1}
            color2={ribbon.color2}
            color3={ribbon.color3}
            symbolPosition={ribbon.symbolPosition}
            symbolGradient={ribbon.symbolGradient}
          />
        </div>
      </div>
    );
  }

  const rec =
    data && typeof data === 'object' && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : null;
  const text = rec && typeof rec.text === 'string' ? rec.text : JSON.stringify(data ?? '');
  const variant =
    rec && (rec.variant === 'neutral' || rec.variant === 'accent' || rec.variant === 'inverse')
      ? rec.variant
      : 'neutral';

  return (
    <div
      className={styles.ribbon}
      data-variant={variant}
      data-part="marketing-ribbon"
      role="note"
    >
      {text}
    </div>
  );
}
