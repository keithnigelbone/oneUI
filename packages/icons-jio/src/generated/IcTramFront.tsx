import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTramFront = forwardRef<SVGSVGElement, IconComponentProps>(function IcTramFront(
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
            d="M16 4.34V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v.34A6 6 0 0 0 4 10v9a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-9a6 6 0 0 0-4-5.66M7 19a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4-5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1zm6 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2m1-5a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1z"
          />
    </svg>
  );
});

IcTramFront.displayName = 'IcTramFront';
