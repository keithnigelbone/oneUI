import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcGraphIncreasing = forwardRef<SVGSVGElement, IconComponentProps>(function IcGraphIncreasing(
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
            d="M13 14h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1m6-2h-2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1M7 16H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1M19 3h-3a1 1 0 1 0 0 2h.59l-3.86 3.86-2.41-.81a1 1 0 0 0-.94.17l-5 4A1 1 0 0 0 5 14a1 1 0 0 0 .62-.22l4.58-3.66 2.48.83a1 1 0 0 0 1-.24L18 6.41V7a1 1 0 0 0 2 0V4a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

IcGraphIncreasing.displayName = 'IcGraphIncreasing';
