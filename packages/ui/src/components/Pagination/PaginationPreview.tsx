/**
 * PaginationPreview.tsx
 *
 * Single-source-of-truth preview component for the Component Token Editor.
 * Renders a representative Pagination so designers can see all the visual
 * pieces (selected page, ghost numbers, prev/next buttons, ellipsis) while
 * adjusting tokens.
 */

'use client';

import React, { useState } from 'react';
import { Pagination } from './Pagination';
import type {
  PaginationAppearance,
  PaginationAttention,
  PaginationSize,
} from './Pagination.shared';

export interface PaginationPreviewProps {
  /** CSS custom property overrides applied to the preview container. */
  tokens: Record<string, string>;
  /** Appearance role to preview. */
  appearance?: PaginationAppearance;
  /** Attention level. Default `'medium'`. */
  attention?: PaginationAttention;
  /** Size. Default `'M'`. */
  size?: PaginationSize;
  /** Total pages used in the preview. Default 12. */
  totalPages?: number;
  /** Whether to render the first/last jump buttons in the preview. */
  showFirstLast?: boolean;
}

export function PaginationPreview({
  tokens,
  appearance,
  attention = 'medium',
  size = 'M',
  totalPages = 12,
  showFirstLast = false,
}: PaginationPreviewProps) {
  const [page, setPage] = useState(4);

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
      <Pagination
        totalPages={totalPages}
        page={page}
        onPageChange={setPage}
        appearance={appearance}
        attention={attention}
        size={size}
        showPrevNext
        showFirstLast={showFirstLast}
        siblingCount={1}
        boundaryCount={1}
        aria-label="Preview pagination"
      />
    </div>
  );
}

export default PaginationPreview;
