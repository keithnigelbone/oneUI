import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSwap = forwardRef<SVGSVGElement, IconComponentProps>(function IcSwap(
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
            d="M9 12a1 1 0 0 0 1.006-1 1 1 0 0 0-.296-.71L7.41 8H18a1 1 0 1 0 0-2H7.41l2.3-2.29a1.004 1.004 0 1 0-1.42-1.42l-4 4a1 1 0 0 0 0 1.42l4 4A1 1 0 0 0 9 12m10.71 4.29-4-4a1 1 0 0 0-1.42 0 1 1 0 0 0 0 1.42l2.3 2.29H6a1 1 0 1 0 0 2h10.59l-2.3 2.29a1.004 1.004 0 1 0 1.42 1.42l4-4a1 1 0 0 0 0-1.42"
          />
    </svg>
  );
});

IcSwap.displayName = 'IcSwap';
