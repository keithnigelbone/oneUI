/**
 * ComponentHarness.tsx
 *
 * Thin wrapper that standardizes the rendering context for component previews.
 * Handles what EditorCanvas currently does ad-hoc:
 * - Sets data-platform, data-density attributes
 * - Applies platformTokens and tokenOverrides as inline CSS custom properties
 * - Optionally wraps in <Surface> for surface context
 * - Provides CanvasContext for opt-in behavior suppression
 *
 * Does NOT handle drag, positioning, or canvas chrome (that stays in EditorCanvas).
 */

'use client';

import { useRef, useLayoutEffect, type CSSProperties, type ReactNode } from 'react';
import type { SurfaceToken } from '@oneui/shared/engine';
import { Surface } from '../Surface';
import { CanvasContext, type CanvasContextValue } from '../../contexts/CanvasContext';
import styles from './ComponentHarness.module.css';

export interface ComponentHarnessProps {
  /** Surface mode — wraps children in <Surface> when set */
  surfaceMode?: SurfaceToken;
  /** Platform identifier for data-Breakpoint attribute */
  platform?: string;
  /** Density mode for data-density attribute */
  density?: string;
  /** Platform-specific dimension tokens as CSS custom properties */
  platformTokens?: Record<string, string>;
  /** Token overrides (brand/recipe) as CSS custom properties */
  tokenOverrides?: Record<string, string>;
  /** Whether to suppress interactions in child components */
  suppressInteractions?: boolean;
  /** Whether to suppress side effects in child components */
  suppressSideEffects?: boolean;
  /** Additional class name */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
  children: ReactNode;
}

const CANVAS_CONTEXT: CanvasContextValue = {
  isCanvas: true,
  suppressInteractions: false,
  suppressSideEffects: false,
};

export function ComponentHarness({
  surfaceMode,
  platform,
  density,
  platformTokens,
  tokenOverrides,
  suppressInteractions = false,
  suppressSideEffects = false,
  className,
  style,
  children,
}: ComponentHarnessProps) {
  const inlineStyle: CSSProperties = {
    ...style,
    ...platformTokens,
    ...tokenOverrides,
  };

  const classNames = [styles.harness, className].filter(Boolean).join(' ');

  const canvasValue: CanvasContextValue =
    suppressInteractions || suppressSideEffects
      ? { isCanvas: true, suppressInteractions, suppressSideEffects }
      : CANVAS_CONTEXT;

  const content = surfaceMode ? (
    <Surface mode={surfaceMode}>{children}</Surface>
  ) : (
    children
  );

  // React lowercases data-* JSX attributes (data-Breakpoint → data-breakpoint).
  // scale.css selectors are case-sensitive, so we use setAttribute to preserve
  // the mixed-case name that scale.css expects.
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Canonical S/M/L breakpoint attribute (drives scale.css [data-Breakpoint] +
    // brand grid/dimension overrides).
    if (platform === 'S' || platform === 'M' || platform === 'L') {
      el.setAttribute('data-Breakpoint', platform);
    } else {
      el.removeAttribute('data-Breakpoint');
    }
    if (density) {
      el.setAttribute('data-density', density);
      el.setAttribute('data-6-Density', density);
    } else {
      el.removeAttribute('data-density');
      el.removeAttribute('data-6-Density');
    }
  }, [platform, density]);

  return (
    <CanvasContext.Provider value={canvasValue}>
      <div
        ref={ref}
        className={classNames}
        style={inlineStyle}
      >
        {content}
      </div>
    </CanvasContext.Provider>
  );
}
