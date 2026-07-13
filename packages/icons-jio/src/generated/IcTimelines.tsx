import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTimelines = forwardRef<SVGSVGElement, IconComponentProps>(function IcTimelines(
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
            d="M4.5 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m0 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M9 7h10a1 1 0 0 0 1.71.71l1-1a1 1 0 0 0 0-1.42l-1-1A1 1 0 0 0 19 5H9a1 1 0 0 0 0 2M4.5 4.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m16.21 11.79a1.002 1.002 0 0 0-1.636.326A1 1 0 0 0 19 17H9a1 1 0 0 0 0 2h10a1 1 0 0 0 1.71.71l1-1a1 1 0 0 0 0-1.42zm0-6a1.002 1.002 0 0 0-1.636.326A1 1 0 0 0 19 11H9a1 1 0 0 0 0 2h10a1 1 0 0 0 1.71.71l1-1a1 1 0 0 0 0-1.42z"
          />
    </svg>
  );
});

IcTimelines.displayName = 'IcTimelines';
