/**
 * PaginationDotsPreview.tsx
 *
 * Single-source-of-truth preview component for the Component Token Editor.
 * PaginationDots has a single size (M, Figma spec), so this renders a
 * representative windowed sequence at count=10 so designers can see the
 * active pill and edge dots while adjusting tokens.
 */

'use client';

import React, { useState } from 'react';
import { PaginationDots } from './PaginationDots';
import type { PaginationDotsAppearance } from './PaginationDots.shared';

export interface PaginationDotsPreviewProps {
  /** CSS custom property overrides to apply to the preview container */
  tokens: Record<string, string>;
  /** Appearance role to preview */
  appearance?: PaginationDotsAppearance;
  /** Number of pages in the preview. Default 10. */
  pageCount?: number;
}

export function PaginationDotsPreview({
  tokens,
  appearance,
  pageCount = 10,
}: PaginationDotsPreviewProps) {
  const [active, setActive] = useState(3);

  return (
    <div
      style={{
        ...tokens,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--Spacing-4-5)',
      }}
    >
      <PaginationDots
        pageCount={pageCount}
        activeIndex={active}
        onActiveIndexChange={setActive}
        appearance={appearance}
        aria-label="Preview"
      />
    </div>
  );
}

export default PaginationDotsPreview;
