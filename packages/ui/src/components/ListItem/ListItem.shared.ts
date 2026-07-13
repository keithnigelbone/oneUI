/**
 * ListItem.shared.ts
 * Public types + helpers for the ListItem component.
 *
 * Figma component properties (file F7KEYdO8R8Nbe2N4gI8dIU):
 *  container:       fullWidth | inset
 *  selected:        false | true[Medium] | true[High]
 *  slotAlignment:   none (single-line) | centre | top
 *  start:           none | S[5] | M[6] | L[8] | XL[10]   (20 / 24 / 32 / 40px)
 *  end:             none | S[5] | M[6]                    (20 / 24px)
 */

import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import type { ComponentAppearance } from '@oneui/shared';

/** Row container style. fullWidth = edge-to-edge; inset = rounded card with horizontal margin. */
export type ListItemContainer = 'fullWidth' | 'inset';

/** Three-level selected state per Figma variant. `'medium'` tints the row; `'high'` uses a bold accent fill. */
export type ListItemSelected = false | 'medium' | 'high';

/** Vertical alignment of the start/end slots. When no supportText is present the row auto-centers. */
export type ListItemSlotAlign = 'centre' | 'top';

/** Leading slot size. S=20px, M=24px, L=32px, XL=40px. */
export type ListItemSlotSize = 'S' | 'M' | 'L' | 'XL';

/** Trailing slot size. S=20px, M=24px. */
export type ListItemEndSize = 'S' | 'M';

/** Bottom hairline drawn by the row.
 *  'full'  spans edge-to-edge.
 *  'inset' starts at the content column (padding + start slot + gap), matching Figma's default inset style.
 *  The last sibling auto-suppresses via `:last-child` to avoid a dangling hairline.
 */
export type ListItemDivider = 'none' | 'full' | 'inset';

/** Multi-accent appearance — uses the full canonical role union. */
export type ListItemAppearance = ComponentAppearance;

export interface ListItemProps {
  /** Primary line. Rendered as Label-M-High. */
  title: ReactNode;
  /** Optional secondary line below title. Rendered as Body-S-Low. */
  supportText?: ReactNode;
  /** Small inline decorative slot rendered BEFORE the support text (matches Figma `.ListItem.Slot.Default.Content`). Follows the support text colour. */
  supportStart?: ReactNode;
  /** Leading content (icon / avatar / badge). */
  start?: ReactNode;
  /** Leading slot size. Default: 'M'. */
  startSize?: ListItemSlotSize;
  /** Trailing content (chevron / icon). */
  end?: ReactNode;
  /** Trailing slot size. Default: 'M'. */
  endSize?: ListItemEndSize;
  /** Slot vertical alignment. Default: 'centre'. When supportText is absent, the row single-lines regardless. */
  slotAlignment?: ListItemSlotAlign;
  /** Container variant. Default: 'fullWidth'. */
  container?: ListItemContainer;
  /** Selected emphasis. Default: false. `'high'` triggers `[data-surface="bold"]` self-remap. */
  selected?: ListItemSelected;
  /** Bottom hairline style. Default: 'none'. Auto-suppresses when the row is the last child. */
  divider?: ListItemDivider;
  /** Multi-accent appearance role. Default: 'primary'. */
  appearance?: ListItemAppearance;
  /** Disable interaction + apply reduced-opacity token. */
  disabled?: boolean;
  /** When set, renders as `<a>`. */
  href?: string;
  /** When set (and no href), renders as `<button type="button">`. */
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  /** Accessible name — required when `title` is non-textual. */
  'aria-label'?: string;
  /** Additional CSS class name on the root. */
  className?: string;
  /** Inline styles on the root. */
  style?: CSSProperties;
}

/** Resolve 'auto' → 'primary', preserving any other canonical role. */
export function resolveListItemAppearance(
  appearance: ListItemAppearance | undefined,
  parentAppearance: Exclude<ListItemAppearance, 'auto'> | null = null,
): Exclude<ListItemAppearance, 'auto'> {
  if (appearance && appearance !== 'auto') return appearance;
  return parentAppearance ?? 'primary';
}
