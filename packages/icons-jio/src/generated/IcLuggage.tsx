import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcLuggage = forwardRef<SVGSVGElement, IconComponentProps>(function IcLuggage(
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
            d="M2 10v8a3 3 0 0 0 3 3V7a3 3 0 0 0-3 3m17-3v14a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3m-5-4h-4a3 3 0 0 0-3 3v15h10V6a3 3 0 0 0-3-3m1 4H9V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1z"
          />
    </svg>
  );
});

IcLuggage.displayName = 'IcLuggage';
