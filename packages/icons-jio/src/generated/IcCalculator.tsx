import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCalculator = forwardRef<SVGSVGElement, IconComponentProps>(function IcCalculator(
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
            d="M17 2H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3M8 19a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-3.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2M8 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-3.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-3.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-3.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-3.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2m1-5a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1z"
          />
    </svg>
  );
});

IcCalculator.displayName = 'IcCalculator';
