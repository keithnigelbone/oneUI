import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWater = forwardRef<SVGSVGElement, IconComponentProps>(function IcWater(
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
            d="m17.7 10.4-4.85-7.92a1 1 0 0 0-1.7 0L6.3 10.4A8.8 8.8 0 0 0 5 15a7 7 0 0 0 14 0 8.8 8.8 0 0 0-1.3-4.6"
          />
    </svg>
  );
});

IcWater.displayName = 'IcWater';
