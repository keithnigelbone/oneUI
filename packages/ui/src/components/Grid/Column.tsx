import type { CSSProperties, ElementType, ReactNode } from 'react';
import styles from './Column.module.css';
import type { ResponsiveValue } from './responsive';
import { responsiveToCSSVars } from './responsive';

export interface ColumnProps {
  /**
   * Number of columns to span.
   * Number → same span at every breakpoint.
   * Object → per-breakpoint span with mobile-first inheritance.
   *
   * @example
   *   <Column span={6} />
   *   <Column span={{ S: 4, M: 4, L: 6, XL: 8 }} />
   */
  span?: ResponsiveValue<number>;
  /**
   * Starting column index (1-based). Leaves empty columns before this one.
   * Mobile-first: omitted breakpoints inherit from smaller.
   */
  start?: ResponsiveValue<number>;
  /** Deprecated generated-composition hint. Consumed so it does not leak to the DOM. */
  fullWidth?: boolean;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  [key: `data-${string}`]: string | undefined;
}

export function Column({
  span,
  start,
  fullWidth: _fullWidth,
  as: Component = 'div',
  className,
  style,
  children,
  ...rest
}: ColumnProps) {
  const classNames = [styles.column, className].filter(Boolean).join(' ');
  const mergedStyle: CSSProperties = {
    ...style,
    ...responsiveToCSSVars(span, '--col-span'),
    ...responsiveToCSSVars(start, '--col-start'),
  };

  return (
    <Component className={classNames} style={mergedStyle} {...rest}>
      {children}
    </Component>
  );
}
