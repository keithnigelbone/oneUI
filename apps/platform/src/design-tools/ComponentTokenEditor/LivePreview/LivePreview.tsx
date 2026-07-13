/**
 * LivePreview.tsx
 *
 * Live preview container that applies token overrides.
 */

'use client';

import React, { useMemo } from 'react';
import { ContextSwitcher } from './ContextSwitcher';
import type { LivePreviewProps } from '../types';
import styles from '../PropertyPanel/PropertyPanel.module.css';

/**
 * LivePreview Component
 *
 * Container that renders a component preview with applied token overrides.
 */
export function LivePreview({
  children,
  mode,
  previewState,
  tokenOverrides,
  onModeChange,
  onStateChange,
  className,
}: LivePreviewProps) {
  // Convert token overrides to CSS custom properties
  const previewStyles = useMemo(() => {
    const cssVars: Record<string, string> = {};

    for (const [varName, value] of Object.entries(tokenOverrides)) {
      cssVars[varName] = value;
    }

    return cssVars;
  }, [tokenOverrides]);

  return (
    <div className={`${styles.previewSection} ${className || ''}`}>
      <div className={styles.previewTitle}>Live Preview</div>

      <ContextSwitcher
        mode={mode}
        previewState={previewState}
        onModeChange={onModeChange}
        onStateChange={onStateChange}
      />

      <div
        className={styles.previewContainer}
        style={previewStyles}
        data-mode={mode}
        data-state={previewState}
      >
        {children}
      </div>
    </div>
  );
}
