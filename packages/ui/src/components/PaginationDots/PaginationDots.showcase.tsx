'use client';

/**
 * PaginationDots.showcase.tsx
 *
 * Shared showcase sections for PaginationDots. Imported by both Storybook
 * stories and the platform documentation page — single source of truth.
 *
 * Rules:
 * - No Storybook imports
 * - No platform (app) imports
 * - All styling via CSS custom property tokens
 */

'use client';

import React, { useState } from 'react';
import { PaginationDots } from './PaginationDots';
import type { PaginationDotsAppearance } from './PaginationDots.shared';
import { Surface } from '../Surface';
import { Button } from '../Button';

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
  fontSize: 'var(--Typography-Size-XS, var(--Label-XS-FontSize))',
  color: 'var(--Text-Low)',
};

const sectionLabel: React.CSSProperties = {
  fontSize: 'var(--Typography-Size-S, var(--Label-S-FontSize))',
  color: 'var(--Text-High)',
  fontWeight: 'var(--Typography-Weight-Medium, var(--Label-FontWeight-Medium))',
};

// ─── 1. Default ───────────────────────────────────────────────────────────────

export function PaginationDotsDefault() {
  return (
    <PaginationDots
      pageCount={5}
      defaultActiveIndex={0}
      aria-label="Default pagination"
    />
  );
}

// ─── 2. Appearances ───────────────────────────────────────────────────────────

const APPEARANCES: readonly PaginationDotsAppearance[] = [
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

export function PaginationDotsAppearances() {
  return (
    <div style={column}>
      {APPEARANCES.map((appearance) => (
        <div key={appearance} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
          <span style={labelStyle}>{appearance}</span>
          <PaginationDots
            pageCount={5}
            defaultActiveIndex={2}
            appearance={appearance}
            aria-label={`${appearance} appearance`}
          />
        </div>
      ))}
    </div>
  );
}

// ─── 4. Loop vs Non-loop ──────────────────────────────────────────────────────

function LoopVsNonLoopColumn({
  loop,
  label,
  count = 12,
}: {
  loop: boolean;
  label: string;
  count?: number;
}) {
  const [active, setActive] = useState(0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)', alignItems: 'center', flex: 1 }}>
      <span style={sectionLabel}>{label}</span>
      <PaginationDots
        pageCount={count}
        activeIndex={active}
        onActiveIndexChange={setActive}
        loop={loop}
        aria-label={label}
      />
      <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)' }}>
        <Button
          size="s"
          attention="low"
          onClick={() =>
            setActive((a) => (loop ? (a - 1 + count) % count : Math.max(0, a - 1)))
          }
        >
          ‹ Prev
        </Button>
        <Button
          size="s"
          attention="low"
          onClick={() =>
            setActive((a) => (loop ? (a + 1) % count : Math.min(count - 1, a + 1)))
          }
        >
          Next ›
        </Button>
      </div>
      <span style={labelStyle}>
        {active + 1} / {count}
      </span>
    </div>
  );
}


export function PaginationDotsLoopVsNonLoop() {
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-5)', width: '100%', flexWrap: 'wrap' }}>
      <LoopVsNonLoopColumn loop={false} label="Non-loop (end state)" />
      <LoopVsNonLoopColumn loop={true} label="Loop (infinite)" />
    </div>
  );
}

// ─── 5. Long Sequence ─────────────────────────────────────────────────────────

export function PaginationDotsLongSequence() {
  const [active, setActive] = useState(0);
  const count = 20;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-4)' }}>
      <PaginationDots
        pageCount={count}
        activeIndex={active}
        onActiveIndexChange={setActive}
        aria-label="Long sequence"
      />
      <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', alignItems: 'center' }}>
        <Button size="s" attention="low" onClick={() => setActive(0)}>
          ⇤ First
        </Button>
        <Button
          size="s"
          attention="low"
          onClick={() => setActive((a) => Math.max(0, a - 1))}
        >
          ‹ Prev
        </Button>
        <span style={labelStyle}>
          Page {active + 1} / {count}
        </span>
        <Button
          size="s"
          attention="low"
          onClick={() => setActive((a) => Math.min(count - 1, a + 1))}
        >
          Next ›
        </Button>
        <Button size="s" attention="low" onClick={() => setActive(count - 1)}>
          Last ⇥
        </Button>
      </div>
    </div>
  );
}

// ─── 6. Interactive — fake carousel ───────────────────────────────────────────

