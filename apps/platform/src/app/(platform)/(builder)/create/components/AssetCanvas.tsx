'use client';

import type { CSSProperties, ReactNode } from 'react';
import styles from './AssetCanvas.module.css';

interface AssetCanvasProps {
  width: number;
  height: number;
  children: ReactNode;
  className?: string;
}

/**
 * Fixed-size artboard with token-based outer spacing (margins / gutters).
 */
export function AssetCanvas({ width, height, children, className }: AssetCanvasProps) {
  return (
    <div
      className={`${styles.wrap}${className ? ` ${className}` : ''}`}
      style={
        {
          '--create-canvas-w': `${width}px`,
          '--create-canvas-h': `${height}px`,
        } as CSSProperties
      }
    >
      <div className={styles.inner}>{children}</div>
    </div>
  );
}
