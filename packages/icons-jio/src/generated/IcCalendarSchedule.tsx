import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCalendarSchedule = forwardRef<SVGSVGElement, IconComponentProps>(function IcCalendarSchedule(
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
            d="M13.5 14h-1v-2a1 1 0 0 0-2 0v3a1 1 0 0 0 1 1h2a1 1 0 0 0 0-2M18 3h-1a1 1 0 0 0-2 0H9a1 1 0 0 0-2 0H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-6 16a5 5 0 1 1 0-9.999A5 5 0 0 1 12 19m7-12H5V6a1 1 0 0 1 1-1h1a1 1 0 0 0 2 0h6a1 1 0 0 0 2 0h1a1 1 0 0 1 1 1z"
          />
    </svg>
  );
});

IcCalendarSchedule.displayName = 'IcCalendarSchedule';
