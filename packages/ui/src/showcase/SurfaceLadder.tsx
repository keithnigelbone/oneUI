/**
 * SurfaceLadder.tsx
 *
 * Shared documentation primitive: renders its content once per surface mode
 * (default → minimal → subtle → moderate → bold → elevated) so every component
 * doc shows how the component adapts across the surface ladder.
 *
 * This is the single source of truth for the "Variants on Surfaces" section —
 * consumed by both the platform component docs and Storybook stories, so the
 * two never drift. Because each row is a real `<Surface mode>`, the tokens
 * inside remap via the `[data-surface]` cascade exactly as they do in the app.
 *
 * Rules (mirrors *.showcase.tsx):
 * - No Storybook imports, no platform (app) imports
 * - All styling via CSS custom property tokens (no literals except layout px)
 * - No decorative strokes on the Surface rows — the tinted fill is the boundary
 */

import React from 'react';
import { Surface, type SurfaceMode } from '../components/Surface';

/** The canonical documentation ladder — one row per surface token. */
export const SURFACE_LADDER_MODES: SurfaceMode[] = [
  'default',
  'minimal',
  'subtle',
  'moderate',
  'bold',
  'elevated',
];

export interface SurfaceLadderProps {
  /** Row content, rendered identically inside every surface row. */
  children: React.ReactNode;
  /** Surface modes to render, in order. Defaults to the full 6-mode ladder. */
  modes?: SurfaceMode[];
  /** Optional per-mode label overrides. Defaults to the capitalized mode name. */
  labels?: Partial<Record<SurfaceMode, string>>;
}

const column: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-3-5)',
  width: '100%',
};

const rowSurface: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 'var(--Spacing-4)',
  width: '100%',
  padding: 'var(--Spacing-4)',
  borderRadius: 'var(--Shape-4)',
};

const labelStyle: React.CSSProperties = {
  minWidth: 'var(--Spacing-16)',
  margin: 0,
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-XS-FontSize)',
  lineHeight: 'var(--Label-XS-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Medium)',
  color: 'var(--Text-High)',
};

const contentStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--Spacing-3-5)',
  flex: 1,
};

const capitalize = (mode: string): string => mode.charAt(0).toUpperCase() + mode.slice(1);

/**
 * Render `children` once per surface mode, each inside a real `<Surface>` so
 * descendant tokens remap for that surface. Every documented interactive
 * component should expose a `<Name>SurfaceShowcase` built on this.
 */
export function SurfaceLadder({
  children,
  modes = SURFACE_LADDER_MODES,
  labels,
}: SurfaceLadderProps) {
  return (
    <div style={column}>
      {modes.map((mode) => {
        const label = labels?.[mode] ?? capitalize(mode);
        return (
          <Surface key={mode} mode={mode} style={rowSurface}>
            <span style={labelStyle}>{label}</span>
            <div style={contentStyle}>{children}</div>
          </Surface>
        );
      })}
    </div>
  );
}
