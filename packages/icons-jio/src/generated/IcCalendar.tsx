import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCalendar = forwardRef<SVGSVGElement, IconComponentProps>(function IcCalendar(
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
            d="M18 3h-1a1 1 0 0 0-2 0H9a1 1 0 0 0-2 0H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-4.5 14a1 1 0 0 1-2 0v-3.59l-.29.3a1.004 1.004 0 1 1-1.42-1.42l2-2a1 1 0 0 1 1.09-.21 1 1 0 0 1 .62.92zM19 7H5V6a1 1 0 0 1 1-1h1a1 1 0 0 0 2 0h6a1 1 0 0 0 2 0h1a1 1 0 0 1 1 1z"
          />
    </svg>
  );
});

IcCalendar.displayName = 'IcCalendar';
