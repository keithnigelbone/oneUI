import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBusFront = forwardRef<SVGSVGElement, IconComponentProps>(function IcBusFront(
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
            d="M16 2H8a4 4 0 0 0-4 4v13a1 1 0 0 0 1 1v1a1 1 0 1 0 2 0v-1h10v1a1 1 0 0 0 2 0v-1a1 1 0 0 0 1-1V6a4 4 0 0 0-4-4M7 17a1 1 0 1 1 0-2 1 1 0 0 1 0 2m10 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2m1-5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1z"
          />
    </svg>
  );
});

IcBusFront.displayName = 'IcBusFront';
