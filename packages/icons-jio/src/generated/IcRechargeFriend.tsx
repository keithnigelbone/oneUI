import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcRechargeFriend = forwardRef<SVGSVGElement, IconComponentProps>(function IcRechargeFriend(
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
            d="M17 7h1v1a1 1 0 0 0 2 0V7h1a1 1 0 1 0 0-2h-1V4a1 1 0 0 0-2 0v1h-1a1 1 0 1 0 0 2m-.24 3.47a4.9 4.9 0 0 1-2-1.84A5 5 0 0 1 14 6q.005-.505.1-1H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a5 5 0 0 1-5.24.47m-9.82-2a1.5 1.5 0 0 1 2.45.49c.111.272.139.572.08.86A1.49 1.49 0 0 1 8.29 11a1.5 1.5 0 0 1-.86-.08 1.5 1.5 0 0 1-.49-2.45m3.77 7.27A1 1 0 0 1 10 16H6a1 1 0 0 1-1-1 3 3 0 0 1 6 0 1 1 0 0 1-.29.71z"
          />
    </svg>
  );
});

IcRechargeFriend.displayName = 'IcRechargeFriend';
