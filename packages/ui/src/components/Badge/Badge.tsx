/**
 * Badge.tsx
 * React (web) implementation
 *
 * Non-interactive display component used to highlight status, provide notifications,
 * or categorize content. Supports start/end slots for icons, avatars, and sub-badges.
 * Uses token-only styling, multi-accent appearance roles, and surface-context awareness.
 *
 * @example
 * ```tsx
 * import { Badge } from '@oneui/ui';
 *
 * <Badge>Status</Badge>
 * <Badge attention="medium" start={<Icon name="check" />}>Verified</Badge>
 * ```
 */

import React, { type CSSProperties, type ReactNode } from 'react';
import clsx from 'clsx';
import { roleLabel } from '@oneui/shared/engine';
import styles from './Badge.module.css';
import { BadgeProps, useBadgeState } from './Badge.shared';
import { makeAppearanceClassMap } from '../_shared/appearanceClasses';
import { SlotParentAppearanceProvider } from '../../contexts/SlotParentAppearanceContext';

/** Slot children whose own appearance must NOT remap with the Badge's surface
 *  context. CounterBadge and IndicatorBadge carry their own role colours
 *  (e.g. negative=red) and must stay distinct on bold badges. */
const SURFACE_IMMUNE_DISPLAY_NAMES = new Set(['CounterBadge', 'IndicatorBadge']);

/** Wrap any surface-immune child in `data-surface="default"` so the Badge
 *  slot's cascade stops at that boundary. Other children (Icon, Avatar) are
 *  returned as-is and continue to adapt to the slot's surface context. */
function shieldSlotChildren(node: ReactNode): ReactNode {
  return React.Children.map(node, (child) => {
    if (!React.isValidElement(child)) return child;
    const displayName = (child.type as { displayName?: string })?.displayName;
    if (displayName && SURFACE_IMMUNE_DISPLAY_NAMES.has(displayName)) {
      return <span className={styles.surfaceShield}>{child}</span>;
    }
    return child;
  });
}

const appearanceClassMap = makeAppearanceClassMap(styles);

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    children,
    size = 'm',
    attention,
    appearance,
    start,
    end,
    'aria-label': ariaLabel,
    'data-testid': dataTestId,
    className: classNameProp,
    style: styleProp,
  },
  ref,
) {
  const { resolvedVariant, resolvedAppearance, resolvedGhostBorderAppearance, dataAttrs } = useBadgeState({
    size,
    attention,
    appearance,
  });

  // Dev-mode warning for missing aria-label
  if (process.env.NODE_ENV !== 'production' && !ariaLabel && !children) {
    console.warn('Badge: an `aria-label` prop is recommended when Badge has no visible text content.');
  }

  const className = clsx(
    styles.badge,
    styles[resolvedVariant],
    appearanceClassMap[resolvedAppearance],
    classNameProp,
  );

  // Slot color adaptation is handled via manual Primary-* token remaps in
  // Badge.module.css. Cross-role children (negative CounterBadge, positive
  // IndicatorBadge) keep their own role colors — they must remain fully
  // visible on bold badges.

  // Slots inherit the outer cascade directly — no data-surface on slot spans.
  // The Badge itself reads context-remapped --{Role}-Bold / -Bold-High, so
  // when nested inside <Surface mode="bold"> every Badge descendant (text,
  // icon, avatar) resolves tokens against the SAME outer context and the
  // icon-text pair stays consistent. Prior versions set data-surface="bold"
  // on the slot spans, which forced slot icons to the page-level on-bold
  // colour while the Badge label read the nested-context on-bold colour —
  // producing white icons next to dark text on the stepped tinted fill.
  // CounterBadge and IndicatorBadge are still shielded via the CSS class
  // in shieldSlotChildren() so they keep their own appearance colours.

  const ghostBorderStyle: CSSProperties | undefined =
    resolvedVariant === 'ghost'
      ? {
          ['--Badge-ghost-stroke' as string]: `var(--${roleLabel(resolvedGhostBorderAppearance)}-Stroke-Low)`,
        }
      : undefined;

  const mergedStyle =
    ghostBorderStyle || styleProp
      ? { ...ghostBorderStyle, ...styleProp }
      : undefined;

  return (
    <span
      ref={ref}
      role="status"
      className={className}
      style={mergedStyle}
      aria-label={ariaLabel}
      data-testid={dataTestId}
      {...dataAttrs}
    >
      {start && (
        <span className={styles.start}>
          <SlotParentAppearanceProvider value={resolvedAppearance}>
            {shieldSlotChildren(start)}
          </SlotParentAppearanceProvider>
        </span>
      )}
      {children && <span className={styles.label}>{children}</span>}
      {end && (
        <span className={styles.end}>
          <SlotParentAppearanceProvider value={resolvedAppearance}>
            {shieldSlotChildren(end)}
          </SlotParentAppearanceProvider>
        </span>
      )}
    </span>
  );
});

Badge.displayName = 'Badge';
