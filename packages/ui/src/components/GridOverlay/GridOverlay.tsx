'use client';

import { useEffect, useState } from 'react';
import styles from './GridOverlay.module.css';

export interface GridOverlayProps {
  /**
   * Whether the overlay is visible. When undefined, the overlay reads the
   * `?grid=1` query param on mount and listens for `Cmd/Ctrl+G` to toggle.
   */
  visible?: boolean;
  /**
   * Opacity of each column stripe (0-1). Default: 0.12.
   */
  opacity?: number;
  className?: string;
}

/**
 * GridOverlay — diagnostic overlay that renders the live grid (columns,
 * gutters, margin) on top of the page. Use this to verify alignment during
 * composition. Reads the same tokens as `<Grid>` / `<Container>` so it
 * automatically tracks platform, density, and brand overrides.
 *
 * Toggle via `?grid=1` in the URL or the `Cmd/Ctrl+G` keyboard shortcut.
 */
export function GridOverlay({ visible, opacity = 0.12, className }: GridOverlayProps) {
  const [internalVisible, setInternalVisible] = useState(false);

  useEffect(() => {
    if (visible !== undefined) return;
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('grid') === '1') setInternalVisible(true);

    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setInternalVisible((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible]);

  const isVisible = visible ?? internalVisible;
  if (!isVisible) return null;

  const classNames = [styles.overlay, className].filter(Boolean).join(' ');

  return (
    <div
      className={classNames}
      aria-hidden
      style={{ ['--_overlay-opacity' as string]: String(opacity) }}
    >
      <div className={styles.inner}>
        <div className={styles.grid} />
      </div>
    </div>
  );
}
