/**
 * Shared Storybook demo content for `Container` — token-only visuals.
 */

import type { CSSProperties, ReactNode } from 'react';
import type { SurfaceToken } from '@oneui/shared/engine';

/**
 * Six surface steps for the nested showcase: `subtle` … `moderate`, **`bold`**, `ghost`.
 * Omits `elevated` / `blend` (engine-only / special cases for this layout demo).
 */
export const NESTED_SURFACE_DEMO_MODES = [
  'subtle',
  'default',
  'minimal',
  'moderate',
  'bold',
  'ghost',
] as const satisfies readonly SurfaceToken[];

/** Parent `surface` for each horizontal strip in **Nested surfaces** (same six modes). */
export const NESTED_PARENT_SHOWCASE_MODES = NESTED_SURFACE_DEMO_MODES;

/** Row title above each parent strip (sits on that parent’s surface). */
export const nestedSurfaceParentRowLabelStyle: CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Title-S-FontSize)',
  lineHeight: 'var(--Title-S-LineHeight)',
  fontWeight: 'var(--Title-S-FontWeight)',
  color: 'var(--Text-High)',
  textTransform: 'capitalize',
};

/** Label inside each nested surface tile (inherits text tokens from parent surface). */
export const nestedSurfaceChipLabelStyle: CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-S-FontSize)',
  lineHeight: 'var(--Label-S-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Medium)',
  color: 'var(--Text-High)',
  textTransform: 'capitalize',
};

/** Default layout args so autodocs previews read as a 5-column grid showcase. */
export const demoGridShowcaseDefaults = {
  layout: 'grid' as const,
  columns: 5,
  gap: '3' as const,
  padding: '4' as const,
};

/** Muted cells so the Container / Surface root stays the hero; uses neutral tint, not primary. */
export const demoGridCellStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 'var(--Spacing-16)',
  padding: 'var(--Spacing-3)',
  borderRadius: 'var(--Shape-2)',
  background: 'var(--Neutral-Minimal)',
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-S-FontSize)',
  lineHeight: 'var(--Label-S-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Medium)',
  color: 'var(--Text-High)',
};

/** Taller neutral cell for cross-axis alignment demos (`alignSelf`, etc.). */
export const demoTallGridCellStyle: CSSProperties = {
  ...demoGridCellStyle,
  minHeight: 'var(--Spacing-32)',
};

export function FiveDemoCells(): ReactNode {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={demoGridCellStyle}>
          {String(i)}
        </div>
      ))}
    </>
  );
}

/** Picsum Lorem Picsum (`/seed/{name}/w/h`) — stable per seed+dimensions; composition demos only. */
export const STORY_IMAGE_LANDSCAPE = 'https://picsum.photos/seed/picsum/600/400';
/** Exact seed URL requested for portrait-style tiles (`200×300`). */
export const STORY_IMAGE_PORTRAIT = 'https://picsum.photos/seed/picsum/200/300';
export const STORY_IMAGE_WIDE = 'https://picsum.photos/seed/picsum/800/450';

/**
 * Grid / flex item shell so intrinsic media width does not force horizontal overflow.
 * `min-width: 0` via `--Spacing-0`; keep `overflow: hidden` so Image `cover` clips inside the cell.
 */
export const storyGridMediaCellStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-3)',
  minWidth: 'var(--Spacing-0)',
  width: '100%',
  overflow: 'hidden',
};

export const storyCardTitleStyle: CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Title-S-FontSize)',
  lineHeight: 'var(--Title-S-LineHeight)',
  fontWeight: 'var(--Title-S-FontWeight)',
  color: 'var(--Text-High)',
  margin: 0,
};

export const storyCardDescriptionStyle: CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Body-S-FontSize)',
  lineHeight: 'var(--Body-S-LineHeight)',
  fontWeight: 'var(--Body-FontWeight-Low)',
  color: 'var(--Text-Medium)',
  margin: 0,
};

export const storyCardActionsRowStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--Spacing-3)',
  flexWrap: 'wrap',
};
