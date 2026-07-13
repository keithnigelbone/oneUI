'use client';

/**
 * Pagination.showcase.tsx
 *
 * Shared showcase sections for Pagination + PaginationItem. Imported by
 * both Storybook stories and the platform documentation page — one source
 * of truth, no Storybook or platform imports.
 *
 * Rules (matches Text.showcase.tsx / PaginationDots.showcase.tsx):
 *   - No Storybook imports
 *   - No platform (app) imports
 *   - All styling via CSS custom property tokens
 */

'use client';

import React, { useState } from 'react';
import { Pagination } from './Pagination';
import { PaginationItem } from './PaginationItem';
import type {
  PaginationAppearance,
  PaginationAttention,
  PaginationSize,
} from './Pagination.shared';
import { Surface } from '../Surface';

// ─── Shared layout helpers ────────────────────────────────────────────────────

const column: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-4-5)',
  alignItems: 'flex-start',
};

const row: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--Spacing-4)',
  flexWrap: 'wrap',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-XS-FontSize)',
  lineHeight: 'var(--Label-XS-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Low)',
  color: 'var(--Text-Low)',
};

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-S-FontSize)',
  lineHeight: 'var(--Label-S-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Medium)',
  color: 'var(--Text-High)',
};

const ATTENTIONS: readonly PaginationAttention[] = ['high', 'medium', 'low'];
const SIZES: readonly PaginationSize[] = ['S', 'M', 'L'];

const APPEARANCES: readonly PaginationAppearance[] = [
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'brand-bg',
  'positive',
  'negative',
  'warning',
  'informative',
];

// ─── 1. Default ───────────────────────────────────────────────────────────────

export function PaginationDefault() {
  return (
    <Pagination
      totalPages={10}
      defaultPage={1}
      aria-label="Default pagination"
    />
  );
}

// ─── 2. Sizes × Attention ─────────────────────────────────────────────────────

export function PaginationSizesAttention() {
  return (
    <div style={column}>
      {ATTENTIONS.map((attention) => (
        <div key={attention} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
          <span style={sectionLabel}>attention = {attention}</span>
          {SIZES.map((size) => (
            <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)' }}>
              <span style={labelStyle}>size = {size}</span>
              <Pagination
                totalPages={12}
                defaultPage={4}
                attention={attention}
                size={size}
                aria-label={`${attention} ${size}`}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── 3. Appearances ───────────────────────────────────────────────────────────

export function PaginationAppearances() {
  return (
    <div style={column}>
      {APPEARANCES.map((appearance) => (
        <div key={appearance} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
          <span style={labelStyle}>{appearance}</span>
          <Pagination
            totalPages={12}
            defaultPage={4}
            appearance={appearance}
            aria-label={`${appearance} appearance`}
          />
        </div>
      ))}
    </div>
  );
}

// ─── 4. Controlled ────────────────────────────────────────────────────────────

export function PaginationControlled() {
  const [page, setPage] = useState(7);
  return (
    <div style={{ ...column, alignItems: 'center' }}>
      <Pagination
        totalPages={20}
        page={page}
        onPageChange={setPage}
        siblingCount={1}
        boundaryCount={1}
        aria-label="Controlled pagination"
      />
      <span style={labelStyle}>Current page: {page}</span>
    </div>
  );
}

// ─── 5. With first/last + many pages ──────────────────────────────────────────

export function PaginationWithFirstLast() {
  return (
    <Pagination
      totalPages={50}
      defaultPage={25}
      siblingCount={1}
      boundaryCount={1}
      showFirstLast
      showPrevNext
      aria-label="Big sequence with first/last"
    />
  );
}

// ─── 6. Edge cases ────────────────────────────────────────────────────────────

export function PaginationEdgeCases() {
  return (
    <div style={column}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
        <span style={labelStyle}>1 page</span>
        <Pagination totalPages={1} defaultPage={1} aria-label="Single page" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
        <span style={labelStyle}>2 pages</span>
        <Pagination totalPages={2} defaultPage={1} aria-label="Two pages" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
        <span style={labelStyle}>5 pages (no ellipsis)</span>
        <Pagination totalPages={5} defaultPage={3} aria-label="Five pages" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
        <span style={labelStyle}>Disabled</span>
        <Pagination totalPages={10} defaultPage={4} disabled aria-label="Disabled" />
      </div>
    </div>
  );
}

// ─── 7. Surface context ──────────────────────────────────────────────────────

export function PaginationSurfaceContext() {
  return (
    <div style={column}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
        <span style={sectionLabel}>default surface</span>
        <Pagination totalPages={12} defaultPage={4} aria-label="On default surface" />
      </div>

      <Surface mode="subtle" style={{ padding: 'var(--Spacing-4-5)', borderRadius: 'var(--Shape-S)' }}>
        <span style={{ ...sectionLabel, display: 'block', marginBottom: 'var(--Spacing-2-5)' }}>
          subtle surface
        </span>
        <Pagination totalPages={12} defaultPage={4} aria-label="On subtle surface" />
      </Surface>

      <Surface mode="moderate" style={{ padding: 'var(--Spacing-4-5)', borderRadius: 'var(--Shape-S)' }}>
        <span style={{ ...sectionLabel, display: 'block', marginBottom: 'var(--Spacing-2-5)' }}>
          moderate surface
        </span>
        <Pagination totalPages={12} defaultPage={4} aria-label="On moderate surface" />
      </Surface>

      <Surface mode="bold" style={{ padding: 'var(--Spacing-4-5)', borderRadius: 'var(--Shape-S)' }}>
        <span style={{ ...sectionLabel, display: 'block', marginBottom: 'var(--Spacing-2-5)' }}>
          bold surface
        </span>
        <Pagination totalPages={12} defaultPage={4} aria-label="On bold surface" />
      </Surface>
    </div>
  );
}

// ─── 8. Standalone PaginationItem ────────────────────────────────────────────

export function PaginationItemShowcase() {
  return (
    <div style={column}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
        <span style={sectionLabel}>Numbered (selected vs not, all attentions)</span>
        <div style={row}>
          {ATTENTIONS.map((attention) => (
            <div key={attention} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)', alignItems: 'center' }}>
              <span style={labelStyle}>{attention}</span>
              <div style={row}>
                <PaginationItem page={3} attention={attention} aria-label="Page 3" />
                <PaginationItem page={4} attention={attention} selected aria-label="Page 4 (selected)" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
        <span style={sectionLabel}>Sizes</span>
        <div style={row}>
          {SIZES.map((size) => (
            <PaginationItem key={size} page={1} size={size} selected aria-label={`Size ${size}`} />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
        <span style={sectionLabel}>Nav + ellipsis (composite `Pagination`)</span>
        <div style={row}>
          <Pagination totalPages={15} defaultPage={8} showFirstLast aria-label="Showcase nav row" />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
        <span style={sectionLabel}>Disabled nav (composite)</span>
        <div style={row}>
          <Pagination totalPages={10} defaultPage={1} disabled showFirstLast aria-label="Disabled nav" />
        </div>
      </div>
    </div>
  );
}

// ─── 9. Focus state (forced, for visual review) ──────────────────────────────

export function PaginationFocusState() {
  return (
    <div style={{ ...column, alignItems: 'flex-start' }} data-force-state="focus">
      <span style={labelStyle}>data-force-state="focus" — preview the halo</span>
      <Pagination totalPages={10} defaultPage={4} aria-label="Focused" />
    </div>
  );
}