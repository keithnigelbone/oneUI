/**
 * Scrim.tsx
 * React (web) implementation
 *
 * Non-interactive overlay for image legibility (directional gradient) or
 * modal backdrops (uniform overlay). Parent must be `position: relative`.
 */

'use client';

import React from 'react';
import clsx from 'clsx';
import styles from './Scrim.module.css';
import { ScrimProps, useScrimState } from './Scrim.shared';

export const Scrim = React.forwardRef<HTMLDivElement, ScrimProps>(function Scrim(
  { className: classNameProp, style, 'data-testid': dataTestId, ...rest },
  ref,
) {
  const { dataAttrs } = useScrimState(rest);

  return (
    <div
      ref={ref}
      className={clsx(styles.scrim, classNameProp)}
      style={style}
      aria-hidden="true"
      data-testid={dataTestId}
      {...dataAttrs}
    />
  );
});

Scrim.displayName = 'Scrim';