export function PaginationDotsInteractive() {
  const count = 12;
  const [active, setActive] = useState(0);

  const cardStyle = (i: number): React.CSSProperties => ({
    flexShrink: 0,
    width: '240px',
    height: '140px',
    borderRadius: 'var(--Shape-4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'var(--Label-L-FontSize)',
    color: 'var(--Primary-Bold-High, var(--Text-OnBold-High))',
    fontWeight: 'var(--Label-FontWeight-High)',
    background: `var(--Primary-Bold, var(--Surface-Bold))`,
    opacity: i === active ? 1 : 0.35,
    transition:
      'opacity var(--Motion-Duration-M) var(--Motion-Easing-Transition-Moderate)',
    scrollSnapAlign: 'center',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)', width: '100%' }}>
      <div
        role="region"
        aria-label="Card carousel"
        style={{
          display: 'flex',
          gap: 'var(--Spacing-4)',
          padding: 'var(--Spacing-3-5)',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          borderRadius: 'var(--Shape-4)',
          background: 'var(--Surface-Minimal, var(--Surface-Main))',
        }}
      >
        {Array.from({ length: count }, (_, i) => (
          <div key={i} style={cardStyle(i)} aria-hidden={i !== active}>
            Slide {i + 1}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <PaginationDots
          pageCount={count}
          activeIndex={active}
          onActiveIndexChange={setActive}
          aria-label="Card carousel pagination"
        />
      </div>
    </div>
  );
}

// ─── 7. Read-only ─────────────────────────────────────────────────────────────

export function PaginationDotsReadOnly() {
  const [active, setActive] = useState(2);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)', alignItems: 'center' }}>
      <PaginationDots
        pageCount={8}
        activeIndex={active}
        readOnly
        aria-label="Read-only indicator"
      />
      <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)' }}>
        <Button
          size="s"
          attention="low"
          onClick={() => setActive((a) => Math.max(0, a - 1))}
        >
          ‹ Prev (external)
        </Button>
        <Button
          size="s"
          attention="low"
          onClick={() => setActive((a) => Math.min(7, a + 1))}
        >
          Next › (external)
        </Button>
      </div>
      <span style={labelStyle}>Dots are non-interactive; parent owns the state.</span>
    </div>
  );
}

// ─── 8. Degenerate cases ──────────────────────────────────────────────────────

export function PaginationDotsDegenerate() {
  return (
    <div style={column}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
        <span style={labelStyle}>count = 0 (empty root, no crash)</span>
        <div
          style={{
            minHeight: 'var(--Spacing-5)',
            border: 'var(--Stroke-M) dashed var(--Primary-Stroke-Low)',
            padding: 'var(--Spacing-3-5)',
            borderRadius: 'var(--Shape-3-5)',
          }}
        >
          <PaginationDots pageCount={0} aria-label="Empty" />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
        <span style={labelStyle}>count = 1</span>
        <PaginationDots pageCount={1} aria-label="Single page" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
        <span style={labelStyle}>count = 3 (short-sequence: count &lt; windowSize, all dots visible, no edge fade)</span>
        <PaginationDots pageCount={3} defaultActiveIndex={1} aria-label="Short" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
        <span style={labelStyle}>count = 2, loop</span>
        <PaginationDots pageCount={2} loop defaultActiveIndex={0} aria-label="Two items loop" />
      </div>
    </div>
  );
}

// ─── Focus State ──────────────────────────────────────────────────────────────

/**
 * Idle vs keyboard-focused state — uses data-force-state="focus" to render
 * the focus ring on the dot ::before pseudo-element without actual keyboard nav.
 */
export function PaginationDotsFocusState() {
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-5)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)', alignItems: 'center' }}>
        <PaginationDots pageCount={5} defaultActiveIndex={2} aria-label="Idle" />
        <span style={labelStyle}>Idle</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)', alignItems: 'center' }}>
        <div data-force-state="focus" style={{ display: 'inline-flex' }}>
          <PaginationDots pageCount={5} defaultActiveIndex={2} aria-label="Focused" />
        </div>
        <span style={labelStyle}>Focus</span>
      </div>
    </div>
  );
}

// ─── 9. Surface context ───────────────────────────────────────────────────────

/**
 * Background tokens use --Primary-Fill-* (root-only, never remapped inside
 * [data-surface] blocks) so the container shows the TRUE surface colour.
 * Using --Primary-Bold here would fail on the bold row because that token
 * is remapped by the brand CSS engine to its bold-inversion value — the
 * container and the active pill would collapse to the same colour.
 */
const PRIMARY_SURFACE_BG: Record<string, string> = {
  default: 'var(--Surface-Default, var(--Surface-Main))',
  minimal: 'var(--Primary-Fill-Minimal, var(--Surface-Minimal))',
  subtle: 'var(--Primary-Fill-Subtle, var(--Surface-Subtle))',
  moderate: 'var(--Primary-Fill-Moderate, var(--Surface-Subtle))',
  bold: 'var(--Primary-Fill-Bold, var(--Surface-Bold))',
  elevated: 'var(--Primary-Fill-Elevated, var(--Surface-Elevated))',
};

export function PaginationDotsSurfaceContext() {
  const surfaceModes = [
    { mode: 'default' as const, label: 'default', desc: 'page background' },
    { mode: 'minimal' as const, label: 'minimal', desc: 'light tint' },
    { mode: 'subtle' as const, label: 'subtle', desc: 'medium tint' },
    { mode: 'moderate' as const, label: 'moderate', desc: 'heavier tint' },
    { mode: 'bold' as const, label: 'bold', desc: 'full accent — active pill inverts to on-colour' },
    { mode: 'elevated' as const, label: 'elevated', desc: 'floating card / popover' },
  ];

  const surfaceStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--Spacing-5)',
    borderRadius: 'var(--Shape-4)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      {surfaceModes.map(({ mode, label, desc }) => (
        <div key={mode} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
          <span style={labelStyle}>{label} — {desc}</span>
          <Surface
            mode={mode}
            style={{ ...surfaceStyle, backgroundColor: PRIMARY_SURFACE_BG[mode] }}
          >
            <PaginationDots
              pageCount={9}
              defaultActiveIndex={4}
              aria-label={`${label} surface`}
            />
          </Surface>
        </div>
      ))}
    </div>
  );
}