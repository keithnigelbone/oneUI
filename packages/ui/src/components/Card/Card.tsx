'use client';

/**
 * Card — the design system's content card / panel container.
 *
 * Geometry (radius, stroke, shadow, padding, gap) comes from the brand's
 * "Cards" theme family via `--Card-*` custom properties; see Card.module.css.
 *
 * Two fill modes:
 *   - No `surface` prop (default): the card paints its own fill from
 *     `--Card-backgroundColor` (brand surfaceTone decision, falls back to
 *     the page surface).
 *   - With `surface`: the card renders as a `<Surface mode={...}>` so the
 *     [data-surface] remapping cascade owns the fill and every child
 *     adapts — use this for tinted/bold/elevated cards.
 */

import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import type { ComponentAppearance } from '@oneui/shared';
import { Surface, type SurfaceMode } from '../Surface';
import styles from './Card.module.css';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /**
   * Surface mode for the card fill. When set, the card becomes a `<Surface>`
   * and children adapt via the [data-surface] cascade. When omitted, the
   * card uses the brand's configured card fill (`--Card-backgroundColor`).
   */
  surface?: SurfaceMode;
  /** Appearance role used when `surface` is set (e.g. a secondary-tinted card). */
  appearance?: ComponentAppearance;
  /** Rendered element. Defaults to `div`; use `article`, `section`, `li`… for semantics. */
  as?: ElementType;
  /** Hover lift + focus halo for clickable cards. */
  interactive?: boolean;
  style?: CSSProperties;
  children?: ReactNode;
}

export function Card({
  surface,
  appearance,
  as: Component = 'div',
  interactive = false,
  className,
  style,
  children,
  ...rest
}: CardProps) {
  const classNames = clsx(
    styles.card,
    !surface && styles.fill,
    interactive && styles.interactive,
    className,
  );

  if (surface) {
    return (
      <Surface
        mode={surface}
        appearance={appearance}
        as={Component}
        className={classNames}
        style={style}
        data-oneui-component="Card"
        {...(interactive ? { tabIndex: 0 } : null)}
        {...rest}
      >
        {children}
      </Surface>
    );
  }

  return (
    <Component
      className={classNames}
      style={style}
      data-oneui-component="Card"
      {...(interactive ? { tabIndex: 0 } : null)}
      {...rest}
    >
      {children}
    </Component>
  );
}
