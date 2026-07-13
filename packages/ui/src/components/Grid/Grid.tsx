import type { CSSProperties, ElementType, ReactNode } from 'react';
import styles from './Grid.module.css';
import type { Breakpoint, ResponsiveValue } from './responsive';
import { responsiveToCSSVars } from './responsive';

export interface GridProps {
  /**
   * Column count override.
   * Defaults to `--Grid-Columns` (per-platform: 4/8/8/12/12).
   */
  columns?: ResponsiveValue<number>;
  /**
   * Gap override. Defaults to `--Grid-Gutter`. Accepts any CSS length.
   */
  gap?: string;
  /** Deprecated generated-composition hint. Consumed so it does not leak to the DOM. */
  fullWidth?: boolean;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  [key: `data-${string}`]: string | undefined;
}

export function Grid({
  columns,
  gap,
  fullWidth: _fullWidth,
  as: Component = 'div',
  className,
  style,
  children,
  ...rest
}: GridProps) {
  const classNames = [styles.grid, className].filter(Boolean).join(' ');

  const colVars = responsiveToCSSVars(columns, '--grid-columns');
  const mergedStyle: CSSProperties = {
    ...style,
    ...colVars,
    ...(gap ? { ['--_grid-gap' as string]: gap } : null),
  };

  return (
    <Component className={classNames} style={mergedStyle} {...rest}>
      {children}
    </Component>
  );
}

export type { Breakpoint, ResponsiveValue } from './responsive';
