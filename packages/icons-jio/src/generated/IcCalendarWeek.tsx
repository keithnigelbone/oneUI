import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCalendarWeek = forwardRef<SVGSVGElement, IconComponentProps>(function IcCalendarWeek(
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
            d="M20.12 3.88A3 3 0 0 0 18 3h-1a1 1 0 0 0-2 0H9a1 1 0 0 0-2 0H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-.88-2.12M8 17a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2m3-6H5V6a1 1 0 0 1 1-1h1a1 1 0 0 0 2 0h6a1 1 0 0 0 2 0h1a1 1 0 0 1 1 1z"
          />
    </svg>
  );
});

IcCalendarWeek.displayName = 'IcCalendarWeek';
