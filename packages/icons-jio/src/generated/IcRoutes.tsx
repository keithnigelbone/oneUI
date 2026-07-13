import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcRoutes = forwardRef<SVGSVGElement, IconComponentProps>(function IcRoutes(
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
            d="M19 15h-4a3 3 0 0 0-3 3 1 1 0 0 1-1 1H7a1 1 0 1 0 0 2h4a3 3 0 0 0 3-3 1 1 0 0 1 1-1h4a1 1 0 0 0 0-2m-2-2a1 1 0 0 0 .71-.29C18 12.37 21 9.34 21 6.8A3.93 3.93 0 0 0 17 3a3.93 3.93 0 0 0-4 3.8c0 2.54 3 5.57 3.29 5.91A1 1 0 0 0 17 13m-1-6a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7 17a1 1 0 0 0 .71-.29C8 16.37 11 13.34 11 10.8A3.93 3.93 0 0 0 7 7a3.93 3.93 0 0 0-4 3.8c0 2.54 3 5.57 3.29 5.91A1 1 0 0 0 7 17m-1-6a1 1 0 1 1 2 0 1 1 0 0 1-2 0"
          />
    </svg>
  );
});

IcRoutes.displayName = 'IcRoutes';
