import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBadminton = forwardRef<SVGSVGElement, IconComponentProps>(function IcBadminton(
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
            d="M5.05 9.15a3 3 0 0 0 .39 5.79 3 3 0 0 0 4.64 3.71 3 3 0 0 0 2.27 2.28q.32.07.65.07a3 3 0 0 0 2.93-2.35L17.62 11l-4.55-4.52zm15-5.33a3 3 0 0 0-4.24.1l-1.2 1.28 4.24 4.24 1.32-1.38a3 3 0 0 0-.11-4.24z"
          />
    </svg>
  );
});

IcBadminton.displayName = 'IcBadminton';
