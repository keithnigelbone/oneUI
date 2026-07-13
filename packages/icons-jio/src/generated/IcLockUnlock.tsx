import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcLockUnlock = forwardRef<SVGSVGElement, IconComponentProps>(function IcLockUnlock(
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
            d="M17 7h-7v-.93a2 2 0 0 1 1.5-2 2 2 0 0 1 2 .63 1 1 0 0 0 .72.31A1 1 0 0 0 15 3.32 4 4 0 0 0 11.41 2 4.13 4.13 0 0 0 8 6.17V7H7a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3m-5 9a2 2 0 1 1 0-3.999 2 2 0 0 1 0 4"
          />
    </svg>
  );
});

IcLockUnlock.displayName = 'IcLockUnlock';
