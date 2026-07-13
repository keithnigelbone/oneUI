import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcStopwatch = forwardRef<SVGSVGElement, IconComponentProps>(function IcStopwatch(
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
            d="M10 4h4a1 1 0 1 0 0-2h-4a1 1 0 0 0 0 2m8.71 2.71a1 1 0 1 0 1.41-1.42l-1.41-1.41a1 1 0 1 0-1.42 1.41zM12 5a8.5 8.5 0 1 0 8.5 8.5A8.51 8.51 0 0 0 12 5m1 8a1 1 0 0 1-2 0V9a1 1 0 0 1 2 0z"
          />
    </svg>
  );
});

IcStopwatch.displayName = 'IcStopwatch';
