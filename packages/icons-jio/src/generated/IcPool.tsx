import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPool = forwardRef<SVGSVGElement, IconComponentProps>(function IcPool(
  { size = 24, width, height, color = 'currentColor', className, style, ...props },
  ref,
) {
  const dim = width ?? height ?? size;
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={width ?? dim}
      height={height ?? dim}
      color={color}
      className={className}
      style={style}
      {...props}
    >
      <path
            fill="currentColor"
            d="M20 13a6.2 6.2 0 0 0-4.71 2.29l-.29.29V6a1 1 0 0 1 2 0 1 1 0 0 0 2 0 3 3 0 0 0-6 0v2H7V6a1 1 0 0 1 2 0 1 1 0 0 0 2 0 3 3 0 0 0-6 0v7.09A6 6 0 0 0 4 13a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1m-7 3.88a4.3 4.3 0 0 1-1 .12c-1.59 0-2.34-.75-3.29-1.71A11.3 11.3 0 0 0 7.23 14H13zM13 12H7v-2h6z"
          />
    </svg>
  );
});

IcPool.displayName = 'IcPool';
